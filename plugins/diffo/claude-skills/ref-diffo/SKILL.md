---
name: ref-diffo
description: "`diffo poll` で指摘を受け取る、スレッドへ返信する、指摘を資料へ反映する、Markdown プレビューを調整する場合に読む。返信先の取り違え、指定文言の言い換え、ターミナルへの重複報告を防ぐ。"
user-invocable: false
---

# Claude Code で Diffo レビューを受ける

レビュー開始は Diffo 公式の `diffo` skill と CLI の `help agent` に従う。
ここでは Claude Code の追跡可能なバックグラウンドタスクで通知を受け取る方法を補う。
返信前に[共通手順](../../references/review-protocol.md)を読む。
レビュー開始時は、Diffo CLI の起動後、poll の監視を始める前に
[表示調整の手順](../../references/display-customization.md)を読み、`diffo-patch` を適用する。

## poll を監視する

レビュー対象の repo で、Bash tool の `run_in_background: true` を使い、次の loop を起動する。
`diffo poll` は作業ディレクトリから対象レビューを特定する。`--port` は指定しない。

```bash
while :; do
  out=$(npx -y @diffohq/diffo poll 2>&1) || {
    printf '%s\n' "$out"
    printf '%s\n' '[poll が非ゼロで終了。loop を抜けた]'
    break
  }
  case "$out" in
    *'"status":"timeout"'*) continue ;;
    *)
      compact=$(printf '%s' "$out" | node "${CLAUDE_PLUGIN_ROOT}/bin/diffo-compact-payload.mjs" 2>/dev/null) || compact="$out"
      printf '%s\n' "$compact"
      break
      ;;
  esac
done
```

`timeout` のときだけ poll を再実行する。指摘が届いたとき、または poll が失敗したときは
出力を保持して終了する。`threads` 通知だけを短縮し、`finish`、`cleared`、
解析できない通知は元の payload を出す。開始元のセッションで完了通知を受け取るため、
`nohup`、shell の `&`、`disown` では起動しない。

payload の全 `threadIds` への返信後に、新しい追跡可能なバックグラウンドタスクを起動する。
スレッドの解決はレビュアーが行う。

`finish` の payload で締めが承認だけ（LGTM・approve・「merge して OK」等）なら、返信も再 poll も不要。
`diffo end` で閉じる（[共通手順](../../references/review-protocol.md)の「承認だけの締めには返信しない」）。

