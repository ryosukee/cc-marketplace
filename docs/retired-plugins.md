# 廃止した plugin

廃止した plugin の記録。コードは削除し、git 履歴から取り出す。
廃止するときは [Plugin 更新手順](../.claude/rules/plugin-release.md) の削除手順に従い、ここへ 1 件足す。

- dotclaude-writer（2026-08-25、最終版 0.4.1、削除 commit bfbfd25）
    - 理由: 前提「`.claude/` は bypassPermissions でも書けない」が v2.1.126（2026-05-01）で崩れていた。
      bypass のセッションでは Write / Edit / Bash で直接書ける（2026-08-25 実測）。非 bypass では確認プロンプトに答える
    - 復元: `git show bfbfd25^:plugins/dotclaude-writer/skills/dotclaude-writer/SKILL.md`
- version-check の changelog 要約保存機能（2026-05-29、commit aae7ab2）
    - 理由: 仕様の矛盾を解消するため撤去
- gitdiff（2026-04-23、commit 940bd28）
    - 理由: vim で直接 diffview する運用に切り替えた
- session（旧、2026-04-23、commit 63a75be）
    - 理由: 陳腐化。同名の新 plugin（session-closing から改名）に置き換え
