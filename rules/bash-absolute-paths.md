---
note: |
  この rule は Claude Code の Bash 権限判定への対処。Read() deny rule が 1 つでもあると、
  cd 複合コマンドで相対パスを読む 46 種のコマンド（cat / head / grep / rg / find / ls / jq ほか）を
  確認に回す。
  根拠は v2.1.263 バイナリの Bash 権限判定と changelog 2.1.257 "Fixed Bash `Read()`/`Edit()` deny rules
  not applying to `< file` redirects and reader commands like `tac` and `egrep`; a deny rule on any
  argument or redirect target now refuses the command"。
  この判定が無くなるか、deny rule を置かなくなったらこの rule は削除する。
---

# Bash のパスは絶対パスで書く

Bash ツールのコマンドで `cd` を使わない。対象はすべて絶対パスで書く。
subagent への依頼文でコマンドを示すときも同じ。

- 作業ディレクトリが要るコマンドは、ツールのディレクトリ引数で渡す
  （`git -C DIR`、`make -C DIR`、`npx --prefix DIR` 等）
- `cd` 前提のスクリプトしか無いときは、`cd` を含む呼び出しを単独にし、
  そのコマンドが読み書きするファイルを絶対パスで書く
- パスを省略すると `.` を補うコマンド（`ls`、`find`、`rg PATTERN`、`grep -r PATTERN`）も
  相対パス扱いになる。根を絶対パスで書く

## subagent には依頼文へ制約を書き写す

subagent はこの rule を継承しない。起動する側が、依頼文に制約そのものを書く。
書き写すのは上の箇条書きで、`cd` を使わずに済むよう、
根として使うディレクトリの絶対パスまで具体的に書く。

- 依頼文の末尾に「さらに subagent を起動するなら、この制約を依頼文へそのまま書き写す」を足す
- 判定基準: 依頼文に絶対パスの制約が書いてあるか。
  書いていないなら、その subagent はこの rule を持たない状態で走る

why: 起動する側が rule を守っても、起動された側は守らない。
subagent が確認プロンプトを踏むとユーザーが承認するまで止まり、
起動した側は止まったことに気づいてから、`ListAgents` で止まった先を探して
指示を送り直すことになる。subagent がさらに subagent を起動していると、その分だけ探す先が増える。
依頼文に書けば最初から踏まない。

## why

`cd DIR && cmd FILE` は cmd が読む先を静的に決められない。Read() deny rule が 1 つでもあると、
Claude Code は cd 複合コマンドで相対パスを読むコマンド（cat / head / grep / rg / find / ls / jq ほか）を
確認に回す。絶対パスで指せば判定が決まり、プロンプトは出ない。
