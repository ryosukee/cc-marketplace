# dotfiles 側の後処理手順

このドキュメントは **dotfiles repo で作業する側のセッション** (cwd が `~/ghq_root/github.com/ryosukee/dotfiles`) が読む前提で書かれている。
cc-marketplace 側で移行作業は完了済み。dotfiles repo から移行済みのファイル / 宣言を削除する工程だけがこのドキュメントの対象。

## 経緯

移行 plan (`cc-marketplace/docs/dotfiles-migration-plan.md`) は元々 dotfiles 側のセッションで起草された。plan で決まった方針に沿って cc-marketplace 側で実装・commit 済み。今回の作業はその plan の最終工程 (dotfiles 側のクリーンアップ) にあたる。

## 前提確認

cc-marketplace 側で以下が完了していること (着手前に確認する)。

- cc-marketplace main branch に移行 commit が push されている (`git log cc-marketplace/` で確認可能)
- 3 新 plugin が install 済み (`jq '.enabledPlugins' ~/.claude/settings.json` で `markdownlint@cc-tools`, `mkdocs-setup@cc-tools`, `security-guards@cc-tools` が true になっている)
- rules subdir symlink が張られている (`ls -la ~/.claude/rules/cc-marketplace` で `→ ~/ghq_root/.../cc-marketplace/rules` になっている)
- Claude Code セッションを一度再起動し、新 plugin の hook / 新 rule が反映されていることを user が確認している

上記のいずれかが未完の場合はこのドキュメントに従う前に user に確認すること。

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

### enabledPlugins (確認のみ、手で書き足す必要なし)

`~/.claude/settings.json` は dotfiles の `claude/.claude/settings.json` への stow symlink。cc-marketplace 側で `claude plugin install` を実行した時点で dotfiles 側の settings.json 実体に以下 3 エントリが自動追加されている。

```json
{
  "enabledPlugins": {
    "markdownlint@cc-tools": true,
    "mkdocs-setup@cc-tools": true,
    "security-guards@cc-tools": true
  }
}
```

`git diff claude/.claude/settings.json` で enabledPlugins への追加が載っていることを確認する。手で書き足す必要はない。commit には含める。

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

## cc-marketplace 側の最終片付け (dotfiles session では実施しない)

dotfiles 側の cleanup が完了したら、cc-marketplace repo の以下を削除する必要がある。
これは dotfiles session では対象外。**別途 cc-marketplace side のセッションで** 実施する。

- `cc-marketplace/docs/dotfiles-cleanup.md` (このファイル)
- `cc-marketplace/docs/dotfiles-migration-plan.md` (元の plan、まだ commit されていない可能性あり)

plan / cleanup 系 docs は移行完了後は残さない。user に伝える。
