---
marp: true
theme: t20
size: 16:9
title: html-communication：説明を短く、根拠は詳しく
lang: ja
---

<!-- _class: canvas -->

<p class="eyebrow">HTML COMMUNICATION</p><h1>説明を短く、<br>根拠は詳しく</h1><p class="lead">要点を先に読み、必要な根拠をその場で確かめる。</p><div class="points"><div class="point"><span>01</span><b>要点</b><p>判断に必要な説明を先に。</p></div><div class="point"><span>02</span><b>詳細</b><p>表とコードは必要なときに。</p></div><div class="point"><span>03</span><b>出典</b><p>全文と参照先を残す。</p></div></div><div class="slide-footer"><span>説明を短く、根拠は詳しく</span><span>01 / 04</span></div>

---

<!-- _class: canvas -->

<p class="eyebrow">OVERVIEW → EVIDENCE</p><h2>必要な根拠を、<br>その場で開く</h2><div class="two-columns"><div><p class="lead">概要には結論を置く。詳しい説明へ進んでも、読んでいた位置を失わない。</p><details class="inline-detail"><summary>詳細を開く</summary><p>詳細は、概要から省いた根拠を読む場所。閉じると起動点へ戻り、本文を読み続けられる。</p><p>この試作は親子関係と原文の保持を示す操作例。既存の共通テンプレートをそのまま組み込んだものではない。</p><pre>const detailOpen = true;</pre></details><p class="note">HTMLの details による本文内開閉。標準Marpの独立overlayではない。</p></div><div class="flow"><div><b>概要</b><p>判断するための短い説明</p></div><div><b>詳細</b><p>必要な根拠と実装の内訳</p></div><div><b>出典</b><p>全文とリンクを確かめる</p></div></div></div><div class="slide-footer"><span>説明を短く、根拠は詳しく</span><span>02 / 04</span></div>

---

<!-- _class: canvas -->

<p class="eyebrow">ONE DOCUMENT, THREE LAYERS</p><h2>読む深さを、<br>情報の役割で分ける</h2><p class="lead">同じ内容を三つのエンジンで表示する。比較対象は見た目ではなく、操作と制作の条件。</p><table class="comparison"><tbody><tr><th scope="row">要点</th><td>最初から見える</td><td>短く、判断の手掛かりに</td></tr><tr><th scope="row">詳細</th><td>必要なときに開く</td><td>長い説明・表・コード</td></tr><tr><th scope="row">出典</th><td>全文を確かめる</td><td>脚注とリンクを保持</td></tr></tbody></table><p class="fragment-note">必要な内容だけ、順に示す。</p><pre class="small-code" data-id="state-code"><code>const detailOpen = false;</code></pre><div class="slide-footer"><span>説明を短く、根拠は詳しく</span><span>03 / 04</span></div>

---

<!-- _class: canvas -->

<p class="eyebrow">A SMALL CHANGE</p><h2>小さな変更を、<br>読み手の操作につなぐ</h2><p class="lead">詳細を開くときだけ状態を変え、閉じたら本文へ戻る。</p><pre class="code-large" data-id="state-code"><code>const detailOpen = true;

if (detailOpen) {
  detailDialog.showModal();
}</code></pre><p class="note">Reveal.js では前のスライドのコード領域を移動・拡大する標準 auto-animate を試す。他の二つは静的な切替。</p><div class="slide-footer"><span>説明を短く、根拠は詳しく</span><span>04 / 04</span></div>
