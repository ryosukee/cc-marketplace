# 図の JSON と markup

`{SKILL_DIR}` は skill root を表す。`scripts/` と `templates/` はその配下にある。

## 図のブロック

`{ "fig": { "id": "board", "caption": "何の図か" } }` で図を置く。
D2 の図は `d2: true` と `alt` を加える。図のそばの補足は `notes` に書き、
[共通操作](./detail-operations.md) の書式を使う。`custom` に `notes` は書かない。

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
- `fig` ブロック内の画像は、共通雛形がクリックと Enter / Space で開く拡大 viewer の対象にする。
  原寸より大きく引き伸ばさず、画面に収まらない部分は viewer 内でスクロールできる。
  figures ファイルへ拡大用の JavaScript や dialog を書かない
- レビュー agent には JSON と一緒にこのファイルも渡す


## D2 の図

`fig` に `"d2": true` を書いた図は、figures ファイルではなく `src/{file}.{id}.d2` の D2 の原文から作る。

- `alt` は必須。図が何を示すかを文で書く。`d2` の無い `fig` には書かない
- `scripts/render-d2.mjs` に生成元 JSON を渡すと、原文を描画して `src/{file}.{id}.svg` に書く。
  原文を直したら描画し直してから組み立てる
- 組み立ては SVG を data URI の `<img class="d2">` にし、SVG の viewBox の幅と高さを `width` と `height` に入れる
- SVG の先頭の注釈に、描画に使った原文の sha256 が入る。`check-source.mjs` が原文と突き合わせ、
  食い違いと、幅が 560px を超える図を指摘する
- 同じ id の template を figures ファイルに置かない
- レビュー agent には `.d2` のファイルも渡す
