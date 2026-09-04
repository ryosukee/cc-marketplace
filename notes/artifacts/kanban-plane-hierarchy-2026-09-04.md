# Plane の階層構造とデータモデル（2026-09-04）

`notes/kanban-board.md` の確定 11（道具は Plane）と確定 12（Claude 側のラップは cc-marketplace の plugin）を受け、
導入時に `todo.md` の項目をどの単位へ載せるかと、plugin が叩く口を決めるために、
Plane Cloud Free（2026-09 時点）を前提に階層構造・分類の軸・board の紐づき・上限・REST API を
公式の一次情報で確かめた記録。取得日は 2026-09-04。

出典は公式（plane.so / docs.plane.so / developers.plane.so / github.com/makeplane/plane）に限った。
docs.plane.so と developers.plane.so は URL 末尾に `.md` を付けると Markdown 原文を返すので、引用はその原文から取った。
plane.so/pricing の機能表は HTML に埋め込まれた JSON（`values`）から読み取った。
Community Edition のソースは clone した commit を各節に書く。

<!-- markdownlint-disable MD004 MD007 MD027 MD031 MD032 MD034 MD037 MD049 MD051 -->
<!-- 逐語引用の中の記法（原文の裸 URL・ページ内リンク）を lint に合わせて変えないため -->

先行する調査 2 本と重ならない範囲を扱う。エディション差と Free の上限は
[Plane Cloud Free と Community Edition の差](./kanban-plane-cloud-vs-ce-2026-09-03.md) と
[Plane Cloud Free の上限・公式 CLI・公式 MCP・API レート制限](./kanban-plane-free-limits-cli-mcp-2026-09-04.md) にある。

## 先に結論

- 階層は Workspace > Project > Work item > Sub work item の 1 本だけが必須で、
  Cycle / Module / Label / State / Estimate / Intake / Milestone / project pages / project views は
  すべて Project にぶら下がる。Workspace 直下に付くのは Wiki（workspace pages）・workspace views・
  Initiative・Teamspace・Dashboard・Customer・workspace releases・workspace work item types で、
  このうち Cloud Free で使えるのは workspace views だけ
- 1 つの work item が持てる数は、Cycle が 1 つ、State が 1 つ、Work item type が 1 つ、
  Module が複数、Label が複数、Release が複数、View は所属ではなくフィルタの結果なので無制限。
  project をまたげるのは親子（parent）と workspace views / workspace releases だけで、
  Cycle・Module・Label・State は project の中に閉じる。
  ただし project をまたぐ親子は UI の話で、CE の v1 API は同一 project に限る（5.5）
- 「1 work item 1 cycle」はスキーマの制約ではなく API の view 層の制約で、
  既に別の cycle にいる work item を追加すると行が増えずに付け替わる。
  Label はスキーマ上 project が nullable で、workspace 単位にもできる（2.9）
- Kanban（Board layout）は project の work items 画面と project view に付く。
  workspace views は spreadsheet 固定なので、Cloud Free に project 横断の kanban は無い。
  workspace には project 自体を並べる board もあるが、列に使う project label / project state が有料
- Workspace 数・Project 数の上限は公式に記載が無く、CE のコードにも件数を数える実装が無い。
  ただし課金は workspace 単位で、Free の 12 席も workspace ごとに効く。
  Initiative・Teamspace・カスタムプロパティ・work item type は CE にモデルや作成経路ごと無く、
  「Free では使えない」という判定の裏付けになる（2.9）
- REST API は `X-API-Key` ヘッダ 1 本、base URL は `https://api.plane.so/api/v1/`。
  work item の作成は `POST /workspaces/{slug}/projects/{project_id}/work-items/` に `{"name": "..."}` が最小。
  cycle / module への所属は work item の body ではなく専用の endpoint。
  view は API に無く、workspace 一覧も無い（slug は人が URL から読む）
- workspace の中身の列挙は project 一覧 → project ごとの work item 一覧の 2 段。
  work item 一覧は project をまたげない

## 1. 階層構造の全体像

### 1.1 公式が書く階層

出典: <https://docs.plane.so/introduction/core-concepts.md>

> "At the top level, **Workspaces** contain everything - typically one per organization. Inside workspaces, you create **Projects** for specific products, initiatives, or goals. Within projects, you manage **Work items** (the individual tasks your team completes). You can organize these work items using **Cycles** (time-boxed periods) and **Views** (saved filters and layouts). Finally, **Pages** provide space to document context and decisions alongside your work."

出典: <https://docs.plane.so/core-concepts/workspaces/overview.md>

> "Think of a Workspace in Plane as your command center, the place where everything comes together. It's the top-level space that holds all your projects, work items, cycles, modules, and pages."

work item の識別子は project ごとの連番。出典: <https://docs.plane.so/introduction/core-concepts.md>

> "Each work item is identified by a unique, project-specific number (e.g., VIH-19), making it easy to track and reference. At a minimum, every work item needs a title and a state, but you can customize it further with additional properties and relations as needed."

### 1.2 概念の一覧

Cloud Free の可否は 2 つの出典を突き合わせた。plane.so/pricing の機能表（`values` の `Free`）と、
docs のページ見出しに付く `<Badge>`（Pro / Business / Enterprise Grid）。両者が食い違うものは注記した。

| 概念 | 属する先 | Cloud Free | 出典 |
| --- | --- | --- | --- |
| Workspace | 最上位 | 使える | pricing 機能表 |
| Project | Workspace | 使える | pricing `Projects`: Free available |
| Work item | Project | 使える | pricing `Work Items`: Free available |
| Sub work item | Work item（`parent` フィールド） | 使える | docs 記載に badge なし |
| Work item type | Project（Enterprise Grid では Workspace。モデルは workspace 単位。2.9） | 使えない | pricing `Work Item Types`: Free unavailable / badge Pro |
| Epic | Work item type の 1 つ（level 1） | 使えない | badge `# Epics <Badge type="info" text="Pro" />` |
| Custom property | Work item type | 使えない | pricing `Custom Properties`: Free unavailable |
| Hierarchy（type の階層） | Workspace | 使えない | workspace work item types が前提。Enterprise Grid |
| State | Project（governance 下は Workspace） | 使える | docs に badge なし |
| Label | Project | 使える | docs に badge なし（CSV import だけ Pro） |
| Cycle | Project | 使える | pricing `Cycles`: Free available |
| Module | Project | 使える | pricing `Modules`: Free available |
| Milestone | Project | 使えない | pricing `Milestones`: Free unavailable / badge Pro |
| Release（project releases） | Project | 使えない | badge `# Project Releases <Badge type="tip" text="Business" />` |
| Release（workspace releases） | Workspace | 使えない | badge `# Workspace Releases <Badge type="tip" text="Business" />` |
| Intake（In-app） | Project | 使える | pricing `Intake In-app`: Free available |
| Intake（Forms / Email） | Project | 使えない | pricing `Intake Forms` / `Intake Email`: Free unavailable |
| Estimate | Project | 使える（1 project 6 値まで） | pricing `Estimates`: Free "Basic"。値の上限は下記 |
| Page（project pages） | Project | 使える | pricing `Pages`: Free available |
| Page（Wiki = workspace pages） | Workspace | 使えない | badge `# Wiki <Badge type="info" text="Pro" />` |
| Collection（Wiki のフォルダ） | Wiki | 使えない | badge `## Collections <Badge type="info" text="Pro" />` |
| Nested page | Page | 使えない | pricing `Nested Pages`: Free unavailable |
| View（project view） | Project | 使える | pricing `Views`: Free "Basic"（private view は Pro） |
| View（workspace view） | Workspace | 使える（推測） | pricing に行が無く badge も無い。下記 3.3 |
| View（teamspace view） | Teamspace | 使えない | Teamspaces が Pro |
| Layout（5 種） | View / 一覧画面の表示形式 | 使える | pricing `Layouts`: Free available |
| Initiative | Workspace | 使えない | badge `# Initiatives <Badge type="info" text="Pro" />` |
| Teamspace | Workspace | 使えない | badge `# Teamspaces <Badge type="info" text="Pro" />` |
| Customer | Workspace | 使えない | pricing `Customers`: Free unavailable |
| Dashboard | Workspace（複数 project から集める） | 使えない | pricing `Dashboards and Widgets`: Free unavailable |
| Analytics | Workspace / Project / Cycle / Module の 4 レベル | 未確認 | docs に badge なし。pricing に該当行なし |
| Project state（project 自体の状態） | Workspace | 使えない | pricing `Project States`: Free unavailable / badge Pro |
| Project label（project 自体のラベル） | Workspace | 使えない | badge `# Project Labels <Badge type="tip" text="Business" />` |
| Sticky | ユーザー個人 | 使える | docs に badge なし |
| Draft work item | ユーザー個人 | 使える | docs に badge なし |
| Template（project / work item / page） | Project / Workspace | 使えない | pricing の各行が Free unavailable |
| Custom relation | Workspace | 使えない | badge `<Badge type="warning" text="Enterprise Grid" />` |
| Automation / Workflow / Plane Runner | Project / Workspace | 使えない | pricing `Trigger And Action` / `Workflows + Approvals`: Free unavailable |

※ 表 1 Plane の概念と、それが属する先・Cloud Free の可否

Estimate の値の数だけは Free に数値の上限がある。出典: <https://docs.plane.so/core-concepts/issues/estimates.md>

> "Free plan projects support up to 6 custom estimate values. [Upgrade to Pro](https://plane.so/pricing) to add additional estimate values for Points, Categories, and Time-based estimates."

Analytics だけは 1 つの階層に属さず 4 レベルに付く。出典: <https://docs.plane.so/core-concepts/analytics.md>

> "* **Workspace level**\
> Users in the `Admin` roles have access to Analytics at the Workspace level.
> * **Project level**\
> Users with `Admin`, or `Member` roles can access project-specific analytics.
> * **Cycle and Module level**\
> Drill down into specific cycles or modules for focused insights."

### 1.3 Project にぶら下がるものは、project settings のトグルで出し入れする

出典: <https://docs.plane.so/core-concepts/projects/overview.md>

Features タブに並ぶのは Cycles / Modules / Views / Pages / Intake / Time Tracking の 6 つ
（原文は各項目に説明文が付く。ここでは項目名だけを引く）。

> "Control which features are available in your project based on how your team works. You can enable only the features you need and keep your project interface clean and focused."
> "**Available features**"

Milestones も同じ Features タブに入る。出典: <https://docs.plane.so/core-concepts/projects/milestones.md>

> "1. Go to **Project Settings → Features**.
> 2. Toggle on **Milestones** under the **Work management** section."

Intake は project 単位で既定 off。出典: <https://docs.plane.so/intake/overview.md>

> "Intake operates at the project level and is disabled by default."

一度 on にすると戻せないものが 2 つある。Work item types（project / workspace）と Teamspaces。

> "**Work Item Types cannot be disabled once turned on for a project.** The feature itself is irreversible, though individual types can be disabled at any time."
> 出典: <https://docs.plane.so/work-items/project-work-item-types.md>

> "Once on, the feature cannot be turned off in a workspace."
> 出典: <https://docs.plane.so/core-concepts/workspaces/teamspaces.md>

### 1.4 Epic は独立した層ではなく work item type になった

出典: <https://docs.plane.so/core-concepts/issues/epics.md>

> "Epics in Plane have moved. They're now a [**work item type**](/work-items/project-work-item-types), living in the same Work Items list as other types your team tracks."
> "Epic is now a **work item type** and is treated exactly like any other type. You filter, group, sort, and manage Epics the same way you work with any other work item."
> "**Epic is created automatically.** When you enable Work Item Types for a project, Plane creates two types: the default **Task** type and an **Epic** type. You don't set them up manually."
> "The levels aren't arbitrary. Task is created at level 0 and Epic at level 1 - this is the default hierarchy structure built into the product."
> "An epic is still the parent layer above individual work items. Work items still link to an epic through the **Parent** field."

Cloud Free では work item types 自体が使えないため、Epic という型も作れない。
親子関係そのものは型に依存せず、どの work item も `parent` で繋げる。

> "Without hierarchy, any work item can be a sub-work item of any other, regardless of type."
> 出典: <https://docs.plane.so/work-items/workspace-work-item-types.md>

### 1.5 Workspace で on / off できる機能は API から読める

出典: <https://developers.plane.so/api-reference/workspace-features/get-workspace-features.md>
（`GET /api/v1/workspaces/{workspace_slug}/features/`）

> ```json
> {
>   "project_grouping": true,
>   "initiatives": true,
>   "teams": true,
>   "customers": true,
>   "wiki": true,
>   "pi": true
> }
> ```

`project_grouping` が project state / project label、`teams` が Teamspaces、`pi` が Plane AI に当たる（推測）。
plan・席数・件数の上限はこの応答に含まれない。

同ページは workspace slug の定義も書く。

> "The workspace_slug represents the unique workspace identifier for a workspace in Plane. It can be found in the URL. For example, in the URL `https://app.plane.so/my-team/projects/`, the workspace slug is `my-team`."

### 1.6 階層図

Cloud Free で使えるものだけを実線、有料のものを括弧で示す。

```text
Workspace
├── Project
│   ├── Work item ──(parent)──> Work item  ※ UI は project をまたげる。API は同一 project
│   │   ├── Comment / Link / Attachment / Relation / Dependency
│   │   └── (Custom property values)        ※ Pro 以上
│   ├── State           1 work item に 1 つ
│   ├── Label           1 work item に複数
│   ├── Cycle           1 work item に 1 つ
│   ├── Module          1 work item に複数
│   ├── Estimate        project に 1 系統（Free は 6 値まで）
│   ├── View（project view）    layout 5 種
│   ├── Page（project pages）
│   ├── Intake（In-app）
│   ├── (Work item type / Epic)  ※ Pro 以上
│   ├── (Milestone)              ※ Pro 以上
│   └── (Project release)        ※ Business 以上
├── View（workspace view）  spreadsheet layout 固定
├── (Wiki = workspace pages / Collection / Nested page)  ※ Pro 以上
├── (Initiative)      ※ Pro 以上。複数 project を束ねる
├── (Teamspace)       ※ Pro 以上。members + projects を束ねる
├── (Workspace release)  ※ Business 以上。project をまたいで work item を束ねる
├── (Dashboard)       ※ Pro 以上
├── (Customer)        ※ Business 以上
├── (Project state)   ※ Pro 以上。project 自体の状態
├── (Project label)   ※ Business 以上。project 自体のラベル。1 project に複数
└── Member / Sticky（個人）
```

## 2. Work item を分類する軸

Project 以外の軸は 9 つある。work item がデータとして所属を持つものが 7 つ
（State / Label / Cycle / Module / Work item type / Release / Parent）、
所属ではなく見え方を決めるものが 2 つ（Grouping / Sub-grouping、View）。
「1 つの work item がいくつ持てるか」と「project をまたげるか」を軸ごとに書く。

| 軸 | 1 work item が持てる数 | project をまたげるか | Cloud Free |
| --- | --- | --- | --- |
| State | 1 つ | またげない（project ごとに state 集合を持つ） | 使える |
| Label | 複数（上限なし） | またげない（label は 1 project に属す） | 使える |
| Cycle | 1 つだけ | またげない（自 project の cycle のみ） | 使える |
| Module | 複数 | またげない | 使える |
| Work item type | 1 つ | 型は project ごと（Enterprise Grid は workspace） | 使えない |
| Release | 複数 | workspace release はまたげる | 使えない |
| Parent（親子） | 親は 1 つ | UI はまたげる。CE の v1 API はまたげない（5.5） | 使える |
| Grouping / Sub-grouping | 表示の軸なので所属ではない | 一覧画面の範囲に従う | 使える |
| View | 所属ではなくフィルタの結果。同じ work item が同時に複数の view に出る | workspace view はまたげる | 使える |

※ 表 2 work item を分類する軸と、その多重度・project 境界

### 2.1 State は 1 つ。project ごとに集合を持つ

出典: <https://docs.plane.so/core-concepts/issues/states.md>

> "Each project defines its own states, managed by a **project admin** under **Settings → (project) → States**. This is the default."
> "Every state belongs to one of five groups. The group is the meaning Plane attaches to the state; the name is your label for it."
> "Exactly one state is the **default** - the state new work items get when none is chosen. New projects start with Backlog as the default."

5 つの group は Backlog / Unstarted / Started / Completed / Cancelled。
group が進捗計算とアーカイブの可否を決める。

> "**Completion and progress** - only work items in the **Completed** group count as done. Cycle and module progress, burndown, and analytics bucket work items by group."
> "**Archiving** - only work items in **Completed** or **Cancelled** states are eligible for automatic archiving."

Triage は intake 専用の system state で、project に 1 つ。

> "* There is **one triage state per project**, or **one per workspace** under governance.
> * **"Triage" is a reserved name** - you cannot name a state Triage."

#### project 作成時に入る既定の state（2026-09-05 追記）

Community Edition の `DEFAULT_STATES` が、project 作成の 2 経路から `bulk_create` される。
定数は `apps/api/plane/db/models/state.py` の 24-62 行にリテラルで置かれている。
clone は commit `da1a7ab85012d16836459a10dd92ec55eb739c69`（2026-09-02）。

```python
DEFAULT_STATES = [
    {"name": "Backlog", "color": "#60646C", "sequence": 15000,
     "group": StateGroup.BACKLOG.value, "default": True},
    {"name": "Todo", "color": "#60646C", "sequence": 25000,
     "group": StateGroup.UNSTARTED.value},
    {"name": "In Progress", "color": "#F59E0B", "sequence": 35000,
     "group": StateGroup.STARTED.value},
    {"name": "Done", "color": "#46A758", "sequence": 45000,
     "group": StateGroup.COMPLETED.value},
    {"name": "Cancelled", "color": "#9AA4BC", "sequence": 55000,
     "group": StateGroup.CANCELLED.value},
    {"name": "Triage", "color": "#4E5355", "sequence": 65000,
     "group": StateGroup.TRIAGE.value},
]
```

> 補足: 引用は原文から `color` 以降の改行だけを詰めた。値と順序は変えていない。<br>
> 6 件目の Triage は `State.objects` の manager が group=triage を除外するため、API と UI からは見えない。
> CE の contract test も 5 件を期待している（`apps/api/plane/tests/contract/app/test_project_app.py` 92-97 行）。

したがって board の列に出るのは Backlog / Todo / In Progress / Done / Cancelled の 5 つ。
`default: True` は Backlog だけで、state を指定せずに作った work item はここへ入る。

呼ばれるのは project 作成の 2 経路だけ。
`POST /api/workspaces/{slug}/projects/`（`apps/api/plane/app/views/project/base.py` 281-295 行）と
`POST /api/v1/workspaces/{slug}/projects/`（`apps/api/plane/api/views/project.py` 257-271 行）。
CE に project template も複製の経路も無い。

group は CE のモデルでは 6 種類（`backlog` / `unstarted` / `started` / `completed` / `cancelled` / `triage`）。
docs が「5 つ」と書くのは intake 用の triage を除いた数で、この節の上の引用と食い違う。

名前は後から変えられる。`PATCH /api/v1/workspaces/{slug}/projects/{project_id}/states/{id}/` の
`name` は read_only ではなく、既定 state でも書き換えられる。
`default: true` を渡すと同じ project の他の state が一括で `default=False` になる。
消せないのは `default=True` の state と、work item が 1 件でも紐づいている state の 2 つ。
`group` を `triage` にする作成・更新は serializer が拒否する。

未確認。DB に Triage を含む 6 行が入ることは Django の `bulk_create` が manager のフィルタを
適用しないという挙動からの読み取りで、実行して数えていない。
他の state を `Triage` へ改名したときに 400 と 500 のどちらが返るかも、コードからは 500 に見えるが未実測。

### 2.2 Label は複数持てて、上限が無い。ただし 1 project に閉じる

出典: <https://docs.plane.so/core-concepts/issues/labels.md>

> "Once labels exist, you can apply several to a single work item, then filter, group, and sort your work items by them across every layout."
> "A label belongs to one project, so each project keeps its own set."
> "Labels are applied from wherever you edit a work item, and a work item can carry **as many labels as you need**."
> "* **A label belongs to one project.** To use the same taxonomy in another project, recreate the labels there, import them from a CSV, or start the project from a template that includes them.
> * **No limits** are enforced on how many labels a project can have or how many labels a single work item can carry."

grouping にも使える。

> "* **Grouping.** Group work items by label in the board, list, and spreadsheet layouts. On the board you can drag a work item from one label group to another to relabel it."
> "* **Views and workspace views.** Labels are available as a filter in saved project views and in workspace-level views that span projects."

`notes/kanban-board.md` の確定 10 が引いた文言はこのページのもので、2026-09-04 時点でも同じ。

### 2.3 Cycle は 1 work item に 1 つだけ

出典: <https://docs.plane.so/core-concepts/cycles.md>

> "Even with parallel cycles enabled, a work item can only belong to one cycle at a time. This prevents duplicate tracking and keeps cycle metrics accurate. If you try to add a work item that already belongs to another cycle, the system will block the action."
> "By default, only one cycle can be active at a time. To run multiple active cycles simultaneously, see [Parallel cycles](/core-concepts/cycles#parallel-cycles)."

parallel cycles（重なる期間の cycle を作る）は Pro 以上。cycle の手動 start / stop も Pro 以上。

automation の action の説明にも同じ制約が書いてある。出典: <https://docs.plane.so/automations/custom-automations.md>

> "When assigning a cycle, the cycle must belong to the work item's own project, and you cannot assign a work item to a cycle that has already ended. A work item can be in only one cycle at a time, so assigning a cycle moves the work item off any cycle it is currently in."

#### 公式資料どうしの矛盾（cycle が project をまたげるか）

core-concepts のページだけが「cycle は project をまたげる」と読める書き方をしている。

> "Cycles can contain multiple work items from different projects, making it easy to see your team's workload at a glance and keep an eye on deadlines."
> 出典: <https://docs.plane.so/introduction/core-concepts.md>

これは他の 3 か所と食い違う。

- automations の上記引用「the cycle must belong to the work item's own project」
- Releases のページが cycle を project-scoped と明記する。出典: <https://docs.plane.so/releases.md><br>
  > "This is the key distinction between releases and cycles. Cycles are sprint containers - time-boxed, project-scoped, for managing ongoing development. Releases are version containers - for grouping and communicating deliverables across projects, regardless of which cycle the work was done in."
- work item を別 project へコピーすると cycle が外れる。出典: <https://docs.plane.so/core-concepts/issues/overview.md><br>
  > "How much of the original carries over depends on whether you copy in place or into a different project. Labels, modules, cycles, and estimates belong to a single project, so they can't follow a work item across the boundary."

3 対 1 で「cycle は project の中に閉じる」を採る。core-concepts の一文は古い記述と見るが、
公式が訂正した記録は見つかっていない（未確認）。

### 2.4 Module は複数持てる

出典: <https://docs.plane.so/core-concepts/modules.md>

> "* Assign multiple Modules to a work item from its properties. For instance, a work item can belong to both a Feature module and a Release module simultaneously."

module も project の中に閉じる（上の「Labels, modules, cycles, and estimates belong to a single project」）。
module と cycle の関係は「1 module が複数 cycle にまたがれる」。
出典: <https://docs.plane.so/introduction/quickstart/startups.md>

> "A module can span multiple Cycles, making it useful for work that belongs together but won't necessarily be completed in a single cycle."

Release も複数持てる。Cloud Free では使えないが、cycle・module と並ぶ第 3 の束ね方として書いておく。
出典: <https://docs.plane.so/projects/project-releases.md>

> "Work items in a release-enabled project have a **Releases** property in their detail panel, next to Cycle and Module, and as a column in the spreadsheet and board layouts. You can link a release from the work item instead of from the Scope tab, and a work item can belong to more than one release."
> "|                                  | Project releases                  | Workspace releases                    |
> | Scope                            | One project                       | The whole workspace                   |
> | Work items a release can contain | Only work items from that project | Work items from any project           |"

### 2.5 Work item type は 1 つ。Free では使えない

出典: <https://docs.plane.so/work-items/project-work-item-types.md>

> "Every work item in Plane has a type. When you enable Work Item Types, Plane creates two types for your project automatically: **Task** (the default) and **Epic**."
> "A Bug might need Version, Environment, and Steps to reproduce. A Content Request might need Channel, Reviewer, and Go-live date. A Feature Request might need Business value and Customer impact. Once you define a type, those properties appear automatically on every work item of that type."

Enterprise Grid では workspace 単位になり、project へは import で降りる。
出典: <https://docs.plane.so/work-items/workspace-work-item-types.md>

> "| **Import** (default) | The type is added to a project only when a Project Admin imports it from the workspace library. |
> | **Mandatory** | The type is present in **every** project and cannot be removed by a Project Admin. |"

型どうしの階層（Hierarchy）は workspace 単位で、level 番号で親子を定義する。

> "Hierarchy lets you define structured parent-child relationships between work item types at the workspace level."
> "Level 0 is the default — types that sit here are leaf-level work items with no children defined in the hierarchy. Types not assigned to any level remain at Level 0."

### 2.6 親子は project をまたげる

出典: <https://docs.plane.so/core-concepts/issues/overview.md>

> "**Cross-project sub-work items**\
> A work item in Project A can be a sub-work item of a work item in Project B. The parent picker searches across the entire workspace."

これは UI の話で、CE の v1 API は同一 project の work item しか親にできない（5.5 を見る）。
親子の段数の上限は docs に記載が無い（未確認）。

依存（順序の制約）は親子とは別の関係で 6 種類、参照の関係が 3 種類ある。

> "* **Blocked by** — this work item cannot proceed until the other work item is completed.
> * **Blocking** — this work item must be completed before the other work item can proceed.
> * **Starts Before** — this work item must start before the other work item starts.
> * **Starts After** — this work item can only start after the other work item starts.
> * **Finishes Before** — this work item must finish before the other work item finishes.
> * **Finishes After** — this work item can only finish after the other work item finishes."

> "* **Relates To** — the two work items are connected by context but don't directly affect each other's completion.
> * **Duplicate** — this work item is a duplicate of another. The original remains active while the duplicate is typically closed.
> * **Implements** — this work item implements or fulfills the other work item."

依存を Timeline 上の線として見るのは Pro 以上（pricing `Dependencies in Timeline`: Free unavailable）。

依存の登録そのものが Free でできるかは、pricing にも badge にも記載が無い。
CE のコードからは、バックエンドが 9 種類すべてを持ち、frontend の型が 4 種類だけを持つ、と読める。
`apps/api/plane/db/models/issue.py` 272-290 行:

```python
class IssueRelationChoices(models.TextChoices):
    DUPLICATE = "duplicate", "Duplicate"
    RELATES_TO = "relates_to", "Relates To"
    BLOCKED_BY = "blocked_by", "Blocked By"
    START_BEFORE = "start_before", "Start Before"
    FINISH_BEFORE = "finish_before", "Finish Before"
    IMPLEMENTED_BY = "implemented_by", "Implemented By"


# Bidirectional relation pairs: (forward, reverse)
# Defined after class to avoid enum metaclass conflicts
IssueRelationChoices._RELATION_PAIRS = (
    ("blocked_by", "blocking"),
    ("relates_to", "relates_to"),  # symmetric
    ("duplicate", "duplicate"),  # symmetric
    ("start_before", "start_after"),
    ("finish_before", "finish_after"),
    ("implemented_by", "implements"),
)
```

`packages/types/src/issues/issue_relation.ts` 17 行:

```typescript
export type TIssueRelationTypes = "blocking" | "blocked_by" | "duplicate" | "relates_to";
```

CE は Cloud Free と機能同等と公式が書くので、Cloud Free の UI で選べるのも
blocking / blocked_by / duplicate / relates_to の 4 つで、
Timeline に出る 4 つのスケジュール依存（starts before / after、finishes before / after）と
implements は Pro 以上、と読める（推測。Cloud の実装は非公開で、UI を実際に触っていない）。

### 2.7 Grouping / Sub-grouping は所属ではなく表示の軸

出典: <https://docs.plane.so/core-concepts/issues/display-options.md>

> "## Group by
>
> Grouping helps you organize work items based on shared attributes, making it easier to focus on specific workflows or priorities. You can group work items by:
>
> * State
> * Priority
> * Cycle
> * Module
> * Labels
> * Assignees
> * Created By
> * Milestones
> * Releases
> * Work Item Types
> * None"

> "## Sub-group by
>
> You can further refine your view by adding a sub-grouping. For example, you could group by State and then sub-group by Assignees to see the state of tasks per team member. Sub-grouping options include:
>
> * State
> * Priority
> * Cycle
> * Module
> * Labels
> * Assignees
> * Created By
> * Milestones
> * Releases
> * Work Item Types
> * None"

order by は Manual / Last Created / Last Updated / Start Date / Due Date / Priority の 6 つ。
表示するプロパティは ID / Work item Type / Assignee / Start Date / Due Date / Labels / Priority /
State / Sub-work item Count / Attachment Count / Link / Estimate / Modules / Cycle。

Milestones・Releases・Work Item Types は Free で作れないので、grouping の選択肢としても実質使えない。
Cloud Free で選べるのは State / Priority / Cycle / Module / Labels / Assignees / Created By（推測。
pricing と badge に grouping 自体の plan 記載が無いため、機能の有無から逆算した）。

### 2.8 View は所属ではない

出典: <https://docs.plane.so/core-concepts/views.md>

> "A View in Plane is a saved configuration of filters, layouts, display options, and sorting preferences applied to your work items. Views do not change the underlying data — they are lenses that let you see the same work items through different perspectives without creating duplicates or moving anything."

出典: <https://docs.plane.so/introduction/core-concepts.md>

> "Views help you filter and organize work items to see exactly what matters right now. Instead of manually configuring filters every time, views save your layout, filters, and display settings so you can access them instantly. The same work item can appear in multiple views simultaneously."

### 2.9 CE のモデル定義での裏取り

docs の記述が Django のモデルとどう対応するかを、CE の `apps/api/plane/db/models/` で確かめた。
commit は 5 節と同じ `da1a7ab85012d16836459a10dd92ec55eb739c69`。

Plane のモデルは 2 つの抽象基底クラスに分かれる。`ProjectBaseModel` は project 必須、
`WorkspaceBaseModel` は project が nullable。この違いが「project に閉じるか」の実体になる。
`apps/api/plane/db/models/project.py` 180-182 行:

```python
class ProjectBaseModel(BaseModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="project_%(class)s")
    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="workspace_%(class)s")
```

`apps/api/plane/db/models/workspace.py` 185-187 行:

```python
class WorkspaceBaseModel(BaseModel):
    workspace = models.ForeignKey("db.Workspace", models.CASCADE, related_name="workspace_%(class)s")
    project = models.ForeignKey("db.Project", models.CASCADE, related_name="project_%(class)s", null=True)
```

| モデル | 基底 | 多重度を決めるもの | ファイル:行 |
| --- | --- | --- | --- |
| `Issue` | ProjectBaseModel | project 必須 | `db/models/issue.py:104` |
| `State` | ProjectBaseModel | project 必須 | `db/models/state.py:79` |
| `Label` | WorkspaceBaseModel | project は nullable | `db/models/label.py:11` |
| `Cycle` | ProjectBaseModel | project 必須 | `db/models/cycle.py:60` |
| `Module` | ProjectBaseModel | project 必須 | `db/models/module.py:67` |
| `CycleIssue` | ProjectBaseModel | unique は (cycle, issue) | `db/models/cycle.py:104-124` |
| `ModuleIssue` | ProjectBaseModel | unique は (issue, module) | `db/models/module.py:152-168` |
| `IssueLabel` | ProjectBaseModel | unique 制約なし | `db/models/issue.py:543-551` |
| `IssueRelation` | ProjectBaseModel | unique は (issue, related_issue) | `db/models/issue.py:296-316` |

※ 表 3 分類の軸を実現しているモデルと、その多重度

work item 側のフィールド（`db/models/issue.py` 114-170 行）。
`state` と `type` と `parent` は FK なので 1 つずつ、`labels` は through 付きの M2M。

```python
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="parent_issue",
    )
    state = models.ForeignKey(
        "db.State",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="state_issue",
    )
```

```python
    labels = models.ManyToManyField("db.Label", blank=True, related_name="labels", through="IssueLabel")
```

```python
    type = models.ForeignKey(
        "db.IssueType",
        on_delete=models.SET_NULL,
        related_name="issue_type",
        null=True,
        blank=True,
    )
```

`cycle` と `module` は work item 側に FK が無く、中間テーブルだけで表される。

#### 「1 work item 1 cycle」はスキーマではなく view 層の制約

`CycleIssue` の unique 制約は (cycle, issue) の組で、1 つの issue が複数の cycle に入ることを
スキーマ自体は止めない。`apps/api/plane/db/models/cycle.py` 112-120 行:

```python
    class Meta:
        unique_together = ["issue", "cycle", "deleted_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["cycle", "issue"],
                condition=models.Q(deleted_at__isnull=True),
                name="cycle_issue_when_deleted_at_null",
            )
        ]
```

止めているのは API の view で、既に別の cycle にいる issue は行を増やさず `cycle_id` を
付け替える。`apps/api/plane/api/views/cycle.py` 992 行と 1043 行:

```python
        cycle_issues = list(CycleIssue.objects.filter(~Q(cycle_id=cycle_id), issue_id__in=issues))
```

```python
        CycleIssue.objects.bulk_update(updated_records, ["cycle_id"], batch_size=100)
```

同じ view が work item を cycle の project へ絞る（998 行のコメントは
`# Scope to workspace+project to prevent cross-tenant IDOR`）。2.3 の「cycle は project に閉じる」は
ここで実装として確かめられる。

`ModuleIssue` は同じ形の unique 制約を持つが付け替えの処理が無いので、複数の module に入る。

#### Label はスキーマ上 workspace 単位にもできる

`Label` は `WorkspaceBaseModel` なので `project` が null を取れる。
docs の「A label belongs to one project」は現在の UI の運用で、スキーマの制約ではない。
`Label` は自己参照の `parent` も持つ（label group）。`apps/api/plane/db/models/label.py` 11-24 行:

```python
class Label(WorkspaceBaseModel):
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="parent_label",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=255, blank=True)
```

`IssueLabel` には unique 制約が無く、1 つの work item に何枚でも付く。
docs の「No limits are enforced on how many labels a project can have or how many labels a single
work item can carry」はこの形と一致する。

#### State の group はモデルの enum

`apps/api/plane/db/models/state.py` 14-20 行:

```python
class StateGroup(models.TextChoices):
    BACKLOG = "backlog", "Backlog"
    UNSTARTED = "unstarted", "Unstarted"
    STARTED = "started", "Started"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    TRIAGE = "triage", "Triage"
```

docs が挙げる 5 group に加えて `triage` がある。docs の
「There is **one triage state per project**」と対応し、`State` は `is_triage` と `default` の
2 つの真偽フィールドを持つ（`state.py` 90-91 行）。

#### 1 節の階層をモデルで確かめる

1 節で「Project に属す」「Workspace に属す」と書いたもののうち、
モデルが素直に対応していないものが 3 つある。

**View は 1 つのモデル。** `IssueView` は `WorkspaceBaseModel` なので `project` が nullable で、
project view と workspace view の違いは `project` に値が入っているかどうかだけ。
`apps/api/plane/db/models/view.py` 58 行:

```python
class IssueView(WorkspaceBaseModel):
```

**Page も 1 つのモデルで、project との紐づけは中間テーブル。**
`Page` は workspace への FK と自己参照の `parent`（nested page）を持ち、project への FK は無い。
project page は `ProjectPage` の行があるものを指す。
`apps/api/plane/db/models/page.py` 23-30 行と 135-138 行:

```python
class Page(BaseModel):
    ...
    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="pages")
```

```python
class ProjectPage(BaseModel):
    project = models.ForeignKey("db.Project", on_delete=models.CASCADE, related_name="project_pages")
    page = models.ForeignKey("db.Page", on_delete=models.CASCADE, related_name="project_pages")
    workspace = models.ForeignKey("db.Workspace", on_delete=models.CASCADE, related_name="project_pages")
```

unique 制約は (project, page) の組なので、スキーマ上は 1 つの page を複数の project へ紐づけられる。

**Work item type はモデルとしては workspace 単位。** `IssueType` は workspace への FK を持ち、
project へは `ProjectIssueType` で降りる。docs が言う「Pro / Business は project 単位、
Enterprise Grid は workspace 単位」は、この 1 つのモデルの上に敷かれた運用の差になる。
`apps/api/plane/db/models/issue_type.py` 14-24 行と 35-38 行:

```python
class IssueType(BaseModel):
    workspace = models.ForeignKey("db.Workspace", related_name="issue_types", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    logo_props = models.JSONField(default=dict)
    is_epic = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    level = models.FloatField(default=0)
```

```python
class ProjectIssueType(ProjectBaseModel):
    issue_type = models.ForeignKey("db.IssueType", related_name="project_issue_types", on_delete=models.CASCADE)
    level = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)
```

Epic は `is_epic` という真偽フィールドで、1.4 の「Epic は work item type の 1 つ」と一致する。
`level` が 1.4 と 2.5 で引いた hierarchy の level に当たる。

残りは 1 節のとおり project 直下。`Intake` は `ProjectBaseModel`（`db/models/intake.py:12`）、
`Estimate` も `ProjectBaseModel`（`db/models/estimate.py:18`）。

#### unique 制約から読める細かい制限

- **同じ 2 つの work item のあいだに張れる関係は 1 種類だけ。** `IssueRelation` の unique は
  (issue, related_issue) で relation_type を含まない。`apps/api/plane/db/models/issue.py` 305-313 行<br>
  > `unique_together = ["issue", "related_issue", "deleted_at"]`
- **`IssueLabel` には unique 制約が無い。** 同じ work item に同じ label の行が重複して入りうる
  （`db/models/issue.py:547-551`）
- **`IssueView` にも unique 制約が無い。** 同名の view を何枚でも作れる（`db/models/view.py:73-77`）
- **Page のバージョン履歴は 20 世代で切られる。** pricing の `Versions` 行（Free unavailable、
  Pro "20 versions / 30 days"）と対応する数。`apps/api/plane/bgtasks/page_version_task.py` 72 行<br>
  > `if PageVersion.objects.filter(page_id=page_id).count() > 20:`
- **Label の unique は project の有無で 2 本に分かれる。** project が NULL のときは
  workspace を含まず `name` 単体でユニークになる（`db/models/label.py:26-40`）。
  CE が workspace label を作らない運用と整合する
- **Page は `is_global` を持つが、CE には立てる経路が無い**（`db/models/page.py:51`）。
  CE の page の URL はすべて `workspaces/<slug>/projects/<project_id>/pages/...` の形で、
  workspace 直下の page endpoint が無い

#### CE に存在しないモデル

1 節で「Cloud Free では使えない」と書いたもののうち、CE には Django モデルごと無いものがある。
CE は Cloud Free と機能同等と公式が書くので、Free で使えないという判定の裏付けになる。

- **Initiative**: `apps/api/plane/` の Python コードを `initiative` で検索して出るのは
  `apps/api/plane/utils/constants.py` 47-48 行の予約 slug 2 行だけ
- **Teamspace**: 同じ範囲を `teamspace` で検索してヒット 0 件
- **work item のカスタムプロパティ**: 対応するモデルが無い。
  名前の似た `ProjectUserProperty`（`db/models/project.py:342`）はユーザーごとのフィルタ・表示設定で別物
- **work item type を作る経路**: `apps/api/plane/app/` と `apps/api/plane/bgtasks/` を
  `IssueType` で検索してヒット 0 件。モデルとテーブルはあるが CRUD も seed も無いので、
  CE だけを使う限り `Issue.type` は NULL のまま。Epic（`IssueType.is_epic`）も作れない

## 3. Kanban board がどのレベルに紐づくか

### 3.1 layout は 5 種類。board はそのうちの 1 つ

出典: <https://docs.plane.so/core-concepts/issues/layouts.md>

> "Plane provides five flexible layouts to view and manage your work items, tailored to suit different workflows."
> "## Board layout
> The Board layout resembles a Kanban board, with work items represented as cards in vertical columns. It's perfect for visualizing work stages like Backlog, In Progress, or Done."
> "### Key features
> * **Column organization**: Define stages for workflows.
> * **Subgroups**: Subgroup tasks to add finer categorizations.
> * **Status updates**: Drag and drop cards between columns to reflect progress."

5 種は List / Board / Calendar / Table / Timeline。Timeline が Gantt に当たる。

> "The Timeline layout, similar to a Gantt chart, shows your project's progress over time."

Spreadsheet は Table layout の別名として docs 内で混在している（display-options と labels のページは
"spreadsheet layout"、layouts のページは "Table layout" と書く）。

### 3.2 board が付くのは project の work items 画面と project view

出典: <https://docs.plane.so/introduction/tutorials/organize-and-view-work.md>

> "1. **Access your project work items**
>    * Navigate to any project in your sidebar.
>    * Look for layout icons in the top-right corner of the Work Items page."

project view は 5 layout すべてを持つ。出典: <https://docs.plane.so/core-concepts/views.md>

> "**Project Views**\
> Project views are created within a specific project and accessible to all members of that project. This feature is enabled by default and can be toggled from [Project Settings](/core-concepts/projects/overview#configure-project-settings). Project views support all layouts."

view 内の grouping も同じ軸で選べる。

> "3. Under **Group by**, select a property: State, Priority, Label, Assignee, Cycle, Module, or others.
> 4. Optionally set **Sub-group by** for a second-level grouping (in the Board layout)."

sub-group が効くのは Board layout であることが、この手順の括弧書きに出ている。

### 3.3 workspace 横断の board は無い。workspace view は spreadsheet 固定

出典: <https://docs.plane.so/core-concepts/views.md>

> "Plane offers two scopes of views, with fundamentally different coverage."
> "**Workspace Views**\
> Workspace views are created at the workspace level and available to all workspace members. These include some default system-defined views that cannot be removed. Workspace views are visualized using the spreadsheet layout."
> "Workspace views include four built-in, non-deletable default views: **All Issues**, **Assigned to Me**, **Created by Me**, and **Subscribed**. These are always available and always reflect live data."
> "4. Set **filters** — these apply across all projects in the workspace."

第 3 の scope として teamspace view がある。

> "**Teamspace Views**\
> Teamspace views provide a third scope: views tied to a teamspace rather than a single project or the full workspace."

teamspace は Pro 以上なので Cloud Free では使えない。
したがって Cloud Free で project 横断に見られるのは spreadsheet（表）だけで、
kanban で横断する手段は公式資料には無い。`kanban-plane-cloud-vs-ce-2026-09-03.md` の 5 節と同じ結論。

workspace view のページには plan badge が無く、pricing 機能表にも該当行が無い。
Free カードの項目は layout と view の数だけを書く。出典: <https://plane.so/pricing>

> `{"content":"Layouts and Views","description":"Five layouts, unlimited views, flexibility for everyone","icon":"check"}`

view の数に制限が無いことは読めるが、workspace view が Free に含まれるかの明文は無い（推測）。

### 3.4 board を持つその他の画面

- project を publish すると Kanban か List で公開できる。ただし publish は Pro 以上
  （pricing `Publish Views`: Free unavailable）。出典: <https://docs.plane.so/core-concepts/deploy.md><br>
  > "You can publish your project in either **Kanban** or **List** layouts. Choose whichever view best fits your project, or turn on both to give viewers more flexibility. Soon, Gantt and Spreadsheet layouts will also be available."
- Modules の一覧画面は List / Gallery / Timeline の 3 種で、board は無い。
  出典: <https://docs.plane.so/core-concepts/modules.md><br>
  > "* **List layout** – For simple ordered list of Modules in the project.
  > * **Gallery layout** – Displays Modules as cards, with a clear breakdown of work item counts by state for better visibility.
  > * **Timeline layout** – Displays the sequence of goals and their progress"
- Your Work（個人の集約画面）はダッシュボード形式で、layout の切り替えは無い。
  出典: <https://docs.plane.so/your-work.md>
- work item ではなく project を並べる board が workspace にある。列は project label か project state。
  どちらも Free では使えない（Project States は Pro、Project Labels は Business）。
  出典: <https://docs.plane.so/core-concepts/projects/project-labels.md><br>
  > "Project labels let you categorize projects across your workspace by team, function, priority, or any custom classification. Labels are defined at the workspace level and can be applied to any project. A project can have multiple labels."
  > "In Board and List layouts, you can group projects by their labels:
  > * Each label appears as its own column or group.
  > * Projects appear under their assigned labels.
  > * Projects without labels appear in a **No Label** group."

## 4. Workspace / Project の数の上限

### 4.1 上限の記載は公式のどこにも無い

- plane.so/pricing の機能表で件数を持つ行は `Seat limit`（Free: "12 users"）、
  `Versions`、`Guests` の 3 つだけ。`Projects` と `Work Items` の行は件数を持たない。
  出典: <https://plane.so/pricing><br>
  > `{"name":"Projects","description":"Add projects to house work items, cycles, and modules.","values":{"Free":"available","Pro":"available","Business":"available","Enterprise":"available"}}`
  > `{"name":"Work Items","description":"Add work via work items, set properties for tracking, and add to cycles or modules.","values":{"Free":"available","Pro":"available","Business":"available","Enterprise":"available"}}`
- docs の workspace 作成手順に上限の記述が無い。出典: <https://docs.plane.so/core-concepts/workspaces/overview.md><br>
  > "**Create additional workspaces**
  > 1. Click your workspace name in the top-left corner of the sidebar.
  > 2. Select **Create workspace** from the dropdown menu.
  > 3. Enter your workspace name and URL slug.
  > 4. Click **Create**."
  > "All your workspaces must be associated with the same email address."
- docs 全文（llms-full.txt）を `maximum (number|of)` / `no limit` / `unlimited` /
  `limit of [0-9]` / `up to [0-9]+ (projects|workspaces|work items)` で grep して出るのは 4 件だけで、
  いずれも別の話（席数の説明、label の無制限、PQL の再帰探索の深さ、dashboard の共有人数）

この結論は `notes/kanban-board.md` の確定 13（Cloud Free に work item 数・project 数の上限は無いものとして扱う）
と同じで、2026-09-04 時点で覆す資料は見つからなかった。

### 4.2 workspace を増やしても Free の枠は増えるが、課金も workspace 単位

出典: <https://docs.plane.so/workspaces-and-users/billing-and-plans.md>

> "Billing happens per workspace. If you have multiple workspaces, each requires its own subscription. When you upgrade a workspace to a paid plan, you're charged for all seats, regardless of how those seats are distributed across projects."

つまり Free の 12 席は workspace ごとに効く。1 人で使う限りこの制約は当たらない。

workspace を消すとデータは戻らない。出典: <https://docs.plane.so/core-concepts/workspaces/overview.md>

> "Deleting a workspace permanently removes all data including projects, work items, cycles, modules, and pages. Plane does not provide automatic backups. Export any important data before deleting."

### 4.3 CE のコードにも件数を数える実装が無い

Cloud の実装は非公開だが、機能同等とされる CE のコードには件数の上限が無い。

- work item・project・cycle・module・page の `create()` に、作成前の件数チェックが無い。
  `apps/api/plane/` の非テストコードで `count()` を比較しているのは 2 箇所だけで、どちらも上限ではない。
  `apps/api/plane/app/views/workspace/member.py:167` は最後の admin が抜けるのを止める下限、
  `apps/api/plane/license/api/views/instance.py:156` は初回セットアップの判定
- 件数で切っている唯一の実装は page のバージョン履歴（20 世代、2.9）で、page 自体の数ではない
- workspace の作成もインスタンス全体の on/off トグルだけ。
  `apps/api/plane/app/views/workspace/base.py` 83-95 行<br>
  > `"default": os.environ.get("DISABLE_WORKSPACE_CREATION", "0"),`<br>
  > `if DISABLE_WORKSPACE_CREATION == "1":`<br>
  既定値は `"0"` で、続くのは名前と slug の長さ検査だけ（109 行の `if len(name) > 80 or len(slug) > 48:`）
- 紛らわしいものが 1 つある。`WorkspaceUserPreference` の
  `navigation_project_limit = models.IntegerField(default=10)`（`db/models/workspace.py:329`）は、
  サイドバーに何件まで project を出すかという表示設定で、作成もアクセスも制限しない

CE に実在する上限はサイズ・頻度・ページ長だけ（ファイル 5 MB、description 10 MB、
ページネーション 1000 件、レート制限）。これは
`kanban-plane-free-limits-cli-mcp-2026-09-04.md` の結論と一致し、
`notes/kanban-board.md` の確定 13 を覆す材料は見つからなかった。

### 4.4 project の visibility はモデル上 2 値で、1 が欠番

pricing 機能表は `Public, Private, and Secret projects` を Free = unavailable とするのに、
docs は Public / Private を plan badge 無しで説明する（矛盾の 4 件目）。
CE のモデルは 3 値目を持たず、しかも値 1 が空いている。
`apps/api/plane/db/models/project.py` 69 行と 74 行:

```python
    NETWORK_CHOICES = ((0, "Secret"), (2, "Public"))
```

```python
    network = models.PositiveSmallIntegerField(default=2, choices=NETWORK_CHOICES)
```

欠番の 1 が有料版の Private に当たる、と読める（推測。Cloud の実装は非公開）。
Cloud Free で選べる visibility が何かは未確認のまま。

## 5. REST API のエンドポイント体系

CE のソースは `git clone --depth 1 https://github.com/makeplane/plane` の commit
`da1a7ab85012d16836459a10dd92ec55eb739c69`（branch `preview`、2026-09-02）を読んだ。
Cloud の実装は非公開なので、CE のコードから読めるのは「CE ではこうなっている」までで、
Cloud で同じとは限らない。実 API へのリクエストは行っていない（Free の workspace をまだ作っていないため）。

### 5.1 認証と base URL

ヘッダ名は `X-API-Key`。出典: <https://developers.plane.so/api-reference/introduction.md>

> "Our APIs use a key for authentication. The API key should be included in the header of each request to verify the client's identity and permissions. The key should be passed as the value of the `X-API-Key` header."
> "To authenticate an API request, include your API key in the request header:
> ```
> X-API-Key: <Your-API-Key>
> ```"

base URL は次のとおりで、パスの prefix は `api/v1/`。

> "All requests to the Plane Cloud API must be made to the following base URL:
> ```
> https://api.plane.so/
> ```
> This URL should be prefixed to all endpoint paths."
> "If you're using a self-hosted instance of Plane, your API base URL will differ based on your custom domain and setup."

key の発行場所は Profile Settings。

> "### Generating an API Key
> 1. Log into your Plane account and go to **Profile Settings**.
> 2. Go to **Personal Access Tokens** in the list of tabs available.
> 3. Click `Add personal access token`.
> 4. Choose a title and description so you know why you are creating this token and where you will use it.
> 5. Choose an expiry if you want this to stop working after a point."

workspace 側にも token の置き場があるが、API から見た PAT との差は公式に明文が無い（未確認）。
出典: <https://docs.plane.so/ai/mcp-server.md>

> "Disconnect from your AI tool's connector settings. If you used a token, revoke it under **Profile Settings → Personal Access Tokens** or **Workspace Settings → Access Tokens**."

OAuth Bearer も使える。出典: <https://developers.plane.so/api-reference/introduction.md>

> "If your application uses [OAuth](/dev-tools/build-plane-app/overview) to obtain user authorization (for example, a Plane app you've built), you can authenticate API requests with the OAuth access token. Include the token in the `Authorization` header as a Bearer token:
> ```
> Authorization: Bearer <your-oauth-access-token>
> ```"

CE の v1 は `X-API-Key` だけを受ける。`apps/api/plane/api/views/base.py` 48-52 行が
`authentication_classes = [APIKeyAuthentication]` のみで、`apps/api/plane/api/` 配下に oauth の実装は無い。
`apps/api/plane/api/middleware/api_authentication.py` 17-27 行:

```python
class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Authentication with an API Key
    """

    www_authenticate_realm = "api"
    media_type = "application/json"
    auth_header_name = "X-Api-Key"
```

CE の綴りは `X-Api-Key` だが、Django の `request.headers` は case-insensitive なので docs の
`X-API-Key` と同じヘッダを指す。

### 5.2 パスの階層は 3 段

```text
/api/v1/workspaces/{workspace_slug}/
/api/v1/workspaces/{workspace_slug}/projects/{project_id}/
/api/v1/workspaces/{workspace_slug}/projects/{project_id}/work-items/{work_item_id}/
```

- `workspace_slug` は URL に出る文字列。CE の path converter は `<str:slug>`
- `project_id` と `work_item_id` は UUID。CE は `<uuid:project_id>` / `<uuid:pk>`

workspace slug の定義は docs の全エンドポイントページに同じ文で入っている。

> "The workspace_slug represents the unique workspace identifier for a workspace in Plane. It can be found in the URL. For example, in the URL `https://app.plane.so/my-team/projects/`, the workspace slug is `my-team`."

`issues` は `work-items` へ改称された。CE の `apps/api/plane/api/urls/work_item.py` は同じ view を
2 組の URL に載せており、23 行に `# Deprecated url patterns`、87 行に
`# New url patterns with work-items as the prefix`、156 行に `urlpatterns = old_url_patterns + new_url_patterns`
と書いてある。docs は新形式だけを載せる。新規実装は `work-items` を使う。

intake も改称がある。出典: <https://developers.plane.so/api-reference/inbox-issue/overview.md>

> "**Deprecation notice**
> We are deprecating all `/api/v1/.../inbox-issues/` endpoints in favor of `/api/v1/.../intake-issues/`.
> **End of support**\
> 31st March 2025"

### 5.3 work item の作成・更新の最小

作成は project の下に POST し、必須は `name` だけ。

```text
POST /api/v1/workspaces/{workspace_slug}/projects/{project_id}/work-items/
X-API-Key: <key>
Content-Type: application/json

{"name": "..."}
```

出典: <https://developers.plane.so/api-reference/issue/overview.md>

> "* `name` *string* **(required)**
>   Name of the work item"

work item object の他の属性に `(required)` は付いていない。state を省略できるのは、
CE の `apps/api/plane/db/models/issue.py` 228-236 行 `_ensure_default_state()` が
project の default state を入れるため。type も `apps/api/plane/api/serializers/issue.py` 173-178 行が
`is_default=True` の `IssueType` を入れる。

更新は同じパスに `{work_item_id}` を足した PATCH。
出典: <https://developers.plane.so/api-reference/issue/update-issue-detail.md>

> "Partially update an existing work item with the provided fields. Supports external ID validation to prevent conflicts."

body に渡せる項目は作成・更新で同一。原文の Body Parameters は 1 項目 1 行の説明文なので、
ここでは項目名だけを原文の並び順で写す（説明文は各エンドポイントのページにある）。
出典: <https://developers.plane.so/api-reference/issue/add-issue.md> と
<https://developers.plane.so/api-reference/issue/update-issue-detail.md>

Assignees / Labels / Type id / Parent / Deleted at / Point / Name / Description html /
Description stripped / priority（`urgent`・`high`・`medium`・`low`・`none`）/ Start date / Target date /
Sequence id / Sort order / Completed at / Archived at / Last activity at / Is draft /
External source / External id / Created by / State / Estimate point / Type

`cycle` と `module` はこの一覧に無い（5.4 を見る）。

本文のフィールド名に注意が要る。docs の curl 例は `"description"` を送っているが、
Body Parameters の一覧に `description` は無く "Description html." と "Description stripped." がある。
CE の `Issue` モデル（`apps/api/plane/db/models/issue.py` 136-140 行）にも `description` という名前のフィールドは無い。

```python
    name = models.CharField(max_length=255, verbose_name="Issue Name")
    description_json = models.JSONField(blank=True, default=dict)
    description_html = models.TextField(blank=True, default="<p></p>")
    description_stripped = models.TextField(blank=True, null=True)
    description_binary = models.BinaryField(null=True)
```

本文を入れるなら `description_html` を使う。`description` を送ったときに黙って捨てられるかは
実 API で未検証（推測）。

CE の serializer が課すバリデーション（`apps/api/plane/api/serializers/issue.py` 74-153 行）:
`start_date > target_date` は 400、`assignees` / `labels` / `state` / `estimate_point` / `parent` は
いずれも同一 project のものでなければ 400。

書き込み用のフィールドの形も同じ serializer が決める
（`apps/api/plane/api/serializers/issue.py` 55-72 行）。`assignees` と `labels` は UUID の配列で
write only、type は `type_id` という名前で受ける。`description_stripped` は
`exclude` に入っているので API からは書けない。

```python
    class Meta:
        model = Issue
        read_only_fields = ["id", "workspace", "project", "updated_by", "updated_at", "completed_at"]
        exclude = ["description_json", "description_stripped"]
```

### 5.4 cycle / module への所属は別エンドポイント

work item の body では指定できない。cycle も module も中間テーブルとして表される。

```text
POST /api/v1/workspaces/{slug}/projects/{project_id}/cycles/{cycle_id}/cycle-issues/
{"issues": ["<work_item_uuid>", ...]}

DELETE /api/v1/workspaces/{slug}/projects/{project_id}/cycles/{cycle_id}/cycle-issues/{work_item_id}/

POST /api/v1/workspaces/{slug}/projects/{project_id}/modules/{module_id}/module-issues/
{"issues": ["<work_item_uuid>", ...]}

DELETE /api/v1/workspaces/{slug}/projects/{project_id}/modules/{module_id}/module-issues/{work_item_id}/
```

出典: <https://developers.plane.so/api-reference/cycle/add-cycle-work-items.md>

> "Assign multiple work items to a cycle. Automatically handles bulk creation and updates with activity tracking."
> "### Body Parameters
> List of issue IDs to add to the cycle"

出典: <https://developers.plane.so/api-reference/module/add-module-work-items.md>

> "Assign multiple work items to a module or move them from another module. Automatically handles bulk creation and updates with activity tracking."

cycle 間の移動は専用の endpoint があり、未完了のものだけが動く。
出典: <https://developers.plane.so/api-reference/cycle/transfer-cycle-work-items.md>

> "Move incomplete work items from the current cycle to a new target cycle. Captures progress snapshot and transfers only unfinished work items."

### 5.5 親子は `parent` フィールド。API では同一 project に限られる

出典: <https://developers.plane.so/api-reference/issue/overview.md>

> "* `parent` *uuid*
>   The uuid of the parent work item which should be part of the same workspace"

CE の実装は workspace ではなく project でも絞る。
`apps/api/plane/api/serializers/issue.py` 142-152 行:

```python
        # Check parent issue is from workspace as it can be cross workspace
        if (
            data.get("parent")
            and not Issue.objects.filter(
                workspace_id=self.context.get("workspace_id"),
                project_id=self.context.get("project_id"),
                pk=data.get("parent").id,
            ).exists()
        ):
            raise serializers.ValidationError("Parent is not valid issue_id please pass a valid issue_id")
```

2.6 で引いた docs の「A work item in Project A can be a sub-work item of a work item in Project B」は
UI の話で、CE の v1 API では project をまたいだ親子を作れない。
Cloud の v1 が同じ制約かは未確認（Cloud の実装は非公開）。
plugin が epic 相当の親子を project をまたいで作る設計にするなら、ここが効く。

子を列挙する専用の endpoint は v1 に無く、work item 一覧に `parent` の絞り込み query parameter も無い。
一覧のレスポンスに `sub_issues_count` が annotation として入るだけ
（`apps/api/plane/api/views/issue.py` 270 行）。子を集めるには work item 一覧を取って
クライアント側で `parent` の値で振り分ける。

### 5.6 一覧取得のパス

| 取得対象 | パス（GET） |
| --- | --- |
| project 一覧 | `/api/v1/workspaces/{slug}/projects/` |
| state 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/states/` |
| label 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/labels/` |
| cycle 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/cycles/` |
| module 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/modules/` |
| work item 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/work-items/` |
| workspace member 一覧 | `/api/v1/workspaces/{slug}/members/` |
| project member 一覧 | `/api/v1/workspaces/{slug}/projects/{project_id}/project-members/` |
| cycle の中の work item | `/api/v1/workspaces/{slug}/projects/{project_id}/cycles/{cycle_id}/cycle-issues/` |
| module の中の work item | `/api/v1/workspaces/{slug}/projects/{project_id}/modules/{module_id}/module-issues/` |
| workspace の機能フラグ | `/api/v1/workspaces/{slug}/features/` |

※ 表 4 plugin が使う一覧取得のパス

出典は developers.plane.so の各ページ（[List all projects](https://developers.plane.so/api-reference/project/list-projects.md)、
[List all states](https://developers.plane.so/api-reference/state/list-states.md)、
[List all labels](https://developers.plane.so/api-reference/label/list-labels.md)、
[List all cycles](https://developers.plane.so/api-reference/cycle/list-cycles.md)、
[List all modules](https://developers.plane.so/api-reference/module/list-modules.md)、
[List all work items](https://developers.plane.so/api-reference/issue/list-issues.md)、
[Get all workspace members](https://developers.plane.so/api-reference/members/get-workspace-members.md)、
[List all project members](https://developers.plane.so/api-reference/members/get-project-members.md)）と、
CE の `apps/api/plane/api/urls/` の各ファイル（`project.py` 16-20 行、`state.py` 13-17 行、
`label.py` 11-15 行、`cycle.py` 18-22 行、`module.py` 17-21 行、`work_item.py` 99-103 行、
`member.py` 42-46 行・27-31 行）。

### 5.7 v1 に無いリソース

- **view（project view / workspace view）は API に無い**。docs の目次に view の節が無く、
  v1 のパスに `/views/` を含むものが 1 つも無い。CE の `apps/api/plane/api/urls/` にも無い。
  board の見え方（layout・grouping）を API から作ることはできない
- **workspace 一覧も無い**。`GET /api/v1/users/me/` は slug を返さない
  （CE の `apps/api/plane/api/serializers/user.py` 26-37 行の `fields` に workspace が無い）
- docs にはあるが CE の v1 URL 定義に無いもの: page、initiative、teamspace、work item type、
  custom property、milestone、estimate、epic、customer、worklog、workspace features、
  advanced search。CE の `apps/api/plane/api/urls/__init__.py` が載せるのは asset / cycle / intake /
  label / member / module / project / state / user / work_item / invite / sticky の 12 モジュールだけ

CE の `apps/api/plane/api/urls/` には `estimate.py` と `schema.py` が置かれているのに
`__init__.py` の import 一覧に無い。この commit の CE では `/api/v1/.../estimates/` は 404 になる。
`preview` branch の過渡状態と見る（推測。安定 tag では未確認）。

各リソースがどの有料プランで有効になるかは、developers.plane.so の API リファレンスに記載が無い（未確認）。

## 6. 既存 workspace の中身を API で列挙する

### 6.1 workspace slug は API から取れない

v1 に workspace 一覧が無いため、slug はアプリの URL から人が読む
（`https://app.plane.so/my-team/projects/` の `my-team`）。
OAuth app を作った場合だけ installation から取れる。
出典: <https://developers.plane.so/dev-tools/build-plane-app/choose-token-flow.md>

> "### 4. Get workspace details
> ```
> GET https://api.plane.so/auth/o/app-installation/?id=APP_INSTALLATION_ID
> Authorization: Bearer YOUR_BOT_TOKEN
> ```
> **Response:**
> ```json
> [
>   {
>     "id": "installation-uuid",
>     "workspace": "workspace-uuid",
>     "workspace_detail": {
>       "name": "My Workspace",
>       "slug": "my-workspace"
>     },
>     "app_bot": "bot-user-uuid",
>     "status": "installed"
>   }
> ]
> ```"

このパスは `/auth/o/` 配下で `/api/v1/` ではなく、API key では使えない。
plugin では slug を `settings.json` の `env` に置くのが `.claude/rules/plugin-design.md` の
「環境固有の値は settings.json の env に置く」に沿う。

### 6.2 列挙の順序

1. `GET /api/v1/workspaces/{slug}/projects/` で project 一覧。`id` を集める
2. project ごとに `GET /api/v1/workspaces/{slug}/projects/{project_id}/work-items/`
3. 付随情報が要るなら project ごとに `states/`・`labels/`・`cycles/`・`modules/`

work item 一覧は project をまたげない。workspace 横断は検索 2 本だけで、一覧の代わりにはならない。

> "Perform semantic search across issue names, sequence IDs, and project identifiers."
> 出典: <https://developers.plane.so/api-reference/issue/search-issues.md>（`GET /api/v1/workspaces/{slug}/work-items/search/`）

返るのは `id` / `name` / `sequence_id` / `project__identifier` / `project_id` / `workspace__slug` だけで、
cursor が無く `limit` で切る。

識別子から 1 件引く経路はある。
出典: <https://developers.plane.so/api-reference/issue/get-issue-sequence-id.md>

> ```bash
> curl -X GET \
>   "https://api.plane.so/api/v1/workspaces/my-workspace/work-items/PROJ-123/" \
> ```

### 6.3 ページネーションは cursor 方式

出典: <https://developers.plane.so/api-reference/introduction.md>

> "The cursor is a string formatted as `value:offset:is_prev`, where:
> * `value` represents the page size (number of items per page).
> * `offset` is the current page number (starting from 0).
> * `is_prev` indicates whether the cursor is moving to the previous page (`1`) or to the next page (`0`)."

レスポンスの形。

> ```json
> {
>   "next_cursor": "20:1:0",
>   "prev_cursor": "",
>   "next_page_results": true,
>   "prev_page_results": false,
>   "count": 20,
>   "total_pages": 50,
>   "total_results": 1000,
>   "extra_stats": {},
>   "results": [ ... ]
> }
> ```

`next_cursor` を `cursor` に入れて回し、`next_page_results` が `false` になったら止める。

member 一覧 2 本だけページネーションが無く、裸の配列が返る。
CE の `apps/api/plane/api/views/member.py` 90-99 行が `Response(users_with_roles, ...)` を直接返し、
docs の Query Parameters にも `cursor` / `per_page` が無い。

#### `per_page` の既定値と上限が公式内で 3 通りに食い違う

- docs の Pagination 節: 既定 100、上限 100<br>
  > "* **`per_page` (optional)**: Number of items to display per page. Defaults to 100. The maximum allowed value specified by the server is 100."
- docs の各エンドポイントページの Query Parameters: "Number of results per page (default: 20, max: 100)"
- CE のコード: 既定 1000、上限 1000。`apps/api/plane/utils/paginator.py` 643 行
  `def get_per_page(self, request, default_per_page=1000, max_per_page=1000):`

Cloud でどれが効くかは未確認。`per_page` は明示して渡し、返った `count` で確かめる。

### 6.4 全件を取るときのリクエスト数

project 数 P、work item 総数 N として `1 + P + ceil(N / per_page)` 相当。
レート制限は API key 1 本あたり 60 req/min
（`kanban-plane-free-limits-cli-mcp-2026-09-04.md` の 4 節と同じ）。
`todo.md` の 40 件前後という規模ではレート制限に当たらない。

## 公式資料どうしの矛盾（判断材料として残す）

1. cycle が project をまたげるか。core-concepts だけが「またげる」と読める書き方をしており、
   automations・releases・work item のコピーの 3 か所と食い違う（2.3）
2. work item の親が project をまたげるか。docs は "should be part of the same workspace" と書き、
   UI の説明も「Project A の work item を Project B の work item の子にできる」と書くが、
   CE の v1 API の serializer は project でも絞る（5.5）
3. `per_page` の既定値と上限。docs の Pagination 節は 100 / 100、各エンドポイントページは 20 / 100、
   CE のコードは 1000 / 1000（6.3）
4. project の visibility。pricing 機能表は `Public, Private, and Secret projects` を
   Free = unavailable とするが、docs の Set project visibility は Public / Private を
   plan badge 無しで説明し、"Secret" という語自体が docs に出てこない。
   CE のモデルは `((0, "Secret"), (2, "Public"))` の 2 値で、値 1 が欠番（4.4）。
   Free で project の visibility を変えられるかは未確認
5. `expand` で展開できるフィールド。docs は work item について
   `type` / `module` / `labels` / `assignees` / `state` / `project` の 6 つを挙げるが、
   CE の展開マップ（`apps/api/plane/api/serializers/base.py` 91-106 行）に含まれるのは
   `state` と `project` だけ。Cloud の挙動は未確認

## 未確認の一覧

- 親子の段数の上限。docs に記載なし
- 依存（Blocked by / Blocking など）の登録そのものが Cloud Free でできるか。
  pricing にあるのは `Dependencies in Timeline`（Free unavailable）だけで、
  登録の可否を書いた行も badge も無い。CE のコードからは 4 種類が使えると読めるが（2.6）、
  Cloud で実際に選べるかは触っていない
- workspace view が Cloud Free で使えるかの明文。pricing に行が無く、docs に badge も無い
- Analytics の plan 要件。pricing に行が無く、docs に badge も無い
- grouping の軸ごとの plan 要件。機能の有無から逆算したもので、明文は無い
- Cloud の v1 API が CE と同じ制約（親の project 一致、`expand` の対象、`per_page`）を持つか。
  Cloud の実装は非公開
- PAT と workspace token の、API から見た能力差
- 各 API リソースがどの有料プランで有効になるか。developers.plane.so に記載なし
- Cloud Free で work item / project / cycle / module / page の数に上限があるか。
  記載が無いことは `kanban-plane-free-limits-cli-mcp-2026-09-04.md` で確認済みで、
  今回は CE のコードにも数える実装が無いことを確かめた（4.3）。Cloud 側は実測していない
- Initiative / Teamspace / カスタムプロパティ / work item type が Plane の有料版で
  どう実装されているか。確かめられたのは CE の repo に無いことだけ（2.9）
- CE の `Page.is_global` を立てる経路がどこにある想定か。CE には無い

## 出典まとめ（取得日 2026-09-04）

- <https://plane.so/pricing>
- <https://docs.plane.so/introduction/core-concepts.md>
- <https://docs.plane.so/introduction/quickstart/startups.md>
- <https://docs.plane.so/introduction/tutorials/organize-and-view-work.md>
- <https://docs.plane.so/core-concepts/workspaces/overview.md>
- <https://docs.plane.so/core-concepts/workspaces/teamspaces.md>
- <https://docs.plane.so/core-concepts/projects/overview.md>
- <https://docs.plane.so/core-concepts/projects/project-states.md>
- <https://docs.plane.so/core-concepts/projects/project-labels.md>
- <https://docs.plane.so/core-concepts/projects/initiatives.md>
- <https://docs.plane.so/core-concepts/projects/milestones.md>
- <https://docs.plane.so/core-concepts/issues/overview.md>
- <https://docs.plane.so/core-concepts/issues/states.md>
- <https://docs.plane.so/core-concepts/issues/labels.md>
- <https://docs.plane.so/core-concepts/issues/epics.md>
- <https://docs.plane.so/core-concepts/issues/layouts.md>
- <https://docs.plane.so/core-concepts/issues/display-options.md>
- <https://docs.plane.so/core-concepts/issues/estimates.md>
- <https://docs.plane.so/core-concepts/cycles.md>
- <https://docs.plane.so/core-concepts/modules.md>
- <https://docs.plane.so/core-concepts/views.md>
- <https://docs.plane.so/core-concepts/pages/overview.md>
- <https://docs.plane.so/core-concepts/pages/wiki.md>
- <https://docs.plane.so/core-concepts/analytics.md>
- <https://docs.plane.so/core-concepts/deploy.md>
- <https://docs.plane.so/work-items/project-work-item-types.md>
- <https://docs.plane.so/work-items/workspace-work-item-types.md>
- <https://docs.plane.so/work-items/custom-relations.md>
- <https://docs.plane.so/releases.md>、<https://docs.plane.so/projects/project-releases.md>
- <https://docs.plane.so/intake/overview.md>
- <https://docs.plane.so/automations/custom-automations.md>
- <https://docs.plane.so/workspaces-and-users/billing-and-plans.md>
- <https://docs.plane.so/your-work.md>
- <https://docs.plane.so/ai/mcp-server.md>
- <https://docs.plane.so/llms-full.txt>（全文 grep 用）
- <https://developers.plane.so/api-reference/introduction.md>
- <https://developers.plane.so/api-reference/issue/overview.md>、`add-issue.md`、`update-issue-detail.md`、
  `list-issues.md`、`search-issues.md`、`get-issue-sequence-id.md`
- <https://developers.plane.so/api-reference/cycle/add-cycle-work-items.md>、
  `list-cycles.md`、`transfer-cycle-work-items.md`
- <https://developers.plane.so/api-reference/module/add-module-work-items.md>、`list-modules.md`
- <https://developers.plane.so/api-reference/project/list-projects.md>、
  <https://developers.plane.so/api-reference/state/list-states.md>、
  <https://developers.plane.so/api-reference/label/list-labels.md>
- <https://developers.plane.so/api-reference/members/get-workspace-members.md>、`get-project-members.md`
- <https://developers.plane.so/api-reference/workspace-features/get-workspace-features.md>
- <https://developers.plane.so/api-reference/inbox-issue/overview.md>
- <https://developers.plane.so/dev-tools/build-plane-app/choose-token-flow.md>
- <https://developers.plane.so/llms-full.txt>、<https://developers.plane.so/llms.txt>
- <https://github.com/makeplane/plane>（commit `da1a7ab85012d16836459a10dd92ec55eb739c69`、branch `preview`、2026-09-02）

## 方法

- docs / developers: URL 末尾を `.md` にして Markdown 原文を取得。全文の索引には `llms-full.txt` を使った
- plan の可否は 2 系統を突き合わせた。plane.so/pricing の埋め込み JSON を Python で全行抽出したものと、
  docs の各ページ先頭にある `<Badge type="..." text="..." />`
- CE: `git clone --depth 1 https://github.com/makeplane/plane`（commit `da1a7ab8`）。
  取得物はすべて scratchpad 配下で、手元の repo は編集していない
- 実 API へのリクエストは 1 度も行っていない。API に関する記述はすべて docs と CE のコードからの読み取りで、
  実測ではない
- subagent を 2 本起動した。1 本は REST API のエンドポイント体系で、その結果を 5・6 節に反映した。
  もう 1 本は CE の Django モデルで、報告が届く前に 2.9 節を本セッションで直接書き、
  届いた報告のうち自分で見ていなかった項目（unique 制約から読める制限、CE に無いモデル、
  件数上限の全域検索、`NETWORK_CHOICES` の欠番）を 2.9・4.3・4.4 へ足した。
  1・2・3・4 節も本セッションで直接調べた
- subagent の報告に含まれるファイル名・行番号は、引用する前に手元の clone で 1 件ずつ開いて突合した。
  docs からの引用も、取得した原文に対して機械的に照合した
