# norm-refit PR 9 skill / agent の書き方の器: boilerplate からの抜き出し候補の調査

調査日 2026-08-26、boilerplate の基準 commit 789f95f、cc-marketplace main ce29314。
read-only の調査で、編集はしていない。行番号はこの 2 つの commit の実読。
パスの表記: boilerplate 側は `/Users/ryosuke/ghq_root/github.com/ryosukee/product-boilerplate/bundles/core/rules/` からの相対、cc-marketplace 側は `/Users/ryosuke/ghq_root/github.com/ryosukee/cc-marketplace/` からの相対で書く。

結論。boilerplate の 4 ファイル（skill-authoring / agent-authoring / claude-component-authoring / authoring）のうち、どのプロジェクトにも効く抜き出し候補は、authoring の 8 条項（what と why の pair、why の過去形判定、具体事例の例外規定、指示でない文が密度を下げる why、コードベースから読める情報を書かない、一時的な状態を書かない、諦めルールの前に root cause、依頼形を使わない）、skill-authoring の 6 条項（決定論的な手続きはスクリプトへ、description は発動条件を能動的に、自動発動させたい skill は発動点を書く、既定値のフィールドを書かない、呼び出し元を問わず動く設計、skill 自身を語る導入文の禁止）、agent-authoring の 6 条項（1 ファイル 1 agent、frontmatter の形式、tools を責務から逆算、冒頭の役割定義、完了報告の 2 分割、入力と出力の明示）、claude-component-authoring の 3 条項（種別選択の判断フロー、種別の付け替え、kebab-case 命名）。boilerplate の構成に依存して採らないのは、2 種別（作業手順 / 参照知識）と `ref-` prefix、ドメイン知識を rule へ分離する要求（cc の plugin-design「Plugin 自己完結」と衝突）、model 選定指針（実態と逆）、stack rule 前提の tool 優先順位、Guardrail / Harness の造語、外側の構造への言及、markdown リンク禁止（f041 で不採用）。共通条項の持ち方は 3 案（一般化 1 本 / 別建て / 共通 + 種別別）で、ユーザー判断は 16 件。

この作業の台帳上の起点は `notes/norm-refit.md:1287-1288`（ccm-f041 Q2）「`rule-authoring.md` に置き、rule の範囲（…）で効かせる。skill / agent への展開は必要が出たときに別途」で、今回がその「別途」にあたる。

## 0. 前提の観測

- boilerplate の 4 ファイルの履歴（`git log --follow`）は 3 commit（98387d3 → 84f5f7a → 789f95f、最終 2026-08-20）。直近の 789f95f は `bundles/` への改名だけで、内容の最終変更は 84f5f7a「core plugin: paths 付与とテスト規範・git 規範の整理」。rule-authoring を抜き出した 2026-08-23 以降、原本は動いていない
- cc-marketplace の対象は SKILL.md 22 本・agent 7 本。frontmatter と本文の実態は (a) の各所と (d) に書く
- 前例（f041）で採らなかった条項のうち、boilerplate の `rule-authoring.md` L25-30（具体的に書く / 矛盾させない / 自己完結 / 消える成果物を参照しない）・L47-49（陳腐化の削除 / 遡及修正しない）・L62-67（チェックリスト）を落とした理由は、台帳の f038 Q8・f040・f041 エントリには「boilerplate 3 候補」（`notes/norm-refit.md:1301`）と採用側しか書かれておらず、条項ごとの棄却理由は見つからなかった（未確認）。今回同じ条項が skill / agent 側で再び候補になる（(c) 5）

## (a) boilerplate 4 ファイルの条項の三分類

### authoring.md（共通原則、181 行）

抜き出し候補（どのプロジェクトにも効く）:

- L15-17「指示には「何をする / しない (what)」と「なぜそうするか (why)」を pair で書く。what だけでは edge case で判断材料が不足する。why があれば指示の本質を理解した上で、未知のケースにも適用できる」。cc の `rules/rule-authoring.md:70` は why の中身（何が壊れるか）だけで、pair にする要求そのものは無い
- L21-28 why の書き方のうち「現在形で書く。いま何が成り立つかだけを述べ、何があったかは書かない」「主語を指示の対象に取る。書き手や過去のセッションを主語にしない」「判定基準: 書いた why を過去形にできるか。できるなら経緯が混ざっている」。cc rule-authoring L71-72 は「日付付きの具体事例を書かない」までで、過去形判定は無い。L22「定義を読むだけで完結させる。外部の文書や個別事例への参照に依存しない」は参照 3 条項と整合する範囲で候補
- L40-43「具体事例を書いてよいのは、次のいずれかに該当する場合のみ。抽象的な指示の例として列挙する場合 / 致命的で、具体的な禁止指示が必要な場合」。抽象化の要求自体は重複（後述）だが、この例外規定は cc rule-authoring に無い
- L63-64 の why「指示文書はセッションのたびに読み込まれる。指示でない文はコンテキストを消費するだけでなく指示の密度を下げ、agent が要点を拾い損ねる原因になる」。「入れないもの」の 5 項目自体は core が持つ（後述）が、指示文書固有のこの理由は候補
- L79「実際のコードやディレクトリを見れば分かる情報を指示文書に書かない。二重管理はメンテ負荷と乖離リスクを生む」、L83-85「ディレクトリ構成の転写。Glob や `ls` で取得できる / 関数のシグネチャ一覧、ファイル数、コード行数。変わるたびに更新が必要になる / 実コードのコピー」、L93-95「コードサンプルは、原則だけでは agent が正しいコードを書けない場合のみ、原則を示す最小限の擬似コードとして載せる。載せた時点で実コードとの同期を維持する義務が生じる。この義務を負いたくないなら載せない」。cc 側に対応する条項は無い。`.claude/rules/plugin-design.md` の「`internal/` のファイル形式を SKILL.md (markdown) に直書きしない」はこの条項の plugin 固有の具体形
- L102-103「特定インシデントの調査状況や修正進捗（「root cause 未特定」「次回検証予定」「暫定 workaround」等）を指示文書に書かない。状態の追跡は、進捗の記録を目的とする文書（handover・issue 等）で行う」、L105-106「workaround を手順に組み込む場合は、一時的であることを示す注記ではなく手順として完結させ、状態が変わったら手順ごと削除する」。cc の `reference-docs.md:35-36`（一度きりの手順・環境固有の事情・経緯を分離）と近いが「一時的な状態」は別物。cc の claude-known-issues plugin が「進捗の記録を目的とする文書」にあたり、運用は整合する。ただし現行の `plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:3` の description「（現在はレンダリングバグによる AskUserQuestion 使用禁止の時限措置あり）」が L105-106 に反する（(d) 10）
- L126「「失敗したらリトライせず停止」「タイムアウトしたらスキップ」等の諦めルールを書く前に、root cause を調査する」、L130「調査しても原因不明の場合のみ、「原因不明。調査ログ・再現手順付きで停止」と書く」。cc 側では `plugins/session/skills/retrospective/SKILL.md:130-135`「インシデントから 3 段階以上遡る」が codify 経路にだけある。rule として持つなら候補（弱。次の「未検証の仮説」と 1 条項に畳める）
- L163-164「定義形で書く。「〜する」「〜を読む」「〜しない」の形にし、依頼形（「〜してください」）を使わない。指示文書は agent への依頼ではなく、守るべき定義そのものを置く場所」。cc の `reference-docs.md:44`「だ体で書く。手順の指示文は命令形にする」が近いが、依頼形の禁止は明示されていない。1 行の補強として候補（(d) 14 で reference-docs との重なりを決める）

boilerplate の構成に依存する（採らない）:

- L11「ここには全種別に共通する原則だけを置き、種別ごとの各論は種別別の authoring rule が持つ」、L181「種別ごとに足す項目は、種別別の authoring rule が持つ」。外側の構造への言及。cc rule-authoring L50-52 の参照条項 2 に反する（前例と同じ判断、(c) 3）
- L70-72「他の指示文書への markdown リンクを書かない。…例外: 冒頭の地図で、担当を分け合う文書を記述名（リンクなし）で示すのは可」。f041 で不採用と決着済み（`notes/norm-refit.md:1284-1286`、`notes/idea-hub-handoff.md:25-31`）
- L136-147「指示文書内でコード調査の手段を指定するときは、環境固有のツール名を羅列せず、次の抽象形の優先順位で書く。1. セマンティックな調査手段（LSP 系…）」。boilerplate の stack rule（`agent-authoring.md:53-54`「どれを第一選択にするかは stack 側の rule が定める」）の存在が前提。cc-marketplace の plugin は Bash / Markdown で LSP を持たない

core か rule-authoring か plugin-design が既に持つ（重複、採らない）:

- L32-33「特定のインシデントを元に指示を追加・修正するときは、その事例をそのまま書かない。同種の問題全般に適用できる抽象的な指示に昇華する」→ cc rule-authoring L23-24「rule にするのは表面の行動ではなく、その行動を生んだ判断の構造にする。「X をした → X するな」の形は、場面の形が変わると適用できない」と `reference-docs.md:37`「汎用 rule に固有事例を書くのは why の実例として最小限に留め、例と分かる形にする」
- L51-55「導入の経緯 / 自己正当化 / スコープ断り書きの繰り返し / 進行の実況 / 直前の言い換え」と L59-61「適用条件・例外 / 判定基準 / 簡潔な why」→ `core.md:116-128`（経緯・出典注記の抑制）、`core.md:110-112`（文章自身を語る文を削る）、`core.md:105`（1 つの主張は一度だけ）、`core.md:78-84`（前提・条件・例外・範囲の宣言は圧縮後も残す）、`core.md:267-268`（誇張形容）、cc rule-authoring L28（補足説明を消しても判断が変わらないなら消す）
- L68-69「外側からの呼ばれ方に言及しない。「X から起動される」「Y が参照する」等は、呼び出し側の変更で定義まで修正が必要になる」→ cc rule-authoring L50-52 参照条項 2。ただし現行 rule-authoring は paths が rule 限定なので、skill / agent へ効かせるには一般化が要る（(b)）
- L113「振り返りやレビューで得た原因の推定を、検証なしで指示に反映しない。推定が正しいか確認してから書く」→ `rules/primary-sources-first.md` 常時ロード（「その記述を「たぶんこうだ」と思って書いたなら、まだ裏を取っていない」「測ったものと本当に測りたかったものが同じかを確かめる」）と `plugin-design.md`「宣言した設定は発火させるまで未検証」
- L151-156「指示の文言・構造を改訂するとき、違反を削除するときは、見つけた 1 箇所だけ直して終わらせない。文言（…）を改訂したら、その文言を引用している他のファイルを grep で全件確認し、追従更新する」→ `core.md:292-295`（論点を移したら旧い配置を前提にした参照を更新、用語を変えたら旧い語で検索して残存 0）、`.claude/rules/plugin-release.md`「規範を変えたら、それを検査している側を一緒に直す」（project rule）。ただし cc rule-authoring の改訂節（L76-80）には無いので、一般化案では改訂節に 1 行足すかを (d) 14 で決める
- L176-179 チェックリスト「自己完結 / アクショナブル / 無矛盾 / 最新」→ f041 で boilerplate rule-authoring L62-67 のチェックリストを採らなかった前例に揃える（(c) 4）。個別項目は `core.md:284-295` 出す前の検算と cc rule-authoring L26-27（判断基準にならない rule）が持つ

### skill-authoring.md（129 行）

抜き出し候補:

- L16「判定基準: 読み手の agent にさせたいことが作業の実行なら作業手順 skill、知識の参照なら参照知識 skill」。判定文そのものは Claude Code 一般。ただし 2 種別の分類を採るか自体が判断（(d) 3）
- L26-28「作業手順 skill の中で、入力から出力が一意に決まる手続きは、本文に手順として書かずにスクリプトへ出し、SKILL.md からはその実行を指示する」、L30-31「判定基準: その手順を 2 回実行したとき、agent の判断で結果が変わりうるか。変わらないならスクリプトにできる」、L33-35「対象になるもの: ファイルの収集・整形・集計、決まった順序でのコマンド実行、形式が決まった出力の生成 / 対象にならないもの: 読んで判断する、案を出す、優先順位を決める」、L37-38 why「決定論的な手続きを自然言語で書くと、実行のたびに解釈の揺れが入り、結果が再現しない。トークンも毎回消費する」。cc-marketplace は実践済み（handover 機械検査 9 種・page 機械検査 15 種、`CLAUDE.md` Plugin 一覧）で、置き場は `plugin-design.md` kernel パターン（`skills/{skill}/scripts/`）が持つ。判定と why だけを採り、置き場（L27-28「スクリプトは skill の参照資材として同梱する」）は plugin-design に任せる
- L48-50「description は skill が発動するかを決める。「〜に関する skill」のような受け身の要約でなく、発動条件を能動的に書く。どちらの種別でも、対象 skill の機能だけを書き、他 skill との関係や補完関係を含めない」。cc 側の対応物は `evals/README.md:80-89`（ケース設計の規範。L82「プロンプトに skill 名を書かない。トリガー語の丸写しも避ける」、L88-89「description の弱点探しには間接正例と強い負例の追加が要る」）と `plugin-release.md`「skill の `description` またはトリガー条件を変更する release の前に…evals を回して」で、description そのものの書き方の規範は無い。現行 22 本のうち、受け身の要約だけでトリガー語も発動点も無いのが dotclaude の 3 本（`plugins/dotclaude/skills/{cross-review,doctor,registry}/SKILL.md:3`）、他 skill との関係を含むのが `registry`（「doctor skill が参照するリポジトリリストを管理する」）と `plugins/impl-spec/skills/requirements/SKILL.md:6`（「design skill の入力になる」）
- L54-55「description は pushy に書き、「〜に関するタスク時に必ず読み込むこと」のような強い指示を含めて、agent が読み飛ばさないようにする」。boilerplate では参照知識 skill 限定だが、cc-marketplace は作業手順 skill でこの形を使っている（ask-with-choices / html-communication / github-pr の 2 本 / usage-line の description「〜前に必ず読む。…が発動点」）。種別を外して「自動発動させたい skill は発動点を書く」に一般化すれば候補
- L67-70「用途を特定の操作（レビュー・実装等）に限定しない。知識はどの操作でも参照される」。参照知識 skill 限定の条項なので、2 種別を採るなら候補、採らないなら落ちる
- L72-73「作業手順 skill は `user-invocable` を指定しない（既定のままユーザーが呼べる）。description には発動させたい場面の言い回しを列挙する」。後半は cc の慣習（「…等で発動」形式 16 本）と一致。前半は cc の 5 本（cache-keepalive・mkdocs-setup・impl-spec 3 本）が `user-invocable: true` を明示していて反する（(d) 7）
- L110-112「呼び出し側に固有の概念（工程名・直前の工程の成果物等）を前提にしない / 入力は最小限の必須項目 + 任意のコンテキスト情報で構成する / 任意項目が無くても基本機能は動くようにする（精度は下がってよい）」、L116-117「「前工程の成果物」のような呼び出し元前提の語を避け、コンテキストを問わない表現にする」。L103-106 の「単体実行 / 注入実行」は boilerplate のパイプライン語彙だが、cc-marketplace も同じ形（session:end が debrief / retrospective / handover を順に呼ぶ、dotclaude の 3 skill が agent を呼ぶ、自動発動）を持つ。「呼び出し元を問わず動く設計にする」へ一般化して候補
- L121-126「作業手順 skill は、H1 直後の導入文も各ステップも定義形で書く。…NG: 「この skill は調査作業を支援します」（skill 自身を語っていて、何をするかの定義になっていない）」。`core.md:110-112` の一般形と重なるが、skill 固有の NG 形は候補。現行では `plugins/mkdocs-setup/skills/mkdocs-setup/SKILL.md:3`「…注入するスキル。」L14「本スキルはセットアップとテンプレート管理の複合スキル」、impl-spec 3 本の description「設計書を作成する skill。」がこの型

boilerplate の構成に依存する（採らない）:

- L10-11「種別の分類と命名は Claude Code コンポーネントの種別と使い分けの rule が持つ」。外側の構造への言及（(c) 3）
- L18-22「作業手順 skill はドメインに依存しない汎用定義にする。ドメイン固有の知識・規約は rule か参照知識 skill に分離し、作業手順 skill には入れない。OK: 「既存の成果物と矛盾していないか」（汎用の観点）/ NG: 「ドキュメントを Grep で探して整合性を確認する」（ドメイン固有の手段の指定）」。cc の `plugin-design.md`「Plugin 自己完結: plugin は skills / hooks / agents で自己完結する。rule の存在を暗黙前提にしない。前提となる振る舞いは SKILL.md や hook のドキュメント内に組み込む」と真っ向から衝突する。cc-marketplace の skill は配布物なので rule へ分離できない（(d) 4）
- L42-44「skill 同士は疎結合にする。「別の skill のファイルを探して読め」という指示は結合が強すぎるので書かない。何を注入するかの宣言は呼び出し側の設定が持つ」。3 文目は boilerplate の注入設定が前提。1〜2 文目は rule-authoring 参照条項 2・3 の一般化で足りる（cc では呼ぶ側の skill が相手を名指しするのは条項 3 で許される）
- L52-53「参照知識 skill は `user-invocable: false` にする」と L57-65・L75-82 の frontmatter 例（`ref-test-design` / `investigate`）。2 種別と `ref-` prefix に依存
- L86-87「見出しは次の構造にする。手順を説明するセクション名は「手順」にする。呼び出し元の仕組みの名前をセクション名に使わない」と L89-99 の雛形。見出し名の固定は boilerplate の統一規約。cc の現行は「## 手順 / ### ステップ N」（known-issues-reviewer）、「## 処理フロー / ### 1.」（mkdocs-setup）、「## 処理 / ### 1.」（cluster-merger）と不揃いで、揃えるなら判断が要る（(d) 15）。「呼び出し元の仕組みの名前をセクション名に使わない」は参照条項 2 の一般化で足りる
- L128-129「参照知識 skill の本文は宣言的に知識を書く。指示形や手順のステップを持たない。H1 の付け方・見出し構成・箇条書きの書式は rule と同じで、rule の書き方の rule がそのまま当てはまる」。2 種別依存 + 外側の構造への言及

既に持つ（重複）: skill-authoring 固有で core / rule-authoring に完全に重なる条項は無い。部分重複は上の各項に書いた。

### agent-authoring.md（88 行）

抜き出し候補:

- L14「1 agent 1 ファイル。ファイル名は agent 名と一致させる（agent `code-review` なら `code-review.md`）」。cc の 7 本はすべて一致している。規約として候補
- L18-24 frontmatter の 4 項目（name / description / model / tools）と注記「省略時は親から継承」「省略時は全ツールを継承」。形式は Claude Code 一般。ただし cc の `tools` 表記が 2 通り（カンマ区切り文字列: known-issues-reviewer・dotclaude 3 本・spec-reviewer、YAML リスト: page-reviewer・handover-reviewer）で、どちらを規約にするかは公式仕様を未確認（(d) 6）
- L46「責務の遂行に必要な tool から逆算して選ぶ」。この 1 文だけ候補。続く L46-54（別 rule の tool 優先順位との整合、LSP）は boilerplate 依存
- L58-64「agent 定義の冒頭に以下の 5 節を書く。ゴール: この agent が達成すべきこと（1〜2 文）/ やること: 具体的な作業内容の箇条書き / やらないこと: 責務外の作業を why 付きで列挙。agent が「やりたくなるが踏み込むべきでない」操作を明示する / 詰まった場合: 問題に遭遇した時の行動（差し戻す / 報告する）/ 完了報告: プロセス結果と品質判断を分けて報告する」、L66-68 why「冒頭に責務の全体像がないと、agent が手順の途中で責務を拡大解釈する。「やらないこと」が明示されていないと、関連する作業に踏み込んでコンテキストとターンを浪費し、本来の責務がおろそかになる」。cc の agent は 5 節の形ではないが中身は持つ（`plugins/claude-known-issues/agents/known-issues-reviewer.md:11`「一覧ファイルと state.json は編集しない」、`plugins/claude-user-communication/agents/page-reviewer.md:15`「見るのは **判断を変えうる欠陥だけ**」、`plugins/session/agents/handover-reviewer.md:17`）。`plugins/dotclaude/skills/doctor/SKILL.md:419-427` の「agent / skill authoring 原則」（意図セクション / ルール・注意事項 / 出力フォーマット / read-only 役割は Write/Edit を外す）が cc 独自の同等物。5 節を形として義務化するか、中身（責務の範囲・やらないこと・詰まった場合・報告の形）だけ求めるかが判断（(d) 9）
- L72「「プロセスが完了した」と「成果物が期待を満たしている」は別の判断。完了報告では両方を分けて書く」、L74-75「プロセス結果: ビルド PASS / テスト PASS / スクリーンショット撮影成功 等の事実 / 品質判断: 成果物が期待する基準を満たしているかの評価」、L80 why「プロセスの完了を成果の品質と混同すると、壊れた成果物が「完了」として報告される」。例がコードプロジェクト寄りなので、例を差し替えれば候補。cc の `rules/japanese-text-writing.md`「失敗・未完了を成功と紛れる書き方にしない」が隣接するが、報告の 2 分割は無い
- L84-85「入力と出力を明確にする。どんな情報を受け取り、何を返すか / 手順は具体的に。実行するコマンド、読むファイル、判断基準を書く」。cc の 7 本は全て「## 入力」節を持つ。候補

boilerplate の構成に依存する（採らない）:

- L29-42 model 選定「plan で確定済みの変更を実行する実装系 | sonnet / 独立視点で設計判断・レビュー・整合性検証を行う review 系 | opus」と「sonnet 化の前提: plan 側で…具体化しておく」。plan → 実装 agent のパイプライン前提。cc の実態は逆で、review 系の page-reviewer・handover-reviewer が `model: sonnet`（実測で判断を変えた指摘の出所を絞った結果、`page-reviewer.md:17-22`）、dotclaude の分析 agent が opus
- L46-54 tools の後半「別の rule で tool の優先順位を定めている場合、その第一選択肢が `tools` に含まれているか…どれを第一選択にするかは stack 側の rule が定める」。stack rule 前提

既に持つ（重複）:

- L86「他の agent を具体名で参照しない。パイプライン構成の知識はパイプライン側がプロンプトで注入する」、L88 why「agent 定義が他 agent に依存すると、構成変更のたびに複数の agent 定義を修正する必要がある」→ cc rule-authoring L50-52 参照条項 2（一般化が前提）。現行で反するのは dotclaude 3 agent（`dotclaude-claude-scanner.md:3` と L10「dotclaude plugin の skill (cross-review / doctor) から呼ばれる」、`dotclaude-cluster-merger.md:3`・L10、`dotclaude-repo-profiler.md:3`・L10）と `plugins/impl-spec/agents/spec-reviewer.md:8-9`「requirements / design / test-plan skill が出力する成果物を…呼び出し元の skill が入力として…渡す」（(d) 9）

### claude-component-authoring.md（65 行）

抜き出し候補:

- L39-45 判断フロー「1. 特定のファイルパターンに対する宣言的な制約・規範か → rule / 2. ファイルパターンにスコープできない知識・規約か → 参照知識 skill / 3. モデルの判断を挟まず必ず実行される必要があるか → hook。rule と skill はモデルへの指示なので従われない可能性が残り、強制は hook だけができる / 4. 独立したコンテキスト・tool 制限・model 指定で実行させたい specialist か → agent / 5. 手順と参照資材を伴う作業か → 作業手順 skill / 6. どれにも該当しないプロジェクト全体への指示 → CLAUDE.md（rule にしない）」。3 の hook の根拠は cc の `plugin-design.md` 監視機構の選択（hook と monitor）に無い。ただし置き場が問題で、「まだ存在しないファイル」の種別を選ぶ場面では paths 条件ロードの rule は載らない。cc の実際の入口は `plugins/session/skills/retrospective/SKILL.md:80-86` の昇格先表と `doctor/SKILL.md` の合成原則（(d) 5）
- L23-24「agent は独自の system prompt・tool 制限・model 指定を持ち、skill を注入して使える。skill は単体で完結し、実行環境の指定を持たない」。種別の違いの定義として候補（cc の impl-spec 3 skill は `model: opus` を持っており、「skill は実行環境の指定を持たない」と食い違う。公式仕様で skill の `model` フィールドが有効かは未確認、(d) 7）
- L54・L59「内容がどちらの発動条件に合うかが変わったら、種別を付け替える」「付け替えたら元の種別から該当部分を削除する。両方に残すと drift の元になる」。弱い候補
- L65「名前は内容を表す記述的な kebab-case にする。分類コード・略号を新設しない」。cc rule-authoring L14 は rule の命名だけで、skill / agent の命名は `.claude/rules/coding.md`（plugin 名・script 名）にも無い。一般化して候補

boilerplate の構成に依存する（採らない）:

- L15-21 種別一覧表の「参照知識 skill (`ref-`)」「作業手順 skill」の 2 分類と、L26-35 二層の品質制御「Guardrail | 受動的な制約と知識 | rule・参照知識 skill / Harness | 能動的なワークフロー制御 | 作業手順 skill・agent」。boilerplate 独自の造語（`core.md:159-163` 独自語を作らない）
- L47-49「知識・規約は可能な限り rule に置く。…参照知識 skill は description のセマンティックマッチに依存するため発動が不確実で、スコープも曖昧になりやすい」。2 種別前提。ただし「description による発動は不確実」という事実は cc の evals 運用の前提で、description 条項の why に流用できる
- L63-64「参照知識 skill には `ref-` prefix を付ける。prefix の統治で全 repo 共通なのはこの 1 つだけで、作業手順 skill に共通 prefix は定めない」。cc-marketplace に `ref-` skill は 0 本。一方 `retrospective/SKILL.md:83-84` は昇格先に `.claude/skills/ref-{topic}/` と `.claude/skills/op-{name}/` を書いており、boilerplate の「作業手順 skill に prefix は定めない」とも食い違う（(d) 3）

既に持つ（重複）: L17「rule | paths マッチで自動ロード」→ cc rule-authoring L33-41 ロード方式。

### rule-authoring.md・claudemd.md（参考）

- boilerplate `rule-authoring.md` は f041 で処理済み。今回 skill / agent へ一般化するときに再び候補になるのは L29-30「消える成果物（実装計画の phase 番号・step 番号など）や過去の状態を参照しない。具体例には現時点で実在する名前を使う」（cc の `page-reviewer.md:17-22`「以前は 4 facet…実測（2026-08-18、ih-f007）で…」と `handover-reviewer.md:19-27`「以前は 4 観点…実測（2026-08-18〜19、R1〜R5 で打ち切り）…」が過去の状態 + 日付を本文に持つ）と L47「陳腐化した記述・rule は削除する」
- `claudemd.md` は paths が `CLAUDE.md` で今回の器の外。汎用なのは L13-16（200 行以下 + why）、L20-21「判定基準: プロジェクトの事実を伝える記述は CLAUDE.md、作業の仕方を課す規範は rule、機能の仕様は docs 配下の設計ドキュメントに置く」、L43-46（rule との重複禁止 + why）、L50-56（更新タイミング）。boilerplate 依存は L28「レイヤー名と実装ルートの対応（…rule 配置の検証に使う）」（`rule-placement.md:44-46` のミラー配置前提）と L39「docs 配下の設計ドキュメント」。cc-marketplace は CLAUDE.md の書き方の rule を持たず、`doctor/SKILL.md:407-417` に boilerplate と同内容の写しがある。CLAUDE.md を今回の範囲に含めるかは (d) 11

## (b) 抜き出し候補から組む rule の案

### 共通条項の持ち方（3 案）

判断の前提: cc rule-authoring 81 行のうち、rule 固有なのは冒頭条項 L18-19（paths を言い直さない）とロード方式 L31-44 の約 18 行で、残り（命名・条項の書き方・参照 3 条項・アンチパターン表・why・改訂）は文書種別を問わない。

案 1: rule-authoring を「Claude 向け文書の書き方」へ一般化して 1 本にする。paths に skill / agent を足し、種別固有節（rule: ロード方式、skill: frontmatter・スクリプト化・呼び出し元非依存、agent: 役割定義・完了報告・tools）を同じファイルの後半に置く。推定 130〜150 行（未算出。共通 50 + rule 固有 18 + skill 固有 40 + agent 固有 30 の粗い足し算）。

- 利点: 共通条項が 1 箇所（`core.md:90-91` 同じ情報を複数の節に書かない、`claudemd.md:46` 片方だけ更新されて陳腐化する、に沿う）。参照 3 条項が改変なしで skill / agent に効く。rule を書く場面と skill を書く場面で同じ判断基準が同じ文言で載る
- 欠点: skill 編集時に rule 固有の 18 行、rule 編集時に skill / agent 固有の 70 行前後が載る（`rule-placement.md:57-58`「1 rule 1 テーマ。適用範囲の異なる内容を 1 ファイルに同居させない」に反する）。ファイル名 `rule-authoring.md` が実態と合わなくなり改名が要る。改名すると f040 Q4 の決め手「写し元（product-boilerplate の同名ファイル）との対応が名前から追える」（`notes/norm-refit.md:1234-1235`）が崩れ、`notes/idea-hub-handoff.md:19-34` の書き直しも要る

案 2: rule-authoring はそのまま、`skill-authoring.md`（agent の節を含む 1 本）または `skill-authoring.md` + `agent-authoring.md`（2 本）を新設し、共通条項は新 rule 側に「Claude 向け文書」の言い方で再掲する。

- 利点: 各ファイルが自己完結。paths が狭く、載る量が場面ごとに最小。boilerplate と同名で対応が追える（f040 Q4 の決め手を保つ）。rule-authoring と handoff に手を入れない
- 欠点: 参照 3 条項・why の書き方・改訂の条項が 2 本（agent を分ければ 3 本）に重複し、直すとき同型箇所の追従が要る。rule-authoring 参照条項 1 は「自動ロードで既に載る文書に言及しない」なので、skill 編集時に載っていない rule-authoring を新 rule から参照すること自体は条項 3 で可能だが、rule-authoring は入口 rule ではないので「辿らせる責任」の根拠が弱い

案 3: 共通 1 本 + 種別別（boilerplate と同形）。`instruction-authoring.md`（仮。paths = rules + skills + agents）に共通条項を移し、`rule-authoring.md` は rule 固有の 18 行だけ残し、`skill-authoring.md` / `agent-authoring.md` を種別固有だけで新設する。

- 利点: 重複ゼロで各 paths が狭い。boilerplate の `authoring.md` + 種別別と 1 対 1 に対応する
- 欠点: ファイルが 3〜4 本になり、rule 編集時に 2 本が同時に載る。f041 は `authoring.md` と `rule-authoring.md` の 2 本を 1 本に畳んだので、前例と逆方向の再分割になる。共通 rule の名前を新設する必要がある（boilerplate の `authoring.md` は cc の `rules/` フラット構成（`user-global-rules.md:25-27`「ファイル名だけで対象が分かるようにする」）では意味が取れない）

### 名前

- `skill-authoring.md` / `agent-authoring.md`: boilerplate と同名で対応が追える（f040 Q4 の決め手と同じ）。案 2 / 案 3 向き
- `claude-doc-authoring.md` / `instruction-authoring.md`: 案 1 / 案 3 の共通 rule 向き。boilerplate に無い名前なので対応は handoff で説明する。boilerplate の `claude-component-authoring.md` と名前を近づけると、中身が違う（あちらは種別の選び方）のに同じものと誤読される
- 1 本で skill と agent をまとめるなら `skill-authoring.md` の名は agent を隠す。`skill-agent-authoring.md` のような複合名か、`claude-doc-authoring.md` の側に寄る

### paths

- skill: `**/skills/*/SKILL.md`。ファイル名で絞れるので過剰一致が少ない。`references/` 配下（例: `plugins/claude-user-communication/skills/html-communication/references/`）を含めるなら `**/skills/**/*.md`（boilerplate は `.claude/skills/**/*.md` で含めている）。含めると skill の参照資材（雛形・パターン集）にも frontmatter / description 条項が載るので、含めない方が条項と対象が合う
- agent: `.claude/agents/*.md` と `plugins/*/agents/*.md` を列挙するか、`**/agents/*.md` で広く取るか。後者は `agents` という名のディレクトリ全般に当たる（docs 等）。cc-marketplace の実配置は `plugins/{plugin}/agents/*.md` の 7 本
- 相対パターンはセッション起動 repo のルートから解決される（`user-global-rules.md:34-36`）。`**/` 先頭は `markdown-formatting.md` の `**/*.md` で実績がある（`README.md:88`）
- 発火の検証が要る 2 点: (1) `**/skills/*/SKILL.md` の形が一致するか、(2) 新規作成（Read せず Write）の場面で paths 条件ロードが載るか。後者が載らないなら、新規作成時の入口は retrospective / doctor skill 側に残る（(d) 16）

### 冒頭 1〜3 行（案 2 の 1 本形）

「skill と agent の定義ファイル（SKILL.md、agent の .md）の frontmatter・冒頭・本文・参照・改訂を定める。新規作成と改訂の両方でこの規範に従う。」（cc rule-authoring L9-10 と同じ型。適用範囲は paths が表すので言い直さない）

案 1 なら「rule / skill / agent の定義ファイルの命名・冒頭・条項・参照・改訂と、種別ごとの固有事項を定める。」

### 条項の並び（案 2 の 1 本形）

1. 命名: 内容を表す kebab-case、分類コード・略号を新設しない（claude-component-authoring L65）、agent は 1 ファイル 1 agent でファイル名 = name（agent-authoring L14）
2. 冒頭: skill は H1 直後に「何をするか」を定義形で（skill-authoring L121-126）、agent は責務の範囲（ゴール / やらないこと / 詰まった場合 / 報告の形）を冒頭に（agent-authoring L58-68。5 節固定にするかは判断）
3. frontmatter: description は発動条件を能動的に、自動発動させたい skill は発動点を書く、他 skill との関係を含めない、既定値のフィールドを書かない（skill-authoring L48-55・L72-73）。agent は tools を責務から逆算（agent-authoring L46）
4. 本文の条項: 決定論的な手続きはスクリプトへ（判定基準 + why、置き場は書かない）、呼び出し元を問わず動く設計（入力は必須 + 任意、任意が無くても動く、呼び出し元前提の語を避ける）、入力と出力を明示、判断基準を書く（skill-authoring L26-38・L110-117、agent-authoring L84-85）
5. 書かないもの: コードベースから読み取れる情報（authoring L79-95）、一時的な状態（L102-106）、具体事例の例外規定（L40-43）
6. 完了報告: プロセス結果と品質判断を分ける（agent-authoring L72-80）
7. 参照: rule-authoring L48-54 の 3 条項を「Claude 向け文書」の言い方で（案 2 では再掲、案 1 では共通節）
8. why の書き方: 何が壊れるか、日付付き事例を書かない、過去形にできる文は経緯（rule-authoring L70-72 + authoring L23-28）
9. 改訂: 既存記述を根拠にしない（rule-authoring L76-80）。文言を変えたら引用側を追従（authoring L151-156 を 1 行で足すかは判断）

## (c) 前例（f041）と同じ判断が今回も要る箇所

1. markdown リンク禁止の同族: `skill-authoring.md:42-44`「「別の skill のファイルを探して読め」という指示は…書かない」と `agent-authoring.md:86`「他の agent を具体名で参照しない」。f041 と同じく一律禁止を採らず、参照 3 条項（自動ロードで載る文書に言及しない / 外側の構造に言及しない / 辿らせる責任がある文書は参照を書く）で置き換える。cc-marketplace では呼ぶ側（session:end、html-communication → page-reviewer、dotclaude skill → agent）が名指しするのは条項 3 で正当で、呼ばれる側（dotclaude 3 agent、spec-reviewer）が呼び出し元を書くのが条項 2 に反する
2. 例外規定「冒頭の地図で記述名（リンクなし）で示す」（`authoring.md:72`）: 前例どおり不採用。skill-authoring L10-11 の冒頭 2 文目がこの型
3. 外側の構造への言及: `authoring.md:11`・L181、`skill-authoring.md:11`・L129 の「種別別の rule が持つ」「rule の書き方の rule がそのまま当てはまる」。前例どおり落とす
4. チェックリスト（`authoring.md:172-181`）: 前例で boilerplate rule-authoring のチェックリストを採らなかったのと同じ扱いにするか。採らない理由の記録は台帳に無い（0 節）
5. 改訂節の「陳腐化した記述の削除」「同型箇所の一括追従」（boilerplate rule-authoring L47-49、authoring L149-159）: 前例で採らなかった。今回、agent 2 本の日付付き経緯（page-reviewer / handover-reviewer）を直す根拠として要るなら、判断を出し直す
6. 日付付き具体事例の禁止（cc rule-authoring L71-72）: rule 向けに書いた条項がそのまま agent の本文に当たる。一般化すれば page-reviewer.md:17-22・handover-reviewer.md:19-27 が対象になる。これは PR 5（review agent の責務統一、`notes/norm-refit-plan.md:375-390`）が同じファイルを触る

## (d) ユーザーに判断が要る点

1. 共通条項の持ち方: 案 1（一般化 1 本）/ 案 2（別建て、重複あり）/ 案 3（共通 + 種別別）。名前とセット
2. skill と agent を 1 本にするか 2 本にするか。agent 固有の候補は約 30 行（役割定義・完了報告・tools・ファイル名 = name）
3. 2 種別（作業手順 / 参照知識）の分類を採るか。cc-marketplace に参照知識 skill は 0 本。採らないなら skill-authoring L16・L52-55・L67-70 が落ち、description 条項は種別を外した形になる。`retrospective/SKILL.md:83-84` の `ref-` / `op-` prefix との整合も要る
4. `plugin-design.md`「Plugin 自己完結」と boilerplate `skill-authoring.md:18-19`「ドメイン固有の知識・規約は rule か参照知識 skill に分離」の衝突: cc 側を採って boilerplate 条項を落とす（最大公約数から外れる）ことの確認。handoff に差分として書く対象
5. 種別選択の判断フロー（claude-component-authoring L39-45）の置き場: paths rule は新規作成前に載らない。retrospective の昇格先表 / doctor の合成原則に置くか、新 rule に置いて発火しない場面を許容するか、採らないか
6. agent frontmatter の `tools` 表記（カンマ区切り 5 本 / YAML リスト 2 本）を統一するか。model 選定指針（boilerplate L29-42）は実態と逆なので採らない、でよいか
7. skill frontmatter のフィールド: `user-invocable: true` の明示 5 本を既定値として消すか、`disable-model-invocation`（cc-transcript）・`model`（impl-spec 3 本）の扱い。公式のフィールド一覧はこの調査では未確認（手元で動いている事実のみ）
8. description 条項を入れた場合の横展開: dotclaude 3 本（受け身の要約のみ）、registry と requirements（他 skill への言及）の 5 本を直すか。`plugin-release.md` は description 変更の release 前に evals を要求するが、`evals/` は現在 README.md と run.sh だけでケースが 0（dotclaude-writer 廃止後）
9. agent の横展開: 呼び出し元を書く 4 本（dotclaude 3 + spec-reviewer）と、日付付き経緯を持つ 2 本（page-reviewer + handover-reviewer）を新 rule の適用で直すか、PR 5 に合流させるか。役割定義を 5 節の形で義務化するか、中身だけ求めるか
10. 一時的な状態の条項（authoring L102-106）: ask-with-choices の時限措置注記が対象になるが、PR 3 で ask-with-choices 自体が廃止予定（`notes/norm-refit-plan.md:338-350`）。条項を入れるか、known-issues 台帳の運用との関係をどう書くか
11. CLAUDE.md を範囲に含めるか（claudemd.md の汎用部分 + doctor SKILL.md:407-417 の写し）
12. f030 Q5「全 agent が「指摘まで」」（`notes/norm-refit.md:1012-1015`）を新 rule の条項に昇格するか。現在は agent 本文だけが反映先で、rule には無い
13. スクリプト化の条項: 判定基準と why だけを共通規範に置き、置き場（`skills/{skill}/scripts/`）は plugin-design に残す、でよいか
14. `reference-docs.md:44` の文体（だ体・命令形）と authoring L163-164（依頼形の禁止）、`core.md:292-295` と authoring L151-156（一括追従）の重なりを、新 rule に 1 行足すか core / reference-docs 側に任せるか
15. 作業手順 skill の見出し名（「## 手順」「### ステップ N」）を固定するか。現行は 3 通り
16. paths の発火検証を実装前にやるか（`**/skills/*/SKILL.md` の一致、新規作成時のロード）。載らない場合の入口をどこに置くか

## 台帳運用上の後続

判断ではなく作業。確定したら `notes/norm-refit.md` に反映先付きのエントリを積み、`notes/idea-hub-handoff.md` に boilerplate との差分（少なくとも (d) 4 と 6）を足す（`.claude/rules/norm-refit-ops.md`）。
