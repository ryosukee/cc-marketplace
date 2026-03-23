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

## save-changelog-summary

changelog 要約をバージョン単位で保存する。

```
echo "要約テキスト" | save-changelog-summary.sh <version> [previous_version]
```

### 出力

成功 (exit 0):

```json
{"saved": true, "version": "2.1.74", "path": "..."}
```

引数エラー (exit 1): stderr にエラー JSON を出力。

## list-changelog-summaries

保存済み changelog 要約の一覧を返す。

```
list-changelog-summaries.sh [limit]
```

### 出力

成功 (exit 0):

```json
[
  {"version": "2.1.74", "previous_version": "2.1.73", "created_at": "2026-03-24T12:00:00Z"},
  {"version": "2.1.73", "previous_version": "2.1.72", "created_at": "2026-03-23T10:00:00Z"}
]
```

0 件でも空配列 `[]` を返す。

## get-changelog-summary

指定バージョンの changelog 要約を返す。

```
get-changelog-summary.sh <version>
```

### 出力

成功 (exit 0):

```json
{
  "version": "2.1.74",
  "previous_version": "2.1.73",
  "created_at": "2026-03-24T12:00:00Z",
  "summary": "主な変更点:\n- ..."
}
```

該当なし (exit 1): stderr にエラー JSON を出力。
