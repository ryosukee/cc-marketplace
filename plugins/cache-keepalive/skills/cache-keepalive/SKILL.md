---
name: cache-keepalive
description: >-
  prompt cache (extended cache, TTL 1h) の keepalive の監視状態を確認する。
  監視自体は plugin monitor がセッション開始時に起動するので、この skill は起動も停止も行わない。
  "cache-keepalive" "キャッシュキープアライブ" "keep cache alive" 等で発動。
user-invocable: true
allowed-tools: Bash
argument-hint: "[status]"
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

- セッション JSONL は、セッションに最初の入力が入るまで作られない。
  スクリプトは見つかるまで 60 秒間隔で探し、発火せずに待つ。待ちに上限は無く、
  見つからないことをエラーとして扱わない (最初の入力より前は cache が無く、発火の出番も無い)
- スクリプトの stat 実行は bash プロセスなので JSONL mtime を更新しない
- JSONL は Claude Code 本体が会話の entry を追記するたびに更新される。
  ローカルコマンドの記録など、API コールを伴わない書き込みでも進むことがある
- アクティブ時はスクリプトが sleep するだけで、会話ターンは一切発生しない
- 動いていることの記録は pid ファイル (`${CLAUDE_PLUGIN_DATA}/keepalive-{session id}.pid`) だけが持つ

## status の確認

引数が何であっても状態の確認だけを行う。

1. 状態を取る。

    ```bash
    CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" "${CLAUDE_PLUGIN_ROOT}/scripts/report-status.sh"
    ```

2. 出力 JSON の `state` で報告を分ける。

    - `running`: 「cache-keepalive: 有効」と報告し、`pid` を添える
    - `not-running`: 「cache-keepalive: 動いていない」と報告し、下記「monitor が起動しないとき」の
      確認手順を案内する。Claude Code 本体は plugin 名と monitor 名の組をセッション単位で
      重複排除するので、同じセッションでは起動し直せない。新しいセッションの開始で起動し直す

3. exit 2 のときは stderr の文言をそのまま報告し、原因を推測で埋めない。

停止のサブコマンドは無い。止めたいときは `state` が `running` のときの `pid` を
ユーザーが手で kill する (pid ファイルは監視プロセスが終了時に消す)。

## monitor が起動しないとき

Claude Code 本体は、次のどれかに当たると monitor を起動せず、そのことを通知しない。
`state` が `not-running` のときは、この順に確認する。

1. 対話 CLI セッションでない (`claude -p` の単発実行では起動しない)
2. workspace trust が未承認である
3. plugin が有効になっていない (`claude plugins list` で確認する)
4. plugin の版が古い (`claude plugins update cache-keepalive@cc-tools` で更新し、新しいセッションで確認する)

いずれにも当たらないのに起動しないときは、状況を報告して止まる。
スクリプトを手で起動して代用しない。本体が起動しなかった事実が隠れ、
次のセッションでも同じ原因で起動しないまま気づけなくなる。

## keepalive 通知への応答

`[cache-keepalive]` タグ付きの通知が届いた場合、OK とだけ返答する。それ以外の作業は一切しない。
