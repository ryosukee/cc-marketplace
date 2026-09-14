# diffo

対応 CodingAgent: `Claude Code + Codex`

この plugin は、[Diffo 公式の `diffo` skill](https://github.com/DiffoHQ/diffo/blob/main/skills/diffo/SKILL.md)
と併用する補助 plugin。公式 skill がレビュー開始の入口となり、Diffo CLI の
`help agent` が基本プロトコルを示す。この plugin の `ref-diffo` は通知の受け方、
返信時の補足規範、Markdown プレビューの調整を追加する。
Claude Code では追跡可能な background task で通知を受ける。Codex では
追跡可能な poller で通知を受け、`codex queue` で作業中の会話へ届ける。
いずれもレビュー開始と監視の起動は明示的に行う。
Claude Code 用の手順は[Claude Code の ref-diffo](./claude-skills/ref-diffo/SKILL.md)、
Codex 用の手順は[Codex の ref-diffo](./codex-skills/ref-diffo/SKILL.md)に分ける。
両方に共通する返信の規範は[共通手順](./references/review-protocol.md)を読む。
この plugin は、Diffo のブラウザ画面の表示を変更するスクリプト `bin/diffo-patch` も同梱する。

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

`diffo-patch` で表示を変更する場合は、以下も必要。

- `npm`
- `perl`
- `cmp`

公式 skill はこの plugin に同梱していない。利用する CodingAgent に別途導入する。

```bash
npx skills add DiffoHQ/diffo --skill diffo -g
```

plugin を導入するだけでは監視は始まらない。レビュー対象のリポジトリで
`npx -y @diffohq/diffo --no-open` を実行し、skill の手順で poller を起動する。

Codex の queue 方式では、インストールした plugin の
`bin/diffo-codex-poll` を絶対パスで呼び、レビュー対応中の Codex 会話を識別する
`CODEX_THREAD_ID` を渡す。
このスクリプトは PATH に自動登録されない。利用する agent は、読み込んだ
`codex-skills/ref-diffo/SKILL.md` のパスから plugin root を特定する。

## 未導入・異常終了時

依存コマンドがない場合、poller は標準エラーに不足項目を出して終了し、レビュー通知を queue しない。
Codex の queue が一時的に失敗した場合は、同じ通知を 5 秒間隔で再送する。
Diffo のレビューと指摘は保持されるため、依存を直した後に poller を再起動できる。
plugin がなくても Diffo CLI の手動 `poll` と `reply` は使用できる。

## Markdown プレビューと表示の変更

`diffo-patch` を適用すると、次の 3 つの機能が追加・変更される。

- 解決済みスレッドを非表示にできる。表示・非表示を切り替えられ、初期状態は非表示。
  切り替えた状態はブラウザに保存され、スレッドの解決状態は変わらない。
- Markdown プレビューを GitHub 風に表示する。1 行の改行から余分な `<br>` を生成しない。
- 新規コメントと返信の下書きを、再描画後も同じブラウザタブ内で復元する。

## 更新・削除と状態

更新後は各 CodingAgent で plugin を更新し、新しいセッションで使う。
削除するときは各エージェントから plugin をアンインストールする。
Codex poller の排他 lock は `${XDG_STATE_HOME:-$HOME/.local/state}/diffo-codex-poll/` に置き、
正常終了時に削除する。レビューとスレッドのデータは Diffo 側が保持する。
`diffo-patch` は npx の Diffo パッケージを直接変更するため、Diffo 更新後は再適用する。
