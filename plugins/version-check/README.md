# version-check

Claude Code のバージョン追跡・更新検知。

## 動作

SessionStart hook で現在のバージョンを記録し、前回記録版と比較して更新を検知する。
更新がある場合は changelog の取得・要約保存を行い、セッション開始時に通知する。

## skill

| skill | 概要 |
| --- | --- |
| check | バージョン更新チェックと changelog 表示 |
| skip | バージョン更新通知をスキップ（既読化） |

## API

| スクリプト | 概要 |
| --- | --- |
| `get-version.sh` | 現在のバージョン取得 |
| `check-update.sh` | 前回記録版との差分チェック |
| `save-changelog-summary.sh` | changelog 要約の永続化 |
| `list-changelog-summaries.sh` | 保存済み changelog 一覧 |
| `get-changelog-summary.sh` | 指定版の changelog 取得 |
