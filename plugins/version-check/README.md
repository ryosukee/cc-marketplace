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

## scripts

plugin 内部スクリプト。skill と hook が呼ぶ。外部公開 I/F ではない。

| スクリプト | 概要 | 呼び出し元 |
| --- | --- | --- |
| `scripts/check-update.sh` | 前回記録版との差分チェック (JSON 出力) | check skill |
| `scripts/record-version.sh` | 現在バージョンを既読として記録 | check / skip skill, hook |
| `scripts/lib/resolve-last-version.sh` | last-version の解決 + 旧 cache 移行 (source 用) | check-update / hook |
| `scripts/hooks/session-start.sh` | SessionStart で更新検知・通知 | hooks.json |

状態: `internal/version/last-version` (既読バージョン 1 行、gitignore)。
