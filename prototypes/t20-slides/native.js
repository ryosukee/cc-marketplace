// 依存なしの試作用前後移動。overview・autoplay は持たない。
(function () {
  const reading = matchMedia('(max-width: 700px)').matches;
  document.documentElement.classList.add('js-enabled');
  if (reading) document.documentElement.classList.add('reading-mode');
  const slides = [...document.querySelectorAll('.canvas')];
  let index = 0;
  function show(next) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    document.getElementById('native-page').textContent = `${index + 1} / ${slides.length}`;
  }
  document.getElementById('native-prev').onclick = () => show(index - 1);
  document.getElementById('native-next').onclick = () => show(index + 1);
  document.addEventListener('keydown', (event) => {
    if (reading || document.querySelector('dialog[open]') || event.target.closest('button, a, summary, input, textarea')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
  });
  show(0);
})();
