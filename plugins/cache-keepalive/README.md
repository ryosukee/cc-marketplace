# cache-keepalive

prompt cache (extended cache, TTL 1h) の expire 前に軽量プロンプトを発火し、
全 context の cache miss による input トークン急騰を防ぐ。

対応 CodingAgent: Claude Code only

## 構成

| 要素 | 役割 |
| --- | --- |
| plugin monitor `cache-keepalive-watch` | セッション開始時に監視スクリプトを起動する。`when` は `always` |
| `scripts/watch-idle.sh` | セッション JSONL の mtime を監視し、閾値を超えたときだけ stdout に 1 行出す |
| `scripts/report-status.sh` | 起動時刻・JSONL の検出状態・最後に発火した時刻を JSON で返す |
| `scripts/stop-watch.sh` | 監視プロセスを止める |
| cache-keepalive skill | 状態の報告と停止。起動は持たない |

監視スクリプトの stdout の 1 行が Claude への通知になる。Claude が OK と応答したターンで
prompt cache の期限が延びる。ユーザーが作業している間はスクリプトが sleep するだけで、
会話ターンは発生しない。

## データの置き場

| データ | 場所 |
| --- | --- |
| 起動・JSONL 検出・発火・停止の記録 | `${CLAUDE_PLUGIN_DATA}/keepalive-{session-id}.log` |
| 監視プロセスの pid | `${CLAUDE_PLUGIN_DATA}/keepalive-{session-id}.pid` |
| 前提を満たせなかった記録 (session id 等) | `${CLAUDE_PLUGIN_DATA}/keepalive-error.log` |

`${CLAUDE_PLUGIN_DATA}` は plugin 更新をまたいで残る永続ディレクトリで、
実体は `~/.claude/plugins/data/cache-keepalive-cc-tools/`。
30 日を過ぎた記録は、監視スクリプトが起動するたびに削除する。
`/plugin uninstall` は既定でこのディレクトリも削除する。残したい場合は `--keep-data` を付ける。

## 依存

- `bash`: 監視スクリプトの実行
- `jq`: `report-status.sh` の JSON 組み立て。無い場合は exit 2 で「jq が見つからない」と報告する
- `stat -f`: BSD 系 (macOS) の書式を使う

## setup

plugin を install すると plugin monitor が有効になる。ユーザーの操作は要らない。
セッションを開始した時点で Claude Code 本体が監視スクリプトを起動する。

監視スクリプトの起動は、セッション JSONL が作られるより先になる。
JSONL はセッションに最初の入力が入るまで作られないため、
スクリプトは見つかるまで 60 秒間隔で探し、発火せずに待つ。待ちに上限は無く、
見つからないことをエラーとして扱わない (最初の入力より前は cache が無く、発火の出番も無い)。
起動時と検出時にログへ 1 行ずつ残し、status が待機中 (`waiting-jsonl`) を区別できる。

閾値は既定 3000 秒 (50 分)。変えるときは `CACHE_KEEPALIVE_THRESHOLD_SECONDS` を
Claude Code の `settings.json` の `env` に置く。

## 未 setup 時・起動しないときの挙動

Claude Code 本体は、次のどれかに当たると monitor を起動せず、そのことを通知しない。

- 対話 CLI セッションでない (`claude -p` の単発実行)
- workspace trust が未承認
- plugin が無効、または `pluginMonitors` が無効
- Monitor ツールが使えない host

起動しなかったことは `/cache-keepalive status` で分かる。ログが 1 行も無ければ `never-started` を返す。
このとき `last_error` が空なら Claude Code 本体が monitor を起動していない。値が入っていれば、
起動したうえで監視スクリプトが前提 (session id 等) を満たせずに落ちている。
JSONL の生成を待っている間は `waiting-jsonl` を返すので、未起動と待機は区別できる。
`never-started` の状態でスクリプトを手で起動して代用しない。起動しなかった事実が記録から消える。

## 更新

```bash
claude plugins marketplace update cc-tools
claude plugins update cache-keepalive@cc-tools
```

plugin monitor はセッション開始時に起動するので、更新後は新しいセッションで反映される。

## 削除

```bash
claude plugins uninstall cache-keepalive@cc-tools
```
