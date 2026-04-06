---
name: team-implement
description: 実装プランを元に subagent パイプラインで実装→テスト→レビュー→実行を自動で回す。
---

# 自動実装パイプライン

実装プランを入力に、subagent を順番に起動して実装からテスト実行まで自動で回す。

## 意図

チーム開発ワークフローの中核。impl-plan で作成したプランを入力に、実装→テスト設計→テスト実装→レビュー→テスト実行→メタレビューのパイプラインを自動で回す。各フェーズは専門 agent が担当し、レビューで差し戻しがあれば自動でリトライする。

## 引数

実装プランの参照（以下のいずれか）:
- `plans/` 内のファイルパス
- 実装する機能の要件（自然言語）

## パイプライン

```
impl → test-plan → test-impl → (並列) code-review + test-review → exec-test → meta-review
                                        ↓ 差し戻し
                                      impl に戻る (最大 3 回)
```

## subagent

`.claude/agents/` に定義された agent を `subagent_type` で spawn する。全て `mode: auto`。

| agent | 役割 | 入力 | 出力 |
|---|---|---|---|
| `impl` | コード実装 | プラン全文 | 変更ファイル一覧 + ビルド結果 |
| `test-plan` | テスト設計 | プラン + 変更ファイル | テスト計画（コードは書かない） |
| `test-impl` | テスト実装 | テスト計画 + 変更内容 | 追加した spec ファイル一覧 |
| `code-review` | コードレビュー | プラン + 変更ファイル | 承認 / 修正項目 / 差し戻し |
| `test-review` | テストレビュー | テスト計画 + spec ファイル | 承認 / 修正項目 |
| `exec-test` | テスト実行 | 対象ディレクトリ | PASS/FAIL 件数 + 詳細 |
| `meta-review` | メタレビュー | 変更後のコードベース全体 | ルール・プランの不整合レポート + 自動修正 |

## 実行フロー

### Phase 1: 準備

1. 引数がファイルパスなら読み込む。自然言語なら要件を整理
2. ユーザーにパーミッションモード（auto/default）を確認
3. TaskCreate でタスクリスト作成

### Phase 2: impl

1. impl subagent を spawn
2. 完了を待つ。ビルド結果を確認

### Phase 3: test-plan + test-impl

1. test-plan subagent を spawn
2. テスト計画を受け取る
3. test-impl subagent を spawn（テスト計画を入力）
4. 完了を待つ

### Phase 4: code-review + test-review（並列）

1. code-review と test-review を同時に spawn
2. 両方の結果を待つ
3. 差し戻しの場合:
   - code-review の修正項目 → impl subagent を再 spawn して修正
   - test-review の修正項目 → test-impl subagent を再 spawn して修正
   - 修正後、再レビュー（最大 3 回）
4. 両方承認 → Phase 5 へ

### Phase 5: exec-test

1. exec-test subagent を spawn
2. 全 PASS → Phase 6 へ
3. FAIL → impl に戻して修正 → 再テスト（最大 2 回）

### Phase 6: meta-review

1. meta-review subagent を spawn
2. 自動修正があれば適用済みの状態で報告を受け取る
3. 提案（要判断）があればユーザーに伝える

### Phase 7: コミット・push

事前にユーザーから明示的な許可がない場合は確認を取る。

1. 変更をコミット
2. {{build_command}} でビルド確認
3. push
4. ユーザーに最終報告

## 注意事項

- 本体（Team Lead）はコードを書かない。subagent の起動・結果確認・調整に集中する
- 全ステップを必ず spawn すること。Team Lead がステップを省略してはならない。省略が適切かどうかは各 agent 自身が判断する
- 各 subagent には CLAUDE.md と rules を読むよう指示する
- subagent 間でファイルを同時編集しない（Phase 4 の並列レビューは Read only なので OK）
- レビューの差し戻しは最大 3 回。超えたらユーザーに判断を仰ぐ
- run_in_background は使わない（結果を待ってから次に進む）
