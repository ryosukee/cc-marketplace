# plane-kanban

対応 CodingAgent: Claude Code + Codex。

Plane Cloud の work item を、repo 単位の project で読み書きする plugin。
`plane-kanban` skill 1 本と、Plane の REST API を直接呼ぶ bash スクリプトを持つ。
hook と agent は持たない。

- 一覧・作成・state の更新を、いまの repo に対応する project に対して行う
- work item を作る・更新するとき、いまのセッションを表す label `session:<日付>-<セッション id の先頭 8 桁>` を付ける
- 複数セッションにまたがる仕事は、親 work item と sub work item で束ねる
- 取り込み一覧の JSON から work item を 1 件ずつ作り、作った id を一覧へ書き戻す
- work item・label・project を消す経路は無い

## Requirements

- macOS。API key と workspace の slug を macOS の Keychain から `security` コマンドで読む。Linux では動かない
- GUI にログインしていて、login keychain が開いていること。SSH だけで入った状態では Keychain を読めないことがある
- `curl` と `jq`
- Plane Cloud の workspace と、Personal Access Token

## Keychain に入れる 2 項目

API key と slug は環境変数では渡さない。Keychain の次の 2 項目をスクリプトが読む。

| service 名 | 内容 |
| --- | --- |
| `plane-kanban-api-key` | Personal Access Token。Plane の Profile Settings → Personal Access Tokens で発行する |
| `plane-kanban-workspace-slug` | workspace の slug。`https://app.plane.so/{slug}/` の部分 |

登録は一度だけ、ターミナルで行う。

```sh
security add-generic-password -s plane-kanban-api-key -a "$USER" -w '<token>'
security add-generic-password -s plane-kanban-workspace-slug -a "$USER" -w '<slug>'
```

無いときは、スクリプトが exit 2 で止まり、登録のコマンドを stderr に出す。plugin は Keychain を自動で書き換えない。
スクリプトは API key を stdout・stderr・ログに出さない。

## 任意の環境変数

| 変数 | 内容 |
| --- | --- |
| `PLANE_API_BASE` | API の base URL。既定 `https://api.plane.so/api/v1` |
| `PLANE_KANBAN_DATA_DIR` | repo と project の対応を保存する場所。既定は `CLAUDE_PLUGIN_DATA`、それも無ければ `~/.claude/plugins/data/plane-kanban-cc-tools` |

置くなら Claude Code は `~/.claude/settings.json` の `env`、Codex は Codex を起動する環境（シェルの環境変数）。

## セットアップ

1. Plane で kanban 用の workspace を作り、slug を控える
2. Personal Access Token を発行する
3. 上の 2 項目を Keychain に登録する
4. repo の作業ツリーで `scripts/init-project.sh --identifier <接頭辞>` を回し、repo と同じ name の project を作る。
   既に同じ name の project があれば作らずにその id を保存する

project の name は repo のディレクトリ名と同じにする。スクリプトはこの name で project を引く。

## スクリプト

すべて `scripts/` にあり、JSON を stdout に出す。exit 0 = 成功、1 = 該当なし、2 = 前提条件エラー。

| スクリプト | 何をするか |
| --- | --- |
| `resolve-project.sh` | いまの repo に対応する project の id と identifier を出す |
| `init-project.sh --identifier X` | project を作る。既にあれば作らない |
| `list-work-items.sh` | work item の一覧。`--state` / `--label` / `--session` / `--parent` / `--all` で絞る |
| `create-work-item.sh --name N` | work item を 1 件作る。`--description-file` / `--parent` / `--state` / `--label` |
| `update-work-item.sh ID` | state・題名・親・本文を変える。セッションの label を足す |
| `ensure-session-label.sh` | いまのセッションの label を用意して id を出す |
| `import-work-items.sh 一覧.json` | 一覧から 1 件ずつ作り、id を一覧へ書き戻す |

セッション id は環境変数（Claude Code は `CLAUDE_CODE_SESSION_ID`、Codex は `CODEX_THREAD_ID`）から取る。
`--session <id>` で明示でき、`--no-session` で label を付けない。

レート制限（API key 1 本あたり 60 回 / 分）で 429 が返ったら、`X-RateLimit-Reset` まで待って 3 回まで再試行する。

## State

repo と project の対応を `PLANE_KANBAN_DATA_DIR`（既定は上記）の `projects.json` に保存する。
消しても次の実行で API から引き直す。

## テスト

`tests/run.sh` が、`curl` を偽の実装に差し替えて全スクリプトを通す。ネットワークは使わない。

```sh
plugins/plane-kanban/tests/run.sh
```

## 更新と削除

Claude Code: `claude plugins marketplace update cc-tools` のあと `claude plugins update plane-kanban@cc-tools`。
削除は `claude plugins uninstall plane-kanban@cc-tools`。

Codex: `codex plugin add plane-kanban@cc-tools` / `codex plugin remove plane-kanban@cc-tools`。

削除しても Plane 側の work item と、`PLANE_KANBAN_DATA_DIR` の対応ファイルは残る。
