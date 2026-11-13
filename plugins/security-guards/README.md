# security-guards

credentials 保護系の hook を束ねる plugin。

## 保護対象

| ツール | 対象ファイル | 動作 |
| --- | --- | --- |
| Write | `.netrc` | ブロック |
| Edit | `.netrc` | ブロック |
| Read | `.netrc` | ブロック |

## hook

| イベント | 役割 |
| --- | --- |
| PreToolUse | Write/Edit/Read の credentials 保護 |
| SessionStart | `check-settings.sh` が user settings の推奨設定の不足を通知する。設定は自動変更しない |

## 依存

- `jq`: hook の JSON 処理と推奨設定の確認

## 実装

PreToolUse マッチャーで Write/Edit/Read それぞれにフックし、
`deny-netrc-write.sh` / `deny-netrc-read.sh` でブロック判定を行う。

## 推奨 settings.json 設定

plugin の hook だけでは Bash 経由のアクセスやサンドボックスレベルの保護をカバーできない。
以下を user settings (`~/.claude/settings.json`) に手動で追加することを推奨する。

```json
{
  "permissions": {
    "deny": [
      "Read(~/.netrc)",
      "Bash(*.netrc*)"
    ]
  },
  "sandbox": {
    "filesystem": {
      "denyRead": ["~/.netrc"]
    }
  }
}
```

| 設定 | 効果 | plugin hook との関係 |
| --- | --- | --- |
| `permissions.deny: Read(~/.netrc)` | Read ツールで `~/.netrc` をブロック | plugin hook と重複するが多層防御として有効 |
| `permissions.deny: Bash(*.netrc*)` | Bash コマンドに `.netrc` が含まれるとブロック | plugin hook ではカバーできない領域 |
| `sandbox.filesystem.denyRead` | サンドボックスレベルで読み取り禁止 | 最も低レイヤーの保護。hook より先に効く |
