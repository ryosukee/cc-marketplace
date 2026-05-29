# コーディング規約

## Bash スクリプト

- `set -euo pipefail` を冒頭に書く
- ShellCheck 準拠を推奨
- 変数は `"$VAR"` でクォート
- 関数名: `snake_case`
- ファイル名: `kebab-case.sh`

## 命名規則

Plugin 名:

- kebab-case
- 単機能なら 1 語: `markdownlint`
- 複合なら `{domain}-{action}`: `version-check`、`plugin-update`
- 複数形で「受け入れ枠」を示すこともある: `security-guards`

Script ファイル名:

- エントリスクリプト: `{verb}-{noun}.sh` (例: `check-update.sh`、`record-version.sh`)
- hook script: `{event}.sh` or `{action}-{target}.sh` (例: `session-start.sh`、`deny-netrc-write.sh`)

Rule ファイル名:

- kebab-case、名詞句
- subdir で文脈が示せるなら prefix を削る (例: `markdown/authoring.md`)

## スクリプト設計

スクリプトは役割で配置を分ける (詳細は [Plugin 設計原則](./plugin-design.md) の kernel パターン)。

- `scripts/hooks/`: hook 実装
- `scripts/`: 複数 skill / hook が共有する plugin 内エントリスクリプト
- `scripts/lib/`: source 用の共通ヘルパ
- `skills/{skill-name}/scripts/`: その skill だけが使うスクリプト

外部公開 (他 plugin・CLI) 用の "API" 層は設けない。スクリプトはすべて plugin 内部のもの。

invoke されるエントリスクリプトの規約:

- 出力は JSON 推奨 (stdout)
- エラーメッセージは stderr
- Exit codes: 0=成功, 1=該当なし, 2=前提条件エラー
- 引数はコマンドライン引数で受ける
- plugin root は `${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/<相対パス>" && pwd)}` で解決する。
  フォールバックの `$0` 相対パスは配置階層に依存する: `scripts/*.sh` なら `..`、`scripts/hooks/*.sh` なら `../..`。
  スクリプトを移動したらこの相対パスも必ず合わせて直す
