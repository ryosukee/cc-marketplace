# cache-keepalive

prompt cache (extended cache, TTL 1h) の expire 前に軽量プロンプトを発火し、
全 context の cache miss による input トークン急騰を防ぐ。

対応 CodingAgent: Claude Code only

## 構成

| 要素 | 役割 |
| --- | --- |
| plugin monitor `cache-keepalive-watch` | セッション開始時に監視スクリプトを起動する。`when` は `always` |
| `scripts/watch-idle.sh` | セッション JSONL の mtime を監視し、閾値を超えたときだけ stdout に 1 行出す。off ファイルがあれば出さない |
| `scripts/report-status.sh` | 監視プロセスが動いているか (pid + コマンドライン照合) と、通知のオン・オフを JSON で返す |
| `scripts/set-keepalive.sh` | このセッションの通知をオン・オフする (off ファイルを置く・消す) |
| cache-keepalive skill | 状態の報告と、通知のオン・オフ。監視プロセスの起動も停止も持たない |

監視スクリプトの stdout の 1 行が Claude への通知になる。Claude が OK と応答したターンで
prompt cache の期限が延びる。ユーザーが作業している間はスクリプトが sleep するだけで、
会話ターンは発生しない。

## データの置き場

| データ | 場所 |
| --- | --- |
| 監視プロセスの pid | `${CLAUDE_PLUGIN_DATA}/keepalive-{session-id}.pid` |
| 通知をオフにしたセッションの印 | `${CLAUDE_PLUGIN_DATA}/keepalive-{session-id}.off` |

`${CLAUDE_PLUGIN_DATA}` は plugin 更新をまたいで残る永続ディレクトリで、
実体は `~/.claude/plugins/data/cache-keepalive-cc-tools/`。
pid ファイルは監視プロセスが終了時に消す。off ファイルは `on` で消える。
30 日を過ぎた pid・off ファイルと、旧版 (v0.9.x 以前) が残したログは、監視スクリプトが起動するたびに削除する。
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

閾値は既定 3000 秒 (50 分)。変えるときは `CACHE_KEEPALIVE_THRESHOLD_SECONDS` を
Claude Code の `settings.json` の `env` に置く。

## 通知のオン・オフ

`/cache-keepalive off` で、そのセッションの keepalive 通知を止める。`/cache-keepalive on` で戻す。
セッションの途中で何度でも切り替えられる。

- オフは実行したセッションだけに効く。他のセッションと、新しく始めるセッションはオンで始まる
- オフの間も監視プロセスは動き続け、閾値を超えても通知を出さずに待つ。
  Claude Code は同じセッションで plugin monitor を起動し直せず、`/plugin disable` も動いている monitor を止めないため、
  プロセスを止める方式ではオンに戻せない

## 未 setup 時・起動しないときの挙動

Claude Code 本体は、次のどれかに当たると monitor を起動せず、そのことを通知しない。

- 対話 CLI セッションでない (`claude -p` の単発実行)
- workspace trust が未承認
- plugin が無効、または `pluginMonitors` が無効
- Monitor ツールが使えない host

起動しなかったことは `/cache-keepalive status` で分かる。監視プロセスが生きていなければ
`not-running` を返す。`not-running` の状態でスクリプトを手で起動して代用しない。
本体が起動しなかった事実が隠れ、次のセッションでも同じ原因で起動しないまま気づけなくなる。

監視プロセスを止めるコマンドは無い。通知を止めたいときは `/cache-keepalive off` を使う。
status の `pid` を手で kill するとそのセッションでは起動し直せず、新しいセッションの開始まで戻らない。

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
