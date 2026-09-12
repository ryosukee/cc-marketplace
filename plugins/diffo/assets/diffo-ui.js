(() => {
  const storageKey = 'diffo:hide-resolved-threads'
  const hiddenAttribute = 'data-diffo-hide-resolved'
  const toggleClass = 'diffo-resolved-toggle'

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

  const mount = () => {
    document.documentElement.setAttribute(hiddenAttribute, String(hidden))
    markSettledSections()
    markResolvedOnlyRows()

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
    mount()
    new MutationObserver(mount).observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
})()
