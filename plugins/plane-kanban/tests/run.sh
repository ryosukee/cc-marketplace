#!/bin/bash
# plane-kanban のスクリプトを、偽の curl（tests/fake-curl/curl）で通すテスト。ネットワークは使わない
#
# 使い方: tests/run.sh
# exit 0 = 全件成功、1 = 失敗あり

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
S="$PLUGIN_ROOT/skills/plane-kanban/scripts"
SETUP="$PLUGIN_ROOT/skills/plane-kanban-setup/scripts"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

export PATH="$PLUGIN_ROOT/tests/fake-curl:$PATH"
export FAKE_CURL_STATE="$TMP/state"
export FAKE_KEYCHAIN_DIR="$TMP/keychain"
export CLAUDE_CODE_SESSION_ID="abcdef12-3456-7890-abcd-ef1234567890"
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1
unset PLANE_SESSION_ID CLAUDE_SESSION_ID CODEX_THREAD_ID CLAUDE_PLUGIN_ROOT CLAUDE_PLUGIN_DATA PLANE_API_KEY
mkdir -p "$FAKE_KEYCHAIN_DIR"
printf 'test-key' > "$FAKE_KEYCHAIN_DIR/plane-kanban-api-key"
today=$(date +%Y-%m-%d)

# スクリプトは、テスト用の git repo（名前は cc-marketplace）の作業ツリーの中で実行する。
# 実行した repo の git の設定を書き換えないため
REPO="$TMP/cc-marketplace"
git init -q "$REPO"
git -C "$REPO" -c user.name=test -c user.email=test@example.com commit -q --allow-empty -m init
cd "$REPO"

fail=0
pass=0
assert_eq() {
  if [ "$1" = "$2" ]; then
    pass=$((pass + 1))
  else
    fail=$((fail + 1))
    echo "NG: $3 (expected [$1], got [$2])" >&2
  fi
}

# 1. Keychain に API key が無ければ exit 2（環境変数に入れても使わない）
set +e
(FAKE_KEYCHAIN_DIR="$TMP/empty-keychain" PLANE_API_KEY=x "$SETUP/resolve-project.sh") >/dev/null 2>&1
assert_eq 2 $? "Keychain に API key が無ければ exit 2"

# 2. repo に workspace と project が設定されていなければ exit 1
"$SETUP/resolve-project.sh" >/dev/null 2>&1
assert_eq 1 $? "未設定なら exit 1"
"$S/list-work-items.sh" >/dev/null 2>&1
assert_eq 1 $? "plane-kanban の skill のスクリプトも未設定なら exit 1"

# 2a. check-setup は未設定を false と null で返し、exit 1
out=$("$SETUP/check-setup.sh")
assert_eq 1 $? "check-setup は未設定なら exit 1"
assert_eq "true true null null false" "$(jq -r '"\(.api_key) \(.git_worktree) \(.workspace) \(.project) \(.ready)"' <<<"$out")" "check-setup の未設定の出力"

# 2b. git の作業ツリーの外では init は exit 2
mkdir -p "$TMP/not-a-repo"
(cd "$TMP/not-a-repo" && "$SETUP/init-project.sh" --workspace ws --identifier CCM) >/dev/null 2>&1
assert_eq 2 $? "git の作業ツリーの外なら init は exit 2"

# 2c. 未設定の repo で --workspace が無ければ init は exit 2
"$SETUP/init-project.sh" --identifier CCM >/dev/null 2>&1
assert_eq 2 $? "未設定で --workspace が無ければ exit 2"

# 2d. 同じ name の project が無く、--identifier も無ければ init は exit 2
"$SETUP/init-project.sh" --workspace ws >/dev/null 2>&1
assert_eq 2 $? "作るのに --identifier が無ければ exit 2"
set -e

# 3. init-project.sh が repo の名前で project を作り、workspace の slug と id を repo の git の設定に対で書く
out=$("$SETUP/init-project.sh" --workspace ws --identifier CCM)
assert_eq "true" "$(jq -r .created <<<"$out")" "init が作る"
assert_eq "cc-marketplace" "$(jq -r .name <<<"$out")" "name は repo のディレクトリ名"
assert_eq "p1" "$(jq -r .id <<<"$out")" "作った project の id"
assert_eq "ws p1" "$(git config --local --get plane-kanban.workspaceSlug) $(git config --local --get plane-kanban.projectId)" "slug と id を git の設定に書く"
assert_eq "ws" "$(tail -1 "$FAKE_CURL_STATE/workspaces.log")" "API は --workspace の slug を使う"

# 3a. init は Needs Input の state（group started）を足し、In Progress と Done の間に並べる
assert_eq "Needs Input true" "$(jq -r '"\(.needs_input_state.name) \(.needs_input_state.created)"' <<<"$out")" "init が Needs Input を足す"
assert_eq "started" "$(jq -r '.[] | select(.name=="Needs Input") | .group' "$FAKE_CURL_STATE/states.json")" "Needs Input の group は started"
assert_eq "true" "$(jq '(map(select(.name=="Needs Input")) | first | .sequence) as $n | (map(select(.name=="In Progress")) | first | .sequence) < $n and $n < (map(select(.name=="Done")) | first | .sequence)' "$FAKE_CURL_STATE/states.json")" "Needs Input は In Progress と Done の間"

# 4. 設定済みなら init は project も state も作らない。別の workspace を指定すると exit 2
before=$(grep -c "^POST /projects/ " "$FAKE_CURL_STATE/requests.log" || true)
before_state=$(grep -c "^POST /projects/p1/states/ " "$FAKE_CURL_STATE/requests.log" || true)
out=$("$SETUP/init-project.sh")
after=$(grep -c "^POST /projects/ " "$FAKE_CURL_STATE/requests.log" || true)
after_state=$(grep -c "^POST /projects/p1/states/ " "$FAKE_CURL_STATE/requests.log" || true)
assert_eq "false" "$(jq -r .created <<<"$out")" "設定済みなら init は作らない"
assert_eq "$before" "$after" "設定済みなら POST しない"
assert_eq "false $before_state" "$(jq -r .needs_input_state.created <<<"$out") $after_state" "Needs Input があれば作らない"
set +e
"$SETUP/init-project.sh" --workspace other >/dev/null 2>&1
assert_eq 2 $? "設定済みの repo で別の workspace を指定すると exit 2"
set -e

# 4a. Needs Input が無い設定済みの project（0.2.0 より前に設定した repo）でも、init を実行し直すと足す
jq -c 'map(select(.name != "Needs Input"))' "$FAKE_CURL_STATE/states.json" > "$TMP/states.json" && mv "$TMP/states.json" "$FAKE_CURL_STATE/states.json"
out=$("$SETUP/init-project.sh")
assert_eq "false true" "$(jq -r '"\(.created) \(.needs_input_state.created)"' <<<"$out")" "設定済みの repo でも Needs Input を足す"

# 5. resolve は git の設定の slug と id で project を引く
out=$("$SETUP/resolve-project.sh")
assert_eq "ws p1 cc-marketplace CCM" "$(jq -r '"\(.workspace) \(.id) \(.name) \(.identifier)"' <<<"$out")" "resolve の workspace・id・name・identifier"

# 5-1. check-setup は設定済みの repo で ready を返し、exit 0
out=$("$SETUP/check-setup.sh")
assert_eq "ws p1 true" "$(jq -r '"\(.workspace) \(.project) \(.ready)"' <<<"$out")" "check-setup の設定済みの出力"
set +e
(FAKE_KEYCHAIN_DIR="$TMP/empty-keychain" "$SETUP/check-setup.sh") >/dev/null 2>&1
assert_eq 1 $? "check-setup は API key が無ければ exit 1"
set -e

# 5a. スクリプトは自分の位置から lib を読み、CLAUDE_PLUGIN_ROOT が別の場所を指していても動く
out=$(CLAUDE_PLUGIN_ROOT="$TMP/elsewhere" "$SETUP/resolve-project.sh")
assert_eq "p1" "$(jq -r .id <<<"$out")" "setup のスクリプトは CLAUDE_PLUGIN_ROOT を見ない"
out=$(CLAUDE_PLUGIN_ROOT="$TMP/elsewhere" "$S/list-work-items.sh")
assert_eq "array" "$(jq -r type <<<"$out")" "plane-kanban の skill のスクリプトは CLAUDE_PLUGIN_ROOT を見ない"

# 5b. worktree の中でも同じ設定を読み、repo の名前は元の repo のもの
git worktree add -q "$TMP/cc-marketplace-wt" -b wt
out=$(cd "$TMP/cc-marketplace-wt" && "$SETUP/resolve-project.sh")
assert_eq "p1" "$(jq -r .id <<<"$out")" "worktree でも同じ id"

# 5c. 設定の無い clone で init すると、同じ name の既存 project を使う
git clone -q "$REPO" "$TMP/clone/cc-marketplace"
out=$(cd "$TMP/clone/cc-marketplace" && "$SETUP/init-project.sh" --workspace ws)
assert_eq "false p1 false" "$(jq -r '"\(.created) \(.id) \(.needs_input_state.created)"' <<<"$out")" "clone では既存の project と Needs Input を使う"
assert_eq "p1" "$(git -C "$TMP/clone/cc-marketplace" config --local --get plane-kanban.projectId)" "clone の git の設定に書く"

# 5d. 設定された id の project が Plane に無ければ resolve は exit 1
git -C "$TMP/clone/cc-marketplace" config --local plane-kanban.projectId nosuch
set +e
(cd "$TMP/clone/cc-marketplace" && "$SETUP/resolve-project.sh") >/dev/null 2>&1
assert_eq 1 $? "設定された project が無ければ exit 1"
set -e

# 6. create: --project を省くと git の設定の project に作る。session の label が付き、本文が HTML になり、既定の state に入る
printf 'first <line>\nsecond\n\nthird & more\n' > "$TMP/desc.txt"
out=$("$S/create-work-item.sh" --name "A" --description-file "$TMP/desc.txt")
assert_eq "1" "$(grep -c "^POST /projects/p1/work-items/ " "$FAKE_CURL_STATE/requests.log")" "git の設定の project に作る"
assert_eq "w1" "$(jq -r .id <<<"$out")" "create の id"
assert_eq "Backlog" "$(jq -r .state <<<"$out")" "既定の state"
assert_eq "session:${today}-abcdef12" "$(jq -r '.labels[0]' <<<"$out")" "session の label"
assert_eq '<p>first &lt;line&gt;<br>second</p><p>third &amp; more</p>' \
  "$(jq -r '.[] | select(.id=="w1") | .description_html' "$FAKE_CURL_STATE/items.json")" "本文の HTML 変換"

# 7. create: --state と --no-session
out=$("$S/create-work-item.sh" --name "B" --project p1 --state "In Progress" --no-session)
assert_eq "In Progress" "$(jq -r .state <<<"$out")" "--state"
assert_eq "0" "$(jq '.labels | length' <<<"$out")" "--no-session"

# 8. update: state を変え、session の label は残る（重複しない）
# 偽の curl は work item 1 件の GET で label をオブジェクトに展開し、PATCH に id 以外の label が来たら 400 を返す
out=$("$S/update-work-item.sh" w1 --project p1 --state Done)
assert_eq "Done" "$(jq -r .state <<<"$out")" "update の state"
assert_eq "1" "$(jq '.labels | length' <<<"$out")" "label が重複しない"
assert_eq "session:${today}-abcdef12" "$(jq -r '.labels[0]' <<<"$out")" "update の出力は label の名前"
assert_eq "true" "$(jq '.[] | select(.id=="w1") | .labels | all(type == "string")' "$FAKE_CURL_STATE/items.json")" "update は label の id だけを送る"

# 9. list: 既定は Done を除き、--all で含み、--session で絞る
out=$("$S/list-work-items.sh" --project p1)
assert_eq "w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "既定は Done を除く"
out=$("$S/list-work-items.sh" --project p1 --all)
assert_eq "w1,w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--all"
out=$("$S/list-work-items.sh" --project p1 --all --session)
assert_eq "w1" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--session で絞る"
out=$("$S/list-work-items.sh" --project p1 --all --state Done --state "In Progress")
assert_eq "w1,w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--state 複数"

# 9a. 確認を出すときに Needs Input へ動かし、既定の一覧にも出る。返答を受けたら In Progress に戻す
out=$("$S/update-work-item.sh" w2 --project p1 --state "Needs Input")
assert_eq "Needs Input" "$(jq -r .state <<<"$out")" "Needs Input へ動かす"
out=$("$S/list-work-items.sh" --project p1)
assert_eq "w2 Needs Input" "$(jq -r '.[] | "\(.id) \(.state)"' <<<"$out")" "Needs Input は既定の一覧に出る"
out=$("$S/update-work-item.sh" w2 --project p1 --state "In Progress")
assert_eq "In Progress" "$(jq -r .state <<<"$out")" "In Progress に戻す"

# 10. import: 親を先に作り、子の parent に入る。id を書き戻し、再実行は飛ばす
cat > "$TMP/manifest.json" <<'JSON'
{"items": [
  {"key": "epic", "name": "Epic", "description": "束ね", "parent_key": null, "id": null},
  {"key": "t1", "name": "Task 1", "description": "one\n\ntwo", "parent_key": "epic", "state": "Todo", "id": null}
]}
JSON
out=$("$S/import-work-items.sh" "$TMP/manifest.json" --project p1)
assert_eq "2" "$(jq -r .created <<<"$out")" "import が 2 件作る"
epic_id=$(jq -r '.items[0].id' "$TMP/manifest.json")
assert_eq "w3" "$epic_id" "id の書き戻し"
assert_eq "$epic_id" "$(jq -r '.[] | select(.id=="w4") | .parent' "$FAKE_CURL_STATE/items.json")" "子の parent"
assert_eq "s2" "$(jq -r '.[] | select(.id=="w4") | .state' "$FAKE_CURL_STATE/items.json")" "子の state"
out=$("$S/import-work-items.sh" "$TMP/manifest.json" --project p1)
assert_eq "0" "$(jq -r .created <<<"$out")" "再実行は作らない"
assert_eq "2" "$(jq -r .skipped <<<"$out")" "再実行は飛ばす"

# 11. import: 親が後ろにあると止まる
cat > "$TMP/bad.json" <<'JSON'
{"items": [
  {"key": "child", "name": "Child", "parent_key": "later", "id": null},
  {"key": "later", "name": "Later", "id": null}
]}
JSON
set +e
"$S/import-work-items.sh" "$TMP/bad.json" --project p1 >/dev/null 2>&1
assert_eq 1 $? "親が後ろなら exit 1"
set -e

# 12. 429 が 1 回返っても待って成功する
touch "$FAKE_CURL_STATE/429-once"
out=$("$S/list-work-items.sh" --project p1 --all 2>/dev/null)
assert_eq "4" "$(jq 'length' <<<"$out")" "429 のあと再試行して成功"

# 13. ensure-session-label は既存を再利用する
out=$("$S/ensure-session-label.sh" --project p1)
assert_eq "l1" "$(jq -r .id <<<"$out")" "session の label を再利用"

echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
