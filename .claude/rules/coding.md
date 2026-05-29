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

- API スクリプト: `{verb}-{noun}.sh` (例: `get-current-session-id.sh`)
- hook script: `{event}.sh` or `{action}-{target}.sh` (例: `session-start.sh`、`deny-netrc-write.sh`)

Rule ファイル名:

- kebab-case、名詞句
- subdir で文脈が示せるなら prefix を削る (例: `markdown/authoring.md`)

## API スクリプト設計

`scripts/api/` は skill や他 plugin から呼ばれる外部公開用スクリプトの配置先。
skill 内部でのみ使うスクリプトは `skills/{skill-name}/scripts/` に配置する。

- 出力は JSON 推奨 (stdout)
- エラーメッセージは stderr
- Exit codes: 0=成功, 1=該当��し, 2=前提条件エラー
- 引数はコマンドライン引数で受ける
- I/O 定義は各 plugin の `scripts/api/README.md` に記載
