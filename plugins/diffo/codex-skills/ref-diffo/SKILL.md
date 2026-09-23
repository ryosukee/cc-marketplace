---
name: ref-diffo
description: "`diffo poll` で指摘を受け取る、スレッドへ返信する、指摘を資料へ反映する、Markdown プレビューを調整する場合に読む。返信先の取り違え、指定文言の言い換え、ターミナルへの重複報告を防ぐ。"
user-invocable: false
---

# Codex で Diffo レビューを受ける

レビュー開始は Diffo 公式の `diffo` skill と CLI の `help agent` に従う。
ここでは Codex の作業 thread に通知を届ける方法を補う。
返信前に[共通手順](../../references/review-protocol.md)を読む。
レビュー開始時は、Diffo CLI の起動後、poller の起動前に
[表示調整の手順](../../references/display-customization.md)を読み、`diffo-patch` を適用する。

## 起動に失敗したという表示だけで起動し直さない

`diffo --no-open` が「the diffo server did not start」と出しても、
`npx -y @diffohq/diffo status` でサーバーが動いているかを確かめてから次に進む。
status が URL を返せば、起動は成功している。起動し直すのは、status にサーバーが出ないときだけにする。

why: サーバーの起動を待つ時間を過ぎても、サーバーは遅れて動き出していることがある。
表示だけで失敗と判断すると、動いているレビューを見失い、起動し直しや別の手段を探す遠回りをする。

## poll を監視する

親 agent の `CODEX_THREAD_ID` を確認する。レビュー対象 repo で、
plugin の `bin/diffo-codex-poll` を追跡可能なタスクまたは poll 専用の子 agent から実行する。
この SKILL.md のパスから plugin root を特定し、script の絶対パスを使う。

```bash
"<plugin root>/bin/diffo-codex-poll" '<親 agent の CODEX_THREAD_ID>'
```

子 agent に任せる場合は、次の条件を渡す。

- repo の絶対パスを指定し、その repo で実行する
- timeout 中は待機を続け、feedback を queue したら終了する
- 親 agent の `CODEX_THREAD_ID` を文字列として渡し、子 agent の環境変数で置き換えない
- 異常終了時だけ出力を親 agent へ送る
- ファイルの編集、スレッドへの返信、commit、push は行わない

同じ Codex thread と repo の組み合わせで poller を重複起動しない。
feedback を queue した後は次の poll を起動せず、終了する。
必要なコマンドがない場合や `diffo poll` が失敗した場合は、poller がエラーを出して終了する。
原因を確認してから再起動する。`codex queue` が失敗した場合は、同じ通知を 5 秒間隔で再送する。

親 agent は payload の全 `threadIds` に返信してから、新しい poller を起動する。
返信前に再開すると、Diffo は前の配送を未回答として扱う。
API などで `sent` 状態のスレッドを見つけても payload 到着前に返信しない。
`sent` には通知待ちも含まれるため、poller が返した `threadIds` に返信する。
スレッドの解決はレビュアーが行う。
