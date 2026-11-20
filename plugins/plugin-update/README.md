# plugin-update

SessionStart 時にプラグインの更新を検知・通知する。

## 依存

- `jq`: インストール済み plugin と marketplace の版数の読み取り、通知 JSON の生成

## 動作

SessionStart hook でインストール済み plugin のバージョンをチェックし、
marketplace に新しいバージョンがある場合に通知する。
全プラグインが最新の場合もステータスを表示する。
