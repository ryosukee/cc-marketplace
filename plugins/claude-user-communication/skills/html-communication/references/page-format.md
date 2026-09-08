# ページの生成元 JSON の書式

ページの本文は JSON に書き、閲覧用の HTML は `scripts/assemble-page.mjs` がその JSON から組み立てる。
この文書はその JSON（`format` 1）の書式を定める。実装は `scripts/lib/page-source.mjs` で、
文書と実装が食い違ったら実装を直すか、この文書を実装に合わせる。

## ファイルの配置

配信ディレクトリ（`CLAUDE_HTML_COMMUNICATION_DIR`）の直下に閲覧用 HTML、`src/` に生成元を置く。

```text
claude-html-communication/
├── ccm-f085.html               # 閲覧用。assemble-page.mjs だけが書く。読み取り専用（0444）
├── index.html                  # 一覧。Claude が編集し、record-answer.mjs が status を書く
└── src/
    ├── ccm-f085.json           # 本文の原本。Claude が書く
    └── ccm-f085.figures.html   # 図の markup と CSS（図があるページだけ）
```

閲覧用 HTML は手で編集しない。直すときは JSON を直して `assemble-page.mjs --force` を回す。
HTML の `<meta name="source">` に生成元のハッシュが入り、`check-source.mjs` が JSON との食い違いを見る。

## トップレベルのキー

| キー | 型 | 内容 |
| --- | --- | --- |
| `format` | 数値 | 書式の版。いまは `1` |
| `file` | 文字列 | ファイル名の語幹。`ccm-f085`。JSON のファイル名と一致させる |
| `type` | 文字列 | `form`（設問あり）か `report`（読むだけ） |
| `title` | 文字列 | ページの題名。index.html の `title` と一字一致させる |
| `project` | 文字列 | index.html の `project` と同じ値。下部バーのバッジに出る |
| `context` | 文字列の配列 | 前提の 2〜3 文。まとめの前に置く |
| `summary` | ブロックの配列 | 推奨案のまとめ（report ではまとめ） |
| `sections` | 節の配列 | 説明の節と設問の節の並び |
| `groups` | 配列（任意） | 設問のグループ。`{ "id": "build", "name": "ページの組み立て" }` |
| `footnotes` | オブジェクト（任意） | 脚注。名前をキーにして本文を持つ |
| `supplements` | オブジェクト（任意） | 補足。名前をキーにして本文を持つ。26 個まで |
| `reference` | オブジェクト（任意） | 参考資料（判断には不要）。`{ "lead": "…", "blocks": [...] }` |
| `generation` | 文字列かブロックの配列（任意） | 生成に関する補足（判断には不要）。先頭の文字列に「読み飛ばしてよい。」が組み立て時に付き、残りの文字列は弱い段落、箇条書きはそのまま出る |
| `css` | 文字列の配列（任意） | 取り込むパターン集の名前。`references/patterns/{名前}/style.css` を雛形の CSS の末尾に足す |
| `answers` | オブジェクト（任意） | 回答。`record-answer.mjs` が書く。手で書かない |

番号は書かない。説明 n / M、設問 n / N、表 n、図 n、脚注の数字、補足の英字はすべて組み立て時に並び順から付く。

## 節

```json
{ "kind": "explain", "heading": "主張型の見出し", "blocks": [ ... ] }
{ "kind": "question", "heading": "問いの見出し（〜するか）", "group": "build",
  "blocks": [ ... ],
  "question": { "label": "設問ラベル", "text": "設問文", "options": [ ... ] } }
```

- `explain` は設問を持たない読む専用の節。`question` は設問を 1 つ持つ節。1 節 1 設問
- `id` は書かない。説明は `e1` `e2`、設問は `q1` `q2` と並び順から付き、見出しのアンカーは `#s-e1` `#s-q1` になる
- `group` は任意。書くときは `groups` にある `id` を使う。設問 pane のグループ容器と、
  範囲のラベル「{グループ名} n / N（設問 通し / 総数）」が組み立て時にできる

## ブロック

`summary`・節の `blocks`・`reference.blocks` に置く。文字列は段落になる。

| 形 | 出力 |
| --- | --- |
| `"文字列"` | 段落 `<p>` |
| `{ "note": "…" }` | 弱い段落 `<p class="d">` |
| `{ "h3": "…" }` | 小見出し |
| `{ "ul": [項目, ...] }` / `{ "ol": [...] }` | 箇条書き。項目は文字列か `{ "text": "…", "items": [...] }`（入れ子） |
| `{ "table": { "caption": "…", "columns": [...], "rows": [...] } }` | 表。下記 |
| `{ "quote": { "src": "出典の題名", "url": "https://…", "paragraphs": ["…"] } }` | 引用。`url` は任意。段落は逐語で、記法を解釈しない |
| `{ "pre": "…" }` | コード。記法を解釈せずそのまま出す |
| `{ "fig": { "id": "board", "caption": "何の図か" } }` | 図。markup は figures ファイルから取り、「図 n」が付く |
| `{ "custom": { "id": "cards" } }` | パターン集などの markup をそのまま置く。キャプションと番号は付かない |

表の `columns` は文字列か `{ "text": "…", "num": true }`（数値の列）。
`rows` はセルの配列か `{ "cells": [...], "key": true }`（判断を分ける行のハイライト）。
最初のセルは行見出し（`th scope="row"`）になる。セルは文字列か
`{ "text": "…", "tone": "ok" | "ng", "num": true }`。セル数は列数と揃える。

## 文字列の中の記法

段落・セル・見出し・選択肢・脚注・補足のすべての文字列で、次の 6 種だけを解釈する。
それ以外の文字はエスケープされる。HTML のタグは書けない（書くと `check-source.mjs` が指摘する）。

| 記法 | 出力 |
| --- | --- |
| `` `code` `` | `<code>` |
| `**強調**` | `<strong>`。補足の中で定義する語を太字にするときに使う |
| `*斜体*` | `<em>` |
| `==要点==` | `<mark>`（琥珀の下線） |
| `[文字](URL)` | リンク |
| `[^キー]` | 脚注か補足の参照マーカー |

改行（`\n`）は `<br>` になる。`pre` と `quote.paragraphs` の中では記法を解釈しない。

記法の文字をそのまま出すときは、前にバックスラッシュを置く（`\*` `` \` `` `\=` `\[` `\]` `\\` の 6 つ。JSON の文字列では `\\*` と書く）。
強調と斜体は英数字の語の途中では効かない。`180*180*180` や `docs/**` のように、前後が英数字・`/` の `*` は記法にならない。日本語の文の途中では効く。
code span の中身をバッククォートで始めたいときは、囲むバッククォートを 2 つにして両端に空白を置く（`` `` `code` `` ``）。

## 設問

```json
"question": {
  "label": "描画の時点",
  "text": "JSON から本文の HTML を作るのを、組み立て時とブラウザのどちらにするか。",
  "options": [
    { "label": "組み立て時に静的な HTML を生成する", "recommended": true,
      "description": ["推奨する根拠を 1 文で。", "他を選ぶのが妥当な条件を 1 文で。"],
      "pros": "採ると何が良くなるか", "cons": "何を引き受けるか。他案を採る条件" },
    { "label": "ブラウザで組み立てる", "description": "案の中身" }
  ]
}
```

- `label` は設問カードの見出しと回答テキストの `Q1（ラベル）` に出る
- 選択肢の `label` は表示と回答の値の両方に使う。記法を外した素の文字列が値になる
- 選択肢の `value` は、変換したページ（`import-page.mjs`）だけが持つ。あるときは表示が `label`、
  radio の値と回答の突合が `value`。新しく書くページには書かない
- `recommended` は 1 つまで。`description` は文字列か文字列の配列（1 行 1 文）
- `pros` と `cons` は両方書くか両方省く。雛形の長所短所（`.proscons`）になる
- 「その他」の選択肢と補足欄は組み立て時に必ず付く。JSON には書かない

## 図と markup ファイル

図・SVG・画像・パターン集の markup は `src/{file}.figures.html` に置き、JSON からは `id` で参照する。

```html
<style data-scope="figures">
  /* 図のための CSS。Tailwind の CLI の出力もここ */
</style>
<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="t-gear" viewBox="0 0 24 24">…</symbol>
</svg>
<template data-fig="board">
  <div class="…">図の markup</div>
</template>
```

- `<template data-fig="id">` の中身が図の markup。`fig` は `.fig` で包んでキャプションを付け、`custom` はそのまま置く
- `<style data-scope="figures">` は雛形の `<style>` の後ろに置かれる。色役割とフォント段の制限の対象外
- `template` と `style` 以外に書いたもの（アイコンの `symbol` など）は `<body>` の先頭に置かれる
- 画像は `<img alt="…">` にする。`alt` の無い画像は html-validate が指摘する
- レビュー agent には JSON と一緒にこのファイルも渡す

## 脚注と補足

```json
"footnotes": { "measure": "実測 2026-09-08。…" },
"supplements": { "page-reviewer": "**page-reviewer** = 提示前に回す agent。…" }
```

- キーは名前にする（英数字とハイフン、または日本語）。本文からは `[^measure]` で参照する
- 番号と英字は、本文の初出順に組み立て時に付く。前提とまとめの参照は順序に数えない
- 同じキーを複数箇所から参照してよい。戻りリンクが参照の数だけ並ぶ
- 参照されないキー、両方に同じキー、解決しない参照は `check-source.mjs` が指摘する

## 回答

`record-answer.mjs` が書く。手で書かない。

```json
"answers": {
  "received": "2026-09-08",
  "raw": "## HTML フォーム回答（…）\n- Q1（描画の時点）: 組み立て時に静的な HTML を生成する  ※ …\n- 補足: なし",
  "items": [ { "id": "q1", "label": "描画の時点", "value": "組み立て時に静的な HTML を生成する", "note": "…" } ],
  "free": null
}
```

- `raw` は貼り付けの全文を逐語で持つ。`items` は行の形式に合った行だけを解釈した結果で、
  `value`（選んだ選択肢の radio の値。選択肢に `value` があればそれ、無ければ `label` の素の文字列。未回答は `null`）・
  `other`（その他の記述）・`note`（補足）を持つ
- report は `{ "received": "…", "confirmed": "ユーザーの確認の発言（逐語）" }`
- `answers` があるページは、選択肢を選択済み・入力不可の状態で組み立てる。下書きの復元とリセットは止まる
