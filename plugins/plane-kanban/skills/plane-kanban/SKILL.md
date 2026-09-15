---
name: plane-kanban
user-invocable: true
description: Plane（kanban）の work item を読み書きする。「kanban」「カード」「work item」「Plane」「タスクを kanban に載せる」「未着手の一覧を取り込む」「いま進行中のカードを見せて」と言われたとき、作業に着手してカードの state を進めるとき、セッションを跨ぐ仕事をカードに束ねるときに使う。repo に対応する Plane の project を引き、一覧・作成・更新・一括取り込みをスクリプトで行う。削除はしない。
---

# Plane の work item を読み書きする

この SKILL.md の所在から二階層上を plugin root とする。スクリプトは plugin root の `scripts/` にある。
すべてのスクリプトは JSON を stdout に出し、エラーを stderr に出す。exit 0 は成功、1 は該当なし、2 は前提条件エラー。

## 前提

macOS 限定。Plane の Personal Access Token は macOS の Keychain に入っていることが要る
（service 名は `plane-kanban-api-key`）。スクリプトが `security` コマンドで読む。環境変数では渡さない。
GUI にログインしていて login keychain が開いているときだけ読める。
workspace の slug は秘密ではないので環境変数 `PLANE_WORKSPACE_SLUG` から取る。
どちらかが無いときはスクリプトが exit 2 で止まり、対処を stderr に出す。その内容をそのまま伝え、設定を促す。
API key を自分で読み出して表示しない。値の発行と置き方の手順は plugin の README にある。

repo と Plane の project は 1 対 1 で、project の name は repo のディレクトリ名と同じにする。
スクリプトは name で project を引き、引いた id を保存して次回から使う。

## project が無いとき

`scripts/resolve-project.sh` が exit 1 で「project が無い」と返したら、ユーザーに次を案内する。

- この repo に対応する project が Plane の workspace に無い
- 作るなら `scripts/init-project.sh --identifier <接頭辞>` で作れる。接頭辞は work item の番号の頭に付く短い大文字（例: `CCM`）
- 作るかどうかと接頭辞はユーザーが決める。案内だけして、自動では作らない

## セッションの label

work item を作る・更新するとき、スクリプトはいまのセッションを表す label
`session:<日付>-<セッション id の先頭 8 桁>` を付ける。セッション id は環境変数から取る
（Claude Code は `CLAUDE_CODE_SESSION_ID`、Codex は `CODEX_THREAD_ID`）。
子 agent からスクリプトを呼ぶときは、親の id を `--session <id>` で渡す。
label を付けたくないときは `--no-session` を付ける。

## 操作

repo の作業ツリーの中で実行する（project を repo のディレクトリ名から引くため）。

- いまのカードを見る: `scripts/list-work-items.sh`。Done と Cancelled は出ない。
  `--state "In Progress"` で state を絞る、`--session` でいまのセッションが触ったものだけ、
  `--parent <id>` で sub work item だけ、`--all` で完了分も出す
- カードを作る: `scripts/create-work-item.sh --name "題名" [--description-file 本文.txt] [--parent <親の id>] [--state Backlog]`。
  本文はプレーンテキストで、空行で段落を分ける。state を省くと Backlog に入る
- state を進める・戻す: `scripts/update-work-item.sh <id> --state "In Progress"`。
  同じスクリプトで `--name`、`--parent`、`--description-file` も変えられる。
  更新すると、いまのセッションの label が足される（既存の label は残る）
- 束ねる: 複数セッションにまたがる仕事は、束ね自体を 1 枚の work item にし、
  その下の作業を `--parent <束ねの id>` で sub work item にする。段数に制限は設けない
- 一括で取り込む: 取り込み一覧の JSON を書き、`scripts/import-work-items.sh <一覧.json>` を回す。
  書式はスクリプト冒頭のコメントにある。作った id を一覧に書き戻すので、途中で失敗しても
  再実行で作成済みを飛ばせる。親は一覧の中で先に並べる

state の名前は project の既定の 5 つ（Backlog / Todo / In Progress / Done / Cancelled）。

## しないこと

- work item・label・project を消さない。スクリプトに削除の経路は無い
- 一覧の絞り込みは取得後に行う。Plane の API に label・state で絞る query parameter は無い
- 引数を省いてスクリプトに推測させない。題名と本文はこの skill を使う側が決めて渡す

## 失敗したとき

- exit 2: 前提条件（環境変数・curl・jq）が無い。stderr の内容を伝え、設定を促す
- exit 1 で 429 が続いた: レート制限（API key 1 本あたり 60 回 / 分）。スクリプトは
  `X-RateLimit-Reset` まで待って 3 回まで再試行している。それでも続くなら 1 分待ってから再実行する
- それ以外の HTTP エラー: stderr にレスポンスの body が出る。内容を伝えて止まる。同じ呼び出しを繰り返さない
