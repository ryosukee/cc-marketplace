/* 順位と数値の回答、回答を参照する説明。下書きとコピーは form runtime が扱う。 */
(() => {
  'use strict';
  const groups = [...document.querySelectorAll('[data-answer-type]')];
  const conditions = [...document.querySelectorAll('.conditional[data-when]')];
  const states = new Map();
  const sameOrder = (order, values) => Array.isArray(order) && order.length === values.length
    && new Set(order).size === values.length && order.every(v => typeof v === 'string' && values.includes(v));
  // scripts/lib/answer-controls.mjs の numberGridIndex と同じ計算を使う。
  const numberGridIndex = (value, spec) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || !spec) return null;
    if (value < spec.min || value > spec.max) return null;
    const steps = (value - spec.min) / spec.step;
    if (!Number.isFinite(steps)) return null;
    const index = Math.round(steps);
    const scale = Math.max(1, Math.abs(steps), Math.abs(value / spec.step), Math.abs(spec.min / spec.step));
    const tolerance = Math.min(0.125, 4 * Number.EPSILON * scale);
    return Math.abs(steps - index) <= tolerance ? index : null;
  };
  const changed = () => document.dispatchEvent(new CustomEvent('answer-controls-change'));
  groups.forEach(group => {
    const confirm = group.querySelector('[data-answer-confirm]');
    const readonly = confirm.disabled;
    const state = { group, confirmed: group.dataset.confirmed === 'true', readonly };
    states.set(group.id, state);
    confirm.hidden = false;
    const status = group.querySelector('.answer-control-status');
    const signal = message => { status.textContent = message; };
    if (group.dataset.answerType === 'rank') {
      const list = group.querySelector('.rank-list');
      state.values = [...list.children].map(row => row.dataset.rankValue);
      state.order = () => [...list.children].map(row => row.dataset.rankValue);
      state.paint = () => [...list.children].forEach((row, i) => {
        row.querySelector('[data-rank-up]').disabled = readonly || i === 0;
        row.querySelector('[data-rank-down]').disabled = readonly || i === list.children.length - 1;
      });
      const move = (row, index, focus) => {
        const rows = [...list.children], old = rows.indexOf(row);
        if (readonly || old === index || index < 0 || index >= rows.length) return;
        const active = document.activeElement;
        if (index < old) list.insertBefore(row, rows[index]);
        else list.insertBefore(row, rows[index].nextSibling);
        state.confirmed = true;
        state.paint();
        // 境界で押したボタンが disabled になったら、反対方向へ focus を移す。
        if (focus || row.contains(active)) (active?.disabled ? row.querySelector(index === 0 ? '[data-rank-down]' : '[data-rank-up]') : active)?.focus({ preventScroll: true });
        signal(row.querySelector('.rank-label').textContent + 'を' + (index + 1) + '位へ移動しました');
        changed();
      };
      [...list.children].forEach(row => {
        row.querySelector('.rank-actions').hidden = false;
        row.querySelector('[data-rank-up]').addEventListener('click', () => move(row, [...list.children].indexOf(row) - 1, true));
        row.querySelector('[data-rank-down]').addEventListener('click', () => move(row, [...list.children].indexOf(row) + 1, true));
        const handle = row.querySelector('[data-rank-drag]');
        let drag = null;
        const finish = commit => {
          if (!drag) return;
          const pending = drag; drag = null;
          row.classList.remove('is-dragging');
          list.querySelectorAll('.rank-drop-target').forEach(el => el.classList.remove('rank-drop-target'));
          if (handle.hasPointerCapture(pending.pointer)) handle.releasePointerCapture(pending.pointer);
          if (commit && pending.index != null) move(row, pending.index, false);
        };
        handle.addEventListener('pointerdown', event => {
          if (readonly || !event.isPrimary || event.button !== 0) return;
          handle.focus({ preventScroll: true });
          drag = { pointer: event.pointerId, index: null, y: event.clientY };
          handle.setPointerCapture(event.pointerId);
        });
        handle.addEventListener('pointermove', event => {
          if (!drag || drag.pointer !== event.pointerId || Math.abs(event.clientY - drag.y) < 4) return;
          row.classList.add('is-dragging');
          const rows = [...list.children];
          const index = rows.findIndex(el => event.clientY <= el.getBoundingClientRect().bottom);
          drag.index = index < 0 ? rows.length - 1 : index;
          rows.forEach((el, i) => el.classList.toggle('rank-drop-target', i === drag.index && el !== row));
        });
        handle.addEventListener('pointerup', () => finish(true));
        handle.addEventListener('pointercancel', () => finish(false));
        handle.addEventListener('lostpointercapture', () => finish(false));
        handle.addEventListener('keydown', event => {
          if (event.key === 'Escape') finish(false);
        });
      });
      state.restore = data => {
        if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(k => !['order', 'confirmed'].includes(k))
          || typeof data.confirmed !== 'boolean' || !sameOrder(data.order, state.values)) return;
        const rows = [...list.children];
        data.order.forEach(value => list.append(rows.find(row => row.dataset.rankValue === value)));
        state.confirmed = data.confirmed; state.paint();
      };
      state.snapshot = () => ({ order: state.order(), confirmed: state.confirmed });
      state.reset = () => { state.restore({ order: state.values, confirmed: false }); signal(''); };
      state.answer = () => state.confirmed && sameOrder(state.order(), state.values) ? '順位: ' + JSON.stringify({ order: state.order() }) : null;
      state.paint();
    } else {
      const spec = JSON.parse(group.dataset.numberSpec);
      const input = group.querySelector('[data-number-input]');
      const range = group.querySelector('[data-number-range]');
      const error = group.querySelector('.number-error');
      const valid = () => input.value !== '' && !input.validity.badInput && numberGridIndex(input.valueAsNumber, spec) !== null;
      state.paint = () => {
        const ok = valid();
        input.setAttribute('aria-invalid', String(!ok));
        error.textContent = ok ? '' : spec.min + '〜' + spec.max + 'の範囲で、' + spec.step + '刻みの数値を入力してください';
        confirm.disabled = readonly || !ok;
        if (ok) range.value = input.value;
      };
      input.addEventListener('input', () => {
        if (readonly) return;
        // 一度触った入力は、無効な間も下書きに保持する。回答の確定は valid() で別に判定する。
        state.confirmed = true; state.paint();
      });
      range.addEventListener('input', () => { if (!readonly) { input.value = range.value; state.confirmed = true; state.paint(); } });
      state.restore = data => {
        if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(k => !['raw', 'confirmed'].includes(k))
          || typeof data.raw !== 'string' || typeof data.confirmed !== 'boolean') return;
        input.value = data.raw;
        state.confirmed = data.confirmed;
        state.paint();
      };
      state.snapshot = () => ({ raw: input.value, confirmed: state.confirmed });
      state.reset = () => { state.restore({ raw: String(spec.initial), confirmed: false }); signal(''); };
      state.answer = () => state.confirmed && valid() ? '数値: ' + JSON.stringify({ value: input.valueAsNumber }) : null;
      state.matches = value => state.confirmed && valid() && numberGridIndex(input.valueAsNumber, spec) === numberGridIndex(value, spec);
      state.invalid = () => !valid();
      state.focusInvalid = () => {
        const card = group.closest('.qd');
        if (card) card.open = true;
        input.focus(); input.reportValidity();
      };
      state.paint();
    }
    confirm.addEventListener('click', () => {
      if (readonly || confirm.disabled) return;
      state.confirmed = true;
      signal(group.dataset.answerType === 'rank' ? 'この順序で回答しました' : 'この値で回答しました');
      changed();
    });
  });
  const conditionStates = conditions.map(el => ({ el, when: JSON.parse(el.dataset.when), matched: null }));
  const matches = when => {
    const group = document.getElementById(when.question);
    if (!group) return false;
    const numeric = states.get(group.id);
    if (numeric) {
      return group.dataset.answerType === 'number' && numeric.matches(when.equals);
    }
    if (when.item) {
      const row = [...group.querySelectorAll('.radio-item')].find(el => el.dataset.item === when.item);
      return row?.querySelector('input:checked')?.value === when.equals;
    }
    return [...group.querySelectorAll('input:checked')].some(input => input.value === when.equals);
  };
  const updateConditions = () => conditionStates.forEach(state => {
    const match = matches(state.when);
    if (match !== state.matched) {
      // 同じ該当状態の間は、利用者が開いた他条件の説明を閉じ直さない。
      state.el.open = match; state.matched = match;
    }
    state.el.querySelector('.condition-state').textContent = match ? '該当する説明' : 'ほかの条件の説明';
  });
  let printStates = [];
  addEventListener('beforeprint', () => { printStates = conditions.map(el => [el, el.open]); conditions.forEach(el => { el.open = true; }); });
  addEventListener('afterprint', () => { printStates.forEach(([el, open]) => { el.open = open; }); printStates = []; });
  window.HTMLAnswerControls = {
    has: id => states.has(id), answer: id => states.get(id)?.answer() ?? null,
    snapshot: () => Object.fromEntries([...states].map(([id, state]) => [id, state.snapshot()])),
    restore: data => {
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;
      states.forEach((state, id) => { if (!state.readonly && Object.hasOwn(data, id)) state.restore(data[id]); });
    },
    reset: () => states.forEach(state => { if (!state.readonly) state.reset(); }),
    invalid: () => [...states.values()].some(state => state.invalid?.()),
    focusInvalid: () => [...states.values()].find(state => state.invalid?.())?.focusInvalid(),
    updateConditions,
  };
})();
