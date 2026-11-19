#!/usr/bin/env node
// diffo のクライアントの bundle に、スレッドの配置処理への接続口を足す。何度実行しても同じ結果になる。
//
// 通常の差分の表示でスレッドを hunk と行へ振り分ける関数（byHunk・byFile・byLayer・byCommit・changeset を返す）の
// 呼び出しを、diffo-ui.js が定義する globalThis.__diffoPlaceThreads 経由に置き換える。
// commit 別表示の経路（同じ関数を別の関数の中から呼ぶ）は変えない。
// diffo-ui.js が読み込まれていなければ、元の関数をそのまま呼ぶ。
//
// minify 後の関数名は版ごとに変わるので、名前ではなく返り値の形と呼び出しの形で探す。
// どちらかが 1 か所に決まらなければ、何も書き換えずに exit 1 で止まる。
//
//   node diffo-patch-placement.mjs <dist/client/assets のディレクトリ>

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const HOOK = 'globalThis.__diffoPlaceThreads'

const partitionPattern =
  /function ([\w$]+)\([\w$]+,[\w$]+\)\{(?:(?!function )[\s\S])*?return\{byHunk:[\w$]+,byFile:[\w$]+,byLayer:[\w$]+,byCommit:[\w$]+,changeset:[\w$]+\}\}/g

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const count = (text, needle) => text.split(needle).length - 1

// 通常の差分の振り分けは、commit 別表示の関数との三項演算子の片側にある:
//   xt?ed(yt,e?.files??rm,Ut):Qu(e?.files??[],Ut)
// commit 別表示の関数（ed）は、本体の末尾で振り分け関数を呼ぶ。この 2 つが揃う箇所だけを当て先にする
const callSitePattern = (name, hooked) => {
  const n = escapeRegExp(name)
  const tail = hooked
    ? `:\\(${escapeRegExp(HOOK)}\\?\\?${n}\\)\\(\\3\\?\\.files\\?\\?\\[\\],\\5,${n}\\)`
    : `:${n}\\(\\3\\?\\.files\\?\\?\\[\\],\\5\\)`
  return new RegExp(
    `\\?([\\w$]+)\\(([\\w$]+),([\\w$]+)\\?\\.files\\?\\?([\\w$]+),([\\w$]+)\\)${tail}`,
    'g',
  )
}

const commitViewCallsPartition = (source, commitView, name) =>
  new RegExp(
    `function ${escapeRegExp(commitView)}\\([\\w$]+,[\\w$]+,[\\w$]+\\)\\{(?:(?!function )[\\s\\S])*?return ${escapeRegExp(name)}\\([\\w$]+,[\\w$]+\\)\\}`,
  ).test(source)

// status: patched（書き換えた）、already（当て済み）、absent（振り分け関数が無い）、error（1 か所に決まらない）
export function patchPlacement(source) {
  const partitions = [...source.matchAll(partitionPattern)]
  if (partitions.length === 0) {
    return count(source, `(${HOOK}??`) === 0
      ? { status: 'absent', source }
      : { status: 'error', source, reason: '接続口はあるが振り分け関数が見つからない' }
  }
  if (partitions.length > 1) {
    return { status: 'error', source, reason: `振り分け関数が ${partitions.length} 個ある` }
  }
  const name = partitions[0][1]
  const valid = (match) => commitViewCallsPartition(source, match[1], name)
  const plain = [...source.matchAll(callSitePattern(name, false))].filter(valid)
  const hooked = [...source.matchAll(callSitePattern(name, true))].filter(valid)
  const hookTotal = count(source, `(${HOOK}??`)

  if (hooked.length === 1 && plain.length === 0 && hookTotal === 1) {
    return { status: 'already', source, name }
  }
  if (hooked.length === 0 && plain.length === 1 && hookTotal === 0) {
    const [call, , , changeset, , threads] = plain[0]
    const head = call.slice(0, call.lastIndexOf(`:${name}(`))
    const replacement = `${head}:(${HOOK}??${name})(${changeset}?.files??[],${threads},${name})`
    const patched =
      source.slice(0, plain[0].index) + replacement + source.slice(plain[0].index + call.length)
    return { status: 'patched', source: patched, name }
  }
  return {
    status: 'error',
    source,
    reason: `通常の差分での ${name} の呼び出しが、未接続 ${plain.length} か所・接続済み ${hooked.length} か所・接続口の文字列 ${hookTotal} か所（未接続 1・接続済み 0 か、未接続 0・接続済み 1 を想定）`,
  }
}

export function patchAssetsDir(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.js')) continue
    const file = path.join(dir, entry)
    const source = readFileSync(file, 'utf8')
    if (!source.includes('byHunk:') && !source.includes(`(${HOOK}??`)) continue
    const result = patchPlacement(source)
    if (result.status === 'absent') continue
    results.push({ file, ...result })
  }
  const errors = results.filter((result) => result.status === 'error')
  if (errors.length > 0) {
    return { ok: false, message: errors.map((e) => `${path.basename(e.file)}: ${e.reason}`).join('; ') }
  }
  if (results.length !== 1) {
    return {
      ok: false,
      message: `振り分け関数を持つ bundle が ${results.length} 個ある（1 個を想定）`,
    }
  }
  const [result] = results
  if (result.status === 'patched') writeFileSync(result.file, result.source)
  return { ok: true, status: result.status, file: result.file }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const dir = process.argv[2]
  if (!dir) {
    console.error('usage: diffo-patch-placement.mjs <dist/client/assets>')
    process.exit(2)
  }
  const result = patchAssetsDir(dir)
  if (!result.ok) {
    console.error(`  placement: 当てる先が 1 か所に決まらないので書き換えない。${result.message}`)
    process.exit(1)
  }
  const name = path.basename(result.file)
  console.log(
    result.status === 'patched'
      ? `  placement: 接続口を足した（${name}）`
      : `  placement: 変更なし（${name}）`,
  )
}
