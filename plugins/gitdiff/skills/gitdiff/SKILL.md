---
name: gitdiff
description: This skill should be used when the user asks to "gitdiff", "diff", "差分を見せて", "変更を確認", "vimdiff", or wants to review file changes made in the previous response using diffview.nvim in a tmux window.
version: 0.2.0
---

# 編集差分の diffview.nvim 表示

直前の応答で編集したファイルの差分を、tmux の別ウィンドウで diffview.nvim を使って表示する。
ファイル一覧パネル + サイドバイサイド diff + wrap + シンタックスハイライト付き。

前提: nvim に diffview.nvim プラグインがインストールされていること。

## 手順

1. **対象ファイルの特定**: 直前のユーザーメッセージへの応答中に Edit または Write ツールで変更・作成したファイルパスを全てリストアップする（重複排除）。編集がなければ「直前の編集はありません」と報告して終了。

2. **差分の有無を確認**: 各ファイルについて Bash で差分の有無をチェックする。
   - git 管理下の既存ファイル: `git diff --quiet -- <file>` の終了コードで判定
   - 新規作成（untracked）ファイル: `git ls-files --error-unmatch <file> 2>/dev/null` が失敗すれば untracked
   - 差分なし（Edit したが内容が結果的に同じ等）のファイルはスキップ
   - 全ファイル差分なしの場合は「差分はありません」と報告して終了

3. **tmux 判定**: Bash で `[ -n "$TMUX" ]` を確認する。
   - **tmux 外の場合**: tmux 外であることと対象ファイル一覧を伝え、AskUserQuestion でどうするか聞く（選択肢例: 「ここに diff を出力」「スキップ」など）。以降の手順は tmux 内の場合のみ。

4. **git リポジトリルートの取得**: 対象ファイルが属する git リポジトリのルートを取得する。
   ```bash
   git -C "$(dirname "<file>")" rev-parse --show-toplevel
   ```

5. **diffview.nvim で開く**: tmux の新しいウィンドウで diffview.nvim を起動する。
   - 変更が working tree にある場合（未 staged）:
     ```bash
     tmux new-window -n "claude-diff" "nvim -c 'DiffviewOpen' +'cd <repo-root>'"
     ```
   - 変更が staged にある場合:
     ```bash
     tmux new-window -n "claude-diff" "nvim -c 'DiffviewOpen --staged' +'cd <repo-root>'"
     ```
   - 特定ファイルだけを対象にする場合（ファイルが多い repo で関係ないファイルを除外）:
     ```bash
     tmux new-window -n "claude-diff" "nvim -c 'DiffviewOpen -- <file1> <file2>' +'cd <repo-root>'"
     ```

6. 結果を簡潔に報告する（例: 「3 ファイルの差分を tmux ウィンドウ "claude-diff" で開きました」）

## diffview.nvim の操作案内

ユーザーが不慣れそうであれば、以下のキー操作を案内する:

| キー | 操作 |
|---|---|
| `]c` / `[c` | 次/前の変更箇所にジャンプ |
| `<Tab>` / `<S-Tab>` | ファイルパネルで次/前のファイル |
| `<CR>` | ファイルパネルでファイルを開く |
| `q` | diffview を閉じる |
