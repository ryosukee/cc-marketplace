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

2c. ソース別要約

2a と 2b の出力を、ソースの信頼度に応じて分離した形式で日本語にわかりやすく要約する。

ソースごとの処理ルール:

| ソース | 信頼度 | 処理 |
|--------|--------|------|
| 公式 changelog (anthropics/claude-code) | 高 | 一次情報。そのまま要約する |
| /release-notes | 高 | 一次情報。公式 changelog と重複する内容はまとめてよい |
| コミュニティ Highlights | 中 | 公式の要約・補足。公式 changelog に含まれない情報のみ抽出する。公式と重複する内容は省略 |
| コミュニティ Flags | 中 | 事実ベース（diff 由来）。追加・削除された flag をそのまま列挙する |
| コミュニティ CLI surface | 中 | 事実ベース（diff 由来）。追加・削除された環境変数・config key をそのまま列挙する |
| コミュニティ System prompt changes | 低 | diff からの推測的解釈。誤認リスクあり。記載する場合は「〜模様」「〜と読み取れる」等の表現で断定を避ける |
| コミュニティ Other prompt changes | 低 | 同上 |
| 変更 diff | 中 | 生データ。要約には使わず、参考として保存のみ |
| コミュニティ Metadata | 参考 | バンドルサイズ・トークン数等の統計。変更の規模感として 1 行で表示 |

diff セクションのノイズフィルタ（信頼度「中」「低」のソース全般に適用）:
- バージョン番号の更新だけ（例: `2.1.66` → `2.1.68`）→ 無視
- パスやタイムスタンプの変更（例: `/tmp/claude-history-xxx`）→ 無視
- ファイル名/ブロック名のリネームだけ（例: `c31a51ef-3` → `c31a51ef-4`）→ 無視

要約はバージョンごとに分けて生成する。例えば v2.1.70 → v2.1.74 の場合、v2.1.71, v2.1.72, v2.1.73, v2.1.74 それぞれの要約を作る。changelog データがないバージョンは「変更情報なし」として扱う。

表示フォーマット（全体ヘッダー + バージョン別 + ソース別セクション）:

```
## Claude Code アップデート
vX.X.X → vY.Y.Y

### vA.B.C

[公式] 変更点:
- 新機能や改善の説明
- バグ修正の説明

[コミュニティ分析] Flags 変更:
- added: flag_name — 推測される用途
- removed: flag_name

[コミュニティ分析] CLI surface 変更:
- 追加された環境変数・config key

[コミュニティ分析] プロンプト変更（解釈注意）:
- 〜が追加された模様
- 〜が削除されたと読み取れる

[参考] 規模: バンドル +X kB (+Y%), プロンプトトークン +N (+M%)
```

各セクションは該当する内容がある場合のみ表示する。リンク URL は省略してよい。

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
bash ${CLAUDE_SKILL_DIR}/../../scripts/api/record-version.sh {current_version}
```

## エラーハンドリング

| エラー | 原因 | 解決方法 |
|---|---|---|
| claude --version が失敗 | Claude Code が PATH にない | スキップして通常応答 |
| gh CLI が未インストール | changelog 取得不可 | バージョン情報のみ表示し changelog 取得はスキップ |
| GitHub API レート制限 | 短時間に多数リクエスト | エラーメッセージを表示して続行 |

## 依存関係

- gh CLI: changelog/diff の取得に必要（なくてもバージョン情報の表示は可能）
