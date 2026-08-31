# kanban-md の追加調査と比較検討

調査日 2026-09-01。出発点は ccm-f058（`/Users/ryosuke/.local/share/claude-html-communication/ccm-f058.html`）の
暫定採用（板の実体は自前のファイル、ツールは kanban-md）。

結論を先に 3 つ書く。

1. **kanban-md は採らないほうがよい。** 実測で、カードに独自のキーを持たせられないこと
   （`move` を 1 回打つだけで消える）と、壊れた板を検出する手段が無いことが分かった。
   前者は「1 カードから複数のセッションが生まれる」形をカードに記録できないことを意味し、
   今回の問いの中心にちょうど当たる。f058 が推した決め手（手編集の保証）は、
   Backlog.md も同じ挙動だったため軸として消えた
2. **ファイルベースの 2 件では Backlog.md が勝つ。** 決め手は `## Comments` で、
   index・時刻・著者を持つ反復構造がある。ここが 1 カード : N 実行の置き場になる
3. **問いの 3 つはすべて答えが出た。** 1 カードから複数のセッションを生む道具は 20 件以上あり、
   f058 が「求めている形とちょうど逆向き」として 1 文で片付けた方向が実は主流だった。
   Claude Code 自身の `/fork` が、依頼の原文の状況にそのまま当たる機能を持っている

---

## 0. 問いの分解の妥当性

依頼で示された 3 分解は、原文の問いをすべて覆っている。1 は「複数のセッションを生む設計のものは実在するか」、
2 は「何が引き継がれ何が分岐するか / コンフリクト」、3 は「対話セッション中からも触れるか」に対応する。

ただし、この 3 つに答えても決まらないものが 2 つ残る。どちらも道具の選択を左右する。

- **カードの単位が f058 から変わったかどうか。** f058 は「1 セッションが並列に抱える複数トピックを
  それぞれカードにする」を要件にし、18 件の道具が全部「1 カード = 1 実行単位」だから合わない、と結論した。
  今回の原文は「1 カードが複数のセッションを生む設計も実際悪くない」と言っており、
  これは f058 が棄却した前提を受け入れる方向の変更になる。受け入れるなら、
  f058 が「要件と逆向き」として落とした道具群が候補に戻る
- **板を誰が見るか。** kanban-md の閲覧手段は TUI だけで、対話セッション中に人が板を見るには
  別の端末で TUI を開くことになる。ここが要件なら、この 1 点だけで候補が絞られる

以下、観測と解釈を分けて書く。

---

## 観測

観測に入れたのは、実装・ドキュメント・自分で実行した結果から直接読めることだけ。

### 1. ファイルベースの 2 件の実測

kanban-md（1-1〜1-5）と Backlog.md（1-6〜1-9）。
kanban-md の 1-1・1-2・1-3 は自分で再実行して確かめた。

#### kanban-md の環境

ソースを HEAD から clone してビルドしたバイナリで確かめた。

- ソース: `/private/tmp/claude-501/-Users-ryosuke-ghq-root-github-com-ryosukee-cc-marketplace/6f5a1ac9-240c-4c0e-be10-705d93aef656/scratchpad/kanban-md`
- バイナリ: 同 scratchpad の `kmd`
- 検証に使った板: 同 scratchpad の `verify1/kanban`

#### 1-1. frontmatter の未知キーは、警告なしに消える

`kanban-md init --statuses "backlog,doing,done"` で板を作り、`create "First card"` で作った
`001-first-card.md` の frontmatter に、手で 2 つのキーを足した。

```yaml
sessions:
  - id: 6f5a1ac9
    role: main
  - id: aa23015f
    role: fork
my_custom_key: keep-me
```

この状態で `kanban-md --dir <板> move 1 doing` を 1 回打つと、ファイルはこうなった。

```yaml
---
id: 1
title: First card
status: doing
priority: medium
created: 2026-09-01T06:39:14.603482+09:00
updated: 2026-09-01T06:39:29.880879+09:00
started: 2026-09-01T06:39:29.881153+09:00
class: standard
---

本文。
```

`sessions` と `my_custom_key` が両方消えている。標準出力は `Moved task #1: backlog -> doing` の 1 行だけで、
警告は出ない。本文（`本文。`）は残る。

原因は実装側にある。`internal/task/task.go:11-37` の `Task` 構造体が固定 17 フィールドで、
`internal/task/file.go:32` の `yaml.Unmarshal(fm, &t)` が `KnownFields` を指定しない非 strict 読み、
`file.go:47` の `yaml.Marshal(t)` が構造体のフィールドしか書き出さない。読みで落ち、書きで消える。

#### 1-2. 読み取りのつもりのコマンドでも消える

ファイル名が ID を含まない手書きカード `hand-written.md`（`id: 7`、`my_custom_key: keep-me`、
`parent: 999`、`depends_on: [888]` 入り）を tasks/ に置き、`list` だけを実行した。

```text
Warning: auto-repaired consistency issue: renamed hand-written.md to 007-task.md to match task ID 7
Warning: auto-repaired consistency issue: updated next_id from 2 to 8
```

`list` が rename と書き直しを走らせ、`my_custom_key` は消えた。警告に出るのは rename と next_id だけで、
キーが消えたことは出力に一切現れない。あわせて `created` が無かったため
`created: 0001-01-01T00:00:00Z` が黙って入った。

`cmd/root.go:126` の `loadConfig()` が全コマンドの前に `task.EnsureConsistency()` を無条件で走らせるため、
`list` / `show` / `board` も書き込みうる。読み取り専用のコマンドは無い。

#### 1-3. 壊れた板を検出する手段が無い

サブコマンドは 20 個（agent-name / archive / board / completion / config / context / create / delete / edit /
handoff / help / init / list / log / metrics / move / pick / show / skill / tui）。
validate / check / doctor に相当するものは無い。

`EnsureConsistency` が見るのは ID 重複・ファイル名と ID の不一致・next_id・claim に応じた file permission の
4 つで、いずれも「検出して報告」ではなく「黙って自動修復」する。

実測で仕込んだ 3 つの不整合は、どれも警告されなかった。

- 存在しない親 `parent: 999` → `show 7` が `↑ Parent  #999` を正常なリンクとして表示する
- 存在しない依存 `depends_on: [888]` → `list --unblocked` に出る（help に
  「missing dependency IDs are treated as satisfied」と明記がある）
- 不正な status 値 → `board` は Total の数に数えるが、どの列にも入らないため列の内訳合計と食い違う

f058 の脚注 5 は「整合性を検査するコマンドがあるかは未確認。採用を決めたら最初に確かめる項目になる」と
していた。**無い**、が答えになる。

#### 1-4. 1 カード : N 実行を表せない

上の 1-1 から、実行の記録を frontmatter の独自キーで持たせる案は成立しない。
残る置き場は 2 つで、どちらも構造を持てない。

- カードの本文。`edit --append-body --timestamp` が `[[2026-09-01]] Tue 06:36` 付きで本文末尾に積む。
  本文は長文を通す（39,549 バイトの日本語を入れて `show` が 178 行を切り詰めずに出した。長さ制限のコードは無い）
- 板全体の `kanban/activity.jsonl`。`internal/board/log.go:21` の `LogEntry` は
  timestamp / action / task_id / detail の 4 フィールドのみ

親子は `parent:` の単一 int で、深さ制限は無く（5 階層を実測）、循環は経路つきで拒否する。
ただし `show` が出すのは直下の子だけ（`internal/board/children.go` の `ChildSummary`）。

#### 1-5. その他（f058 の記述の裏取り）

- 板のパス指定はグローバル `--dir` のみ。環境変数は無い（コード全体の `os.Getenv` は
  NO_COLOR / KANBAN_OUTPUT / VISUAL / EDITOR の 4 つだけ）。`--dir` は kanban ディレクトリ自体を
  指す必要があり、プロジェクトルートを渡すと "no kanban board found" になる
- slug は `internal/task/slug.go:12,15-33`。`[^a-z0-9]+` に一致した連続を `-` に置換し前後を Trim する。
  非 ASCII は 1 文字も残らない。「日本語のタイトルです」は `002-.md` になった（slug が空文字）。
  空のときのフォールバック `"task"` は `consistency.go:248` の修復経路にしかなく、create 経路には無い。
  設定で回避する手段は無い（config.yml に slug 関連のキーが無い）
- MCP は無い（コード上に痕跡が無い）。同梱 skill は 2 本
  （`internal/skill/skills/kanban-md/SKILL.md` 363 行、`kanban-based-development/SKILL.md` 267 行）。
  後者は claim を協調プリミティブにした複数 agent の並行開発手順で、
  `agent-name` で名前を作る → `pick --claim --status todo --move in-progress` → git worktree を切る →
  実装 → merge → done、判断が要るときだけ `handoff` で review 列に置いて人間に返す、というループ
- `init` は `Add "kanban/" to .gitignore? [Y/n]` を対話で聞く（非対話で回すなら注意が要る）

#### 1-6. Backlog.md も、未知の frontmatter キーは消える

実測は npm 配布の v1.50.1、コード読みは clone `a71804357d9d27a1f6c7421b99302ff8ed815961`（2026-08-31）。

`task create "Design the parser" --plain` で作ったカードの frontmatter に `runs:` の 2 要素配列と
`my_custom_key: hello` を手で足し、無関係な `task edit TASK-1 -s "In Progress" --plain` を 1 回打った。
両キーとも消えた。警告なし、exit 0。

パースは lenient、シリアライズが strict。`src/markdown/frontmatter.ts:12-15` の `parseFrontmatter` は
gray-matter で全キーを `Record<string, unknown>` として返すが、受け取る `parseTask`
（`src/markdown/parser.ts:178-212`）が固定のオブジェクトリテラルを返すだけで残りを持ち回らない。
書き側の `serializeTask`（`src/markdown/serializer.ts:51-73`）も固定のリテラルを組む。
往復を守るテストは 0 件。

**kanban-md との違いが 1 つある。** kanban-md は読み取り専用の `list` でも未知キーを飛ばしうるが
（1-2）、Backlog.md には自動書き直しが無いので、消えるのは実際にそのカードを編集したときだけ。

本文は別扱いで保持される。同じ編集を通しても `## My Custom Section` は無傷だった。

#### 1-7. `## Comments` が、1 カード : N 実行の置き場になる

frontmatter は 21 キー（`src/markdown/serializer.ts:51-73`）。
id / title / status / assignee / reporter / created_date / updated_date / due_date / labels /
milestone / dependencies / references / documentation / modified_files / parent_task_id /
subtasks / priority / type / project / ordinal / onStatusChange。

**反復可能な構造は `## Comments` 1 つだけ。** `TaskComment { index, body, createdDate, author? }`
（`src/types/index.ts:33-38`）で、1 件ずつ時刻と任意の著者を持つ。
`task edit <id> --comment "..." --comment-author "..."` を 2 回打った実測の出力。

```text
## Comments

<!-- COMMENTS:BEGIN -->
author: agent-a
created: 2026-08-31 21:43
---
run 1: 探索した。板の構造を読んだ。
---

author: agent-b
created: 2026-08-31 21:43
---
run 2: 実装した。
---
<!-- COMMENTS:END -->
```

**ここが kanban-md との最大の差になる。** kanban-md は本文への時刻つき追記しか無く、
Backlog.md は著者と時刻を持つ index つきの反復構造がある。
制約は、comment の本文に marker 文字列と単独の `---` 行を置けないこと
（`src/markdown/structured-sections.ts:1216-1221`）。

Implementation Notes は `--append-notes` で追記できるが単一セクションで、`\n\n` で連結されるだけ。
件ごとの境界も時刻も残らない（実測）。

親子は `parent_task_id` で、ID 自体が階層的（`task-5.2.1`）。深さ制限は無い。

#### 1-8. MCP は 21 tool（stdio のみ）

`backlog mcp start`。transport は stdio だけ（`src/mcp/server.ts:5,68,354` が
`StdioServerTransport` を唯一 import する）。`BacklogConfig.mcp.http` という型は
`src/types/index.ts:361-379` にあるが server 側から読まれておらず、参照は test 1 か所だけの死に設定。

- task 系 8: `task_create` `task_list` `task_search` `task_edit` `task_view`
  `task_dependencies` `task_archive` `task_complete`
- document 系 5 / milestone 系 5 / その他 3（`get_backlog_instructions` など）

カードの作成・状態変更・一覧はすべて対話セッションから呼べる。制約が 2 つある。

- schema に `rawContent` 相当の引数が 1 つも無いので、MCP からは型付きフィールドしか書けない
- MCP 経由だけ長さ上限がかかる（`src/mcp/validation/validators.ts:128-131`。title 200、
  description 10000、notesSet / planSet / finalSummary 各 20000、append 系配列は maxItems 20）。
  CLI 経由には上限が無く、実測で 50,000 文字の description から 150 KB の task ファイルができた。
  **同じ操作でも入口によって制約が違う**

#### 1-9. `backlog doctor` はあるが、整合性検査ではない

見るのは ID 重複（cross-branch 込み）、自己参照依存、依存の循環、予約 prefix の衝突だけ
（`src/cli.ts:5455-5473,5500-5523`）。

実測で、存在しない `TASK-999` への依存・存在しない `TASK-404` を指す `parent_task_id`・
config に無い `status: Bogus Status` を仕込んでも
`No duplicate task, document, or decision IDs found.` で素通りし、
`task list --plain` は `Bogus Status:` を正規の列として描画した。
依存先の存在と status の検証は書き込み時にしか走らない
（`src/core/backlog.ts:1702-1703` が create、`2002-2020` が edit）。
**手編集・merge・git 操作でファイルに入った値は二度と検証されない。**

そのほか 2 点。

- 日本語のファイル名はそのまま通る（実測で `task-2 - 日本語のタイトルです.md`）。
  `sanitizeFilename`（`src/file-system/operations.ts:2059-2070`）の文字クラスがすべて ASCII で、
  CJK・かな・全角が素通りする。長さの切り詰めも無い。kanban-md が `002-.md` にするのと対照的
- 板の切り替えは環境変数 `BACKLOG_CWD` だけ（実測で cwd を `/` にして通した）。
  `--cwd` は `mcp start` のときしか解釈されない（`src/cli.ts:930-950`）。
  help の見た目が汎用に読めるのが罠になる

### 2. Claude Code 自身が持つ機構（実測）

手元は v2.1.252（`claude --version`）。バイナリは
`/Users/ryosuke/.local/share/claude/versions/2.1.252`。

#### 2-1. `claude --help` に実在するもの

| フラグ / コマンド | 説明（help の逐語） |
| --- | --- |
| `--fork-session` | "When resuming, create a new session ID instead of reusing the original (use with --resume or --continue)" |
| `-w, --worktree [name]` | "Create a new git worktree for this session (optionally specify a name)" |
| `--bg, --background` | "Start the session in the background and return immediately. Prints the id that `claude attach`, `logs`, `stop` and `rm` take; `claude agents` lists them" |
| `--cloud [description\|session_id\|url]` | "Create a cloud session with the given description, or attach to an existing one by session ID or claude.ai/code URL" |
| `--tmux` | "Create a tmux session for the worktree (requires --worktree)" |
| `agents` | "Manage background agents" |
| `attach <id>` / `logs <id>` / `stop <id>` / `rm <id>` / `respawn` | バックグラウンドセッションの操作 |

#### 2-2. 会話を分岐させる口は 3 つある（バイナリ内の文字列）

`strings` で確認した。

- `Usage: /subtask \<task\>`
- `Usage: /fork \<directive\>`
- `/branch` — 同梱のヒント文が用途を書いている。逐語:
  `"/clear" wipes conversation but keeps files. "/branch" forks the conversation to try two approaches.`
- Agent tool の `subagent_type: "fork"`。tool 定義の逐語:
  `(except subagent_type: "fork", which inherits your context)` /
  `The "default to forking" guidance is for the parent; you ARE the fork, execute directly.`
- `--fork-session` の案内: `Add --fork-session to branch off a copy instead.`

`/fork` の意味論は公式ドキュメント（<https://code.claude.com/docs/en/agent-view>）に逐語がある。
**依頼の原文が描いている状況にそのまま当たる。**

> Copy the current conversation into a new background session while the original keeps running.
> The copy starts with everything in the conversation up to that point and carries over the model,
> permission mode, effort level, and any directories or permission grants.
> After the fork, the two conversations are independent.

> Use a fork when any other subagent would need too much background to be useful,
> or when you want to try several approaches in parallel from the same starting point.

`/batch` は 1 指示から N 実行を作る（<https://code.claude.com/docs/en/commands>）。

> Researches the codebase, decomposes the work into 5 to 30 independent units, and presents a plan.
> Once approved, spawns one background subagent per unit in an isolated git worktree.
> Each subagent implements its unit, runs tests, and opens a pull request.

#### 2-3. coordinator / worker（agent teams）

`--teammate-mode <mode>` が実在する。バイナリ内に次の逐語がある。

- `Forking is not available in coordinator sessions. Use /branch instead.`
- `Subtasks are not available in coordinator sessions. Use /branch instead.`
- `The name parameter is not available in this context — teammates cannot spawn other teammates. Omit it to spawn a subagent.`
- コンフリクトの扱い（worker 側の指示、逐語）:
  `Other workers may be making changes on this branch. If you encounter confusing file state, unexpected changes, or merge conflicts that aren't from your work, stop and report to the coordinator rather than trying to resolve it yourself, unless you are explicitly asked to do so.`

最後の 1 文が重要で、**agent teams のコンフリクト回避は worktree の分離ではなく、
同じブランチを共有したうえでの「止めて coordinator に報告せよ」という運用**になっている。
公式ドキュメントも同じことを、分割の責任が人にあると明記する形で書いている。

> Two teammates editing the same file leads to overwrites.
> Break the work so each teammate owns a different set of files.

teammate 側の取り方の逐語。

> Self-claim: after finishing a task, a teammate picks up the next unassigned, unblocked task on its own

#### 2-4. 標準のタスクツールは、既に「板 + 担当者」の形をしている

ツールは `TaskCreate` / `TaskGet` / `TaskList` / `TaskUpdate`。バイナリ内の逐語。

- "New tasks are created with status 'pending' and no owner - use TaskUpdate with the `owner` parameter to assign them"
- "After completing your current task, call TaskList to find available work"
- "Claim an available task using TaskUpdate (set `owner` to your name), or wait for leader assignment"
- "Use TaskList to check availability and TaskUpdate with owner to reassign them to idle teammates."
- teammate の system prompt に板のパスが差し込まれる: `- Task list: ${e.taskListPath}`
- `[inProcessRunner] Claimed task #${m.id}: ${m.subject}`

スキーマ側。

- status の enum は `pending` / `in_progress` / `completed`（update では `deleted` も取る）。f058 の「3 値」は正しい
- TaskCreate の入力に `metadata` があり、その describe は逐語で
  `Arbitrary metadata to attach to the task`。**任意のキーを持てる。**
  f058 は「260 ファイルを数えてキーは 8 種」と書いたが、その 8 種のうち 1 つが metadata で、
  中身は自由という性質は書かれていない
- 親子は無い。あるのは `blocks` / `blockedBy`（f058 の記述どおり）
- hook のイベント名に `Stop` / `TeammateIdle` / `TaskCreated` / `TaskCompleted` がある

`metadata` が実際に自由なキーを取ることは、手元のデータで確かめられる。
`~/.claude/tasks/` の 46 ディレクトリのうち 1 つに、過去のセッションが書いた実例が残っている
（`/Users/ryosuke/.claude/tasks/f011ca55-3423-4dae-9b69-9cb70b08ef4e/1.json`）。

```json
  "metadata": {
    "kind": "form-awaiting",
    "file": "2026-07-30-cc-marketplace-norm-placement-form.html",
    "url": "https://mac-mini.hake-tarpon.ts.net/2026-07-30-cc-marketplace-norm-placement-form.html"
  }
```

kind / file / url はどれもスキーマに無いキーで、そのまま保たれている。
kanban-md の frontmatter とちょうど逆の挙動になる。

板の実体は `~/.claude/tasks/{セッション ID}/{連番}.json`。46 ディレクトリあり、1 タスク 1 JSON。

#### 2-5. ただし、subagent はタスクツールを持たない

これが標準タスクを板にするときの決定的な制約になる。

既知バグ一覧の実測記録（`~/.claude/plugins/data/claude-known-issues-cc-tools/known-issues.resolved.yml`、
`task-tools-unavailable` エントリの log、2026-09-01）の逐語。

> あわせて実測: env が渡っていても subagent にはタスクツールが提供されない
> （ツール一覧に無く、ToolSearch でも取得できない）

同じエントリに、モデルによるゲートの実測がある。ゲート対象は
`[["opus",[4,8]],["sonnet",[5]],["fable",[5]],["mythos",[5]]]` で、
claude-opus-5 は該当するため既定では提供されない。
手元では `~/.claude/settings.json` の env に `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` と
`CLAUDE_CODE_ENABLE_TASKS=1` を置いて外してある（2026-09-01 にワークアラウンドではなく
この環境の解決策として受け入れる判断が出ている）。

一方 **teammate は条件付きで持つ**。バイナリ内の in-process teammate の定義に、
`hasTaskListTools` が真なら TaskCreate / TaskGet / TaskList / TaskUpdate を
tools に足す分岐がある（`taskKind:"in_process_teammate"` の周辺）。

つまり、フォーク先が板を触れるかは分岐先の種類で変わる。

| 分岐先 | 標準タスクツールを持つか |
| --- | --- |
| subagent（`/subtask`、Agent tool） | 持たない（実測） |
| teammate（agent teams） | 条件付きで持つ |
| バックグラウンドセッション（`--bg`） | 別セッションなので自分の板を持つ。親の板は見えない |
| `claude -p`（非対話） | 持つ（ゲートの回避条件 (1) が効く。実測） |

#### 2-6. transcript に残るもの

`~/.claude/projects/-Users-ryosuke-ghq-root-github-com-ryosukee-cc-marketplace/*.jsonl` のキーを全件数えた。
系譜に関わるものは `parentUuid` / `isSidechain` / `sessionId` / `bridgeSessionId` /
`sourceToolUseID` / `sourceToolAssistantUUID` / `pendingBackgroundAgentCount`。
`--resume` のセッション選択 UI は `forkCount` を持つ（バイナリ内の文字列）。

### 3. kanban-agent-orchestrator（ユーザー自身の repo）

`/Users/ryosuke/ghq_root/github.com/ryosukee/kanban-agent-orchestrator`。
今回の問いをまさに扱っている手元の一次情報で、f058 には出てこない。

#### 3-1. 1 カード : N セッションを設計と実装の両方で採っている

- 設計の対応関係: Epic 1 : Task N（`Task.EpicID`）、エンティティ 1 : Session N
  （`Session.EntityType` が `epic` か `task`、`Session.EntityID` で親を指す。
  `docs/06-domain-design.md:77-89`）。`Task.SessionID` / `ProcessID` は単数だが、
  これは「いま動いているもの」で履歴は Session 側にある（`docs/06-domain-design.md:47-48`）
- 実装（`tools/workflow-runner/`）では、1 実行 = 1 worktree + 1 branch + N step。
  セッションは 3 方向に増える
    - step ごとに新しいセッション。各ステップは独立した Claude セッションでコンテキストがリセットされる
      （`docs/04-workflow-design.md:89`、`tools/workflow-runner/runner.go:444-492`）
    - step ごとに監視用セッションがもう 1 つ（`gd-inspect` agent を並列 spawn。
      `tools/workflow-runner/runner.go:465`、`prompt.go:156-183`）
    - parallel ブロックは中の step 数だけ同時に spawn（`tools/workflow-runner/parallel.go:37-55`）
- 再実行も積み上がる。`StepInfo.Runs` が `[]*RunInfo` で各 run が自分の `session_id` を持つ
  （`tools/workflow-runner/status.go:48-71`）。差し戻し・resume のたびに `AdvanceRun` で run が 1 増える（`:455-461`）

#### 3-2. 「fork」は 3 つの別物を指していて、実装済みは 1 つだけ

| 呼び方 | 対象 | 実装状況 |
| --- | --- | --- |
| Epic Fork | 人間が Human Review で新 Epic に切り出す | 未実装 |
| セッション fork | meta-feedback を元セッションのログを汚さず実行する | 未実装（構想） |
| worktree 隔離 | workflow 実行ごとの作業空間の分離 | 実装済み |

Epic Fork は `Epic.ParentEpicID`（`docs/06-domain-design.md:16`）、`rpc ForkEpic`
（`docs/07-backend-design.md:225`）、`fork_epic.go` の配置予定（`:56`）まではあるが、
要件のチェックボックスは未チェック（`docs/03-requirements.md:13`、`:73`）。
何を引き継ぐかは「コンテキスト」としか書かれておらず、対話ログか worktree かブランチかは未定義。
最も具体的なのは archive の「fork 前のコンテキストは引き継ぎ、遡って見ることもできる」
（`docs/archive/00-initial-concept.md:78`）。

セッション fork は「fork することで元セッションのログを汚さず、後から参照・resume する可能性を保持する」
（`docs/09-meta-improvement.md:15`）。

#### 3-3. 引き継がれるものと分岐するもの（実装済みの範囲）

- worktree とブランチの作成: `git worktree add -b <branch> <worktree> HEAD`
  （`tools/workflow-runner/runner.go:765-776`）。ブランチ名は `{workflow 名}/{workflow ID}`（`:60-66`）、
  worktree パスは `{parent}/{repo}=kao-{workflow-id}`（`:68-70`）
- 引き継がれるもの: 起動時の HEAD のコミット。step 間では前 step の result.txt の中身を
  プロンプトへ連結（`prompt.go:86-106`）、差し戻し履歴の理由と result のパスも渡す（`:108-119`）。
  worktree は共有されるのでファイルの変更もそのまま次 step に見える
- 分岐しないもの: 同一 workflow 内の全 step が同じ worktree を共有する
  （spawn 時に `cmd.Dir = r.worktree` を固定。`runner.go:828`）。parallel ブロックの各 step も同じ worktree
- 差し戻し時の分岐は 3 通り。既定はセッション引き継ぎ（`--resume` で同じ session_id、`runner.go:494-553`）、
  `on_reject: self` は session resume せず新規実行、遷移先 step に `reset_worktree_on_restart: true` が
  あると `git reset --hard`（`transition.go:106-132`）

#### 3-4. コンフリクト回避は 2 段で、内側は運用の制約だけ

workflow 単位では別ブランチ・別 worktree で分離する。workflow 内の並列については
「並列 step が同じファイルを編集すると git コンフリクトが発生する。初期実装では並列 step は
ファイル編集しない操作に限定する」という運用上の制約だけで、機械的な強制は無い
（`docs/04b-dag-workflow-design.md:224`、`docs/10-workflow-runner-reference.md:365`）。
`workflows/full-implementation.yaml:56-103` の 5 並列 review は、5 つとも
`tools: [Read, Grep, Glob, Bash]` で Write / Edit を外すことでこの制約を守っている。

並列 workflow 間の事前コンフリクト検知は未実装（`docs/ideas.md:33` の RUN-023）。

#### 3-5. 対話セッションから触れる板は、まだ無い

板そのものが未実装なので、板を操作する口も無い。`serve` サブコマンドは docs にあるが
（`README.md:79-83`）、`cmd/kanban-agent/main.go:25-32` が登録するのは run / monitor / validate /
clean / ls / verdict で `serve` は無い。`cmd/kanban-agent/cmd_run.go:35-38`,`:59-61` は
`// TODO: DI 経由で orchestration command を呼び出す` の後に printf するだけの stub。

いま存在する起動口は CLI（`./workflow-runner run|resume|monitor|ls|clean|validate|verdict`）と
skill（`/continue-metadev-session` ほか）の 2 種類。MCP 設定ファイルは repo 内に無く、hook 定義も無い。
monitor の web UI は SSE で読むだけで介入の口は無い（介入パスは `docs/ideas.md:27` の RUN-016 として未着手）。

開発は 2026-04-29 の `9c07441` を最後に 4 か月止まっている。唯一のオープン PR #31 は close する方針で合意済み。

### 4. 他ツールの観測

#### 4-1. Orca（stablyai/orca、star 58,197、MIT）

前回取得した資料が
`/private/tmp/claude-501/-Users-ryosuke-ghq-root-github-com-ryosukee-cc-marketplace/4f702d3b-b49c-43c6-9f95-d6e76d05d1b4/scratchpad/`
に残っている（orca-readme.md / orca-docs.html / orca-docs-index.html / orca-worktrees.html）。

**1 プロンプトから N セッションを正面から掲げている。** README の逐語。

> **Parallel Worktrees**
> Fan one prompt across five agents, each in its own isolated git worktree — compare the results and merge the winner.

docs の "When to use Orca" の逐語。

> You want three agents trying the same bug in parallel and to pick the winner.

引き継ぎと分岐の実体（`orca-worktrees.html`、逐語）。

> Each repo has a **base ref** (usually `origin/main`).
> Each worktree has a **start-from ref** — what it branches off.
> Each worktree has its own branch, its own files on disk, and its own agent terminals.

コンフリクト回避は worktree の完全分離。docs の冒頭が
"This is what makes parallel agents safe — they never step on each other's files." と書いている。
gitignore された依存物は `worktree.sharedDirectories`（symlink 共有）と `.worktreeinclude`（コピー）で埋める。

入れ子は 2 種類ある。

- **Parent workspace**（Create ダイアログの Advanced）。逐語:
  "This only nests the workspaces in Orca's sidebar; it does not change Git history or branches."
  つまり表示上の入れ子だけ
- **Agent Dashboard のカード**。逐語:
  "Nested Codex/Claude subagents can appear as expandable children under the parent row."
  1 カードの下に、その実行が生んだ subagent が子として並ぶ

**前回セッションの「板を操作する口が無い」は誤りだった。** 公開 docs の CLI ページには
`orca worktree` と `orca terminal` しか無いが、repo の
`skill-guides/orca-cli.md` と `skill-guides/orchestration.md` に、agent へ skill として配る CLI がある。

- `orca worktree create --repo id:<repoId> --name related-task --parent-worktree active --json`
  — いまいる worktree の子としてカードを足す
- `orca worktree set --worktree active --workspace-status in-review --json` — カードを動かす
- `task-create --parent --deps` — 親子と依存つきでカードを作る
- `worker-start --task <next_task_id> --terminal <handle>` — 同じ端末に次のタスクを渡す（逆向きの形）

入れ子の深さは明示的に制限されており、Run を作り直しても回避できないと書いてある（逐語）。

> A dispatched worker normally cannot dispatch sub-workers. Attempting it fails with
> `nested_worker_depth_exceeded` ... Depth is counted from the terminal that issues the command,
> not from the Run. Creating a new Run does not reset it

worktree の作成は既定ではない、という方針も明示されている。他ツールと逆なので注意が要る（逐語）。

> Create a new worktree only when the user explicitly requests one or a concrete checkout or
> filesystem conflict makes sharing unsafe or impossible ... Independent tasks, parallel execution,
> convenience, or a preference for separate checkouts are not isolation requirements.

#### 4-2. Vibe Kanban（BloopAI/vibe-kanban、star 27,968、Apache-2.0）

README（`.../4f702d3b-.../scratchpad/vibe-kanban-readme-main.md`）の冒頭に
`Vibe Kanban is sunsetting.` がある。運用の候補からは外れる。

ただし設計は今回の問いに一番近い。README の逐語。

> Use kanban issues to plan work, either privately or with your team. When you're ready to begin, create workspaces where coding agents can execute.
>
> - **Plan with kanban issues** — create, prioritise, and assign issues on a kanban board
> - **Run coding agents in workspaces** — each workspace gives an agent a branch, a terminal, and a dev server

issue（カード）と workspace（実行）が別の層になっている。**DB の migration で 1:N が確定する。**

初期スキーマ（`crates/db/migrations/20250617183714_init.sql`）で
`task_attempts` が `task_id BLOB NOT NULL` の FK を持つ子テーブルとして作られている
（1 task : N attempt）。2025-12-16 の migration
（`20251216142123_refactor_task_attempts_to_workspaces_sessions.sql`）が 2 つのことをした。逐語コメント。

> -- Rename task_attempts -> workspaces (keeps workspace-related fields)
> -- Create sessions table (executor moves here)
> -- 3. Migrate data: create one session per workspace

現行は **task(issue) → N workspace → N session の 2 層**。
最新の workspaces 定義（`20260217120312_remove_task_fk_from_workspaces.sql`）には
複合インデックス `(task_id, created_at DESC)` があり、1:N を前提にしている。
ただし同じ migration で `task_id` は FK を外され NULL 許容になった（逐語）。

> -- Remove FK constraint from workspaces.task_id → tasks(id).
> -- task_id column is preserved, just no longer FK-enforced.

正確には「1 issue : N workspace、ただし workspace は issue に紐づかず単独でも存在できる」。

引き継ぎの範囲を docs が明記している（逐語）。

> Each workspace is completely independent: Create as many workspaces as you need.
> Each has its own branch, changes, and sessions.

> Sessions share files but not conversation context. If Session 1 makes changes,
> Session 2 can see those file changes but doesn't know what instructions Session 1 received.

MCP server も持つ。tool 定義は `crates/mcp/src/task_server/tools/` にあり、
`start_workspace` / `create_session` / `run_session_prompt` / `create_issue` /
`link_workspace_issue` ほか。worktree 内の agent が、その workspace に閉じた形で
兄弟 session を作れる orchestrator モードもある。

#### 4-3. Cline Kanban（cline/kanban、star 1,293、Apache-2.0）

`docs/architecture.md`（`.../4f702d3b-.../scratchpad/architecture.md`）の用語表。

- L162: `Task session | the live runtime attached to a task card | this may be a PTY process or a native Cline session`
- L163: `Home agent session | a synthetic, project-scoped session used by the sidebar agent surface | this lets the sidebar reuse existing runtime primitives without creating a real task card`
- L318（f058 が引いたもの）: `It looks like a task panel, but it is not backed by a real task card and it does not create a task worktree.`

1 カード : 1 セッション。サイドバーの対話はカードにならない。

#### 4-4. Agent Kanban（saltbo/agent-kanban、star 459）

f058 の 18 件の中で唯一 agent が subtask を作る。README の逐語:
`- **Create tasks** — an agent working on a feature can spawn subtasks and assign them to other agents`。
保存は Cloudflare D1 で git に入らない。

#### 4-5. best-of-N（同じ課題を N 本に配って勝ちを選ぶ）

Orca を含めて 8 件。vendor 3 + OSS 5。

| ツール | 指定方法と上限 | 勝者の決め方 | 出典 |
| --- | --- | --- | --- |
| OpenAI Codex | `--attempts`（最大 4） | 並べて選ぶ | <https://learn.chatgpt.com/docs/developer-commands?surface=cli> |
| Cursor | `/best-of-n`（モデル数） | `/apply-worktree` で取り込む | <https://cursor.com/changelog/3-0> |
| Google Jules | `--parallel`（最大 5） | 選ぶ（比較 UI は未確認） | <https://jules.google/docs/changelog/> |
| OpenChamber | 最大 5 モデル | 選ぶ、または Fusion で合成 | <https://github.com/openchamber/openchamber> |
| Cezar | ×2 / ×3 | 選ぶ、敗者は archive | <https://github.com/open-mercato/cezar> |
| octomux | `loop-start-group --n` | review queue で選ぶ | <https://github.com/ShreyPaharia/octomux> |
| uzi | `--agents claude:2,codex:1` | `uzi checkpoint <agent>`（停滞） | <https://github.com/devflowinc/uzi> |
| Orca | 手動で N worktree | diff を見て選ぶ | <https://www.onorca.dev/docs/recipes/parallel-agents> |

逐語をいくつか。

> Number of assistant attempts (best-of-N) Codex cloud should run.（Codex `--attempts`、1-4）

> Added a new command `/best-of-n` that runs the same task in parallel across multiple models,
> each in its own isolated worktree, then compares outcomes.（Cursor）

> Use **Multi-run** to give the same task to up to five models, each in its own session and
> optionally its own worktree. See what each one actually built, choose the best result,
> or use **Fusion** to combine the strongest parts into a new session.（OpenChamber）

> Run the same task as competing agents in separate worktrees, then compare their diffs side by
> side and **pick** one — the losers are archived and their worktrees cleaned up.（Cezar）

**自動でマージするものは 1 件も無い。** Cursor が明文化している。

> The `/best-of-n` command compares runs only.
> It does not merge changes back into your main checkout for you.

#### 4-6. 文脈を引き継ぐ分岐（session fork）

6 件だけ確認できた。**この型が一番少ない。**

| ツール | 分岐の単位 | 引き継ぐもの | 出典 |
| --- | --- | --- | --- |
| Claude Code `/fork` | 会話全体を background session へ複製 | 会話履歴・model・permission mode・effort | <https://code.claude.com/docs/en/agent-view> |
| Claude Code `/subtask` | fork した subagent | 会話履歴・system prompt・tools・model | <https://code.claude.com/docs/en/sub-agents> |
| Factory Droid `/fork` | セッション全体を複製 | 会話コンテキスト | <https://docs.factory.ai/droid-cli/cli-reference> |
| Sculptor | **任意のメッセージから**分岐 | "full prior context" | <https://imbue.com/blog/sculptor-announce> |
| Kandev | 親タスクの session から sub-task | 親の session | <https://github.com/kdlbs/kandev> |
| OpenChamber | agent control tool の fork | 未確認 | openchamber の agent-control-tool.mdx |

Factory Droid は元セッションに留まる側の挙動まで書いている（逐語）。

> /fork — Copy current session into a new session; you stay in the original and get a
> `droid --resume <id>` command for the fork.

Sculptor は分岐点を選べる（逐語）。

> Forking agents: spin off a new agent from any point in your session history,
> so you can reuse context that's working without reloading from scratch

**板を持つツールで、文脈込みの分岐を明文化しているのは Kandev だけ**だった（逐語）。

> **Sub-tasks** - Agents can spawn sub-tasks that resume from the parent task's session.
> Useful for splitting a task that has grown too big, or producing several PRs from the
> same starting point.

Kangentic は分岐ではないが、列をまたぐ引き継ぎで履歴を運ぶ（逐語）。

> **Handoff context** - move a card from a Claude plan column to a Codex execute column
> and the next agent starts with the full history.

#### 4-7. 親カードが子カードを生み、それぞれが別セッションになる

| ツール | 親子の作り方 | 深さの制限 |
| --- | --- | --- |
| Devin | 親が managed Devin を起動 | 記述なし |
| Charlie | 親が child task へ分割 | 記述なし |
| vibe-kanban | issue → workspace、`tasks.parent_workspace_id` | 記述なし |
| Orca | `task-create --parent --deps` | 設定値で 1 または 2 世代 |
| Kandev | agent が sub-task を作る | 記述なし |
| saltbo/agent-kanban | Worker が subtask を作る | 記述なし |
| octomux | orchestrator が child task を dispatch | 記述なし |
| Claude Code `/batch` | 1 指示を 5〜30 単位へ分解 | 記述なし |

Devin と Charlie は best-of-N ではなくこちら。競争ではなく分割（逐語）。

> Devin can break down large tasks and delegate them to a team of managed Devins working in
> parallel, each running in its own isolated VM.

#### 4-8. 競争でない「1 カード : N セッション」

勝者を選ぶのではなく、単に 1 カードに複数の会話をぶら下げる形が 3 件。

- **vibe-kanban** — 4-2 のとおり
- **HumanLayer** — 逐語:
  "A task can contain several sessions. Each session stays separate, while the task keeps their work together."
  （<https://docs.humanlayer.com/explanation/tasks>）
- **Conductor** — MCP に `create_session` と `list_workspace_sessions` がある。
  逐語: "Run multiple agents in one workspace when the work belongs on the same branch"

#### 4-9. MCP を持つ agent kanban

Backlog.md と vibe-kanban のほかに 8 件。

板 + 実行機構を持つもの: Kandev / Kangentic / AgentsRoom / Conductor / Devin / Tembo。
板だけ（実行機構なし）: `multidimensionalcats/kanban-mcp` / `eyalzh/kanban-mcp`（停滞）。

依頼の使い方（対話中に思いついた話題をカードにして、後でフォークして別セッションに回す）に
最も近いのは Kandev で、「カードを作る」と「親の文脈を引き継いで分岐する」の両方を
1 つの MCP で満たす唯一の例だった（逐語）。

> **Task-agent MCP** - Agents can create subtasks, target sibling repos, attach extra branches
> for multiple PRs, message other tasks, read conversations, and inspect related tasks

Kangentic も近い（逐語）。

> **Agent-to-board tools** - every session gets MCP tools to create tasks, move cards,
> add columns, search prior sessions, and even message another task's running agent,
> so agents self-organize.

MCP client であって server ではない（外から駆動できない）もの:
Cursor / Codex / Jules / Factory Droid / OpenChamber。
MCP ではないが CLI の注入で同じことができるもの: Orca（skill として注入）/ Ouijit（PATH に注入）。

#### 4-10. 存続状況（f058 の前提が変わっているもの）

star と `pushed_at` は 2026-09-01 の観測値。

- **vibe-kanban は sunsetting。** 2026-04-10 に Bloop が事業停止、cloud 側は 30 日後に停止。
  逐語: "Vibe Kanban will transition to a fully local architecture"。OSS は community 継続、
  `pushed_at` 2026-04-24（<https://www.vibekanban.com/blog/shutdown>）
- **Terragon は 2026-01-16 に停止済み**（"an open-source snapshot of Terragon at the time of shutdown"）
- **humanlayer/humanlayer の repo は deprecated**（"the code here is pretty much all deprecated"）。
  <https://humanlayer.com> で作り直し中
- **Sweep はコーディングエージェント事業から撤退**
- **stravu/crystal は開発終了**、Nimbalyst が後継（3,116、2026-02-26）
- **devflowinc/uzi は停滞**（582、2025-06-04）
- 活発なのは Orca（58,337、2026-08-31）、Claude Squad（8,405、2026-08-20）、
  OpenChamber（9,425、2026-08-30）、Backlog.md（6,593、2026-08-31）、container-use（4,028、2026-08-17）

網羅の起点として <https://github.com/andyrewlee/awesome-agent-orchestrators>（約 200 件の分類済み索引）がある。

---

## 3 つの問いへの回答

### 問い 1「1 枚のカードから複数のセッションを生む設計を持つ道具は実在するか」

**答えられた。実在する。しかも珍しくない。** 形は 4 つに割れ、合計 20 件以上ある。

| 形 | 件数 | 実例 | カードとセッションの関係 |
| --- | --- | --- | --- |
| 同じ仕事を N 本に扇状に配って勝ちを選ぶ（best-of-N） | 8 | Codex `--attempts` / Cursor `/best-of-n` / Jules `--parallel` / OpenChamber / Cezar / octomux / uzi / Orca | 1 プロンプト → N worktree × N agent。文脈は運ばない |
| カードと実行を別の層にする | 3 | vibe-kanban（sunsetting）/ HumanLayer / Conductor | 1 issue → N workspace → N session |
| 親カードが子カードを生み、子が別セッションになる | 8 | Devin / Charlie / Orca / Kandev / agent-kanban / octomux / vibe-kanban / Claude Code `/batch` | 分割。競争ではない |
| 会話の途中から文脈ごと分岐する | 6 | Claude Code `/fork` `/subtask` / Factory Droid / Sculptor / Kandev / OpenChamber | 会話履歴を継いで独立する |

f058 は「1 カードが複数のセッションを生む設計のものもあった。求めている形とちょうど逆向きで、
この方向でも一致しない」と 1 文で片付けていた。**実際にはこれが主流で、
今回の原文が受け入れる方向へ振れたことで、候補の母数が一気に増える。**

重要なのは、4 つのうち最後の「文脈ごと分岐する」が一番少ないこと。
best-of-N の 8 件はどれも同じ prompt を配るだけで、会話は運ばない。
依頼の原文にある「その時点でセッションがフォークされ文脈もその時点では引き継がれて分岐する」に
当たるのは 6 件だけで、**そのうち板を持つのは Kandev だけ**だった。

加えて、**Claude Code 自体が 2 つの形を持っている**。

- `/fork` — 会話全体を複製して background session にする。用途として best-of-N を docs が明示する
- 標準のタスクツールが `owner` と claim を備え、teammate が `TaskList` で空きを探して
  `TaskUpdate` で claim する。「1 枚のカードに 1 セッションを割り当てる」板そのもの

### 問い 2「フォークで何が引き継がれ、何が分岐するか。コンフリクトをどう避けるか」

**答えられた。** 引き継ぎは 3 層に分かれ、コンフリクト回避は 2 系統しかない。

### 引き継ぐものは 3 層のどれか

| 層 | 何が渡るか | 採っている道具 |
| --- | --- | --- |
| 会話 | transcript 全体。model・permission mode・effort も | Claude Code `/fork` `/subtask`、Factory Droid、Sculptor、Kandev |
| ファイル | worktree の中身。会話は渡らない | vibe-kanban の session 間、Orca、KAO の step 間 |
| 何も渡さない | prompt だけ | best-of-N の 8 件、大半の板 |

道具ごとの詳細。

| 道具 | 引き継ぐもの | 分岐するもの |
| --- | --- | --- |
| Claude Code `/fork` | 会話履歴・model・permission mode・effort・許可したディレクトリ | 以降の 2 つの会話が独立する。元は走り続ける |
| Claude Code の `subagent_type: "fork"` | 親の会話文脈（"which inherits your context"） | 以降の会話。ツール出力は親に戻らない |
| Claude Code の `--fork-session` | resume 対象の transcript 全体 | セッション ID（新しく振られる） |
| Claude Code の `--worktree` | HEAD のコミット | 作業ツリーとブランチ |
| Factory Droid `/fork` | 会話コンテキスト。元に留まり `droid --resume <id>` を受け取る | 新セッション |
| Sculptor | 履歴の**任意の地点**からの full prior context | 以降の agent |
| vibe-kanban | workspace 内のファイル。"Sessions share files but not conversation context." | session ごとの会話 |
| Orca | start-from ref（base ref / 別ブランチ / SHA / remote ブランチ） | worktree・ブランチ・端末。会話は引き継がない |
| KAO の workflow | 前 step の result.txt と差し戻し履歴（プロンプトに連結）。worktree は共有 | 各 step の Claude セッション（毎回リセット） |

### コンフリクト回避は 2 系統しかない

**自動で解決するものは 1 件も無かった。** 全件が「隔離 → 人が diff を見る → merge / PR」に落ちる。

1. **worktree で物理的に分ける。** best-of-N の 8 件、vibe-kanban、Cezar、octomux、
   Ouijit（copy-on-write clone で gitignore 済みファイルごと複製）、
   KAO の workflow 単位、Claude Code の `--worktree`
2. **同じブランチを共有し、衝突したら人に返す。** Claude Code の agent teams
   （"stop and report to the coordinator rather than trying to resolve it yourself" /
   "Break the work so each teammate owns a different set of files"）、
   Conductor（"Run multiple agents in one workspace when the work belongs on the same branch"）、
   KAO の workflow 内 parallel

**Orca は 2 の側を既定にしている**点で他と逆を向く。
"Independent tasks, parallel execution, convenience, or a preference for separate checkouts
are not isolation requirements." と書き、worktree を作るのを例外扱いにする。

octomux が隔離の限界を一番正直に書いている（逐語）。

> During the work they can't — each task is its own git worktree on its own branch,
> so your main working tree never moves. At merge time you still get normal git conflicts;
> what octomux gives you is all N diffs in one review queue so you pick the merge order deliberately.

依頼の原文にある「作業はコンフリクトしないように配慮されていればよい」は、
1 を採るなら道具が保証するが**マージの順序は人が決めることになり**、
2 を採るなら分割そのものが人と規約の側に残る、という分かれ方になる。
どちらを選んでも人の工程が 1 つ残る。

### 問い 3「対話セッションの途中から board を操作できるか」

**答えられた。道具によって割れる。**

| 道具 | 対話セッションからの操作 | 手段 |
| --- | --- | --- |
| Claude Code の標準タスク | 対話セッションからはできる。subagent からはできない | `TaskCreate` / `TaskUpdate`。ツールなので会話の途中でそのまま呼べる。ただし subagent には提供されない（2-5） |
| kanban-md | できる | CLI（`--dir` で任意の板）。MCP は無い。同梱 skill が使い方を規定する |
| Backlog.md | できる | `backlog mcp start` で 21 tool（stdio のみ）。CLI も可 |
| vibe-kanban | できる（sunsetting） | MCP（`start_workspace` / `create_session` / `create_issue` ほか） |
| Kandev | できる | MCP 2 系統。subtask の生成と他タスクへの message を含む |
| Kangentic / AgentsRoom / Conductor / Devin / Tembo | できる | MCP |
| Orca | できる（前回の判定を訂正） | CLI を skill として注入。`worktree create --parent-worktree active`、`worktree set --workspace-status` |
| Ouijit | できる | CLI を PATH に注入。agent binary を shadow して lifecycle hook を差し込む |
| KAO | できない | 板が未実装 |

**「対話中に思いついた話題をカードにして、後でフォークして別セッションに回す」を
1 つの道具で満たすのは Kandev だけ**だった。カードの生成（MCP）と、
親タスクの session を引き継いだ sub-task の生成が同じ口に載っている。

「これはフォークして別セッションにやらせよう」の判断から実行までは、Claude Code の中で完結する。
会話の途中で打てるものが 4 つある。

- `/subtask <task>` — 待つ。結果が会話に戻る。**ただし fork 先はタスクツールを持たない**
- `/fork <directive>` — 会話全体を複製して background session にする。元は走り続ける。
  docs が用途として "when you want to try several approaches in parallel from the same starting point"
  を挙げている
- `/branch` — 会話を分岐させる。"forks the conversation to try two approaches"
- `/batch` — 1 指示を 5〜30 単位に分解し、単位ごとに worktree つきの background subagent を出して PR まで作る

「セッションがフォークされ文脈もその時点では引き継がれて分岐する」という原文の記述は、
`/fork` の docs の "The copy starts with everything in the conversation up to that point" と
そのまま一致する。**この機能はすでに存在する。**

---

## 解釈

ここから先は観測ではなく判断。

### kanban-md は採らないほうがよい

f058 が kanban-md を推した決め手は「手編集を公式が保証している」だった。
`Files are the API.` は嘘ではないが、**保証されているのは「手で書いたファイルを認識すること」までで、
「手で書いた内容を保つこと」ではない。** 実測した 1-1 と 1-2 がその境目にあたる。

今回の要件に照らすと、3 点で外れる。

1. **カードに実行の記録を持たせられない。** 1 カード : N セッションを表すには、
   カードのどこかに「このカードが生んだセッション」を書く場所が要る。
   frontmatter は固定 17 フィールドで、足したキーは次の書き込みで消える。
   残るのは本文への追記だけで、これは構造を持たないので機械が読めない
2. **壊れたことに気づけない。** f058 は「壊れたときの戻し方は git があれば同じで、
   違いは壊れたことに気づく手段のほう」と書いていた。kanban-md 側の答えが出た。
   検査コマンドは無く、宙ぶらりんの親と依存は警告なしに正常として扱われ、
   不正な status のカードは board から黙って消える
3. **読み取りが破壊的でありうる。** `list` を打っただけで rename と書き直しが走る。
   git 管理下に置いたとして、意図しない差分が出る

決め手が失効した以上、暫定採用は出発点として扱い、選び直したほうがよい。

### 代わりに検討すべき 4 つ

#### (a) Claude Code の標準タスクツールを、そのまま板として使う

f058 は「キーは 8 種、親子が無く、状態も 3 値」を制約として挙げ、
自前ファイルへ寄せる根拠にした。1 つ訂正が要る。**`metadata` は任意のキーを取る**
（TaskCreate の describe の逐語 "Arbitrary metadata to attach to the task"）。
「このカードが生んだセッション」の一覧は、ここに置ける。

そのうえで、f058 の他の指摘は残る。

- 状態は 3 値。列を増やせない
- 親子は無く、`blocks` / `blockedBy` で代用する
- git で差分を追えない

得られるものは、**owner と claim が最初から入っていること**と、
`TaskCreated` / `TaskCompleted` / `TeammateIdle` の hook で強制をかけられること。
teammate に板のパスが自動で差し込まれるので、フォーク先が板を見る配線も要らない。

**ただし、フォーク先が subagent なら板は見えない**（2-5 の実測）。
標準タスクを板にするなら、分岐は subagent ではなく teammate か
バックグラウンドセッションで作ることになり、そこが選択と一体になる。
「これはフォークして別セッションへ」の既定手段が `/subtask` なら、この案は成り立たない。

#### (b) Backlog.md — 2 件の比較では、これが勝つ

f058 は「手編集の可否」を最初の決め手にして kanban-md を推した。
実測でその軸が消えた。**両方とも未知の frontmatter キーを黙って落とす。**
kanban-md はそれを `Files are the API.` と称し、Backlog.md は
`Do not edit ... directly.` と称している。挙動は同じで、言い方が逆なだけだった。

軸が消えたので、残りの差で決まる。全部 Backlog.md に寄る。

| 観点 | kanban-md | Backlog.md |
| --- | --- | --- |
| 1 カード : N 実行の置き場 | 本文への時刻つき追記だけ（非構造） | `## Comments`。index・時刻・著者を持つ |
| 読み取りが破壊的か | `list` でも書き直しが走る | 編集したときだけ |
| 整合性の検査 | コマンド自体が無い | `doctor` はあるが守備範囲が狭い（1-9） |
| 対話セッションからの口 | CLI のみ | MCP 21 tool + CLI |
| 日本語のファイル名 | 落ちる（`002-.md`） | 残る |
| 人が見る手段 | TUI のみ | Web UI と export |

`## Comments` が要点になる。「1 カードが複数のセッションを生む」の記録先として、
実行 1 件 = comment 1 件、`--comment-author` にセッション ID か agent 名を入れる形が素直に載る。
**両ツールの差で、要件に直接効くのはここだけ**と言ってよい。

弱点も 2 つある。

- **同じ操作でも入口によって制約が違う**（1-8）。MCP 経由だけ長さ上限がかかる。
  Claude が MCP を使い、人が CLI を使うと、書けるものが食い違う
- `--cwd` が `mcp start` でしか効かない。板の切り替えは `BACKLOG_CWD` だけ

#### (c) 自前で持つ

前回のフォームで第 3 の選択肢として挙がっていたもの。
kanban-md が落ちた以上、比較の相手が「標準タスク + metadata」と Backlog.md に変わる。
自前で書くなら、それがこの 2 つより何を足すのかを先に決める必要がある。

#### (d) 新しく候補に入るもの: Kandev

f058 の 18 件にも前回の追加調査にも出てこなかった。
今回の 3 つの問いを 1 つの道具で満たす**唯一の例**だった。

- カードが子カードを生み、子は**親タスクの session を resume する**（文脈が引き継がれる）
- 対話セッションから MCP でカードを作れる。他タスクの走っている agent に message も送れる
- repo ごとに worktree で隔離する

ただし採否を決められる材料は足りていない。star 数・保守状況・カードの保存形式
（git に入るか）・日本語の扱いを確かめていない。**候補として挙げるところまで。**

### 問いの分解について

依頼の 3 分解は正しい。ただし、これに答えても道具は決まらない。
決めるために追加で要るのは、冒頭に書いた 2 つ（カードの単位が変わったか、板を誰が見るか）と、
この調査で新しく出た 2 つ。

**(3) フォーク先の進捗が板に戻ってくる必要があるか。**
vibe-kanban も Kandev も、カードと実行の対応をツール自身が持っているから板に状態が戻る。
Claude Code + 外部の板（Backlog.md でも）という構成にすると、
フォーク先が終わったことを板に書き戻すのは Claude 自身の仕事になり、書き忘れても誰も検知しない。
標準タスクツールなら `TaskCompleted` hook で止められるが、そのぶん列が 3 値に固定される。

**(4) 分岐の既定手段は何か。** これが道具の選択と一体になっている。

| 既定手段 | 標準タスクの板が見えるか | 文脈を継ぐか |
| --- | --- | --- |
| `/subtask`（subagent） | 見えない（実測） | 継ぐ |
| `/fork`（background session） | 未確認 | 継ぐ |
| teammate | 条件付きで見える | 継がない |
| `claude --bg` の別セッション | 自分の板を持つ。親の板は見えない | 継がない |

つまり「文脈を継ぐ」と「板が見える」が、いまの Claude Code では両立していない可能性がある。
外部の板（MCP か CLI）にすると、この対立は消える。**これが、標準タスクではなく
外部の板を選ぶ最大の理由になりうる。** f058 が挙げた入れ子や列の自由度より効く。

---

## 答えられなかったもの

- **Kandev の実体**。今回いちばん要件に近いと判定したが、star 数・保守状況・
  カードの保存形式（git に入るか）・日本語の扱いを何も確かめていない。
  採否を決めるには最低限これが要る
- **Claude Code の `metadata` の上限**。任意のキーを取ること（tool 定義の逐語と、
  手元の実データ 1 件）は確認したが、サイズの上限や、板として使ったときの表示のされ方は未確認
- **`isSidechain` / `forkCount` の正確な意味**。transcript のキーとバイナリ内の文字列として
  存在することは確認したが、fork と非 fork をどう区別しているかは未確認。
  `~/.claude/projects/` の全 jsonl を grep したところ `"isSidechain":true` は 0 件で、
  subagent の記録は本体の transcript とは別のファイルに落ちている（`tasks/*.output`）
- **`/fork` の実挙動**。docs の逐語は確認したが、実際に打っていない。
  fork 先が標準タスクツールを持つかも未確認（`/subtask` の fork 先が持たないことは実測済み）
- **emdash の Best-of-N**。docs のページが 404 で、repo 内 docs にも code search にも該当が無い。
  検索インデックスにだけ残っている状態で、**裏が取れなかった**
- **Backlog.md の Web UI（`browser`）と export、kanban-md の TUI の実挙動**
- **日本語のファイル名の名前長超過と NFC / NFD 不一致**（Backlog.md は Unicode 正規化をしない）。
  失敗の再現はしていない
- 各 vendor の細部: Codex の attempt ごとの branch / PR 生成、Jules の比較 UI、
  Charlie の sandbox の実体、Devin の子セッションのマージ手順
