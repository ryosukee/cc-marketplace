# PR の更新

既存 PR に対してこのスキルが呼び出された場合の見直しフロー。
新しいコミットの追加、レビュー指摘への対応、body の手動編集など、PR が更新された後に実行する。

更新フローでは各アクションの結果を記録し、最後にまとめて報告する。

## 前提

ステップ2 で既存 PR が検出され、ユーザーが更新を選択した状態。
PR の現在の body と差分コメントは API で取得済み。

## ステップ0: PR 状態によるフロー分岐

PR の状態を確認する:

```bash
gh pr view <number> --json isDraft,state -q '{isDraft: .isDraft, state: .state}'
```

| 状態 | フロー |
|------|--------|
| draft | → 全体見直しフロー（ステップ1〜3） |
| open | → ユーザーに確認して分岐（下記参照） |

### open 中の場合

ユーザーに以下を確認する:

- 全体見直し: まだ誰もレビューしていない等、body を書き直してよい場合。draft と同じフロー（ステップ1〜3）に進む
- 差分コメントのみ: レビュー中で body は変えたくない場合。PR コメントで変更内容を説明する追記フロー（ステップ4〜5）に進む

## 全体見直しフロー（draft / open で全体見直しを選択）

### ステップ1: body の見直し

まず現在の body を API で取得する。ユーザーが手動で書き換えている可能性があるため、ローカルのキャッシュや以前の生成結果を使わない。

```bash
gh pr view <number> --json body -q .body
```

新規作成と同じ気持ちで body 全体を確認する。
現在の差分（`git diff <base>...HEAD --stat` + コミットログ）と取得した body を比較し、以下を確認する:

- 概要が現在の変更内容を正確に反映しているか
- How to check の項目が現在の差分に対して妥当か（不要な項目、追加すべき項目）
- How to check のエビデンス（grep 結果等）が古くなっていないか
- Pre-open チェックリストの内容が適切か

更新が必要な場合は `gh pr edit <number> --body "..."` で body を更新する。
body の生成ルールは [generate-body.md](generate-body.md) に従う。

→ 記録: body を更新したか、主な変更点は何か

### ステップ2: 差分コメントの見直し

既存の差分コメント（行指定・ファイル）を API で取得し、現在の差分と照合する:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments --jq '.[] | {id, path, body, subject_type, line, start_line}'
```

確認すること:

- コメントが指している行やファイルがまだ差分に存在するか
- コメントの内容が現在のコードと整合しているか
- 新しい差分に対してコメントを追加すべき箇所がないか

#### 古くなったコメントの処理

コメントは削除しない。代わりに:

1. スレッドに「この変更により古くなった」旨の返信を投稿
2. スレッドを resolve する

```bash
# 1. スレッドに返信
gh api repos/{owner}/{repo}/pulls/{number}/comments/{comment_id}/replies \
  --method POST \
  -f body="このコメントは後続のコミットにより古くなったため resolve します。"

# 2. スレッドを resolve（GraphQL）
gh api graphql -f query='
  mutation {
    resolveReviewThread(input: { threadId: "<thread_node_id>" }) {
      thread { isResolved }
    }
  }
'
```

thread ID の取得:

```bash
gh api graphql -f query='
  query {
    repository(owner: "{owner}", name: "{repo}") {
      pullRequest(number: {number}) {
        reviewThreads(first: 50) {
          nodes {
            id
            isResolved
            comments(first: 1) {
              nodes { id databaseId path body }
            }
          }
        }
      }
    }
  }
'
```

コメントの `databaseId` と REST API の `comment_id` を照合して、対象スレッドの `thread.id` を特定する。

→ 記録: resolve したコメント数と対象ファイル

#### 新しいコメントの追加

新しい差分に対するコメントは [post-line-comments.md](post-line-comments.md) のルールに従って追加する。

→ 記録: 追加したコメント数と対象ファイル

### ステップ3: 結果の報告

ステップ1〜2 で記録した内容をまとめて報告する。このステップを省略しない。

報告フォーマット:

```
**PR #XX 更新報告:**
- body 更新: あり/なし（変更点の要約）
- コメント追加: N件（対象ファイル）
- コメント resolve: N件（対象ファイル）
- PR URL
```

## 追記フロー（open でレビュー中の場合）

前提が変わって diff を大きく組み直し、既存のレビュースレッドの大半が失効する規模なら、
追記フローで積まずに PR の作り直し（close + 経緯を本文に書いた後継）を提案する。
レビュアーは旧状態もコメント内容も覚えていない前提で経緯を書く。

### ステップ4: PR コメントで変更内容を説明

body は変更しない。代わりに PR にコメントを投稿し、今回のコミットで何を変更したかを説明する。

```bash
gh pr comment <number> --body "$(cat <<'EOF'
## {コミットの要約}

{このコミットで何をしたか、なぜしたかを簡潔に}

- {変更点1}
- {変更点2}
EOF
)"
```

書き方:

- コミット単位ではなく、今回プッシュした変更全体をまとめる
- レビュアーが「前回見た時点からどう変わったか」を把握できる内容にする
- レビュー指摘への対応であれば、どの指摘に対応したかを明記する

→ 記録: コメントを投稿したか、内容の要約

### ステップ5: 結果の報告

ステップ4 の記録をまとめて報告する。このステップを省略しない。

報告フォーマット:

```
**PR #XX 追記報告:**
- PR コメント: 投稿済み（内容の要約）
- PR URL
```
