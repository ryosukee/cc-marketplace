---
name: dotclaude-writer
description: >-
  .claude/ 配下のファイルを作成・編集・削除するときは必ずこのスキルを使うこと。
  .claude/ は protected directory であり Write/Edit/Bash の直接操作はすべてブロックされる。
  このスキルが提供するスクリプト経由のワークフローだけが .claude/ への唯一の書き込み手段。
  .claude/ へのファイル操作が必要になった時点で、直接操作を試みる前にこのスキルを発動すること。
---

# dotclaude-writer

`.claude/` ディレクトリは Claude Code の protected directory であり、
Write/Edit ツールや Bash の直接操作がブロックされる。
このスキルは外部スクリプト経由で `.claude/` へのファイル操作を行う。

この制約は仕様であり解除見込みがない。経緯は claude-known-issues plugin の台帳エントリ
`claude-dir-write-protection` に記録している。

## スクリプトパス

```
SCRIPT="${CLAUDE_SKILL_DIR}/scripts/dotclaude-fs.sh"
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
- 同一セッションで同じファイルを複数回修正する場合
  (review サイクル、段階的な大規模修正など)、
  install するたびに staging が削除されるため、
  2 回目以降は再 export が必要

    ```bash
    # 1 回目
    bash "$SCRIPT" export rules/foo.md
    # Edit + install
    bash "$SCRIPT" install rules/foo.md  # staging 削除

    # 2 回目 (再 export 必要)
    bash "$SCRIPT" export rules/foo.md
    # Read してから Edit
    bash "$SCRIPT" install rules/foo.md
    ```

- 再 export 後の staging ファイルは Edit/Write 前に必ず Read する。
  harness は file_path 単位で Read 履歴を要求するため、
  再 export 後は「File has not been read yet」エラーになる
  (前 round で Read していても継承されない)
- エラー時は stdout/stderr のメッセージに従うこと。
  `HINT:` 行に復帰手順が出力される
