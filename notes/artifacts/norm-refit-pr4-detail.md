# norm-refit PR 4 AskUserQuestion の除去: 作業明細

実装者はこの明細だけを見て `plugins/impl-spec/`、`plugins/dotclaude/`、`plugins/mkdocs-setup/`、`plugins/session/`、
`plugins/claude-user-communication/` と `README.md`・`CLAUDE.md` を編集する。
行番号と件数はすべて main `f4fb82d` の実読・実測（2026-08-26）。

結論。AskUserQuestion への言及は plugin 内に 37 行あり、内訳は使用指示 35 行と不使用指定 2 行。
使用指示は「チャットのフリーテキストで問う。設問が 4 問を超える確認は HTML フォーム 1 枚にまとめる」へ書き換えるか、行ごと消す。
不使用指定 2 行（`session/skills/start/SKILL.md:80` = SS18、`html-communication/SKILL.md:15`）は道具名指しの否定を落として「テキスト出力のみ」の形にする。
除去は言及行だけに限定し、同居する他の条項は残す。計画 `norm-refit-plan.md:370-373` の 41 行との差は 3 件で、
claude-known-issues の雛形 5 行は PR 3 がエントリごと削除して 0 行になり、SS55（`retrospective/SKILL.md:107`）は session 2.12.0 で既に消え、
html-communication の 1 行は PR 3 が新しく書いた。既知バグ一覧の `askuserquestion-rendering` は PR 3 で resolved 側へ移り済みで、
PR 4 に残るのは配布済みファイルの `log` への 1 行だけ、かつ PR の外の直接作業になる。
触る plugin は 5 つで、いずれも記述の変更だけなので patch を上げる。

## A. 言及行の全件表（37 行）

### A-1. 数え合わせ

`git grep -n 'AskUserQuestion' -- plugins`（2026-08-26、main `f4fb82d`）の結果から、
言及行ではない 1 行（`plugins/cc-transcript/skills/cc-transcript/scripts/extract.sh:66`。transcript に現れたツール名を jq で整形する分岐）を除いた 37 行。

| plugin | 行数 | 計画の値 | 差の理由 |
| --- | --- | --- | --- |
| impl-spec | 16 | 16 | なし |
| dotclaude | 13 | 13 | なし |
| mkdocs-setup | 6 | 6 | なし |
| session | 1 | 1 | なし |
| claude-known-issues | 0 | 5 | PR 3 が雛形からエントリごと削除（C） |
| claude-user-communication | 1 | 計上なし | PR 3 の D で書いた HC5 の新しい字句（A-7） |

※ 表 1 plugin ごとの言及行数（2026-08-26 実測）と、計画 `norm-refit-plan.md:370-373` の 41 行との差

計画の 41 行は 2026-08-25 の観測で、PR 3（main `207932c`）のマージ前の値。
差し引きは 41 - 5 + 1 = 37 で、実測と一致する。

### A-2. 書き換えの型

言及行を 5 つの型で処理する。A-3 以降の表の「型」列はこの番号を指す。

| 型 | 適用する場面 | 操作 |
| --- | --- | --- |
| 1 | 単発〜少数の問い | 道具名を落とし、聞く手段を「フリーテキスト」と書く |
| 2 | 設問が 4 問を超える確認 | 道具名を落とし、「HTML フォーム 1 枚にまとめる」と書く |
| 3 | 手段を書かなくても文が成立する箇所 | 道具名の句だけ落とす |
| 4 | 禁止事項の「AskUserQuestion を使わずにテキストだけで質問しない」 | 行ごと削除する |
| 5 | 不使用指定 | 道具名指しの否定を落とす |

※ 表 2 書き換えの 5 つの型

型 1 と型 2 を 1 文にまとめる箇所（インタビュー工程の冒頭）では、次の定型文をそのまま使う。

```markdown
質問はチャットのフリーテキストで出し、設問が 4 問を超える確認は HTML フォーム 1 枚にまとめる。
```

「4 問を超える」の値は `plugins/claude-user-communication/skills/html-communication/SKILL.md:14`
「設問が概ね 4 問を超える確認」と同じ閾値だが、書き換え後の文はその skill も rule も指さず、閾値を各 plugin の中に書き切る。

書き換え後の文は rule を参照しない。37 行を 1 件ずつ確かめた結果は次の 2 点になる。

- 型 1〜5 のどの文にも `rules/` のパス・rule 名・詳細規範 `user-confirmation.md` への言及は無い。書くのは道具（フリーテキスト）と媒体（HTML フォーム）だけ
- 他 plugin の skill 名を新たに書くかは未決（未特定 2、ccm-f053 の設問 2 で確認中）。既定案は書かない
  （`plugin-design.md`「Plugin 自己完結」に従い、html-communication skill への参照を作らない）。
  既存の `plugins/session/skills/retrospective/SKILL.md:112` は言及行ではないので触らない

### A-3. impl-spec（16 行）

条項 ID は監査の名簿 `norm-audit-roster.md` の番号。処遇の出典は `norm-audit-verdict-dg35-49.md:85`
（DG46「確認手段をフリーテキスト / HTML フォームへ書き換える。禁止事項「テキストだけで質問しない」は削除」）。

`requirements/SKILL.md`

| 行 | ID | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| 52 | IS13 | - 引数なしの場合: AskUserQuestion で「何を実装したいですか?」と聞く | - 引数なしの場合: 「何を実装したいですか?」とフリーテキストで聞く | 1 |
| 110 | IS32 | AskUserQuestion を使って、要件の曖昧さを解消する。 | ユーザーに質問して、要件の曖昧さを解消する。（次の行に A-2 の定型文を足す） | 1 / 2 |
| 119 | IS40 | - AskUserQuestion の選択肢形式を活用する | - 選択肢を列挙できる判断は、選択肢を並べた形で問う | 3 |
| 178 | IS57 | - ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する | - ユーザーへの再質問が必要なもの: Phase 3 に戻り、ユーザーに確認してから修正する | 3 |
| 245 | IS83 | - AskUserQuestion を使わずにテキストだけで質問しない | 行ごと削除 | 4 |

※ 表 3 requirements/SKILL.md の言及行 5 件

行 110 の書き換え後は次の 3 行になる（行 111 は変更なし）。

```markdown
ユーザーに質問して、要件の曖昧さを解消する。
質問はチャットのフリーテキストで出し、設問が 4 問を超える確認は HTML フォーム 1 枚にまとめる。
設計判断 (どう実装するか) ではなく、要件 (何を作るか) に集中する。
```

`design/SKILL.md`

| 行 | ID | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| 75 | IS101 | - 引数なしの場合: AskUserQuestion でファイルパスを聞く | - 引数なしの場合: ファイルパスをフリーテキストで聞く | 1 |
| 148 | IS126 | AskUserQuestion を使って、設計の選択肢を確定させる。 | ユーザーに質問して、設計の選択肢を確定させる。（次の行に A-2 の定型文を足す） | 1 / 2 |
| 159 | IS137 | - AskUserQuestion の選択肢形式を活用する | - 選択肢を列挙できる判断は、選択肢を並べた形で問う | 3 |
| 199 | IS148 | - ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する | - ユーザーへの再質問が必要なもの: Phase 3 に戻り、ユーザーに確認してから修正する | 3 |
| 277 | IS181 | - AskUserQuestion を使わずにテキストだけで質問しない | 行ごと削除 | 4 |

※ 表 4 design/SKILL.md の言及行 5 件

`test-plan/SKILL.md`

| 行 | ID | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| 93 | IS211 | - 引数なしの場合: AskUserQuestion でファイルパスを聞く | - 引数なしの場合: ファイルパスをフリーテキストで聞く | 1 |
| 98 | IS212 | リンクがない場合は AskUserQuestion でパスを聞く。 | リンクがない場合はパスをフリーテキストで聞く。 | 1 |
| 155 | IS225 | AskUserQuestion を使って、テスト戦略の判断を確定させる。 | ユーザーに質問して、テスト戦略の判断を確定させる。（次の行に A-2 の定型文を足す） | 1 / 2 |
| 170 | IS230 | - AskUserQuestion の選択肢形式を活用する | - 選択肢を列挙できる判断は、選択肢を並べた形で問う | 3 |
| 277 | IS270 | - ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する | - ユーザーへの再質問が必要なもの: Phase 3 に戻り、ユーザーに確認してから修正する | 3 |
| 347 | IS298 | - AskUserQuestion を使わずにテキストだけで質問しない | 行ごと削除 | 4 |

※ 表 5 test-plan/SKILL.md の言及行 6 件

行 178 / 199 / 277（IS57 / IS148 / IS270）は、PR 3 が `rules/japanese-text-writing/references/user-confirmation.md:25` へ
複製した 13 件のうちの 1 件の原文。原文は消さない確定（`norm-refit-pr3-detail.md` の C-4、ccm-f051 Q1）があるので、
道具名の句だけを落として条項そのものは残す。

「質問の原則」節と「禁止事項」節には他の条項が同居しているので、節ごとは消さない
（申し送り 4、`norm-audit-implementation-notes.md:32-36`）。行 245 / 277 / 347 は削除だが、削除するのはその 1 行だけで、
同じ「禁止事項」節の他の箇条書きは残す。

### A-4. dotclaude（13 行）

dotclaude は監査の名簿の対象外なので条項 ID を持たない。処遇の出典は f008 Q4（台帳 `notes/norm-refit.md:287-288`
「AskUserQuestion の使用指示は impl-spec だけでなく全 plugin（dotclaude 13 箇所・mkdocs-setup 6 箇所を含む）から除去し、一括実装に含める」）。

`skills/doctor/SKILL.md`

| 行 | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- |
| 161 | その後、AskUserQuestion で実行モードを選ばせる: | その後、実行モードを選んでもらう: | 3 |
| 190 | 返ってきた tech stack 推定と codebase shape を AskUserQuestion の既定値として提示する。推定できた項目は確認、推定できない項目だけ自由入力で聞く。 | 返ってきた tech stack 推定と codebase shape を既定値として提示する。推定できた項目は確認、推定できない項目だけ自由入力で聞く。 | 3 |
| 204 | 質問は AskUserQuestion で 4 問ずつに分ける。既に明らかな項目はスキップする。codebase shape で推定できた項目は「こう見えたが合っているか」の確認に留める。 | 質問は HTML フォーム 1 枚にまとめる。既に明らかな項目はスキップする。codebase shape で推定できた項目は「こう見えたが合っているか」の確認に留める。 | 2 |
| 210 | drift 項目ごとに AskUserQuestion で以下を聞く: | drift 項目ごとに以下を聞く: | 3 |
| 217 | 選択結果は `pattern_decisions` として保持し、ステップ 7 で cluster-merger に渡す。drift 項目数が多い場合は AskUserQuestion を 4 問ずつに分ける。 | 選択結果は `pattern_decisions` として保持し、ステップ 7 で cluster-merger に渡す。drift 項目が 4 件を超える場合は HTML フォーム 1 枚にまとめる。 | 2 |
| 274 | AskUserQuestion で「全て承認」「個別に確認」「キャンセル」を選ばせる。 | 「全て承認」「個別に確認」「キャンセル」から選んでもらう。 | 3 |
| 299 | 2. 各リポジトリについて AskUserQuestion で「note を更新する / そのまま / 後で review する」を選ばせる | 2. 各リポジトリについて「note を更新する / そのまま / 後で review する」から選んでもらう | 3 |
| 452 | - **不明な点はユーザーに確認**: 推定で進めて誤った合成をするよりも、AskUserQuestion で確認する | - **不明な点はユーザーに確認**: 推定で進めて誤った合成をするよりも、ユーザーに確認する | 3 |

※ 表 6 doctor/SKILL.md の言及行 8 件

行 204 が型 2 なのは、直後の箇条書き（`:194-202`）が確認する項目を 9 件並べているため。
行 217 は件数が実行時に決まるので、閾値を書いた条件文にする。

`skills/cross-review/SKILL.md` と `skills/registry/SKILL.md`、`agents/dotclaude-repo-profiler.md`

| ファイル | 行 | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| `cross-review/SKILL.md` | 97 | scanner が「要確認クラスタ」を返してきた場合、AskUserQuestion で「同一クラスタに寄せるか、別クラスタとして扱うか」をユーザーに確認する。判断材料として scanner の要約と理由をそのまま提示する。 | scanner が「要確認クラスタ」を返してきた場合、「同一クラスタに寄せるか、別クラスタとして扱うか」をユーザーに確認する。判断材料として scanner の要約と理由をそのまま提示する。 | 3 |
| `registry/SKILL.md` | 69 |    - どちらも見つからなければ警告し、それでも追加するか AskUserQuestion で確認 |    - どちらも見つからなければ警告し、それでも追加するかを確認 | 3 |
| `registry/SKILL.md` | 82 | 7. AskUserQuestion で以下を確認: | 7. 以下の 5 件を HTML フォーム 1 枚にまとめて確認する: | 2 |
| `registry/SKILL.md` | 101 | 5. AskUserQuestion で削除確認 | 5. 削除してよいかを確認 | 3 |
| `agents/dotclaude-repo-profiler.md` | 104 | バケツ内でパターンが分裂している場合、`internal_drift: true` マークを付けて **両方のパターンを頻度付きで報告**。勝手に「正解はこちら」と決めない。doctor 側で AskUserQuestion により統合 / 両方許容を確定する。 | バケツ内でパターンが分裂している場合、`internal_drift: true` マークを付けて **両方のパターンを頻度付きで報告**。勝手に「正解はこちら」と決めない。doctor 側で統合 / 両方許容を確定する。 | 3 |

※ 表 7 dotclaude の残り 5 件

`registry/SKILL.md:82` が型 2 なのは、直下の箇条書き（`:83-90`）が role / owned / name / description / note の 5 件を確認しているため。
同じブロックの `:84`「**owned**: あなたの持ち物ですか?」の「あなた」は言及行ではないので触らない（H を参照）。

`registry/SKILL.md:69` は行頭に半角スペース 3 つのインデントを持つ番号付きリストの子項目で、表のセルでは失われている。
書き換えるときはインデントを現行のまま残す。

### A-5. mkdocs-setup（6 行）

`skills/mkdocs-setup/SKILL.md`

| 行 | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- |
| 14 | allowed-tools: Read, Edit, Write, Bash, Glob, AskUserQuestion | allowed-tools: Read, Edit, Write, Bash, Glob | 3 |
| 37 | 現在無効なオプションがある場合、AskUserQuestion（multiSelect）で有効にしたいものを選択させる。質問文の前に現在の状態を提示する: | 現在無効なオプションがある場合、有効にしたいものを複数選択で選ばせる。質問文の前に現在の状態を提示する: | 3 |
| 47 | 現在有効なオプションがある場合、AskUserQuestion（multiSelect）で無効にしたいものを選択させる: | 現在有効なオプションがある場合、無効にしたいものを複数選択で選ばせる: | 3 |
| 129 | - **セクションが存在し、テンプレートと異なる場合**: AskUserQuestion で既存の内容とテンプレートの内容を両方提示し、以下の選択肢を出す: | - **セクションが存在し、テンプレートと異なる場合**: 既存の内容とテンプレートの内容を両方提示し、以下の選択肢を出す: | 3 |
| 159 | 調査結果をもとに AskUserQuestion で以下を確認する: | 調査結果をもとに、以下の 5 件を HTML フォーム 1 枚にまとめて確認する: | 2 |
| 231 | 該当する設定がある場合、AskUserQuestion で以下を提示する: | 該当する設定がある場合、以下を提示する: | 3 |

※ 表 8 mkdocs-setup/SKILL.md の言及行 6 件

行 14 は frontmatter の `allowed-tools`。`description` は変えないので evals の実行は要らない（D-3）。
行 159 が型 2 なのは、直下の箇条書き（`:161-165`）が site_name / site_description / docs_dir / repo_url / repo_name の 5 件を確認しているため。

### A-6. session（1 行。SS18）

`skills/start/SKILL.md`

| 行 | ID | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| 80 | SS18 | AskUserQuestion は使わず、テキスト出力のみ。ユーザーが自由に返答できるようにする。 | テキスト出力のみ。ユーザーが自由に返答できるようにする。 | 5 |

※ 表 9 session/skills/start/SKILL.md の言及行 1 件

処遇の出典は申し送り 5（`norm-audit-implementation-notes.md:38-41`、逐語）。

> 「AskUserQuestion は使わず、テキスト出力のみ」から、道具名指しの否定を落として
> 「テキスト出力のみ」にする。ツールが消えた後は前半が意味を失う

判定は `norm-audit-verdict-dg35-49.md:86`（DG46「不使用指定は新方針と整合。ツール名指しの否定は「テキスト出力のみ」へ簡素化する」）。
申し送り 5 が SS18 と並べている SS55 は既に存在しない（B）。

### A-7. claude-user-communication（1 行）

`skills/html-communication/SKILL.md`

| 行 | ID | 実文（逐語） | 書き換え後の文 | 型 |
| --- | --- | --- | --- | --- |
| 15 | HC4 / HC5 | - テキストのまま: 短い報告、単発〜少数の質問（AskUserQuestion は使わず、チャットのフリーテキストで質問する） | - テキストのまま: 短い報告、単発〜少数の質問（チャットのフリーテキストで質問する） | 5 |

※ 表 10 html-communication/SKILL.md の言及行 1 件

この 1 行は PR 3 の D（`norm-refit-pr3-detail.md:444`）が旧 `:15-16`（HC4 と HC5）を 1 行に畳んで書いたもので、計画の 41 行には入っていない。
SS18 と同じ不使用指定なので、申し送り 5 の型 5 を同じように当てる。採否は未特定 1。

## B. SS55 は session 2.12.0 で既に消えている（観測）

申し送り 5 と計画は SS18 と SS55 の 2 件を簡素化の対象にしているが、SS55 の実文は現行の main に存在しない。

- 名簿の位置: `notes/artifacts/norm-audit-roster.md:1223`「`plugins/session/skills/retrospective/SKILL.md:107`」
- 監査時の実文（`notes/artifacts/norm-audit-raw/ss.md:475`、逐語）: `AskUserQuestion ではなく自由対話形式。`
- 現行の同ファイル `:107` は `tasks に登録した各項目について、自己検証・対話・承認・その場で反映を行う。` で、AskUserQuestion への言及は無い
- 消えた commit: `c77e69c`（feat(session): retrospective の項目提示に HTML の選択肢を足す (2.12.0)）。`git log -S` で特定
- 現行の `:108-112` は「出し方は件数で決める」「項目が 3 件以上: html-communication skill で 1 枚にまとめ、1 項目 = 1 設問にする」で、PR 4 が目指す形に既になっている

PR 4 で SS55 に対して行う作業は無い。

## C. 既知バグ一覧の `askuserquestion-rendering`

雛形と配布済みファイルの現状（2026-08-26 実測）。

- 雛形 `plugins/claude-known-issues/config/known-issues.template.yml`: エントリは削除済みで、残るのは `task-tools-unavailable` の 1 件。
  `git grep -n 'AskUserQuestion' -- plugins/claude-known-issues` は 0 件
- 配布済み `~/.claude/plugins/data/claude-known-issues-cc-tools/known-issues.yml`: エントリなし。
  `grep -c resolved_at` は 0
- 配布済み `~/.claude/plugins/data/claude-known-issues-cc-tools/known-issues.resolved.yml`: `:35-99` にエントリがあり、
  `resolved_at: '2026-08-26'`（`:98`）、`resolved_version: 2.1.246`（`:99`）

`dependents`（`:45-53`）は 3 項目で、ask-with-choices skill の廃止、html-communication skill の注記外し、解除時の手順の 3 つ。
`norm-refit-pr3-detail.md:790-791` が計画していた 4 項目め「(norm-refit PR 4 で実施) 他 plugin の AskUserQuestion の使用指示」は書かれていない。
`log` の最終行（`:97`、逐語）は次のとおりで、ワークアラウンドを持つ側が無くなったことを resolved の根拠にしている。

> '2026-08-26: AskUserQuestion を使わない構成へ移行し、依存が消えた (norm-refit PR 3 = PR #12。ask-with-choices skill を削除し、確認の規範を rules/japanese-text-writing/references/user-confirmation.md へ)。バグ自体は未修正 (refs 3 件とも OPEN) だが、ワークアラウンドを持つ側が無くなったので resolved へ移す'

PR 4 が消すのはレンダリングバグのワークアラウンドではなく使用指示なので、`dependents` に項目を足し直す必要は無い。
残るのは `log` への 1 行の追記だけで、これは repo の外のファイルなので PR には入れない（採否は未特定 6）。

配布済みファイルへの直接作業（PR 4 のマージ後に行う）:

1. `known-issues.resolved.yml` の `askuserquestion-rendering` の `log` の末尾（`:97` の次）へ 1 行足す。
   形式は既存行に合わせて `- '{日付}: {本文}'` にする。本文の案は
   `{日付}: 他 plugin の AskUserQuestion の使用指示 35 行を書き換え・削除し、不使用指定 2 行から道具名指しを落とした (norm-refit PR 4)。repo 内に言及は残っていない`
2. `resolved_at` と `resolved_version`（`:98-99`）は書き換えない。resolved になった日付は PR 3 の実施日で、PR 4 では変わらない
3. `known-issues.yml` と `state.json` は触らない

## D. plugin の release 作業

### D-1. version bump

version bump の粒度は f017 Q6 の確定（台帳 `notes/norm-refit.md:414-415`「version bump は skill の削除を伴う claude-user-communication が minor、
記述変更のみの plugin は patch」）に従う。PR 4 はどの plugin でも skill の追加・削除・発動条件の変更を伴わないので、5 件とも patch。

| plugin | 現行 | bump 後 | 変更の中身 | patch の根拠 |
| --- | --- | --- | --- | --- |
| impl-spec | 0.5.4 | 0.5.5 | 3 skill の 16 行（A-3） | 条項の字句のみ。工程・成果物・発動条件は不変 |
| dotclaude | 0.14.0 | 0.14.1 | 2 skill + 1 agent の 13 行（A-4） | 同上 |
| mkdocs-setup | 0.2.0 | 0.2.1 | 1 skill の 6 行（A-5） | `allowed-tools` から 1 件外すが処理フローは不変（未特定 5） |
| session | 2.12.0 | 2.12.1 | 1 skill の 1 行（A-6） | 不使用指定の字句のみ |
| claude-user-communication | 0.33.0 | 0.33.1 | 1 skill の 1 行（A-7） | 同上。未特定 1 で「触らない」を選ぶなら bump も不要 |

※ 表 11 触る plugin と bump 後の version

version の位置はどの plugin も `plugins/{plugin}/.claude-plugin/plugin.json:4`。
`description` はどれも AskUserQuestion に言及していないので変更なし。`.claude-plugin/marketplace.json` は version を持たないので変更なし。

### D-2. README.md と CLAUDE.md

どちらも version の数字だけを差し替える。概要の文は AskUserQuestion に言及していないので変えない。

| ファイル | 行 | 対象 |
| --- | --- | --- |
| `README.md` | 21 | dotclaude |
| `README.md` | 27 | session |
| `README.md` | 33 | impl-spec |
| `README.md` | 46 | mkdocs-setup |
| `README.md` | 53 | claude-user-communication |
| `CLAUDE.md` | 74 | dotclaude |
| `CLAUDE.md` | 75 | session |
| `CLAUDE.md` | 76 | impl-spec |
| `CLAUDE.md` | 78 | mkdocs-setup |
| `CLAUDE.md` | 80 | claude-user-communication |

※ 表 12 version の数字を差し替える行

### D-3. evals

実行しない。理由は 2 つで、どちらも 2026-08-26 の実測。

- `evals/` にケースが無い。中身は `README.md` と `run.sh` の 2 ファイルだけ
- PR 4 はどの plugin の `description` も、どの skill の `description` も変えない。
  `plugin-release.md`「Evals の作成・実行トリガー」の実行条件（`description` またはトリガー条件の変更）に当たらない

### D-4. マージ後

`plugin-release.md` の 4〜6 に従う。

1. `git commit` + `git push`
2. `claude plugins marketplace update cc-tools`
3. `claude plugins update impl-spec@cc-tools`、`dotclaude@cc-tools`、`mkdocs-setup@cc-tools`、`session@cc-tools`、`claude-user-communication@cc-tools`
4. C の配布済みファイルへの直接作業

## E. 実装時の注意

### E-1. 申し送り（`norm-audit-implementation-notes.md` から PR 4 に係る 2 件）

4.（`:32-36`、逐語）

> impl-spec の「質問の原則」「品質基準」節には DG17 系の条項（曖昧表現の排除・検証可能性）が
> 同居している。節ごと消すと巻き込む。**対象は 16 箇所**（旧明細の 18 は古い観測値、
> 実測 2026-08-20）

「品質基準」という名前の節は現行の 3 skill に無く、該当するのは「禁止事項」節（`requirements:239`、`design:271`、`test-plan:342`）。
「禁止事項」節で消すのは箇条書き 1 行だけで、節そのものは残す。「質問の原則」節は 1 行を書き換えるだけで何も消さない（A-3）。
16 箇所は 2026-08-26 の実測でも 16 で一致。

5.（`:38-41`）は A-6 と A-7 に反映した。SS55 の分は B のとおり作業なし。

### E-2. norm-refit-ops の手順

- 台帳の直近の確定との突合: PR 3（PR #12、main `207932c`）のマージ以降に積まれたエントリは 2 件で、
  `notes/norm-refit.md:1952`（段階 3 に PR 9 を足す）と `:1982`（PR 3 のマージの観測）。どちらも反映先に PR 4 の実装を持たない。
  PR を出す時点で数え直す
- セルフレビュー: markdownlint（触る SKILL.md 5 本 + `README.md` + `CLAUDE.md`）→ 相対リンクの解決
  （書き換えでリンクを増やさないので、既存リンクが壊れていないことの確認だけ）→ review agent（観点は規範の欠落と実文の改変）→ 指摘を直す → PR
- レビュー指摘の一般化の検討と、文レベルの修正の `notes/artifacts/sentence-level-review-cases.md` への逐語追記（出所付き）
- PR に notes を混ぜない。台帳・`norm-refit-plan.md` の現在地・`ccm-r003` の更新は main へ直接
- PR 4 は `rules/` を触らないので、PR ブランチを checkout してもセッションに載る規範は変わらない

### E-3. 検査している側

`plugin-release.md`「規範を変えたら、それを検査している側を一緒に直す」に従って `AskUserQuestion` で grep した結果（2026-08-26）。

- 検査スクリプト（`plugins/claude-user-communication/skills/html-communication/scripts/`、`plugins/session/skills/handover/scripts/`）に該当なし
- hook スクリプト（`plugins/*/scripts/hooks/`）に該当なし
- agent の指示は `plugins/dotclaude/agents/dotclaude-repo-profiler.md:104` の 1 件だけで、A-4 で書き換える
- plugin README に該当なし
- `plugins/cc-transcript/skills/cc-transcript/scripts/extract.sh:66` は transcript に記録済みのツール呼び出しを整形する分岐で、規範ではない。触らない（H）

## F. 未特定（実装者が決める判断）

「ユーザーに問う」と付けたものは、実装前に 1 つのフォームにまとめて問う（`.claude/rules/norm-refit-ops.md`「作業ブランチの注意」）。

1. 不使用指定 2 行（SS18 = `session/skills/start/SKILL.md:80`、HC4 / HC5 = `html-communication/SKILL.md:15`）から道具名指しを落とすか。
   既定案は落とす（申し送り 5 と DG46 の指定どおり）。代案は 2 行とも現状の文のまま残す。
   **ユーザーに問う**。落とすと、repo 内に AskUserQuestion を使うなと書いた箇所が 0 になる。
   ツール自体は harness に残っており、`rules/japanese-text-writing/references/user-confirmation.md` も入口 rule も不使用を指定していないので、
   使用を止める記述がどこにも無い状態になる（2026-08-26 実読）
2. 型 2 の文で HTML フォームの作り方を持つ skill（claude-user-communication の html-communication）を名指しするか。
   既定案は名指ししない（`.claude/rules/plugin-design.md`「Plugin 自己完結」。他 plugin の skill への依存を新たに作らない）。
   代案は名指しする。**ユーザーに問う**。名指ししない場合、impl-spec / dotclaude / mkdocs-setup は「HTML フォーム」という媒体名だけを持ち、
   作り方への導線を持たない。既存の `plugins/session/skills/retrospective/SKILL.md:112` は名指ししている
3. impl-spec の「4 問 / 5 問」の 4 行を同じ PR で消すか。対象は
   `requirements/SKILL.md:120`（IS41）`- 独立した質問は 4 問までまとめて聞く`、
   `requirements/SKILL.md:121`（IS42 / IS43）`- 5 問以上ある場合は複数回に分ける。分ける場合は事前に全体計画を提示する`、
   `design/SKILL.md:160`（IS138）と `test-plan/SKILL.md:171`（IS231）の `- 独立した質問は 4 問までまとめて聞く`。
   既定案は 4 行とも削除する。**ユーザーに問う**。
   判定は `norm-audit-verdict-dg35-49.md:63`（DG37「IS41, IS42, IS43, IS138, IS231 / 削除 / 現在地」）で削除だが、
   申し送り 4 と計画は PR 4 の対象を「言及行だけ」に限っており、この 4 行は言及行ではない。
   残すと、書き換え後の「設問が 4 問を超える確認は HTML フォーム 1 枚にまとめる」と「5 問以上ある場合は複数回に分ける」が同じ節で衝突する
4. `mkdocs-setup/skills/mkdocs-setup/SKILL.md:53` の `multiSelect` を「複数選択」に直すか。
   既定案は直す（行 37 / 47 の書き換えで語が割れるため）。代案は触らない（言及行ではない）
5. mkdocs-setup の bump を patch にするか minor にするか。既定案は patch（D-1）。
   代案は minor（`allowed-tools` は skill が使える道具の宣言で、記述ではなく挙動だという読み方）
6. 配布済みの `known-issues.resolved.yml` の `log` に PR 4 の 1 行を足すか。既定案は足す（C）。
   代案は足さない（resolved 済みのエントリで、PR 4 が消すのはワークアラウンドではないという読み方）

## G. PR 4 の編集箇所の一覧

commit の順序に依存関係は無い。plugin ごとに 1 commit、version と README・CLAUDE.md をまとめて 1 commit にできる。

| ファイル | 節・行 | 操作 | 項目 |
| --- | --- | --- | --- |
| `plugins/impl-spec/skills/requirements/SKILL.md` | 52、110、119、178、245 | 書き換え 4 / 削除 1（A-3） | 1、2 |
| `plugins/impl-spec/skills/design/SKILL.md` | 75、148、159、199、277 | 書き換え 4 / 削除 1（A-3） | 1、2 |
| `plugins/impl-spec/skills/test-plan/SKILL.md` | 93、98、155、170、277、347 | 書き換え 5 / 削除 1（A-3） | 1、2 |
| `plugins/impl-spec/.claude-plugin/plugin.json` | 4 | version 0.5.5（D-1） | なし |
| `plugins/dotclaude/skills/doctor/SKILL.md` | 161、190、204、210、217、274、299、452 | 書き換え 8（A-4） | 1、2 |
| `plugins/dotclaude/skills/cross-review/SKILL.md` | 97 | 書き換え 1（A-4） | 1、2 |
| `plugins/dotclaude/skills/registry/SKILL.md` | 69、82、101 | 書き換え 3（A-4） | 1、2 |
| `plugins/dotclaude/agents/dotclaude-repo-profiler.md` | 104 | 書き換え 1（A-4） | 1、2 |
| `plugins/dotclaude/.claude-plugin/plugin.json` | 4 | version 0.14.1（D-1） | なし |
| `plugins/mkdocs-setup/skills/mkdocs-setup/SKILL.md` | 14、37、47、129、159、231 | 書き換え 6（A-5） | 1、2 |
| `plugins/mkdocs-setup/.claude-plugin/plugin.json` | 4 | version 0.2.1（D-1） | なし |
| `plugins/session/skills/start/SKILL.md` | 80 | 書き換え 1（A-6） | 3 |
| `plugins/session/.claude-plugin/plugin.json` | 4 | version 2.12.1（D-1） | なし |
| `plugins/claude-user-communication/skills/html-communication/SKILL.md` | 15 | 書き換え 1（A-7、未特定 1） | 3 |
| `plugins/claude-user-communication/.claude-plugin/plugin.json` | 4 | version 0.33.1（D-1） | なし |
| `README.md` | 21、27、33、46、53 | version の数字（D-2） | なし |
| `CLAUDE.md` | 74、75、76、78、80 | version の数字（D-2） | なし |

※ 表 13 PR 4 の編集箇所。「項目」は計画 `norm-refit-plan.md:375-379` の PR 4 節の箇条書きの番号
（1 = 除去は言及行に限定、2 = 確認手段の書き換え、3 = SS18 / SS55 の簡素化、4 = 既知バグ台帳の更新）

PR の外で行う作業（PR に混ぜない）:

- `~/.claude/plugins/data/claude-known-issues-cc-tools/known-issues.resolved.yml:97` の次への `log` 1 行の追記（C。項目 4。PR 4 のマージ後）
- 台帳 `notes/norm-refit.md` のエントリ、`notes/norm-refit-plan.md` の現在地と PR 4 の節、進捗レポート `ccm-r003` の更新は main へ直接

## H. PR 4 で触らないもの

- 同居する条項: impl-spec の「質問の原則」節と「禁止事項」節の、AskUserQuestion に言及していない箇条書き（申し送り 4）
- `plugins/dotclaude/skills/registry/SKILL.md:84`「**owned**: あなたの持ち物ですか?」の「あなた」。
  台帳 `notes/norm-refit.md:715-718` が、この 1 箇所を対話の呼びかけとして据え置く判断を既に示している。
  同エントリは「PR 3 の AskUserQuestion 除去でブロックごと書き換わる」とも書いているが、PR 4 の対象は言及行だけなので、ブロックは書き換わらない
- `plugins/cc-transcript/skills/cc-transcript/scripts/extract.sh:66`。transcript に記録済みのツール呼び出しを整形する jq の分岐で、使用指示ではない
- `docs/retired-plugins.md:6-11`。廃止した ask-with-choices skill の記録で、AskUserQuestion への言及は廃止理由の説明（`:7-8`）
- `plugins/claude-user-communication/skills/html-communication/references/patterns/progress-tree/example.html:15`
  「ask-with-choices の廃止 未着手」。パターン集の例示データ（`norm-refit-pr3-detail.md` の未特定 10 で「触らない」と決めた）
- `plugins/session/skills/retrospective/SKILL.md:107-112`。SS55 は既に消えており、現行の記述は PR 4 が目指す形になっている（B）
- 雛形 `plugins/claude-known-issues/config/known-issues.template.yml` と配布済みの `known-issues.yml`。
  どちらも `askuserquestion-rendering` を持たない（C）
- PR 5 の管轄: impl-spec の spec-reviewer と 3 skill の終了条件（`requirements/SKILL.md:192`、`design/SKILL.md:214`、`test-plan/SKILL.md:291`。ccm-f051 Q5）
- impl-spec の移設分: `移設先` と判定された 200 件超（`norm-refit-plan.md:495-496`、idea-hub の PR 8）。
  PR 3 が複製した 13 件の原文もそのまま残す
- `rules/` 配下のすべて。PR 4 は user global rule を触らない
