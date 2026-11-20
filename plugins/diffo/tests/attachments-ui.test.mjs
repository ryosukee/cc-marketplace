import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

const source = readFileSync(new URL('../assets/diffo-ui.js', import.meta.url), 'utf8')
const attachmentPath = '/tmp/diffo-attachments/abc123/123-abc-photo.png'
const otherPath = '/tmp/diffo-attachments/abc123/124-abc-notes.txt'
function pure() {
  const context = { document: { readyState: 'loading', addEventListener() {} }, localStorage: { getItem() {} } }
  vm.runInNewContext(source, context)
  return context.__diffoAttachments
}

test('attachment helpers extract only attachment Markdown links and raster previews', () => {
  const { attachmentLinks, attachmentName } = pure()
  const text = `before [写真](${attachmentPath}) and [notes](${otherPath}) after`
  const links = attachmentLinks(text)
  assert.equal(links.length, 2)
  assert.equal(links[0].name, '写真')
  assert.equal(links[0].url, '/api/plugin/attachments/123-abc-photo.png')
  assert.equal(links[0].image, true)
  assert.equal(links[1].image, false)
  assert.equal(text.slice(links[0].start, links[0].end), `[写真](${attachmentPath})`)
  for (const invalid of ['/tmp/a.png', '/tmp/diffo-attachments/hash/../a.png', '/tmp/diffo-attachments/hash/..', '/api/plugin/attachments/a.png', 'https://example.com/diffo-attachments/hash/a.png']) {
    assert.equal(attachmentName(invalid), null)
  }
  assert.equal(attachmentLinks(`![image](${attachmentPath}) [external](https://example.com/a.png)`).length, 0)
  assert.equal(attachmentLinks('[svg](/tmp/diffo-attachments/hash/a.svg)')[0].image, false)
})

test('attachment helpers round-trip escaped names, spaces and parentheses and remove one occurrence', () => {
  const { attachmentLinks, attachmentMarkdown, removeAttachment } = pure()
  const name = '日本語 [a]\\b.png'
  const markdown = attachmentMarkdown({ name, path: '/tmp/space (x)/diffo-attachments/hash/a.png' })
  assert.equal(attachmentLinks(markdown)[0].name, name)
  const text = `a ${markdown} b ${markdown} c`
  const links = attachmentLinks(text)
  assert.equal(removeAttachment(text, links[1]), `a ${markdown} b  c`)
  assert.equal(removeAttachment(text, { ...links[1], start: 0 }), text)
})

// 必要な DOM とイベントだけを実装する。サーバーもブラウザも起動しない。
function harness(classes = ['thread-input cbox-input']) {
  let mutations = 0
  class Element {
    constructor(tag = 'div') {
      this.tag = tag
      this.children = []
      this.attrs = {}
      this.dataset = {}
      this.listeners = {}
      this.className = ''
      this.parentElement = null
      this.text = ''
    }
    get classList() {
      return {
        contains: (name) => this.className.split(' ').includes(name),
        toggle: (name, on) => {
          this.className = this.className.split(' ').filter((x) => x !== name).concat(on ? [name] : []).join(' ')
          mutations++
        },
      }
    }
    get nextElementSibling() { return this.parentElement?.children[this.parentElement.children.indexOf(this) + 1] }
    get previousElementSibling() { return this.parentElement?.children[this.parentElement.children.indexOf(this) - 1] }
    get textContent() { return this.text + this.children.map((x) => x.textContent).join('') }
    set textContent(value) { this.text = value; this.children = []; mutations++ }
    setAttribute(key, value) { this.attrs[key] = value; mutations++ }
    getAttribute(key) { return this.attrs[key] ?? null }
    hasAttribute(key) { return key in this.attrs }
    matches(selector) {
      return selector.split(', ').some((part) => {
        const [tag, ...classes] = part.split('.')
        return (!tag || tag === this.tag) && classes.every((c) => this.classList.contains(c))
      })
    }
    closest(selector) {
      if (selector === '.thread[data-thread-id]') return this.thread ?? this.parentElement?.closest(selector) ?? null
      return this.matches(selector) ? this : this.parentElement?.closest(selector) ?? null
    }
    querySelectorAll(selector) {
      return this.children.flatMap((child) => [child, ...child.querySelectorAll('*')])
        .filter((child) => selector === '*' || child.matches(selector))
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null }
    append(...children) {
      for (const child of children) {
        if (child.parentElement) child.remove()
        child.parentElement = this
        this.children.push(child)
      }
      mutations++
    }
    replaceChildren() { for (const child of this.children) child.parentElement = null; this.children = []; this.text = ''; mutations++ }
    insertAdjacentElement(position, child) {
      assert.equal(position, 'afterend')
      if (child.parentElement) child.remove()
      child.parentElement = this.parentElement
      this.parentElement.children.splice(this.parentElement.children.indexOf(this) + 1, 0, child)
      mutations++
    }
    remove() { this.parentElement.children.splice(this.parentElement.children.indexOf(this), 1); this.parentElement = null; mutations++ }
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) }
    dispatchEvent(event) { event.target = this; for (const listener of this.listeners[event.type] ?? []) listener(event); return true }
  }
  class Textarea extends Element {
    constructor() { super('textarea'); this.selectionStart = 0; this.selectionEnd = 0; this.setterCalls = 0 }
    get value() { return this.currentValue ?? '' }
    set value(value) { this.currentValue = value; this.setterCalls++ }
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end }
  }
  const root = new Element()
  const inputs = classes.map((className) => {
    const input = new Textarea()
    input.className = className
    root.append(input)
    return input
  })
  const body = new Element()
  body.className = 'cmt-body'
  const message = new Element()
  message.className = 'cmt'
  message.append(body)
  const thread = new Element()
  thread.className = 'thread'
  thread.dataset.threadId = 't1'
  thread.querySelectorAll = (selector) => selector === '.cmt:not(.thread-message-pending)' ? [message] : Element.prototype.querySelectorAll.call(thread, selector)
  thread.append(message)
  body.thread = thread
  root.append(thread)
  const ready = []
  let mount
  let fail = false
  let uploaded = 0
  let deferred
  const uploads = []
  const scheduled = []
  let reviewText = `[写真](${attachmentPath})`
  const storage = { getItem: () => null, setItem() {}, removeItem() {} }
  const context = {
    document: {
      readyState: 'loading', documentElement: { setAttribute() {} }, body: root,
      createElement: (tag) => new Element(tag),
      addEventListener: (type, fn) => { if (type === 'DOMContentLoaded') ready.push(fn) },
      querySelector: () => null,
      querySelectorAll: (selector) => {
        if (selector === 'textarea.thread-input' || selector === '.thread[data-thread-id]') return []
        return root.querySelectorAll(selector)
      },
    },
    localStorage: storage, sessionStorage: storage,
    HTMLElement: Element, Element, HTMLButtonElement: Element, HTMLTextAreaElement: Textarea,
    Event: class { constructor(type, options) { this.type = type; this.bubbles = options.bubbles } },
    MutationObserver: class { constructor(fn) { mount = fn } observe() {} },
    location: { href: 'http://localhost:3000/', origin: 'http://localhost:3000' }, URL,
    setTimeout: (fn) => scheduled.push(fn),
    fetch: async (url, options) => {
      if (url === '/api/review') return { ok: true, clone: () => ({ json: async () => ({ threads: [{ id: 't1', messages: [{ text: reviewText }] }] }) }) }
      assert.equal(url, '/api/plugin/attachments')
      uploads.push(options)
      if (deferred) await deferred
      if (fail) return { ok: false, status: 413 }
      const path = uploaded++ === 0 ? attachmentPath : otherPath
      return { ok: true, json: async () => ({ path }) }
    },
  }
  vm.runInNewContext(source, context)
  ready[0]()
  return { root, inputs, body, message, context, mount: () => mount(), mutations: () => mutations, uploads,
    setFail: () => { fail = true }, defer: (promise) => { deferred = promise },
    setReview: (text) => { reviewText = text }, flush: () => { while (scheduled.length) scheduled.shift()() } }
}
function transfer(input, type, files, text = '') {
  let prevented = false
  const event = { type, preventDefault: () => { prevented = true } }
  event[type === 'paste' ? 'clipboardData' : 'dataTransfer'] = { files, getData: (format) => format === 'text/plain' ? text : '' }
  input.dispatchEvent(event)
  return prevented
}
const settle = () => new Promise((resolve) => setImmediate(resolve))

test('drop and paste upload from all three composers through the native setter and a bubbling input', async () => {
  for (const className of ['thread-input cbox-input', 'cmt-edit-input', 'thread-input']) {
    const h = harness([className])
    const [input] = h.inputs
    input.value = 'before after'
    input.setSelectionRange(7, 7)
    const events = []
    input.addEventListener('input', (event) => events.push(event))
    const file = { name: '写真.png', type: 'image/png', size: 12 }
    assert.equal(transfer(input, 'drop', [file]), true)
    assert.match(input.nextElementSibling.textContent, /送信中/)
    await settle()
    assert.equal(h.uploads[0].method, 'POST')
    assert.equal(h.uploads[0].body, file)
    assert.equal(h.uploads[0].headers['x-diffo-filename'], encodeURIComponent(file.name))
    assert.equal(input.value, `before [写真.png](${attachmentPath}) after`)
    assert.equal(events[0].bubbles, true)
    assert.equal(input.setterCalls, 2)
    assert.equal(input.nextElementSibling.querySelectorAll('img').length, 1)
    assert.equal(transfer(input, 'paste', [{ name: 'notes.txt', size: 2 }]), true)
    await settle()
    assert.ok(input.value.includes(`[notes.txt](${otherPath})`))
    assert.equal(input.nextElementSibling.querySelectorAll('.diffo-attachment-card').length, 2)
  }
})

test('paste with text and files preserves native text paste without uploading; drop still uploads', async () => {
  for (const className of ['thread-input cbox-input', 'cmt-edit-input', 'thread-input']) {
    const h = harness([className])
    const [input] = h.inputs
    input.value = 'before'
    const files = [{ name: 'photo.png', size: 1 }]
    for (const text of ['copied text', ' ']) {
      assert.equal(transfer(input, 'paste', files, text), false)
      await settle()
      assert.equal(h.uploads.length, 0)
      assert.equal(input.value, 'before')
      assert.equal(input.nextElementSibling.querySelectorAll('.diffo-attachment-card').length, 0)
    }
    assert.equal(transfer(input, 'drop', files, 'copied text'), true)
    await settle()
    assert.equal(h.uploads.length, 1)
  }
})

test('attachment editor mounts are stable, remove buttons edit text, manual edits clear previews', async () => {
  const h = harness()
  const [input] = h.inputs
  transfer(input, 'paste', [{ name: 'photo.png', size: 1 }])
  await settle()
  h.mount()
  const before = h.mutations()
  h.mount()
  assert.equal(h.mutations(), before)
  assert.equal(input.listeners.drop.length, 1)
  input.nextElementSibling.querySelector('button').dispatchEvent({ type: 'click' })
  assert.equal(input.value.trim(), '')
  assert.equal(input.nextElementSibling.querySelectorAll('img').length, 0)
  input.value = `[photo](${attachmentPath})`
  input.dispatchEvent({ type: 'input' })
  assert.equal(input.nextElementSibling.querySelectorAll('img').length, 1)
  input.value = ''
  input.dispatchEvent({ type: 'input' })
  assert.equal(input.nextElementSibling.querySelectorAll('img').length, 0)
  input.remove()
  h.mount()
  assert.equal(h.root.querySelectorAll('.diffo-attachment-editor').length, 0)
})

test('plain text paste is untouched, failed or oversized uploads show errors without inserting links', async () => {
  const h = harness()
  const [input] = h.inputs
  assert.equal(transfer(input, 'paste', []), false)
  h.setFail()
  transfer(input, 'drop', [{ name: 'x.png', size: 2 }])
  await settle()
  assert.equal(input.value, '')
  assert.match(input.nextElementSibling.textContent, /送信に失敗.*413/)
  transfer(input, 'paste', [{ name: 'large.png', size: 20 * 1024 * 1024 + 1 }])
  await settle()
  assert.equal(h.uploads.length, 1)
  assert.match(input.nextElementSibling.textContent, /20 MiB/)
})

test('typing during upload is preserved at the current cursor', async () => {
  const h = harness()
  const [input] = h.inputs
  let finish
  h.defer(new Promise((resolve) => { finish = resolve }))
  transfer(input, 'drop', [{ name: 'photo.png', size: 1 }])
  await settle()
  input.value = 'typed later'
  input.setSelectionRange(input.value.length, input.value.length)
  finish()
  await settle()
  assert.equal(input.value, `typed later [photo.png](${attachmentPath}) `)
})

test('posted attachments recover sanitized hrefs from original review text and stay stable across rerenders', async () => {
  const h = harness([])
  const link = new h.context.Element('a')
  link.textContent = '写真'
  h.body.append(link) // sanitize は a を残し、絶対パスの href を消す。
  await h.context.fetch('/api/review')
  h.mount()
  assert.equal(link.getAttribute('href'), '/api/plugin/attachments/123-abc-photo.png')
  assert.equal(h.body.nextElementSibling.querySelector('img').src, '/api/plugin/attachments/123-abc-photo.png')
  assert.equal(h.body.nextElementSibling.querySelector('a').target, '_blank')
  const before = h.mutations()
  h.mount()
  assert.equal(h.mutations(), before)
  h.body.replaceChildren()
  const fresh = new h.context.Element('a')
  fresh.textContent = '写真'
  h.body.append(fresh)
  h.mount()
  assert.equal(fresh.getAttribute('href'), '/api/plugin/attachments/123-abc-photo.png')
  assert.equal(h.message.querySelectorAll('.diffo-comment-attachments').length, 1)
  // 同じラベルでパスだけを編集すると sanitize 後の HTML は変わらない。
  h.setReview(`[写真](${otherPath})`)
  await h.context.fetch('/api/review')
  h.flush()
  assert.equal(fresh.getAttribute('href'), '/api/plugin/attachments/124-abc-notes.txt')
  assert.equal(h.body.nextElementSibling.querySelectorAll('img').length, 0)
  h.setReview('添付を削除')
  await h.context.fetch('/api/review')
  h.flush()
  assert.equal(h.message.querySelectorAll('.diffo-comment-attachments').length, 0)
})
