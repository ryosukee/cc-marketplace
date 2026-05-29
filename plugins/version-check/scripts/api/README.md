# version-check plugin API

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

## record-version

現在のバージョンを既読として記録する（`internal/version/last-version` に書き込む）。

```
record-version.sh <version>
```

引数の version を記録する。次回 SessionStart 時の差分判定に使われる。
