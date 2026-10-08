// Progressive enhancement: without JavaScript the document is the complete reading view.
(function () {
  var frames = Array.from(document.querySelectorAll('.slide-frame'));
  var slides = frames.map(function (frame) { return frame.querySelector('.slide'); });
  var body = document.body;
  var tools = document.querySelector('.slide-tools');
  var prev = document.getElementById('slide-prev');
  var next = document.getElementById('slide-next');
  var position = document.getElementById('slide-position');
  var reading = document.getElementById('slide-reading');
  var still = document.getElementById('slide-static');
  var warning = document.getElementById('slide-fit-warning');
  var media = matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0, deck = true, staticMode = false;
  var progress = slides.map(function () { return 0; });
  var steps = slides.map(function (slide) { return Array.from(slide.querySelectorAll('[data-step]')); });
  var maxima = steps.map(function (items) { return items.reduce(function (max, el) { return Math.max(max, Number(el.dataset.step)); }, 0); });
  function allPoints() { return staticMode || media.matches || !deck; }
  function toolbarClearance() {
    document.documentElement.style.setProperty('--slide-tools-clearance', (tools.getBoundingClientRect().height + 16) + 'px');
  }
  function fit() {
    toolbarClearance();
    if (!deck || matchMedia('print').matches) return;
    var scale = document.getElementById('bd').clientWidth / 1280;
    body.style.setProperty('--slide-scale', scale);
    body.style.setProperty('--slide-frame-height', (720 * scale) + 'px');
  }
  // Measure full content, including unrevealed points. Visibility preserves its footprint.
  // The warning is explicit; overflow is never silently clipped or treated as a successful fit.
  function checkFit() {
    if (!deck || matchMedia('print').matches) return;
    body.setAttribute('data-fit-check', '');
    var bad = false;
    frames.forEach(function (frame, i) {
      var wasCurrent = frame.classList.contains('is-current');
      frame.classList.add('is-current');
      var slide = slides[i];
      var rect = slide.getBoundingClientRect();
      var scale = rect.width / 1280;
      var limitBottom = rect.bottom - 64 * scale;
      var limitRight = rect.right - 80 * scale;
      var overflow = slide.scrollHeight > 720 || slide.scrollWidth > 1280;
      Array.from(slide.querySelectorAll('*')).forEach(function (el) {
        if (!el.getClientRects().length || el.closest('.detail-content[hidden]')) return;
        var closed = el.closest('details:not([open])');
        if (closed && el !== closed) {
          var summary = closed.querySelector(':scope > summary');
          if (!summary || !summary.contains(el)) return;
        }
        var box = el.getBoundingClientRect();
        if (box.bottom > limitBottom + 1 || box.right > limitRight + 1 || box.left < rect.left + 79 * scale - 1) overflow = true;
        // Intentional table/pre scrolling is also too much content for a composed slide.
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth) overflow = true;
      });
      slide.toggleAttribute('data-overflow', overflow);
      bad = bad || overflow;
      if (!wasCurrent) frame.classList.remove('is-current');
    });
    warning.hidden = !bad;
    body.removeAttribute('data-fit-check');
  }
  function update() {
    body.dataset.view = deck ? 'deck' : 'reading';
    body.dataset.motion = allPoints() ? 'off' : 'on';
    frames.forEach(function (frame, i) {
      frame.classList.toggle('is-current', i === index);
      frame.inert = deck && i !== index;
      steps[i].forEach(function (el) {
        var concealed = !allPoints() && Number(el.dataset.step) > progress[i];
        el.toggleAttribute('data-unrevealed', concealed);
        el.inert = concealed;
        if (concealed) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
      });
    });
    prev.disabled = !deck || (index === 0 && (allPoints() || progress[index] === 0));
    next.disabled = !deck || (index === slides.length - 1 && (allPoints() || progress[index] >= maxima[index]));
    position.textContent = (index + 1) + ' / ' + slides.length + (!allPoints() && maxima[index] ? ' · 要点 ' + progress[index] + '/' + maxima[index] : '');
    reading.setAttribute('aria-pressed', String(!deck));
    still.setAttribute('aria-pressed', String(staticMode));
    fit();
  }
  function move(direction) {
    if (!deck || matchMedia('print').matches) return;
    if (direction > 0) {
      if (!allPoints() && progress[index] < maxima[index]) progress[index]++;
      else if (index < slides.length - 1) { index++; progress[index] = 0; }
    } else {
      if (!allPoints() && progress[index] > 0) progress[index]--;
      else if (index > 0) { index--; progress[index] = maxima[index]; }
    }
    update();
  }
  prev.addEventListener('click', function () { move(-1); });
  next.addEventListener('click', function () { move(1); });
  reading.addEventListener('click', function () {
    deck = !deck; update();
    if (!deck) slides[index].scrollIntoView({ block: 'start' });
    else checkFit();
  });
  still.addEventListener('click', function () { staticMode = !staticMode; update(); });
  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !deck) return;
    if (document.querySelector('dialog[open]') || !document.getElementById('reading-popup').hidden) return;
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), summary, .table-wrap, pre')) return;
    // Space/Enter belong to buttons and links; arrows still work after toolbar or detail focus.
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault(); move(event.key === 'ArrowRight' || event.key === 'PageDown' ? 1 : -1);
    }
  });
  function showTarget(target) {
    var frame = target && target.closest('.slide-frame');
    if (!frame) return;
    index = frames.indexOf(frame);
    // A linked point must be readable even when its stage has not been shown yet.
    progress[index] = maxima[index];
    update();
  }
  function targetId(fragment) {
    try { return decodeURIComponent(fragment.slice(1)); } catch (_) { return fragment.slice(1); }
  }
  function followHash() {
    var target = document.getElementById(targetId(location.hash));
    if (!target || !target.closest('.slide-frame')) return;
    showTarget(target);
    target.scrollIntoView({ block: 'start' });
  }
  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('a[href^="#"]');
    // Shared detail and footnote preview own clicks they have already handled.
    if (!anchor || event.defaultPrevented || !deck) return;
    showTarget(document.getElementById(targetId(anchor.getAttribute('href'))));
  });
  addEventListener('hashchange', followHash);
  var fitPending = false;
  function scheduleFit() {
    if (fitPending) return;
    fitPending = true;
    requestAnimationFrame(function () { fitPending = false; fit(); checkFit(); });
  }
  var article = document.getElementById('bd');
  // Fixed frames do not resize when a tree expands. Measure content changes as well.
  new MutationObserver(scheduleFit).observe(article, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ['open', 'hidden'],
  });
  document.addEventListener('toggle', function (event) {
    if (event.target.closest('.slide')) scheduleFit();
  }, true);
  article.addEventListener('load', scheduleFit, true);
  var printed = null;
  addEventListener('beforeprint', function () {
    printed = frames.map(function (frame) { return frame.inert; });
    frames.forEach(function (frame) { frame.inert = false; });
    steps.flat().forEach(function (el) { el.inert = false; el.removeAttribute('aria-hidden'); });
  });
  addEventListener('afterprint', function () { if (printed) { printed = null; update(); } });
  media.addEventListener('change', update);
  new ResizeObserver(function () { fit(); checkFit(); }).observe(document.getElementById('bd'));
  new ResizeObserver(toolbarClearance).observe(tools);
  addEventListener('load', checkFit);
  tools.hidden = false;
  update(); followHash(); checkFit();
})();
