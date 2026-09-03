# Plane Cloud Free と Community Edition の差（2026-09-03）

`notes/kanban-board.md` の候補 Plane について、Cloud Free と self-host の Community Edition の
制限・機能差・workspace / project の構造を公式の一次情報で確かめた記録。
ccm-f068 の改稿（推奨を Plane Cloud Free へ差し替える）の根拠。取得日は 2026-09-03。
subagent の報告を逐語で写し、URL を `<>` で包んだ以外は手を入れていない。

<!-- markdownlint-disable MD034 MD051 -->
<!-- 逐語引用の中の記法（原文のページ内リンク・裸 URL）を lint に合わせて変えないため -->


出典はすべて公式 (plane.so / docs.plane.so / developers.plane.so / github.com/makeplane/plane)。
docs.plane.so と developers.plane.so は URL 末尾に `.md` を付けると Markdown 原文を返すので、引用はその原文から取った。plane.so/pricing の機能表は HTML に埋め込まれた JSON (`values` / `valuesByTab`) から読み取った。
取得した原文は scratchpad `plane/` に残してある (matrix.txt が価格ページ機能表の全行)。

## 1. Cloud Free プランの制限

### 席数 (seat): 12 seat。Owner / Admin / Member が課金席で、Free ではゲストと保留中の招待も 12 に数える

- <https://docs.plane.so/workspaces-and-users/billing-and-plans#free-plan-seat-limits>
  > "The Free plan supports up to 12 seats."
  > "Cloud workspaces on the Free tier before December 17th, 2024 were grandfathered at their current seat count. If you had 20 Admins and Members when the limit was introduced, your Free workspace retains 20 seats."
  > "The [Free plan seat limit](#free-plan-seat-limits) applies again once you're back on Free. Guests and pending invitations both count toward that limit, which they don't on a paid plan, so a workspace can be over it even when the Admin and Member count looks fine."
- <https://plane.so/pricing> 機能表 "Seat limit": Free = "12 users", Pro/Business/Enterprise = "Unlimited"。説明文 "Maximum users allowed in your workspace or instance based on your plan"
- <https://docs.plane.so/roles-and-permissions/member-roles#paid-seat-classification>
  > "Most workspace roles count as paid seats for billing purposes. Workspace Guest is the only role that does not."

### ゲスト: Free は "Limited"。数値は価格ページに無く、上記のとおり 12 席の枠内に数える。有料は課金席 1 につき 5

- <https://plane.so/pricing> 機能表 "Guests": Free = "Limited", Pro = "5 per paid member", Business = "5 per paid member", Enterprise = "Custom roles via RBAC + GAC"
- <https://docs.plane.so/workspaces-and-users/billing-and-plans#guest-allocation>
  > "On Pro and Business plans, every paid seat includes 5 Guest slots."

### AI credits: 500 credits / seat / 月。Cloud のみ

- <https://plane.so/pricing> Free カード
  > "500 AI credits per seat" / "Shared across your workspace. No rollover. Viewing results/history is free."
- 機能表 "Monthly AI Credits": Free = "500 credits / seat"、"Admin Controls": Free = "—"
- <https://docs.plane.so/ai/plane-ai-credits>
  > "Overage off (the default). Plane AI features pause for that member until the allowance resets at the start of the next month."

### Estimates の値: Free はプロジェクトあたり 6 値まで

- <https://docs.plane.so/core-concepts/projects/estimates> (llms-full.txt 内 "Estimates")
  > "Free plan projects support up to 6 custom estimate values. [Upgrade to Pro](https://plane.so/pricing) to add additional estimate values for Points, Categories, and Time-based estimates."

### フィルタ演算子: Free は `is` と日付の `between` のみ

- <https://docs.plane.so/core-concepts/issues/visualise_filter> (llms-full.txt 内 "Work Item Filters")
  > "**Free plan** You get essential filtering with the `is` operator, plus `between` for date fields."
  > "**Paid plans** Unlock advanced filtering with additional operators including `is not`, `is not any of`, `after`, `before`, and more specialized conditions."

### ページのバージョン履歴: Free は無し

- <https://plane.so/pricing> 機能表 "Versions" (See restorable versions of edits to your pages.): Free = unavailable, Pro = "20 versions / 30 days", Business = "60 versions / 90 days", Enterprise = "Unlimited"

### API レート: API key 1 本あたり 60 req/分。プランによる差の記載なし

- <https://developers.plane.so/api-reference/introduction#rate-limiting>
  > "**Limit**: Each client is limited to 60 requests per minute."
  > "**Scope of Limitation**: The rate limit applies to all requests made with a given API key."

### 添付ファイルサイズ: エディタの添付ブロックは 1 件 100MB (プラン別の記載なし)

- <https://docs.plane.so/core-concepts/pages/editor-blocks>
  > "Uploads and embeds files directly into your content, supporting documents, images, and other file types up to 100MB each."

### 未確認 (記載が見つからなかった項目)

- work item 数・project 数・workspace 数の上限: 未確認。plane.so/pricing (Free カードの記述は "Five layouts, unlimited views, flexibility for everyone" のみ)、docs.plane.so/core-concepts/workspaces/overview ("Create additional workspaces" の手順があり上限の記述なし)、docs.plane.so/core-concepts/projects/overview、docs.plane.so/llms-full.txt 全文の grep (limit / unlimited / quota) で見つからず。
- ストレージ総量: 未確認。plane.so/pricing、docs.plane.so/workspaces-and-users/billing-and-plans、docs.plane.so/llms-full.txt の "storage" grep で見つからず。
- 活動履歴 (activity) の保持期間: 未確認。上記 llms-full.txt の "retention" / "history" grep で見つからず。
- REST API / webhook が Free で使えるかの明文: 未確認。plane.so/pricing の機能表に API の行が無い。developers.plane.so/api-reference/introduction にプラン条件の記述なし。CE には含まれる (後述 2.) ので、parity の文からは使えると読めるが、これは推測。

## 2. Community Edition (CE) の制限

### 席数・件数: 制限なしと公式 FAQ が明記

- <https://plane.so/open-source> FAQ
  > "What features are in Plane's free Community Edition? Unlimited projects, work items, cycles, modules, pages, five layout views, intake, dashboards, estimates, REST API, and webhooks. No user limits."
  > "Is Plane free? Community Edition is free with no user limits. Cloud has a free tier. Commercial starts at $7 per seat per month."

### ファイルサイズ: 既定 5MB、環境変数で変更可

- <https://developers.plane.so/self-hosting/govern/environment-variables> (Community Edition 節)
  > "| **FILE\_SIZE\_LIMIT** | Maximum file upload size in bytes. | 5242880 (5MB) |"
- <https://raw.githubusercontent.com/makeplane/plane/preview/deployments/cli/community/variables.env>
  > `FILE_SIZE_LIMIT=5242880`

### API レート: 既定 60/分、環境変数で変更可

- 同 environment-variables ページ (Community Edition 節)
  > "| **API\_KEY\_RATE\_LIMIT** | Rate limit for API requests to prevent abuse. Format: `number/timeunit` | 60/minute |"
- 同 variables.env
  > `API_KEY_RATE_LIMIT=60/minute` / `AUTHENTICATION_RATE_LIMIT=10/minute`
- 実装: <https://github.com/makeplane/plane/blob/preview/apps/api/plane/api/rate_limit.py> `rate = settings.API_KEY_RATE_LIMIT`

### ストレージ・history 保持期間・AI credits: 記載なし

- ストレージは自前の MinIO / S3。AI credits は Cloud のみ:
  <https://docs.plane.so/workspaces-and-users/billing-and-plans#ai-credits-and-usage>
  > "AI credits apply only to Plane Cloud. On self-hosted instances, you use your own AI provider's API keys, and all AI usage and costs are managed directly through your provider."

### CE のコードに席数制限は無いか: 12 席のハードリミットは見つからず (コード検索の範囲で)

- `gh api search/code repo:makeplane/plane "seat"` のヒットは `packages/constants/src/payment.ts` (有料プランの表示用定数) と i18n の文字列 `"seat_limit": "Unable to import members due to seat limit restrictions."` のみ。制限を課す実装は見つからなかった。網羅的なコード監査ではない。

## 3. 機能差

### 前提: CE = Cloud Free と公式が明記。Commercial = Cloud 有料と同等

- <https://developers.plane.so/self-hosting/editions-and-versions#community>
  > "The Community Edition is at par with the Free tier of the Cloud edition in its feature availability. To upgrade to paid plans, you must first switch to the Commercial Edition."
- <https://developers.plane.so/self-hosting/self-hosting-101>
  > "**Community Edition** is open source under [AGPL v3.0](...). Free, no license key, full source available, you can audit and modify it. Feature parity with the Free tier of Cloud, with no Pro, Business, or Enterprise features."
  > "**Feature availability.** Community has parity with the Free tier of Cloud. Commercial and Airgapped get full parity with Cloud's paid plans (Pro, Business, Enterprise Grid), license-gated."
  > "**Release cadence.** Cloud is the test bed. New features ship there first, then Commercial, then Community."

### Cloud Free にあって CE に無いもの (公式記載から読めるもの)

- Plane AI credits (500/seat)。Cloud 限定 (上記 billing-and-plans の引用)。CE は自前の API key で AI を使う
- 14 日 Business trial:
  <https://docs.plane.so/workspaces-and-users/billing-and-plans#free-plan-and-trial-access>
  > "Trials are a Plane Cloud feature. Self-hosted instances never show the trial banner or the **Manage trial** link."
- 新機能の先行提供 (release cadence の引用)

### CE にあって Cloud Free に無いもの

- 席数上限なし (open-source FAQ "No user limits" vs Cloud Free "12 users")
- FILE_SIZE_LIMIT / API_KEY_RATE_LIMIT を自分で変更できること (環境変数)
- 公式が価格ページの機能表と食い違う点が 1 つ: open-source FAQ は CE の機能に "dashboards" を含めるが、価格ページの "Dashboards and Widgets" は Free = unavailable。どちらが正しいかは公式に記載なし (未確認)

### Free (= CE) で使えない主な機能 (plane.so/pricing 機能表で Free = unavailable のもの)

Publish Views、Bulk Ops、Active Cycles、Dependencies in Timeline、Initiatives、Updates、Module Overview、Project Overview、Public/Private/Secret projects、Project States、Milestones、Cycle Manual Start and Stop、Work Item Types、Custom Properties、Work Item Templates、Teamspaces、Dashboards and Widgets、Cycle Progress Charts、Time Tracking、Advanced Exports、Wiki、Real-time Collab、Work Item Embeds、Page Publish / Templates / Versions / Exports、Enhanced Search、Wiki Collections、Workspace Members Import、GitHub / GitLab / Slack / Sentry / Draw.io 連携、SAML / OIDC (self-hosted タブでは Pro から、cloud タブでは Business から)。

Free で使えるもの: Projects、Work Items、Comments、Cycles、Modules、Pages (project pages)、Estimates (Basic)、Layouts (5 種)、Views (Basic。private view は Pro)、Progress Overview、Intake In-app、Power K、Importers (Jira / Linear / Asana / ClickUp / CSV)。

- Views の Basic の中身: <https://docs.plane.so/core-concepts/views>
  > "### Private view <Badge type="info" text="Pro" />" / "## Lock view <Badge type="info" text="Pro" />" / "## Publish View <Badge type="info" text="Pro" />" / "## Export view <Badge type="info" text="Pro" />"

## 4. self-host の商用版

### ある。名前は "Commercial Edition" と "Airgapped Edition" (Plane One は現行ドキュメントに登場しない)

- <https://developers.plane.so/self-hosting/editions-and-versions>
  > "Plane comes in four editions by how its deployed. Our Cloud is our only hosted edition as of 2025. Additionally, we offer three unique self-hosted editions tailored to meet two sets of unique needs—the open-source Community Edition, the recommended Commercial Edition, and the Airgapped Edition."
  > "This edition also comes with a Free tier, but also lets you upgrade seamlessly to all our paid plans. It offers, - Full feature parity with our Cloud - A bundle of 12 Free user seats per workspace so there are no surprises when you upgrade"
  > "The **Commercial Edition** remains closed-source to offer enterprise-grade features and seamless scalability for businesses."
- <https://developers.plane.so/self-hosting/self-hosting-101>
  > "**Commercial Edition** is closed-source. It includes a built-in Free tier of 12 user seats per workspace, which means you can run Commercial in production at small scale without buying a license. To unlock Pro, Business, or Enterprise Grid features, you activate a license key. Commercial gets full feature parity with Cloud."
- "Plane One" は plane.so/pricing、plane.so/open-source、plane.so/download、developers.plane.so/llms-full.txt、docs.plane.so/llms-full.txt のいずれにも出てこない。CE コードの `EProductSubscriptionEnum.ONE` に名残があるだけ。

### CE / Cloud Free との差

- Commercial の Free tier は Cloud Free と同じ 12 席。有料プランへの切り替えがライセンスキーで可能 (CE は不可、Commercial へ移行が要る)
- 価格 (Cloud / self-hosted 共通の表示。価格ページの "Self-hosted" タブは Pro のリンク先が `https://app.plane.so/upgrade/pro/self-hosted/` に変わるだけで金額は同じ JSON): Free $0、Pro 月払 $8 / 年払 $6 per seat per month、Business 月払 $15 / 年払 $13、Enterprise Grid "Quote on request"
    - <https://plane.so/pricing> 埋め込み JSON: `"name":"Pro","pricing":{"monthly":8,"annually":6}` / `"name":"Business","pricing":{"monthly":15,"annually":13}`
    - open-source ページの FAQ は "Commercial starts at $7 per seat per month" と書いており価格ページと食い違う。どちらが現行かは未確認
- ライセンスは workspace 1 つ + マシン 1 台に紐づく:
  <https://developers.plane.so/self-hosting/manage/manage-licenses/activate-pro-and-business#delink-license-key>
  > "Your license key is linked to both a workspace and an instance, meaning it can only be used on one workspace on one machine at a time."
- Enterprise Grid はインスタンス単位:
  <https://docs.plane.so/workspaces-and-users/billing-and-plans#enterprise-grid>
  > "A single Enterprise Grid license covers the entire instance, including all workspaces within it."
- CE → Commercial は別マシンへの移行 (バックアップ→復元):
  <https://developers.plane.so/self-hosting/upgrade-from-community>
  > "Install the [Commercial Edition](...) on a fresh machine, not the one running the Plane Community Edition."
- Commercial にしかない運用面の差の例: 詳細な health probe
  <https://developers.plane.so/self-hosting/govern/health-checks> (llms-full.txt 内)
  > "**Community Edition** exposes only the basic root health check at `/` that returns `{ "status": "OK" }`"

## 5. workspace / project の構造

### 1 workspace に複数 project を作れる。project 横断のビューは workspace views (表形式) で見られ、board 形式では見られない

- <https://docs.plane.so/introduction/core-concepts>
  > "At the top level, **Workspaces** contain everything - typically one per organization. Inside workspaces, you create **Projects** for specific products, initiatives, or goals. Within projects, you manage **Work items** (the individual tasks your team completes)."
  > "Views exist at both project and workspace levels. Project views show work from a single project, while workspace views can display work items across all projects you have access to."
- <https://docs.plane.so/core-concepts/views#types-of-views>
  > "**Workspace Views** Workspace views are created at the workspace level and available to all workspace members. These include some default system-defined views that cannot be removed. Workspace views are visualized using the spreadsheet layout."
  > "Workspace views include four built-in, non-deletable default views: **All Issues**, **Assigned to Me**, **Created by Me**, and **Subscribed**."
  > "4. Set **filters** — these apply across all projects in the workspace."
- Workspace views にプランのバッジは付いていない (同ページで Pro バッジが付くのは Private view / Lock / Publish / Export のみ) ので Free / CE で使えると読める。ただし明文はない (推測)
- 複数 workspace の作成は可能で上限の記載なし:
  <https://docs.plane.so/core-concepts/workspaces/overview#create-workspace>
  > "**Create additional workspaces** 1. Click your workspace name in the top-left corner of the sidebar. 2. Select **Create workspace** from the dropdown menu."
  > "All your workspaces must be associated with the same email address."
- Cycle は project 横断で work item を入れられると core-concepts に記載:
  > "Cycles can contain multiple work items from different projects, making it easy to see your team's workload at a glance and keep an eye on deadlines."
- 複数 project を束ねる Initiatives / Teamspaces / "Active Cycles" (See all running cycles across all projects) は Pro 以上 (価格ページ機能表)
- 用途 (複数 repo を 1 サービスに載せて切り替える) への当てはめ: repo ごとに project、横断で見るなら workspace views の All Issues + フィルタ、という形になる。board で横断したいなら Free / CE では該当機能が見つからなかった (推測を含む)

## 6. Cloud Free で上限を超えたときの挙動

### 席数超過: 新規招待ができず、超過状態では Workspace Settings 以外がロックされる (読み取り専用ではなく全ブロック)。データは消えない

- <https://docs.plane.so/workspaces-and-users/billing-and-plans#cancel-your-trial-early>
  > "Nobody is removed from the workspace, but you can't invite anyone new. While a workspace is over the limit, everyone is locked out of everything except Workspace Settings until you remove enough people or start a paid subscription."
  > "Your projects, work items, pages, and members stay exactly where they are. Business features are switched off, not deleted."
- <https://docs.plane.so/workspaces-and-users/billing-and-plans#cancel-and-return-to-the-free-plan>
  > "If your workspace exceeds the Free plan's seat limit when your subscription ends, the workspace enters a locked state. Everything except **Workspace Settings** is blocked. Workspace Admins can either remove users to get under the limit or reactivate a paid subscription to regain full access."
- 席の追加は有料化が前提:
  > "Once you drop to 12 seats, you lose grandfathered status and cannot add seats without upgrading."
- CSV での一括招待時の超過エラー文字列 (CE コード):
  <https://github.com/makeplane/plane/blob/preview/packages/i18n/src/locales/en/workspace.json>
  > `"seat_limit": "Unable to import members due to seat limit restrictions."`

### AI credits 超過: 当該メンバーの AI 機能が翌月まで停止 (overage 有効時は課金継続)

- 上記 plane-ai-credits の引用。ただし overage の課金は有料プラン向けの記述で、Free で overage を有効にできるかは未確認

### 席数以外の上限 (work item 数など) の超過挙動: 該当する上限自体の記載が無いため未確認

- 見た URL: plane.so/pricing、docs.plane.so/workspaces-and-users/billing-and-plans、docs.plane.so/workspaces-and-users/add-remove-seats、docs.plane.so/workspaces-and-users/upgrade-plan、docs.plane.so/llms-full.txt 全文
- self-host Commercial の Free tier で 12 席を超えたときの挙動: 未確認。developers.plane.so/self-hosting/troubleshoot/license-errors には席数超過の項目が無い

## 出典まとめ (取得日 2026-09-03)

- <https://plane.so/pricing>
- <https://plane.so/open-source>
- <https://developers.plane.so/self-hosting/editions-and-versions>
- <https://developers.plane.so/self-hosting/self-hosting-101>
- <https://developers.plane.so/self-hosting/upgrade-from-community>
- <https://developers.plane.so/self-hosting/manage/manage-licenses/activate-pro-and-business>
- <https://developers.plane.so/self-hosting/govern/environment-variables>
- <https://developers.plane.so/self-hosting/troubleshoot/license-errors>
- <https://developers.plane.so/api-reference/introduction>
- <https://docs.plane.so/workspaces-and-users/billing-and-plans>
- <https://docs.plane.so/workspaces-and-users/add-remove-seats>
- <https://docs.plane.so/workspaces-and-users/upgrade-plan>
- <https://docs.plane.so/roles-and-permissions/member-roles>
- <https://docs.plane.so/core-concepts/workspaces/overview>
- <https://docs.plane.so/core-concepts/workspaces/members>
- <https://docs.plane.so/core-concepts/projects/overview>
- <https://docs.plane.so/core-concepts/views>
- <https://docs.plane.so/introduction/core-concepts>
- <https://docs.plane.so/ai/plane-ai-credits>
- <https://docs.plane.so/llms-full.txt>、<https://developers.plane.so/llms-full.txt> (全文 grep 用)
- <https://github.com/makeplane/plane> (README.md、deployments/cli/community/variables.env、apps/api/plane/api/rate_limit.py、packages/constants/src/payment.ts、packages/i18n/src/locales/en/workspace.json)
