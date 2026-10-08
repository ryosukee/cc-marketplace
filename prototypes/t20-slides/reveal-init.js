// Mobile / JS-off / print の縦読みは比較用 wrapper。標準 Reveal のリフローではない。
document.documentElement.classList.add('js-enabled');
if (matchMedia('(max-width: 700px)').matches) {
  document.documentElement.classList.add('reading-mode');
} else {
  Reveal.initialize({ width: 1280, height: 720, margin: 0, minScale: .1, maxScale: 1.15,
    hash: false, center: false, controls: true, progress: false, overview: true,
    transition: 'fade', transitionSpeed: 'fast', autoAnimateDuration: .65,
    autoSlide: 0, plugins: [] });
}
