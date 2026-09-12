# codex-path-rules

Claude Code の `.claude/rules` を正の所在として、Codex から同じ rule を読み取る。

## 対応ホスト

Codex only。

## Requirements

- Bash
- Git
- `awk`
- `find`

## Setup

plugin を Codex へ追加した後、`setup-codex-path-rules` skill を実行する。
skill は `scripts/codex-path-rules` を `~/.local/bin/codex-path-rules` へコピーする。

未 setup の場合、ユーザー共通の `AGENTS.md` は環境を変更せず、setup skill の実行を案内する。

## 収集対象

`codex-path-rules always [cwd]` は、次の場所から YAML frontmatter に `paths` がない rule を出力する。

- `~/.claude/rules`
- Git リポジトリのルートから `cwd` までの各階層にある `.claude/rules`

`paths` がある rule は出力しない。対象ファイルに応じて読み込む hook は後続実装で扱う。

## 更新と削除

plugin 更新後は setup skill を再実行する。削除するときは、plugin を削除した後に
`~/.local/bin/codex-path-rules` を削除する。

runtime state は保存しない。
