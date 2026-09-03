# OpenProject / YouTrack / Wekan / Beads の repo 切り分け単位と上限（2026-09-03）

`notes/kanban-board.md` の残った候補のうち Linear と Plane 以外の 4 件について、複数 repo を
1 サービスに載せたときの切り分け単位・横断の kanban の可否・無料枠の上限を公式の一次情報で
確かめた記録。取得日は 2026-09-03。subagent の報告を逐語で写し、URL を `<>` で包んだ以外は手を入れていない。

<!-- markdownlint-disable MD004 MD032 MD034 MD037 MD049 -->
<!-- 逐語引用の中の記法（原文の * 箇条書き・_強調_・裸 URL）を lint に合わせて変えないため -->

`kanban-candidates-2026-09-02.md` の訂正が 1 件ある。beads_viewer の公式 repo は
steveyegge 配下ではなく `Dicklesworthstone/beads_viewer`（別作者）。


引用は原文の英語のまま、出典は公式サイト・公式 repo（docs の原文は raw.githubusercontent.com から取得し、該当する公開ページ URL を併記）。取得物は scratchpad `src/` に残してある（65 ファイル）。

## 先に結論（4 ツール横断）

- 「repo ごとに切り替え」と「全件を 1 つの kanban」を両方公式に満たすのは YouTrack Server（project 単位、1 枚の agile board に複数 project を載せられる）と Beads + bv（repo ごとの `.beads/` を hydration か bv workspace で束ねる）の 2 つ
- OpenProject は project 単位で、board は project 内に閉じる。project 横断は work package table（表形式）までで、横断 kanban は公式記載なし
- Wekan は board 単位で、board 横断は My Cards / Due Cards（表）と Search All Boards まで。横断 kanban は公式記載なし
- 無料枠の件数上限は 4 つとも「work item 数・project 数の上限記載なし」。YouTrack Server だけ user 数 10 の上限がある（1 人利用なら該当しない）

## 1. OpenProject Community Edition（self-host）

### 1-1. 切り分けの単位と横断ビュー

結論: 単位は project（親子の subproject あり）。board は project に属し、board 上のカードは current project の work package。project 横断は「Work packages global module」の表と、work package table の「Include projects」で可能。横断 kanban は記載なし。

- <https://www.openproject.org/docs/user-guide/projects/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/user-guide/projects/README.md>）
  > "Your projects can be available publicly or internally. OpenProject does not limit the number of projects, neither in the Community edition nor in the Enterprise cloud or in Enterprise on-premises edition."
- <https://www.openproject.org/docs/user-guide/agile-boards/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/user-guide/agile-boards/README.md>）
  > "To get an overview of the project specific boards, navigate to your project and select **Boards** from the menu on the left. You will see an overview of all the boards that have been created in that specific project until now."
  > "You can also view the boards on the instance level via [the global modules menu](../home/global-modules/#boards)."
  > "> To use this functionality, you need to [activate the Boards module](../projects/project-settings/modules) within your project."
  > （Subproject board）"Every list represents a subproject. Within the list you will find the subproject's work packages. By moving a card within a list you can change the order of the cards and if you move a card to another list you change the (sub)project of this work package."
  > （Parent-child board）"Only work packages from the current project can be selected as a list, i.e. can be chosen as the name of the list."
- <https://www.openproject.org/docs/user-guide/home/global-modules/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/user-guide/home/global-modules/README.md>）
  > "The **Work packages** global module shows a work packages table from the projects of which you are a member or have the right to view, including public projects."
  > "The **Boards** global module lists all boards to which you have access across all projects, including public projects."
- <https://www.openproject.org/docs/user-guide/work-packages/work-package-table-configuration/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/user-guide/work-packages/work-package-table-configuration/README.md>）
  > "It is possible to display work packages from multiple projects. To include or exclude work packages from specific projects, click the **Include projects** button at the top of the work package table view. From there, you can select or deselect the projects and sub-projects you want to include."
  > "If you want to view all work packages across all projects, you can either select all projects manually or use the [global work package tables](../../projects/project-lists/#global-work-package-tables)."
- <https://www.openproject.org/docs/user-guide/projects/project-lists/#global-work-package-tables>
  > "Select **Work packages** from the drop down menu **Global modules** in the upper left corner of the header navigation (nine squares). Now, you will see all work packages in the projects for which you have the required [permissions](...)."

補足: Subproject board は「親 project + その subproject 群」を 1 枚に載せる board なので、repo を subproject にして親 project に Subproject board を置けば「subproject（= repo）ごとの列」の 1 枚板にはなる。ただし列 = subproject であり status 列の kanban ではない（上記引用の帰結）。任意の project を 1 枚の Kanban board（status 列）に載せる方法は、上記 3 ページに記載なし → 未確認。

### 1-2. 無料範囲の上限

結論: Community edition は無料、user 数・project 数の上限なし。work package 数・ストレージの上限は記載なし。Action board（Kanban など全種）は 17.3.0 から Community で使える。

- <https://www.openproject.org/pricing/>（Community 列の表示テキスト）
  > "Community" / "Free" / "No minimum users"
- <https://www.openproject.org/docs/faq/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/faq/README.md>）
  > "The number of projects is always unlimited."
  > "For the Community edition you can have as many users as you need for free."
  > "The (on-premise) OpenProject Community edition is completely free."
- <https://www.openproject.org/docs/release-notes/17-3-0/>（原文 <https://raw.githubusercontent.com/opf/openproject/dev/docs/release-notes/17-3-0/README.md>）
  > "With the improvements to agile planning features such as sprints and backlogs, boards play a central role in organizing and tracking work. To support this, [all action board types](../../user-guide/agile-boards/#choose-between-board-types) are now available in the Community edition."
  > "This extends the existing board functionality in the Community edition and allows teams to use a wider range of board configurations, such as Kanban or parent-child boards, without requiring an Enterprise plan."

### 1-3. 上限超過時の挙動

結論: 件数上限が無いため該当なし（上記 FAQ・pricing・projects docs に超過時の記述なし）。

### 1-4. 未確認

- work package 数・ストレージの上限: pricing、docs/faq、user-guide/projects、enterprise-guide（<https://www.openproject.org/docs/enterprise-guide/>）のいずれにも記載なし

## 2. YouTrack Server（self-host、無料枠）

### 2-1. 切り分けの単位と横断ビュー

結論: 単位は project。1 枚の agile board に複数 project を追加でき、その全 project の issue をカードとして表示できる。条件は「列に使う field（既定は State）を全 project が持っていること」。

- <https://www.jetbrains.com/help/youtrack/server/create-new-project.html>
  > "Any time you're ready to start working on a new goal or initiative, create a dedicated project to help you track and manage your efforts."
- <https://www.jetbrains.com/help/youtrack/server/create-new-board.html>
  > "Add projects that you want to manage on the board."
  > "If you want to manage multiple projects on the board, click the Add all projects where I am team member link. You can add and remove projects as required."
- <https://www.jetbrains.com/help/youtrack/server/manage-multiple-projects.html>
  > "Issues from any of the projects that are managed on the board can be shown as cards."
  > "Add all the projects that you want to manage on the board. Our marketing managers track issues from 20 different projects on this board – so can you!"
  > "First, make sure your projects all use the custom field that you want to use to identify columns on the board. It's best to use the default State field. They don't have to use the same set of value for this field, but if they don't use the same field, you won't be able to manage these projects on the board."
  > "Columns are identified by values from the State field. Many of the projects on the board have their own set of values for this field. Similar states are merged into a single column."

### 2-2. 無料枠の条件と上限

結論: Free plan は user 10 名 + helpdesk agent 3 名まで。issue 数・project 数・ストレージの上限は記載なし。

- <https://www.jetbrains.com/legal/docs/youtrack/subscription/>（Section 3(b)(i)）
  > "The free plan is a basic, free-of-charge Subscription Plan that grants You a right to use YouTrack, if You have activated the free plan and no other Subscription Plan is active, for up to ten (10) Users and three (3) Agents."
- <https://blog.jetbrains.com/youtrack/2025/06/new-youtrack-prices-starting-from-october-2025/>
  > "YouTrack Server will remain free for teams of up to 10 users – no changes there."
  > "Helpdesk projects remain free for 3 agents and unlimited reporters."
- <https://youtrack.jetbrains.com/articles/SUPPORT-A-4242/YouTrack-Server-Licensing-FAQ>
  > "Users with system administrator permissions can manage backups, switch the instance to the Free plan for up to 10 users and three support agents, or apply a new subscription license key in *License Settings.*"

### 2-3. 上限超過時の挙動

結論: 上限は license key に保存され、License Details 画面で「現在の active user / agent 数 vs 上限」が表示される。より小さい user pack の key を適用すると超過分の user がランダムに ban される。有料 subscription が切れると 7 日の猶予後、system administrator 以外がアクセスできなくなる（Free plan へ切替可、データは残る）。Free plan のまま 11 人目を追加しようとしたときの UI 挙動は記載なし。

- <https://youtrack.jetbrains.com/articles/SUPPORT-A-4242/YouTrack-Server-Licensing-FAQ>
  > "The moment the license key from the new subscription is applied to your YouTrack Server instance, the installation operates according to the new subscription terms – for example, users above the new limit will be randomly banned to match the new user pack size."
  > "If your subscription expires without renewal, access to your YouTrack Server instance becomes limited to users with system administrator permissions. You will not lose your data – it remains under your control."
- <https://www.jetbrains.com/help/youtrack/server/license-details.html>
  > （Users and agents）"The number of active users and helpdesk agents that are currently using the installation compared to the limits stored in your license key."
  > "If the subscription is not renewed by the date shown as License valid until, the installation remains available for a seven-day grace period. After the grace period ends, access is restricted until an administrator applies a renewed license key or switches the installation to the free plan."

### 2-4. 未確認

- issue 数・project 数・ストレージの上限: 上記 subscription agreement、Licensing FAQ、license-details、2025 年価格改定 blog に記載なし。<https://www.jetbrains.com/youtrack/buy/> は JS 描画で本文を取得できず、内容は確認できていない
- Free plan で 11 人目を追加する操作の挙動: 上記各ページに記載なし。推測: license key の上限で追加が拒否される（未確認）

## 3. Wekan（self-host）

### 3-1. 切り分けの単位と横断ビュー

結論: 単位は board（board の中に swimlane / list / card）。board をフォルダにまとめる workspace が All Boards の左メニューにある（user ごと）。board 横断は My Cards / Due Cards（全 board の自分が member か assignee の card）と Search All Boards。My Cards は表形式で、横断 kanban の記載はない。

- <https://github.com/wekan/wekan/blob/main/docs/Features/Board/Boards/Boards.md>
  > "A **board** is a Kanban board that holds your swimlanes, lists and cards. You can have any number of public and private boards."
  > "The **All Boards** page lists all of your public and private boards. Your starred boards are also shown as shortcuts at the top of every page."
- <https://github.com/wekan/wekan/blob/main/docs/Features/Board/Swimlanes.md>
  > "The **same lists (columns) appear in every swimlane** — lists are board-wide, not per-swimlane. A swimlane groups the cards in its band; each card sits in one list (column) and one swimlane (band)."
- <https://github.com/wekan/wekan/blob/main/docs/Features/Page/Workspaces.md>
  > "A **workspace** is a folder for boards, in the left menu of [All Boards](All-Boards.md). It holds boards — a board is assigned to one — and it holds **other workspaces**, to any depth. The tree is per user"
- <https://github.com/wekan/wekan/blob/main/docs/Design/Deep-Dive-Into-WeKan.md>
  > "Search All Boards, with search options"
  > "My Cards and Due Cards: Show cards where you are member or assignee, from all boards"
- <https://github.com/wekan/wekan/blob/main/docs/Features/Accessibility/Accessibility.md>
  > "data tables (for example the My Cards table) use header cells with"
- <https://github.com/wekan/wekan/blob/main/docs/Features/Page/Search.md>（board 上の検索と All Boards の検索の対象）
  > "| Board (Swimlanes, Lists, …) | `Sidebar.setView('search')` | the cards and lists of that board |"
  > "| All Boards | `openAllBoardsSidebar(SIDEBAR_SEARCH)` | your boards |"

### 3-2. 無料範囲の上限

結論: MIT license の OSS で、board 数は「any number」。card 数・user 数・ストレージの上限記載なし。

- <https://github.com/wekan/wekan/blob/main/docs/FAQ/FAQ.md>
  > "All Wekan code is Open Source at https://github.com/wekan/wekan with MIT license, free also for commercial use."
  > "1 GB RAM minimum free for Wekan. Production server should have miminum total 4 GB RAM."
- <https://github.com/wekan/wekan>（README）
  > "WeKan ® is released under the very permissive MIT license"
  > "WeKan ® largest user has 30k users using WeKan ® in their company."

### 3-3. 上限超過時の挙動

結論: 上限が無いため該当なし。

### 3-4. 未確認

- card 数・user 数・ストレージの上限: README、docs/FAQ/FAQ.md、docs/Features/Features.md、docs/Features/Board/Boards/Boards.md に記載なし
- 全 board の card を 1 つの kanban（列 = list）で見る機能: 上記 Deep-Dive・Search・All-Boards の各 doc に記載なし

## 4. Beads（`bd`）+ beads_viewer（`bv`）

前提の訂正: beads_viewer は <https://github.com/steveyegge/beads_viewer> では 404 で、公式 repo は <https://github.com/Dicklesworthstone/beads_viewer>（beads README ではなく bv 側が「for the Beads issue tracker」と名乗る別作者のツール）。また beads の README のバッジ・install script は `gastownhall/beads` を指しており、`steveyegge/beads` も同じ内容を返す（移転か mirror かは未確認）。

### 4-1. 切り分けの単位（Beads 側）

結論: 既定では repo ごとに `.beads/`（Dolt DB）を持ち、issue ID の prefix で repo を識別する。

- <https://github.com/steveyegge/beads>（README「Storage Modes」）
  > "**Embedded (default)** — `bd init`. Dolt runs in-process, data lives in `.beads/embeddeddolt/`, single writer. Recommended for most users."
  > "Cross-machine sync uses `bd dolt push` / `bd dolt pull` against `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is an export for viewers and interchange, not the source of truth or a backup."
- <https://github.com/steveyegge/beads/blob/main/docs/multi-agent/multi-repo-migration.md>
  > "By default, beads stores issues in its Dolt database under `.beads/` in your current repository (`.beads/embeddeddolt/` in the default embedded mode)."
- <https://github.com/steveyegge/beads/blob/main/docs/core-concepts/hash-ids.md>
  > "# Set prefix (default: bd)" / "bd config set id.prefix myproject" / "# Returns: myproject-a1b2c3"

### 4-2. 複数 repo で 1 つの板にする構成（Beads 側）

結論: 公式の手段は 3 つ。(a) multi-repo hydration: 各 repo は自分の `.beads/` を持ち、1 つの repo の `.beads/config.yaml` に `repos.additional` を書いて `bd repo sync` で他 repo の `issues.jsonl` を取り込む。`bd list` / `bd ready` が unified view になる。(b) `BEADS_DIR` で全 repo を 1 か所の DB に向ける。(c) `bd init --shared-server` は Dolt server を共有するが DB は project ごとに分かれたまま。

- <https://github.com/steveyegge/beads/blob/main/docs/multi-agent/multi-repo-migration.md>
  > "Multi-repo mode lets you:" / "- **Route issues to different repositories** based on your role (maintainer vs. contributor)" / "- **Aggregate issues from multiple repos** into a unified view"
  > "Beads can aggregate issues from multiple repositories into a unified database:"
- <https://github.com/steveyegge/beads/blob/main/docs/multi-agent/routing.md>
  > "One agent often works across more than one repository: an OSS fork plus a private planning repo, a planning repo feeding an implementation repo, several project checkouts on one machine."
  > "Routing is opt-in. With no routing configuration, every bead lands in the current repository — nothing on this page changes single-repo workflows."
  > "**Hydration** imports beads from other repos into your database, each tagged with its `source_repo`, so `bd list` and `bd ready` show one unified view."
  > "`bd repo sync` reads each additional repo's `.beads/issues.jsonl` export and imports the beads with their original prefixes and `source_repo` set, skipping repos whose export hasn't changed."
  > "The server resolves the beads workspace from each request's working directory, so one configuration serves every project while each project keeps its own isolated database (embedded Dolt at `.beads/embeddeddolt/` by default; server mode uses `.beads/dolt/`)."
  > "To share one Dolt server across all projects instead of embedded per-project storage, initialize with `bd init --shared-server` (or set `BEADS_DOLT_SHARED_SERVER=1`): projects share a server at `~/.beads/shared-server/` while staying isolated in per-project databases named after their issue prefixes."
- <https://github.com/steveyegge/beads/blob/main/docs/cli-reference/repo.md>
  > "Multi-repo support allows hydrating issues from multiple beads repositories into a single database for unified cross-repo issue tracking."
  > "Configuration is stored in .beads/config.yaml under the 'repos' section:" / "repos:" / "primary: \".\"" / "additional:" / "- ~/beads-planning" / "- ~/work-repo"
  > "The path should point to a directory containing a .beads folder. Paths can be absolute or relative (they are stored as-is)."
  > "This command also removes any previously-hydrated issues from the database that came from the removed repository."
- <https://github.com/steveyegge/beads>（README「Beads works without git」）
  > "`BEADS_DIR` tells bd where to put the `.beads/` database directory, bypassing git repo discovery."
  > "- **Monorepos** — point `BEADS_DIR` at a specific subdirectory"

hydration の方向は「取り込む側 1 repo ← 他 repo」の片方向で、どの repo で `bd list` するかを決めて、その repo の config に他 repo を全部登録する構成になる。1 人利用なら、専用の集約 repo を作ってそこに全 repo を `bd repo add` するのが docs の例と同型（これは subagent の構成案で、docs はそう書いていない）。

### 4-3. bv が複数 repo を同時に表示できるか

結論: できる。`.bv/workspace.yaml` に repo の一覧を書くと 1 つのビューに統合され、`--repo` で repo prefix に絞れる。Kanban は `b` キー。単一 repo は `--db` / `BEADS_DB` / `BEADS_DIR` で指定。bv は Dolt ではなく `.beads/issues.jsonl` を読むので、`bd export` が要る。

- <https://github.com/Dicklesworthstone/beads_viewer>（README）
  > "`bv` reads Beads JSONL exports from `.beads/`. Current `br` and Dolt-backed `bd` workspaces use `.beads/issues.jsonl`; older legacy workspaces may use `.beads/beads.jsonl`. `bv` auto-discovers the supported file names."
  > "**Go (`bd`) users** — run:" / "bd export -o .beads/issues.jsonl"
  > "**Kanban Board:** Press `b` to switch to a columnar view (Open, In Progress, Blocked, Closed) to visualize flow."
  > "For monorepo and multi-package architectures, `bv` provides **workspace configuration** that unifies issues across multiple repositories into a single coherent view."
  > "Workspaces are auto-discovered: when the working directory has no `.beads` directory reachable (directly, via a git worktree's main checkout, or via `BEADS_DIR` / `BEADS_DB`), bv looks for `.bv/workspace.yaml` in that directory and each parent and loads the workspace for the TUI and every robot command. Pass `--workspace <path/to/.bv/workspace.yaml>` to force a specific workspace"
  > "repos:" / "  - name: api" / "    path: services/api" / "    prefix: \"api-\"        # Issues become api-AUTH-123" / "    beads_path: .beads    # Optional per-repo override (defaults to .beads)"
  > "Use `--repo` to scope the view (and robot outputs) to a specific repository prefix. Matching is case-insensitive and accepts common separators (`-`, `:`, `_`); it also honors the `source_repo` field when present."
  > "**Explicit override:** `--db <file-or-dir>`, then `BEADS_DB`, then `BEADS_DIR` bypass discovery entirely. `--db` accepts a database file or a `.beads` directory."

### 4-4. 上限

結論: bd / bv とも件数・容量の上限は README・docs に記載なし（ローカル DB のため上限の概念がない）。

### 4-5. 未確認

- bv workspace の `repos[].path` に、workspace.yaml の親ディレクトリ外（別々の場所に clone した repo）の絶対パスを書けるか: README の例は monorepo 配下の相対パスのみ。推測: パス文字列として渡るので動く可能性が高いが、README では確認できない
- Beads の hydration で取り込んだ issue を、取り込み側から `bd update` / `bd close` したときに元 repo へ書き戻されるか: routing.md、repo.md に記載なし（"ordinary rows in your database" とだけある）
- `steveyegge/beads` と `gastownhall/beads` の関係（移転か mirror か）

## 調査の方法と当たった URL（未確認の根拠）

WebSearch と WebFetch に加え、docs 原文は raw.githubusercontent.com / GitHub API から curl で取得して grep した（OpenProject: opf/openproject の docs、Wekan: wekan/wekan の docs、Beads: steveyegge/beads の docs、bv: Dicklesworthstone/beads_viewer の README）。

取得できなかった公式ページ: <https://www.jetbrains.com/youtrack/buy/>（JS 描画で本文なし）、<https://www.jetbrains.com/help/youtrack/server/agile-boards.html>（404。代わりに agile-board.html / create-new-board.html / manage-multiple-projects.html を使用）、<https://github.com/steveyegge/beads_viewer>（404）、<https://youtrack-support.jetbrains.com/hc/en-us/articles/360014248580>（403）。
