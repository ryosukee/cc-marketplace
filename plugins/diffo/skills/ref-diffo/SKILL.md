---
name: ref-diffo
description: diffo でレビューを受ける作業の前に必ず読む。`diffo poll` で指摘を受け取る、スレッドへ返信する、指摘を資料へ反映する、のどれかを始める時点が発動点で、返信を書き終えてからでは遅い。返信先の取り違え、指定文言の言い換え、ターミナルへの重複報告を止める。markdown プレビューの見た目を変えるユーザースタイルシートの所在も持つ。
---

# diffo でレビューを受ける

`diffo poll` が返す payload の読み方と、返信するときに守るものを定める。

## poll の timeout を loop 内で処理する

`diffo poll` を 1 回だけ起動すると、指摘が届かないまま timeout したときにも待機タスクが終了する。
レビュー中は次の loop を追跡対象のバックグラウンドタスクとして起動する。
`diffo poll` は作業ディレクトリから対象レビューを特定する。`--port` などのオプションは足さず、
レビュー対象の repo で記載どおりに実行する。

```bash
while :; do
  out=$(npx -y @diffohq/diffo poll 2>&1) || {
    printf '%s\n' "$out"
    printf '%s\n' '[poll が非ゼロで終了。loop を抜けた]'
    break
  }
  case "$out" in
    *'"status":"timeout"'*) continue ;;
    *) printf '%s\n' "$out"; break ;;
  esac
done
```

この loop は `{"status":"timeout"}` を受け取ったときだけ `diffo poll` を再実行する。
指摘を含む payload を受け取ったときと、`diffo poll` が非ゼロで終了したときは、出力を保持して終了する。
`nohup`、shell の `&`、`disown` では起動しない。待機タスクの完了を、開始元のセッションが受け取れる状態にする。

### Claude Code

Bash tool で上の loop を `run_in_background: true` にして起動する。
Claude Code が追跡するバックグラウンドタスクにすることで、timeout では通知せず、loop が終了したときだけ
バックグラウンドタスクの完了通知を同じセッションで受け取る。

### Codex

`codex queue` とローカル app-server daemon を使い、指摘を受けたら同じ Codex thread に次の turn を
自動で起動する。親 agent で `CODEX_THREAD_ID` を確認してから、poll 専用の子 agent を 1 体起動し、
その値を引数にして plugin の `bin/diffo-codex-poll` を実行させる。

```bash
diffo-codex-poll '<親 agent の CODEX_THREAD_ID>'
```

子 agent へは次の条件を渡す。

- repo の絶対パスを指定し、その repo で loop を実行する
- loop は長時間実行セッションとして保持し、出力待ちは子 agent 側で行う
- 親 agent の `CODEX_THREAD_ID` を文字列として渡し、子 agent の環境変数で置き換えない
- 異常終了時だけ出力を親 agent へ送る
- ファイルの編集、スレッドへの返信、commit、push は行わない

スクリプトは同じ payload を fingerprint で識別し、同じ Codex thread と repo への二重配送を防ぐ。
指摘を受け取るたびに poll 専用 agent を作り直さない。同時に同じ Codex thread と repo を監視する
poll 専用 agent を複数起動しない。

親 agent が待機中なら `codex queue` が次の turn を開始する。別の turn が動いている場合は、その完了後に
レビュー対応の turn を開始する。現在の permission mode は引き継ぎ、承認が必要な操作は通常どおり停止する。

## 返信先はスレッドの本文から取る

`poll` の payload に含まれる `threadIds` の配列と、本文の `### Thread N` の並び順を対応づけない。
返信先の id は、各スレッドの見出しの直下にある `id:` 行から取る。

why: 配列の並びと本文の並びは一致する保証が無い。ずれたまま返信すると、
別のスレッドへ回答が付き、指摘した側は自分の指摘が無視されたと読む。

## 指定された文言はそのまま当てる

レビュアーが置き換え後の文言を書いて寄こしたときは、その文言をそのまま使う。
言い換えない。表記の揺れ（全角の数字など）だけは、その文書の既定に合わせて直す。

why: 文言を指定する指摘は、意図が既に文言の形で確定している。
言い換えると、指摘した側は同じ指摘をもう一度書くことになる。

## 説明を足す前に、情報が増えるかを見る

指摘に応えるとき、結論の言い換えや「確認すべき項目が残っている」という趣旨の文を足さない。
確認すべき項目があるなら、その項目の中身を書く。

判定基準: 足した文を消したとき、読み手が知ることは減るか。減らないなら足さない。

## ターミナルへ重複を出さない

diffo でやりとりしている間、ターミナルへの報告は「対応して回答した」程度に留める。
**diffo のスレッドへ書いていない論点だけ**をターミナルへ出す。

判定基準: いま書こうとしている内容を、diffo のスレッドに既に書いたか。書いたなら出さない。

## markdown プレビューを GitHub 風にする

diffo にテーマや CSS を差し替えるオプションは無い。CLI のオプションにも環境変数にも該当するものがない。
配信しているファイルへ直接当てる。

`diffo` を起動した後に `diffo-patch` を実行する。この plugin の `bin/` にある。

```bash
npx -y @diffohq/diffo --no-open
diffo-patch
```

> [!NOTE]
> diffo の起動後に適用する。npx が diffo を更新した後は再適用する。
> 表示切替が出ないときは、diffo 側の class 名や `aria-label` が変わっていないかを確認してからパッチを直す。

当てるのは 4 つ。

- `.md` の Preview モーダルを GitHub 風の配色と字送りにする CSS。`assets/diffo-github-preview.css` を
  `dist/client/` へ置き、`index.html` から link する
- marked の `breaks` を false にする。diffo の既定は true で、改行 1 つが `<br>` になる。
  GitHub の `.md` ファイルの描画は改行 1 つを空白に潰すので、`<br>` を書いた行が 2 行分空いてしまう
- `Collapse all files` の隣に、解決済みスレッドの表示を切り替えるボタンを足す。
  初期状態では解決済みスレッドを隠し、選択はブラウザの `localStorage` に保存する
- commit などによる再描画に備え、新規ラインコメントと既存スレッドへの返信の下書きを
  ブラウザタブの `sessionStorage` に保存して復元する。送信完了または Close で削除する

何度実行しても同じ結果になる。当たっていれば「変更なし」と出る。

### 起動前ではなく起動後に当てる

npx は初回と版が上がった直後にしかパッケージを取得しない。起動前だと当てる先が無いか、
古いキャッシュへ当ててしまう。

起動後でよいのは、diffo のサーバーが `dist/client` 配下をリクエストのたびに `readFile` するため。
当てた後はリロードするだけで反映され、サーバーの立て直しは要らない。

JS を当て直した直後はブラウザがバンドルをキャッシュしていることがある。
色は変わったのに改行が変わらないときはハードリロードする。

### 効く範囲と、届かない範囲

`breaks` の変更は marked のモジュール全体に効く。Preview だけでなくコメントスレッドと返信の描画も
`breaks: false` になるので、返信の中で改行 1 つを使うと詰まる。段落は実際の空行で分ける。
段落内で強制改行するときだけ `<br>` を使い、改行のつもりで文字列 `\n` を渡さない。

CSS を当てられる理由と、当てても届かない範囲（コードブロックのシンタックスハイライト、mermaid の図の色）は
CSS のファイル冒頭に書いてある。

ブラウザ拡張は要らない。Orca の内蔵ブラウザのように拡張を読み込めない環境でも同じように効く。

## 解決済みスレッドの表示を切り替える

`diffo-patch` を当てると、`Collapse all files` または `Expand all files` の隣に表示切替ボタンが増える。
初期状態では解決済みスレッドを隠す。ボタンを押すと表示と非表示が切り替わり、次に diffo を開いたときも
前回の選択を使う。

この切替は `.thread-resolved` などの表示だけを変える。thread の `resolved` 状態や diffo の保存データは変更しない。
解決によって非表示になるスレッドに行のホバー強調が残っている場合は、diffo 本体の `onMouseLeave` を発火させて解除する。
