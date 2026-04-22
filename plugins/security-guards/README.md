# security-guards

credentials 保護系の hook を束ねる plugin。

## 保護対象

| ツール | 対象ファイル | 動作 |
| --- | --- | --- |
| Write | `.netrc` | ブロック |
| Edit | `.netrc` | ブロック |
| Read | `.netrc` | ブロック |

## 実装

PreToolUse マッチャーで Write/Edit/Read それぞれにフックし、
`deny-netrc-write.sh` / `deny-netrc-read.sh` でブロック判定を行う。
