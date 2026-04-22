# session

tmux pane ID を使った Claude Code セッション追跡。

## 動作

SessionStart / SessionEnd hook で pane ID とセッション ID の紐付けを `internal/sessions/` に JSON で記録する。

## skill

- status — 現在の pane ↔ session ID マッピングとアクティブセッション一覧を表示

## API

| スクリプト | 概要 |
| --- | --- |
| `get-session-by-pane.sh` | pane ID からセッション情報を取得 (JSON) |
| `list-sessions.sh` | アクティブセッション一覧を取得 (JSON) |

Exit codes: 0=成功, 1=該当なし, 2=前提条件エラー
