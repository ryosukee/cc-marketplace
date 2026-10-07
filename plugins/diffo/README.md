# diffo

対応 CodingAgent: `Claude Code + Codex`

この plugin は、[Diffo 公式の `diffo` skill](https://github.com/DiffoHQ/diffo/blob/main/skills/diffo/SKILL.md)と併用し、次の機能を提供する。

- Diffo の実行前に ref-diffo の読み込みを確認し、未読なら読み込みへ誘導する hook
- CodingAgent のメイン会話を止めずに、バックグラウンドでポーリングを続けて Diffo のレビュー通知を受け取る仕組み
- Diffo の Web UI の表示を変更し、機能を追加するパッチ

## 必要なものと導入

Diffo 公式 skill と CLI を使う場合は、以下が必要。

- Node.js 24 以上
- `npx`
    - Diffo CLI を `npx -y --prefer-online @diffohq/diffo@latest` で実行する
    - 各実行で npm registry の最新版を確認する
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
`npx -y --prefer-online @diffohq/diffo@latest --no-open` を実行する。
監視は[Claude Code で Diffo レビューを受ける](./claude-skills/ref-diffo/SKILL.md)または[Codex で Diffo レビューを受ける](./codex-skills/ref-diffo/SKILL.md)の手順で始める。

## 実行前に ref-diffo を読み込む

`PreToolUse` hook は、Diffo CLI と同梱スクリプトの実行を検出する。
そのセッションで ref-diffo を読み込んだ記録がなければ実行を拒否し、その環境用の SKILL.md の絶対パスを返す。
Claude Code では `Skill` ツールによる `diffo:ref-diffo` の発動、両 CodingAgent ではファイルの全文読み込みを受け付ける。
成功した読み込みを `PostToolUse` で確認した後、ref-diffo の手順に従って実行し直す。
hook は監視方法を指定せず、その手順を ref-diffo に集約する。

ファイルの読み込みは、ツールの対象パスと出力に SKILL.md の全文があることを確認する。
パスの言及、部分読み込み、読み込み要求を出しただけの状態では解除しない。
再開・コンパクションを含む `SessionStart` と、SKILL.md の本文変更で記録を無効にする。
`SessionEnd` で記録を削除する。

Codex では導入後に `/hooks` を開き、hook 定義を確認して信頼する必要がある。
plugin を有効にするだけでは hook は実行されない。
hook を無効にしている場合は `[features].hooks = true` に戻す。
設定と信頼の手順は [Codex Hooks](https://learn.chatgpt.com/docs/hooks) に従う。
Claude Code では plugin の hook を有効にする。hook を無効にした環境にはこの確認は適用されない。
入出力の仕様は [Claude Code Hooks](https://code.claude.com/docs/en/hooks) に従う。

検出対象は通常の `diffo`、`npx @diffohq/diffo`、`npm exec`、パッケージ内 CLI の `node` 実行、
同梱スクリプトとシェルのコマンド列・コマンド置換。
任意の別スクリプト内部や動的に組み立てたコマンドまで解析する仕組みではない。
読み込みの確認は、手順の内容をモデルが理解・遵守したことまでは保証しない。

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
`bin/diffo-codex-poll` の第 2 引数にレビュー名を渡すと、最初の poll でブラウザタブのタイトルを設定する。
読み込みの記録は CodingAgent が渡す plugin data の `ref-diffo-gate/` に置く。
plugin data が渡らない場合は `${XDG_STATE_HOME:-$HOME/.local/state}/diffo/ref-diffo-gate/` を使う。
記録は CodingAgent、session id、agent id と transcript のパスで分け、SKILL.md のハッシュだけを保存する。
`diffo-patch` は npx の Diffo パッケージを直接変更するため、Diffo 更新後は再適用する。
