// Native / Reveal の比較用に追加する処理。エンジンの標準詳細機能ではない。
(function () {
  const dialog = document.getElementById('detail-dialog');
  const close = document.getElementById('detail-close');
  let opener;
  document.querySelectorAll('.detail-open').forEach((button) => button.addEventListener('click', () => {
    opener = button;
    if (window.Reveal && window.Reveal.isReady()) window.Reveal.configure({ keyboard: false });
    dialog.showModal(); close.focus();
  }));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    if (window.Reveal && window.Reveal.isReady()) window.Reveal.configure({ keyboard: true });
    if (opener) opener.focus();
  });
  window.addEventListener('beforeprint', () => { if (dialog.open) dialog.close(); });
})();
