# Linear Free プランの制限と repo の対応（2026-09-03）

`notes/kanban-board.md` の候補 Linear について、無料枠の上限・超過時の挙動・repo を Project に
対応させる構成を公式の一次情報で確かめた記録。ccm-f068 の改稿（全 repo を 1 サービスに載せる前提）の根拠。
取得日は 2026-09-03。subagent の報告を逐語で写し、URL を `<>` で包んだ以外は手を入れていない。

<!-- markdownlint-disable MD004 MD032 MD034 MD037 MD049 -->
<!-- 逐語引用の中の記法（原文の * 箇条書き・_強調_・裸 URL）を lint に合わせて変えないため -->


## 1. Free プランの制限の全項目

結論: 価格ページの比較表に載る数量制限は 4 つ (Members 無制限 / File upload 10MB / Issues 250 / Teams 2)。機能は Free で 20 行に check が付き、残りは Basic 以上。

出典: <https://linear.app/pricing> (比較表。check の有無は HTML の check アイコンを列ごとに機械判定した)

数量行 (Free / Basic / Business / Enterprise):

- "Members" : "Unlimited" / "Unlimited" / "Unlimited" / "Unlimited"
- "File upload" : "10MB" / "Unlimited" / "Unlimited" / "Unlimited"
- "Issues" : "250 issues" / "Unlimited" / "Unlimited" / "Unlimited"
- "Teams" : "2 teams" / "5 teams" / "Unlimited" / "Unlimited"

Free に check が付く行 (逐語): "Issues, projects, cycles, initiatives", "Customer requests", "API and webhook access", "Import and export", "Triage", "Pulse", "Issue sync", "Diffs", "Agent platform", "MCP access", "Linear Agent", "Integrations", "Microsoft Teams integration", "Progress reports", "SSO" (セル値 "Google"), "Admin roles"

Free に check が無い行: "Guided reviews", "Issue SLAs", "Triage responsibility", "Triage rules", "Releases" (Business "15 pipelines" / Enterprise "Unlimited"), "Sub-initiatives", "Coding sessions **", "Loops **" ("** Requires AI credits"), "Code Intelligence", "Triage Intelligence", "Support integrations", "Salesforce integration" ("Add-on"), "Sub-teams" (Business "1 level" / Enterprise "5 levels"), "Private teams", "Guest accounts", "Insights", "Dashboards", "Data warehouse sync", "Slack intake", "Email intake", "Web forms", "Multiple Slack workspaces", "Private Slack channels", "Per-channel configurations", "Team owners", "Advanced authentication", "SCIM provisioning", "IP restrictions", "Domain claiming", "Audit log", "Third-party app management", "HIPAA compliance", "Priority support", "Account manager", "Custom terms", "Uptime SLA"

補助出典 (価格ページの info アイコンのツールチップ文言。<https://static.linear.app/web/_next/static/chunks/PlanFeature-Di4xVZQv.js> に埋め込まれた定義。公式配信物だが文書ではない):

- Issues 行: name "Issues (excluding archive)", description "Applies to all non-archived issues"
- File upload 行: name "File upload size", description "Applies to any files you upload to issues or comments"
- 同コードの Free 上限定数: `limits={[s.activeIssueCount]:250,[s.fileUploadVolume]:150,[s.singleFileUploadSize]:10,[s.pendingInviteCount]:25,[s.teamCount]:2}`。`fileUploadVolume` 150 と `pendingInviteCount` 25 は価格ページ・docs のどこにも記載が無く、コードにだけある (単位も未記載。150 は MB と推測)
- Admin roles: description "Control who are admins in the workspace", minimumPlan basic
- MCP access: description "Let AI models and agents interface with your Linear data", minimumPlan free

Team 数の docs 側の記載: <https://linear.app/docs/teams>
> "The number of teams that can be created is dependent on a workspace's subscription:" 表 "Free | 2 / Basic | 5 / Business | Unlimited / Enterprise | Unlimited"

Retired team は数えない: <https://linear.app/changelog/2026-04-16-linear-for-microsoft-teams>
> "Retired teams are now correctly not counted towards team limits on Basic and Free plans"

Member の役割: <https://linear.app/docs/members-roles>
> "Please note that on Free plans, all users are Admins."
> "Guest accounts are only available on Business and Enterprise plans, and are billed as regular members."

API レート: プラン差の記載なし。<https://linear.app/developers/rate-limiting>
> "API key": "2,500 requests per hour", "OAuth App": "5,000 requests per hour", "Unauthenticated": "600 requests per hour"; complexity "API key": "3,000,000 points per hour", "OAuth app": "2,000,000 points per hour", "Unauthenticated": "100,000 points per hour"; "maximum complexity of a single query at any time to 10,000 points"
> このページに Free / Basic / Business の語は無い。

Integration の制限: 価格ページで "Integrations" は Free に check。Free で使えないのは "Support integrations" (コード側 description "Integrate with Zendesk, Intercom, and Front", Business 以上)、"Salesforce integration" (Enterprise add-on)、"Multiple Slack workspaces" (Enterprise)。Slack: <https://linear.app/docs/slack> のうち検索結果に出た記述 "Linear's Enterprise plan supports connecting multiple Slack workspaces to Linear"。GitHub 連携自体のプラン制限は <https://linear.app/docs/github-integration> に記載なし。

History (issue 履歴の保持期間) : 未確認。<https://linear.app/pricing>、<https://linear.app/docs/billing-and-plans>、<https://linear.app/docs/teams> に記載なし。teams docs の設定表に "toggle detailed issue history" とあるだけで、プラン差の記述は無い。

Project 数: 未確認 (項目 3 を参照)。

## 2. 250 issues 超過時の挙動

結論: 250 を超えると新規作成ができなくなる。archive 済みは数えない (archive は自動のみ、手動不可)。削除は枠を戻すと読めるが明文なし。closed/canceled は archive されるまで数えると読める (推測)。

超過時:
<https://linear.app/docs/billing-and-plans> ("Change or Cancel a subscription" 節)
> "When cancelling a subscription:
> * Nothing will be deleted.
> * If you have over 250 issues, you will no longer be able to create new issues.
> * Members will become Admins of the workspace, as all users are Admins on free plans."

archive は数えない:
<https://linear.app/startups>
> "Linear does, however, offer a generous free plan that includes all major features, allows unlimited workspace members, and 250 issues (plus unlimited archived issues)."

<https://linear.app/pricing> のツールチップ (PlanFeature-Di4xVZQv.js): "Issues (excluding archive)" / "Applies to all non-archived issues"

archive は自動のみ:
<https://linear.app/docs/delete-archive-issues>
> "Archiving happens automatically with no option to manually archive items."
> "You can adjust the auto-archive time period, after which closed issues are auto-archived in _Team Settings > Issue statuses & automations_. Changes usually take effect on the next auto-archive run, typically within 24 hours."
> "Closed issues are auto-archived after they have remained completed, canceled, or auto-closed and inactive for the full auto-archive period. Issues in active cycles or unfinished projects are archived only after those cycles or projects have also been completed for that period."

削除:
同ページ
> "Recently deleted issues are stored in the archives for 30 days, after which they'll be permanently removed from your workspace. It is not possible to restore deleted issues after they have been permanently removed."

推測 (明文なし): closed/canceled でも archive 前は "non-archived" なので 250 に数える。削除した issue が 30 日の "Recently deleted" にある間に枠へ数えるかは、上記のどのページにも記載が無く未確認。フロントエンドコードの定数名が `activeIssueCount` である点も「非 archive を数える」読みと整合するが、コードの計数ロジック本体は見ていない。

超過の段階: コード側に `NEARING_LIMIT_THRESHOLD=.9`、`OVERLY_EXCEEDING_MULTIPLIER=1.1` と `under / nearing / exceeded / overlyExceeded` の 4 段階がある。docs に対応する説明は無い。1.1 倍 (275) までの挙動差は未確認。

## 3. Project の数と構造

結論: Project 数の上限は価格ページ・docs のどこにも記載なし (未確認)。Project は 1 Team か複数 Team に属し、Team をまたげる。issue は 1 Team・1 Project にだけ属する。Project ごとに Issues タブとそれに付ける filter 付き view があり、issue view は list / board を切り替えられる。

Project 数: 未確認。見たページ: <https://linear.app/pricing>、<https://linear.app/docs/billing-and-plans>、<https://linear.app/docs/projects>、<https://linear.app/docs/teams>。価格ページの "Issues, projects, cycles, initiatives" 行は Free に check。

Team との関係:
<https://linear.app/docs/projects>
> "Projects are units of work that have a clear outcome or planned completion date, such as a new feature's launch, and are comprised of issues and optional documents. They can be shared across multiple teams and come with their own unique features, progress graph, and notification options."
> "Projects can be shared across multiple teams. Add more teams when creating a project or from the project details page by clicking on the team name, then marking off more teams in the dropdown. Once you add more than one team, the project view will create tabs so you can toggle between seeing all issues or issues on specific teams."
> "Issues can only be associated with one project at a time. A workaround would be to create sub-issues for the task, then assign each sub-issue to a different project."

<https://linear.app/docs/teams>
> "**Projects** can belong to a single team or be shared across many teams (but issues can only be tied to one team)"
> "**Issues are tied to teams**. Think about how you prefer to manage your work and interact with features such as the backlog and archive."
> "**Sub-issues** can be assigned to any team or member in the workspace, not just the parent issue's team."

Project ごとの view:
<https://linear.app/docs/projects>
> "Each team has a _Projects_ page which organizes the team's projects into a list, board, or timeline. There is also a _Projects_ page at the workspace level so you can view all projects within your workspace in one location."
> "Next to the "Issues" tab in each project, you'll find the `new view` icon. This feature enables the creation of custom views of the project's issues. By clicking this icon, you can filter a subset of the issues and save this filtered perspective under a specific view name."
> "To create new issues in a project, use `C` from the project view or add the project property manually if creating the issue from another page."

board 切り替え: <https://linear.app/docs/display-options>
> "On issue views, they allow you to order and group issues in various ways, switch between board and list layouts, and choose which information is displayed."
> "If a board is available for your view, you'll see the option and can toggle between lists and boards. `Cmd/Ctrl` `B` will also toggle the layout."

推測: 「1 Team に多数 Project、Project ごとの board で絞る」は上の記述の組み合わせで成立する。Project の Issues タブ自体が board 表示できるかは display-options の "If a board is available for your view" の条件付きで、Project の Issues タブが該当するかの明文は無い。

## 4. label groups / custom views / sub-issue / blocking

結論: 4 つとも docs にプラン制限の記述なし。custom views で Enterprise 限定なのは Initiative view だけ。

label groups: <https://linear.app/docs/labels>
> "Label groups create one level of nesting in your workspace and team labels, giving you more options when organizing issues. Each label group is limited to 250 labels."
> "Only one label from a given label group can be applied to an issue at a time."
> プラン名の記載なし。

custom views: <https://linear.app/docs/custom-views>
> "Initiative views are available on Enterprise plans."
> "If you select a specific team, project, or initiative when creating the view, the shared view is available within that team, project, or initiative scope and will be listed under Team views in the Views page."
> "To share a view across multiple teams but limit it to projects or issues within a specific team or teams, create an _All teams_ view and use filters to refine the list."
> Free / Basic の語は無い。

sub-issue: <https://linear.app/docs/parent-and-sub-issues> にプラン名・上限の記載なし。

blocking / blocked-by: <https://linear.app/docs/issue-relations>
> "Mark issues as blocked by other issues with `M` then `B`. If other issues are blocking the current issue, they'll show up in the issue sidebar with an orange flag under _Blocked by_."
> "Mark issues as blocking other issues with `M` then `X`. If the issue is blocking other work, the blocked issues show up in the issue sidebar with a red flag under _Blocks_."
> プラン名の記載なし。

補足: 価格ページの機能定義コードに "Restrict label management" (Business) があるが、これは管理者限定化の機能で、label group の可否ではない。

## 5. Basic プランと Free との差

結論: $10/user/month (年払い表示)。Free との差は Teams 5、Issues 無制限、File upload 無制限、Admin roles、Coding sessions と Loops (AI credits 必要)、Third-party app management の 6 行。

<https://linear.app/pricing>
> Basic カード: "$10 per user/month", "Billed yearly", "All Free features +", "5 teams", "Unlimited issues", "Unlimited file uploads", "Admin roles"
> Free カード: "$0", "Free for everyone", "Unlimited members", "2 teams", "250 issues", "Agent platform", "Linear Agent"

比較表で Basic にだけ check が増える行: "Coding sessions **", "Loops **", "Third-party app management"。Guest / Private teams / Sub-teams / Insights / Support integrations は Business 以上で、Basic には無い。

<https://linear.app/docs/ai-credits>
> "Coding sessions | Basic, Business, and Enterprise | Per session. Cost includes model tokens at provider-published rates, with no markup, and sandbox runtime at $0.25 per 20-minute block."
> "Loops | Business and Enterprise | Per loop run. ..." (docs は Loops を Business 以上と書いており、価格ページの表 (Basic に check) と食い違う。どちらが現行か未確認)

<https://linear.app/docs/members-roles>
> "The user who upgrades the workspace is granted the admin role"

月払い価格: 価格ページの表示は "Billed yearly" の $10 のみ。月払いの金額は未確認 (https://linear.app/pricing の静的 HTML に月額の数字は無い。billing docs に "we offer either monthly or yearly options" とあるだけ)。

## 6. 公式 MCP server と Free プラン

結論: 使える。価格ページの "MCP access" 行は Free に check。docs の MCP ページにプラン制限の記述は無い。

<https://linear.app/pricing> 比較表 "MCP access": Free / Basic / Business / Enterprise すべて check。ツールチップ (PlanFeature-Di4xVZQv.js) "MCP access" / "Let AI models and agents interface with your Linear data" / minimumPlan free。

<https://linear.app/docs/mcp>
> "Read-write access is provided through `https://mcp.linear.app/mcp` by default."
> "For read-only access, you have two options: * Connect to `https://mcp.linear.app/mcp/readonly`, which only ever exposes read tools. * Use the standard `/mcp` endpoint, but only request the `read` OAuth scope."
> Claude Code: "claude mcp add --transport http linear-server <https://mcp.linear.app/mcp>"
> "The SSE endpoint at `https://mcp.linear.app/sse` is a deprecated fallback for clients that do not support Streamable HTTP."
> このページの "Free, Pro (Claude desktop)" / "Team, Enterprise (Claude.ai)" は Claude 側のプラン名で、Linear のプランではない。Linear のプラン制限の記述は無い。

MCP 経由の作成も 250 の上限に従うかは明文なし (推測: 同じ API を叩くので従う)。

## 見たが該当記載が無かった URL

<https://linear.app/docs/mcp-server> (404)、<https://linear.app/docs/integrations> (404)、<https://linear.app/docs/attachments> (404)、<https://linear.app/docs/workspaces> (Free の記載なし)、<https://linear.app/docs/linear-agent> (プラン記載なし)、<https://linear.app/changelog/2025-05-01-mcp> (プラン記載なし)。

## 用途に対する含意 (推測、出典の範囲外)

repo を Project に対応させる案は、公式記載の範囲では Project 数の上限が無く、Team 2 の制約を受けない。issue が 1 Team に縛られる点と、250 の枠が archive までの非 archive issue 全体 (closed 含む) に掛かる点が効くので、auto-archive の期間を短くするか、完了 issue を削除する運用が必要になる。
