/* Rich reading controls and optional call-tree feedback. No form questions are added. */
(function () {
  'use strict';
  var popup = null, opener = null;
  function all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function own(node, selector) { return all(selector, node).find(function (el) { return el.closest('.call-node') === node; }); }
  function roots() { return all('.rich-calls[data-rich-id]'); }
  function nodes(tree) { return all('.call-node[data-node]', tree); }
  function readonly(tree) { return tree.dataset.answered === 'true'; }
  function parent(node, tree) { return nodes(tree).find(function (candidate) { return candidate.dataset.node === node.dataset.parent; }); }
  function ancestors(node, tree) {
    var result = [], seen = new Set([node]);
    for (var next = parent(node, tree); next && !seen.has(next); next = parent(next, tree)) { result.push(next); seen.add(next); }
    return result;
  }
  function descendants(node, tree) { return nodes(tree).filter(function (candidate) { return ancestors(candidate, tree).includes(node); }); }
  function rejected(node, tree) { return node.dataset.feedbackAction === 'reject' || ancestors(node, tree).some(function (a) { return a.dataset.feedbackAction === 'reject'; }); }
  function changed(node) { return ['added', 'modified', 'removed'].includes(node.dataset.status); }
  function announce() { document.dispatchEvent(new CustomEvent('rich-feedback-change')); }
  function refresh(tree) {
    var list = nodes(tree), kept = list.filter(function (node) { return changed(node) && !rejected(node, tree); });
    all('[data-call-count]', tree).forEach(function (el) { el.textContent = String(kept.length); });
    all('[data-file-count]', tree).forEach(function (el) { el.textContent = String(new Set(kept.map(function (node) { return node.dataset.file; }).filter(Boolean)).size); });
    list.forEach(function (node) {
      var inherited = ancestors(node, tree).find(function (a) { return a.dataset.feedbackAction === 'reject'; });
      node.dataset.rejected = String(rejected(node, tree));
      node.dataset.inherited = String(!!inherited);
      var proposal = own(node, '[data-proposal-toggle]'), reject = own(node, '[data-reject-toggle]');
      var editor = own(node, '.proposal-editor'), note = own(node, '[data-feedback-note]');
      var rejectionEditor = own(node, '.rejection-editor');
      var effect = own(node, '.call-effect');
      if (proposal) {
        proposal.disabled = readonly(tree);
        proposal.textContent = node.dataset.status === 'existing' ? 'この既存実装へ変更提案' : 'この変更に修正提案';
        proposal.setAttribute('aria-expanded', String(node.dataset.proposalOpen === 'true'));
      }
      if (reject) {
        reject.disabled = readonly(tree) || !!inherited;
        reject.textContent = node.dataset.feedbackAction === 'reject' ? '棄却を取り消す' : 'この変更を棄却';
        reject.setAttribute('aria-pressed', String(node.dataset.feedbackAction === 'reject'));
      }
      if (editor) editor.hidden = node.dataset.proposalOpen !== 'true';
      if (rejectionEditor) rejectionEditor.hidden = node.dataset.feedbackAction !== 'reject';
      if (note) note.disabled = readonly(tree) || (tree.dataset.interaction === 'reject' && !!inherited);
      if (effect) effect.textContent = inherited ? '親の棄却により対象外（' + (inherited.dataset.name || inherited.dataset.node) + '）' : node.dataset.feedbackAction === 'reject' ? 'この変更の棄却は配下の変更にも及ぶ' : '';
    });
  }
  function closeNote(focus) {
    var previous = opener;
    if (popup) { popup.hidden = true; popup.classList.remove('is-code-popup'); popup.style.left = ''; popup.style.top = ''; popup.removeAttribute('role'); }
    if (previous) previous.setAttribute('aria-expanded', 'false');
    popup = null; opener = null;
    if (focus && previous && previous.isConnected) previous.focus({ preventScroll: true });
  }
  function positionNote() {
    if (!popup || !opener || !opener.isConnected) { closeNote(false); return; }
    var rect = opener.getBoundingClientRect(), block = opener.closest('.rich-code, .rich-diff').getBoundingClientRect();
    var box = popup.getBoundingClientRect();
    var left = block.right + 12;
    if (left + box.width > innerWidth - 12) left = innerWidth - box.width - 12;
    popup.style.left = Math.max(12, left) + 'px';
    popup.style.top = Math.max(12, Math.min(rect.top, innerHeight - box.height - 12)) + 'px';
  }
  function enhance(root) {
    all('.rich-code, .rich-diff', root).forEach(function (block) {
      // Clone-safe: initialization is idempotent and handlers are delegated below.
      all('.code-note', block).forEach(function (note) { if (note !== popup) note.hidden = true; });
      all('[data-code-note]', block).forEach(function (button) {
        button.setAttribute('aria-expanded', String(button === opener)); button.setAttribute('aria-haspopup', 'dialog');
      });
    });
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest('button');
    if (!target) return;
    if (target.matches('[data-code-note-close]')) { closeNote(true); return; }
    var block = target.closest('.rich-code, .rich-diff');
    if (block && target.matches('[data-code-note]')) {
      if (opener === target) { closeNote(true); return; }
      closeNote(false);
      var note = all('.code-note[data-note-line]', block).find(function (el) { return el.dataset.noteLine === target.dataset.codeNote; });
      if (!note) return;
      popup = note; opener = target;
      popup.classList.add('is-code-popup'); popup.hidden = false; popup.setAttribute('role', 'dialog');
      var heading = popup.querySelector('h4'); if (heading) popup.setAttribute('aria-label', heading.textContent);
      target.setAttribute('aria-expanded', 'true'); positionNote();
      var close = popup.querySelector('[data-code-note-close]');
      if (close) close.focus({ preventScroll: true });
      return;
    }
    if (block && target.matches('[data-wrap-toggle]')) {
      block.dataset.wrap = String(block.dataset.wrap !== 'true');
      target.setAttribute('aria-pressed', block.dataset.wrap);
      target.textContent = block.dataset.wrap === 'true' ? '横スクロールに戻す' : '折り返す';
      return;
    }
    if (block && target.matches('[data-diff-mode]')) {
      all('[data-diff-view]', block).forEach(function (view) { view.hidden = view.dataset.diffView !== target.dataset.diffMode; });
      all('[data-diff-mode]', block).forEach(function (button) { button.setAttribute('aria-pressed', String(button === target)); });
      block.dataset.diffMode = target.dataset.diffMode; return;
    }
    var node = target.closest('.call-node'), tree = target.closest('.rich-calls');
    if (!node || !tree || readonly(tree)) return;
    if (target.matches('[data-proposal-toggle]') && tree.dataset.interaction === 'propose') {
      node.dataset.proposalOpen = String(node.dataset.proposalOpen !== 'true');
      refresh(tree);
      if (node.dataset.proposalOpen === 'true') { var noteInput = own(node, '[data-feedback-note]'); if (noteInput) noteInput.focus({ preventScroll: true }); }
      announce();
      return;
    }
    if (target.matches('[data-reject-toggle]') && tree.dataset.interaction === 'reject' && changed(node) && !ancestors(node, tree).some(function (a) { return a.dataset.feedbackAction === 'reject'; })) {
      node.dataset.feedbackAction = node.dataset.feedbackAction === 'reject' ? '' : 'reject';
      refresh(tree); announce();
    }
  });
  document.addEventListener('input', function (event) {
    if (!event.target.matches('[data-feedback-note]')) return;
    var node = event.target.closest('.call-node'), tree = event.target.closest('.rich-calls');
    if (!node || !tree || readonly(tree) || tree.dataset.interaction === 'none') return;
    if (tree.dataset.interaction === 'propose') node.dataset.feedbackAction = event.target.value.trim() ? (changed(node) ? 'revise' : 'change') : '';
    announce();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && popup) { event.preventDefault(); event.stopImmediatePropagation(); closeNote(true); }
  }, true);
  document.addEventListener('pointerdown', function (event) { if (popup && !popup.contains(event.target) && !opener.contains(event.target)) closeNote(false); });
  window.addEventListener('resize', positionNote);
  window.addEventListener('beforeprint', function () { closeNote(false); });
  document.addEventListener('scroll', function () { if (popup) positionNote(); }, true);
  enhance(document); roots().forEach(refresh);
  new MutationObserver(function (changes) {
    changes.forEach(function (change) { Array.prototype.forEach.call(change.addedNodes, function (node) { if (node.nodeType === 1) { if (node.matches('.rich-code, .rich-diff')) enhance(node.parentNode); else enhance(node); } }); });
  }).observe(document.body, { childList: true, subtree: true });
  window.HTMLCodeFeedback = {
    snapshot: function () {
      var result = [];
      roots().forEach(function (tree) { nodes(tree).forEach(function (node) {
        var note = own(node, '[data-feedback-note]');
        result.push({ tree: tree.dataset.richId, node: node.dataset.node, rejected: node.dataset.feedbackAction === 'reject', text: note ? note.value : (node.dataset.feedbackText || ''), open: node.dataset.proposalOpen === 'true' });
      }); });
      return result;
    },
    restoreDraft: function (records) {
      if (!Array.isArray(records)) return;
      records.forEach(function (record) {
        if (!record || typeof record.text !== 'string' || typeof record.rejected !== 'boolean' || typeof record.open !== 'boolean') return;
        var tree = roots().find(function (root) { return root.dataset.richId === record.tree; });
        if (!tree || readonly(tree) || !['propose', 'reject'].includes(tree.dataset.interaction)) return;
        var node = nodes(tree).find(function (item) { return item.dataset.node === record.node; });
        if (!node || (record.rejected && (!changed(node) || tree.dataset.interaction !== 'reject'))) return;
        node.dataset.feedbackAction = tree.dataset.interaction === 'reject' ? (record.rejected ? 'reject' : '') : record.text.trim() ? (changed(node) ? 'revise' : 'change') : '';
        node.dataset.proposalOpen = String(record.open);
        var note = own(node, '[data-feedback-note]'); if (note) note.value = record.text;
      });
      roots().forEach(refresh);
    },
    export: function () {
      var records = [];
      roots().forEach(function (tree) { nodes(tree).forEach(function (node) {
        var action = node.dataset.feedbackAction, note = own(node, '[data-feedback-note]'), text = note ? (typeof note.value === 'string' ? note.value : note.textContent) : (node.dataset.feedbackText || '');
        if (!['revise', 'change', 'reject'].includes(action) || (action !== 'reject' && !text.trim())) return;
        var record = { tree: tree.dataset.richId, node: node.dataset.node, action: action, text: text };
        if (action === 'reject') record.affected = descendants(node, tree).map(function (child) { return child.dataset.node; });
        records.push(record);
      }); });
      return records;
    },
    restore: function (records) {
      if (!Array.isArray(records)) return;
      records.forEach(function (record) {
        if (!record || typeof record.text !== 'string') return;
        var tree = roots().find(function (root) { return root.dataset.richId === record.tree; });
        if (!tree || readonly(tree)) return;
        var node = nodes(tree).find(function (item) { return item.dataset.node === record.node; });
        if (!node) return;
        var valid = tree.dataset.interaction === 'reject' ? record.action === 'reject' && changed(node) : tree.dataset.interaction === 'propose' && record.action === (changed(node) ? 'revise' : 'change');
        if (!valid || (record.action !== 'reject' && !record.text.trim())) return;
        node.dataset.feedbackAction = record.action;
        var note = own(node, '[data-feedback-note]');
        if (note) { note.value = record.text; node.dataset.proposalOpen = String(!!record.text.trim()); }
      });
      roots().forEach(refresh);
    },
    reset: function () {
      roots().forEach(function (tree) {
        if (readonly(tree)) return;
        nodes(tree).forEach(function (node) { node.dataset.feedbackAction = ''; node.dataset.proposalOpen = 'false'; var note = own(node, '[data-feedback-note]'); if (note) note.value = ''; });
        refresh(tree);
      });
      announce();
    }
  };
})();
