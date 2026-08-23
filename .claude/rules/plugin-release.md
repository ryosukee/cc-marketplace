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

## 規範を変えたら、それを検査している側を一緒に直す

skill / rule の条項を変えたら、その条項を参照している実装を同じ変更で直す。
参照先は検査スクリプト・雛形・agent の指示・README。

- 変えた条項の語で repo を検索し、ヒットした箇所を 1 つずつ見る
- 判定基準: その条項が変わる前を前提に書かれた記述が残っていないか
- 検査が通ることを、検査が動いていることの証拠にしない。
  変えた条項に対応する検査が、意図どおり落ちるかを 1 度は確かめる

why: 実例 (2026-08-22)。HTML ページのセクション番号を見出しの外へ出す変更を入れたが、
それを検査する条項を旧方式のまま残した。検査は別のバグで素通りしていたため、
2 release のあいだ気づかなかった。

## Evals の作成・実行トリガー

skill の発動測定 (`evals/`) は次のタイミングで作成・実行する。
作り方・レビュー工程・実行方法は `evals/README.md` に従う。

- 作成する: 新しい skill を追加したとき。発動漏れ・誤発動の事故が起きたとき
  (事故の再現プロンプトをケースに追加する)
- 実行する: skill の `description` またはトリガー条件を変更する release の前に、
  該当 plugin の evals を回して劣化が無いことを確認する
