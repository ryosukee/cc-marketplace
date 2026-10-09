(() => {
  'use strict';
  const init = () => document.querySelectorAll('[data-state-machine]').forEach(root => {
    if (root.dataset.initialized) return;
    const source = JSON.parse(root.querySelector('[data-state-machine-source]').textContent);
    const states = new Map(source.nodes.map(n => [n.id, n]));
    const transitions = new Map(source.transitions.map(t => [t.id, t]));
    const actors = new Map(source.participants.map((a, i) => [a.id, { ...a, position: (i + .5) / source.participants.length * 100 }]));
    const initial = source.initial;
    let start = initial, current = initial, history = [];
    const $ = s => root.querySelector(s), all = s => [...root.querySelectorAll(s)];
    const element = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; if (text !== undefined) n.textContent = text; return n; };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rows = $('[data-sequence-rows]');
    const render = () => {
      all('.rsv-flash').forEach(n => n.classList.remove('rsv-flash'));
      root.dataset.startState = start; root.dataset.currentState = current;
      $('[data-start-label]').textContent = states.get(start).label;
      $('[data-current-label]').textContent = states.get(current).label;
      $('[data-current-description]').textContent = states.get(current).description;
      all('[data-node-state]').forEach(n => {
        const state = states.get(n.dataset.nodeState);
        n.dataset.current = String(state.id === current); n.dataset.start = String(state.id === start);
        n.setAttribute('aria-label', state.label + 'から試す。' + state.description + (state.id === current ? '。現在の状態' : ''));
      });
      all('[data-transition]').forEach(button => {
        const t = transitions.get(button.dataset.transition), enabled = t.from === current;
        button.setAttribute('aria-disabled', String(!enabled)); button.tabIndex = enabled ? 0 : -1;
        button.setAttribute('aria-label', states.get(t.from).label + 'から' + t.event + ' · ' + t.result + (enabled ? '' : '。現在は実行不可'));
      });
      all('[data-transitions]').forEach(p => {
        const ids = p.dataset.transitions.split(' ');
        p.dataset.enabled = String(ids.some(id => transitions.get(id).from === current));
        p.dataset.latest = String(Boolean(history.length && ids.includes(history.at(-1).id)));
      });
      rows.replaceChildren();
      for (const actor of actors.values()) { const line = element('li','rsv-lifeline');line.style.left = actor.position + '%';line.setAttribute('aria-hidden','true');line.setAttribute('role','presentation');rows.append(line); }
      const first = element('li','rsv-record'); first.dataset.kind = 'start';
      const caption = element('div','rsv-caption');caption.append(element('span','','開始 · ' + states.get(start).label));first.append(caption);
      if (!history.length) { const local = element('p','rsv-local');local.append(element('span','','まだ操作を実行していません。'));first.append(local); }
      rows.append(first);
      history.forEach((t, index) => {
        const row = element('li','rsv-record');Object.assign(row.dataset,{kind:'action',transition:t.id,from:t.from,to:t.to,step:String(index+1)});
        const cap = element('div','rsv-caption');cap.append(element('span','',`${index+1} · ${t.event} · ${t.result}`),element('span','',states.get(t.from).label+' → '+states.get(t.to).label));row.append(cap);
        if (t.local) { const local = element('p','rsv-local');local.append(element('span','',t.local));row.append(local); }
        t.messages.forEach((m, i) => {
          const from=actors.get(m.from),to=actors.get(m.to),message=element('div','rsv-message');
          Object.assign(message.dataset,{message:String(i+1),fromActor:from.id,toActor:to.id});
          const description=element('span','rsv-message-description',from.label+'から'+to.label+'へ：'+m.label);
          const label=element('span','rsv-message-text',m.label);label.setAttribute('aria-hidden','true');
          const wire=element('span','rsv-message-wire');wire.style.left=Math.min(from.position,to.position)+'%';wire.style.right=(100-Math.max(from.position,to.position))+'%';
          wire.dataset.direction=from.position>to.position?'back':'forward';wire.setAttribute('aria-hidden','true');
          if (from.id===to.id) { wire.classList.add('rsv-message-self');wire.style.right='auto';wire.style.width='24px'; }
          message.append(description,label,wire);row.append(message);
        });rows.append(row);
      });
      $('[data-sequence-count]').textContent = `実行 ${history.length} 回 · 通信 ${history.reduce((n,t)=>n+t.messages.length,0)} 件`;
    };
    const activate = button => {
      if (button.matches('[data-reset-initial]')) { start=initial;current=initial;history=[];render();return; }
      if (button.matches('[data-layout-option]')) { root.dataset.layout=button.dataset.layoutOption;all('[data-layout-option]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));return; }
      if (button.matches('[data-node-state]')) { start=button.dataset.nodeState;current=start;history=[];render();return; }
      const t=transitions.get(button.dataset.transition);if (!t || t.from!==current) return;
      history.push(t);current=t.to;render();
      // Keep focus within available controls after the triggering branch becomes disabled.
      const next=all('[data-transition]').find(b=>b.getAttribute('aria-disabled')==='false') || all('[data-node-state]').find(b=>b.dataset.nodeState===current);
      if (button.tabIndex===-1) next?.focus({preventScroll:true});
      if (!reduced.matches) { const node=all('[data-node-state]').find(b=>b.dataset.nodeState===current);void node.getBoundingClientRect();node.classList.add('rsv-flash'); }
    };
    const selector='[data-node-state],[data-transition],[data-layout-option],[data-reset-initial]';
    root.addEventListener('click',event=>{event.stopPropagation();const button=event.target.closest(selector);if(button&&root.contains(button)){event.preventDefault();activate(button);}});
    // Native buttons synthesize click for Enter/Space; stopping propagation keeps page-level shortcuts separate.
    root.addEventListener('keydown',event=>event.stopPropagation());
    for (const kind of ['input','change','keyup']) root.addEventListener(kind,event=>event.stopPropagation());
    root.addEventListener('animationend',event=>event.target.closest('.rsv-node')?.classList.remove('rsv-flash'));
    reduced.addEventListener('change',()=>{if(reduced.matches)all('.rsv-flash').forEach(n=>n.classList.remove('rsv-flash'));});
    root.dataset.initialized='true';render();
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
