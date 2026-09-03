# Plane Cloud Free の上限・公式 CLI・公式 MCP・API レート制限（2026-09-04）

`notes/kanban-board.md` の確定 11（道具は Plane、エディションは未定）を受け、ccm-f068 への回答の補足
（Free の上限の実調査 / CLI の有無 / API のリクエスト制限）に答えるため、公式の一次情報で確かめた記録。
取得日は 2026-09-04。subagent の報告を逐語で写し、URL を `<>` で包んだ以外は手を入れていない。

<!-- markdownlint-disable MD004 MD007 MD032 MD034 MD037 MD049 MD051 -->
<!-- 逐語引用の中の記法を lint に合わせて変えないため -->

取得日 2026-09-04。結論から書く。

## 結論

Cloud Free に work item 数・project 数・cycle 数・module 数・page 数の上限は、価格ページ・docs・CE コード・changelog のどこにも記載が無い。公式が数値で示している Free の上限は 3 つだけ: 席数 12、AI クレジット 500/席/月、添付ファイル 1 件 5MB。CE の「Unlimited projects, work items」は Cloud Free との対比ではなく、公式ブログは CE を「At 99.9% parity with the Free plan of our Cloud」と書き、CE コードの料金比較表も Free の見出しに "Unlimited projects", "Unlimited cycles and modules" を持つ。「CE が無制限なら Free は有限」という推論は、公式資料からは支持されない。

## 1. Cloud Free の上限

### 席数: 12（唯一の数値上限）

- 出典: <https://plane.so/pricing>（HTML 埋め込み JSON の機能表 "Security, Access, and Support" 行）
  > `{"name":"Seat limit","description":"Maximum users allowed in your workspace or instance based on your plan","values":{"Free":"12 users","Pro":"Unlimited","Business":"Unlimited","Enterprise":"Unlimited"}}`
- Free カードの項目（同 JSON "Get started free with"）: "500 AI credits per seat" / "Projects and Work Items" / "Cycles and Modules" / "Layouts and Views"（description: "Five layouts, unlimited views, flexibility for everyone"）/ "Work Item Intake" / "Estimates" / "Project Pages" / "12 users"。件数を示す項目は "12 users" だけ
- 出典: <https://docs.plane.so/workspaces-and-users/billing-and-plans.md>
  > "The Free plan supports up to 12 seats."
  > "Cloud workspaces on the Free tier before December 17th, 2024 were grandfathered at their current seat count. If you had 20 Admins and Members when the limit was introduced, your Free workspace retains 20 seats."

### work item / project / cycle / module / page 数: 上限の記載なし

- 価格ページ機能表（全 12 グループ、全行を JSON から抽出）で件数を持つ行は "Seat limit"（Free: 12 users）、"Versions"（Free: unavailable、Pro: "20 versions / 30 days"、Business: "60 versions / 90 days"、Enterprise: "Unlimited"）、"Guests"（Free: "Limited"、Pro/Business: "5 per paid member"）の 3 行。Projects / Work Items / Cycles / Modules / Pages の行はすべて Free=available で件数なし
  > `{"name":"Projects","description":"Add projects to house work items, cycles, and modules.","values":{"Free":"available",...}}`
  > `{"name":"Work Items","description":"Add work via work items, set properties for tracking, and add to cycles or modules.","values":{"Free":"available",...}}`
- CE コードの料金比較表（Cloud 列を含む）は Free の見出しに無制限を書く。出典: <https://github.com/makeplane/plane/blob/preview/apps/web/core/components/workspace/billing/comparison/plans.tsx>（clone した commit `da1a7ab85012d16836459a10dd92ec55eb739c69`、2026-09-02）
  > `free: ["Upto 12 users", "Pages", "Unlimited projects", "Unlimited cycles and modules"],`
  > `title: "Member limit", description: "Number of seats that can use project and work management features", ... cloud: { free: "12", one: "", pro: "Unlimited", business: "Unlimited", enterprise: "Unlimited" }, "self-hosted": { free: "~50", one: "~50", pro: "~200", business: "~200", enterprise: "Unlimited" }`
- 公式ブログは CE と Cloud Free をほぼ同等と書く。出典: <https://plane.so/blog/plane-and-its-editions>（datePublished 2025-08-26、dateModified 2026-02-12）
  > "At 99.9% parity with the Free plan of our Cloud and Commercial editions, it packs, Unlimited users, projects, and work items List, Kanban, Calendar, Timeline, and Table layouts Cycles, Modules, Intake, Pages"
  > Cloud の表: "Free" 列 "12 users"、"Pro" 列 "Unlimited seats, billed per workspace"
- CE FAQ の原文（前回調査の引用元）。出典: <https://plane.so/open-source>（FAQPage JSON-LD）
  > "What features are in Plane's free Community Edition?" → "Unlimited projects, work items, cycles, modules, pages, five layout views, intake, dashboards, estimates, REST API, and webhooks. No user limits."
- developers docs は CE を Cloud Free と同等と書く。出典: <https://developers.plane.so/self-hosting/editions-and-versions.md>
  > "The Community Edition is at par with the Free tier of the Cloud edition in its feature availability."
  出典: <https://developers.plane.so/self-hosting/self-hosting-101.md>
  > "Feature parity with the Free tier of Cloud, with no Pro, Business, or Enterprise features."
- CE コードに件数上限のカウンタは無い。`packages/constants/src/payment.ts` は製品 ID・価格・アップグレード URL のみで上限の定義なし。`apps/web/core`、`apps/web/ce`、`packages/i18n/src/locales/en`、`packages/constants/src`、`packages/types/src` を `seat|free.?plan|exceed|quota|has reached|reached the|upgrade to|limit reached|limit exceeded` で grep した結果、席数に関する UI 文字列は 1 件だけ
  > `"seat_limit": "Unable to import members due to seat limit restrictions.",`（packages/i18n/src/locales/en/workspace.json:356）
  work item / project の作成上限に当たる文字列は無い。`apps/api/plane` の grep でも `seat|quota|exceed|free_plan|max_(members|projects|issues)` に該当する件数制限のコードは無い（席数制限は Commercial Edition 側にあり CE には含まれない、が推測）

### ストレージ: 添付 1 件 5MB。総容量の上限は未確認

- 出典: <https://plane.so/blog/streamlining-self-hosting-managing-100k-docker-44000-kubernetes-deploys-ease>（datePublished 2024-04-18）
  > "To optimize upload queues and to prevent abuse, we restrict per-file size to 5MB on the Cloud. Those restrictions don't apply to self-hosted Plane, but we ship with the 5MB-default that admins can change."
- 出典: <https://developers.plane.so/self-hosting/govern/environment-variables.md>
  > `| **FILE_SIZE_LIMIT** | Maximum file upload size in bytes. | 5242880 (5MB) |`
- CE コード: `apps/api/plane/settings/common.py:353` `FILE_SIZE_LIMIT = int(os.environ.get("FILE_SIZE_LIMIT", 5242880))`。UI 文字列 `"The image size cannot exceed 5 MB."`（apps/web/core/components/core/image-picker-popover.tsx:345）、`"invalid_file_or_exceeds_size_limit": "Invalid file or exceeds size limit ({size} MB)"`（packages/i18n/src/locales/en/workspace-settings.json:448）
- workspace 総容量のプラン別上限: 価格ページ機能表に storage 行なし、docs に記載なし → 未確認

### AI クレジット: 500/席/月

- 出典: 価格ページ Free カード
  > `{"content":"500 AI credits per seat","description":"Shared across your workspace. No rollover. Viewing results/history is free.","tab":"cloud",...}`
- 出典: <https://docs.plane.so/ai/ai-usage.md>
  > "When the allowance is used up, Plane AI features are **paused** for that subject (a member or the workspace's agents) until the next monthly reset. The request that crosses the limit still finishes; the next one is blocked."

### changelog・ブログの Free plan 変更告知: 未確認

- <https://plane.so/changelog> の全ページ（?page=1〜5）のエントリ一覧を取り、2024-12〜2025-02 の Cloud エントリ（cloud-dec-4-2024、cloud-jan-21-2025、cloud-jan-24-2025、cloud-jan-27-2025、cloud-feb-17-2025、cloud-oct-11-2024）を取得して `seat|12 users|12 members|free plan|free tier|grandfather` で検索。該当なし。2024-12-17 付のエントリは一覧に無い
- 席数制限の導入日（2024-12-17）は上記 billing docs だけが出典

### 公式 API に上限が返るか: 返らない

- 出典: <https://developers.plane.so/api-reference/workspace-features/get-workspace-features.md>（`GET /api/v1/workspaces/{slug}/features/`）の応答例
  > `{ "project_grouping": true, "initiatives": true, "teams": true, "customers": true, "wiki": true, "pi": true }`
  機能フラグのみで、plan・seat・quota は含まない
- developers.plane.so の API 索引（<https://developers.plane.so/llms.txt>）に plan / license / billing の endpoint は無い。`https://api.plane.so/api/v1/schema/` は `{"error": "Page not found."}`
- CE の v1 URL 定義（`apps/api/plane/api/urls/`）: asset, cycle, estimate, intake, invite, label, member, module, project, schema, state, sticky, user, work_item。plan 系なし

## 2. 公式 CLI: あり（Plane Compose）

- 名前: Plane Compose。コマンド名 `plane`。出典: <https://developers.plane.so/dev-tools/plane-compose.md>
  > "Plane Compose is a command-line tool that lets you define and manage Plane projects using YAML configuration files. Think of it as "project as code", you write your project structure, schema, and work items in files, version control them with Git, and sync them with Plane."
- インストール
  > "pipx install plane-compose" / "The package is published at <https://pypi.org/project/plane-compose/>"
  PyPI メタデータ（取得値）: version 0.5.2、author "Plane Software, Inc." <hello@plane.so>、license AGPL-3.0-or-later、Repository <https://github.com/makeplane/compose>（`gh api repos/makeplane/compose` は 404。公開されていない）
- Cloud に対して使える
  > "**Server URL** - leave blank for `https://api.plane.so`; enter your instance URL if self-hosted"
  > "**Auth type** - `pat` for a Personal Access Token, `workspace` for a workspace-scoped token"
- できること: work item の作成・更新（`work/workitems.yaml` を `plane push`）、一覧取得（`plane pull` でローカル YAML へ）、`plane clone`、`plane diff`、`plane status`、複数プロジェクト（`plane push --all`）
  > "`plane push` pushes everything - schema and work files - in the correct order."
  > "Use this when changes have been made in Plane (via the UI or by other users) and you want to bring them into your local files. `plane pull`"
  > `work/workitems.yaml` のフィールド: id, title, type, state, priority, labels, assignees, watchers, start_date, due_date, description, parent, blocked_by, blocking, duplicate_of, relates_to, properties
  単発の「work item を 1 件作る」サブコマンドは無く、YAML の同期モデルのみ
- 名前が紛らわしい別物
  - Prime CLI（<https://github.com/makeplane/prime-cli-releases>）: "Prime CLI is the official command-line interface tool for managing Plane instances." セルフホストのインスタンス管理用で work item は扱わない
  - plane-claude-plugin（<https://github.com/makeplane/plane-claude-plugin>）: "just a thin plugin that wires Claude Code into Plane's hosted MCP server." Cloud 限定（"self-hosted Plane is not supported in this version"）
- サードパーティ CLI: 調査範囲を公式一次情報に限ったため未調査

## 3. 公式 MCP server

- repo: <https://github.com/makeplane/plane-mcp-server>（clone commit `ae6bad647aa9cea73d85e9cceab427c16d5c5277`、2026-09-02。pyproject version 0.3.2、license MIT）。README 冒頭
  > "- **30 tools**, one per Plane resource, covering 204 operations
  > - **Local or remote** — stdio, streamable HTTP, SSE
  > - **OAuth or API key** authentication"
- transport と認証（README "Transports"）
  > "### stdio — local ... needs `PLANE_API_KEY` and `PLANE_WORKSPACE_SLUG`."
  > "### HTTP with OAuth — hosted `https://mcp.plane.so/http/mcp`"
  > "### HTTP with a personal access token — hosted `https://mcp.plane.so/http/api-key/mcp`" ヘッダ `Authorization: Bearer <PAT>`、`X-Workspace-slug: <workspace-slug>`
  > "### SSE — deprecated `https://mcp.plane.so/sse` is maintained for backward compatibility only."
- Cloud で使える。hosted は Cloud 専用、self-hosted は stdio か自前デプロイ。出典: <https://docs.plane.so/ai/mcp-server.md>
  > "The hosted server only reaches Plane Cloud. For a self-hosted instance, use local mode or run your own server."
  > "Features that are not on your plan, such as time tracking, work item types, or custom properties, return a clear "not available on your plan" message instead of failing."
- tool 一覧（repo `plane_mcp/tools/README.md`、30 件）: collection, customer, customer_property, customer_request, cycle, get_pql_reference, initiative, intake, label, member, milestone, module, page, project, project_estimate, release, release_label, release_tag, state, template, work_log, workitem, workitem_activity, workitem_attachment, workitem_comment, workitem_link, workitem_property, workitem_relation, workitem_type, workspace
  > `workitem` の action: "`list` · `list_archived` · `retrieve` · `retrieve_by_identifier` · `search` · `count` · `create` · `update` · `delete` · `archive` · `manage_assignee` · `manage_label`"
- 数の食い違い: developers docs は 1 世代前の数を書く。出典: <https://developers.plane.so/dev-tools/mcp-server.md>
  > "Version 0.3.0 exposes **28 tools, one per resource, covering 183 actions**."
  repo README（0.3.2）は 30 tools / 204 operations。tools ディレクトリの実ファイル数は 30 で repo README と一致
- Node.js 版は廃止
  > "`@makeplane/plane-mcp-server` (Node.js) is deprecated and unmaintained. This Python implementation replaces it."

## 4. API レート制限

- 60 req/min、API key 単位。出典: <https://developers.plane.so/api-reference/introduction.md>
  > "- **Limit**: Each client is limited to 60 requests per minute.
  > - **Reset Interval**: The rate limit counter resets every minute.
  > - **Scope of Limitation**: The rate limit applies to all requests made with a given API key."
- 超過時: 429 とヘッダ 2 つ
  > "| 429 Throttling Error | The server is processing too many requests at once and is unable to process your request. Retry the request after some time. |"
  > "- **`X-RateLimit-Remaining`**: The number of requests remaining in the current rate limit window.
  > - **`X-RateLimit-Reset`**: The time at which the current rate limit window resets (in UTC epoch seconds)."
  Retry-After ヘッダの記載は無い
- プラン差: 未確認。docs・価格ページのどこにもプラン別のレート記載が無い。Cloud Free にも同じ 60/min が当たると読むのが自然だが、明文は無い（推測）
- CE 実装（Cloud の実装は非公開なので CE から読める範囲）
  - `apps/api/plane/settings/common.py:154` `API_KEY_RATE_LIMIT = os.environ.get("API_KEY_RATE_LIMIT", "60/minute")`
  - `apps/api/plane/api/rate_limit.py` `ApiKeyRateThrottle`: cache key は `X-Api-Key` ヘッダ。`if not api_key: return None  # Allow the request if there's no API key`。全 v1 view の `get_throttles()` が `[ApiKeyRateThrottle()]` を返す（`apps/api/plane/api/views/base.py:62`）
  - CE の v1 認証は `X-Api-Key` のみ（`api_authentication.py`）。docs にある OAuth Bearer は Cloud/Commercial 側の実装で、その throttle 方式は CE から読めない → OAuth 経路のレート制限は未確認
- MCP 経由: docs 3 本（dev-tools/mcp-server、mcp-server-tools、docs.plane.so/ai/mcp-server）に "rate limit" / "429" の記述は 0 件 → 未確認。MCP server は `plane-sdk` の `PlaneClient(api_key=...)` または `PlaneClient(access_token=...)` で同じ REST API を呼ぶ（`plane_mcp/client.py`）ので、PAT/API key 経路は上記 60/min と同じ制限に当たると考える（推測）。plane-sdk 0.2.23 は 429 を自動リトライする: `RetryConfig(total=3, backoff_factor=0.3, status_forcelist=(429, 500, 502, 503, 504), allowed_methods={"GET","PUT","DELETE","HEAD","OPTIONS","PATCH"})`。POST は対象外
- Plane Compose はクライアント側で速度を落とせる
  > "Plane Compose has exceeded the API request limit for the current time window. Run `plane rate stats` to see how many requests remain and when the window resets. To reduce the request rate: `PLANE_RATE_LIMIT_PER_MINUTE=30 plane push`"

## 5. Cloud Free で上限に当たったときの挙動

- 席数超過（有料からの降格・トライアル終了時）: workspace がロックされ、Workspace Settings 以外を全員が使えない。出典: billing-and-plans.md
  > "If your workspace exceeds the Free plan's seat limit when your subscription ends, the workspace enters a locked state. Everything except **Workspace Settings** is blocked. Workspace Admins can either remove users to get under the limit or reactivate a paid subscription to regain full access."
  > "Guests and pending invitations both count toward that limit, which they don't on a paid plan, so a workspace can be over it even when the Admin and Member count looks fine. Nobody is removed from the workspace, but you can't invite anyone new. While a workspace is over the limit, everyone is locked out of everything except Workspace Settings until you remove enough people or start a paid subscription."
- work item / project 数: 上限の記載が無いので、当たったときの挙動も記載なし
- API 超過: 429（項目 4）
- AI クレジット超過: 機能が月次リセットまで停止（項目 1 の引用）
- 添付 5MB 超過: CE の UI 文字列は "The image size cannot exceed 5 MB." と "Invalid file or exceeds size limit ({size} MB)"。Cloud での文言は未確認

## 未確認の一覧

- Cloud Free の workspace 総容量（storage）の上限: 価格ページ機能表・billing docs・environment-variables docs に記載なし
- 席数 12 の導入告知（2024-12-17）の changelog / ブログ原文: changelog 全ページのエントリ一覧と 2024-10〜2025-02 の Cloud エントリ 6 本に該当なし
- レート制限のプラン差、OAuth Bearer 経路のレート制限、MCP hosted 経路のレート制限: 上記 docs に記載なし
- サードパーティ CLI: 未調査

## 公式資料どうしの矛盾（判断材料として残す）

- CE の席数について公式は 4 通りに書いており、GitHub issue <https://github.com/makeplane/plane/issues/9086>（2026-05-16、open）がそれを列挙している。issue が引く比較ブログ <https://plane.so/blog/plane-vs-openproject-which-should-you-choose-in-2026> の一文
  > "Plane's Community Edition is licensed under AGPL-3.0, and the self-hosted free tier mirrors the cloud free tier with a limit of 12 users per workspace."
  は、open-source ページ FAQ の "No user limits" と矛盾する。issue が引く maintainer 発言 "the restriction exists as a hard-coded limit with the Free plan on the Commercial Edition ... there is no hard-coded restriction on the Community Edition" は、discussion #4532 の全コメント 7 件（GraphQL で取得）に存在しない（削除済みか別の場所。原本に到達できず）
- 今回の問い（work item 数）については、どの資料も CE と Cloud Free の間に差を書いていない

## 方法

- 価格ページ: `curl` で HTML を取得し、埋め込み JSON（`\"title\":\"...\",\"features\":[...]`）を Python で全行抽出
- docs / developers: URL 末尾 `.md` で Markdown 原文を取得
- CE: `git clone --depth 1 <https://github.com/makeplane/plane>`（commit `da1a7ab8`）、MCP: `makeplane/plane-mcp-server`（commit `ae6bad64`）、`plane-sdk==0.2.23` wheel を pip download。すべて scratchpad 配下。手元のファイルは編集していない
- subagent は起動していない
