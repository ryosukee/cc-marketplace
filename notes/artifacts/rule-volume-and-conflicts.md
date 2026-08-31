# user global rule 群の規模と条項の競合

セッションに載る rule の量を実測し、同時に満たせない条項の組を洗い出す。
対象は `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/rules/`（symlink で
`~/.claude/rules/cc-marketplace` へ配布）と、同 repo の `.claude/rules/`。
測定時点は 2026-09-01、commit `b5e9c93`、作業ツリーは `todo.md`（untracked）以外クリーン。

## 結論

常時ロードは 12 本・37,360 バイト・614 行。うち user global が 8 本 21,129 バイト、
project rule が 4 本 16,231 バイト。過去に同じ範囲を測った記録と比べると、
user global の常時ロード分は 2026-08-10 の 8 本 12.5 KB から 8 本 21.1 KB へ、
2026-08-19 の 265 行から 328 行へ増えている。常時ロード全体（project 込み）は
2026-08-19 の 11 本 466 行から 12 本 614 行になった。

条件ロードは paths が実ファイルに一致する 8 本（31,394 バイト・578 行）と、
どのファイルにも一致しない値を置いて参照 Read だけで読ませる 8 本（45,613 バイト・690 行）に分かれる。

同時に満たせない、または実際の場面で衝突する条項の組は 7 件見つかった。
優先順位が明記されていて衝突にならないものは別に 9 件ある。

## 1. 観測: 測定の条件と数え方

### ロード方式の分類

`rules/rule-authoring.md` がロード方式を 3 つに定義している。この 3 つで分ける。

> "常時ロード (frontmatter に paths を書かない): セッション開始時に無条件で読み込まれる。
> 条件ロード (paths に対象パターンを書く): 一致するファイルを読んだときだけ載る。
> 参照専用 (paths にどのファイルにも一致しない値を置く。例: `never-match-reference-only`):
> 自動ロードから外し、他の文書からの参照経由の Read だけで読ませる。"
>
> 出典: rule の書き方（`/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/rules/rule-authoring.md`）

分類に使ったコマンド。

```sh
cd /Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace
for f in $(find rules .claude/rules -type f -name '*.md' | sort); do
  if head -20 "$f" | grep -q '^paths:'; then
    if head -20 "$f" | grep -q 'never-match-reference-only'; then k=参照専用; else k=条件; fi
  else k=常時; fi
  echo "$k $f"
done
```

`rules/subagent-delegation.md` は frontmatter を持つが `paths` を持たない（`status` と `note` のみ）ため、
常時ロードに入る。

### 条項の数え方

数え方を 2 つ定義する。どちらも frontmatter とコードフェンスの中を除外する。

- 定義 A（節）: `##` 以上の見出しを 1 条項と数える。見出し文字列が `why` だけのものは
  条項ではなく根拠なので、別に数える
- 定義 B（規範単位）: 定義 A の節数に、行頭がハイフン 1 つと半角スペースで始まるトップレベルの箇条書き項目を足す。
  先頭に空白を持つネストした箇条書きは親項目の補足なので数えない

定義 B を主に使う。過去の台帳 ccm-f029（`notes/artifacts/norm-refit-form-sources.md` の表 2）が
「見出し」「箇条書き」の 2 列で数えており、同じ形で比較できるため。

再現コマンド。`count.awk` は次の内容。

```awk
BEGIN{fence=0;fm=0;h=0;hw=0;b=0;ln=0}
NR==1 && $0=="---" {fm=1;next}
fm==1 { if($0=="---"){fm=0}; next }
{ln++}
/^```/ {fence=!fence; next}
fence==1 {next}
/^#{2,} / { t=$0; sub(/^#+ +/,"",t); if(tolower(t)=="why"){hw++} else {h++}; next }
/^- /{b++}
END{printf "%s\t%d\t%d\t%d\t%d\n", FILENAME, ln, h, hw, b}
```

```sh
cd /Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace
for f in $(find rules .claude/rules -type f -name '*.md' | sort); do awk -f count.awk "$f"; done
```

バイト数と行数は `wc -c` と `wc -l` で測った。行数は frontmatter を含む。

## 2. 観測: 常時ロード

12 本・37,360 バイト・614 行。定義 A で 40 条項（ほかに `why` 節 6 個）、定義 B で 155 条項。

| ファイル | バイト | 行 | 節 | why 節 | 箇条書き | 定義 B |
| --- | --- | --- | --- | --- | --- | --- |
| `rules/background-task.md` | 1442 | 18 | 1 | 0 | 3 | 4 |
| `rules/bash-state-mutation-isolation.md` | 3345 | 49 | 3 | 1 | 11 | 14 |
| `rules/decision-record.md` | 4159 | 65 | 4 | 1 | 12 | 16 |
| `rules/japanese-text-writing.md` | 1156 | 18 | 2 | 0 | 3 | 5 |
| `rules/primary-sources-first.md` | 3161 | 51 | 4 | 1 | 6 | 10 |
| `rules/propose-before-implement.md` | 2325 | 32 | 1 | 1 | 5 | 6 |
| `rules/skill-invocation.md` | 783 | 13 | 0 | 1 | 3 | 3 |
| `rules/subagent-delegation.md` | 4758 | 82 | 6 | 1 | 11 | 17 |
| user global 小計（8 本） | 21129 | 328 | 21 | 6 | 54 | 75 |
| `.claude/rules/coding.md` | 2102 | 47 | 3 | 0 | 21 | 24 |
| `.claude/rules/norm-refit-ops.md` | 4941 | 67 | 5 | 0 | 16 | 21 |
| `.claude/rules/plugin-design.md` | 6035 | 121 | 8 | 0 | 19 | 27 |
| `.claude/rules/plugin-release.md` | 3153 | 51 | 3 | 0 | 5 | 8 |
| project 小計（4 本） | 16231 | 286 | 19 | 0 | 61 | 80 |
| 合計（12 本） | 37360 | 614 | 40 | 6 | 115 | 155 |

※ 表 1 常時ロードされる rule の実測（2026-09-01、commit `b5e9c93`）

## 3. 観測: 条件ロード

### paths が実ファイルに一致するもの（8 本）

31,394 バイト・578 行。定義 A で 47 条項、定義 B で 152 条項。

| ファイル | ロード条件（paths） | バイト | 行 | 節 | 箇条書き | 定義 B |
| --- | --- | --- | --- | --- | --- | --- |
| `rules/markdown-formatting.md` | `**/*.md` | 5224 | 120 | 13 | 27 | 40 |
| `rules/claude-doc-authoring.md` | `.claude/rules/**/*.md`, `rules/**/*.md`, `.claude/skills/*/SKILL.md`, `plugins/*/skills/*/SKILL.md`, `.claude/agents/*.md`, `plugins/*/agents/*.md`, `CLAUDE.md` | 10203 | 157 | 12 | 22 | 34 |
| `rules/rule-authoring.md` | `.claude/rules/**/*.md`, `rules/**/*.md` | 1607 | 30 | 2 | 4 | 6 |
| `.claude/rules/user-global-rules.md` | `rules/**/*.md`, `.claude/rules/**/*.md` | 1948 | 36 | 3 | 7 | 10 |
| `rules/skill-authoring.md` | `.claude/skills/*/SKILL.md`, `plugins/*/skills/*/SKILL.md` | 3938 | 66 | 5 | 13 | 18 |
| `rules/agent-authoring.md` | `.claude/agents/*.md`, `plugins/*/agents/*.md` | 2915 | 48 | 4 | 9 | 13 |
| `rules/claude-md-authoring.md` | `CLAUDE.md` | 2211 | 56 | 4 | 14 | 18 |
| `rules/notes-authoring.md` | `notes/**` | 3348 | 65 | 4 | 9 | 13 |
| 合計 | | 31394 | 578 | 47 | 105 | 152 |

※ 表 2 paths 一致で載る rule の実測（2026-09-01）

`rules/markdown-formatting.md` の paths は `**/*.md` なので、Markdown ファイルを 1 つでも読み書きする
セッションでは実質的に常時ロードと同じ量が載る。`.md` を触るときは、これに
`rules/claude-doc-authoring.md` と `rules/rule-authoring.md`（rule ファイルの場合）が重なる。

### paths をどのファイルにも一致させないもの（8 本）

45,613 バイト・690 行。定義 A で 59 条項、定義 B で 261 条項。
すべて `paths: - "never-match-reference-only"` を持ち、他の文書からの参照経由の Read でのみ載る。

| ファイル | 読ませる入口 | バイト | 行 | 節 | 箇条書き | 定義 B |
| --- | --- | --- | --- | --- | --- | --- |
| `rules/japanese-text-writing/references/core.md` | `rules/japanese-text-writing.md`（まとまった文章のとき） | 24284 | 326 | 23 | 103 | 126 |
| `rules/japanese-text-writing/references/user-confirmation.md` | `rules/japanese-text-writing.md`（確認・質問のとき） | 3137 | 42 | 4 | 16 | 20 |
| `rules/japanese-text-writing/references/decision-docs.md` | `core.md` の分類判定 | 5477 | 84 | 6 | 29 | 35 |
| `rules/japanese-text-writing/references/narrative-docs.md` | `core.md` の分類判定 | 5610 | 91 | 10 | 25 | 35 |
| `rules/japanese-text-writing/references/reference-docs.md` | `core.md` の分類判定 | 2496 | 45 | 4 | 11 | 15 |
| `rules/japanese-text-writing/references/explanatory-docs.md` | `core.md` の分類判定 | 2331 | 44 | 5 | 8 | 13 |
| `rules/japanese-text-writing/references/academic-docs.md` | `core.md` の分類判定 | 1079 | 30 | 4 | 5 | 9 |
| `rules/decision-record/references/notes-format.md` | `rules/decision-record.md` | 1199 | 28 | 3 | 5 | 8 |
| 合計 | | 45613 | 690 | 59 | 202 | 261 |

※ 表 3 参照経由でのみ載る規範の実測（2026-09-01）

日本語で複数段落の文章を書く場面では、`rules/japanese-text-writing.md`（常時ロード、18 行）から
`core.md`（326 行）へ入り、さらに分類別の 1〜2 本が重なる。判断文書を書く場合は
`core.md` + `decision-docs.md` = 410 行・29,761 バイトが上乗せされる。

## 4. 観測: 過去の実測値との比較

過去の記録は 3 つの単位（バイト・行・条項）で残っており、対象範囲がそれぞれ違う。
範囲ごとに並べる。

### バイト数（対象は `rules/` 直下の常時ロードのみ、`.claude/rules/` を含まない）

| 測定日 | 本数 | 値 | 出典 |
| --- | --- | --- | --- |
| 2026-07-30 | 6 | 10.3 KB | `.handover/archive/2026-07-30-norm-placement-and-enforcement.md:144` |
| 2026-07-31 | 7 | 11.6 KB | `.handover/archive/2026-08-10-session-record-norm-placement.md:51`、`notes/artifacts/norm-refit-form-sources.md:164` |
| 2026-08-10 | 8 | 12.5 KB | `.handover/archive/2026-08-10-norm-placement-and-enforcement.md:99` |
| 2026-09-01 | 8 | 21129 バイト（21.1 KB / 20.6 KiB） | 本文書（表 1） |

※ 表 4 常時ロード（user global のみ）のバイト数の推移

過去 3 件の逐語。

> "常時ロードされる rule の合計は 10.3 KB（`paths` 付きの markdown-formatting.md を除く）。"
>
> 出典: `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/.handover/archive/2026-07-30-norm-placement-and-enforcement.md`

> "常時層は 7 本 11.6 KB になった（総量削減方針との緊張は認識。安全規範なので許容と判断）。
> フォームの実測値（gloss・説明 2）も更新済み"
>
> 出典: `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/.handover/archive/2026-08-10-session-record-norm-placement.md`

> "常時（paths なし）rule は 8 本 12.5 KB（paths 付き markdown-formatting を除く実測。2026-08-10）"
>
> 出典: `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/.handover/archive/2026-08-10-norm-placement-and-enforcement.md`

過去の値が KB（10 進 1000）か KiB（2 進 1024）かは記録に書かれていないため未確認。
今回の値は両方を併記した。2026-08-10 以降、バイトでの測定は残っていない。

### 行数

| 測定日 | 対象 | 本数 | 行 | 出典 |
| --- | --- | --- | --- | --- |
| 2026-08-15 | `rules/` 直下 常時 | 9 | 228 | `notes/artifacts/norm-refit-impl-inventory.md:26` |
| 2026-08-18 | `rules/` 直下 常時 | 9 | 252 | `notes/norm-refit.md:729` |
| 2026-08-19 | `rules/` 直下 常時（main） | 9 | 298 | `notes/artifacts/norm-refit-impl-inventory.md:13` |
| 2026-08-19 | `rules/` 直下 常時（PR 1 ブランチ） | 8 | 265 | `notes/artifacts/norm-refit-form-sources.md:2916` |
| 2026-09-01 | `rules/` 直下 常時 | 8 | 328 | 本文書（表 1） |
| 2026-08-19 | `.claude/rules/` | 3 | 201 | `notes/artifacts/norm-refit-form-sources.md:2916` |
| 2026-08-20 | `.claude/rules/` | 3 | 198 | `notes/norm-refit.md:928` |
| 2026-09-01 | `.claude/rules/` 常時 | 4 | 286 | 本文書（表 1） |
| 2026-08-19 | 常時ロード合計 | 11 | 466 | `notes/artifacts/norm-refit-form-sources.md:2916` |
| 2026-09-01 | 常時ロード合計 | 12 | 614 | 本文書（表 1） |
| 2026-08-19 | 全層（rule 全ファイル） | 20 | 1033 | `notes/artifacts/norm-refit-form-sources.md:3826` |
| 2026-09-01 | 全層（rule 全ファイル） | 28 | 1882 | 本文書（表 1〜3） |

※ 表 5 行数の推移

2026-08-19 の全層測定の逐語。

> "あわせて、常時ロードの測定が半分しか数えていなかった。実際は 466 行で、うち 201 行はこれまで一度も計算に入っていない。"
>
> 出典: ccm-f028（`/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/notes/artifacts/norm-refit-form-sources.md`）

### 条項数

ccm-f029（2026-08-19、main の `b2a0a7b` 時点）の表 2 が層ごとに「見出し」「箇条書き」を数えている。
今回の定義 A / 定義 B と同じ数え方に見えるが、フェンスやネストの扱いが記録に書かれていないため、
数え方の一致は未確認。

| 層 | 2026-08-19 見出し / 箇条書き | 2026-09-01 見出し / 箇条書き |
| --- | --- | --- |
| `rules/` 直下 常時 | 24 / 46（9 本） | 27 / 54（8 本） |
| `markdown-formatting.md` | 16 / 40 | 13 / 27 |
| `references/notes-format.md` | 2 / 5 | 3 / 5 |
| `.claude/rules/` | 12 / 44（3 本） | 19 / 61（4 本、常時のみ） |
| japanese-text-writing 詳細規範 | 32 / 122（6 本） | 56 / 197（7 本） |
| 合計 | 86 / 257（20 本） | 118 / 344（21 本） |

※ 表 6 条項数の比較（2026-08-19 の出典は `notes/artifacts/norm-refit-form-sources.md:3826`）

表 6 の合計は、2026-08-19 の測定に対応する層だけを足したもの。
2026-08-19 の時点に存在しなかった 7 本（`agent-authoring.md`・`claude-doc-authoring.md`・
`claude-md-authoring.md`・`notes-authoring.md`・`rule-authoring.md`・`skill-authoring.md`・
`.claude/rules/user-global-rules.md`、合わせて 34 見出し / 78 箇条書き）は表 6 の外にある。
28 本すべてでは 152 見出し / 422 箇条書き。

ほかに、対象範囲の違う条項数の記録が 2 件ある。

> "rules/ 3 本と 5 plugin（…）から、指示単位で 321 件を抽出した。"
>
> 出典: f001 表 1（`/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/notes/artifacts/norm-refit-form-sources.md`）

> "結論: 規範インベントリ 321 件の対象 15 略号 35 ファイルから条項を抽出し直し、1349 件を得た。"
>
> 出典: `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/notes/norm-refit.md`

この 2 件は plugin の skill / agent も含む範囲で、rule だけを測った今回の数値とは比較できない。

## 5. 観測: 同時に満たせない条項の組

7 件。各件で両方の条項を逐語で引き、衝突する場面を書く。

### 5-1. 確認を 1 件ずつ出すか、1 つのフォームにまとめるか

> "確認は 1 件ずつ出す。判断が 2 件以上あるなら 1 メッセージに並べず、順に出す"
>
> 出典: ユーザーへの確認の規範（`rules/japanese-text-writing/references/user-confirmation.md`）

> "ユーザーへの判断の確認は、決めなければならない判断を洗い出して 1 つのフォームにまとめる。
> 1 件ずつ小分けに問わない"
>
> 出典: norm-refit の開発運用（`.claude/rules/norm-refit-ops.md`）

この repo で norm-refit の作業中に判断が 2 件以上出たとき、前者は 1 件ずつ順に出すことを求め、
後者は 1 件ずつ問うことを禁じる。どちらが優先かはどちらのファイルにも書かれていない。

### 5-2. 確認の分割と HTML フォーム化

> "設問が多い・前提説明が長い確認は HTML フォームにする。"
>
> 出典: 日本語テキストの詳細規範: 共通原則（`rules/japanese-text-writing/references/core.md`）

> "何を問わず何を問うか、問い方、回答や指摘を受けた後の進め方を定める。ターミナルの返答でも HTML フォームでも同じ。"
> "確認は 1 件ずつ出す。判断が 2 件以上あるなら 1 メッセージに並べず、順に出す"
>
> 出典: ユーザーへの確認の規範（`rules/japanese-text-writing/references/user-confirmation.md`）

設問が複数ある確認では、前者は 1 つの HTML フォームに設問を並べることを求め、
後者は自身が HTML フォームにも適用されると宣言したうえで 1 メッセージに 2 件以上並べることを禁じる。
5-1 と違い、この 2 本はどちらも `rules/japanese-text-writing.md` を入口とする同じ体系の中にある。

同じ `user-confirmation.md` の中に、複数設問を前提にした条項もある。

> "設問を出し切ったかは自分で判断する。「まだ質問はありますか」のように、続ける設問の有無だけを尋ねるターンを挟まない"
>
> 出典: ユーザーへの確認の規範（`rules/japanese-text-writing/references/user-confirmation.md`）

「出し切る」は 1 メッセージに複数の設問を出す運用を前提にしている。

### 5-3. rule の why に実例を書けるか

> "汎用 rule に固有事例を書くのは why の実例として最小限に留め、例と分かる形にする"
>
> 出典: 参照ドキュメントの規範（`rules/japanese-text-writing/references/reference-docs.md`）

> "日付付きの具体事例を書かない。事例は書いた時点の場面に縛られ、場面の形が変わると
> 指示項目を支えなくなる。事例から抽出した構造だけを理由として残す"
> "判定基準: 書いた why を過去形にできるか。できるなら経緯が混ざっている。"
>
> 出典: Claude 向け文書の書き方（`rules/claude-doc-authoring.md`）

rule ファイルの why を書く場面で両方が同時に効く。`reference-docs.md` は rule を適用対象に
明記しており（"rule・CLAUDE.md・skill などの規範・運用文書"）、`claude-doc-authoring.md` は
paths `rules/**/*.md` と `.claude/rules/**/*.md` で載る。前者は実例を最小限なら許し、後者は
日付付きの具体事例と過去形にできる why を禁じる。現物の `.claude/rules/plugin-release.md` の why は
"why: 実例が 2 件ある。2026-08-22 に HTML ページのセクション番号を見出しの外へ出す変更を入れたが、"
で始まり、前者を満たして後者に反している。

### 5-4. 詳細規範が他の規範への誘導と層の関係を持てるか

> "外側の構造に言及しない。「この文書は X から参照される」「Y から起動される」のような呼ばれ方も、
> 「共通原則の上にこれを重ねる」のような層の関係も書かない。
> どの文書を読ませるかの誘導は、入口・呼び出す側が持つ"
>
> 出典: Claude 向け文書の書き方（`rules/claude-doc-authoring.md`）

> "詳細規範は、入口 rule から分岐されたことも他に規範があることも知らない設計にする。
> 読み手をどの文書へ辿らせるかは入口 rule だけが持つ。"
> "入口 rule は常時ロードで判定と誘導だけを持ち（約 20 行）、詳細規範は `rules/{入口名}/references/` 配下に置いて、
> ロード方式を参照専用にする"
>
> 出典: 配布用 user global rule の運用（`.claude/rules/user-global-rules.md`）

`core.md` は `references/` 配下の参照専用（つまり詳細規範の位置）でありながら、分類判定で 5 本の
分類別規範への誘導を持ち、"共通原則と分類別規範が衝突したら、分類別規範を優先する"
"該当する分類の詳細規範を読み、個別規範を重ねる" という層の関係を書いている。
`core.md` を書き直す場面で、この 2 条項が現状の構造を否定する。
`claude-doc-authoring.md` には "読み手を辿らせる責任がその文書にあるとき（入口 rule、呼び出す側の skill）は、
自動ロードされない参照先への参照を書く" という例外があるが、`user-global-rules.md` の入口 rule は
「常時ロードで約 20 行」と定義されており、参照専用で 326 行の `core.md` はその定義に当たらない。

### 5-5. CLAUDE.md にディレクトリ構成を書くか

> "書くもの（例）:"
> "- ディレクトリ構成の概要"
>
> 出典: CLAUDE.md の書き方（`rules/claude-md-authoring.md`）

> "実際のコードやディレクトリを見れば分かる情報。ディレクトリ構成の転写、
> 関数のシグネチャ一覧、ファイル数、コード行数、実コードのコピーが対象。
> 二重管理はメンテ負荷と乖離リスクを生む"
>
> 出典: Claude 向け文書の書き方（`rules/claude-doc-authoring.md`）

CLAUDE.md を編集すると両方の paths が一致して同時に載る。「概要」と「転写」を分ける基準は
どちらにも書かれていない。現物の `CLAUDE.md` は 20 行のディレクトリツリーと、
plugin の version 番号を写した表を持っており、境目が運用で定まっていないことを示している。

### 5-6. plugin の変更を main へ直接 push するか PR にするか

> "plugin の内容 (skills/agents/hooks/scripts) を変更したら、必ず以下を一連で実行する:"
> "4. `git commit` + `git push`"
> "5. `claude plugins marketplace update cc-tools`"
>
> 出典: Plugin 更新手順（`.claude/rules/plugin-release.md`）

> "実装は必ず PR にする。main へ直接入れない。PR に notes を混ぜない。"
>
> 出典: norm-refit の開発運用（`.claude/rules/norm-refit-ops.md`）

どちらも常時ロードの project rule。norm-refit の作業で plugin を変更したとき、前者の手順 4 を
「一連で」実行すると main へ直接入り、後者に反する。手順 5 と 6（marketplace / plugin の update）は
merge されるまで実行できないので、「一連で実行する」という指定自体が PR 経由では満たせない。

### 5-7. notes の冒頭を表にするか箇条書きにするか

> "各ファイルの本文より前に、目的・生存期間・対象タスクの表を書く。"
>
> 出典: notes の書き方（`rules/notes-authoring.md`。表の列見出しは「項目」「書く内容」）

> "比較表か対応表か、それとも並列の列挙かで迷ったら、列を上から下へ読む。1 つの列に同じ種類の値
> （すべて日付、すべて可否など）が並び、列どうしを比べられるなら表にしてよい。列に並ぶ値の種類がばらばらで、
> 列見出しが「名前」「説明」のような項目の属性名でしかないなら、並列の列挙なので箇条書きにする"
>
> 出典: 日本語テキストの詳細規範: 共通原則（`rules/japanese-text-writing/references/core.md`）

notes ファイルの冒頭を書く場面で、前者は表を必須にし、後者の判定は列見出しが属性名だけの表を
箇条書きへ回す。`core.md` の同じ節の冒頭 "表にしてよいのは 2 つ。列が選択肢で行が観点の比較表と、
キーから別の値を引く対応表" では対応表として許されるので、`core.md` の中でも 2 つの基準が
同じ表を別の側へ振り分ける。

## 6. 観測: 優先順位が明記されているもの

衝突として数えず列挙する。9 件。

- `core.md` "共通原則と分類別規範が衝突したら、分類別規範を優先する"
- `core.md` "1 つの文書が複数の分類の側面を持つとき、冒頭・節の順序・末尾は主目的の分類の規範で決める。
  節・段落の中は、その部分を読み終えた読者に求めるもの（選ぶことか、後で選ぶための理解か）の
  分類の規範を優先する"
- `claude-doc-authoring.md` "上から順に判定し、最初に当たった種別で作る"（種別の 6 分岐）
- `claude-doc-authoring.md` "知識・規約は、paths で絞れるなら rule に置く"（rule と参照知識 skill の優先）
- `japanese-text-writing.md` の 3 分岐（数行の応答 / 確認・質問 / まとまった文章）
- `skill-invocation.md` "コンテキスト残量の節約は省略の理由にならない。skill 本文のロードはその作業の一部"。
  `subagent-delegation.md` の "判断の基準はコンテキストの節約" に対する優先を明記している
- `propose-before-implement.md` "系列の進行承認（例: 「順番にやろう」「進めて」）は、その工程の中で新たに生じる
  個別の設計判断への承認を含まない"
- `bash-state-mutation-isolation.md` "「まとめれば速い」という効率より、「途中で切れたら復旧が走らない」という
  シェル連結の性質と、その操作の失敗時被害を優先して評価する"
- `user-global-rules.md` "`rules/` に置くのは、どのプロジェクトのどのセッションでも効かせたい自分用の規範だけ"
  と "このプロジェクトでだけ効かせる規範は `.claude/rules/` に置く"（配置の切り分け）

## 7. 観測: 衝突と判定しなかった組

条件や配置で解消するため、5 の一覧から外したもの。

- `core.md` の "「2026-08-15 に確定」「f017 で決めた」のような、決定の回や日付を指す括弧書きを本文に置かない" と
  `decision-record.md` の "出典（決定した回・フォーム・issue へのリンク）"。後者はエントリの項目として
  記録することを求めており、本文の括弧書きとは配置が違う。ただし `.claude/rules/norm-refit-ops.md` には
  "（書かないと実装時に拾われない。2026-08-25 の観測エントリ）" という前者が禁じる形が残っている
- `decision-docs.md` の "後で参照する必要のない固有名（ファイル名・関数名・識別子）を本文に出さず、
  一般的な言い方で済ませる" と `reference-docs.md` の "識別子（ファイル名・パス・コミット ID）そのものが
  情報にあたり、常に言及する側になる"。分類が違い、`core.md` の優先規定が扱う
- `subagent-delegation.md` の "ツールを 1 つも呼ばないターンは、ユーザーから見ると停止と区別がつかない" と
  `propose-before-implement.md` の承認要求。前者の判定基準 "いま返そうとしているメッセージに、
  待っていること以外の中身があるか" を承認の依頼は満たす
- `markdown-formatting.md` の "行の折り返し位置" と `core.md` の "原文の改行位置"。内容は一致しており、
  同じ条項が 2 本に書かれている重複であって衝突ではない

## 8. 解釈

### 常時ロードの増分がどこから来ているか

2026-08-19 から 2026-09-01 のあいだに常時ロードは 466 行から 614 行へ 148 行増えた。
内訳は user global が 265 行（PR 1 ブランチ）から 328 行、project rule が 201 行から 286 行。
project 側の増分 85 行のうち 67 行は `.claude/rules/norm-refit-ops.md` 1 本で、これは
"norm-refit-v2 が完了したらこのファイルごと削除する" と自身に生存期間を書いている。

### 参照専用の層に量が集まっている

行数で見ると、参照専用の 690 行が常時ロードの user global 328 行の 2 倍を超える。
このうち `core.md` 単独で 326 行あり、まとまった文章を書くたびに載る。
一方で `academic-docs.md`（30 行）は `core.md` の分類判定を経由しないと載らない。
量の配分は「載る頻度」ではなく「分類の粒度」で決まっている。

### 衝突が起きている位置

7 件のうち 4 件（5-1・5-3・5-4・5-5）は、同じ対象に複数の層から条項が降りている箇所で起きている。
`rules/**/*.md` を編集する場面では `claude-doc-authoring.md`・`rule-authoring.md`・
`user-global-rules.md`・`markdown-formatting.md` の 4 本が paths 一致で載り、
そこへ `core.md` と分類別規範が参照経由で重なる。重なる本数が多いほど、
同じ論点を別の言葉で定めた条項が同席する。

残る 3 件（5-2・5-6・5-7）は、後から足した条項が既存の条項を打ち消す形になっている。
5-1 と 5-6 は `.claude/rules/norm-refit-ops.md` が絡んでおり、この rule が
既存の運用 rule（`plugin-release.md`）と共通規範（`user-confirmation.md`）の両方を上書きしている。
どちらのファイルにも上書きの関係は書かれていない。

### 衝突の解消に使える既存の仕組み

`core.md` は共通原則と分類別規範の優先を定義しているが、その優先規定が届く範囲は
`core.md` と `references/` 配下の 5 本に限られる。
種別別の authoring rule（`claude-doc-authoring.md`・`rule-authoring.md` ほか）と分類別規範の関係、
project rule と user global rule の関係は、どこにも定義されていない。
5-3 と 5-4 はこの未定義部分に落ちている。

## 9. 未確認

- 過去の KB 値（10.3 / 11.6 / 12.5）が 10 進 KB か 2 進 KiB かは、記録に単位の定義が無いため未確認
- ccm-f029 の「見出し」「箇条書き」の数え方（コードフェンス内の扱い、ネストの扱い）は
  記録に書かれていないため、今回の定義 A / 定義 B と同一かは未確認。表 6 の比較はこの前提の上に立つ
- `plugins/*/skills/*/SKILL.md` と `plugins/*/agents/*.md` はセッションに載る規範だが、
  今回の依頼の対象外なので測っていない。条件ロードの rule（`skill-authoring.md`・`agent-authoring.md`）と
  合わせて重なる量は未算出
- `rules/japanese-text-writing/references/explanatory-docs.md` の全 4 節は
  `narrative-docs.md` の同名 4 節と 1 文字も違わない（`diff` で確認）。
  これが意図した重複か、片方を消し忘れたものかは未確認
