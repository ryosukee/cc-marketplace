#!/bin/bash
# ケースの scaffold.sh から source して使う前準備。cwd は eval の作業ディレクトリ。
# scaffold は子セッションの sandbox の外で実行者の権限で動くので、ここから eval のディレクトリを読める。
#
# 偽の curl は FAKE_CURL_STATE が無いとき git の作業ツリーの最上位の .fake-plane を、
# 偽の security は FAKE_KEYCHAIN_DIR が無いとき同じ場所の .fake-keychain を見る。
# 子セッションには環境変数を渡せないので、作業ディレクトリを git の repo にして、その 2 つをここで作る。

set -euo pipefail

# 実行者の git の設定（署名・hook・テンプレート）を fixture に持ち込まない。
# scaffold は実行者の権限で動くので、設定を隔離しないと環境ごとに結果が変わる
export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_NOSYSTEM=1

# git の repo にする。plane-kanban のスクリプトは cwd が git の作業ツリーの中であることを要求する
seed_git_repo() {
  git init -q .
  git -c user.name=eval -c user.email=eval@example.com -c commit.gpgsign=false \
    commit -q --allow-empty -m init
}

# Keychain の API key を置く。置かないと plane-kanban のスクリプトは exit 2 になる
seed_api_key() {
  mkdir -p .fake-keychain
  printf 'eval-api-key' > .fake-keychain/plane-kanban-api-key
}

# repo と Plane の project を対応づける git の設定
seed_project_config() {
  git config --local plane-kanban.workspaceSlug eval-ws
  git config --local plane-kanban.projectId p-eval
}

# 偽の Plane の初期状態。state は project を作ったときの 5 つに Needs Input を足したもの
seed_plane_state() {
  mkdir -p .fake-plane
  cat > .fake-plane/projects.json <<'JSON'
[{"id":"p-eval","name":"eval-repo","identifier":"EV"}]
JSON
  cat > .fake-plane/states.json <<'JSON'
[{"id":"s1","name":"Backlog","group":"backlog","sequence":15000},
 {"id":"s2","name":"Todo","group":"unstarted","sequence":25000},
 {"id":"s3","name":"In Progress","group":"started","sequence":35000},
 {"id":"s6","name":"Needs Input","group":"started","sequence":40000},
 {"id":"s4","name":"Done","group":"completed","sequence":45000},
 {"id":"s5","name":"Cancelled","group":"cancelled","sequence":55000}]
JSON
  echo '[]' > .fake-plane/labels.json
  echo '[]' > .fake-plane/items.json
  echo 3 > .fake-plane/seq-item
  # 呼び出しの記録。grader がこのファイルを読むので、1 度も呼ばれなくても空で置いておく
  : > .fake-plane/requests.log
}

# Needs Input がまだ無い project。0.2.0 より前に設定した repo を表す
seed_plane_state_without_needs_input() {
  seed_plane_state
  jq -c 'map(select(.name != "Needs Input"))' .fake-plane/states.json > .fake-plane/states.tmp
  mv .fake-plane/states.tmp .fake-plane/states.json
}

# work item を 3 件置く。w1 と w3 は In Progress、w2 は Todo
seed_work_items() {
  cat > .fake-plane/items.json <<'JSON'
[{"id":"w1","sequence_id":1,"name":"plane-kanban の evals のケースを作る","state":"s3","labels":[],"parent":null,"description_html":""},
 {"id":"w2","sequence_id":2,"name":"README の誤字を直す","state":"s2","labels":[],"parent":null,"description_html":""},
 {"id":"w3","sequence_id":3,"name":"notes の置き場を決める","state":"s3","labels":[],"parent":null,"description_html":""}]
JSON
}

# 設定済みの repo（Plane の project に繋がっていて、カードが 3 件ある）
seed_configured_repo() {
  seed_git_repo
  seed_api_key
  seed_project_config
  seed_plane_state
  seed_work_items
}

# 誤字のある README。着手する作業そのものが数手で終わるようにする
seed_readme_typo() {
  cat > README.md <<'MD'
# eval-repo

## Instalation

npm install して npm start する。
MD
}

# 作業ログの置き場。カードではなくファイルに書く依頼の対象
seed_notes_dir() {
  mkdir -p notes
  cat > notes/2026-09-17.md <<'MD'
# 2026-09-17

- CI の node の版を 24 に上げた
MD
}

# w3 を Needs Input に置いた状態。確認の返答を受けて再開する場面を作る
seed_work_items_waiting() {
  seed_work_items
  jq -c 'map(if .id == "w3" then .state = "s6" else . end)' .fake-plane/items.json > .fake-plane/items.tmp
  mv .fake-plane/items.tmp .fake-plane/items.json
}

# 偽の curl に 429 を返し続けさせる。rate limit の扱いを測るケースで使う
seed_always_429() {
  : > .fake-plane/429-always
}

# 引き継ぎ資料。タスクの一覧ではあるが kanban ではない
seed_handover() {
  mkdir -p .handover/todo
  cat > .handover/todo/2026-09-01-session.md <<'MD'
# セッション引き継ぎ資料 (2026-09-01)

## 復元タスク

| subject | description |
|---------|-------------|
| lint の警告を消す | `scripts/backup.sh` の shellcheck の警告 3 件 |
| docs の目次を直す | 章の順序が本文と合っていない |
MD
}

# shellcheck の警告が出るスクリプト
seed_shell_script() {
  mkdir -p scripts
  cat > scripts/backup.sh <<'SH'
#!/bin/bash
src=$1
dest=$2
cp -r $src $dest
echo "copied $src"
SH
  chmod +x scripts/backup.sh
}
