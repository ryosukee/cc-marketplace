---
name: check
description: Claude Code のバージョン更新チェックと changelog 表示。"version-check:check"、"アプデ確認"、"changelog check" 等で発動。
---

# Claude Code バージョンチェック

Claude Code のバージョン更新を検知し、changelog を要約表示する。

SessionStart hook の `systemMessage` でバージョン更新を通知し、ユーザーがこの skill を手動実行する流れ。

重要: このスキルはメインセッションでのみ実行する。Agent ツールで起動されたサブエージェント、チームエージェント、または `--agent` フラグで起動されたカスタムエージェントでは、このスキル全体をスキップすること。

## ワークフロー

### ステップ 1: バージョンチェック

Bash で以下を実行:
```
bash ${CLAUDE_SKILL_DIR}/references/check-update-wrapper.sh
```

出力される JSON を確認する:
- `first_run: true` の場合 → ステップ 3（バージョン記録）のみ実行して終了
- `has_update: false` の場合 → 「最新バージョンです」と表示して終了
- `has_update: true` の場合 → ステップ 2 へ進む

### ステップ 2: changelog 取得・要約表示

2a. 自前 changelog 取得

Bash で以下を実行:
```
bash ${CLAUDE_SKILL_DIR}/references/changelog-fetch.sh {last_version} {current_version}
```

2b. /release-notes の参照

組み込みの `/release-notes` コマンドの内容も参照する。直近のリリースノートから該当バージョン範囲の情報を抽出する。

2c. 統合要約

2a と 2b の出力を以下のルールで日本語にわかりやすく要約する。

要約ルール:
- 公式 changelog・コミュニティ changelog・diff・release-notes を統合する
- 各ソースで重複する内容はまとめる
- diff セクションでは実質的な変更のみ抽出する。以下はノイズなので無視:
    - バージョン番号の更新だけ（例: `2.1.66` → `2.1.68`）
    - パスやタイムスタンプの変更（例: `/tmp/claude-history-xxx`）
    - ファイル名/ブロック名のリネームだけ（例: `c31a51ef-3` → `c31a51ef-4`）
- diff から読み取れる実質的な変更を自然な日本語で説明する
- Metadata セクション（バンドルサイズ、コード行数、プロンプトトークン等）は表示不要
- リンク URL は省略してよい

要約はバージョンごとに分けて生成する。例えば v2.1.70 → v2.1.74 の場合、v2.1.71, v2.1.72, v2.1.73, v2.1.74 それぞれの要約を作る。changelog データがないバージョンは「変更情報なし」として扱う。

表示フォーマット（全体サマリー + バージョン別）:

```
## Claude Code アップデート
vX.X.X → vY.Y.Y

### vA.B.C
主な変更点:
- 変更1の説明

プロンプト/内部変更:
- diff から読み取れた変更の説明

### vA.B.D
主な変更点:
- 変更1の説明

CLI surface 変更:
- 追加/削除された環境変数、コマンド、モデル等
```

各バージョンのセクション（主な変更点、プロンプト/内部変更、CLI surface 変更）は該当する内容がある場合のみ表示する。

2d. 要約の保存

表示した要約をバージョンごとに保存する。各バージョンについて以下を実行:

```
echo '{そのバージョンの要約テキスト}' | bash ${CLAUDE_SKILL_DIR}/references/save-summary-wrapper.sh {version} {previous_version}
```

例えば v2.1.71, v2.1.72 の 2 バージョンがある場合、2 回実行する。要約テキストには表示フォーマットのうちそのバージョンのセクション部分を渡す。

要約の表示・保存後、ステップ 3 を実行する。

### ステップ 3: バージョン記録

Bash で以下を実行してバージョンを記録する:
```
bash ${CLAUDE_SKILL_DIR}/references/record-version.sh {current_version}
```

## エラーハンドリング

| エラー | 原因 | 解決方法 |
|---|---|---|
| claude --version が失敗 | Claude Code が PATH にない | スキップして通常応答 |
| gh CLI が未インストール | changelog 取得不可 | バージョン情報のみ表示し changelog 取得はスキップ |
| GitHub API レート制限 | 短時間に多数リクエスト | エラーメッセージを表示して続行 |

## 依存関係

- gh CLI: changelog/diff の取得に必要（なくてもバージョン情報の表示は可能）
