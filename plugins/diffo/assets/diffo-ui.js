(() => {
  const storageKey = 'diffo:hide-resolved-threads'
  const draftStorageKey = 'diffo:composer-drafts:v1'
  const hiddenAttribute = 'data-diffo-hide-resolved'
  const toggleClass = 'diffo-resolved-toggle'
  const lgtmButtonClass = 'diffo-lgtm-button'
  const lgtmMessage =
    'LGTM。レビューは完了です。`diffo end` を実行し、polling も終了してください。このメッセージへの返信は不要です。'
  const restoringInputs = new WeakSet()
  const unplacedClass = 'diffo-unplaced-thread'
  const unplacedBadgeClass = 'diffo-unplaced-badge'
  const unplacedLabel = '位置未確定'
  const unplacedTitle =
    'コメントした行を今の差分の中で 1 か所に決められないため、ファイル単位に表示している。下のコードはコメントを書いたときの行'
  const rewrittenClass = 'diffo-rewritten-thread'
  const rewrittenBadgeClass = 'diffo-rewritten-badge'
  const rewrittenLabel = '書き換え済み'
  const rewrittenTitle =
    'コメントした行はコメントの後に書き換えられた。書き換え前と同じ base の行を置き換えている行に表示している。コメントを書いたときの行:'

  // --- スレッドの表示位置を、保存した行番号ではなく snapshot から探し直す ---
  //
  // diffo-patch が diffo のクライアントの配置処理（通常の差分の表示だけ）に接続口を足し、
  // スレッドを hunk と行へ振り分ける直前に placeThreads を呼ぶ。
  // 保存済みのスレッドは変えず、表示用のコピーの anchor だけを差し替える。

  const markers = { add: '+', del: '-', context: ' ' }
  let unplacedThreadIds = new Set()
  let rewrittenThreads = new Map()

  const lineOnSide = (side, kind) => (side === 'old' ? kind !== 'add' : kind !== 'del')
  const rowOnSide = (side, row) => (side === 'old' ? row[0] !== '+' : row[0] !== '-')
  const lineNo = (side, line) => (side === 'old' ? line.oldNo : line.newNo)

  // hunk のうち、コメントした側（old なら context と del、new なら context と add）の行の並び
  const sideSequence = (hunk, side) => {
    const seq = []
    for (const line of hunk.lines ?? []) {
      if (!lineOnSide(side, line.kind)) continue
      const no = lineNo(side, line)
      if (no === null || no === undefined) continue
      seq.push({ text: line.text, no })
    }
    return seq
  }

  // codeContext（hunk 全体）または anchored.text（範囲の先頭 10 diff 行）から、
  // コメントした範囲と前後の行を、コメントした側の行だけで取り出す
  const readSnapshot = (thread) => {
    const { anchor, anchored } = thread
    if (
      !anchored ||
      !Number.isInteger(anchored.start) ||
      !Number.isInteger(anchored.end) ||
      anchored.end < anchored.start
    ) {
      return null
    }
    let rows
    let offset
    if (typeof thread.codeContext === 'string' && thread.codeContext !== '') {
      rows = thread.codeContext.split('\n')
      offset = 0
      if (anchored.end >= rows.length) return null
    } else if (typeof anchored.text === 'string' && anchored.text !== '') {
      rows = anchored.text.split('\n')
      offset = anchored.start
    } else {
      return null
    }

    const side = anchor.side
    const last = offset + rows.length - 1
    const target = []
    for (let i = anchored.start; i <= Math.min(anchored.end, last); i++) {
      if (rowOnSide(side, rows[i - offset])) target.push(rows[i - offset].slice(1))
    }
    const before = []
    for (let i = anchored.start - 1; i >= offset; i--) {
      if (rowOnSide(side, rows[i - offset])) before.push(rows[i - offset].slice(1))
    }
    const after = []
    for (let i = anchored.end + 1; i <= last; i++) {
      if (rowOnSide(side, rows[i - offset])) after.push(rows[i - offset].slice(1))
    }
    return {
      rows,
      // anchored.text は範囲の先頭が hunk の先頭（start が 0）でも hunk 全体ではない
      fullHunk: typeof thread.codeContext === 'string' && thread.codeContext !== '',
      truncated: anchored.end > last,
      target,
      before,
      after,
    }
  }

  const withLines = (anchor, hunkId, line, endLine) => {
    const next = { ...anchor, hunkId, line }
    if (anchor.endLine !== undefined) next.endLine = endLine
    return next
  }

  // (1) 同じ hunkId の hunk が、書いたときと同じ行の並びのまま残っているなら、hunk の中の位置で決める
  const placeInSameHunk = (thread, file, snapshot) => {
    if (!snapshot.fullHunk) return null
    const { anchor, anchored } = thread
    const hunk = file.hunks.find((candidate) => candidate.id === anchor.hunkId)
    if (!hunk || hunk.lines.length !== snapshot.rows.length) return null
    const same = hunk.lines.every(
      (line, index) => markers[line.kind] + line.text === snapshot.rows[index],
    )
    if (!same) return null
    const covered = hunk.lines
      .slice(anchored.start, anchored.end + 1)
      .filter((line) => lineOnSide(anchor.side, line.kind) && lineNo(anchor.side, line) != null)
    if (covered.length === 0) return null
    return withLines(
      anchor,
      hunk.id,
      lineNo(anchor.side, covered[0]),
      lineNo(anchor.side, covered.at(-1)),
    )
  }

  const contextScore = (seq, position, length, snapshot) => {
    let score = 0
    while (
      score < snapshot.before.length &&
      position - 1 - score >= 0 &&
      seq[position - 1 - score].text === snapshot.before[score]
    ) {
      score++
    }
    let after = 0
    while (
      after < snapshot.after.length &&
      position + length + after < seq.length &&
      seq[position + length + after].text === snapshot.after[after]
    ) {
      after++
    }
    return score + after
  }

  // (2) コメントした側の行の並びの中で、範囲のテキスト列が連続して一致する箇所を探す。
  // snapshot に前後の行があれば、候補が 1 つでも前後の行が 1 行以上一致することを求める
  // （コメントした行が書き換わり、同じ文字列の無関係な行だけが残った場合に付けない）。
  // 複数あれば前後の行の一致数で絞り、それでも並べば決めない
  const searchInFile = (thread, file, snapshot) => {
    const { anchor } = thread
    const target = snapshot.target
    // 範囲が 10 diff 行で切れた snapshot は末尾を確かめられないので決めない
    if (target.length === 0 || snapshot.truncated) return null
    const candidates = []
    for (const hunk of file.hunks) {
      const seq = sideSequence(hunk, anchor.side)
      for (let position = 0; position + target.length <= seq.length; position++) {
        if (target.every((text, offset) => seq[position + offset].text === text)) {
          candidates.push({ hunk, seq, position })
        }
      }
    }
    if (candidates.length === 0) return null

    const scored = candidates.map((candidate) => ({
      ...candidate,
      score: contextScore(candidate.seq, candidate.position, target.length, snapshot),
    }))
    const top = Math.max(...scored.map((candidate) => candidate.score))
    const hasContext = snapshot.before.length + snapshot.after.length > 0
    if (hasContext && top === 0) return null
    const winners = scored.filter((candidate) => candidate.score === top)
    if (winners.length !== 1) return null

    const { hunk, seq, position } = winners[0]
    return withLines(
      anchor,
      hunk.id,
      seq[position].no,
      seq[position + target.length - 1].no,
    )
  }

  // --- (3) コメントした行が書き換えられたスレッドを、base 側の行で位置を決める ---
  //
  // base はレビュー中に変わらない。snapshot の old 側の行（hunk の base の範囲）を base のファイルで
  // 一字一句の一致で探し、1 か所に決まれば、コメントした行を含む変更のかたまりが base のどの行を
  // 置き換えていたかが決まる。今の差分の削除行の oldNo は base の行番号なので、その base の行を今
  // 置き換えているかたまりの追加行から、描く行を選ぶ。

  // 文字の類似度: 2 × 最長共通部分列の長さ ÷ 両方の長さの和
  const similarity = (a, b) => {
    if (a === b) return 1
    if (a.length === 0 || b.length === 0) return 0
    const left = [...a]
    const right = [...b]
    let previous = new Uint16Array(right.length + 1)
    let current = new Uint16Array(right.length + 1)
    for (let i = 1; i <= left.length; i++) {
      for (let j = 1; j <= right.length; j++) {
        current[j] =
          left[i - 1] === right[j - 1]
            ? previous[j - 1] + 1
            : Math.max(previous[j], current[j - 1])
      }
      ;[previous, current] = [current, previous]
    }
    return (2 * previous[right.length]) / (left.length + right.length)
  }

  // hunk の行を変更のかたまり（context 行で区切った、連続する削除行と追加行）に分ける
  const changeBlocks = (hunk) => {
    const blocks = []
    let block = null
    let previousOld = null
    for (const line of hunk.lines ?? []) {
      if (line.kind === 'context') {
        if (block) {
          block.nextOldNo = line.oldNo
          blocks.push(block)
          block = null
        }
        previousOld = line.oldNo
        continue
      }
      if (!block) block = { hunk, previousOldNo: previousOld, nextOldNo: null, dels: [], adds: [] }
      if (line.kind === 'del') {
        block.dels.push(line)
        previousOld = line.oldNo
      } else {
        block.adds.push(line)
      }
    }
    if (block) blocks.push(block)
    // hunk の先頭のかたまり（ファイルの先頭への挿入など）は、直前の base の行番号を後ろの行から求める
    for (const each of blocks) {
      if (each.previousOldNo !== null) continue
      const following = each.dels[0]?.oldNo ?? each.nextOldNo
      if (following != null) each.previousOldNo = following - 1
    }
    return blocks
  }

  // base のファイルの行（スレッドの path → 行の配列。取れなかったファイルは null）。
  // 描く処理は同期なので、installBaseFetch が diffo のクライアントの取得に合わせて先に取っておく
  let baseFiles = new Map()
  const normalizeLine = (text) => text.replace(/\r$/, '')
  const toBaseLines = (text) => {
    const lines = text.split('\n')
    if (lines.at(-1) === '') lines.pop()
    return lines.map(normalizeLine)
  }

  // snapshot の old 側の行（hunk の base の範囲）全体を base のファイルで探す。
  // 1 か所に決まれば、snapshot の行の番号 → base の行番号の対応を返す
  const locateSnapshotInBase = (baseLines, rows) => {
    const oldRows = []
    rows.forEach((row, index) => {
      if (row[0] !== '+') oldRows.push({ index, text: normalizeLine(row.slice(1)) })
    })
    if (oldRows.length === 0) return null
    let found = -1
    for (let start = 0; start + oldRows.length <= baseLines.length; start++) {
      if (oldRows.every((row, offset) => baseLines[start + offset] === row.text)) {
        if (found !== -1) return null
        found = start
      }
    }
    if (found === -1) return null
    return new Map(oldRows.map((row, offset) => [row.index, found + offset + 1]))
  }

  // 2 つの行の並びの、一字一句同じ行どうしの対応（最長共通部分列）。[左の番号, 右の番号] の組
  const alignEqual = (left, right) => {
    const table = Array.from({ length: left.length + 1 }, () => new Uint16Array(right.length + 1))
    for (let i = left.length - 1; i >= 0; i--) {
      for (let j = right.length - 1; j >= 0; j--) {
        table[i][j] =
          left[i] === right[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
      }
    }
    const pairs = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      if (left[i] === right[j]) {
        pairs.push([i, j])
        i++
        j++
      } else if (table[i + 1][j] >= table[i][j + 1]) {
        i++
      } else {
        j++
      }
    }
    return pairs
  }

  // 類似度で選ぶときの下限。これより似ていなければ、書き換えた行とはみなさない
  const minimumSimilarity = 0.5

  const pickLine = (candidate) => ({
    hunk: candidate.block.hunk,
    newNo: candidate.line.newNo,
    text: candidate.line.text,
  })

  // snapshot の行 rowIndex を、今の差分の追加行（hunk と newNo）に対応づける。決まらなければ null
  const mapRowByBase = (file, rows, baseNoOfRow, rowIndex) => {
    const kind = rows[rowIndex][0]
    const commented = rows[rowIndex].slice(1)
    let start = rowIndex
    let end = rowIndex
    if (kind === '+') {
      while (start > 0 && rows[start - 1][0] !== ' ') start--
      while (end < rows.length - 1 && rows[end + 1][0] !== ' ') end++
    } else if (kind !== ' ') {
      return null
    }
    // context 行が今も同じ base の行の context 行なら、その行（範囲の端が変わっていない場合）
    if (kind === ' ') {
      const baseNo = baseNoOfRow.get(rowIndex)
      for (const hunk of file.hunks) {
        const line = (hunk.lines ?? []).find(
          (candidate) => candidate.kind === 'context' && candidate.oldNo === baseNo,
        )
        if (line) return { hunk, newNo: line.newNo, text: line.text }
      }
    }
    // かたまりが置き換えていた base の行。コメントした行が context 行なら、その 1 行
    const delNos = new Set()
    const snapshotAdds = []
    for (let i = start; i <= end; i++) {
      if (kind === ' ' || rows[i][0] === '-') delNos.add(baseNoOfRow.get(i))
      else snapshotAdds.push(i)
    }
    // 挿入だけのかたまりなら、挿入した位置（直前の base の行の番号）
    let insertedAfter = null
    if (delNos.size === 0) {
      for (let i = start - 1; i >= 0 && insertedAfter === null; i--) {
        if (rows[i][0] !== '+') insertedAfter = baseNoOfRow.get(i)
      }
      for (let i = end + 1; i < rows.length && insertedAfter === null; i++) {
        if (rows[i][0] !== '+') insertedAfter = baseNoOfRow.get(i) - 1
      }
      if (insertedAfter === null) return null
    }

    // 今の差分で、その base の行を置き換えているかたまり。挿入だけなら、同じ位置への追加か、
    // 挿入した位置の直前・直後の base の行も書き換えているかたまり
    const blocks = file.hunks.flatMap(changeBlocks).filter((block) =>
      delNos.size > 0
        ? block.dels.some((line) => delNos.has(line.oldNo))
        : (block.dels.length === 0 && block.previousOldNo === insertedAfter) ||
          block.dels.some(
            (line) => line.oldNo === insertedAfter || line.oldNo === insertedAfter + 1,
          ),
    )
    const current = blocks.flatMap((block) => block.adds.map((line) => ({ block, line })))
    if (current.length === 0) return null

    // 追加行の並びを一字一句同じ行で対応づけ、コメントした行が入るすき間に候補を絞る
    let gap = current
    let gapIndex = -1
    // すき間にある、書いたときの行（コメントした行を含む）と、その中のコメントした行の番号
    let written = [commented]
    let writtenIndex = 0
    if (kind === '+') {
      const k = snapshotAdds.indexOf(rowIndex)
      const pairs = alignEqual(
        snapshotAdds.map((i) => rows[i].slice(1)),
        current.map((candidate) => candidate.line.text),
      )
      const same = pairs.find(([i]) => i === k)
      if (same) return pickLine(current[same[1]])
      const before = pairs.filter(([i]) => i < k).at(-1) ?? [-1, -1]
      const after = pairs.find(([i]) => i > k) ?? [snapshotAdds.length, current.length]
      gap = current.slice(before[1] + 1, after[1])
      written = snapshotAdds.slice(before[0] + 1, after[0]).map((i) => rows[i].slice(1))
      writtenIndex = k - before[0] - 1
      // かたまりが 1 つで、すき間の追加行の数が書いたときと同じなら、すき間の中で同じ番目を先に試す
      if (blocks.length === 1 && gap.length === written.length) gapIndex = writtenIndex
    }
    if (gap.length === 0) return null

    // 互いに最も似ている組だけを採る。コメントした行から見て最も似ている今の行で、その今の行から見ても、
    // すき間の書いたときの行のうち最も似ているのがコメントした行であること
    // （取り消した行や消した行のスレッドを、残った別の行の書き換えと取り違えない）
    const bestOf = (scores) => {
      const best = Math.max(...scores)
      return scores.flatMap((score, index) => (score === best ? [index] : []))
    }
    const forward = gap.map((candidate) => similarity(commented, candidate.line.text))
    const forwardBest = bestOf(forward)
    const backwardBest = (index) => bestOf(written.map((text) => similarity(text, gap[index].line.text)))
    // 同じ番目の行は、互いに最も似ている組に入るときに採る（並んだときは位置で決める）。
    // すき間が書いたときも今も 1 行だけなら、同じ base の位置の 1 対 1 の置き換えなので、類似度の下限を問わない
    if (
      gapIndex >= 0 &&
      forwardBest.includes(gapIndex) &&
      backwardBest(gapIndex).includes(writtenIndex) &&
      (forward[gapIndex] >= minimumSimilarity || gap.length === 1)
    ) {
      return pickLine(gap[gapIndex])
    }
    if (forwardBest.length !== 1 || forward[forwardBest[0]] < minimumSimilarity) return null
    const backward = backwardBest(forwardBest[0])
    if (backward.length !== 1 || backward[0] !== writtenIndex) return null
    return pickLine(gap[forwardBest[0]])
  }

  const placeByBase = (thread, file, snapshot) => {
    const { anchor, anchored } = thread
    if (anchor.side !== 'new' || !snapshot.fullHunk) return null
    const baseLines = baseFiles.get(anchor.path)
    if (!baseLines) return null
    const rows = snapshot.rows
    const baseNoOfRow = locateSnapshotInBase(baseLines, rows)
    if (!baseNoOfRow) return null
    const newRows = []
    for (let i = anchored.start; i <= anchored.end; i++) {
      if (rows[i][0] !== '-') newRows.push(i)
    }
    if (newRows.length === 0) return null
    const rangeRows = anchor.endLine === undefined ? newRows.slice(0, 1) : newRows
    const first = mapRowByBase(file, rows, baseNoOfRow, rangeRows[0])
    if (!first) return null
    let last = first
    if (rangeRows.length > 1) {
      last = mapRowByBase(file, rows, baseNoOfRow, rangeRows.at(-1))
      if (!last || last.hunk !== first.hunk || last.newNo < first.newNo) return null
    }
    // 範囲のすべての行を比べ、1 行でも違えば書き換え済みにする
    const original = rangeRows.map((i) => rows[i].slice(1)).join('\n')
    const current = first.hunk.lines
      .filter((line) => line.kind !== 'del' && line.newNo >= first.newNo && line.newNo <= last.newNo)
      .map((line) => line.text)
      .join('\n')
    return {
      anchor: withLines(anchor, first.hunk.id, first.newNo, last.newNo),
      rewritten: original !== current,
      original,
    }
  }

  const sameAnchor = (a, b) =>
    a.hunkId === b.hunkId && a.line === b.line && a.endLine === b.endLine

  // スレッド 1 件の表示位置。skip は diffo の既定のまま描く
  const locateThread = (thread, filesByPath) => {
    const anchor = thread?.anchor
    if (!anchor || anchor.kind !== 'hunk' || anchor.commit !== undefined || thread.github) {
      return { kind: 'skip' }
    }
    if (anchor.side !== 'old' && anchor.side !== 'new') return { kind: 'skip' }
    const file = filesByPath.get(anchor.path)
    if (!file || !Array.isArray(file.hunks)) return { kind: 'skip' }
    const snapshot = readSnapshot(thread)
    if (!snapshot) return { kind: 'skip' }
    const placed = placeInSameHunk(thread, file, snapshot) ?? searchInFile(thread, file, snapshot)
    if (placed) return { kind: 'placed', anchor: placed }
    const byBase = placeByBase(thread, file, snapshot)
    if (byBase) {
      return byBase.rewritten
        ? { kind: 'rewritten', anchor: byBase.anchor, original: byBase.original }
        : { kind: 'placed', anchor: byBase.anchor }
    }
    return {
      kind: 'unplaced',
      snippet: thread.anchored?.text || thread.codeContext || null,
    }
  }

  const placeThreads = (files, threads, partition) => {
    const fallback = () => {
      unplacedThreadIds = new Set()
      rewrittenThreads = new Map()
      return partition(files, threads)
    }
    if (typeof partition !== 'function') return null
    if (!Array.isArray(files) || !Array.isArray(threads)) return fallback()
    try {
      const filesByPath = new Map(files.map((file) => [file.path, file]))
      const placedThreads = []
      const unplaced = []
      const rewritten = new Map()
      for (const thread of threads) {
        let located
        try {
          located = locateThread(thread, filesByPath)
        } catch (error) {
          // 1 件の失敗で、ほかのスレッドの位置まで既定に戻さない。このスレッドだけ diffo の既定のまま描く
          console.warn('diffo-ui: スレッドの表示位置を探し直せなかったため、diffo の既定の位置に描く', error)
          located = { kind: 'skip' }
        }
        if (located.kind === 'placed') {
          placedThreads.push(
            sameAnchor(located.anchor, thread.anchor) ? thread : { ...thread, anchor: located.anchor },
          )
        } else if (located.kind === 'rewritten') {
          placedThreads.push({ ...thread, anchor: located.anchor })
          rewritten.set(thread.id, located.original)
        } else if (located.kind === 'unplaced') {
          unplaced.push({ ...thread, codeContext: located.snippet })
        } else {
          placedThreads.push(thread)
        }
      }
      const result = partition(files, placedThreads)
      for (const thread of unplaced) {
        const list = result.byFile.get(thread.anchor.path)
        if (list) list.push(thread)
        else result.byFile.set(thread.anchor.path, [thread])
      }
      unplacedThreadIds = new Set(unplaced.map((thread) => thread.id))
      rewrittenThreads = rewritten
      return result
    } catch (error) {
      console.warn('diffo-ui: スレッドの表示位置を探し直せなかったため、diffo の既定の位置に描く', error)
      return fallback()
    }
  }

  globalThis.__diffoPlaceThreads = placeThreads
  // 直前の placeThreads で、位置未確定と書き換え済みにしたスレッド（テストと検証で読む）
  globalThis.__diffoPlacementState = () => ({
    unplaced: [...unplacedThreadIds],
    rewritten: Object.fromEntries(rewrittenThreads),
  })
  // base のファイルを差し替える（テストと検証で使う。path → 本文の文字列か null）
  globalThis.__diffoSetBaseFiles = (entries) => {
    baseFiles = new Map(
      Object.entries(entries).map(([path, text]) => [path, typeof text === 'string' ? toBaseLines(text) : null]),
    )
  }

  // diffo のクライアントの /api/review と /api/changeset の取得に割り込み、応答を渡す前に、
  // 行コメントのあるファイルの base を取っておく。React はその応答を受けてから描くので、
  // placeThreads は取っておいた base を同期的に使える。diffo-ui.js は bundle より先に読み込む（diffo-patch）
  const installBaseFetch = () => {
    const original = globalThis.fetch
    if (typeof original !== 'function' || original.__diffoBaseFetch) return
    let threadPaths = new Set()
    let basePathOf = new Map()
    const fetchBase = async (path) => {
      try {
        const response = await original(
          `/api/file?path=${encodeURIComponent(basePathOf.get(path) ?? path)}&side=base`,
        )
        return response.ok ? toBaseLines(await response.text()) : null
      } catch {
        return null
      }
    }
    // 取得の世代。changeset の更新（base が変わりうる）で進める。取得の途中で世代が進んだら、
    // その取得の結果は古い base かもしれないので保存せず、取り直す
    let generation = 0
    const generationOf = new Map()
    // replace なら取り直す。そうでなければ、無いファイルと取れなかったファイルだけを取る。
    // 保存できたら true、途中で世代が進んで保存しなかったら false
    const fill = async (replace) => {
      const mine = replace ? ++generation : generation
      const paths = [...threadPaths].filter((path) => replace || !baseFiles.get(path))
      const results = await Promise.all(paths.map(async (path) => [path, await fetchBase(path)]))
      if (mine !== generation) return false
      for (const [path, lines] of results) {
        // 取れなかった結果では、同じ世代で取れた base を消さない
        if (lines === null && baseFiles.get(path) && generationOf.get(path) === mine) continue
        generationOf.set(path, mine)
        baseFiles.set(path, lines)
      }
      return true
    }
    const fillUntilCurrent = async (replace) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (await fill(replace && attempt === 0)) return
      }
    }
    const wrapped = async (input, init) => {
      const response = await original(input, init)
      try {
        const url = new URL(typeof input === 'string' ? input : input.url, location.href)
        if (response.ok && url.origin === location.origin && url.search === '') {
          if (url.pathname === '/api/review') {
            const review = await response.clone().json()
            threadPaths = new Set(
              (review.threads ?? [])
                .filter((thread) => thread.anchor?.kind === 'hunk')
                .map((thread) => thread.anchor.path),
            )
            await fillUntilCurrent(false)
          } else if (url.pathname === '/api/changeset') {
            const changeset = await response.clone().json()
            basePathOf = new Map(
              (changeset.files ?? [])
                .filter((file) => file.status !== 'added')
                .map((file) => [file.path, file.oldPath ?? file.path]),
            )
            await fillUntilCurrent(true)
          }
        }
      } catch {
        // base を取れなくても diffo の応答はそのまま渡す。base の無いファイルでは base 側の段を使わない
      }
      return response
    }
    wrapped.__diffoBaseFetch = true
    globalThis.fetch = wrapped
  }
  if (typeof location !== 'undefined') installBaseFetch()

  // thread-marks に札を付け外しする。title が null なら札を外す
  const setBadge = (marks, badgeClass, label, title) => {
    const badge = marks.querySelector(`.${badgeClass}`)
    if (title === null) {
      badge?.remove()
      return
    }
    if (badge) {
      if (badge.title !== title) badge.title = title
      return
    }
    const created = document.createElement('span')
    created.className = `thread-badge ${badgeClass}`
    created.textContent = label
    created.title = title
    marks.prepend(created)
  }

  const markPlacedThreads = () => {
    for (const thread of document.querySelectorAll('.thread[data-thread-id]')) {
      const id = thread.dataset.threadId
      const unplaced = unplacedThreadIds.has(id)
      const original = rewrittenThreads.get(id)
      if (thread.classList.contains(unplacedClass) !== unplaced) {
        thread.classList.toggle(unplacedClass, unplaced)
      }
      if (thread.classList.contains(rewrittenClass) !== (original !== undefined)) {
        thread.classList.toggle(rewrittenClass, original !== undefined)
      }
      const marks = [...thread.querySelectorAll('.thread-marks')].find(
        (candidate) => candidate.closest('.thread') === thread,
      )
      if (!marks) continue
      setBadge(marks, unplacedBadgeClass, unplacedLabel, unplaced ? unplacedTitle : null)
      setBadge(
        marks,
        rewrittenBadgeClass,
        rewrittenLabel,
        original === undefined ? null : `${rewrittenTitle}\n${original}`,
      )
    }
  }

  const readDrafts = () => {
    try {
      return JSON.parse(sessionStorage.getItem(draftStorageKey) ?? '{}')
    } catch {
      return {}
    }
  }

  const writeDrafts = (drafts) => {
    try {
      if (Object.keys(drafts).length === 0) sessionStorage.removeItem(draftStorageKey)
      else sessionStorage.setItem(draftStorageKey, JSON.stringify(drafts))
    } catch {
      // Draft preservation is best-effort when storage is unavailable.
    }
  }

  const updateDraft = (key, update) => {
    const drafts = readDrafts()
    if (update === null) delete drafts[key]
    else drafts[key] = { ...drafts[key], ...update }
    writeDrafts(drafts)
  }

  const describeComposer = (textarea) => {
    if (!(textarea instanceof HTMLTextAreaElement)) return null
    if (!textarea.matches('textarea.thread-input')) return null

    const thread = textarea.closest('.thread[data-thread-id]')
    if (thread && !textarea.classList.contains('cbox-input')) {
      return {
        kind: 'reply',
        key: `reply:${thread.dataset.threadId}`,
        scope: thread,
      }
    }

    const composer = textarea.closest('.thread-composer')
    const hunk = textarea.closest('.hunk[data-hunk-id]')
    if (composer && hunk && textarea.classList.contains('cbox-input')) {
      return {
        kind: 'comment',
        key: `comment:${hunk.dataset.hunkId}`,
        scope: hunk,
      }
    }

    return null
  }

  const setTextareaValue = (textarea, value) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set
    if (setter) setter.call(textarea, value)
    else textarea.value = value
    restoringInputs.add(textarea)
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const appendLgtmMessage = (note) => {
    const trimmed = note.trim()
    if (trimmed.includes(lgtmMessage)) return trimmed
    return trimmed === '' ? lgtmMessage : `${trimmed}\n\n${lgtmMessage}`
  }

  const buttonLabel = (button) =>
    [...button.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim()

  const rememberDraft = (event) => {
    if (restoringInputs.delete(event.target)) return
    const composer = describeComposer(event.target)
    if (!composer) return
    const text = event.target.value
    updateDraft(
      composer.key,
      text === '' ? null : { kind: composer.kind, text, submitted: false },
    )
  }

  const markDraftSubmitted = (textarea) => {
    const composer = describeComposer(textarea)
    if (!composer || textarea.value.trim() === '') return
    updateDraft(composer.key, {
      kind: composer.kind,
      text: textarea.value,
      submitted: true,
      messageCount: reviewerMessageCount(composer.scope),
    })
  }

  const handleComposerClick = (event) => {
    if (!(event.target instanceof Element)) return
    const button = event.target.closest('button')
    if (!(button instanceof HTMLButtonElement)) return
    const textarea = button.closest('.thread-composer, .thread')?.querySelector('textarea.thread-input')
    if (!(textarea instanceof HTMLTextAreaElement)) return

    const label = buttonLabel(button)
    if (
      button.getAttribute('aria-label') === 'Close' ||
      (button.closest('.thread-composer') && label === 'Close')
    ) {
      const composer = describeComposer(textarea)
      if (composer) updateDraft(composer.key, null)
      return
    }

    if (['Add comment', 'Send to agent', 'Reply', 'Reply & send'].includes(label)) {
      markDraftSubmitted(textarea)
    }
  }

  const handleComposerKeydown = (event) => {
    if (!(event.target instanceof HTMLTextAreaElement)) return
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      markDraftSubmitted(event.target)
    }
  }

  const reviewerMessageCount = (scope) =>
    scope.querySelectorAll('.thread-message-reviewer').length

  const clearSubmittedDrafts = () => {
    const drafts = readDrafts()
    let changed = false

    for (const [key, draft] of Object.entries(drafts)) {
      if (!draft.submitted) continue
      if (draft.kind === 'reply') {
        const threadId = key.slice('reply:'.length)
        const thread = [...document.querySelectorAll('.thread[data-thread-id]')].find(
          (candidate) => candidate.dataset.threadId === threadId,
        )
        if (
          thread &&
          reviewerMessageCount(thread) > (draft.messageCount ?? 0)
        ) {
          delete drafts[key]
          changed = true
        }
      } else if (draft.kind === 'comment') {
        const hunkId = key.slice('comment:'.length)
        const hunk = [...document.querySelectorAll('.hunk[data-hunk-id]')].find(
          (candidate) => candidate.dataset.hunkId === hunkId,
        )
        if (hunk && reviewerMessageCount(hunk) > (draft.messageCount ?? 0)) {
          delete drafts[key]
          changed = true
        }
      }
    }

    if (changed) writeDrafts(drafts)
  }

  const restoreDrafts = () => {
    const drafts = readDrafts()
    const composers = [...document.querySelectorAll('textarea.thread-input')]
      .map((textarea) => ({ textarea, composer: describeComposer(textarea) }))
      .filter(({ textarea, composer }) => composer && textarea.value === '')
    const restored = new Set()

    for (const { textarea, composer } of composers) {
      const draft = drafts[composer.key]
      if (!draft?.text) continue
      setTextareaValue(textarea, draft.text)
      restored.add(composer.key)
    }

    const unmatchedComposers = composers.filter(
      ({ composer }) => composer.kind === 'comment' && !drafts[composer.key],
    )
    const unmatchedDrafts = Object.entries(drafts).filter(
      ([key, draft]) => draft.kind === 'comment' && !restored.has(key),
    )
    if (unmatchedComposers.length === 1 && unmatchedDrafts.length === 1) {
      const [{ textarea, composer }] = unmatchedComposers
      const [[oldKey, draft]] = unmatchedDrafts
      delete drafts[oldKey]
      drafts[composer.key] = draft
      writeDrafts(drafts)
      setTextareaValue(textarea, draft.text)
    }
  }

  const readHidden = () => {
    try {
      return localStorage.getItem(storageKey) !== 'false'
    } catch {
      return true
    }
  }

  let hidden = readHidden()

  const icon = (isHidden) =>
    isHidden
      ? '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.9 10.9 0 0 1 12 4c5.5 0 9 5 9 5a15.2 15.2 0 0 1-2.1 2.5M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10.8 10.8 0 0 0 3-.4"/></svg>'
      : '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>'

  const updateButton = (button) => {
    const label = hidden ? 'Show resolved threads' : 'Hide resolved threads'
    button.setAttribute('aria-label', label)
    button.setAttribute('aria-pressed', String(hidden))
    button.dataset.tip = label
    button.innerHTML = icon(hidden)
  }

  const setHidden = (next) => {
    hidden = next
    if (hidden) {
      markResolvedOnlyRows()
      clearHiddenResolvedHover()
    }
    document.documentElement.setAttribute(hiddenAttribute, String(hidden))
    try {
      localStorage.setItem(storageKey, String(hidden))
    } catch {
      // The toggle still works for this page when storage is unavailable.
    }
    const button = document.querySelector(`.${toggleClass}`)
    if (button instanceof HTMLButtonElement) updateButton(button)
  }

  const markSettledSections = () => {
    for (const row of document.querySelectorAll('.sec-row')) {
      const heading = row.querySelector('.sec-head')
      if (heading?.textContent?.trim().startsWith('Settled')) {
        const section = row.parentElement
        // Rewriting an unchanged class still notifies the observer below.
        if (section && !section.classList.contains('diffo-settled-section')) {
          section.classList.add('diffo-settled-section')
        }
      }
    }
  }

  const markResolvedOnlyRows = () => {
    for (const row of document.querySelectorAll('.thread-row')) {
      const threads = [...row.querySelectorAll('.thread')]
      const resolvedOnly =
        threads.length > 0 &&
        !row.querySelector('.thread-composer') &&
        threads.every((thread) => thread.classList.contains('thread-resolved'))
      if (row.classList.contains('diffo-resolved-only-row') !== resolvedOnly) {
        row.classList.toggle('diffo-resolved-only-row', resolvedOnly)
      }
    }
  }

  const clearHiddenResolvedHover = () => {
    // Clear Diffo's row-hover highlight when its resolved threads become hidden.
    for (const scope of document.querySelectorAll(
      '.thread-row-lit.diffo-resolved-only-row .thread-anchor-scope',
    )) {
      scope.dispatchEvent(
        new MouseEvent('mouseout', {
          bubbles: true,
          relatedTarget: document.body,
        }),
      )
    }
  }

  const mountLgtmButton = () => {
    const modal = document.querySelector('.modal[aria-label="Finish review"]')
    if (!(modal instanceof HTMLElement)) return
    const footer = modal.querySelector('.modal-foot')
    const note = modal.querySelector('textarea.fin-note')
    const finishButton = [...(footer?.querySelectorAll('button') ?? [])].find(
      (button) => buttonLabel(button) === 'Finish & send',
    )
    if (
      !(footer instanceof HTMLElement) ||
      !(note instanceof HTMLTextAreaElement) ||
      !(finishButton instanceof HTMLButtonElement) ||
      footer.querySelector(`.${lgtmButtonClass}`)
    ) {
      return
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.className = `btn ${lgtmButtonClass}`
    button.textContent = 'LGTM'
    button.title = 'send the closing comment, end Diffo, and stop polling'
    button.disabled = finishButton.disabled
    button.addEventListener('click', () => {
      button.disabled = true
      setTextareaValue(note, appendLgtmMessage(note.value))
      setTimeout(() => {
        const currentModal = document.querySelector('.modal[aria-label="Finish review"]')
        const currentFinish = [...(currentModal?.querySelectorAll('.modal-foot button') ?? [])].find(
          (candidate) => buttonLabel(candidate) === 'Finish & send',
        )
        if (currentFinish instanceof HTMLButtonElement && !currentFinish.disabled) {
          currentFinish.click()
        } else {
          button.disabled = false
        }
      }, 0)
    })
    finishButton.insertAdjacentElement('beforebegin', button)
  }

  const mount = () => {
    clearSubmittedDrafts()
    restoreDrafts()
    markSettledSections()
    markResolvedOnlyRows()
    markPlacedThreads()
    mountLgtmButton()
    if (hidden) clearHiddenResolvedHover()
    document.documentElement.setAttribute(hiddenAttribute, String(hidden))

    const collapse = document.querySelector(
      '.pane-bar button[aria-label="Collapse all files"], .pane-bar button[aria-label="Expand all files"]',
    )
    if (!(collapse instanceof HTMLButtonElement)) return
    if (collapse.parentElement?.querySelector(`.${toggleClass}`)) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = `pane-icon ${toggleClass}`
    button.addEventListener('click', () => setHidden(!hidden))
    updateButton(button)
    collapse.insertAdjacentElement('afterend', button)
  }

  const start = () => {
    document.addEventListener('input', rememberDraft, true)
    document.addEventListener('click', handleComposerClick, true)
    document.addEventListener('keydown', handleComposerKeydown, true)
    mount()
    new MutationObserver(mount).observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
})()
