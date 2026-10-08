# ページの生成元 JSON の書式

ページの本文は JSON に書き、閲覧用の HTML は `scripts/assemble-page.mjs` がその JSON から組み立てる。
この文書はその JSON（`format` 1）の書式を定める。実装は `scripts/lib/page-source.mjs` で、
文書と実装が食い違ったら実装を直すか、この文書を実装に合わせる。


## ファイルの配置

配信ディレクトリ（`HTML_COMMUNICATION_DIR`）の直下に閲覧用 HTML、`src/` に生成元を置く。

```text
claude-html-communication/
├── ccm-f085.html               # 閲覧用。assemble-page.mjs だけが書く。読み取り専用（0444）
├── index.html                  # 一覧。ページを作る CodingAgent が編集し、record-answer.mjs が status を書く
└── src/
    ├── ccm-f085.json           # 本文の原本。ページを作る CodingAgent が書く
    ├── ccm-f085.figures.html   # 図の markup と CSS（図があるページだけ）
    ├── ccm-f085.flow.d2        # D2 の図の原文（D2 の図があるページだけ。図の id ごとに 1 つ）
    └── ccm-f085.flow.svg       # render-d2.mjs が原文から描画した SVG
```

閲覧用 HTML は手で編集しない。直すときは JSON を直して `assemble-page.mjs --force` を回す。
HTML の `<meta name="source">` に生成元のハッシュが入り、`check-source.mjs` が JSON との食い違いを見る。


## トップレベルのキー

| キー | 型 | 内容 |
| --- | --- | --- |
| `format` | 数値 | 書式の版。いまは `1` |
| `file` | 文字列 | ファイル名の語幹。`ccm-f085`。JSON のファイル名と一致させる |
| `type` | 文字列 | `form`（設問あり）か `report`（読むだけ） |
| `presentation` | 文字列（report だけ・任意） | `slides` なら固定 16:9 のスライド。省略すると通常のレポート。[スライドの作成と操作](./slides.md)は、この形式を選んだときだけ読む |
| `title` | 文字列 | ページの題名。index.html の `title` と一字一致させる |
| `project` | 文字列 | index.html の `project` と同じ値。下部バーのバッジに出る |
| `context` | 文字列の配列 | 議題の広い前提を 2〜3 文で書く。題名の直後に置く |
| `formIntro` | ブロックの配列（form だけ・任意） | 今回のフォームが何を確認するものかを書く。前提の直後に「このフォームについて」として表示する |
| `summary` | ブロックの配列 | report のまとめ。report では必須。form では書かない。旧 form に残る値は表示しない |
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

form の `formIntro`、report の `summary`、節の `blocks`、`reference.blocks` に置く。文字列は段落になる。

| 形 | 出力 |
| --- | --- |
| `"文字列"` | 段落 `<p>` |
| `{ "note": "…" }` | 弱い段落 `<p class="d">` |
| `{ "h3": "…" }` | 小見出し |
| `{ "ul": [項目, ...] }` / `{ "ol": [...] }` | 箇条書き。項目は文字列か `{ "text": "…", "items": [...] }`（入れ子） |
| `{ "table": { "caption": "…", "columns": [...], "rows": [...] } }` | 表。下記 |
| `{ "quote": { "src": "出典の題名", "url": "https://…", "paragraphs": ["…"] } }` | 引用。`url` は任意。段落は逐語で、記法を解釈しない |
| `{ "pre": "…" }` | コード。記法を解釈せずそのまま出す |
| `{ "code": { "id": "…", "text": "…", ... } }` | 行番号と注釈のあるコード。[コード・差分・呼び出しツリー](./rich-code.md)を読む |
| `{ "diff": { "id": "…", "before": "…", "after": "…", ... } }` | 変更前後のコード差分。[コード・差分・呼び出しツリー](./rich-code.md)を読む |
| `{ "calls": { "id": "…", "title": "…", "nodes": [...] } }` | 枝線と関数カードの呼び出しツリー。[コード・差分・呼び出しツリー](./rich-code.md)を読む |
| `{ "fig": { "id": "board", "caption": "何の図か" } }` | 図。markup は figures ファイルから取り、「図 n」が付く |
| `{ "fig": { "id": "flow", "caption": "何の図か", "d2": true, "alt": "図が示す内容" } }` | D2 の図。[図の JSON](./figure-format.md) |
| `{ "custom": { "id": "cards" } }` | パターン集などの markup をそのまま置く。キャプションと番号は付かない |
| `{ "detail": { "label": "…", "title": "…", "blocks": [...] } }` | 詳細パネル。[操作の書式](./detail-operations.md#詳細パネル)を読む |
| `{ "tree": [{ "text": "…", "blocks": [...], "children": [...] }] }` | 階層を1段ずつ開く。[操作の書式](./detail-operations.md#階層を1段ずつ開く)を読む |

表の `columns` は文字列か `{ "text": "…", "num": true }`（数値の列）。
`rows` はセルの配列か `{ "cells": [...], "key": true }`（判断を分ける行のハイライト）。
最初のセルは行見出し（`th scope="row"`）になる。セルは文字列か
`{ "text": "…", "tone": "ok" | "ng", "num": true }`。セル数は列数と揃える。


## 文字列の中の記法

段落・セル・見出し・選択肢・脚注・補足の文字列で、次の 6 種だけを解釈する。
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
`code.text` と `diff.before`・`diff.after` も原文として扱い、HTML や上記の記法を解釈しない。

記法の文字をそのまま出すときは、前にバックスラッシュを置く（`\*` `` \` `` `\=` `\[` `\]` `\\` の 6 つ。JSON の文字列では `\\*` と書く）。
強調と斜体は英数字の語の途中では効かない。`180*180*180` や `docs/**` のように、前後が英数字・`/` の `*` は記法にならない。日本語の文の途中では効く。
code span の中身をバッククォートで始めたいときは、囲むバッククォートを 2 つにして両端に空白を置く（`` `` `code` `` ``）。


## 脚注と補足

```json
"footnotes": { "measure": "実測 2026-09-08。…" },
"supplements": { "page-reviewer": "**page-reviewer** = 提示前に回す agent。…" }
```

- キーは名前にする（英数字とハイフン、または日本語）。本文からは `[^measure]` で参照する
- 番号と英字は、本文の初出順に組み立て時に付く。前提、form の説明、report のまとめにある参照は順序に数えない
- 同じキーを複数箇所から参照してよい。戻りリンクが参照の数だけ並ぶ
- 参照されないキー、両方に同じキー、解決しない参照は `check-source.mjs` が指摘する


## 必要なブロックの追加書式

- 設問を書くときは [設問と回答](./form-format.md) を読む。
- 図・画像・独自 markup を置くときは [図と markup](./figure-format.md) を読む。
- 詳細パネル・階層・図のそばの補足を置くときは [共通操作](./detail-operations.md) を読む。
- 行番号付きコード・差分・呼び出し関係を置くときは [コード・差分・呼び出しツリー](./rich-code.md) を読む。
