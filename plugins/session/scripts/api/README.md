# session plugin API

## get-session-by-pane

pane ID からセッション情報を取得する。

```
get-session-by-pane.sh [PANE_ID]
```

- 引数省略時は `$TMUX_PANE` を使用

### 出力

成功 (exit 0):

```json
{
  "sessionId": "abc-123",
  "paneId": "%5",
  "cwd": "/path/to/dir",
  "startedAt": "2026-03-15T10:00:00.000Z"
}
```

該当なし (exit 1):

```json
{"error": "no_session", "paneId": "%5"}
```

前提条件エラー (exit 2):

```json
{"error": "no_pane_id"}
```

## list-sessions

アクティブセッション一覧を取得する。

```
list-sessions.sh
```

### 出力

成功 (exit 0):

```json
{
  "sessions": [
    {
      "sessionId": "abc-123",
      "paneId": "%5",
      "cwd": "/path/to/dir",
      "startedAt": "2026-03-15T10:00:00.000Z"
    }
  ]
}
```

セッションなしの場合も exit 0 で空配列を返す。
