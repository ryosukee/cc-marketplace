---
name: setup-codex-path-rules
description: >-
  codex-path-rules plugin の初回導入、更新後の再 setup、削除を行う。
  codex-path-rules が見つからない、rule 読み込みの setup が必要、
  または setup-codex-path-rules を実行してと言われたときに使う。
---

# codex-path-rules をセットアップする

この `SKILL.md` の 2 階層上を plugin root として解決する。
version 付き cache path を設定へ保存しない。

## 導入・更新

1. Bash、Git、`awk`、`find` が利用できることを確認する。不足していれば、自動で導入せずユーザーへ伝える。
2. `~/.local/bin` を作る。
3. plugin root の `scripts/codex-path-rules` を `~/.local/bin/codex-path-rules` へ
   mode `0755` でコピーする。
4. `codex-path-rules always "$PWD"` が成功することを確認する。

既存ファイルを置き換える前に、実体がこの plugin のスクリプトと同じ用途か確認する。
別用途のファイルなら上書きせず、ユーザーへ伝える。

## 削除

ユーザーが削除を依頼した場合だけ、`~/.local/bin/codex-path-rules` を削除する。
plugin は runtime state を保存しない。
