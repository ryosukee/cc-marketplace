# Plugin 更新手順

plugin に対する一連の変更を完了したら、PR を merge する前に以下の版数更新と検証を一度行う。
レビュー中の修正コミットごとには版数を上げない。
`Claude Code + Codex` の plugin は、Claude Code と Codex の両方の手順を実行する。

## 対応 CodingAgent にかかわらず行う変更

1. 構成を変更した場合は、README.md の plugin 一覧を更新する
2. 変更の影響がある場合は、README に記載した対応 CodingAgent、requirements、setup 方法、未 setup 時の挙動を更新する

## Claude Code に対応する場合

1. `.claude-plugin/plugin.json` の `version` を上げる
2. Claude Code で変更した機能を検証する

## Codex に対応する場合

1. `.codex-plugin/plugin.json` の `version` を上げる
2. Codex で変更した機能を検証する

## 両対応の場合の追加確認

1. 名前付き agent を変更した場合は、Claude Code 用と Codex 用の定義・参照先を両方検証する。
   生成方式を採用した plugin では生成物も更新する
2. 両対応の hook を追加した場合は、同じ処理を行う既存 hook の置き換え要否を確認する

## 公開と手元への反映

版数更新と検証が済んだら、その変更を `git commit` と `git push` で反映する。
manifest の変更と push だけでは、手元にインストール済みの plugin は更新されない。
更新前から動いているセッションにも反映されない。再導入後に新しいセッションで確認する。

### Claude Code に対応する場合

```bash
claude plugins marketplace update cc-tools
claude plugins update {plugin}@cc-tools
```

### Codex に対応する場合

Git から登録した marketplace は、先に `codex plugin marketplace upgrade cc-tools` で更新する。
ローカルディレクトリから登録した marketplace では、この操作は不要。

```bash
codex plugin add {plugin}@cc-tools
codex plugin list --marketplace cc-tools
```

## plugin を削除する手順

コードは削除し、archive へは移さない（git 履歴から取り出せる）。
両対応の plugin は、Claude Code と Codex の両方から削除する。

1. plugin ディレクトリ、evals、marketplace.json のエントリ、README.md と CLAUDE.md の行を削除する
2. 他 plugin・rule・skill からの参照を grep で消す（既知バグ一覧のエントリが指していれば、そのエントリも直す）
3. `docs/retired-plugins.md` に 1 件足す: 名前・廃止日・最終版・削除 commit・理由・復元コマンド
4. `git commit` と `git push` を実行する

### Claude Code に対応する場合

`claude plugins marketplace update cc-tools` と
`claude plugins uninstall {plugin}@cc-tools` を順に実行する。

### Codex に対応する場合

`codex plugin remove {plugin}@cc-tools` を実行する。

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
