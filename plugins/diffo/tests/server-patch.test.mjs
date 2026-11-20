import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import * as fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { MARKER, END_MARKER, routes, patchServer, patchServerFile } from '../bin/diffo-patch-server.mjs'

const prefix = 'function createApp(ctx) { const app = new Hono(); app.use("*", loopback);\n'
const source = prefix + 'app.get("/api/file", async (c) => { return c.body("file"); }); return app; }'

test('patchServer inserts routes once after middleware and before /api/file', () => {
  const result = patchServer(source)
  assert.equal(result.status, 'patched')
  assert.ok(result.source.startsWith(prefix))
  assert.ok(result.source.indexOf('/api/plugin/attachments') < result.source.indexOf('/api/file'))
  assert.equal(result.source.split(MARKER).length - 1, 1)
  assert.equal(patchServer(result.source).status, 'already')
  assert.equal(patchServer(result.source).source, result.source)
})

test('patchServer rejects missing, duplicate and partially patched targets without changes', () => {
  const patched = patchServer(source).source
  for (const text of ['', source + source, MARKER + source,
    patched.replace(MARKER, ''), patched.replace(END_MARKER, ''),
    patched.replace(END_MARKER, END_MARKER + END_MARKER),
    patched.replace(MARKER, MARKER + MARKER),
    patched.replace(MARKER, '<swap>').replace(END_MARKER, MARKER).replace('<swap>', END_MARKER),
    routes + routes + source, patched.replace(MARKER, '').replace(END_MARKER, ''),
    patched + 'app.post("/api/plugin/attachments", handler);',
    '// diffo-plugin: attachments v1' + source]) {
    const result = patchServer(text)
    assert.equal(result.status, 'error')
    assert.equal(result.source, text)
  }
})

test('patchServer replaces an older marked body and becomes idempotent', () => {
  const current = patchServer(source).source
  const older = current.replace('const limit = 20 * 1024 * 1024;', 'const limit = 1;')
  const result = patchServer(older)
  assert.equal(result.status, 'patched')
  assert.equal(result.replaced, true)
  assert.equal(result.source, current)
  assert.equal(patchServer(result.source).status, 'already')
})

test('patchServer migrates the legacy v1 block and becomes idempotent', () => {
  const current = patchServer(source).source
  const legacy = current.replace(MARKER, '// diffo-plugin: attachments v1')
    .replace(`  ${END_MARKER}\n`, '').replace('const limit = 20 * 1024 * 1024;', 'const limit = 1;')
  const result = patchServer(legacy)
  assert.equal(result.status, 'patched')
  assert.equal(result.replaced, true)
  assert.equal(result.source, current)
  assert.equal(patchServer(result.source).status, 'already')
})

test('file patch preserves a rejected file and writes an accepted file only once', (t) => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'diffo-server-patch-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const file = path.join(dir, 'cli.mjs')
  fs.writeFileSync(file, 'unsupported')
  assert.equal(patchServerFile(file).status, 'error')
  assert.equal(fs.readFileSync(file, 'utf8'), 'unsupported')
  fs.writeFileSync(file, source)
  assert.equal(patchServerFile(file).status, 'patched')
  const before = fs.statSync(file).mtimeMs
  assert.equal(patchServerFile(file).status, 'already')
  assert.equal(fs.statSync(file).mtimeMs, before)
})

function setup(t, root = path.join(tmpdir(), randomUUID())) {
  class App {
    routes = new Map()
    middleware = []
    use(_path, fn) { this.middleware.push(fn) }
    post(url, fn) { this.routes.set(`POST ${url}`, fn) }
    get(url, fn) { this.routes.set(`GET ${url}`, fn) }
  }
  const app = new Function('Hono', 'ctx', 'loopback', 'join', 'basename', 'extname', 'createHash', 'randomUUID', 'mkdirSync', 'writeFileSync', 'readFileSync',
    `${patchServer(source).source}; return createApp(ctx);`)(App, { root }, () => {}, path.join, path.basename, path.extname, createHash, randomUUID, fs.mkdirSync, fs.writeFileSync, fs.readFileSync)
  const dir = path.join(tmpdir(), 'diffo-attachments', createHash('sha256').update(root).digest('hex').slice(0, 12))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const call = (route, { bytes = new Uint8Array(), headers = {}, name } = {}) => app.routes.get(route)({
    req: { header: (key) => headers[key], arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), param: () => name },
    json: (data, status = 200) => ({ data, status }),
    body: (data, status, headers) => ({ data, status, headers }),
  })
  return { app, dir, call }
}
const post = 'POST /api/plugin/attachments'
const get = 'GET /api/plugin/attachments/:name'

test('attachment routes save raw bytes under the repo hash and read raster images', async (t) => {
  const { app, dir, call } = setup(t)
  assert.equal(app.middleware.length, 1)
  assert.equal(app.routes.size, 3)
  const bytes = new Uint8Array([0, 255, 128, 10])
  const name = '../図 [1].PNG'
  const saved = await call(post, { bytes, headers: { 'x-diffo-filename': encodeURIComponent(name), 'content-type': 'image/png' } })
  assert.equal(saved.status, 200)
  assert.equal(saved.data.name, name)
  assert.equal(saved.data.type, 'image/png')
  assert.equal(saved.data.size, 4)
  assert.equal(path.dirname(saved.data.path), dir)
  assert.match(path.basename(saved.data.path), /^\d+-[a-f\d]{8}-___1_\.PNG$/)
  assert.equal(saved.data.url, `/api/plugin/attachments/${path.basename(saved.data.path)}`)
  assert.deepEqual(fs.readFileSync(saved.data.path), Buffer.from(bytes))
  assert.equal(fs.statSync(dir).mode & 0o777, 0o700)
  assert.equal(fs.statSync(saved.data.path).mode & 0o777, 0o600)
  const read = await call(get, { name: path.basename(saved.data.path) })
  assert.equal(read.status, 200)
  assert.deepEqual(read.data, bytes)
  assert.equal(read.headers['Content-Type'], 'image/png')
  assert.equal(read.headers['X-Content-Type-Options'], 'nosniff')
})

test('attachment routes enforce byte limit independently of Content-Length and accept exactly 20 MiB', async (t) => {
  const { dir, call } = setup(t)
  const limit = 20 * 1024 * 1024
  assert.equal((await call(post, { headers: { 'content-length': String(limit + 1) } })).status, 413)
  for (const headers of [{}, { 'content-length': '1' }]) {
    assert.equal((await call(post, { bytes: new Uint8Array(limit + 1), headers })).status, 413)
  }
  assert.equal(fs.existsSync(dir), false)
  const saved = await call(post, { bytes: new Uint8Array(limit) })
  assert.equal(saved.status, 200)
  assert.equal(saved.data.size, limit)
})

test('attachment routes reject traversal and malformed encoding, return 404 and isolate repos', async (t) => {
  const { call } = setup(t)
  for (const name of ['../a', '.', '..', 'a/b', 'a\\b', 'a%2fb', '日本語', '']) {
    assert.equal((await call(get, { name })).status, 400, name)
  }
  assert.equal((await call(get, { name: 'missing.png' })).status, 404)
  assert.equal((await call(post, { headers: { 'x-diffo-filename': '%' } })).status, 400)
  const saved = await call(post)
  assert.equal((await setup(t).call(get, { name: path.basename(saved.data.path) })).status, 404)
})

test('only raster extensions are inline; SVG and active content are downloads regardless of upload type', async (t) => {
  const { call } = setup(t)
  for (const [ext, mime] of Object.entries({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'application/octet-stream', html: 'application/octet-stream', txt: 'application/octet-stream' })) {
    const saved = await call(post, { headers: { 'x-diffo-filename': `file.${ext}`, 'content-type': 'text/html' } })
    const read = await call(get, { name: path.basename(saved.data.path) })
    assert.equal(read.headers['Content-Type'], mime)
    assert.match(read.headers['Content-Disposition'], mime.startsWith('image/') ? /^inline/ : /^attachment/)
    assert.equal(read.headers['Content-Security-Policy'], 'sandbox')
  }
})
