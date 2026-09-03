# Bash で cd を使わない

Bash ツールのコマンドで `cd` を使わない。対象はすべて絶対パスで書く。
subagent への依頼文でコマンドを示すときも同じ。

- 作業ディレクトリが要るコマンドは、ツールのディレクトリ引数で渡す
  （`git -C DIR`、`make -C DIR`、`npx --prefix DIR` 等）
- `cd` 前提のスクリプトしか無いときは、`cd` を含む呼び出しを単独にし、
  そのコマンドが読み書きするファイルを絶対パスで書く

## why

`cd DIR && cmd FILE` は cmd が読む先を静的に決められない。Claude Code v2.1.259 で
Read() deny rule の判定が `cd` 複合コマンドと `grep -r` に広がり、deny rule が 1 つでもあると
bypass permissions でも確認プロンプトが出る（changelog 2.1.259 "Fixed Bash `Read()` deny rules
not covering ... `cd DIR && cat FILE` compounds"）。subagent がこれを踏むと、ユーザーが承認するまで
止まる。絶対パスなら判定が決まり、プロンプトは出ない。
