# Plugin 更新手順

plugin の内容 (skills/agents/hooks/scripts) を変更したら、
必ず以下を一連で実行する:

1. plugin.json の `version` を bump する
2. README.md の該当 plugin セクション (バージョン番号) を更新する
3. CLAUDE.md の Plugin 一覧を更新する (構成変更がある場合)
4. `git commit` + `git push`
5. `claude plugins marketplace update cc-tools`
6. `claude plugins update {plugin}@cc-tools`

手元の plugin cache は update するまで古いバージョンのまま。
bump + push だけで終わらせない。

## Evals の作成・実行トリガー

skill の発動測定 (`evals/`) は次のタイミングで作成・実行する。
作り方・レビュー工程・実行方法は `evals/README.md` に従う。

- 作成する: 新しい skill を追加したとき。発動漏れ・誤発動の事故が起きたとき
  (事故の再現プロンプトをケースに追加する)
- 実行する: skill の `description` またはトリガー条件を変更する release の前に、
  該当 plugin の evals を回して劣化が無いことを確認する
