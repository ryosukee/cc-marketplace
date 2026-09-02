# kanban の候補を確定した要件で実測し直す

`notes/kanban-board.md` の確定 2（要件 6 件）と確定 4（親子・依存関係・独自の属性）で
観点を組み直し、候補を測り直した記録。観測日は 2026-09-02。

前の比較（`kanban-matrix.md`）の判定は根拠に使っていない。観点の組み方が誤っていたため。

## 観点

要件（満たさないものは候補から外れる）。

1. カードが親子の関係を持てる。何段まで持てるか
2. カードどうしの依存（順序の制約）を持てて、UI で見える
3. カードに名前の付いた独自の属性を足せて、その値で絞り込める
4. kanban の UI がある
5. 外部から状態を CRUD できる
6. セッションをまたいで残る
7. 人から全件が見える
8. カードが「どこで誰が作業しているか」を状態として持てる
9. セッションごとの絞り込みができる

優先条件（満たさなくても候補から外さない）。

- 板の実体が repo 内のファイルにあり、git で追える

## 既存候補 5 件

### 実測に使った版

| 道具 | 版 | 入手方法 |
| --- | --- | --- |
| kanban-md | HEAD `6f01678748ac44027b58ca98ce62a680ec899963`（2026-08-24）を `go build` | `git clone https://github.com/antopolskiy/kanban-md` |
| Backlog.md | 1.50.1 | `npm i backlog.md` |
| taskmd | 0.5.0（commit `87ba411b6489921ce6ae1c636ef65232506a1fb5`） | release binary |
| nd | v0.11.0 | `go install github.com/paivot-ai/nd@latest` |
| Kandev | v0.93.0 | release binary |

※ 表 1 実測に使った版と入手方法

試験の内容は、epic 1 枚 + 子 2 枚 + 孫 1 枚 + ひ孫 1 枚の木、子どうしの依存 1 本、
未知の frontmatter キー 2 つ（`session_id` と `worktree`）の投入。

### 判定

| 観点 | kanban-md | Backlog.md | taskmd | nd | Kandev |
| --- | --- | --- | --- | --- | --- |
| 1 親子 | 可。上限なし | 可。上限なし | 可。上限なし | 可。上限なし | 可。2 段まで |
| 2 依存 | 可。TUI 詳細のみ | 可。CLI と Web | 可。CLI・graph・Web | 可。CLI | 可。UI に表示 |
| 3 独自属性 | 不可。書き込みで消える | 不可。書き込みで消える | 不可。残るが絞り込めない | 不可。残るが絞り込めない | 不可。保存できるが絞り込めない |
| 4 kanban UI | 可。TUI | 可。TUI と Web | 可。Web のみ | 不可 | 可。Web のみ |
| 5 外部 CRUD | 可。CLI とファイル | 可。CLI・MCP・REST・ファイル | 可。CLI・MCP・REST・ファイル | 可。CLI とファイル | 可。REST・MCP・SQLite |
| 6 セッション跨ぎ | 可 | 可 | 可 | 可 | 可 |
| 7 全件が見える | 可 | 可 | 可 | 可。列の形は無い | 可。archived は既定で除外 |
| 8 どこで誰が | 部分的。担当者名のみ | 部分的。担当者名のみ | 可。worktree を自動で表示 | 部分的。担当者名のみ | 可。専用の列を多数持つ |
| 9 セッション絞り込み | 可。既存の欄を転用 | 可。既存の欄を転用 | 可。既存の欄を転用 | 可。既存の欄を転用 | 不可 |

※ 表 2 既存候補 5 件 × 観点 9 件の判定

### 観点 3 が全件で落ちる

落ち方が 2 通りに分かれる。

- kanban-md と Backlog.md は、未知の frontmatter キーを書き込みのたびに消す。
  警告は出ない。kanban-md は `edit 2 --status todo` を 1 回打つだけで `session_id` と
  `worktree` の両方が消えた
- taskmd と nd と Kandev は値を保持するが、絞り込みの経路が無い

taskmd の絞り込みが受け付けるフィールドは `sdk/go/filter/filter.go` の固定の switch で
13 個（title / blocked / tag / touches / parent / status / priority / effort / type / id /
group / owner / phase）。`sdk/go/model/task.go` の `Task` は名前付きフィールドの固定 struct で、
任意のキーを受ける map を持たない。この 2 点は GitHub の API で原文を取得して確認済み。

Kandev は `tasks.metadata` に任意の JSON を保存でき、`PATCH /api/v1/tasks/:id` で
入れたキーが読み戻せる。しかし一覧の handler が受け付ける query は 11 個の固定で、
`?metadata.team=platform` は無視されて全件が返る。

5 件が持つ `tags` / `labels` / `assignee` / `owner` はどれも文字列 1 本の列で、
キーと値の組ではない。`session=sess-B` のような書式を自分で決めて押し込む形になる。

### 観点 8 は taskmd が唯一きれいに答える

taskmd は sibling worktree を自動で横断する。板を commit してから `git worktree add` で
別の worktree を切り、そちらで status と owner を変えた後、本体側で `get` を実行した出力。

```text
Worktrees:
  this worktree: pending
  t-tm-wt (branch wt): in-progress (owner: agent-in-worktree)
```

実装は `apps/cli/internal/worktree/overlay.go` の `CopyEntry`。
状態が食い違う worktree が 2 つ以上あるときだけこの節を描く。

Kandev は専用の列を多数持つ（`task_sessions` の `workspace_path` / `base_commit_sha`、
API の DTO の `worktree_id` / `worktree_path` / `worktree_branch` / `container_id` ほか）。
ただし観点 9 が構造の側で不可能で、`task_sessions.task_id` が `tasks(id)` への
NOT NULL の外部キーのため、session は 1 つのカードにしか属さない。

### 板の置き場と git の扱い

| 道具 | 板の実体 | 既定の git の扱い |
| --- | --- | --- |
| kanban-md | `kanban/tasks/NNN-slug.md` | `init` が gitignore への追加を聞く。既定は Yes |
| Backlog.md | `backlog/tasks/task-N - タイトル.md` | untracked で置かれる |
| taskmd | `tasks/NNN-slug.md` | untracked で置かれる |
| nd | `.vault/issues/PREFIX-xxxx.md` | 既定は `nd/backlog` ブランチへ書き込みごとに自動 commit |
| Kandev | `~/.kandev/data/kandev.db`（SQLite） | repo 内に置く手段が無い |

※ 表 3 板の置き場と git の扱い

### 存続性

GitHub API から 2026-09-02 に取得した観測値。

| 道具 | star | ライセンス | 最終 push | 作者 |
| --- | --- | --- | --- | --- |
| kanban-md | 209 | MIT | 2026-08-24 | antopolskiy が 351 commit |
| Backlog.md | 6,608 | MIT | 2026-09-01 | MrLesk が 1,269 commit |
| taskmd | 69 | MIT | 2026-09-01 | driangle が 599 commit |
| nd | 8 | Apache-2.0 | 2026-07-22 | RamXX が 75 commit の単独 |
| Kandev | 729 | AGPL-3.0 | 2026-09-02 | 51 名。直近 30 日に 871 commit |

※ 表 4 存続性の指標

実質の単独作者は kanban-md・taskmd・nd の 3 件。
Kandev だけが複数人の体制で、ライセンスは AGPL-3.0 で他の 4 件と条件が違う。

### 数百枚での挙動

読み取りはどれも問題にならない。破綻の兆しがあるのは nd の書き込み側だけ。

- kanban-md（405 枚）: `list` 0.077 秒、`board` 0.068 秒
- Backlog.md（406 枚）: `task list --plain` 0.551 秒、`doctor` 0.701 秒
- taskmd（405 枚）: `list` 0.069 秒、`validate` 0.061 秒
- nd（205 枚）: `list -n 0` 0.040 秒。起票が 1 件あたり 200 ミリ秒（`nd q` 200 回に 40.4 秒）。
  書き込みごとに vault の flock を取り `nd/backlog` へ commit するため
- Kandev: 1004 件で一覧の応答が 77〜198 ミリ秒。REST の一覧は `page_size` が 100 で頭打ち

### 未確認

- kanban-md と Backlog.md の TUI 詳細画面。列とカードの画面は目視したが、
  キー入力が pty 経由で届かず詳細画面を開けなかった
- taskmd と Kandev の Web 画面の描画。HTTP の応答と component の構成までで、
  ブラウザで開いていない
- kanban-md と Backlog.md と taskmd で、板を持つブランチと別のブランチから板を見たときの挙動。
  taskmd の worktree 横断だけ実測した
- 5 件それぞれで、同じカードへ 2 プロセスが同時に書いたときの挙動

## 汎用の kanban と製品レベルのサービス

### 7 条件を単独で満たす 3 件

| 候補 | 自己ホスト | 落ちる条件 | 起動に要るもの |
| --- | --- | --- | --- |
| OpenProject Community Edition | 可 | なし（条件 7 は未確認） | コンテナ 1 個。4 コア / 4096 MB RAM。常駐 |
| YouTrack Server | 可 | なし（条件 7 は未確認） | Docker のみ。JVM ヒープ 1024m 以上。常駐 |
| GitHub Projects v2 | 不可 | なし | 常駐なし。`gh` CLI だけ |

※ 表 5 7 条件を単独で満たす候補

OpenProject は 17.3（2026-04-15）で全 action board 種別が Community へ移った。
公式の文言は "With this release, all Action board types are now available in the Community edition."
Enterprise 限定として残るのは Hierarchy 型と Weighted item list のカスタムフィールド 2 型、
および将来の swimlane と WIP 制限。データの実体は PostgreSQL のみで、git で追えない。
16,002 stars / GPL-3.0 / 最終コミット 2026-09-02。

YouTrack Server は 1 インスタンス・10 ユーザーまで無償。JetBrains のクローズドソースで、
無償枠は商用ライセンス条件に依存する。データは独自の in-process データベース（Xodus）。

GitHub Projects v2 は sub-issues が 2025-04-09 に GA（ネスト 8 階層、親 1 件あたり 100 件）、
issue dependencies が 2025-08-21 に GA（関係タイプごとに 50 件）、
カスタムフィールド 50 個、item 上限 50,000 件/project。
`gh project` が CRUD 一式を持ち（`field-create` を含む）、公式の MCP server が `projects` toolset を持つ。
必要なトークンスコープは `project`（`gh auth refresh -s project`）。
`gh project --help` と `GET repos/:owner/:repo/issues/:n/dependencies/blocked_by` は
2026-09-02 に手元で実行して存在を確認した。

### 条件 3（カスタムフィールド）が最も多くの候補を落とす

機能自体が無いもの。Vikunja・Kaneo・Linear・Plane CE・Forgejo/Gitea・Nextcloud Deck。
有償のもの。GitLab CE・Leantime。
ClickUp Free は 60 用途で頭打ちになる
（"Once you reach 60 uses on a Free Forever Plan Workspace, you can't add values to any Custom Fields"）。

### 条件 2（依存の UI）で落ちるもの

Planka・Taiga・Focalboard・NocoDB Community・Leantime。
Taiga の「block」はカード間の関係ではなく 1 枚のカードに付く真偽値フラグで、
順序制約の機能そのものが無い。

### Linear の判定

自己ホストできない。エージェント連携は「Linear for Agents」として Developer Preview
（"Linear for Agents APIs are currently in active development and available as a Developer Preview."）。
公式 MCP は `https://mcp.linear.app/mcp` で、Claude Code の追加手順が公式に載っている
（`claude mcp add --transport http linear-server https://mcp.linear.app/mcp`）。
課題を delegate すると Claude Code か Codex のコーディングセッションが走るが、
これは Basic 以上で無料枠では使えない。

落ちるのは 2 点。**ユーザー定義のカスタムフィールドが無い**（issue のプロパティは
team / status / priority / assignee / estimate / cycle / labels / project / milestone の固定セット。
代替は label）。**無料枠が 250 issues・2 teams で頭打ちになる**（Basic は $10/user/month で無制限）。

階層は Workspace > Team > Initiative > Project > Milestone > Issue > sub-issue。
sub-issue の最大ネスト段数は公式に記述が見つからなかった。

### エージェント向けで kanban UI を持つもの

**Beads (bd) + beads_viewer** は 7 条件を満たす。19 種の依存タイプ、
issue の `metadata` が任意 JSON で `bd list --metadata-field key=value` で絞り込める。
親子は階層 ID（`bd-a3f8` → `bd-a3f8.1`）。26,814 stars / MIT / 単一 Go バイナリ / 常駐不要。

kanban UI は本体に無く、別 repo の beads_viewer（TUI）が担う。
**この beads_viewer のライセンスに、採用の可否を左右する条項がある。**
LICENSE の 1 行目が "MIT License (with OpenAI/Anthropic Rider)" で、
"Restricted Parties" に Anthropic, PBC と
"any person or entity acting directly or indirectly on behalf of, for the benefit of,
or under the direction of any of the foregoing" を含め、
"no rights are granted to any Restricted Party" と定める。
GitHub の license 判定も `NOASSERTION`。2026-09-02 に GitHub の API で原文を取得して確認した。
Claude Code から使う形がこれに触れるかは法的判断が要る。

**Kandev** は Web UI が最もリッチだが、親子が 2 段まで、
`metadata` を値で絞り込めない、session が 1 カードにしか属せない。

**cline/kanban** はカードの単位が 1 タスク = 1 エージェントセッション = 1 個の一時 worktree。
親子が無く、列は 4 つ固定でユーザーが変えられず、label も任意フィールドも無い。
依存の矢印は両端の少なくとも一方が backlog 列にある場合だけ描かれ、
条件を外れたエッジは state のロード・セーブのたびに黙って削除される。
127 枚での破綻が PR #564 に記録されている。MCP は削除済み。

**Symphony** は kanban UI を持たない。Linear / Jira / Asana / GitHub / GitLab の板を
外部の control plane として読むスケジューラで、UI は実行中エージェントの status dashboard。
SPEC の文言は "Symphony does not require first-class tracker write APIs in the orchestrator.
The service remains a scheduler/runner and tracker reader."

### 開発が止まっているもの

Focalboard（README が "This repository is currently not maintained."）、
Taskcafe（2023-07）、Restyaboard（2023-10）、Nullboard（2023-11）、
Taskell（archived）、vibe-kanban（README の h1 が "Vibe Kanban is sunsetting."）。

### 未確認のまま残った項目

- カード数百枚での実測性能。全候補で未実測。公式にカード枚数基準の記述を持つものが 1 つも無かった
- Jira Cloud Free で課題リンク（blocks / is blocked by）が使えるか
- Tuleap に `blocks` / `depends on` / `precedes` の組み込み link type が同梱されるか
- Huly の Tracker Issue が Task クラスのカスタム属性を受け取るか、その値でフィルタできるか
- Planka のカスタムフィールドが自己ホスト版で実際に使えるか
- GitHub Enterprise Server での issue dependencies 対応
- Linear MCP が公開しているツール名の一覧、sub-issue の最大ネスト段数
- Beads の親子の最大段数
