---
name: check
description: Claude Code のバージョン更新チェックと changelog 表示。"version-check:check"、"アプデ確認"、"changelog check" 等で発動。
---

# Claude Code バージョンチェック

Claude Code のバージョン更新を検知し、changelog を要約表示する。

**補足**: SessionStart hook が additionalContext に `{"trigger":"version-check:check"}` を注入することで、セッション開始時に自動発動する構成になっている。

**重要: このスキルはメインセッションでのみ実行する。Agent ツールで起動されたサブエージェント、チームエージェント、または `--agent` フラグで起動されたカスタムエージェントでは、このスキル全体をスキップすること。**

## ワークフロー

### ステップ1: バージョンチェック

Bash で以下を実行:
```
bash ${CLAUDE_SKILL_DIR}/references/check-update-wrapper.sh
```

出力される JSON を確認する:
- `first_run: true` の場合 → ステップ4（バージョン記録）のみ実行して終了
- `has_update: false` の場合 → 終了し、通常の応答に進む
- `has_update: true` の場合 → ステップ2 へ進む

### ステップ2: ユーザーへの確認

AskUserQuestion で確認する:

- 質問: 「Claude Code が v{last_version} → v{current_version} にアップデートされています。changelog を取得し、その要約を表示しますか？」
- 選択肢:
  - 「要約して表示して」→ ステップ3 へ進み、完了後ステップ4 を実行
  - 「後で確認する」→ バージョン記録せずに終了（次回セッションで再度通知される）
  - 「今回の changelog は確認しない」→ ステップ4（バージョン記録）のみ実行して終了

**AskUserQuestion が使えない環境（非対話的実行など）の場合は、「あとで確認する」と同じ扱いにする。**

### ステップ3: changelog 取得・表示

ユーザーが「表示する」を選択した場合:

**3a. 自前 changelog 取得**

Bash で以下を実行:
```
bash ${CLAUDE_SKILL_DIR}/references/changelog-fetch.sh {last_version} {current_version}
```

**3b. /release-notes の参照**

組み込みの `/release-notes` コマンドの内容も参照する。直近のリリースノートから該当バージョン範囲の情報を抽出する。

**3c. 統合要約**

3a と 3b の出力を以下のルールで日本語にわかりやすく要約して表示する:
- 公式 changelog・コミュニティ changelog・diff・release-notes を統合する
- 各ソースで重複する内容はまとめる
- diff セクションでは**実質的な変更**のみ抽出する。以下はノイズなので無視:
  - バージョン番号の更新だけ（例: `2.1.66` → `2.1.68`）
  - パスやタイムスタンプの変更（例: `/tmp/claude-history-xxx`）
  - ファイル名/ブロック名のリネームだけ（例: `c31a51ef-3` → `c31a51ef-4`）
- diff から読み取れる実質的な変更を自然な日本語で説明する
- Metadata セクション（バンドルサイズ、コード行数、プロンプトトークン等）は表示不要
- リンク URL は省略してよい

表示フォーマット:
```
## Claude Code アップデート
vX.X.X → vY.Y.Y にアップデートされました。

**主な変更点:**
- 変更1の説明
- 変更2の説明

**プロンプト/内部変更:**
- diff から読み取れた変更の説明

**CLI surface 変更:**
- 追加/削除された環境変数、コマンド、モデル等
```

### ステップ4: バージョン記録

ステップ2 で「表示する」または「スキップ」を選択した場合にのみ実行する。「あとで確認する」の場合はこのステップを実行しない。

Bash で以下を実行してバージョンを記録する:
```
bash ${CLAUDE_SKILL_DIR}/references/record-version.sh {current_version}
```

## エラーハンドリング

| エラー | 原因 | 解決方法 |
|-------|------|---------|
| claude --version が失敗 | Claude Code が PATH にない | スキップして通常応答 |
| gh CLI が未インストール | changelog 取得不可 | バージョン情報のみ表示し changelog 取得はスキップ |
| GitHub API レート制限 | 短時間に多数リクエスト | エラーメッセージを表示して続行 |

## 依存関係

- **gh CLI**: changelog/diff の取得に必要（なくてもバージョン情報の表示は可能）
