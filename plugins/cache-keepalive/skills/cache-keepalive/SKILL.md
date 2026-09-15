---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive の状態を確認し、停止する。
  監視自体は plugin monitor がセッション開始時に起動するので、この skill は起動を行わない。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" 等で発動。
user-invocable: true
allowed-tools: Bash
argument-hint: "[status|off|on]"
note: >-
  この skill が起動を持たないのはワークアラウンド。Monitor ツールの入力スキーマから persistent が消え、
  timeout_ms が 1,800,000 ms (30 分) で頭打ちになったため、期限切れのたびに Claude が起動し直すことになり、
  その応答でセッション JSONL が更新されて閾値 3000 秒に到達しなくなった。
  changelog 2.1.271 "Changed Monitor watches to always have a deadline (at most 30 minutes;
  10 in single-prompt `-p` runs) and notify Claude to re-arm, replacing the no-timeout `persistent` option"。
  v2.1.271 で binary 側の既定も false から true へ変わっている。
  解除の条件は、セッションに送られる Monitor の入力スキーマに persistent が戻ること。
  そのときは起動を Monitor ツールへ戻すかを判断する。
---

# cache-keepalive

## 目的

prompt cache の extended cache (TTL 1h) が expire すると全 context が cache miss し、
input トークンが急騰する。
expire 前に軽量プロンプトを発火して TTL を延長することでこれを防ぐ。

## 仕組み

plugin monitor `cache-keepalive-watch` が、セッション開始時に `scripts/watch-idle.sh` を起動する。
Claude Code 本体が直接起動するので、Monitor ツールの `timeout_ms` の上限も `persistent` の有無も影響しない。

スクリプトはセッション JSONL の mtime を監視し、
最終活動から 3000 秒 (50 分) 以上経過した時だけ stdout に 1 行出力する。
Claude Code 本体はこの行を Claude への通知として配信し、Claude が OK と応答することで cache が refresh される。

- スクリプトの stat 実行は bash プロセスなので JSONL mtime を更新しない
- JSONL mtime は Claude の API コール (ユーザー操作 or keepalive 応答) でのみ更新される
- アクティブ時はスクリプトが sleep するだけで、会話ターンは一切発生しない
- 起動・発火・停止は `${CLAUDE_PLUGIN_DATA}` のログへ 1 行ずつ記録する。
  プロセスが生きたまま通知が届かない状態と、そもそも起動していない状態を、status で区別できる

## サブコマンド

`<command-args>` で分岐する。引数が無ければ status とみなす。

### status (引数なし / `status` / `state` / `list`)

1. 状態を取る。

    ```bash
    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" "${CLAUDE_PLUGIN_ROOT}/scripts/report-status.sh"
    ```

2. 出力 JSON の `state` で報告を分ける。

    - `running`: 「cache-keepalive: 有効」と報告し、`armed_at`・`launcher`・`last_fired_at`・`fired_count` を添える
    - `stopped`: 「cache-keepalive: 停止中」と報告し、このセッションでは起動し直せないことを伝える
    - `never-armed`: 「cache-keepalive: 未起動」と報告する。`last_error` が `null` なら
      Claude Code 本体が起動していないので、下記「monitor が起動しないとき」の確認手順を案内する。
      `last_error` に値があれば、起動したうえで監視スクリプトが落ちているので、その文言をそのまま報告する

3. exit 2 のときは stderr の文言をそのまま報告し、原因を推測で埋めない。

### off

1. 監視プロセスを止める。

    ```bash
    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" "${CLAUDE_PLUGIN_ROOT}/scripts/stop-watch.sh"
    ```

2. exit 0 → 「cache-keepalive を停止しました」と報告し、
   このセッションでは起動し直せないこと、次のセッションの開始で自動的に起動し直すことを伝える
3. exit 1 → 「現在有効な cache-keepalive はありません」と報告する
4. exit 2 → stderr の文言をそのまま報告する

### on

plugin monitor がセッション開始時に起動するので、`on` から起動する手順は持たない。
status と同じコマンドで状態を取り、次のとおり報告する。

- `running` → 「cache-keepalive は既に有効です」
- `stopped` / `never-armed` → 起動していないことを報告する。
  Claude Code 本体は plugin 名と monitor 名の組をセッション単位で重複排除するので、
  同じセッションでは起動し直せない。新しいセッションを開始すると plugin monitor が起動し直す

## monitor が起動しないとき

Claude Code 本体は、次のどれかに当たると monitor を起動せず、そのことを通知しない。
`state` が `never-armed` のときは、この順に確認する。

1. 対話 CLI セッションでない (`claude -p` の単発実行では起動しない)
2. workspace trust が未承認である
3. plugin が有効になっていない (`claude plugins list` で確認する)
4. plugin の版が古い (`claude plugins update cache-keepalive@cc-tools` で更新し、新しいセッションで確認する)

いずれにも当たらないのに起動しないときは、状況を報告して止まる。
ログが無いこと自体が「Claude Code 本体が起動しなかった」ことの証拠になるので、
スクリプトを手で起動して代用しない。

## keepalive 通知への応答

`[cache-keepalive]` タグ付きの通知が届いた場合、OK とだけ返答する。それ以外の作業は一切しない。
