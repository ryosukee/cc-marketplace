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

調査中。結果が出たらここへ追記する。
