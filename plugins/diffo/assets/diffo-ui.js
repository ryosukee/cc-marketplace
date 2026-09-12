(() => {
  const storageKey = 'diffo:hide-resolved-threads'
  const draftStorageKey = 'diffo:composer-drafts:v1'
  const hiddenAttribute = 'data-diffo-hide-resolved'
  const toggleClass = 'diffo-resolved-toggle'
  const restoringInputs = new WeakSet()

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

    const label = [...button.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim()
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
        row.parentElement?.classList.add('diffo-settled-section')
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
      row.classList.toggle('diffo-resolved-only-row', resolvedOnly)
    }
  }

  const clearHiddenResolvedHover = () => {
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

  const mount = () => {
    clearSubmittedDrafts()
    restoreDrafts()
    markSettledSections()
    markResolvedOnlyRows()
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
