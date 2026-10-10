# フォームの設問と回答の JSON

`{SKILL_DIR}` は skill root を表す。`scripts/` と `templates/` はその配下にある。

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
- 順位を答える設問は `type: "rank"`、範囲内の数値を答える設問は `type: "number"` を使う。
  条件付きの説明と併せた書式・初期値の未回答扱いは [条件付き説明と順位・数値回答](./answer-controls.md) に従う
- `question.multiple: true` を明示した設問だけ、選択肢と「その他」を checkbox にする。省略時と `false` は従来の radio。
  複数の独立した項目をそれぞれ採るかどうか選ぶときに使う。相互排他的な案の選択は radio のままにする
- 同じ二択を複数の項目へ繰り返す場合は `question.items` を使う。`options` は共通の二択、`items` は
  `{ "id": "path", "label": "path の解釈", "recommended": "React" }` の配列にする。`id` は英小文字で始まる
  英小文字・数字・ハイフンで、設問内で重複させない。`recommended` はその項目の推奨値で、省略できる。
  各項目へ独立した radio が付き、設問全体の補足欄だけが付く。「その他」は付かない。
  選択肢の文言が短く、項目数も少ない場合は、文言を各項目に表示する。文言が長い場合、
  または項目数が多く反復が読みづらい場合だけ記号を使い、`text` で記号と文言の対応を先に定義する
- 選択肢の `label` は表示と回答の値の両方に使う。記法を外した素の文字列が値になる
- 選択肢の `value` は、変換したページ（`import-page.mjs`）だけが持つ。あるときは表示が `label`、
  radio の値と回答の突合が `value`。新しく書くページには書かない
- radio の `recommended` は 1 つまで。checkbox では複数付けられる。`description` は文字列か文字列の配列（1 行 1 文）
- `pros` と `cons` は両方書くか両方省く。雛形の長所短所（`.proscons`）になる
- 通常の選択では「その他」の選択肢と補足欄が組み立て時に付く。JSON には書かない。
  項目別選択・順位・数値では設問全体の補足欄だけが付く

複数選択の例:

```json
"question": {
  "label": "残す情報",
  "text": "タスクに残す情報をすべて選ぶ。",
  "multiple": true,
  "options": [
    { "label": "進捗", "recommended": true },
    { "label": "決定事項", "recommended": true }
  ]
}
```

checkbox の「その他」は通常の選択肢と同時に選べる。選択肢の値は同じ設問内で重複させない。

項目別 radio の例:

```json
"question": {
  "label": "処理ごとの担当",
  "text": "各処理の担当を選ぶ。",
  "options": [
    { "label": "React" },
    { "label": "Go server" }
  ],
  "items": [
    { "id": "path", "label": "path の解釈", "recommended": "React" },
    { "id": "filter", "label": "作業項目の絞り込み", "recommended": "Go server" }
  ]
}
```

一部の項目だけを選んだ状態も下書きと回答テキストには残る。全項目を選ぶまで、設問カードと回答進捗は未回答として扱う。
表示方法の完成例と採用条件は [item radio](./patterns/item-radio/README.md) を参照する。


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
- 複数選択のコピー行は `- Q1（残す情報）: 複数選択: {"values":["進捗","決定事項"],"other":"追加項目"}  ※ 補足`。
  `values` は選んだ通常の選択肢の値の配列。「その他」を選んだ場合だけ `other` を含め、記述が空でも `"other":""` とする。
  未選択は従来どおり `未回答`。`answers.items` は `value: null` と `multiple: ["進捗","決定事項"]` を持ち、
  「その他」があれば `other` も持つ。単一選択の `value` とコピー形式は変えない
- 項目別 radio のコピー行は `- Q1（処理ごとの担当）: 項目別選択: {"path":"React","filter":"Go server"}`。
  未回答の項目は `null` にする。`answers.items` は `value: null` と、項目 ID から選択肢の値または `null` を引く
  `selections` を持つ
- report は `{ "received": "…", "confirmed": "ユーザーの確認の発言（逐語）" }`
- `answers` があるページは、選択肢を選択済み・入力不可の状態で組み立てる。下書きの復元とリセットは止まる
- 順位の回答は `value: null` と `order`、数値の回答は `value: null` と `number` を持つ。
  コピー行と検査条件は [条件付き説明と順位・数値回答](./answer-controls.md) に従う
