# version-check

Claude Code のバージョン追跡・更新検知。

## 動作

SessionStart hook は、既読バージョンの記録が無い初回だけ現在のバージョンを記録する。
以後は既読バージョンと比較し、更新を検知したら通知する。更新検知時には記録を進めない。
check skill で changelog を取得・要約表示した後、または skip skill で通知をスキップしたときに、現在のバージョンを既読として記録する。

## 依存

- `jq`: check skill の更新チェック
- `gh` CLI: changelog の取得。無い場合はバージョン情報だけを表示し、changelog の取得をスキップする

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
