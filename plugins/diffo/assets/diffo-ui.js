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

  // --- スレッドの表示位置を、保存した行番号ではなく snapshot から探し直す ---
  //
  // diffo-patch が diffo のクライアントの配置処理（通常の差分の表示だけ）に接続口を足し、
  // スレッドを hunk と行へ振り分ける直前に placeThreads を呼ぶ。
  // 保存済みのスレッドは変えず、表示用のコピーの anchor だけを差し替える。

  const markers = { add: '+', del: '-', context: ' ' }
  let unplacedThreadIds = new Set()

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
      fullHunk: offset === 0,
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
    return {
      kind: 'unplaced',
      snippet: thread.anchored?.text || thread.codeContext || null,
    }
  }

  const placeThreads = (files, threads, partition) => {
    const fallback = () => {
      unplacedThreadIds = new Set()
      return partition(files, threads)
    }
    if (typeof partition !== 'function') return null
    if (!Array.isArray(files) || !Array.isArray(threads)) return fallback()
    try {
      const filesByPath = new Map(files.map((file) => [file.path, file]))
      const placedThreads = []
      const unplaced = []
      for (const thread of threads) {
        const located = locateThread(thread, filesByPath)
        if (located.kind === 'placed') {
          placedThreads.push(
            sameAnchor(located.anchor, thread.anchor) ? thread : { ...thread, anchor: located.anchor },
          )
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
      return result
    } catch (error) {
      console.warn('diffo-ui: スレッドの表示位置を探し直せなかったため、diffo の既定の位置に描く', error)
      return fallback()
    }
  }

  globalThis.__diffoPlaceThreads = placeThreads

  const markUnplacedThreads = () => {
    for (const thread of document.querySelectorAll('.thread[data-thread-id]')) {
      const unplaced = unplacedThreadIds.has(thread.dataset.threadId)
      if (thread.classList.contains(unplacedClass) !== unplaced) {
        thread.classList.toggle(unplacedClass, unplaced)
      }
      const marks = [...thread.querySelectorAll('.thread-marks')].find(
        (candidate) => candidate.closest('.thread') === thread,
      )
      if (!marks) continue
      const badge = marks.querySelector(`.${unplacedBadgeClass}`)
      if (unplaced && !badge) {
        const created = document.createElement('span')
        created.className = `thread-badge ${unplacedBadgeClass}`
        created.textContent = unplacedLabel
        created.title = unplacedTitle
        marks.prepend(created)
      } else if (!unplaced && badge) {
        badge.remove()
      }
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
    markUnplacedThreads()
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
