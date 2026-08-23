# 処遇判定: 既存あり 70 件（段階 1-1）

`is-generic-screening.md` と `plugin-generic-screening.md` の `既存あり` 分類。
突合で同趣旨が既存規範にあると確認された条項。

語彙は `norm-audit-raw/verdict-schema.md` に従う。

## 判定の規則

「同趣旨が既存にある = 削除してよい」ではない。plugin 設計原則が優先する。

> plugin は skills / hooks / agents で自己完結する。rule の存在を暗黙前提にしない。
> rule は user global で、install したユーザー全員が同じ rule を持つとは限らない。
>
> — `.claude/rules/plugin-design.md`

この原則から、次の規則で決まる。

| 条項の所属 | 既存の所在 | 処遇 |
| --- | --- | --- |
| 残る plugin（HC / GP / SS / FN） | どこであれ | `維持` / `plugin` |
| impl-spec（IS） | どこであれ | `維持` / `移設先` |
| 解体される plugin（SK 系） | `rules/` 側にある | `削除` / 現在地 |
| 解体される plugin（SK 系） | `rules/` 側に無い | `移設` / 詳細規範 |
| 入口 rule 自身（JR / UC） | 詳細規範側にある | `削除` / 現在地（入口は最小 2 節） |
| 記法 rule 自身（MF） | — | `維持` / `条件` |

**例外**: AskUserQuestion に依存する条項は、所属に関わらず `削除`。
DG46 の確定（使用指示を全 plugin から除去）が優先する。ツールが消えるので
自己完結原則で残す対象にならない。

## IS 42 件

### AskUserQuestion 依存 → 削除

| ID | 内容 |
| --- | --- |
| IS13 / IS101 / IS211 / IS212 | 引数が無いときは AskUserQuestion で聞く |
| IS32 / IS126 / IS225 | AskUserQuestion で曖昧さ・選択肢を確定させる |
| IS41 | 独立した質問は 4 問までまとめて聞く（4 問はツール仕様由来の数値） |

処遇 `削除` / 置き先 現在地 / T3 `対象外`。
根拠: DG46 の確定。除去後の確認手段は「フリーテキスト。設問が多い確認は HTML フォーム」へ
書き換える（実装明細の申し送り 4）。

### それ以外 → 維持 / 移設先

| ID | 既存の所在 |
| --- | --- |
| IS22 / IS25 / IS119 / IS60 / IS152 | `rules/primary-sources-first.md` |
| IS31 | ask-with-choices（廃止）+ session |
| IS38 / IS134 / IS80 / IS177 / IS296 | `rules/propose-before-implement.md` |
| IS54 / IS145 / IS236 / IS301 / IS55 / IS146 / IS268 / IS302 | html-communication + session |
| IS62 / IS154 / IS274 | ask-with-choices（廃止） |
| IS228 / IS341 | html-communication |
| IS272 / IS294 / IS303 / IS306 / IS308 / IS332 / IS333 / IS334 / IS338 / IS339 | session |

処遇 `維持` / 置き先 `移設先` / T3 `対象外`。

根拠: impl-spec は product-boilerplate へ移設される。移設先で cc-marketplace の
user global rule や他 plugin の存在を前提にできない。自己完結原則がそのまま効く。

**IS31 / IS62 / IS154 / IS274 は要注意**。既存の所在が ask-with-choices で、
その skill は廃止される。移設先へ同行させる条項が、消える skill を実質の根拠にしている。
移設時に impl-spec 側で自己完結の形に書き直す（実装明細へ申し送る）。

## plugin 側 28 件

### 残る plugin（SS / HC / GP / FN）→ 維持 / plugin

| ID | 既存の所在 |
| --- | --- |
| SS52 / SS56 | `rules/user-communication-format.md`（PR 1 で削除される） |
| SS73 | `rules/propose-before-implement.md` |
| SS160 / SS162 / SS164 | `rules/primary-sources-first.md` |
| SS161 | `rules/decision-record.md` |
| SS165 / SS166 / SS174 | 詳細規範 `decision-docs.md` |
| SS176 | `rules/japanese-text-writing.md` + 詳細規範 |
| HC157 / HC159 | `rules/japanese-text-writing.md` / `rules/markdown-formatting.md` |
| HC162 / HC188 / HC191 / HC219 / HC220 | 詳細規範 |
| HC189 / HC190 | `rules/primary-sources-first.md` |
| GP36 / GP89 / GP195 | 詳細規範 / `rules/` |
| FN44 | `rules/propose-before-implement.md` |

処遇 `維持` / 置き先 `plugin` / T3 `対象外`。

**SS52 / SS56 は要注意**。既存の所在 `rules/user-communication-format.md` は PR 1 で
ファイルごと削除される。削除後、この 2 件の根拠は session 側にしか無くなる。
処遇は変わらない（維持）が、削除後に根拠が浮くことを実装明細へ申し送る。

**HC159 は条件ロードの穴に該当**。既存が `rules/markdown-formatting.md:16` にあり、
HTML ページ本文では読み込まれない。段階 2 の設計対象。

### 解体される plugin（SK）→ 削除

| ID | 原文 | 既存の所在 |
| --- | --- | --- |
| SK39 | LLM が出しがちな、情報を足さずに「書いている感」だけを付ける型。使わない。 | `rules/japanese-text-writing.md:22`（総則が入口側にある） |

処遇 `削除` / 置き先 現在地 / T3 `対象外`。
根拠: AI 口調 8 型の節の導入文。8 型の本体（SK40〜SK47）は DG16 で `統合` / `core` と
判定済み。導入文は core へ移した本体が兼ねる。

### 入口 rule 自身（JR）→ 削除

| ID | 原文 | 判定 |
| --- | --- | --- |
| JR1 | 日本語のテキストを出力するすべての場面（md ファイル・ターミナル返答・HTML 報告）に適用する。 | `削除` |
| JR2 | ここにあるのは要点のみ。規範の正典は japanese-text-writing skill で、まとまった文章を書く・推敲するときはそちらを読む。 | `削除` |
| JR9 | 不確実さを表すヘッジ（「〜の可能性がある」）は保持し、根拠なく重ねた緩和だけ削る | `削除` |

処遇 `削除` / 置き先 現在地 / T3 `対象外`。

根拠: 入口 rule は「タイプ判定」+「数行返答の最小規範」の 2 節・約 20 行へ圧縮される
（台帳 L262-275）。JR1 の適用範囲宣言はタイプ判定の一次分岐が兼ね、JR2 の参照先は
skill 解体で失効し、JR9 は core の保持規則 L1 へ統合される（DG9 で判定済み）。

## 集計

| 処遇 | 件数 |
| --- | --- |
| 維持 / plugin | 24 |
| 維持 / 移設先 | 34 |
| 削除 | 12 |
| 計 | 70 |

## 実装明細への申し送り（3 件）

- **IS31 / IS62 / IS154 / IS274**: 既存の根拠が ask-with-choices（廃止予定）。
  移設時に impl-spec 側で自己完結の形に書き直す
- **SS52 / SS56**: 既存の根拠 `rules/user-communication-format.md` が PR 1 で消える。
  削除後は session 側が唯一の実体になる
- **HC159**: 既存が条件ロードの下にあり HTML では読み込まれない。段階 2 の設計対象
