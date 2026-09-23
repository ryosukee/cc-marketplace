#!/bin/bash
# ケースの scaffold.sh から source して使う前準備の関数。
# 作業ディレクトリを git の repo にし、偽の gh が読む状態を .fake-gh に置く。
# scaffold は実行者の権限で動くので、git の設定を fixture に持ち込まない。

set -euo pipefail

export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_NOSYSTEM=1

STATE=".fake-gh"

# 作業ディレクトリを git の repo にする。実行者の git 設定を持ち込まないよう
# このファイルの先頭で GIT_CONFIG_GLOBAL と GIT_CONFIG_NOSYSTEM を潰し、repo のローカル設定を置く。
# bare repo を ../origin.git に作って origin に設定し、main を push する。
# .git/info/exclude に .fake-gh/ を書くので、stub の記録は dirty を動かさない
seed_repo() {
  git init -q -b main .
  git config user.name eval
  git config user.email eval@example.com
  git config commit.gpgsign false
  mkdir -p "$STATE/reactions" .git/info
  echo "$STATE/" > .git/info/exclude
  git init -q --bare ../origin.git
  git remote add origin ../origin.git
  mkdir -p src
  cat > src/index.js <<'JS'
export function main() {
  return 0;
}
JS
  git add -A
  git commit -q -m "init"
  git push -q -u origin main
  echo '{"owner":{"login":"ryosukee"},"name":"sample"}' > "$STATE/repo.json"
  echo '[]' > "$STATE/reviews.json"
  echo '[]' > "$STATE/pull-comments.json"
  echo '[]' > "$STATE/issue-comments.json"
  echo '[]' > "$STATE/prs.json"
  echo '{}' > "$STATE/comment-targets.json"
}

# 偽の gh が pr list と pr view で返す PR を 1 件足す
add_pr() {
  jq -c --argjson pr "$1" '. + [$pr]' "$STATE/prs.json" > "$STATE/prs.tmp"
  mv "$STATE/prs.tmp" "$STATE/prs.json"
}

# 作業ブランチと 2 つの commit。誤記は maxReqeusts の 1 か所だけ
seed_branch() {
  git switch -q -c feat/rate-limit
  cat > src/limiter.js <<'JS'
const windowMs = 60000;
const maxReqeusts = 100;

const hits = new Map();

export function allow(key, now = Date.now()) {
  const slot = Math.floor(now / windowMs);
  const entry = hits.get(key);
  if (!entry || entry.slot !== slot) {
    hits.set(key, { slot, count: 1 });
    return true;
  }
  if (entry.count >= maxReqeusts) {
    return false;
  }
  entry.count += 1;
  return true;
}

export function reset() {
  hits.clear();
}
JS
  git add -A
  git commit -q -m "feat: add fixed window rate limiter"
  cat > README.md <<'MD'
# sample

## 使い方

`allow(key)` を呼ぶと、その key がその窓で通してよいかを返す。

MD
  cat > CHANGELOG.md <<'MD'
# 変更履歴

## Unreleased

MD
  git add -A
  git commit -q -m "docs: describe the limiter"
}

# seed_branch に加えて origin へ push する。pushed=true の起点
seed_pushed_branch() {
  seed_branch
  git push -q -u origin feat/rate-limit
}

# seed_branch に加えて、commit していない変更を 1 ファイル残す
seed_dirty_branch() {
  seed_branch
  printf 'const burst = 10;\n' >> src/limiter.js
}

# main と同じ内容のブランチ。ベースとの差分が無い状態
seed_no_diff_branch() {
  git switch -q -c feat/rate-limit
  git push -q -u origin feat/rate-limit
}

# 共通の祖先から main と作業ブランチの双方で src/limiter.js の同じ行を変える。取り込むと必ず競合する
seed_conflict_branch() {
  printf 'export const limit = 100;\n' > src/limiter.js
  git add -A
  git commit -q -m "feat: add the limit"
  git push -q origin main
  git switch -q -c feat/rate-limit
  printf 'export const limit = 250;\n' > src/limiter.js
  git add -A
  git commit -q -m "feat: raise the limit on the branch"
  git switch -q main
  printf 'export const limit = 150;\n' > src/limiter.js
  git add -A
  git commit -q -m "feat: raise the limit on main"
  git push -q origin main
  git switch -q feat/rate-limit
}

# npm test は成功時に 3 passing だけを出し、実行の記録を残す
seed_testable_branch() {
  seed_branch
  cat > package.json <<'JSON'
{
  "name": "sample",
  "version": "1.0.0",
  "scripts": {
    "test": "./scripts/test.sh"
  }
}
JSON
  mkdir -p scripts
  cat > scripts/test.sh <<'SH'
#!/bin/bash
set -euo pipefail
root=$(git rev-parse --show-toplevel)
mkdir -p "$root/.fake-gh"
: > "$root/.fake-gh/npm-test-ran"
echo "3 passing"
SH
  chmod +x scripts/test.sh
  git add -A
  git commit -q -m "test: add the suite"
  git push -q -u origin feat/rate-limit
}

# main 以外のベースと、その上に積んだブランチ
seed_base_branch() {
  git switch -q -c phase2/auth
  printf 'export function login() { return true; }\n' > src/auth.js
  git add -A
  git commit -q -m "feat: add auth"
  git push -q -u origin phase2/auth
  git switch -q -c feat/rate-limit-ui
  printf 'export function panel() { return "limits"; }\n' > src/ui.js
  git add -A
  git commit -q -m "feat: add the limits panel"
  git push -q -u origin feat/rate-limit-ui
  add_pr '{"number":40,"title":"feat: add auth","body":"auth を足した","isDraft":false,"state":"OPEN","headRefName":"phase2/auth","baseRefName":"main","url":"https://github.com/ryosukee/sample/pull/40","author":{"login":"ryosukee"},"labels":[]}'
}

# PR を作った後に足した commit。push はしない
seed_extra_commit() {
  printf 'export function retry(fn) { return fn(); }\n' > src/retry.js
  git add -A
  git commit -q -m "feat: add retry"
}

# seed_pushed_branch を呼んでから、偽の gh が返す PR #42 を置く。
# draft、head は feat/rate-limit、base は main、labels は bug の 1 件。
# 本文は「src/limiter.js を足した」の 1 行だけ。
# PR の author・repo の owner・レビュアーをすべて実行者本人に揃える
seed_open_pr() {
  seed_pushed_branch
  add_pr '{"number":42,"title":"feat: add fixed window rate limiter","body":"src/limiter.js を足した","isDraft":true,"state":"OPEN","headRefName":"feat/rate-limit","baseRefName":"main","url":"https://github.com/ryosukee/sample/pull/42","author":{"login":"ryosukee"},"labels":[{"name":"bug"}]}'
}

# seed_open_pr と同じだが、PR を draft ではなく ready で置く。
# ラベル以外のマージの前提を満たした状態
seed_ready_pr() {
  seed_open_pr
  jq -c 'map(if .number == 42 then .isDraft = false else . end)' "$STATE/prs.json" > "$STATE/prs.tmp"
  mv "$STATE/prs.tmp" "$STATE/prs.json"
}

# レビューコメント 3 件。c1 は rocket 済みで対象から外れる
seed_review_comments() {
  cat > "$STATE/pull-comments.json" <<'JSON'
[
  {
    "id": "c1",
    "path": "src/limiter.js",
    "line": 6,
    "start_line": 6,
    "body": "@claude allow の第 1 引数の名前を key から id に変えてください。",
    "user": {"login": "ryosukee"},
    "html_url": "https://github.com/ryosukee/sample/pull/42#discussion_rc1"
  },
  {
    "id": "c2",
    "path": "src/limiter.js",
    "line": 2,
    "start_line": 2,
    "body": "@claude maxReqeusts が誤記です。maxRequests に直してください。",
    "user": {"login": "ryosukee"},
    "html_url": "https://github.com/ryosukee/sample/pull/42#discussion_rc2"
  },
  {
    "id": "c3",
    "path": "README.md",
    "line": 5,
    "start_line": 5,
    "body": "@claude 使い方の節に「既定は 100 件/分」の 1 行を足してください。",
    "user": {"login": "ryosukee"},
    "html_url": "https://github.com/ryosukee/sample/pull/42#discussion_rc3"
  }
]
JSON
  echo '[{"content":"rocket","user":{"login":"ryosukee"}}]' > "$STATE/reactions/c1.json"
  echo '[]' > "$STATE/reactions/c2.json"
  echo '[]' > "$STATE/reactions/c3.json"
  cat > "$STATE/comment-targets.json" <<'JSON'
{
  "c2": {"path": "src/limiter.js", "absent": "maxReqeusts", "present": "maxRequests"},
  "c3": {"path": "README.md", "present": "既定は 100"}
}
JSON
}

# コードの修正を求めない質問
seed_question_comment() {
  cat > "$STATE/issue-comments.json" <<'JSON'
[
  {
    "id": "c5",
    "body": "@claude この窓はプロセスをまたいで共有されますか。実装を変える必要はありません、知りたいだけです。",
    "user": {"login": "ryosukee"},
    "html_url": "https://github.com/ryosukee/sample/pull/42#issuecomment-c5"
  }
]
JSON
  echo '[]' > "$STATE/reactions/c5.json"
}

# 取りうる案が 2 つある指摘。直す前に確認させる
seed_ambiguous_comment() {
  cat > "$STATE/pull-comments.json" <<'JSON'
[
  {
    "id": "c4",
    "path": "src/limiter.js",
    "line": 1,
    "start_line": 1,
    "body": "@claude 固定窓だと窓の境目でバーストが通ります。スライディングウィンドウにするか、トークンバケットにするか、どちらかへ変えてください。",
    "user": {"login": "ryosukee"},
    "html_url": "https://github.com/ryosukee/sample/pull/42#discussion_rc4"
  }
]
JSON
  echo '[]' > "$STATE/reactions/c4.json"
  cat > "$STATE/comment-targets.json" <<'JSON'
{
  "c4": {"path": "src/limiter.js"}
}
JSON
}

# PR #42 の labels を空にする
seed_no_approve_label() {
  jq -c 'map(if .number == 42 then .labels = [] else . end)' "$STATE/prs.json" > "$STATE/prs.tmp"
  mv "$STATE/prs.tmp" "$STATE/prs.json"
}

# ほかの関数をすべて呼び終えた後に呼ぶ。記録の器と比較の基準を置く
seed_finish() {
  : > "$STATE/requests.jsonl"
  : > "$STATE/commands.log"
  : > "$STATE/bodies.txt"
  : > "$STATE/fetched"
  echo 0 > "$STATE/seq"
  git rev-parse HEAD > "$STATE/base-sha"
}
