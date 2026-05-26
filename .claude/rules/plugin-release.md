# Plugin 更新手順

plugin の内容 (skills/agents/hooks/scripts) を変更したら、
必ず以下を一連で実行する:

1. plugin.json の `version` を bump する
2. README.md の該当 plugin セクション (バージョン番号) を更新する
3. CLAUDE.md の Plugin 一覧を更新する (構成変更がある場合)
4. `git commit` + `git push`
5. `claude plugins marketplace update cc-tools`
6. `claude plugins install {plugin}@cc-tools`

手元の plugin cache は update するまで古いバージョンのまま。
bump + push だけで終わらせない。
