/* Prototype only. Keep the form controls and footnote source nodes intact. */
(() => {
  'use strict';
  document.body.classList.add('two-pane-trial');
  const pane = document.getElementById('q-pane');
  const bar = document.getElementById('bar');
  const menu = document.getElementById('answer-menu');
  if (pane && bar) {
    const menuActions = document.createElement('div');
    menuActions.className = 'answer-menu-actions';
    menuActions.append(menu.querySelector('#reset'));
    bar.querySelector('#bar-in').append(bar.querySelector('#back'));
    menu.append(menuActions);
    const list = document.createElement('div');
    list.id = 'question-list';
    while (pane.firstChild) list.append(pane.firstChild);
    pane.append(list);
    const home = document.createComment('answer-controls-home');
    bar.before(home);
    const wide = matchMedia('(min-width: 1024px)');
    const place = () => {
      if (wide.matches) pane.append(bar);
      else home.after(bar);
    };
    wide.addEventListener('change', place);
    place();
    // The auxiliary menu must not be clipped by the questions' scroll area.
    document.body.append(menu);
    const positionMenu = () => {
      if (menu.hidden) return;
      const rect = bar.getBoundingClientRect();
      const width = Math.min(420, innerWidth - 24);
      menu.style.width = width + 'px';
      menu.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
      menu.style.right = 'auto';
      menu.style.bottom = Math.max(12, innerHeight - rect.top + 8) + 'px';
      menu.style.maxHeight = Math.max(160, rect.top - 24) + 'px';
    };
    new MutationObserver(positionMenu).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
    addEventListener('resize', positionMenu);
  }
  const notes = document.getElementById('fn-pane');
  const toggle = document.getElementById('fn-toggle');
  if (!notes || !toggle) return;
  const home = document.createComment('footnotes-home');
  notes.before(home);
  const drawer = document.createElement('dialog');
  drawer.id = 'fn-drawer';
  drawer.setAttribute('aria-labelledby', 'fn-drawer-title');
  const top = document.createElement('div'); top.className = 'fn-drawer-top';
  const heading = document.createElement('h2'); heading.id = 'fn-drawer-title'; heading.textContent = '脚注と補足';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'subbtn'; close.textContent = '閉じる';
  top.append(heading, close); drawer.append(top, notes); document.body.append(drawer);
  notes.hidden = false;
  toggle.hidden = false; toggle.setAttribute('aria-controls', 'fn-drawer');
  toggle.setAttribute('aria-haspopup', 'dialog'); toggle.setAttribute('aria-expanded', 'false');
  let opener = toggle, focusTarget = null, printing = false;
  const focusWithoutPreview = target => document.dispatchEvent(new CustomEvent('reference-focus', { detail: target }));
  const open = (target, source) => {
    if (!drawer.open) {
      opener = source || document.activeElement;
      const popupClose = document.getElementById('reading-popup-close');
      if (!document.getElementById('reading-popup').hidden) popupClose.click();
      drawer.showModal();
      document.documentElement.classList.add('fn-drawer-open');
      toggle.setAttribute('aria-expanded', 'true');
      close.focus({ preventScroll: true });
    }
    notes.querySelectorAll('.note-target').forEach(note => note.classList.remove('note-target'));
    if (target) {
      target.classList.add('note-target');
      notes.scrollTo({ top: notes.scrollTop + target.getBoundingClientRect().top - notes.getBoundingClientRect().top - 12 });
      target.setAttribute('tabindex', '-1');
      focusWithoutPreview(target);
    }
  };
  document.addEventListener('footnote-request', event => {
    const target = document.getElementById(event.detail.id);
    if (target && notes.contains(target)) open(target, event.detail.opener);
  });
  const shut = (target = null) => { focusTarget = target; if (drawer.open) drawer.close(); };
  toggle.addEventListener('click', () => open());
  close.addEventListener('click', () => shut());
  drawer.addEventListener('click', event => {
    if (event.target !== drawer) return;
    const r = drawer.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) shut();
  });
  drawer.addEventListener('close', () => {
    // Native dialog focus restoration can reopen the marker preview.
    if (!document.getElementById('reading-popup').hidden) document.getElementById('reading-popup-close').click();
    document.documentElement.classList.remove('fn-drawer-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (!printing) focusWithoutPreview(focusTarget || (opener?.isConnected ? opener : toggle));
    focusTarget = null;
  });
  notes.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target || notes.contains(target)) return;
    event.preventDefault();
    target.setAttribute('tabindex', '-1');
    shut(target);
    requestAnimationFrame(() => { target.scrollIntoView({ block: 'center' }); focusWithoutPreview(target); });
  });
  const revealHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && notes.contains(target)) open(target);
  };
  addEventListener('hashchange', revealHash);
  revealHash();
  addEventListener('beforeprint', () => {
    printing = true;
    shut();
    home.after(notes);
    notes.hidden = false;
  });
  addEventListener('afterprint', () => {
    drawer.append(notes);
    printing = false;
  });
})();
