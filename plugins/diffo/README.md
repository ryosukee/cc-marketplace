# diffo

対応 CodingAgent: `Claude Code + Codex`

この plugin は、[Diffo 公式の `diffo` skill](https://github.com/DiffoHQ/diffo/blob/main/skills/diffo/SKILL.md)と併用し、次の 2 つの機能を提供する。

- CodingAgent のメイン会話を止めずに、バックグラウンドでポーリングを続けて Diffo のレビュー通知を受け取る仕組み
- Diffo の Web UI の表示を変更し、機能を追加するパッチ

## 必要なものと導入

Diffo 公式 skill と CLI を使う場合は、以下が必要。

- Node.js 24 以上
- `npx`
    - Diffo CLI を `npx -y @diffohq/diffo` で実行する
- `git`

Codex でレビュー通知を自動受信する場合は、上記に加えて以下が必要。

- Codex CLI
    - `codex queue` と `codex app-server daemon` を使用する
    - `codex queue --help` で対応状況を確認する
- Bash
- `shasum`
- `awk`

Diffo のブラウザ表示を変更する同梱スクリプト `bin/diffo-patch` を使う場合は、以下も必要。

- `npm`
- `perl`
- `cmp`

公式 skill はこの plugin に同梱していない。利用する CodingAgent に別途導入する。

```bash
npx skills add DiffoHQ/diffo --skill diffo -g
```

plugin を導入するだけでは監視は始まらない。レビュー対象のリポジトリで
`npx -y @diffohq/diffo --no-open` を実行する。
監視は[Claude Code で Diffo レビューを受ける](./claude-skills/ref-diffo/SKILL.md)または[Codex で Diffo レビューを受ける](./codex-skills/ref-diffo/SKILL.md)の手順で始める。

## 未導入・異常終了時

監視が異常終了しても、Diffo のレビューと指摘は保持される。
原因を直して監視を再起動する。
plugin がなくても Diffo CLI の手動 `poll` と `reply` は使用できる。

## Markdown プレビューと表示の変更

`diffo-patch` を適用すると、次の 4 つの機能が追加・変更される。

- 解決済みスレッドを非表示にできる。表示・非表示を切り替えられ、初期状態は非表示。
  切り替えた状態はブラウザに保存され、スレッドの解決状態は変わらない。
- Markdown プレビューを GitHub 風に表示する。1 行の改行から余分な `<br>` を生成しない。
- 新規コメントと返信の下書きを、再描画後も同じブラウザタブ内で復元する。
- Finish review に LGTM ボタンを追加する。締めコメント欄の内容とともに、レビュー完了、
  `diffo end` と polling の終了、返信不要を伝える固定文を送信する。

## 更新・削除と状態

更新後は各 CodingAgent で plugin を更新し、新しいセッションで使う。
削除するときは各エージェントから plugin をアンインストールする。
Codex poller の排他 lock は `${XDG_STATE_HOME:-$HOME/.local/state}/diffo-codex-poll/` に置き、
正常終了時に削除する。レビューとスレッドのデータは Diffo 側が保持する。
`diffo-patch` は npx の Diffo パッケージを直接変更するため、Diffo 更新後は再適用する。
