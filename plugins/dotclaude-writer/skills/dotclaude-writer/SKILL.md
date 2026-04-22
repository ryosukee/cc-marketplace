---
name: dotclaude-writer
description: >-
  .claude/ 配下のファイルを作成・編集・削除する。
  Claude Code の protected directory 制限をスクリプト経由で回避する。
  ".claude を編集"、"rules を作成"、"skill を追加"、
  ".claude/ に書き込み"、"dotclaude writer" 等で発動。
---

# dotclaude-writer

`.claude/` ディレクトリは Claude Code の protected directory であり、
Write/Edit ツールや Bash の直接操作がブロックされる。
このスキルは外部スクリプト経由で `.claude/` へのファイル操作を行う。

## スクリプトパス

```
SCRIPT="${CLAUDE_SKILL_DIR}/../../scripts/api/dotclaude-fs.sh"
```

以降のコマンド例ではこの変数を使う。

## ワークフロー

### 既存ファイルの編集

1. staging にエクスポート:

   ```bash
   bash "$SCRIPT" export rules/target.md
   ```

   stdout に staging パスが出力される (e.g., `.dotclaude-staging/rules/target.md`)

2. staging ファイルを Edit ツールで編集:
   Edit ツールの `file_path` に staging パス (絶対パスに変換) を指定する

3. `.claude/` に書き戻す:

   ```bash
   bash "$SCRIPT" install rules/target.md
   ```

   staging ファイルは自動削除される

### 新規ファイルの作成

1. staging パスを準備:

   ```bash
   bash "$SCRIPT" prepare rules/new-rule.md
   ```

2. staging ファイルを Write ツールで作成:
   Write ツールの `file_path` に staging パス (絶対パスに変換) を指定する

3. `.claude/` に配置:

   ```bash
   bash "$SCRIPT" install rules/new-rule.md
   ```

### ファイルの削除

```bash
bash "$SCRIPT" rm rules/obsolete.md
```

## 注意事項

- パスは `.claude/` からの相対パス。`.claude/` プレフィックスは付けない
- staging ディレクトリ (`.dotclaude-staging/`) は install 時に自動削除される
- Edit/Write ツールで staging ファイルを操作する際は絶対パスに変換すること
  (cwd + staging 相対パス)
- install を忘れると変更が `.claude/` に反映されない。
  export/prepare の後は必ず install で完了させる
- エラー時は stdout/stderr のメッセージに従うこと。
  `HINT:` 行に復帰手順が出力される
