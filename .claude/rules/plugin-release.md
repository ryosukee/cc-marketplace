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

## plugin を削除する手順

コードは削除し、archive へは移さない（git 履歴から取り出せる）。

1. plugin ディレクトリ、evals、marketplace.json のエントリ、README.md と CLAUDE.md の行を削除する
2. 他 plugin・rule・skill からの参照を grep で消す（既知バグ一覧のエントリが指していれば、そのエントリも直す）
3. `docs/retired-plugins.md` に 1 件足す: 名前・廃止日・最終版・削除 commit・理由・復元コマンド
4. `git commit` + `git push`、`claude plugins marketplace update cc-tools`、
   `claude plugins uninstall {plugin}@cc-tools`

## 複数箇所に書いてある事実を変えたら、全部を同じ変更で直す

plugin の中で同じ事実を 2 箇所以上に書いているものを変えたら、その全部を一緒に直す。
対象は条項の内容だけでなく、数量・呼称・パス・バージョンも入る。
書いてある先は検査スクリプト・雛形・agent の指示・README・CLAUDE.md。

- 変えた事実を表す語で repo を検索し、ヒットした箇所を 1 つずつ見る。
  条項なら条項の語、数量なら数字と単位、呼称なら旧い語、パスなら旧いパス
- 判定基準: 変える前を前提に書かれた記述が残っていないか
- 変えたのが条項なら、検査が通ることを検査が動いていることの証拠にしない。
  その条項に対応する検査が、意図どおり落ちるかを 1 度は確かめる

why: 実例が 2 件ある。2026-08-22 に HTML ページのセクション番号を見出しの外へ出す変更を入れたが、
それを検査する条項を旧方式のまま残した。検査は別のバグで素通りしていたため、2 release のあいだ
気づかなかった。2026-09-01 には機械検査の項目を増やしたとき、README と CLAUDE.md だけを直し、
スクリプト 2 本のヘッダを旧い数のまま残した。

## Evals の作成・実行トリガー

skill の発動測定 (`evals/`) は次のタイミングで作成・実行する。
作り方・レビュー工程・実行方法は `evals/README.md` に従う。

- 作成する: 新しい skill を追加したとき。発動漏れ・誤発動の事故が起きたとき
  (事故の再現プロンプトをケースに追加する)
- 実行する: skill の `description` またはトリガー条件を変更する release の前に、
  該当 plugin の evals を回して劣化が無いことを確認する
