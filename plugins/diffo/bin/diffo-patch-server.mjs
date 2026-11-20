#!/usr/bin/env node
// diffo 0.28.0 の createApp に添付 API を足す。サーバーは起動しない。
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const MARKER = '// diffo-plugin: attachments begin'
export const END_MARKER = '// diffo-plugin: attachments end'
const legacyMarker = '// diffo-plugin: attachments v1'
const anchor = 'app.get("/api/file", async (c) => {'
const post = 'app.post("/api/plugin/attachments",'
const get = 'app.get("/api/plugin/attachments/:name",'
const count = (source, needle) => source.split(needle).length - 1

// 既存の loopback middleware より後、/api/file より前に登録する。
export const routes = String.raw`${MARKER}
  const pluginAttachmentDir = async () => {
    const { tmpdir } = await import("node:os");
    return join(tmpdir(), "diffo-attachments", createHash("sha256").update(ctx.root).digest("hex").slice(0, 12));
  };
  app.post("/api/plugin/attachments", async (c) => {
    const limit = 20 * 1024 * 1024;
    if (Number(c.req.header("content-length")) > limit) return c.json({ error: "attachment exceeds 20 MiB" }, 413);
    let name;
    try {
      name = decodeURIComponent(c.req.header("x-diffo-filename") ?? "attachment");
    } catch {
      return c.json({ error: "invalid filename encoding" }, 400);
    }
    const bytes = new Uint8Array(await c.req.arrayBuffer());
    if (bytes.byteLength > limit) return c.json({ error: "attachment exceeds 20 MiB" }, 413);
    const type = c.req.header("content-type") ?? "application/octet-stream";
    const safeName = basename(name).replace(/[^A-Za-z0-9._-]/g, "_").slice(-180) || "attachment";
    const savedName = Date.now() + "-" + randomUUID().slice(0, 8) + "-" + safeName;
    const dir = await pluginAttachmentDir();
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = join(dir, savedName);
    writeFileSync(file, bytes, { flag: "wx", mode: 0o600 });
    return c.json({ path: file, url: "/api/plugin/attachments/" + savedName, name, type, size: bytes.byteLength });
  });
  app.get("/api/plugin/attachments/:name", async (c) => {
    const name = c.req.param("name");
    if (!/^[A-Za-z0-9._-]+$/.test(name) || name === "." || name === "..") return c.json({ error: "invalid attachment name" }, 400);
    let bytes;
    try {
      bytes = readFileSync(join(await pluginAttachmentDir(), name));
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "EISDIR") return c.json({ error: "attachment not found" }, 404);
      throw error;
    }
    const mime = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp" }[extname(name).toLowerCase()] ?? "application/octet-stream";
    return c.body(new Uint8Array(bytes), 200, {
      "Content-Type": mime,
      "Content-Disposition": (mime === "application/octet-stream" ? "attachment" : "inline") + '; filename="' + name + '"',
      "Content-Security-Policy": "sandbox",
      "X-Content-Type-Options": "nosniff"
    });
  });
  ${END_MARKER}
  `

export function patchServer(source) {
  const targets = count(source, anchor)
  if (targets !== 1) return { status: 'error', source, reason: `/api/file が ${targets} か所ある（1 か所を想定）` }
  const reject = () => ({ status: 'error', source, reason: '添付 API の印または経路が想定と一致しない' })
  const begins = count(source, MARKER)
  const ends = count(source, END_MARKER)
  const legacy = count(source, legacyMarker)
  const hasRoute = (text) => text.includes('/api/plugin/attachments')
  if (begins || ends) {
    if (begins !== 1 || ends !== 1 || legacy !== 0) return reject()
    const start = source.indexOf(MARKER)
    const end = source.indexOf(END_MARKER) + END_MARKER.length
    if (end <= start || end > source.indexOf(anchor)) return reject()
    if (hasRoute(source.slice(0, start) + source.slice(end))) return reject()
    const block = routes.trimEnd()
    if (source.slice(start, end) === block) return { status: 'already', source }
    return { status: 'patched', source: source.slice(0, start) + block + source.slice(end), replaced: true }
  }
  if (legacy) {
    if (legacy !== 1) return reject()
    const start = source.indexOf(legacyMarker)
    const end = source.indexOf(anchor)
    const block = source.slice(start, end)
    if (start >= end || count(block, post) !== 1 || count(block, get) !== 1) return reject()
    if (hasRoute(source.slice(0, start) + source.slice(end))) return reject()
    return { status: 'patched', source: source.slice(0, start) + routes + source.slice(end), replaced: true }
  }
  if (hasRoute(source)) return reject()
  return { status: 'patched', source: source.replace(anchor, () => routes + anchor) }
}

export function patchServerFile(file) {
  const result = patchServer(readFileSync(file, 'utf8'))
  if (result.status === 'patched') writeFileSync(file, result.source)
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2]
  if (!file) {
    console.error('usage: diffo-patch-server.mjs <dist/cli.mjs>')
    process.exit(2)
  }
  try {
    const result = patchServerFile(file)
    if (result.status === 'error') throw new Error(result.reason)
    console.log(result.status === 'patched'
      ? `  server: ${result.replaced ? '新しい版に置き換えた' : '当てた'}。起動中の diffo は古いまま。レビューしている repo で \`npx -y --prefer-online @diffohq/diffo@latest stop\` の後に起動し直す`
      : '  server: 変更なし')
  } catch (error) {
    console.error(`  server: 書き換えずに停止した。${error.message}`)
    process.exit(1)
  }
}
