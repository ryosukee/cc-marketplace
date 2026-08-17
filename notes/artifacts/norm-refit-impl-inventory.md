# norm-refit 実装の変更棚卸し

作成 2026-08-15。台帳・T3 明細・引用マージ案と実ファイルを突き合わせた実測。
行数は `wc -l` / `rg` の実測で、新規作成分だけ推定。

分割 PR の単位は未確定。候補は末尾。確定は台帳 [norm-refit 台帳](../norm-refit.md) が正。

## 常時 rule の総量検算

**純減**。228 行 → 189〜205 行（10〜17% 減）。

現状の常時ロード対象は `rules/` 直下で paths frontmatter を持たない 9 ファイル、合計 228 行
（subagent-delegation 47 / decision-record 33 / primary-sources-first 32 /
user-communication-format 30 / japanese-text-writing 29 / bash-state-mutation-isolation 21 /
propose-before-implement 19 / skill-invocation 14 / background-task 3）。

| ファイル | 現 | 後 | 差 |
| --- | --- | --- | --- |
| japanese-text-writing.md | 29 | 20 | −9 |
| user-communication-format.md | 30 | 0 | −30 |
| propose-before-implement.md | 19 | 29〜35 | +10〜16 |
| primary-sources-first.md | 32 | 22〜32 | 0〜−10 |
| 他 5 ファイル | 118 | 118 | ±0 |

新設する詳細規範 4 ファイル（380〜460 行）は paths 除外により常時層に載らない。
repo 全体では 100〜180 行の純減（plugin 側の削除 524 行に対し新 references 380〜460 行）。

> [!WARNING]
> 検算上の最大のリスクは、新 references 4 ファイルの paths 除外 frontmatter の付け忘れ。
> ハーネスは `rules/` 配下を subdir まで再帰的に常時ロードするため（2026-08-14 プローブ実測）、
> 忘れると常時層が 228 行から 570〜670 行に膨らむ。
> この挙動は非公開仕様依存で、known-issues の `rule-paths-exclusion-undocumented` が監視している。

## 変更の一覧

### rules 層（user global、symlink で即時反映）

| # | パス | 操作 | 内容 | 行数 |
| --- | --- | --- | --- | --- |
| A1 | `rules/japanese-text-writing.md` | 改稿 | 29 → 約 20 行。共通原則の節を全削除し core へ。残すのはタイプ判定と数行返答の最小規範の 2 節 | −29 / +20 |
| A2 | `rules/user-communication-format.md` | 削除 | 30 行。形式判定は A1 のタイプ判定へ統合 | −30 |
| A3 | `rules/japanese-text-writing/references/core.md` | 新規 | 共通原則 7 節 + 分類判定表 + f004 実文群 + 引用/出典/エビデンス節 + 表規範 3 群 + 見出し共通句 + 「あなた」禁止 + 固有名 2 規範 + AI 口調 8 型。paths 除外必須 | +200〜260 |
| A4 | `rules/japanese-text-writing/references/reference-docs.md` | 新規（移設圧縮） | core へ上がる分を削除。残すのは到達性・手順の再現性・関心事の分離の適用形・文体 | +35〜40 |
| A5 | `rules/japanese-text-writing/references/decision-docs.md` | 新規（統合） | decision-docs 35 + academic-writing 34 の統合。末尾に論文の追加適用節 | +55〜65 |
| A6 | `rules/japanese-text-writing/references/{解説読み物}.md` | 新規（統合） | explanatory 37 + narrative 74 の統合。読み物の例外だけを残す | +85〜95 |
| A7 | `rules/markdown-formatting.md` | 改稿 | (a) スコープ宣言を詳細規範への参照へ（plugin 解体で参照が壊れる）。(b) 引用ブロック節 66 行を新記法へ差し替え。(c) 表の記法節は追加なし | 70〜80 |
| A8 | `rules/propose-before-implement.md` | 追記 | AQ9「実行中に手段が変わったら確認に戻る」を移設 | +10〜16 |
| A9 | `rules/primary-sources-first.md` | 改稿 | core の裏取り節との重複整理。**方針未確定** | 0〜−10 |
| A10 | `rules/decision-record.md` | 改稿 | 相対リンクを新階層へ | ±1 |
| A11 | `rules/references/notes-format.md` | 移設 | `rules/decision-record/references/` へ `git mv`。中身は変更なし | 移動 29 |

### japanese-text-writing plugin の解体

| # | 対象 | 内容 | 行数 |
| --- | --- | --- | --- |
| B1 | plugin 全 6 ファイル | 削除（SKILL 131 / reference-docs 45 / decision-docs 35 / academic 34 / explanatory 37 / narrative 74 / plugin.json 5） | −361 |
| B2 | `.claude-plugin/marketplace.json` | plugin エントリ 5 行を削除 | −5 |
| B3 | `README.md` | plugin 一覧行・rule 表・install コマンド行 | 5〜8 |
| B4 | `CLAUDE.md` | authoring 系の列挙・plugin 一覧・`rules/` の構成説明 | 5〜8 |
| B5 | `.claude/rules/coding.md` | 「`rules/` はフラット構成」が新階層と矛盾する。**台帳に記載なし**。protected directory のため dotclaude-writer 経由が必須 | 2〜4 |
| B6 | `textlint-plan.md` | plugin への言及 2 箇所。**台帳に記載なし** | 2 |

### ask-with-choices の廃止

| # | 対象 | 内容 | 行数 |
| --- | --- | --- | --- |
| C1 | `skills/ask-with-choices/SKILL.md` | 削除。163 行 | −163 |
| C2 | `skills/html-communication/SKILL.md` | AQ 相対リンク 3 箇所（L16 / L151 / L313）。L313 は回答後フローの本文化が必須。AQ8 を設問設計節へ移設。表規範 2 件（L177-179）を削除し core を参照 | 40〜60 |
| C3 | `references/facet-review-norms.md` | L49-51 の「」前提の verbatim 規範を新記法へ | 5〜8 |
| C4-C6 | plugin README / plugin.json / marketplace.json | 記述削除と version bump | 5 |

### AskUserQuestion の除去（f008 Q4）

grep 実測で repo 内 82 出現 / 15 ファイル。

| 対象 | 出現数 |
| --- | --- |
| impl-spec（requirements 5 / design 5 / test-plan 6） | 16 |
| dotclaude（doctor 8 / registry 3 / cross-review 1 / repo-profiler 1） | 13 |
| mkdocs-setup（うち 1 件は frontmatter の `allowed-tools` 宣言） | 6 |
| session（start L73 / retrospective L102。不使用指定で新方針と整合） | 2 |
| claude-known-issues の台帳テンプレート（`askuserquestion-rendering` の更新が必須） | 5 |
| cc-transcript の `extract.sh`（jq のツール名判定。使用指示ではないため対象外） | 1 |

書き換えは 60〜90 行。DG17 系（曖昧表現禁止・品質基準）を巻き込まないよう、
対象を AskUserQuestion 言及行に限定する。

### session の代替手順削除（f001 Q9）

| 対象 | 行 |
| --- | --- |
| `skills/start/SKILL.md` | 52-54（3 行） |
| `skills/handover/SKILL.md` | 44（1 行） |
| `skills/retrospective/SKILL.md` | 97（1 行） |
| `claude-known-issues` の `task-tools-unavailable` エントリ | 3 行。**台帳に記載なし**。削除で workarounds の前提が消える |

debrief と end に該当記述はない（実測）。

### 引用記法の適用

鉤括弧の残存 4 箇所: facet-review-norms L49-51 / narrative-writing L56 /
dotclaude-claude-scanner L102・L155 / cross-review SKILL L177。

引用ブロックの書き換え 3 ファイル: `.claude/rules/plugin-design.md` L92-94（**protected
directory のため dotclaude-writer 経由**）/ `rules/markdown-formatting.md` /
`notes/artifacts/ja-ambiguity-survey.md` L420。

`plugins/github-pr/.../shared/external-citation.md` は意味規範を core 準拠に圧縮し、
PR 生成の実行手順だけ残す（plugin 自己完結原則により削除しない）。

## 依存関係

### 同一 PR に入れないと壊れる

1. A1（入口 rule の圧縮）+ A3〜A6（references 新設）。`rules/` は symlink で即時反映されるため、
   共通原則を削った時点で references が無いと全プロジェクトで規範が消える。**分割の最大の禁じ手**
2. A2（UC 削除）+ A1（タイプ判定の追加）。形式選択の規範がゼロになる
3. A10 + A11。片方だけだと rule 内の相対リンクが切れる
4. A3（core の表 3 群）+ A4（reference-docs から表規範を削除）。同じ rules 層なので同時反映
5. C1（AQ 削除）+ C2（回答後フローの本文化）。フローの規範がどこにも無くなる
6. B1（plugin 削除）+ A7(a)（スコープ宣言の書き換え）

### 順序があればよい

- A3（core の引用節）→ external-citation の圧縮
- A3・A7（記法の正）→ 鉤括弧 4 箇所・引用ブロック 3 ファイル
- A8（AQ9 の移設）→ C1（AQ 削除）。この向きなら空白期間がゼロ
- C1 → AskUserQuestion の全 plugin 除去 → known-issues 台帳の更新

### 反映タイミングの非対称

rules 層は symlink で即時、plugin は version bump と `claude plugins update` を経る。

危険なのは 1 つだけ。`rules/user-communication-format.md` は
「ask-with-choices skill を読み、その指示に従う」と書いているので、
UC を残したまま AQ を消すと **rule が存在しない skill を指す区間**ができる。
UC 削除が先、AQ 削除が後なら安全。

**rules 層の変更を先の PR に閉じ、plugin 側を後の PR に置く**限り、時間差で壊れる組み合わせはない。
逆順は 2 種類の参照切れを生む。

## 分割の候補

| 案 | 切り方 | PR 数 | 最大 PR | 評価 |
| --- | --- | --- | --- | --- |
| A | 層で切る（rules / plugin / 後始末） | 3 | 730 行 | 反映タイミングと PR 境界が一致する。ただし plugin 側の PR に「なぜ消すのか」の根拠が無く、ゼロベースで読めない |
| B | 主題で切る | 5 | 840 行 | 各 PR が 1 テーマで原資料がそのまま設計書になる。core.md を 2 PR で触る |
| C | 依存の谷で切る | 4 | 880 行 | 依存が直列 1 本。AQ 廃止と使用指示の除去が同居し因果が PR 内で閉じる |

案 C の内訳は、C-1 詳細規範の新設と plugin 解体 / C-2 引用マージ /
C-3 AskUserQuestion の全廃 / C-4 session と後始末。

どの案でも共通する制約は 3 点。

- A1 + A3〜A6 は必ず同一 PR
- rules 層の PR を plugin 側より先に出す
- core.md を 2 PR で触るのを避けたいなら、引用節を最初の PR に含める（その場合 1000 行前後になる）

## 台帳に記載がない未決事項

- 解説・読み物統合ファイルのファイル名
- 新 references 4 ファイルの paths 除外トークンの具体値（`notes-format.md` の値を踏襲するか）
- `rules/primary-sources-first.md` の処遇（探索順序を core へ移すか rule に残すか）
- version bump の幅
- README の rule 表に 3 rule が載っていない既存の漏れ（skill-invocation /
  propose-before-implement / bash-state-mutation-isolation）
- `rules/markdown-formatting.md` L10・L136 の「」による文書名・見出し名の引用
  （鉤括弧 4 箇所の対象外だが同種）
- `plugins/dotclaude/skills/registry/SKILL.md` L84 の「あなた」の実文の扱い
- 名詞構文の core 追加と DG14 の係り受け多義への拡張が、この実装スコープに入るか

## 参考

evals は `evals/dotclaude-writer/` のみ存在し、japanese-text-writing と
claude-user-communication のケースはゼロ（実測）。
plugin-release rule の「description 変更の release 前に該当 evals を回す」に該当する既存ケースはない。
