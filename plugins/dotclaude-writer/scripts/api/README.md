# dotclaude-writer API

## dotclaude-fs.sh

`.claude/` 配下のファイル操作を staging ディレクトリ経由で行う。

### コマンド

| コマンド | 引数 | 動作 | stdout |
|---------|------|------|--------|
| `export` | `<path>` | `.claude/<path>` → staging にコピー | staging ファイルパス |
| `prepare` | `<path>` | 新規ファイル用の staging パスを作成 | staging ファイルパス |
| `install` | `<path>` | staging → `.claude/<path>` にコピー、staging を掃除 | 成功メッセージ |
| `rm` | `<path>` | `.claude/<path>` を削除 | 成功メッセージ |

`<path>` は `.claude/` からの相対パス (e.g., `rules/foo.md`)。

### Exit codes

| code | 意味 |
|------|------|
| 0 | 成功 |
| 1 | 対象ファイルが存在しない、前提条件エラー |
| 2 | 引数不正、不明なコマンド |

### 出力フォーマット

- `OK: ...` — 成功
- `NEXT: ...` — LLM への次ステップガイダンス
- `ERROR: ...` (stderr) — エラー内容
- `HINT: ...` (stderr) — エラーからの復帰方法
