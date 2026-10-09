// Trial-only changes to the copied runtime; keep figure-note behavior intact.
export function patchReferencePreview(html) {
  const replace = (before, after) => {
    if (!html.includes(before)) throw new Error('reference preview boundary missing: ' + before.slice(0, 70));
    html = html.replace(before, after);
  };
  replace("  var popupAnchor = null, pinned = false", `  var popupPin = document.createElement('button');
  popupPin.type = 'button'; popupPin.id = 'reading-popup-pin'; popupPin.className = 'subbtn';
  popupPin.textContent = '固定'; popupPin.setAttribute('aria-pressed', 'false');
  popupPin.hidden = true; popupClose.before(popupPin);
  document.addEventListener('reference-focus', function (event) {
    returningFocus = true;
    event.detail.focus({ preventScroll: true });
    returningFocus = false;
  });
  function requestReference(anchor) {
    var id = (anchor.getAttribute('href') || '').slice(1);
    var opener = popup.contains(anchor) ? popupAnchor : anchor;
    closePopup(false);
    document.dispatchEvent(new CustomEvent('footnote-request', { detail: { id: id, opener: opener } }));
  }
  var popupAnchor = null, pinned = false`);
  replace("    pinned = false;\n    popupBody.replaceChildren();", "    pinned = false;\n    popupPin.textContent = '固定'; popupPin.setAttribute('aria-pressed', 'false');\n    popupBody.replaceChildren();");
  replace("    pinned = true;\n    popup.dataset.pinned = 'true';", "    pinned = true;\n    popupPin.textContent = '固定を外す'; popupPin.setAttribute('aria-pressed', 'true');\n    popup.dataset.pinned = 'true';");
  replace("    var note = anchor.closest('.figure-note');", "    var note = anchor.closest('.figure-note');\n    popup.dataset.kind = note ? 'figure' : 'reference';\n    popupPin.hidden = !!note; popupClose.hidden = !note;");
  replace("    pinned = !!pin;\n    popup.dataset.pinned = String(pinned);", "    pinned = !!pin;\n    popupPin.textContent = pinned ? '固定を外す' : '固定';\n    popupPin.setAttribute('aria-pressed', String(pinned));\n    popup.dataset.pinned = String(pinned);");
  replace("      event.preventDefault();\n      if (popupAnchor === anchor && pinned) closePopup(true);", "      event.preventDefault();\n      if (anchor.matches('.fnref a, .suref a')) { requestReference(anchor); return; }\n      if (popupAnchor === anchor && pinned) closePopup(true);");
  replace("    anchor.addEventListener('keydown', function (event) {\n      if (event.key !== ' ') return;", `    anchor.addEventListener('keydown', function (event) {
      if (anchor.matches('.fnref a, .suref a')) {
        if (event.key === 'Tab' && !event.shiftKey && !popup.hidden && popupAnchor === anchor) {
          event.preventDefault(); popupPin.focus({ preventScroll: true }); return;
        }
        if (event.key === ' ') { event.preventDefault(); requestReference(anchor); return; }
      }
      if (event.key !== ' ') return;`);
  replace("  [].slice.call(document.querySelectorAll('.fnref a, .suref a')).forEach(enhanceAnchor);", `  [].slice.call(document.querySelectorAll('.fnref a, .suref a')).forEach(function (anchor) {
    enhanceAnchor(anchor);
    anchor.setAttribute('aria-controls', 'reading-popup fn-drawer');
    anchor.setAttribute('aria-label', (anchor.closest('.fnref') ? '脚注 ' : '補足 ') + anchor.textContent + 'をサイドパネルで開く');
  });`);
  replace("      event.preventDefault(); openPopup(ref, true);", "      event.preventDefault(); requestReference(ref); return;");
  replace("    else pinPopup();", "    else if (popup.dataset.kind !== 'reference') pinPopup();");
  replace("  popupClose.addEventListener('click', function () { closePopup(true); });", `  popupPin.addEventListener('click', function () {
    if (pinned) {
      pinned = false; popup.dataset.pinned = 'false';
      popupPin.textContent = '固定'; popupPin.setAttribute('aria-pressed', 'false');
      leavePopup();
    } else pinPopup();
  });
  popupClose.addEventListener('click', function () { closePopup(true); });`);
  return html;
}
