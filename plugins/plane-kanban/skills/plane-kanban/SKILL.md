---
name: plane-kanban
user-invocable: true
description: Plane（kanban）の work item を読み書きする。「kanban」「カード」「work item」「Plane」「タスクを kanban に載せる」「未着手の一覧を取り込む」「いま進行中のカードを見せて」と言われたとき、作業に着手してカードの state を進めるとき、作業中のカードについてユーザーに確認を出すとき、複数のタスクに分けられる仕事をカードの親子で表すときに使う。repo に対応する Plane の project を引き、一覧・作成・更新・一括取り込みをスクリプトで行う。削除はしない。
---

# Plane の work item を読み書きする

`{SKILL_DIR}` は、この `SKILL.md` があるディレクトリの絶対パスを表す。
以下のコマンドを実行するときは、この値を実際のパスに置き換える。
すべてのスクリプトは JSON を stdout に出し、エラーを stderr に出す。exit 0 は成功、1 は該当なし、2 は前提条件エラー。

## Plane の使い方の決め事

### Plane 側で守られている制約

この skill は、人が Plane を次のように運用している前提で動く。

- kanban 用の workspace を 1 つに決め、すべての repo でその workspace を使う
- 1 つの repo に 1 つの project を対応させる。repo が使う workspace と project は repo の git の設定
  （`plane-kanban.workspaceSlug` と `plane-kanban.projectId`）に対であり、スクリプトはそこから引く
- state の名前は、project を作ったときに入る Backlog / Todo / In Progress / Done / Cancelled の 5 つと、
  `plane-kanban-setup` skill が足す Needs Input（確認待ちの work item を置く。group は started）のまま

### この skill が従う決め事

Plane 側の運用には課さないが、この skill が work item を扱うときに従うもの。

- work item を作る・更新するとき、いまのセッションを表す label `session:<日付>-<セッション id の先頭 8 桁>` を付ける。
  付けるのはスクリプトで、セッションごとの一覧はこの label で絞り込む
- 複数のタスクに分けられる仕事（Jira の epic に当たるもの）は、その仕事を親の work item にし、分けたタスクを sub work item にする。段数は制限しない
- In Progress の work item についてユーザーに確認（質問・承認・選んでもらうこと）を出すときは、先に Needs Input に動かす。
  返答を受けて作業を再開するときに In Progress に戻す
- work item・label・project を消さない。スクリプトに削除の経路は無い
- project をまたいだ一覧は作らない。見るのは常にいまの repo に対応する project だけ

## 操作

repo の作業ツリーの中で実行する（project を repo の git の設定から引くため）。
題名と本文はこの skill を使う側が決めて渡す。引数を省いてスクリプトに推測させない。

- いまのカードを見る: `{SKILL_DIR}/scripts/list-work-items.sh`。Done と Cancelled は出ない。
  `--state "In Progress"` で state を絞る、`--session` でいまのセッションが触ったものだけ、
  `--parent <id>` で sub work item だけ、`--all` で完了分も出す
- カードを作る: `{SKILL_DIR}/scripts/create-work-item.sh --name "題名" [--description-file 本文.txt] [--parent <親の id>] [--state Backlog]`。
  本文はプレーンテキストで、空行で段落を分ける。state を省くと Backlog に入る
- state を進める・戻す: `{SKILL_DIR}/scripts/update-work-item.sh <id> --state "In Progress"`。
  同じスクリプトで `--name`、`--parent`、`--description-file` も変えられる。
  更新すると、いまのセッションの label が足される（既存の label は残る）
- 確認を出す: `{SKILL_DIR}/scripts/update-work-item.sh <id> --state "Needs Input"` を実行してから確認を出し、
  再開するときに `--state "In Progress"` で戻す。返答で作業が終わるなら Done、やめるなら Cancelled に直接動かす
- タスクに分ける: 親の work item を作り、分けたタスクを `--parent <親の id>` で作る
- 一括で取り込む: 取り込み一覧の JSON を書き、`{SKILL_DIR}/scripts/import-work-items.sh <一覧.json>` を回す。
  書式はスクリプト冒頭のコメントにある。作った id を一覧に書き戻すので、途中で失敗しても
  再実行で作成済みを飛ばせる。親は一覧の中で先に並べる

セッション id は環境変数から取る（Claude Code は `CLAUDE_CODE_SESSION_ID`、Codex は `CODEX_THREAD_ID`）。
子 agent からスクリプトを呼ぶときは、親の id を `--session <id>` で渡す。
label を付けたくないときは `--no-session` を付ける。

## project が無いとき

スクリプトが exit 1 で「この repo に Plane の workspace と project が設定されていない」と返したら、
`plane-kanban-setup` skill でセットアップを進められることを案内する。始めるかどうかはユーザーが決める。

## 失敗したとき

- exit 2: 前提条件（Keychain の API key、`curl`、`jq`）が足りない。
  stderr に対処が出るので、その内容をそのまま伝え、`plane-kanban-setup` skill でセットアップを進められることを案内する。
  API key を自分で読み出して表示しない
- exit 1 で 429 が続いた: レート制限（API key 1 本あたり 60 回 / 分）。スクリプトは
  `X-RateLimit-Reset` まで待って 3 回まで再試行している。それでも続くなら、同じコマンドの先頭に `PLANE_RETRY_MAX=6` を付けて
  1 回だけ再実行する（スクリプトが制限の解ける時刻まで待つ）。再実行も失敗したら、内容を伝えて止まる
- 確認を出す前の Needs Input への移動が失敗した: 429 なら上の再実行を終えてから確認を出す。
  再実行も失敗したとき、または `state 'Needs Input' が project に無い` と返ったときは、確認はそのまま出し、
  state を動かせなかったことを添える。Needs Input が無いなら、`plane-kanban-setup` skill を実行し直すと足せることも添える
- それ以外の HTTP エラー: stderr にレスポンスの body が出る。内容を伝えて止まる。同じ呼び出しを繰り返さない
