# kanban の板の道具を、観点を定義して比較し直す

決めることは 1 つ。並行する話題を追う板を、どの道具の上に置くか。
この文書は観点の定義と比較までを担い、導入するかどうかは決めない。

結論は 2 つ。

f058 の決め手が失効したという追加調査の判断は正しい。
ただし根拠に挙げられていた「両ツールとも未知の frontmatter キーを落とす」は、
f058 の軸（手で書いたファイルを認識するか）とは別の性質を測っている。
Backlog.md も手書きのカードを認識することを実測したので、結論は別の根拠で立つ。

道具は taskmd を推す。要件「壊れたときに気づける」に答えている実装がこれだけで、
要件「人も板を見られる」も満たすため。
条件が 1 つ付く。実行の記録は frontmatter ではなく worklog に置く。
frontmatter への並行更新は、片方が黙って消えることを実測した。

前提は 3 つ。板の実体を自前のファイルに置くこと（ccm-f058 の設問 1 で確定）、
分岐のやり方を 1 つに絞らないこと、いま板の代わりに使っているのが
`/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/todo.md`（541 行、H2 見出し 43 個）であること。

観測はすべて 2026-09-01 に取った。
kanban-md・Backlog.md・taskmd・nd は実際にインストールして実行した結果で、
標準タスクツール・Kandev・スイープで見つけた候補は実装とドキュメントの読み。
どちらであるかと、誰が実行したかを節ごとに書く。
ツールが記録する時刻には UTC のものとローカル時刻のものが混ざる。

---

## 1. 観点の導出

### 要件を列挙する

依頼で与えられた要件は 6 つ。

1. 対話セッションの途中で思いついた話題を、その場でカードにできる
2. 板の実体は自前のファイルに置く
3. 1 枚のカードから複数のセッションが生まれることを記録できる
4. 分岐のやり方は 1 つに絞らない。会話ごと fork する、1 セッションが 2 つ同時に進める、
   subagent に投げる、worktree を切って別セッションに依頼する、のどれもありうる。
   どのパターンでも、カードと実行の対応が板に書ける
5. 人も板を見られる
6. 壊れたときに気づける

### 要件 1 件が観点 1 つになるとは限らない

要件をそのまま観点にすると、道具の差が出ない粒度になる。
例えば要件 3 を「1 カード : N 実行を記録できるか」のまま観点にすると、
どの候補も「本文に書けば記録できる」で並んでしまい、選べない。

そこで、各要件について「これが満たされないのはどういう場合か」を 1 段掘って観点にした。
要件 3 なら、記録が失敗するのは「置き場に反復構造が無い」場合と
「1 件ごとに識別子と時刻を持てない」場合に分かれるので、観点も 2 つになる。

### 要件どうしの衝突からも観点が出る

要件 2（板は自前のファイル）と要件 4（worktree を切った別セッション）は衝突する。
git worktree を切ると、repo 内のファイルは worktree ごとに複製される。
板を repo 内に置いた状態で worktree を切ると、その worktree は板の複製を持ち、
そこへの書き込みは merge するまで本体の板に現れない。

これは実測した。`git worktree add` した先に `backlog/tasks/` の 2 ファイルが
そのまま複製されていた。だから「cwd が変わっても本体の板を指せるか」が独立した観点になる。

同じく要件 4 と要件 1 の衝突から、「分岐先の種類によって板に書けたり書けなかったりしないか」が出る。
Claude Code の標準タスクツールは subagent に提供されないという実測記録があり、
分岐先の種類が板への到達可能性を変えることが分かっているためだ。

### 要件に無いが落とせないもの

存続性を観点に足した。要件には無い。

板は未着手を溜める場所なので、道具が消えると溜めた内容ごと動かなくなる。
今回の経緯の中で、f058 の 18 件のうち vibe-kanban が sunsetting、
Terragon が停止済み、HumanLayer の repo が deprecated と分かっている。
要件 2（自前のファイル）はこのリスクを部分的に打ち消すが、
道具が持つ書式に依存する分は残る。

### 導出の結果

要件 6 つから観点 10 個を得た。

| 要件 | 観点 |
| --- | --- |
| 1. その場でカードにできる | 観点 1 起票の口 |
| 2. 板の実体は自前のファイル | 観点 2 板の実体と git 可視性 |
| 3. 1 カードから複数のセッションを記録 | 観点 3 実行記録の反復構造 / 観点 4 実行 1 件が持てる属性 |
| 4. 分岐のやり方を絞らない | 観点 5 分岐先が板に書けるか |
| 5. 人も板を見られる | 観点 7 人が見る手段 |
| 6. 壊れたときに気づける | 観点 8 壊れの検出 / 観点 9 道具自身の非破壊性 |
| 2 と 4 の衝突 | 観点 6 板の位置指定 |
| 要件に無い | 観点 10 存続性と撤退コスト |

※ 表 1 要件と観点の対応

---

## 2. 観点の定義

各観点について、何を問うているか・なぜ要るか・どう判定したかを書く。

### 観点 1 起票の口

問い: 対話中の Claude が、会話を離れずにカードを 1 件作れる手段は何か。

要件 1 から来る。「その場で」が条件なので、起票が別端末・対話プロンプト・
事前の初期化を要求するなら、思いつきは板に載らない。

判定: 各候補の `--help` を読み、カードを 1 件作るのに必要な操作を数えた。
CLI なら Bash 1 回、MCP なら tool 呼び出し 1 回、ファイル直書きなら Write 1 回を 1 手と数える。

### 観点 2 板の実体と git 可視性

問い: カードがどのパスにどの形式で残り、既定で git の追跡下に入るか。

要件 2 から来る。「自前のファイル」の目的は、板を git の履歴で追えることにある。
道具が既定で板を .gitignore に入れるなら、要件 2 を満たしたつもりで満たしていない。

判定: 各候補で板を新規に作り、生成されたファイルのパスと、
`.gitignore` への書き込みの有無を実測した。

### 観点 3 実行記録の反復構造

問い: 1 枚のカードに、実行 N 件を反復構造として書けるか。

要件 3 から来る。実行が 2 件目・3 件目と増えたときに、
機械が「これは 3 件のうちの 2 件目」と読める形になっている必要がある。
本文への自由記述は人が読めても機械が読めないので、この観点では反復構造に数えない。

判定: 各候補のスキーマ定義（構造体・型定義・frontmatter の書き出し）を読み、
配列または反復ブロックを持つフィールドを数えた。
そのうえで、実際に 2 件書いてファイルの中身を見た。

### 観点 4 実行 1 件が持てる属性

問い: 実行 1 件に、識別子・時刻・種別（fork か並行か subagent か worktree か）を
機械が読める形で持たせられるか。

要件 3 と要件 4 から来る。要件 4 が分岐のやり方を 4 通り認めているので、
「どのやり方でその実行が生まれたか」がカードから読めないと、
後から板を見ても実行の再開・打ち切りの判断ができない。

判定: 観点 3 で見つけた反復構造の 1 要素が持てるフィールドを数えた。
文字列 1 本しか持てないなら、種別は自前でエンコードすることになる。

### 観点 5 分岐先が板に書けるか

問い: 会話ごと fork した先・subagent・別セッション・worktree を切った先の
それぞれから、同じ板に書けるか。

要件 4 から来る。要件 4 は 4 通りの分岐をどれも認めるので、
特定の分岐先から板が見えない道具は、その分岐だけ記録が落ちる。
落ちたことは板の側からは分からない。

判定: 板への書き込み手段が、その分岐先で利用できるかを見た。
Bash を持つ分岐先なら CLI は使える。ツールとして提供される板は、
ツールの提供有無がモデルと分岐先の種類で変わる。

ファイルベースの候補どうしでは、この問いに差が出ない。
そこで、同じカードへ 2 プロセスから同時に書いたときの挙動も、この観点で測った。
分岐が並行に走る以上、同時書き込みは要件 4 の中に含まれる。

### 観点 6 板の位置指定

問い: cwd が板の場所と違っても、本体の板を指せるか。指す手段は何か。

要件 2 と要件 4 の衝突から来る。worktree を切ると板が複製されるので、
worktree 側のセッションが本体の板に書くには、板の場所を明示する手段が要る。

判定: 板の場所を指定するフラグと環境変数を `--help` とコードから探し、
cwd を板と無関係な場所（`/`）に置いて実行できるかを実測した。

### 観点 7 人が見る手段

問い: Claude を介さずに人が板を見る手段は何か。

要件 5 から来る。

判定: 各候補の閲覧系コマンドを実行し、出力の形式（TUI / Web / テキスト）を見た。
生の Markdown を人が読めるかも、この観点に含めた。

### 観点 8 壊れの検出

問い: 板が壊れた状態（存在しない親、存在しない依存、定義に無い status）を、
検出する手段があるか。

要件 6 から来る。f058 は kanban-md の検査コマンドの有無を未確認のまま残していた。

判定: 検査コマンドの有無を `--help` で確認したうえで、
存在しない親・存在しない依存・定義に無い status を仕込んだカードを実際に置き、
検査コマンドと一覧表示がどう反応するかを実測した。

### 観点 9 道具自身の非破壊性

問い: 手で書いた内容を、道具が黙って消さないか。読み取りのつもりの操作で書き込まないか。

要件 6 の裏側から来る。要件 6 は「壊れたときに気づける」だが、
壊す主体が道具自身なら、検出の前に発生源を見る必要がある。

判定: 未知の frontmatter キー・独自の本文セクション・
既知フィールドへの手書きの値を仕込み、読み取り系コマンドと編集系コマンドを
それぞれ 1 回実行して、ファイルの前後を比較した。

### 観点 10 存続性と撤退コスト

問い: 道具の保守が続いているか。止まったとき、板の内容は何に依存して残るか。

要件には無い。板は未着手の溜め場なので、道具が消えると溜めた内容ごと止まる。

判定: star 数・最終 push・ライセンス・archived の有無を GitHub API で取得した。
撤退コストは、板の書式が道具なしで読めるかで判定した。

---

## 3. 候補

依頼で指定された 5 件（kanban-md / Backlog.md / Claude Code の標準タスクツール /
自前で持つ / Kandev）を出発点にして、要件を満たすものを追加で探した。

比較に載せたのは 7 件。指定の 5 件に、スイープで見つけた
driangle/taskmd と paivot-ai/nd を足した。この 2 件を選んだ理由は、
要件をすべて満たしたうえで、実行 1 件に時刻と著者を持たせる仕組みと
整合性の検査コマンドを両方持っていたため。

### 比較に載せなかったもの

要件 2（板の実体は自前のファイル）と、道具が生きていることで切った。
出典はいずれも追加調査
（`/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/notes/artifacts/kanban-md-followup.md`）に逐語がある。

- vibe-kanban: 設計は要件に最も近い（1 issue : N workspace : N session を
  DB の migration で持つ）が、README が `Vibe Kanban is sunsetting.` と書いている
- Orca: worktree の分離と親子カードを持ち、CLI を skill として agent に配る。
  板の実体が repo 内のファイルではない
- HumanLayer: 1 task に複数 session をぶら下げる形を明文化しているが、
  repo が deprecated と書かれている
- Conductor: 1 workspace で複数 agent を走らせる形。板の実体が repo 内のファイルではない
- cline/kanban: 設計文書が 1 カード : 1 セッションを明言し、サイドバーの対話は
  カードにならないと書いている
- saltbo/agent-kanban: agent が subtask を作れるが、保存が Cloudflare D1 で git に入らない
- kanban-agent-orchestrator（ユーザー自身の repo）: 1 カード : N セッションを
  設計と実装の両方で採っているが、板そのものが未実装で、開発が 4 か月止まっている
- best-of-N 系の 8 件（Codex の `--attempts`、Cursor の `/best-of-n`、Jules の `--parallel`、
  OpenChamber、Cezar、octomux、uzi、Orca）: 同じ prompt を N 本に配る仕組みで、板を持たない

### スイープで新しく出た候補

依頼で指定された 5 件のほかに、要件をすべて満たす候補を探した。
探索はもう 1 本の Claude が行い、判定の根拠は各 repo の README・docs・型定義。
自分では実行していないので、以下はドキュメントと実装の読みに基づく。
star と最終 push は 2026-09-01 の GitHub API の値。

要件をすべて満たすものが 10 件見つかった。1 カード : N 実行の表現手段が
設計に入っている順に並べる。

- driangle/taskmd（68 star / 2026-08-27 / MIT / Go）。
  `tasks/` 配下の Markdown。実行の記録は worklog で、
  `<task-dir>/<group>/.worklogs/<ID>.md` に追記専用で積む。1 件が RFC 3339 の時刻を持つ見出しになる。
  CLI と MCP の両方を持ち、Claude Code plugin が 2 つある。
  `taskmd validate` が必須フィールド・enum・依存・循環を検査する。
  実測の結果は「taskmd の実測」に書いた。
  仕様書のソースの 53 行目に
  "Unknown frontmatter fields are silently ignored by the parser and preserved as-is in the file."
  という一文がある。ただし HTML コメントの中に置かれていてレンダリングされないので、
  仕様として生きているかは文面からは決まらない。実測で判定した
- paivot-ai/nd（8 star / 2026-07-22 / Apache-2.0 / Go）。
  `.vault/issues/PROJ-xxxx.md`。`## History` が status 遷移を、
  `## Comments` が RFC 3339 の時刻と著者付きのエントリを積む。
  `nd doctor --fix` が frontmatter の `content_hash` の不一致・壊れた依存・
  History の drift を修復すると docs にある。実測では手書きのカードがあると panic した。
  詳細は「nd の実測」に書いた。
  既定では issue ファイルを code branch ではなく専用の backlog branch に置く
- iAmMichaelConnor/planny（0 star / 2026-08-31 / MIT）。
  `.planny/tasks/<id>.md` の frontmatter に `history:` 配列を持ち、
  1 要素が `at` / `status` / `by` を持つ。
  session ID を階層にする設計を README が明示していて
  （"an orchestrator passes its id to subagents ... and may suffix per child (`sess-abc/builder`)"）、
  fork と subagent の親子関係をそのまま板に写せる唯一の例だった。star 0 で単独作者
- illodev/workfile（2 star / 2026-08-27 / MIT）。
  `.project/cards/T-NNNN-slug.md`。`## Activity` が時刻と実行主体つきのエントリを積む。
  CLI に `--expected-revision` の楽観ロックがあり、MCP と Claude Code plugin を同梱する。
  `workfile doctor` を持つ。star 2
- dip497/hivemind（6 star / 2026-08-31 / MIT）。`.hivemind/issues/<ID>.md`。
  型定義に `activity: ActivityEntry[]`（`at` / `who` / `message`）がある。整合性検査は未確認
- questpie/agent-board（4 star / 2026-07-16 / MIT）。`.agent-board/`。
  `progress` が `## Evidence` へ時刻付きのチェックポイントを追記する。
  `claim` が排他ロックで、他の agent の claim を奪わない
- Vladev0/agentboard（1 star / 2026-07-20 / MIT）。
  `vault/projects/<slug>/tasks/<KEY-N>.md`。`## Updates` / `## Comments` / `## Activity` の
  3 つが反復エントリ。MCP 15 tool。著者欄は `agent` と `human` の 2 値で実行 ID が入らない
- itsoneword/deviz（0 star / 2026-07-21 / ライセンス無し）。追記専用の `## Comments`。
  ライセンスが無いので既定では全権利留保
- DevMandalia/Solaris（5 star / 2026-08-14 / MIT / Python）。`## Log` への追記
- onmyway133/nod（29 star / 2026-06-03 / ライセンス無し）。Work Log への追記。著者を持てない

このうち上位 2 件（driangle/taskmd と paivot-ai/nd）だけを実測の対象にした。
残りを外した理由は、star が 4 以下で単独作者か、ライセンスが無いか、
実行 1 件に著者を持たせられないかのいずれか。

### 設計は合うが道具として欠けるもの

- farol-team/gnap（83 star / 2026-03-17 / MIT）。
  データモデルがこの用途に最も近い。README の Run の定義を逐語で引く。
  "A single attempt to work on a task. One JSON file per run."、
  続く段落が "Tasks can have many runs."。
  ファイルは `.gnap/runs/{task-id}-{attempt}.json`。
  ただし CLI も MCP も無く、CLAUDE.md が
  "This is a protocol spec repo, not a traditional software project." と書いている。
  自前で持つ場合のファイル形式の下敷きとして使える
- Priivacy-ai/spec-kitty（1,577 star / 2026-08-31 / MIT）。1 実行 1 JSONL ファイル。
  カードに相当するのが spec と plan を伴う mission で、思いつき 1 件に対して重い

### スイープで落としたもの

- 保存先が repo 内のファイルでない: Getty/karr（`refs/karr/*`）、
  git-bug/git-bug（"embeds issues, comments, and more as objects in a git repository (not files!)"）、
  TechDufus/openkanban（`~/.config/openkanban/`）、langwatch/kanban-code（`~/.kanban-code/links.json`）、
  leodavinci1/kanbots（SQLite）、gastownhall/gastown（Dolt）、spencermarx/orc（Beads）、
  Zaida-3dO/agent-standup（Postgres）、DanWahlin/ai-agent-board（SQLite / PostgreSQL）、
  davidcjw/agent-task-board（localStorage）、Justmalhar/AgentsBoard（localStorage）、
  rakesh97/kanban（`~/.kanban/`）、r-ms/claude-task-board（gitignore を指示）、
  SinnConsulting/LoopBoard（`.loopboard/` が gitignore）、OthmanAdi/plandeck（journal が gitignore）
- 書き込みの口が無い: Phil200727/contextops、mattjoyce/kanban-skill
- 1 カード : N 実行の構造が無い: NazzarenoGiannelli/tuiboard、hasanyilmaz/operon、
  nimbalyst/nimbalyst、appsoftwareltd/vscode-agent-kanban
- 保守が止まっている: AutoMaker-Org/automaker（LICENSE に
  "This project is no longer actively maintained."）、sit-fyi/sit、driusan/bug、glogiotatidis/gitissius
- 評価できなかった: tissue（GitHub に無く README を取得できなかった）、
  jan-bogaerts/md2（on-disk のスキーマと操作の口が未確認）

---

## 4. マトリックス（観測）

要件 2（板の実体は自前のファイル）で表を 2 つに割る。
満たす候補が表 2、満たさない候補が表 3。
値は短い判定で、根拠は次の節に置く。
自前は「自前で持つ場合に評価した形」で定義した仮の形に対する判定。

| 観点 | kanban-md | Backlog.md | taskmd | nd | 自前 |
| --- | --- | --- | --- | --- | --- |
| 1 起票の口 | CLI 1 コマンド。MCP 無し | CLI 1 コマンド。MCP 21 tool | CLI 1 コマンド。MCP 9 tool に create が無い | CLI 1 コマンド。`q` の quick capture あり。MCP 無し | Write 1 回。採番は自分で守る |
| 2 板の実体と git 可視性 | repo 内の Markdown。`init` の既定が `kanban/` を gitignore | repo 内の Markdown。既定で追跡下 | repo 内の Markdown。`.gitignore` を作らず既定で追跡下 | repo 内の Markdown。コードブランチからは除外し `nd/backlog` へ自動 commit | 置き場も形式も自由 |
| 3 実行記録の反復構造 | 文字列配列 `tags` の 1 つだけ | `## Comments` / `assignee` / `references` の 3 つ | 未知の frontmatter キーが残る。別ファイルの worklog も持つ | 未知の frontmatter キーが残る。`## Comments` と `## History` | 任意の配列を持てる |
| 4 実行 1 件の属性 | 文字列 1 本。時刻を持てない | 著者と時刻を持つ。種別は本文へ | frontmatter は制限なし。worklog は時刻のみ | comment は時刻と著者。history は時刻のみ | 制限なし |
| 5 分岐先が板に書けるか | Bash があればどれでも。claim 中は 1 者のみ | Bash があればどれでも。競合は retry 可能なエラー | Bash があればどれでも。frontmatter の並行更新が黙って消える | Bash があればどれでも。flock で直列化し 12 件すべて残った | Write があればどれでも。競合は後勝ち |
| 6 板の位置指定 | `--dir` のみ。worktree で複製される | `BACKLOG_CWD` のみ。worktree で複製される | `--task-dir` のみ。環境変数なし。`--worktree-scope` は読みだけ横断 | `--vault` と `ND_VAULT_DIR`。板が backlog branch にあり複製されない | 絶対パス。worktree で複製される |
| 7 人が見る手段 | TUI のみ。TTY が要る | ローカル Web UI、Markdown export、生の Markdown | ローカル Web UI。リリース版のみ同梱。read-only 起動あり | ターミナルの `graph` と生の Markdown。Web UI 無し | 生の Markdown と自作の HTML |
| 8 壊れの検出 | 手段なし。不正な status は board から消える | `doctor` は ID 重複のみ。不正な status は一覧に出る | `validate` が status・依存・親・循環・重複を exit 1 で報告 | `doctor` は親の欠落を見ず exit 0。手書きカードがあると panic | 書けば持てる。書くまで無い |
| 9 道具自身の非破壊性 | 未知キーが消える。読み取りも書き込む | 未知キーが消える。読み取りは書き込まない | 未知キーを保つ。手書きのカードを認識する | 未知キーを保つ。独自セクションの位置で comment が読めなくなる | 壊す主体は Claude 自身 |
| 10 存続性 | star 205 / 2026-08-24 / MIT | star 6,593 / 2026-08-31 / MIT | star 68 / 2026-08-27 / MIT | star 8 / 2026-07-22 / Apache-2.0。単独作者 | 外部への依存なし |

※ 表 2 板を repo 内のファイルに置ける候補。star と最終 push は 2026-09-01 に GitHub API で取得

| 観点 | 標準タスクツール | Kandev |
| --- | --- | --- |
| 1 起票の口 | TaskCreate ツール 1 回。対話セッションのみ | 外部 MCP。server の常駐が要る |
| 2 板の実体と git 可視性 | `~/.claude/tasks/` の JSON。repo 外 | SQLite 単一ファイル。repo 外 |
| 3 実行記録の反復構造 | `metadata` に任意の JSON。型上は配列も可 | `task_sessions` テーブル |
| 4 実行 1 件の属性 | 制限なし。ただしツールから読み戻せない | session 行の全列。REST なら任意キー |
| 5 分岐先が板に書けるか | subagent は持たない。fork は板をコピー | MCP を持つ分岐先。subagent での可否は未確認 |
| 6 板の位置指定 | `CLAUDE_CODE_TASK_LIST_ID` で共有。複製は起きない | 中央の DB 1 つ。複製が起きない |
| 7 人が見る手段 | ターミナルの `ctrl+t` パネルのみ | ローカル Web UI のみ |
| 8 壊れの検出 | 検査なし。壊れたカードは一覧から黙って消える | 論理検査なし。DB の integrity_check のみ |
| 9 道具自身の非破壊性 | 手編集の想定が無い。形式は非公開 | 未知キーはエラーで拒否。手編集の概念が無い |
| 10 存続性 | Claude Code 本体。提供がゲートで変わる | star 719 / 2026-08-31 / AGPL-3.0 |

※ 表 3 板を repo 内のファイルに置けない候補。要件 2 を満たさない

---

## 5. 値の根拠

### kanban-md と Backlog.md の実測

自分で実行した。環境とバージョンは次のとおり。

- kanban-md: HEAD `6f01678748ac44027b58ca98ce62a680ec899963`（2026-08-24）から
  ビルドしたバイナリ。ソースは scratchpad の `kanban-md`、バイナリは `kmd`。
  板は `v2km/kanban` を新規に作った
- Backlog.md: npm 配布の 1.50.1。コード読みは clone
  `a71804357d9d27a1f6c7421b99302ff8ed815961`（2026-08-31）。
  板は `v2bl/backlog` を新規に作り、`git worktree add` で `v2bl-wt` を切った
- GitHub API の star 数・最終 push は 2026-09-01 に取得

#### 観点 1 起票の口

- kanban-md: `kanban-md create "タイトル"` の 1 コマンド。
  `--tags` `--parent` `--depends-on` `--body` を同時に渡せる。MCP は無い。
  Claude Code 用の skill を 2 本同梱する
- Backlog.md: `backlog task create "タイトル"` の 1 コマンド。
  MCP server も持ち、`backlog mcp start` の stdio で 21 tool を出す。
  tool 名は `get_backlog_instructions` `task_create` `task_list` `task_search` `task_edit`
  `task_view` `task_dependencies` `task_archive` `task_complete` と
  milestone 系 5 件・document 系 5 件・DoD 既定値 2 件

Backlog.md には板とは別の溜め場がある。`draft create "後で考える話題"` が
`backlog/drafts/draft-1 - 後で考える話題.md` を作り、`draft promote` で板へ上げる。
着手を決めていない思いつきを、板の列を消費せずに置ける。
kanban-md に相当する仕組みは無く、status の列を 1 つ充てることになる。

#### 観点 2 板の実体と git 可視性

- kanban-md: `kanban/tasks/NNN-slug.md` と `kanban/config.yml`。
  `init` が `Add "kanban/" to .gitignore? [Y/n]` を対話で聞き、既定は Yes。
  何も考えずに Enter を押すと板は git の外に出る
- Backlog.md: `backlog/tasks/task-N - タイトル.md`。`init` は `.gitignore` を作らない。
  作成直後から git の追跡下に入る。日本語のファイル名がそのまま残る

ファイル名の非 ASCII の扱いは f058 の実測どおりで、
kanban-md は slug が空になって `NNN-.md` になり、Backlog.md は日本語を残す。

#### 観点 3 実行記録の反復構造

- kanban-md: `internal/task/task.go` の `Task` 構造体は 17 フィールド固定で、
  文字列の配列は `Tags []string` の 1 つだけ。`edit --add-tag` で任意の文字列を足せる。
  `edit --append-body --timestamp` は本文末尾に `[[2026-09-01]] Tue 07:41` 付きで積むが、
  これは非構造のテキスト
- Backlog.md: 反復構造が 3 つある。`## Comments` セクション、`assignee` 配列、`references` 配列。
  `## Comments` は `<!-- COMMENTS:BEGIN -->` と `<!-- COMMENTS:END -->` で挟まれ、
  1 件が `author:` `created:` と本文を持つ

`## Comments` に 2 件書いて `backlog task 1 --plain` で読み直した出力。

```text
Comments:
--------------------------------------------------
#1 - session:bb99 - 2026-08-31 22:41 (UTC)
run2: worktree feat-x で別セッション開始

#2 - agent:explore - 2026-08-31 22:41 (UTC)
run3: subagent へ委譲
```

index と著者と時刻が付いて返る。

comment の本文には制約が 1 つある。単独の `---` 行を含められない。
含めると exit 1 で
`Comment body cannot contain standalone '---' delimiter lines.` を返す。
黙って壊れるのではなく拒否される。

#### 観点 4 実行 1 件が持てる属性

- kanban-md: タグ 1 件は文字列 1 本。
  `edit 1 --add-tag "run:2/session=bb99/worktree=feat-x"` は通り、
  その後の `move` でも消えなかった。種別と識別子は自分で 1 本の文字列にエンコードすることになる。
  時刻は持てない
- Backlog.md: comment 1 件が `author` と `created` を持つ。種別は本文へエンコードする。
  `references` は 1 件が文字列 1 本で、CLI では `task create --ref` のときだけ書ける。
  `task edit` に `--ref` は無いが、MCP の `task_edit` には `addReferences` と
  `removeReferences` がある

#### 観点 5 分岐先が板に書けるか

ファイルベースの 4 件（kanban-md / Backlog.md / taskmd / nd）は、
分岐先が Bash を実行できれば書ける。
分岐先の種類（fork / subagent / 別セッション / worktree）による差は無い。
4 件に共通する性質なので、この中では選択に効かない。

効くのは、同じカードへの同時書き込みの扱いのほう。
kanban-md と Backlog.md はここで逆を向く。

kanban-md の claim は、カードに対する長期の排他ロックになる。
`edit 1 --claim agent-a` を通したあと、`agent-a` を名乗らない
`move` `edit --assignee` `edit --append-body` はすべて exit 1 で拒否され、
標準エラーに
`task #1 is claimed by "agent-a" (expires in 57m0s). If this is you, add: --claim agent-a`
が出た。カードのファイル自体も `-r--r--r--` になっていた。
有効期間は `config.yml` の `claim_timeout: 1h` で決まり、設定で変えられる。

Backlog.md のロックは編集の実行中だけで、競合した側は retry を促して落ちる。
同じカードへ `--comment` を並行に打つ試行を 10 ラウンド実測し、
両方通った回と片方が落ちた回の両方が出た。落ちた側の標準エラーは毎回同じ文だった。

```text
Edit failed: TASK-1 is being modified by another process; retry if appropriate.
```

カードが壊れた回は無かった。

kanban-md のロックには穴がある。claim を持っていない側から
`edit 1 --release` を打つと exit 0 で通り、claim が外れた。
名乗りの検証はロックの取得側にしかかかっていない。

#### 観点 6 板の位置指定

- kanban-md: グローバルの `--dir` だけ。環境変数は無い。
  `--dir` は `kanban` ディレクトリ自体を指す必要があり、プロジェクトルートを渡すと
  "no kanban board found" になる。cwd を `/` にして `--dir` を絶対パスで渡す実行は通った
- Backlog.md: `BACKLOG_CWD` だけ。`--cwd` は `mcp start` のときしか解釈されない。
  cwd を `/` にして `BACKLOG_CWD` を渡す実行は通った

worktree に板が複製されることは実測した。
`v2bl` を commit してから `git worktree add v2bl-wt -b wt` すると、
`v2bl-wt/backlog/tasks/` に 2 ファイルがそのまま入った。

Backlog.md は他ブランチを走査する仕組みを持つ（`config.yml` の `check_active_branches: true`、
`board` の実行時に "Indexing 1 other local branches" と出る）。
ただし worktree のブランチで `TASK-9` を Done にして commit したあと、
main 側の `board` は `TASK-9` を元の status のまま出した。
走査が状態を取り込む条件は未確認。

#### 観点 7 人が見る手段

- kanban-md: `tui` の対話 UI、`board` と `list` のテキスト出力。生の Markdown。Web UI は無い。
  `tui` は TTY を要求し、`< /dev/null` で起動すると exit 1 で
  `could not open a new TTY: open /dev/tty: device not configured` を返す。
  端末の前にいないと板を見られない
- Backlog.md: `browser` が Web UI を出す（既定 port 6420）。
  help が `open browser interface on this machine only at 127.0.0.1` と書くとおり
  bind 先を変えるフラグは無く、別の端末から見るにはトンネルが要る。
  port 6421 で起動して `GET /` が 200 を返すこと、`GET /api/tasks` が
  `references` と `assignee` を含む JSON を返すことを確かめた。
  `board export` は Markdown の板をファイルに書き出す（`--readme` で README.md へも入る）。
  `overview` が統計を出す。生の Markdown も読める

`board export` の出力。

```text
# Kanban Board Export (powered by Backlog.md)
Generated on: 2026-08-31 22:47:59
Project: v2

| To Do | In Progress | Done | Bogus Status |
| --- | --- | --- | --- |
|  | **TASK-1** - 手書きのカード [@session:6f5a1ac9, ...] |  | └─ **TASK-9** - broken |
```

#### 観点 8 壊れの検出

存在しない親（777 / TASK-777）、存在しない依存（404 / task-404）、
設定に無い status を仕込んだカードを両方の板に置いて確かめた。

- kanban-md: 検査コマンドが無い。サブコマンド 20 個に validate / check / doctor は無い。
  不正な status のカードは `board` の列に現れず、Total だけが増える。
  実測では Total: 2 に対し backlog 0 / doing 1 / done 0 で、合計が合わない。
  `show 9` は `↑ Parent  #777` を正常なリンクとして表示する
- Backlog.md: `doctor` はあるが、help が範囲を明示している。
  "diagnose duplicate task, document, and decision IDs and safely repair duplicate task IDs"。
  仕込んだ 3 つに対する出力は `No duplicate task, document, or decision IDs found.` だけだった。
  ただし `task list --plain` は `Bogus Status:` を列として描画するので、
  不正な status は一覧を見れば目に入る

どちらも検査は要件を満たさない。差は、不正な status のカードが
kanban-md では板から見えなくなり、Backlog.md では見えることにある。

#### 観点 9 道具自身の非破壊性

未知の frontmatter キー（`my_custom_key` と `runs:` の配列）、独自の本文セクション、
既知フィールドへの手書きの値を仕込んで比べた。

- kanban-md: `move 1 doing` を 1 回打つと未知キーが両方消える。標準出力は
  `Moved task #1: backlog -> doing` の 1 行だけで警告は無い。`tags` と本文は残る。
  読み取り系のコマンドも書き込む。`list` の実行で
  `Warning: auto-repaired consistency issue: updated next_id from 1 to 2` が出て
  `config.yml` が書き換わった。
  ファイル名が ID と一致していれば、この `list` でカードのファイル自体は書き換わらなかった。
  カードを書き換えるのは、ファイル名と ID が食い違っているときの rename の経路
- Backlog.md: `task edit TASK-1 -s "In Progress"` で未知キーが両方消える。警告は無く exit 0。
  `references` `assignee` `labels` と本文は残る。`task list` はファイルを書き換えなかった

#### 観点 10 存続性と撤退コスト

GitHub API の値（2026-09-01 取得）。

- kanban-md: star 205、最終 push 2026-08-24、MIT、archived ではない
- Backlog.md: star 6,593、最終 push 2026-08-31、MIT、archived ではない

撤退コストはどちらも小さい。カードは frontmatter 付きの Markdown なので、
道具が無くなっても内容は読める。
Backlog.md の `## Comments` は marker コメントで囲まれた素のテキストなので、
道具なしでも読める。

### taskmd の実測

板の作成とテストカードの投入はもう 1 本の Claude が行い、
`validate` と `list` の実行、生成されたファイルの確認は自分で行った。
バイナリは repo の `8d2c41873ec92df2be20fa94e440deb76137dab7`（2026-08-27）から
ビルドした `taskmd version 0.4.1`。板は scratchpad の `v3taskmd`。

未知の frontmatter キーが残る。これが kanban-md と Backlog.md との最大の差になる。
`my_custom_key` と、要素が `session` と `role` を持つ `runs:` の配列を手で足したカードに
status の変更を通したあと、両方が元のまま残っていた。

```yaml
created_at: 2026-09-01
my_custom_key: keep-me
runs:
  - session: sess-A
    role: builder
  - session: sess-B
    role: reviewer
```

仕様書のソースの
"Unknown frontmatter fields are silently ignored by the parser and preserved as-is in the file."
は、HTML コメントの中にあるが挙動としては生きている。
カードに `runs:` の配列を持たせる設計が、この 1 件だけで成立する。

手で書いたカードを認識する。`list` の出力に、CLI を通していない
`002-hand-written.md` が出た。

ただし表示は defect を隠さない代わりに増やす。`list` は定義に無い status を
そのまま表示して exit 0 で終わり、`board` は不正な status ごとに勝手に列を作る。
`in-progress` と `in_progress` と `totally-not-a-status` が別々の列として並んだ。

`validate` が要件 6 を満たす唯一の実装だった。
存在しない親・存在しない依存・定義に無い status を仕込んだ板に対して、
自分で実行した出力。

```text
❌ Found 4 error(s):

  [002] invalid status: 'in_progress' (valid values: pending, in-progress, completed, in-review, blocked, cancelled)
  [900] invalid status: 'totally-not-a-status' (valid values: pending, in-progress, completed, in-review, blocked, cancelled)
  [900] dependency references non-existent task: '888'
  [900] parent references non-existent task: '999-does-not-exist'

Validated 5 task(s): 4 error(s)
```

exit code は 1。help が挙げる検査項目は
required fields / invalid field values（status, priority, effort）/ duplicate task IDs /
missing dependencies / circular dependencies の 5 つ。

実行の記録は worklog で、カードの中ではなく
`tasks/.worklogs/<ID>.md` に置かれる。`.taskmd.yaml` に `worklogs: true` を書くまで無効。
エントリは RFC 3339 の時刻を見出しにした本文で、著者のフィールドが無い。
実測したファイル。

```markdown
## 2026-08-31T22:58:30Z

run 1: builder pass

## 2026-08-31T22:58:30Z

run 2: reviewer pass
```

並行の書き込みは、置き場によって結果が分かれる。

worklog への追記は無事だった。同じカードへ 2 プロセスから並行に追記した 5 ラウンドで、
10 件すべてが残った。1 ラウンド目の境界だけ、エントリの後の空行が落ちていた。

frontmatter への書き込みは失われる。
`set 004 --add-tag` を 2 プロセスから並行に打った 5 ラウンドのうち 3 ラウンドで、
片方のタグが消えた。両プロセスとも exit 0 で、標準エラーは空、
どちらも `Updated task 004:` の成功メッセージを出した。
排他制御が無く、失敗が呼び出し側に伝わらない。

これは要件 4 に直接効く。カードの `runs:` を 2 つのセッションが同時に足すと、
片方が黙って消える。実行の記録を frontmatter に置く設計は、
書き込みを直列化する約束とセットにしないと成り立たない。

板の位置指定は、グローバルフラグ `-d, --task-dir` と `--config` で渡す `.taskmd.yaml`。
環境変数は無く、`TASKMD_DIR` も `TASKMD_TASK_DIR` も効かない。
`.taskmd.yaml` の `dir: ./tasks` は設定ファイルの位置を基準に解決される。
フラグを付けずに `/` で `taskmd list` を打つと、既定の `--task-dir .` から再帰スキャンに入り、
2 分のタイムアウトまで戻らなかった。
加えて `--worktree-scope` があり、既定は `unified`。
`.taskmd.yaml` の例が範囲を明示している。

> "In a git repo with multiple worktrees, 'unified' merges task state across all
> of them for reads: each task shows its most advanced status, and 'next' skips
> tasks claimed in a sibling worktree. Writes always stay in the current worktree,
> and single-worktree repos and non-git directories are unaffected."
>
> 出典: taskmd の docs/.taskmd.yaml.example

統合されるのは読みだけで、書き込みは今いる worktree のファイルに残る。
worktree 側で付けた実行の記録が本体に入るのは、git で merge したときになる。
要件 2 と要件 4 の衝突は、半分だけ解けている。

起票の口は CLI。MCP もあるが、カードを作れない。
`taskmd mcp` に stdio で initialize と `tools/list` を投げて自分で確かめたところ、
tool は 9 個で `context` / `get` / `graph` / `list` / `next` / `search` / `set` / `status` / `validate`。
`set` が触れるのは status / priority / effort / owner / tags だけで、
カードの作成も worklog の追記も frontmatter への任意のキーの書き込みもできない。
MCP を入口にすると読み取りと状態変更しかできず、起票と実行の記録は CLI かファイルの直書きになる。
各 tool は `task_dir` を引数に取るので、板の場所は呼び出しごとに指定できる。

repo の `.claude-plugin/marketplace.json` が Claude Code plugin を 3 本配る
（`taskmd` / `taskmd-mcp` / `taskmd-lite`）。

人が見る手段は `taskmd web start`。`--port`（既定 8080）、`--readonly`、`--open` があり、
help は `Live reload via Server-Sent Events when task files change` と書く。

ビルドの仕方で中身が変わる。`go install` したバイナリで起動すると、
`GET /` が `No web UI embedded in this build.` を返す。API は動くが SPA が入っていない。
配布されているリリースバイナリ（`taskmd-v0.4.1-darwin-amd64`）では
`<title>taskmd dashboard</title>` を含む実物が返った。

既定は書き込み可で、認証は無い。`--readonly` で起動すると
`PUT /api/tasks/001` が HTTP 403 と `{"error":"server is in read-only mode"}` を返し、
既定で起動すると HTTP 200 でファイルが書き換わった。

`init` は `.gitignore` を作らない。板は untracked のまま置かれ、
自動 add も自動 commit も無いので、git に入れるかは自分で決める。

frontmatter の固定フィールドは 20 個。status は 6 値の enum で、
`pending` / `in-progress` / `in-review` / `completed` / `blocked` / `cancelled`。
`.taskmd.yaml` で語彙を差し替えられるのは `effort` だけで、status は差し替えられない。
`owner` は単一の文字列。`tags` と `pr` と `dependencies` は配列。

### nd の実測

板の作成とテストカードの投入はもう 1 本の Claude が行い、
`doctor` の panic の切り分けは自分で別の板を作って再現した。
バイナリは `go install github.com/paivot-ai/nd@latest` で入れた v0.11.0。
板は scratchpad の `v3nd`、再現用に自分で作ったのが `v4nd`。

並行の書き込みは、比較した中で唯一まったく失われなかった。
`comments add` を 2 プロセスから 5 ラウンド打って 10 件すべてが残り、
`update --add-label` も 10 件すべてが残った。
4 プロセスを同時に上げた 3 ラウンドでも 12 件すべてが残った。
根拠は依存ライブラリ `vlt` の `lock_unix.go:27` にある
`syscall.Flock(fd, LOCK_EX|LOCK_NB)` で、
`.vault/.vlt.lock` に対する kernel の advisory lock を書き込みコマンドが取る。
タイムアウトは 10 秒で、`VLT_LOCK_TIMEOUT` で変えられる。

未知の frontmatter キーは残る。`my_custom_key` と `runs:` の配列を足したカードに
`update --status` を通しても、両方が残った。
`content_hash` は本文のハッシュなので自動で振り直される。

ただし本文の独自セクションには置き場所の制約がある。
`## Runs` を `## Comments` より後ろに置くと、その後の `comments add` が
ファイルの末尾（`## Runs` の後ろ）に追記され、`comments list` は
コメントを 1 件も返さなくなった。ファイルには存在するのに読み戻せない。

`## Comments` の 1 件は時刻と著者を持つ。著者は OS のユーザー名で、
`init --author` で既定を変えられる。
`## History` は `update --status` が自動で積むが時刻だけで、
`--priority` と `--assignee` の変更は何も残さなかった。
History に任意の実行記録を積む CLI は無い。

`doctor` は要件 6 を満たさない。3 つの理由がある。

第 1 に、存在しない親を報告しない。
`parent: demo-nope` を仕込んだカードに対して `doctor` は一言も出さず、
`children demo-nope` はそのカードを平然と返した。

第 2 に、問題を報告しても exit 0 を返す。
5 件の問題を出力しながら終了コードは 0 だった。

第 3 に、`content_hash` を持たない手書きのカードがあると panic する。
自分で新しい板を作って切り分けたところ、
不正な status だけ・存在しない親だけ・存在しない依存だけの 3 通りのどれでも、
`content_hash` の無いカードが 1 枚あれば必ず落ちた。

```text
panic: runtime error: slice bounds out of range [:20] with length 0
github.com/paivot-ai/nd/cmd.init.func26(...)
    .../nd@v0.11.0/cmd/doctor.go:40
```

exit code は 2。`doctor --fix` も 1 件目を直した直後に同じ場所で落ち、残りの検査ごと止まる。
手で書いたカードと `doctor` は現状併用できない。

拾えるものもある。content_hash の不整合、存在しない依存、
双方向リンクの片側欠け、不正な status、必須セクションの欠落の 5 つは報告した。

起票は `create` のほかに `q`（quick capture、ID だけを出力する）がある。
MCP は無いが、Claude Code plugin を配っている
（`claude plugin marketplace add paivot-ai/nd` と `claude plugin install nd@nd`）。

板の位置は `--vault` と環境変数 `ND_VAULT_DIR` の両方で指定できる。
フラグ無しで `/` から打つと即座に exit 1 で終わる（taskmd のようにハングしない）。
ただしメッセージが実態と違う。

```text
Error: vault .vault is busy (another nd/vlt process holds the lock; retry, or raise VLT_LOCK_TIMEOUT): open .vault/.vlt.lock: no such file or directory
```

busy ではなく、ファイルが無いだけ。

git の扱いが他と違う。`init` が `.vault/.gitignore` を書いて
`issues/` と `.nd.yaml` をコードブランチから外し、代わりに `nd/backlog` ブランチを作る。
書き込みコマンドが 1 回ごとにそのブランチへ自動 commit する。
`sync` を一度も打っていない時点で `nd/backlog` の commit は 49 個あり、
`main` は `init` の 1 個のままだった。作業ツリーは常に `main` にいて checkout は切り替わらない。
`init --track-issues` を選ぶとコードブランチに issue ファイルを追跡させられる。

人が見る手段は無いに等しい。HTTP サーバも web UI も持たず
（`cmd/` 配下に `net/http` も `ListenAndServe` も無い）、
`graph` はターミナルへの出力だけ。
依存を張っても出力は平坦な 2 行で、辺もインデントも出なかった。
`graph --json` は `--json` を無視して同じテキストを返す。
残るのは生の Markdown で、Obsidian 互換の `[[ID]]` リンクを持つ。


### 自前で持つ場合に評価した形

自前は形を 1 つ決めないと観点で判定できない。次を仮の形として評価した。
この形自体は決まっていない。

- カード 1 枚 = repo 内の Markdown 1 ファイル。frontmatter に id / title / status と
  `runs` 配列（1 要素が kind / ref / started / note）
- 書き込みは Claude の Write と Edit。CLI もツールも挟まない
- 人が見るのは、生の Markdown と、claude-html-communication の共通ページディレクトリへ
  生成する HTML。後者は `CLAUDE_HTML_COMMUNICATION_BASE_URL` の serve URL で
  端末の外から見られる
- 検査は自前のスクリプト

観点ごとの判定は次のようになる。

- 起票の口: Write 1 回。ID の採番と一覧の更新を自分で守ることになる
- 板の実体: 置き場も形式も自由。git の追跡下に置ける
- 実行記録の反復構造: `runs` 配列を frontmatter に持てる。落とす道具がいない
- 実行 1 件の属性: 制限が無い
- 分岐先が板に書けるか: Write と Edit を持つ分岐先ならどれでも書ける。
  ロックは無いので、同時書き込みは後勝ちになる。実装しない限り検知できない
- 板の位置指定: 絶対パスで指す。worktree での複製は同じように起きる
- 人が見る手段: 生の Markdown と serve URL の HTML
- 壊れの検出: 書けば持てる。書くまで無い
- 道具自身の非破壊性: 道具がいないので道具は壊さない。壊す主体は Claude 自身になる
- 存続性: 外部への依存が無い。維持は自分が持つ

増える管理物は、検査スクリプトと HTML 生成の 2 つ。

### Claude Code の標準タスクツールの観測

自分では実行していない。バイナリ
`/Users/ryosuke/.local/share/claude/versions/2.1.252` の `strings` 出力と
`~/.claude/tasks/` の実データを、もう 1 本の Claude が読んだ結果。

要件 2 を満たさない。板の実体は `~/.claude/tasks/{板 ID}/{連番}.json` で、repo の外にある。
実測で板ディレクトリ 47 個・タスク JSON 315 件。

f058 が「キーは 8 種」と書いた制約のうち、`metadata` の性質は訂正が要る。
TaskCreate の入力スキーマで `metadata` は zod の `record(string, unknown)` として定義され、
describe は `Arbitrary metadata to attach to the task`。
キーは任意の文字列、値は任意の JSON 値で、ネストしたオブジェクトも配列も型の上では通る。
TaskUpdate 側はマージで、`Metadata keys to merge into the task. Set a key to null to delete it.`

実データでは自由度が使われていない。315 件のうち `metadata` を持つのは 3 件だけで、
キーは `kind` / `url` / `file` / `handover` の 4 種、値はすべて string。
ネストしたオブジェクトと配列は 0 件。型の上で通ることと、実際に通ることは別なので、
配列を入れた実測は無い。

読み戻しに非対称がある。TaskGet の出力スキーマは
`{id, subject, description, status, blocks, blockedBy}` で `metadata` を含まない。
TaskList も `{id, subject, status, owner, blockedBy}` だけ。
`metadata` に書いた実行の記録は、ツールからは読めず JSON を直接読むことになる。
`_internal` は予約キーで、真のタスクは一覧から消える。

板 ID はセッション ID 固定ではない。決定の優先順は
環境変数 `CLAUDE_CODE_TASK_LIST_ID`、team context の `teamName`、
リーダーの `leaderTeamName`、セッション ID の順。
同じ `CLAUDE_CODE_TASK_LIST_ID` を複数セッションに渡せば 1 つの板を共有できる。

分岐先による差が大きい。

- subagent: Task 系 4 ツールと TodoWrite を落とす分岐がバイナリにある。
  今回の調査を実行した subagent 自身が `ToolSearch` で
  `select:TaskCreate,TaskGet,TaskList,TaskUpdate` を投げて
  `No matching deferred tools found` を受けた。
  `~/.claude/settings.json` の `CLAUDE_CODE_ENABLE_TODO_TOOLS` と
  `CLAUDE_CODE_ENABLE_TASKS` は届いているので、モデルによるゲートとは別の経路で落ちている
- teammate: 落とされない。板のパスが system-reminder に `- Task list: ${e.taskListPath}` として差し込まれる
- fork: 板を共有せずコピーする。`CLAUDE_CODE_TASK_LIST_ID` が設定済みか、
  既にチームの板になっている場合だけコピーせず共有する
- `--bg` の別セッション: 自分のセッション ID の板を持つ

板が壊れたことに気づく手段は無い。読むたびに zod で検証し、
落ちたタスクは `null` になって一覧から除外される。
ユーザーへの通知は無く、debug ログにしか残らない。
一括の検査・修復コマンドは見つからなかった。
手で JSON を壊したときの挙動は実測していない。

人が見るのはターミナル内の `ctrl+t` パネル。
`/tasks` はバックグラウンドプロセスの一覧で、この板とは別系統。
ターミナルの外から見る手段は見つからなかった（無いとは断定できないので未確認）。
板ディレクトリは Read ツールで読める（permission 側に
`Task files are allowed for reading` の分岐がある）。

hook は 3 つとも実在する。TaskCreated と TaskCompleted は
`task_id` / `task_subject` / `task_description` / `teammate_name` / `team_name` の 5 つを受け取り、
exit 2 で操作を差し戻す。TeammateIdle は `teammate_name` と `team_name` を受け取る。
hook の入力に `metadata` は含まれない。
TaskCreated はファイルを書いた後に発火し、exit 2 のときは書いたタスクを消す。

### Kandev の観測

自分では実行していない。clone した実装をもう 1 本の Claude が読んだ結果で、
出典はすべて clone
`/private/tmp/claude-501/-Users-ryosuke-ghq-root-github-com-ryosukee-cc-marketplace/6f5a1ac9-240c-4c0e-be10-705d93aef656/scratchpad/kandev`
からの相対パスと行番号で示されている。star 719 / 最終 push 2026-08-31 / AGPL-3.0 は
自分が GitHub API で取得した。

要件 2 を満たさない。カードの保存は SQLite の単一ファイル
（既定 `~/.kandev/data/kandev.db`。Postgres も選べる）で、
repo 内のファイルとして置く手段が無い（`docs/db.md:1-27`、`README.md:182`、
`apps/backend/internal/launcher/constants.go:38-45`）。git の履歴で追えない。

repo に触れないわけでもない。ユーザーの元リポジトリの `.git/info/exclude` に
`/.kandev/` を 1 行追記する（`apps/backend/internal/agentctl/server/api/workspace_diagnostics.go:89-110`）。
書き込み先は `commondir` を辿って解決するため、worktree 側ではなく元の `.git` に入る（同 `:112-153`）。

要件 3 と要件 4 に対する表現力は、比較した中で最も強い。
`task_sessions` テーブルが `task_id TEXT NOT NULL` の外部キーと `is_primary INTEGER DEFAULT 0` を持ち、
インデックスは UNIQUE ではない（`apps/backend/internal/task/repository/sqlite/base_schema.go:922-960`）。
1 カードに N セッションがスキーマとして入っている。
対照的に `executors_running` は `session_id TEXT NOT NULL UNIQUE` で 1:1（同 `:296`）。

板は中央の DB 1 つなので、worktree を切っても板が複製されない。
要件 2 と要件 4 の衝突が起きない唯一の候補になる。

対話中の Claude Code から操作できる。外部 MCP として
`claude mcp add --transport http --scope user kandev http://localhost:38429/mcp` を追加すると、
`create_task_kandev` / `list_tasks_kandev` / `move_task_kandev` を呼べる
（`docs/specs/integrations/requirements/external-mcp.md:23-26`）。
任意のキーを持つ `metadata` は MCP の引数に無く、REST の `POST /api/v1/tasks` にだけある
（`apps/backend/internal/task/handlers/task_http_handlers.go:739,757`）。
MCP のスキーマは検証前に `additionalProperties: false` を立てるので、
未知のキーは黙って捨てられずエラーで弾かれる（`tool_argument_validation.go:56`）。

人が見る手段は Web UI だけ。TUI は無い。ローカルで完結し、アカウントは要らない。
backend が port 38429（`README.md:237-243`、`apps/backend/internal/launcher/constants.go:9-12`）。

日本語のタイトルと本文は UTF-8 のまま保存でき、長さの数え方もルーン単位
（`apps/backend/internal/task/service/task_title.go:11,18`）。
ただしブランチ名と worktree ディレクトリ名を作る `SanitizeForBranch` が
ASCII 英数以外をすべて `-` に置換するため、日本語だけのタイトルはブランチ名から消える
（`apps/backend/internal/worktree/config.go:117-124,133-168,205-219,477-487`）。
kanban-md のファイル名と同じ落ち方をする。

板の論理的な整合性を検査する手段は無い。
起動時の `PRAGMA integrity_check`（`apps/backend/internal/persistence/sqlite_selection.go:180-186`）と
マイグレーション前のスナップショット（`persistence/provider.go:66-110`、2 世代保持）は自動で走るもので、
孤児セッションや壊れた親子関係を報告する手段ではない。

README の "Sub-tasks - Agents can spawn sub-tasks that resume from the parent task's session." は、
実装では `workspace_mode=inherit_parent` による worktree の継承で、
親の `resume_token` を子へコピーする経路は見つからなかった
（`orchestrator/handoff_inheritance.go:85-113`）。会話の継続ではない。

---

## 6.「決め手が失効した」の検証

追加調査の結論は、f058 の決め手が消えた根拠として
「両ツールとも未知の frontmatter キーを黙って落とすので、手編集の保証という軸が差にならなくなった」を挙げていた。
結論は正しいが、根拠が f058 の軸と別のものを測っている。

### f058 の軸が問うていたこと

f058 の本文を逐語で引く。

> "手で書いたファイルを認識するかが、最初の決め手になる。kanban-md は保証している。"

軸は認識であって保持ではない。f058 はこの軸の根拠として、
kanban-md の README の "Files are the API." と、Backlog.md の AGENTS.md の
"Do not edit Backlog task, draft, document, decision, or milestone markdown files directly." を並べていた。
どちらもドキュメントの文言で、挙動の実測ではない。

### 認識するかを実測した

Backlog.md の板を新規に初期化し、CLI を一度も通さずに
`backlog/tasks/task-1 - 手書きのカード.md` を手で書いた。
frontmatter に `references` の 2 要素配列、本文に `## Runs` という独自セクションを入れた。

`backlog task list --plain` の出力。

```text
To Do:
  TASK-1 - 手書きのカード
```

`backlog task 1 --plain` は `References: session:6f5a1ac9 role=main, session:aa23015f role=fork` を表示し、
`## Runs` セクションも Description の一部として出した。
そのあと `backlog task edit TASK-1 -s "In Progress"` を通しても、
`references` と `## Runs` は両方とも残った。

Backlog.md は手書きのカードを認識する。禁止はドキュメント上の方針で、実装は拒否しない。
つまり f058 の軸は、実測すると差が出ない。決め手が失効したという結論は正しい。

### 追加調査が挙げた根拠は、別の性質を測っている

未知の frontmatter キーが落ちることは、両ツールで再現した。

- kanban-md: `my_custom_key` と `runs:` を手で足したカードに `move 1 doing` を 1 回打つと両方消える。
  `tags` は残る
- Backlog.md: 同じ 2 キーを足したカードに `task edit TASK-1 -s "In Progress"` を打つと両方消える。
  `references` と `assignee` は残る

これは保持の話で、認識の話ではない。f058 の軸に対する反証としては使えない。
結論が正しいのは、上の認識の実測が別に取れているからだ。

### 追加調査の派生結論のうち、1 つは強すぎる

追加調査は、未知キーが落ちることから
「kanban-md はカードに実行の記録を持たせられない。残るのは本文への追記だけ」と結論していた。
これは行き過ぎている。

kanban-md の `Task` 構造体には `Tags []string` があり、任意の文字列を取る。
`edit 1 --add-tag "run:2/session=bb99/worktree=feat-x"` は通り、
その後の `move` でもタグは消えなかった。実行の記録はここに置ける。

追加調査が本文への追記だけと書いたのは、未知キーだけを見て既知の自由文字列配列を見ていないため。

### 代わりに、要件 4 を直接止める挙動が見つかった

kanban-md の claim は、カードに対する排他ロックとして実装されている。

`edit 1 --claim agent-a` を通したあと、`agent-a` を名乗らない操作はすべて拒否される。
実測した 3 つはどれも exit 1 で、標準エラーに
`task #1 is claimed by "agent-a" (expires in 57m0s). If this is you, add: --claim agent-a` を出した。

- `move 1 done`
- `edit 1 --assignee "a,b"`
- `edit 1 --append-body "run3"`

カードのファイル自体も読み取り専用になっていた（`-r--r--r--`）。
`--claim agent-a` を添えた `edit` だけが exit 0 で通った。

`assignee` は単一の文字列、`claimed_by` も単一の文字列で、
claim を持てるのは同時に 1 者だけ。
要件 4 の「1 セッションが 2 つ同時に進める」を、道具の側が構造として拒否している。

claim を使わなければロックはかからないが、
kanban-md が同梱する `kanban-based-development` skill は
`pick --claim --status todo --move in-progress` を並行開発の中心手順に据えている。
claim を使わない運用は、道具の想定から外れる。

Backlog.md の `assignee` は配列で、`task edit TASK-1 -a "session:6f5a1ac9,session:bb99,agent:explore"` が通り、
3 者が並んだ状態でファイルに残った。

kanban-md の README は、この挙動と食い違うことを書いている。

> "**No hidden state.** Everything is in `config.yml` and the task files.
> There's no database, no cache, no lock file.
> Two agents can work on the same board by editing different files and merging via git."
>
> 出典: kanban-md の README 824 行目

lock file は無いが、claim はファイルの permission と `claimed_by` による排他ロックとして働く。
同じ板の別々のファイルを 2 者が触れるのは正しく、同じ 1 枚のカードは触れない。

### 軸そのものが消えたわけではない

決め手が失効したのは、kanban-md と Backlog.md の 2 件を比べたときの話に限る。
手で書いた内容を保つかどうかは、候補を広げると差になる。
taskmd と nd は、未知の frontmatter キーを編集の後も保つ。
比較を 2 件に閉じていたことが、軸が消えたように見えた原因だった。

---

## 7. 解釈

ここから先は観測ではなく判断。

### 要件 2 が候補を 5 件に絞る

板の実体を自前のファイルに置く要件を満たすのは、
kanban-md・Backlog.md・taskmd・nd・自前の 5 件。
標準タスクツールは `~/.claude/tasks/` の JSON、Kandev は SQLite の単一ファイルで、
どちらも repo の中に置けない。

ただしこの要件は f058 の設問 1 への回答として確定したもので、
そのときの決め手は「入れ子と列が自由になり、git で差分を追える。未着手も同じ板に溜められる」だった。
決め手のうち「入れ子と列が自由」は Kandev も満たす。
残るのは「git で差分を追える」だけで、要件 2 を維持するかはこの 1 点をどれだけ重く見るかで決まる。

### 5 件のうち 3 件は、要件のどれかで落ちる

kanban-md は要件 4 と要件 6 で落ちる。
claim を持たない側からの `move` と `edit` はすべて拒否され、カードのファイルも読み取り専用になる。
検査コマンドが無く、定義に無い status のカードは board から見えなくなる。
読み取りのつもりの `list` が `config.yml` を書き換える。

nd は要件 5 と要件 6 で落ちる。
並行の書き込みは flock で守られていて、比較した中で唯一まったく失われなかった。
`## Comments` は時刻と著者を持ち、板は `nd/backlog` ブランチにあるので worktree でも複製されない。
そこまでは要件に合う。
落ちるのは、`doctor` が存在しない親を報告せず、問題を出しても exit 0 を返し、
`content_hash` を持たない手書きカードが 1 枚あると panic することと、
人が板を見る手段が terminal の平坦な 2 行と生の Markdown しか無いこと。

Backlog.md は要件 6 で落ちる。
`doctor` の守備範囲は ID 重複だけで、存在しない親・存在しない依存・定義に無い status は素通りする。
未知の frontmatter キーも落とすので、カードに `runs:` を持てない。

### taskmd を推す

要件 6 に答えている実装は taskmd の `validate` だけだった。
定義に無い status・存在しない依存・存在しない親・循環・ID 重複を exit 1 で報告する。
他の 4 件は、検査が無いか、範囲が ID 重複に限られるか、panic するか、自分で書くことになる。

要件 5 も満たす。リリースバイナリの `web start` がローカルの Web ダッシュボードを出し、
`--readonly` で書き込みを止められる。

要件 3 と要件 4 は、記録の置き場を worklog に決めれば満たせる。
worklog への並行追記は 5 ラウンドで 10 件すべてが残った。

### taskmd を採った場合の条件と、残る問題

推奨は覆せる。採る場合に決めておくことが 1 つ、残る問題が 4 つある。

決めておくのは、実行の記録を worklog に置き、frontmatter の `runs:` を使わないこと。
未知の frontmatter キーが残るので `runs:` の配列は書けるが、
2 プロセスが同時に frontmatter を更新すると 5 ラウンド中 3 ラウンドで片方が黙って消えた。
両方とも exit 0 で成功メッセージを出すので、消えたことに気づく手段が無い。
要件 4 の「1 セッションが 2 つ同時に進める」と正面から衝突する。

worklog のエントリは時刻しか持たない。
分岐の種別（fork か並行か subagent か worktree か）と実行の識別子は、本文へエンコードする。
その書式が壊れても `validate` は通る。書式を検査するなら、そこだけ自前のスクリプトを足す。

web ダッシュボードはリリースバイナリにしか入っていない。
`go install` で入れると `No web UI embedded in this build.` を返す。
導入するならリリースバイナリを取る。
書き込み可で起動すると認証なしで誰でも編集できるので、`--readonly` を既定にする。

板の場所を指すのはフラグだけで、環境変数が無い。
`--task-dir` を付けずに無関係な cwd で打つと再帰スキャンに入り、2 分で戻らなかった。
worktree を切った先のセッションには `--task-dir` の絶対パスを渡す約束が要る。
`--worktree-scope` の既定 `unified` が助けるのは読みだけで、書き込みは今いる worktree に残る。

status は 6 値の固定 enum で、`.taskmd.yaml` で差し替えられるのは `effort` だけ。
f058 が標準タスクツールを落とした理由の 1 つが「状態は 3 値。列を増やせない」だったので、
6 値で足りるかは先に確かめる。

保守は薄い。star 68、コミットのほとんどが 1 人。
Backlog.md の star 6,593 に比べると細い。
ただしカードは frontmatter 付きの Markdown なので、道具が止まっても内容は読め、別の道具へ移せる。

### 覆すなら Backlog.md に自前の検査を足す

保守の厚みと Web UI を要件 6 より重く見るなら、Backlog.md を採って
検査だけ自前のスクリプトで足す形になる。
検査の対象は、定義に無い status・存在しない親・存在しない依存・`## Comments` の書式の 4 つ。
増える管理物は検査スクリプト 1 本で、taskmd を採る場合に足す書式検査とほぼ同じ量になる。

この形を採ると、要件 3 の置き場は `## Comments` になり、
1 件が index と時刻と著者を持つ。taskmd の worklog より 1 段強い。
代わりに、カードに `runs:` の構造を持たせる道は閉じる。

### 自前を採らない理由

自前の利点は観点 3 と観点 4 の自由度だが、
taskmd が未知の frontmatter キーを保ち、Backlog.md が `## Comments` を持つ以上、
その差は小さい。
一方で、検査と Web UI と worktree 横断の読みを全部自分で書くことになる。
増える管理物は、どちらの既製品を採る場合よりも多い。

---

## 8. 未確認

- taskmd の `projects` によるグローバル登録。`~/.taskmd.yaml` への書き込みが要るので実行していない
- taskmd の `--worktree-scope` の実挙動。設定ファイルの説明文は読んだが、
  worktree を複数作って測ってはいない
- taskmd の web ダッシュボードの画面。HTML が返ることまでで、ブラウザでの描画は見ていない
- nd の `sync` の remote あり（push と merge）の挙動。remote を用意していない
- nd の `ND_AGENT` が comment の著者に効くか。claim の agent 名に効くことは
  ドキュメントで確認したが、comment の著者は OS のユーザー名で出た
- 要件 2 の決め手が今も成立するか。f058 の設問 1 で「git で差分を追える」ことを理由に
  自前のファイルを選んだが、Kandev のように中央の DB を持つ形が
  観点 6 の衝突を消すことは、そのときの選択肢に無かった
- Backlog.md の他ブランチ走査（`check_active_branches`）が、他ブランチの status を
  取り込む条件。worktree のブランチで変えた status は main 側の `board` に出なかった
- 標準タスクツールの `metadata` に配列やネストしたオブジェクトを入れた実測。
  型の上で通ることは確認したが、実データ 315 件では 0 件だった
- 標準タスクツールが subagent へ Task 系ツールを提供しないことを決めている flag
  `tengu_shale_finch` の実際の値
- 標準タスクツールの板を、ターミナルの外から人が見る手段。
  探して見つからなかったが、無いとは断定できない
- 標準タスクツールの JSON を手で壊したときの挙動。
  読み取り経路から一覧に出なくなると読めるが、壊して測ってはいない
- Kandev の MCP を subagent から呼べるか
- kanban-md の TUI の実挙動。TTY を要求して起動しないことは確かめたが、
  端末で開いた状態は見ていない
- スイープで見つけた候補のうち、実測していない 8 件
  （planny / workfile / hivemind / agent-board / agentboard / deviz / Solaris / nod）
