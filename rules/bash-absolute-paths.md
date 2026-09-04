---
note: |
  この rule は Claude Code v2.1.259 の Bash 権限判定への対処。Read() deny rule が 1 つでもあると、
  cd 複合コマンドで相対パスを読む 41 種のコマンドと、grep / egrep / fgrep / rg / diff / git / cp / mv の
  「指定ディレクトリの下に deny 対象がある」場合を確認に回す。後者は bypass permissions でも止まる。
  根拠は v2.1.259 バイナリの Bash 権限判定と changelog 2.1.259 "Fixed Bash `Read()` deny rules
  not covering files given as option values (`--ignore-revs-file=.env`, `-f.env`, `@file`),
  `git diff`/`git grep` file operands, or `cd DIR && cat FILE` compounds; `grep -r`/`cp -r` over
  a directory holding a denied file now asks"。
  この判定が無くなるか、deny rule を置かなくなったらこの rule は削除する。
---

# Bash のパスは絶対パスで書き、探索の根に deny 対象を含めない

Bash ツールのコマンドで `cd` を使わない。対象はすべて絶対パスで書く。
subagent への依頼文でコマンドを示すときも同じ。

- 作業ディレクトリが要るコマンドは、ツールのディレクトリ引数で渡す
  （`git -C DIR`、`make -C DIR`、`npx --prefix DIR` 等）
- `cd` 前提のスクリプトしか無いときは、`cd` を含む呼び出しを単独にし、
  そのコマンドが読み書きするファイルを絶対パスで書く
- パスを省略すると `.` を補うコマンド（`ls`、`find`、`rg PATTERN`、`grep -r PATTERN`）も
  相対パス扱いになる。根を絶対パスで書く

## 探索の根に deny 対象を含めない

`grep -r` / `rg` / `diff` / `git diff` / `cp -r` / `mv` は、対象ディレクトリの下に
Read() deny rule が指すファイルがあると、`cd` が無くても確認プロンプトが出る。
`~/.netrc` を deny している環境では `~`・`$HOME`・`/Users/<name>` を根にしない。
repo や `~/.claude` のように deny 対象より下のディレクトリを根にする。
cwd が `$HOME` のときのパス省略も同じ。

## subagent には依頼文へ制約を書き写す

subagent はこの rule を継承しない。起動する側が、依頼文に制約そのものを書く。
書き写すのは上の箇条書きと「探索の根に deny 対象を含めない」の内容で、
`~`・`$HOME`・`/Users/<name>` の代わりに根として使うディレクトリの絶対パスまで具体的に書く。

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
確認に回す。grep / rg / diff / git / cp / mv は、指定ディレクトリの下に deny 対象があるときも
確認に回し、この確認は bypass permissions でも出る。
絶対パスで deny 対象の外を指せば判定が決まり、プロンプトは出ない。
