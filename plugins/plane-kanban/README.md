# plane-kanban

対応 CodingAgent: Claude Code + Codex。

Plane Cloud の work item を、Claude Code と Codex から読み書きする plugin。
work item を読み書きする `plane-kanban` skill と、セットアップを進める `plane-kanban-setup` skill、Plane の REST API を直接呼ぶ bash スクリプトを持つ。
hook と agent は持たない。

## Plane と Plane Cloud

Plane は、作業を work item（カード）として project ごとの board に並べて管理する、kanban 型のタスク管理サービス。
開発元が運営するホスト版が Plane Cloud で、ほかに自分でサーバーを立てる self-host 版（Community Edition など）がある。
この plugin は Plane Cloud を対象にし、既定では Cloud の API（`https://api.plane.so/api/v1`）を呼ぶ。

この README で使う Plane の用語は次のとおり。

- workspace: 最上位の単位。`https://app.plane.so/{slug}/` の slug で指す
- project: workspace の中の単位。board・state・label は project ごとに持つ
- work item: board に載る 1 枚のカード。1 つの project に属する
- sub work item: 親の work item を持つ work item
- state: work item の進み具合で、board の列になる。project を作ると Backlog / Todo / In Progress / Done / Cancelled の 5 つが入る。
  どの state も backlog / unstarted / started / completed / cancelled のいずれかの group に属する
- label: work item に複数付けられる名前付きの印。board で絞り込みに使える

## Plane の使い方の決め事

この plugin を使う workspace では、Plane を次のように使う。

### Plane 側で守る制約

人が Plane の workspace・project・state をどう作り、どう運用するかについて守るもの。

- kanban 用の workspace を 1 つに決め、すべての repo でその workspace を使う
- 1 つの repo に 1 つの project を対応させる。repo が使う workspace と project は、repo の git の設定に対で持つ（「repo ごとの設定」の節）
- state の名前を変えない。skill は project を作ったときに入る 5 つと、setup が足す Needs Input の名前で state を指定し、スクリプトは名前で state を引く

### この plugin が従う決め事

Plane 側の運用には課さないが、この plugin が work item を扱うときに従うもの。

- work item を作る・更新するとき、いまのセッションを表す label `session:<日付>-<セッション id の先頭 8 桁>` を付ける。
  セッションごとの一覧は、この label で絞り込んで見る
- 複数のタスクに分けられる仕事（Jira の epic に当たるもの）は、その仕事を親の work item にし、分けたタスクを sub work item にする。段数は制限しない
- In Progress の work item についてユーザーに確認（質問・承認・選んでもらうこと）を出すときは、先に Needs Input に動かす。
  返答を受けて作業を再開するときに In Progress に戻す
- work item・label・project を消さない。スクリプトに削除の経路は無く、消すなら人が Plane の画面で消す
- project をまたいだ一覧は作らない。見るのは常に 1 つの project の board

## Requirements

- macOS。API key を macOS の Keychain から `security` コマンドで読む。Linux では動かない
- GUI にログインしていて、login keychain が開いていること。SSH だけで入った状態では Keychain を読めないことがある
- `curl` と `jq`
- Plane Cloud の workspace と、Personal Access Token

## Keychain に入れる API key

API key は秘密なので環境変数では渡さない。Keychain の次の 1 項目をスクリプトが読む。

| service 名 | 内容 |
| --- | --- |
| `plane-kanban-api-key` | Personal Access Token。Plane の Profile Settings → Personal Access Tokens で発行する |

登録は一度だけ、ターミナルで行う。

```sh
security add-generic-password -s plane-kanban-api-key -a "$USER" -w '<token>'
```

無いときは、スクリプトが exit 2 で止まり、登録のコマンドを stderr に出す。plugin は Keychain を自動で書き換えない。
スクリプトは API key を stdout・stderr・ログに出さない。

## 任意の環境変数

| 変数 | 内容 |
| --- | --- |
| `PLANE_API_BASE` | API の base URL。既定 `https://api.plane.so/api/v1` |
| `PLANE_RETRY_MAX` | 429 が返ったときの再試行の上限。既定 `3` |

環境変数の置き場は CodingAgent ごとに違う。どちらも設定ファイル 1 か所で、シェルの起動経路に依存しない。

| CodingAgent | 置き場 |
| --- | --- |
| Claude Code | `~/.claude/settings.json` の `env` |
| Codex | `~/.codex/config.toml` の `[shell_environment_policy]` の `set` |

## セットアップ

セットアップは `plane-kanban-setup` skill が、人と一緒に 1 段ずつ進める。
repo の作業ツリーで CodingAgent に「plane-kanban のセットアップ」と頼む。
足りないもの（コマンド、Keychain の API key、repo の workspace と project）を確かめ、人が作業する段では案内して待つ。
repo を clone し直したときや別のマシンでも、同じ skill で設定し直す。

setup は、project に確認待ちの work item を置く state の Needs Input（group は started）が無ければ足し、
board の列で In Progress と Done の間に並べる。0.2.0 より前にセットアップした repo は、同じ skill を実行し直すと足される。

## repo ごとの設定

repo が使う workspace と project は、repo の git の設定に対で持つ（`git config --local`）。
`init-project.sh` が書く。

| 設定のキー | 内容 |
| --- | --- |
| `plane-kanban.workspaceSlug` | workspace の slug |
| `plane-kanban.projectId` | project の id |

`.git/config` に入るので commit されず、同じ repo の worktree からも同じ値を読める。
消すときは `git config --local --remove-section plane-kanban` を実行する。

## テスト

`tests/run.sh` が、`curl` を偽の実装に差し替えて全スクリプトを通す。ネットワークは使わない。

```sh
plugins/plane-kanban/tests/run.sh
```

## 更新と削除

Claude Code: `claude plugins marketplace update cc-tools` のあと `claude plugins update plane-kanban@cc-tools`。
削除は `claude plugins uninstall plane-kanban@cc-tools`。

Codex: `codex plugin add plane-kanban@cc-tools` / `codex plugin remove plane-kanban@cc-tools`。

削除しても、Plane 側の work item と、各 repo の git の設定（`plane-kanban.workspaceSlug` と `plane-kanban.projectId`）は残る。
