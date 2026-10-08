# フォーム回答の受領

`{SKILL_DIR}` は `SKILL.md` がある skill ディレクトリの絶対パスを表す。
この参照ファイルがある `references/` ではない。コマンド内では実際のパスに置き換える。

## 回答の受け取り

ユーザーから「## HTML フォーム回答」で始まるテキストが貼られたら HTML フォームの回答として扱う。

- 貼られた全文を scratchpad のファイルに逐語で保存し、そのターンの最初の操作として
  `node "{SKILL_DIR}/scripts/record-answer.mjs" <src/{語幹}.json> --answer <そのファイル>` を回す
- script は 4 つの手順を順に行い、手順ごとに done / skip を stdout に出す。
  JSON の `answers` に全文と設問ごとの解釈を書く → 閲覧用 HTML を回答済みの状態で組み直す →
  index.html の当該エントリを `answered` にする → `build-archive.mjs` を回す。
  途中で失敗したら stdout でどこまで済んだかを確かめ、もう 1 度回す。済んだ手順は skip になる
- JSON を持たない旧ページは、先に `import-page.mjs` で変換してから回す。変換できないときは
  index.html の status を手で更新して `build-archive.mjs` を回す
- 回答の実文は JSON の `answers.raw` に残る。decision-record へ写すときはそこから引く
