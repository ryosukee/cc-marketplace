#!/bin/bash
# plane-kanban のスクリプトを、偽の curl（tests/fake-curl/curl）で通すテスト。ネットワークは使わない
#
# 使い方: tests/run.sh
# exit 0 = 全件成功、1 = 失敗あり

set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
S="$PLUGIN_ROOT/scripts"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

export PATH="$PLUGIN_ROOT/tests/fake-curl:$PATH"
export PLANE_KANBAN_DATA_DIR="$TMP/data"
export FAKE_CURL_STATE="$TMP/state"
export FAKE_KEYCHAIN_DIR="$TMP/keychain"
export CLAUDE_CODE_SESSION_ID="abcdef12-3456-7890-abcd-ef1234567890"
unset PLANE_SESSION_ID CLAUDE_SESSION_ID CODEX_THREAD_ID CLAUDE_PLUGIN_ROOT CLAUDE_PLUGIN_DATA PLANE_API_KEY PLANE_WORKSPACE_SLUG
mkdir -p "$FAKE_KEYCHAIN_DIR"
printf 'test-key' > "$FAKE_KEYCHAIN_DIR/plane-kanban-api-key"
printf 'ws' > "$FAKE_KEYCHAIN_DIR/plane-kanban-workspace-slug"
today=$(date +%Y-%m-%d)

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
(FAKE_KEYCHAIN_DIR="$TMP/empty-keychain" PLANE_API_KEY=x PLANE_WORKSPACE_SLUG=x "$S/resolve-project.sh" cc-marketplace) >/dev/null 2>&1
assert_eq 2 $? "Keychain に無ければ exit 2"

# 2. project が無ければ exit 1
"$S/resolve-project.sh" nosuch >/dev/null 2>&1
assert_eq 1 $? "project 無しは exit 1"
set -e

# 3. init-project.sh が作り、対応を保存する
out=$("$S/init-project.sh" --identifier CCM --name cc-marketplace)
assert_eq "true" "$(jq -r .created <<<"$out")" "init が作る"
assert_eq "p1" "$(jq -r .id <<<"$out")" "作った project の id"
assert_eq "p1" "$(jq -r '."ws/cc-marketplace".id' "$PLANE_KANBAN_DATA_DIR/projects.json")" "対応を保存"

# 4. 2 回目の init は作らない
out=$("$S/init-project.sh" --identifier CCM --name cc-marketplace)
assert_eq "false" "$(jq -r .created <<<"$out")" "2 回目の init は作らない"

# 5. resolve は保存した対応から返し、API を呼ばない
before=$(grep -c "GET /projects/$" "$FAKE_CURL_STATE/requests.log" || true)
out=$("$S/resolve-project.sh" cc-marketplace)
after=$(grep -c "GET /projects/$" "$FAKE_CURL_STATE/requests.log" || true)
assert_eq "p1" "$(jq -r .id <<<"$out")" "resolve の id"
assert_eq "$before" "$after" "resolve は保存済みなら API を呼ばない"

# 6. create: session の label が付き、本文が HTML になり、既定の state に入る
printf 'first <line>\nsecond\n\nthird & more\n' > "$TMP/desc.txt"
out=$("$S/create-work-item.sh" --name "A" --project p1 --description-file "$TMP/desc.txt")
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
out=$("$S/update-work-item.sh" w1 --project p1 --state Done)
assert_eq "Done" "$(jq -r .state <<<"$out")" "update の state"
assert_eq "1" "$(jq '.labels | length' <<<"$out")" "label が重複しない"

# 9. list: 既定は Done を除き、--all で含み、--session で絞る
out=$("$S/list-work-items.sh" --project p1)
assert_eq "w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "既定は Done を除く"
out=$("$S/list-work-items.sh" --project p1 --all)
assert_eq "w1,w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--all"
out=$("$S/list-work-items.sh" --project p1 --all --session)
assert_eq "w1" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--session で絞る"
out=$("$S/list-work-items.sh" --project p1 --all --state Done --state "In Progress")
assert_eq "w1,w2" "$(jq -r 'map(.id) | join(",")' <<<"$out")" "--state 複数"

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
