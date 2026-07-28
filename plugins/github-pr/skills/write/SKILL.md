---
name: write
description: GitHub の Pull Request を作成・更新する前に必ず読む。「PR を作成」「PR 作って」「PR 出して」「PR 更新して」「PR 本文直して」と言われたとき、および PR の説明文を書き始める時点が発動点。既存 PR があれば更新へ分岐する。規模でテンプレートを選び、本文・タイトル・行指定コメントまでを生成する。gh CLI を優先し、利用不可なら MCP へフォールバックする。
---

# PR 作成スキル

GitHub Pull Request の作成を自動化するスキル。gh CLI を優先し、利用不可時は MCP ツールにフォールバックする。

## ワークフロー

### ステップ0: 現在の状態を分析（並列実行）

以下を並列で実行:

- `git status` — コミットされていない変更を確認
- `git branch --show-current` — 現在のブランチ名
- `git log main..HEAD --oneline` — PR に含まれるコミット一覧
- `git diff main...HEAD --stat` — 変更ファイルの概要

### ステップ1: ブランチ & プッシュ & ベースブランチ確認

- `main` ブランチの場合 → 新しいブランチを作成してプッシュ
- 未プッシュのコミットがある場合 → `git push -u origin <branch>`
- プッシュ済みの場合 → 新しいコミットがあればプッシュ

#### ベースブランチの確認

連続的な PR（Phase 1 → 2 → 3 等）では、前の PR のブランチから派生していることが多い。PR 作成前にベースブランチを確認し、ユーザーに提示する。

- `main` 以外がベースの場合 → ユーザーにベースブランチを確認（「ベースブランチは `phase2/...` で合っていますか？」）
- ベースが他の PR のブランチの場合 → その PR が先にマージされる必要がある旨を本文の WARNING に反映する（ステップ3 参照）

### ステップ2: 既存 PR の確認 → フロー分岐

同じ head ブランチの既存 PR を検索:

```bash
gh pr list --head <branch>
```

- PR なし → **作成フロー**（ステップ3〜6）に進む
- PR あり → URL を報告し、更新するか確認。更新する場合は [update-pr.md](references/update-pr.md) の**更新フロー**（ステップ1〜3）に進む。以降の作成フローは実行しない

### ステップ3: PR 本文の生成

[generate-body.md](references/generate-body.md) に従い、規模判定・テンプレート選択・タイトル生成・本文生成を行う。

### ステップ4: PR 作成

```bash
gh pr create --title "<タイトル>" --body "$(cat <<'EOF'
<生成された本文>
EOF
)" --draft
```

gh CLI が利用できない場合は MCP にフォールバック:

```
mcp__github__create_pull_request(
  owner: "{org}",
  repo: "{repo}",
  title: "<生成されたタイトル>",
  head: "<ブランチ>",
  base: "main",
  body: "<生成された本文>",
  draft: <true/false>
)
```

### ステップ5: 行指定コメント

[post-line-comments.md](references/post-line-comments.md) に従い、PR の差分に行指定コメントを追加する。
ショート版テンプレートの場合は行指定コメント不要。

### ステップ6: 結果の報告

以下を表示:

- PR URL
- PR 番号
- タイトル
- ブランチ: `<head> → <base>`
- 差分コメント数（行指定 + ファイル）

## パラメータ

| パラメータ | 説明 | デフォルト |
|-----------|------|-----------|
| title | PR タイトル（日本語） | コミットから自動生成 |
| base | ベースブランチ | main |
| draft | ドラフト PR として作成 | true |

## 呼び出し例

- `PRを作成して` → 自動分析、タイトル/本文を生成して draft PR 作成
- `PRを作って、draftじゃなくていい` → draft: false で作成
- `「ユーザー分析を追加」でPR作って` → カスタムタイトルで PR 作成
- `PR更新して` → 既存 PR の body と差分コメントを見直し・更新
- `PR本文直して` → 既存 PR の body を現在の差分に合わせて更新

## エラーハンドリング

| エラー | 対処 |
|--------|------|
| gh 未認証 | `gh auth login` を提案 |
| gh CLI 利用不可 | MCP ツールにフォールバック |
| main との差分なし | 警告を表示して中止 |
| コミットされていない変更あり | コミットまたは stash を提案 |
| PR が既に存在 | URL を報告し、更新を提案 |
| Review API 失敗 | 行指定コメントをスキップし、PR URL のみ報告 |
