# version-check

Claude Code のバージョン追跡・更新検知。

## 動作

SessionStart hook で現在のバージョンを記録し、前回記録版と比較して更新を検知する。
更新がある場合はセッション開始時に通知し、check skill で changelog を取得・要約表示する。

## skill

| skill | 概要 |
| --- | --- |
| check | バージョン更新チェックと changelog 表示 |
| skip | バージョン更新通知をスキップ（既読化） |

## API

| スクリプト | 概要 |
| --- | --- |
| `check-update.sh` | 前回記録版との差分チェック |
| `record-version.sh` | 現在バージョンを既読として記録 |
