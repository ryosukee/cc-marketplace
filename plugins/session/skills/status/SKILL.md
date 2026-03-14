---
description: 現在のセッション情報を表示する
disable-model-invocation: false
---

# セッション情報

現在のセッションの pane ↔ session ID マッピングとアクティブセッション一覧を表示する。

## ワークフロー

### ステップ1: アクティブセッション一覧

Bash で以下を実行:
```
ls -la ${CLAUDE_SKILL_DIR}/../../internal/sessions/*.json 2>/dev/null && cat ${CLAUDE_SKILL_DIR}/../../internal/sessions/*.json 2>/dev/null | jq -s '.'
```

結果を整形して表示する。

## TODO

- API スクリプト (`scripts/api/get-current-session-id.sh`, `scripts/api/list-active-sessions.sh`) の実装
- 外部ツール（statusline, tmux-client）が plugin のデータを参照する仕組みの設計・実装
- pane 終了時に紐付けを切る仕組み（tmux hook 等）の追加
