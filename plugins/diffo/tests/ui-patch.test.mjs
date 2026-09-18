import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ui = readFileSync(path.join(root, 'assets/diffo-ui.js'), 'utf8');

test('LGTM appends its shutdown contract and submits through Finish & send', async () => {
  class Element {
    constructor() {
      this.childNodes = [];
      this.listeners = {};
      this.disabled = false;
    }

    addEventListener(type, listener) {
      this.listeners[type] = listener;
    }

    set textContent(value) {
      this.childNodes = [{ nodeType: 3, textContent: value }];
    }

    closest() {
      return null;
    }
  }

  class HTMLElement extends Element {}
  class HTMLButtonElement extends HTMLElement {
    click() {
      this.listeners.click?.();
    }

    insertAdjacentElement(_position, element) {
      footer.lgtm = element;
    }
  }
  class HTMLTextAreaElement extends HTMLElement {
    get value() {
      return this.currentValue ?? '';
    }

    set value(value) {
      this.currentValue = value;
    }

    dispatchEvent() {}
  }

  const note = new HTMLTextAreaElement();
  note.value = '補足コメント';
  const finish = new HTMLButtonElement();
  finish.textContent = 'Finish & send';
  let submitted = 0;
  finish.addEventListener('click', () => submitted++);

  const footer = new HTMLElement();
  footer.querySelectorAll = () => (footer.lgtm ? [footer.lgtm, finish] : [finish]);
  footer.querySelector = () => footer.lgtm ?? null;
  const modal = new HTMLElement();
  modal.querySelector = (selector) => {
    if (selector === '.modal-foot') return footer;
    if (selector === 'textarea.fin-note') return note;
    return null;
  };
  modal.querySelectorAll = (selector) =>
    selector === '.modal-foot button' ? footer.querySelectorAll() : [];
  const ready = [];
  const document = {
    readyState: 'loading',
    documentElement: { setAttribute() {} },
    body: {},
    addEventListener(type, listener) {
      if (type === 'DOMContentLoaded') ready.push(listener);
    },
    querySelector(selector) {
      return selector === '.modal[aria-label="Finish review"]' ? modal : null;
    },
    querySelectorAll() {
      return [];
    },
    createElement(tag) {
      assert.equal(tag, 'button');
      return new HTMLButtonElement();
    },
  };
  const storage = { getItem: () => null, setItem() {}, removeItem() {} };

  vm.runInNewContext(ui, {
    document,
    Node: { TEXT_NODE: 3 },
    Element,
    HTMLElement,
    HTMLButtonElement,
    HTMLTextAreaElement,
    Event: class {},
    MouseEvent: class {},
    MutationObserver: class {
      observe() {}
    },
    localStorage: storage,
    sessionStorage: storage,
    setTimeout,
    WeakSet,
  });
  ready[0]();

  assert.equal(footer.lgtm.childNodes[0].textContent, 'LGTM');
  footer.lgtm.click();
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.match(note.value, /^補足コメント\n\nLGTM。レビューは完了です。/);
  assert.match(note.value, /`diffo end` を実行し、polling も終了してください/);
  assert.match(note.value, /このメッセージへの返信は不要です。$/);
  assert.equal(submitted, 1);
});

test('LGTM appends the review shutdown contract to the typed closing note', () => {
  assert.match(ui, /trimmed === '' \? lgtmMessage : `\$\{trimmed\}\\n\\n\$\{lgtmMessage\}`/);
  assert.match(ui, /`diffo end` を実行し、polling も終了してください/);
  assert.match(ui, /このメッセージへの返信は不要です/);
});
