# version-check plugin API

## get-version

現在の Claude Code バージョンを取得する。

```
get-version.sh
```

### 出力

成功 (exit 0):

```json
{"current_version": "2.1.74"}
```

取得失敗 (exit 1): stderr にエラー JSON を出力。

## check-update

前回記録したバージョンと比較して更新有無をチェックする。

```
check-update.sh
```

### 出力

成功 (exit 0):

```json
{
  "has_update": true,
  "current_version": "2.1.74",
  "last_version": "2.1.70",
  "first_run": false
}
```

- `has_update`: バージョンが変わっていれば `true`
- `first_run`: 過去にバージョンを記録したことがなければ `true`（旧キャッシュからのマイグレーションも失敗した場合）
- バージョン取得失敗時は exit 1
