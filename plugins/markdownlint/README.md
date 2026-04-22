# markdownlint plugin

Write/Edit 後に markdownlint-cli2 を実行し、.md ファイルの lint エラーを Claude にフィードバックする。

## 設定探索の仕組み

対象ファイルのディレクトリから親に向かって markdownlint 設定ファイルを探索する (`.markdownlint-cli2.jsonc`, `.markdownlint.jsonc` 等)。見つかった場合はそのディレクトリに cd してから markdownlint-cli2 を実行する。

cd する理由: markdownlint-cli2 は `--config` でルール設定 (`.markdownlint.jsonc`) を上書きできるが、`.markdownlint-cli2.jsonc` の `customRules` は cwd から別系統で auto-discovery される。cwd が Claude Code のセッションディレクトリのままだと、別リポジトリのファイルを編集したときにセッションディレクトリの customRules が意図せず適用されてしまう。cd して cwd を対象リポジトリに切り替えることで、そのリポジトリに閉じた設定だけが適用される。

## フォールバック順

1. repo-local 設定 (対象ファイルから親に walk up して発見) → cd して実行
2. `~/.markdownlint.jsonc` (ユーザーグローバル設定) → `--config` で指定
3. plugin 同梱デフォルト (`config/.markdownlint.jsonc`) → `--config` で指定
