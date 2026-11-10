---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive の状態を確認し、このセッションの keepalive 通知をオン・オフする。
  監視自体は plugin monitor がセッション開始時に起動するので、この skill は監視プロセスの起動も停止も行わない。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" "keepalive を止めて" "keepalive をオフ" 等で発動。
user-invocable: true
allowed-tools: Bash
argument-hint: "[status|on|off]"
note: >-
  この skill が起動を持たず、plugin monitor に監視を起動させるのは、Monitor ツールでは期限の無い監視を作れないため。
  Monitor ツールの監視は期限が最大 30 分で、期限が切れるたびに Claude へ起動し直しを促す通知が届く。
  Claude が起動し直すと、その応答でセッション JSONL が更新されるので、アイドル時間が閾値 3000 秒に届かない。
  changelog 2.1.271 "Changed Monitor watches to always have a deadline (at most 30 minutes;
  10 in single-prompt `-p` runs) and notify Claude to re-arm, replacing the no-timeout `persistent` option"。
---

# cache-keepalive

## 目的

prompt cache の extended cache (TTL 1h) が expire すると全 context が cache miss し、
input トークンが急騰する。
expire 前に軽量プロンプトを発火して TTL を延長することでこれを防ぐ。

## 仕組み

plugin monitor `cache-keepalive-watch` が、セッション開始時に `scripts/watch-idle.sh` を起動する。
Claude Code 本体が直接起動するので、Monitor ツールの `timeout_ms` の上限も `persistent` の有無も影響しない。

スクリプトはセッション JSONL の最後の API 応答 (assistant の記録) の時刻を監視し、
そこから 3000 秒 (50 分) 以上経過した時だけ stdout に 1 行出力する。
Claude Code 本体はこの行を Claude への通知として配信し、Claude が OK と応答することで cache が refresh される。

- セッション JSONL は、セッションに最初の入力が入るまで作られない。
  スクリプトは見つかるまで 60 秒間隔で探し、発火せずに待つ。待ちに上限は無く、
  見つからないことをエラーとして扱わない (最初の入力より前は cache が無く、発火の出番も無い)。
  API 応答がまだ無いときも、同じく発火せずに待つ
- JSONL の更新時刻 (mtime) は使わない。JSONL には API を呼ばない書き込み (cost-state など) もあり、
  mtime から数えると cache が延びていないのに無操作の時間が戻る
- 最後の API 応答は、JSONL の末尾 256KB、4MB、全体の順に広げて探す。
  model が `<synthetic>` の assistant の記録は API を呼ばずに作られるので除く
- アクティブ時はスクリプトが sleep するだけで、会話ターンは一切発生しない
- 動いていることの記録は pid ファイル (`${CLAUDE_PLUGIN_DATA}/keepalive-{session id}.pid`) だけが持つ。
  `signal-watcher.sh` は pid ファイルとコマンドラインの照合で、送り先がそのセッションの監視プロセスであることを確かめる
- 通知のオン・オフは監視プロセスのメモリが持つ。ステータスラインが表示に使えるよう、監視プロセスは pid ファイルの 2 行目にも写す。
  シグナルで切り替え、オフの間は閾値を超えても通知を出さずに待つ。オフの間も監視プロセスは止めない。
  監視プロセスはセッションごとなので、オフは実行したセッションだけに効き、新しいセッションはオンで始まる。
  `claude --resume` で再開したときも監視プロセスが新しく起動するので、オンに戻る

## 状態の確認とオン・オフ

1. 引数で `<action>` を決める。`off` なら `off`、`on` なら `on`、それ以外 (引数なし・`status` を含む) は `status`。
2. 監視プロセスへシグナルを送る。

    ```bash
    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" "${CLAUDE_PLUGIN_ROOT}/scripts/signal-watcher.sh" <action>
    ```

3. 終了コードで報告を分ける。

    - exit 0: 「cache-keepalive: 監視プロセス (pid) へ <action> を送った。結果は通知で届く」と報告して、このターンを終える。
      オン・オフの状態はこの時点では書かない。監視プロセスの返す通知が正の状態で、まだ届いていない
    - exit 1: 「cache-keepalive: 動いていない」と報告し、下記「monitor が起動しないとき」の確認手順を案内する。
      Claude Code 本体は plugin 名と monitor 名の組をセッション単位で重複排除するので、
      同じセッションでは起動し直せない。新しいセッションの開始で起動し直す
    - exit 2: stderr の文言をそのまま報告し、原因を推測で埋めない

監視プロセスを止めるサブコマンドは無い。止めると同じセッションでは起動し直せないので、
通知を止めたいときは `off` を使う。

## monitor が起動しないとき

Claude Code 本体は、次のどれかに当たると monitor を起動せず、そのことを通知しない。
`signal-watcher.sh` が exit 1 (動いていない) を返したときは、この順に確認する。

1. 対話 CLI セッションでない (`claude -p` の単発実行では起動しない)
2. workspace trust が未承認である
3. plugin が有効になっていない (`claude plugins list` で確認する)
4. plugin の版が古い (`claude plugins update cache-keepalive@cc-tools` で更新し、新しいセッションで確認する)

いずれにも当たらないのに起動しないときは、状況を報告して止まる。
スクリプトを手で起動して代用しない。本体が起動しなかった事実が隠れ、
次のセッションでも同じ原因で起動しないまま気づけなくなる。

## 監視プロセスからの通知への応答

通知の先頭のタグで分ける。

- `[cache-keepalive]`: keepalive の通知。OK とだけ返答する。それ以外の作業は一切しない
- `[cache-keepalive:status]`: on・off・status への返答。通知に書かれた状態を
  「cache-keepalive: このセッションの通知は on / off」とユーザーに伝える。off なら `/cache-keepalive on` で戻せることを添える。
  それ以外の作業はしない
