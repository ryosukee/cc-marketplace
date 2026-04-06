---
name: setup
description: チーム開発ワークフローをセットアップ・更新する。新規は対話的に全生成、既存は差分を検出して不足分を補完する。
---

# ワークフローセットアップ

対象プロジェクトの `.claude/` の状態を検出し、ワークフロー構成 (agents/skills/rules) を新規生成または差分補完する。

## 意図

初回セットアップと増分アップデートは本質的に同じ操作。プロジェクトの現状とテンプレートを比較し、不足分を埋める。`.claude/` が空なら全部生成するし、一部揃っていれば足りない部分だけ提案する。

## 前提

- テンプレート: `${CLAUDE_SKILL_DIR}/../../templates/`
- 参照元リポジトリ registry: `${CLAUDE_SKILL_DIR}/../../registry.json`

## ワークフロー

### ステップ 1: プロジェクト状態の検出

1. cwd を確認し、プロジェクト名を特定する
2. `.claude/` の現在の構成をスキャンする:
   - `.claude/agents/*.md` の一覧
   - `.claude/skills/*/SKILL.md` (または `skill.md`) の一覧
   - `.claude/rules/*.md` の一覧
   - `CLAUDE.md` の有無と内容
   - `.claude/settings.local.json` の有無
3. テンプレートの agents/skills/rules と突き合わせて、状態を判定する:

| 状態 | 判定基準 | 動作 |
|---|---|---|
| 新規 | agents/ と skills/ が両方ない | フルセットアップ (ステップ 2 → 5) |
| 部分的 | agents/ か skills/ の一部がある | 差分補完 (ステップ 2 をスキップ可能 → 3 → 5) |
| 完備 | テンプレートの agents/skills が全て揃っている | テンプレートとの差分チェック (ステップ 3 → 5) |

### ステップ 2: tech stack のヒアリング（新規時のみ）

「新規」状態の場合、tech stack を質問する。「部分的」「完備」の場合は既存ファイルと CLAUDE.md から tech stack を推定し、推定結果をユーザーに確認する。

AskUserQuestion で以下を確認する。4 問ずつに分けて質問する。

1 回目 (4 問):

| 質問 | 選択肢例 | placeholder |
|---|---|---|
| メイン言語は? | Go / TypeScript / Python / Rust | `{{language}}` |
| フロントエンドフレームワークは? | React / Vue / なし | `{{frontend_framework}}` |
| ビルドコマンドは? | `go build ./...` / `npm run build` / `cargo build` | `{{build_command}}` |
| lint コマンドは? | `golangci-lint run` / `npx eslint .` / `cargo clippy` | `{{lint_command}}` |

2 回目 (4 問):

| 質問 | 選択肢例 | placeholder |
|---|---|---|
| テストフレームワークは? | Ginkgo / Vitest / pytest / 標準 (go test) | `{{test_framework}}` |
| テストコマンドは? | `go test ./...` / `npx vitest` / `pytest` | `{{test_command}}` |
| E2E フレームワークは? | Playwright / Cypress / なし | `{{e2e_framework}}` |
| E2E テストコマンドは? (E2E ありの場合) | `npx playwright test` / `npx cypress run` | `{{e2e_test_command}}` |

3 回目 (4 問):

| 質問 | 選択肢例 | 用途 |
|---|---|---|
| アーキテクチャパターンは? | レイヤード / クリーンアーキテクチャ / DDD / 特になし | rules 生成の参考 |
| テスト方針は? | ユニット重視 / E2E 重視 / バランス型 | test-plan/test-impl の調整 |
| UI 変更時のスクリーンショット確認は? | あり (PC + スマホ) / あり (PC のみ) / なし | `{{screenshot_viewports}}` |
| レビュー用サーバーの起動コマンドは? | 自由入力 | `{{review_server_start_command}}` |

### ステップ 3: 差分の検出

テンプレートとプロジェクトの `.claude/` を比較し、差分を 3 カテゴリで整理する:

#### A. 不足ファイル

テンプレートにあるがプロジェクトにないファイル。新規生成の対象。

#### B. 内容差分

両方にあるがテンプレートと内容が異なるファイル。セクション単位で差分を分析:
- テンプレート側に新しいセクション・手順がある → 追加を提案
- テンプレート側の「意図」セクションがプロジェクトにない → 追加を提案
- allowedTools の差分 → 報告
- プロジェクト固有のカスタマイズ → そのまま維持（上書きしない）

#### C. プロジェクト独自ファイル

プロジェクトにあるがテンプレートにないファイル。報告のみ（削除しない）。

参照元リポジトリの取得（rules 生成の参考用）:
- registry.json から参照元リポジトリの `.claude/rules/` の取得を試みる（ghq ローカル → GitHub API の順）
- 取得失敗、またはリポジトリに `.claude/agents/` + `.claude/skills/` が揃っていない場合はスキップ
- スキップした場合はテンプレートの rules と一般的なベストプラクティスのみでスケルトンを生成する

### ステップ 4: 差分レポートと確認

差分を以下の形式で表示する:

```markdown
## ワークフロー構成の状態

### 生成予定（不足ファイル）
- .claude/agents/impl.md — コード実装 agent
- .claude/agents/test-plan.md — テスト計画 agent
- ...

### 更新提案（テンプレートとの差分）
- .claude/agents/code-review.md — 「意図」セクションの追加
- ...

### 現状維持（プロジェクト独自）
- .claude/agents/custom-agent.md
- ...
```

ユーザーに確認を取る。各項目を個別に承認/スキップ可能にする。

### ステップ 5: ファイルの生成・更新

承認された項目について、以下の順序で処理する:

1. **agents/ の生成・更新**: テンプレートを読み、placeholder を埋めて配置する。既存ファイルの更新は差分セクションのみ追加し、プロジェクト固有のカスタマイズは維持する

2. **skills/ の生成・更新**: 同上

3. **rules/ の生成・更新**:
   - メタルール (rule-authoring.md, claudemd-authoring.md) がなければコピー
   - アーキテクチャ rules がなければスケルトンを生成。参照元リポジトリが取得できていればその構成を参考にする

4. **CLAUDE.md の生成・更新**: なければテンプレートから生成。既にあればワークフローセクションのみ追記（既存セクションは維持）

5. **settings.local.json の提案**: なければパーミッション雛形を提案。tech stack に応じたコマンドで生成する

### ステップ 6: 完了報告

生成・更新したファイル一覧をツリー形式で表示し、次のステップを案内する:

- `/impl-plan {機能概要}` で実装プランを作成
- `/team-implement plans/{名前}.md` でパイプライン実行
- `.claude/rules/` のアーキテクチャルールは骨格のみ生成しているので、プロジェクトの成長に合わせて育てる
- `/workflow:registry add {owner/repo}` でこのプロジェクトを参照元リポジトリに登録すると、`/workflow:sync` で改善が双方向に伝播する

## placeholder 一覧

| placeholder | 説明 | 例 (Go + React) |
|---|---|---|
| `{{language}}` | メイン言語 | `Go` |
| `{{frontend_framework}}` | フロントエンド FW | `React` |
| `{{build_command}}` | ビルドコマンド | `go build ./... && cd frontend && npm run build` |
| `{{lint_command}}` | lint コマンド | `golangci-lint run && cd frontend && npx eslint .` |
| `{{test_framework}}` | テスト FW | `Ginkgo v2` |
| `{{test_command}}` | テストコマンド | `go test ./... -v` |
| `{{e2e_framework}}` | E2E FW | `Playwright` |
| `{{e2e_test_command}}` | E2E テストコマンド | `cd tests/e2e && npx playwright test` |
| `{{screenshot_viewports}}` | スクリーンショットサイズ | `PC (1280x800) とスマホ (375x812, mobile, touch)` |
| `{{review_server_start_command}}` | レビュー用サーバー起動 | `go build -o /tmp/app ./cmd/main && /tmp/app -port 8235 &` |
| `{{review_server_stop_command}}` | レビュー用サーバー停止 | `lsof -ti:8235 \| xargs kill` |
| `{{test_directories}}` | テストディレクトリ | `internal/handler/*_test.go, tests/e2e/specs/` |
| `{{project_name}}` | プロジェクト名 | `feedmarks` |
| `{{tech_stack_table}}` | 技術スタック表 | (生成) |
| `{{directory_structure}}` | ディレクトリ構成 | (生成) |
| `{{test_layers_table}}` | テストレイヤー表 | (生成) |
| `{{test_plan_output_format}}` | テスト計画出力形式 | (生成) |

## テンプレート展開時の注意

- placeholder がテンプレート内に残っている場合（例: E2E なしなのに `{{e2e_test_command}}` がある）、その行またはセクションを削除する
- registry の参照元リポジトリは「こういうレベルの具体性で書く」という参考にする。丸コピーしない
- test-plan の `{{test_layers_table}}` と `{{test_plan_output_format}}` はユーザーの tech stack から生成する。参照元リポジトリの例を参考に
- code-review の動作確認セクションは、スクリーンショット確認「なし」の場合は削除する
- 生成した rules ファイルには適切な `paths` frontmatter を付ける（例: `**/*.go` for Go rules）
- 既存ファイルの更新時は、プロジェクト固有のカスタマイズ（tech stack 固有の記述、追加ルール等）を上書きしない
