# dotfiles 側の後処理手順

cc-marketplace への移行完了後、dotfiles から移行済みファイルを削除するための手順。
このドキュメントは別セッションでの作業ガイドとして使う。
実施後はこの docs ごと削除する。

## 前提

以下が完了していること。

- cc-marketplace に rules / plugins がマージ + push されている
- user が `claude plugin marketplace update cc-tools` を実行済み
- user が 3 新 plugin を install 済み
    - `claude plugin install markdownlint@cc-tools`
    - `claude plugin install mkdocs-setup@cc-tools`
    - `claude plugin install security-guards@cc-tools`
- user が symlink を張り済み: `ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace`
- Claude Code セッションを再起動し、新 rule が反映されていることを確認済み

## 削除対象

### dotfiles/claude/.claude/rules/ 配下の rule ファイル

cc-marketplace の subdir に移行済み。dotfiles 側は削除する。

```bash
cd ~/ghq_root/github.com/ryosukee/dotfiles
rm claude/.claude/rules/ask-with-choices.md
rm claude/.claude/rules/background-task.md
rm claude/.claude/rules/markdown-authoring.md
rm claude/.claude/rules/markdown-anti-ai-authoring.md
```

### dotfiles/claude/.claude/hooks/ 配下の hook script

plugin に移行済み。

```bash
rm claude/.claude/hooks/deny-netrc-write.sh
# hooks/ が空になる場合はディレクトリも削除
rmdir claude/.claude/hooks 2>/dev/null || true
```

### dotfiles/claude/.claude/skills/ 配下の skill

- `mkdocs-setup` は plugin に移行
- `review-markdown-docs` は rule 直接参照方式に移行 (skill 廃止)

```bash
rm -rf claude/.claude/skills/mkdocs-setup
rm -rf claude/.claude/skills/review-markdown-docs
# skills/ が空になる場合はディレクトリも削除
rmdir claude/.claude/skills 2>/dev/null || true
```

### ~/.claude/hooks/markdownlint-post.sh (local real file)

dotfiles 管理外で local にのみ存在する実体。plugin に移行済みなので削除。

```bash
rm ~/.claude/hooks/markdownlint-post.sh
# hooks/ が空なら削除
rmdir ~/.claude/hooks 2>/dev/null || true
```

## settings.json の修正

dotfiles の `claude/.claude/settings.json` から plugin に移行した hook 宣言を削除する。

### 削除する宣言

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": "bash ~/.claude/hooks/deny-netrc-write.sh" }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "bash ~/.claude/hooks/deny-netrc-write.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/.claude/hooks/markdownlint-post.sh",
            "statusMessage": "markdownlint checking..."
          }
        ]
      }
    ]
  }
}
```

これらは plugin の hooks.json で宣言されるので settings.json 側は不要になる。
上記ブロックを全て削除する
(`hooks` キー自体が空になれば `hooks` キーも削除)。

### enabledPlugins に新 plugin を追加

```json
{
  "enabledPlugins": {
    "markdownlint@cc-tools": true,
    "mkdocs-setup@cc-tools": true,
    "security-guards@cc-tools": true
  }
}
```

既存の enabledPlugins ブロックに追記する。

## stow 再実行

dotfiles の stow で管理されているので、削除後 stow を再実行する。

```bash
cd ~/ghq_root/github.com/ryosukee/dotfiles
stow -R claude  # または user の運用に従う
```

削除したファイルの symlink (`~/.claude/rules/ask-with-choices.md` 等) が
自動的に解除される。

## 反映確認

1. Claude Code を再起動する
2. system prompt に rule が重複 load されていないか確認
    - 以前は `~/.claude/rules/ask-with-choices.md` (flat dotfiles symlink)
    - 現在は `~/.claude/rules/cc-marketplace/author-defaults/ask-with-choices.md`
      のみ
3. `/hooks` 等で plugin の hook が有効化されているか確認
4. `.md` ファイルを編集して markdownlint hook が動作するか確認

## git commit (dotfiles)

```bash
cd ~/ghq_root/github.com/ryosukee/dotfiles
git add claude/
git commit -m "move rules/hooks/skills to cc-marketplace plugin"
git push
```

## このドキュメントの扱い

cleanup 完了後、このファイル (`docs/dotfiles-cleanup.md`) を cc-marketplace から削除する。
plan 系 docs は移行完了後は残さない (CLAUDE.md の設計方針)。
