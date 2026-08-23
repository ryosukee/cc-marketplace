# 条項抽出: IS（impl-spec）

対象は `plugins/impl-spec/` 配下 4 本（requirements / design / test-plan の SKILL.md と spec-reviewer agent、合計 972 行）。
抽出単位は「1 つの指示・規範」。手順書の工程（実行順・Phase の進行）は抽出せず、工程に埋め込まれた
成果物・振る舞いの規定は抽出する。処遇の判定は含まない。

列挙リストの扱いは 2 通りに分けた。項目が体言止めの列挙（読み取る対象・調査対象・質問のカテゴリ・
文書構成の雛形列）は、それを導く行動規定文を 1 件とし、項目は補足に畳んだ。項目自体が
「〜する」「〜に配置」の形で行動を規定しているものは 1 項目 1 件で割った。

## plugins/impl-spec/skills/requirements/SKILL.md

### IS1

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:15-16
- 原文: コード実装の前段として、「何を作るか」を要件レベルで明確化する。出力は要件定義書。設計判断 (どう作るか) はこの skill のスコープ外で、design skill の責務。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: design / test-plan 冒頭の同型スコープ宣言（IS85、IS185）

### IS2

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:23
- 原文: Phase 0 で CLAUDE.md / rules / ドキュメント規約を読み取り、以降の全フェーズで参照する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 「この skill はプロジェクト非依存だが、使われるプロジェクトに fit する。全フェーズを通じて以下を守る」の一項目
- 重複候補: design:49、test-plan:56 に同趣旨

### IS3

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:24
- 原文: 調査はプロジェクトで利用可能なツールを優先する (Serena MCP, LSP 等があれば使う。なければ Read / Grep / Glob / Agent で代替)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:50、test-plan:57 に同趣旨。各 skill の「調査ツールの選択」節とも重複

### IS4

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:25
- 原文: 質問の粒度・観点はプロジェクトのドメインとアーキテクチャに合わせる
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### IS5

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:26
- 原文: 出力ファイルの配置先・命名・フォーマットはプロジェクトの規約に従う
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: design:52、test-plan:59 に同趣旨。各 skill の「出力先の決定」とも重複

### IS6

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:27
- 原文: プロジェクトの用語を使う。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: design:53、test-plan:60 に同文

### IS7

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:27
- 原文: プロジェクト内で確立された概念は skill 側で再定義しない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし（requirements のみ）

### IS8

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:29
- 原文: 「特定プロジェクトの仕組みを知っている」のではなく、「目の前のプロジェクトを読んで合わせる」。
- 分類: その他
- 性質: 汎用
- 補足: 横断原則全体の性格づけ。個別の行動規定というより上位の姿勢規定
- 重複候補: なし

### IS9

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:33
- 原文: 他のフェーズに先立ち、プロジェクトの方針を理解する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 読み取る対象は「1. `CLAUDE.md` (概要、技術スタック、ディレクトリ構成、コーディング規約、ワークフロー) / 2. `.claude/rules/` / 3. プロジェクト内のドキュメント: 設計方針、既存の仕様書・要件書・設計書・ADR 等を Glob で探索する。配置場所はプロジェクトによって異なる (`docs/`, `plans/`, `specs/` 等) / 4. 利用可能な MCP サーバー (Serena 等のコード解析ツールがあるか)」。工程との切り分けに迷った
- 重複候補: design:57、test-plan:64 に同型

### IS10

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:38
- 原文: `.claude/rules/` (プロジェクト固有のルール。paths 付きルールは対象範囲を確認。最も信頼度の高いソース)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 情報源の信頼度序列を規定する部分だけが規範。列挙そのものは工程
- 重複候補: design:62、test-plan:69、spec-reviewer:25 に同趣旨（rules が最上位）

### IS11

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:42
- 原文: Phase 0 で把握した情報は以降の全フェーズで照合基準として使う。Phase 2 の調査、Phase 4 の品質チェックで、ここで把握したルールやドキュメントと矛盾する記述がないか常に検証する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:66 に同文。品質基準の「Phase 0 で把握したルール・ドキュメントと矛盾する記述がないことを確認する」（IS77）とも重複

### IS12

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:44
- 原文: Phase 0 の結果をユーザーに報告する必要はない。内部的に保持して以降で参照する。
- 分類: その他
- 性質: 汎用
- 重複候補: design:68、test-plan:84 に同文

### IS13

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:52
- 原文: 引数なしの場合: AskUserQuestion で「何を実装したいですか?」と聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: design:75、test-plan:93 に同型（引数なし時のパス確認）

### IS14

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:54-55
- 原文: 取り込んだ概要から、実装の対象範囲を推定する。<br>この時点では推定にとどめ、確定は Phase 3 で行う。
- 分類: 取捨選択
- 性質: 汎用
- 補足: 工程との切り分けに迷った。ただし「推定にとどめる」は振る舞いの規定
- 重複候補: なし

### IS15

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:59-60
- 原文: ユーザーに質問する前に、自分で調べられることは調べる。<br>「コードを読めばわかること」を質問するのは skill の品質に反する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why として「コードを読めばわかることを聞くのは品質に反する」を併記
- 重複候補: requirements:115「自明な質問をしない」（IS34）、design:156、test-plan:156 と同趣旨

### IS16

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:64
- 原文: Phase 0 で把握したプロジェクトの利用可能ツールに応じて調査方法を選ぶ。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS3（横断原則のツール優先）、design:97、test-plan:115

### IS17

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:66
- 原文: Serena MCP がある場合: シンボル解決・型情報・依存グラフを優先的に活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:99、test-plan:117 に同型

### IS18

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:67
- 原文: LSP がある場合: 定義ジャンプ・参照検索を活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:100、test-plan:118 に同型

### IS19

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:68
- 原文: 上記がない場合: Agent (Explore) を起動して網羅的に調査する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:101、test-plan:119 に同型

### IS20

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:70
- 原文: いずれの場合も Read / Grep / Glob は補助的に使える。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### IS21

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:74
- 原文: Phase 1 の概要に基づいて以下を調査する:
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 調査対象は「1. 対象となるコードの構造 (ディレクトリ、主要ファイル、エントリポイント) / 2. 関連する既存実装 (類似機能、関連モジュール、共通パターン) / 3. 依存関係 (import graph, 共有リソース、外部ライブラリ) / 4. テスト構成 (テストファイルの配置、テストフレームワーク) / 5. 既に実装済みの部分 (重複実装の回避) / 6. プロジェクト固有の制約 (CLAUDE.md や rules に書かれている制約が対象領域に影響するか)」。工程との切り分けに迷った
- 重複候補: design:105、test-plan:123-127 に同型の調査対象列挙

### IS22

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:85-86
- 原文: 既存コードの振る舞いを記述する際は、推測や要約ではなく実装を読んで正確に記述する。<br>調査結果の不正確さは、下流の設計判断を誤らせる直接の原因になる。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why として「調査結果の不正確さは下流の設計判断を誤らせる」
- 重複候補: なし（requirements のみ）

### IS23

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:88
- 原文: 調査結果の検証は Serena MCP を優先し、なければ grep / Read で行う。特に以下は必ず自分で裏付けを取る:
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:125、test-plan:142 に同型

### IS24

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:90
- 原文: 否定的記述 (「存在しない」「していない」「のみ」): 不在を確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:127 に同文。spec-reviewer:39 の「否定的記述の裏付け」とも重複

### IS25

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:91
- 原文: 固有名詞 (関数名、ファイルパス、コンポーネント名): 実在を確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:128 に同文

### IS26

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:93
- 原文: Agent に委任した調査結果も同様に検証する。Agent は「見つけられなかった」と「存在しない」を区別しない。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why として「Agent は見つけられなかったと存在しないを区別しない」
- 重複候補: design:130 に同文

### IS27

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:95
- 原文: Phase 0 で把握した規約・既存ドキュメントを調査の照合基準として使う。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS11、design:132 に同文

### IS28

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:97
- 原文: 対象領域に関連する機能を網羅的に把握する。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: design:134 と同趣旨

### IS29

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:97
- 原文: 変更対象レイヤーのエントリポイントを全件確認し、スコープに含めるべき機能が漏れていないか検証する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:134 にほぼ同文

### IS30

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:101
- 原文: 調査結果をユーザーにテキストで報告する:
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 報告項目は「対象領域の現状 (何がどこにあるか。ファイルパスと行番号を添える) / 既に実装済みの部分 (あれば) / 関連する既存パターン / 質問が必要な未確定事項の予告」
- 重複候補: design:140、test-plan:146 に同型

### IS31

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:103
- 原文: 対象領域の現状 (何がどこにあるか。ファイルパスと行番号を添える)
- 分類: 表記・記法
- 性質: 汎用
- 補足: 「ファイルパスと行番号を添える」の部分が規範
- 重複候補: design:142「変更が必要なファイル群の一覧 (パスと行番号)」

### IS32

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:110
- 原文: AskUserQuestion を使って、要件の曖昧さを解消する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: design:148、test-plan:155 に同型

### IS33

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:111
- 原文: 設計判断 (どう実装するか) ではなく、要件 (何を作るか) に集中する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: design:149 の裏返し（設計に集中）

### IS34

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:115
- 原文: 自明な質問をしない。Phase 2 の調査で判明したことは聞かない
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS15、design:156、test-plan:156

### IS35

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:116
- 原文: 上流の判断を先に確認してから下流の詳細を聞く
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: design:166（最も上流の判断として最初に確認する）

### IS36

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:117
- 原文: 構造的な判断 (分類、グルーピング、カテゴリ分け、適用範囲のマッピング) は skill が勝手に作らない。構造はユーザーとインクリメンタルに合意しながら組み立てる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:157 に同文

### IS37

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:117
- 原文: 「全部」「統一」「一律」等の方針が来た場合は、全件・全パターンを洗い出して提示し、各々が本当に含まれるか確認する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:157 に同文

### IS38

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:117
- 原文: 回答の適用範囲を元の文脈から拡大する場合も確認する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:157 に同文

### IS39

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:118
- 原文: スコープに新規の概念・コンポーネント・仕組みを含める場合、その振る舞いの仕様を要件として定義する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### IS40

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:119
- 原文: AskUserQuestion の選択肢形式を活用する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: design:159、test-plan:170 に同文

### IS41

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:120
- 原文: 独立した質問は 4 問までまとめて聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:160、test-plan:171 に同文

### IS42

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:121
- 原文: 5 問以上ある場合は複数回に分ける。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし（requirements のみ。design / test-plan には分割規定がない）

### IS43

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:121
- 原文: 分ける場合は事前に全体計画を提示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### IS44

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:125
- 原文: 以下の観点から質問を構成する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 観点は「1. スコープ / 2. 機能要件 / 3. エッジケース / 4. エラーハンドリング / 5. 状態遷移 / 6. 暗黙の技術的前提 / 7. ドメイン概念の粒度 / 8. UI/UX / 9. 既存機能との整合性 / 10. 非機能要件 / 11. 受入基準」。項目 5・6・7 は個別に条項化した（IS46-IS48）
- 重複候補: design:164、test-plan:158-164 に同型

### IS45

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:125
- 原文: Phase 2 で判明済みの観点はスキップ。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS34（自明な質問をしない）、design:164

### IS46

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:131
- 原文: 状態遷移: 要件が時間経過で状態が変わる振る舞いを含む場合、各状態とその遷移条件を明確にする
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: spec-reviewer:45（状態遷移の完全性）、requirements:157 の終了条件

### IS47

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:132
- 原文: 暗黙の技術的前提: 要件の実現が既存の仕組みの変更を前提とする場合、その変更自体をスコープに含めるかを上流判断として確認する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: spec-reviewer:46（暗黙の技術的前提）

### IS48

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:133
- 原文: ドメイン概念の粒度: 要件中に同種・同時・同一などの集合的な概念が出てきた場合、その境界と分類基準を定義する
- 分類: 文レベル
- 性質: 汎用
- 重複候補: spec-reviewer:47（ドメイン概念の定義）

### IS49

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:139
- 原文: 設計の選択肢は聞かない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS33、禁止事項 IS81（設計判断に踏み込まない）

### IS50

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:140
- 原文: ただしユーザーが要件レベルで技術的制約を表明した場合は要件として記録する。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: IS49 の例外規定
- 重複候補: 要件定義書の構成「6. 技術的制約」（IS70 に畳んだ）

### IS51

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:152
- 原文: 以下の全てを満たしたらインタビュー終了:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 条件は「スコープが明確 (含む / 含まないが決まっている) / 各機能の正常系の動作仕様に曖昧さがない / エッジケースとエラーの扱いが決まっている / 状態遷移が必要な要件では、各状態と遷移条件が定義されている / 受入基準が定義されている」。工程との切り分けに迷った
- 重複候補: design:176、test-plan:175 に同型。個々の条件は要件定義書の品質基準とも重複

### IS52

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:160
- 原文: 終了を判断するのは skill 側。「まだ質問はありますか?」とは聞かない。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし（requirements のみ）

### IS53

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:164
- 原文: インタビュー結果をまとめた要件定義書を Markdown ファイルとして出力する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: design:185、test-plan:186 に同型

### IS54

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:165
- 原文: 出力前に spec-reviewer agent でセルフレビューを行い、指摘があれば修正してから出力する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:186、test-plan:187 に同文。IS55 と重複

### IS55

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:169
- 原文: ファイルに書き出す前に、Agent ツールで `spec-reviewer` を起動する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 起動パラメータは「subagent_type: `impl-spec:spec-reviewer` / 入力: 要件定義書のドラフト全文、doc_type は `requirements` / 出力: 指摘リスト」
- 重複候補: IS54、design:190、test-plan:268

### IS56

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:177
- 原文: skill が自力で修正できるもの (曖昧表現の書き換え、内部整合性の修正等): そのまま修正する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:198、test-plan:276 に同型

### IS57

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:178
- 原文: ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: design:199、test-plan:277 に同文

### IS58

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:180
- 原文: 以下は「ユーザーへの再質問が必要」に分類する:
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: 体言止めの項目「未確定項目、スコープの暗黙前提、要件の不足」（:182）をここに畳んだ。動詞を伴う項目は IS59・IS60 に分離
- 重複候補: design:201、test-plan:279 に同型

### IS59

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:183
- 原文: 技術的事実の検証が必要なもの: まず検証し、検証結果をユーザーに提示した上で判断を確認する。検証結果から「自明」に見えても、判断はユーザーに委ねる
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:204、test-plan にはない

### IS60

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:184
- 原文: 既存コードの挙動が要件の前提になるもの: コードを読んで事実を確認し、その事実と共にユーザーに提示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:206 に同趣旨

### IS61

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:186-187
- 原文: 分類に迷ったら「ユーザーへの再質問が必要」側に倒す。<br>推測で埋めた判断が間違っていた場合のコストは、追加質問のコストより高い。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why として「推測で埋めた判断の誤りのコスト > 追加質問のコスト」
- 重複候補: design:208-209、test-plan:285-286 に同文

### IS62

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:189-190
- 原文: 実行順序: インタビューを先に行い、確定させてから自力修正に進む。<br>自力修正を先にやると修正モードの慣性で判断が必要なものも自力解決してしまうリスクがある。
- 分類: 構成・順序
- 性質: 汎用
- 補足: why として「修正モードの慣性」。工程との切り分けに迷ったが、順序の規定として抽出
- 重複候補: design:211-212、test-plan:288-289 に同文

### IS63

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:192
- 原文: 修正後は再度 spec-reviewer を回す。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:214、test-plan:291 に同文

### IS64

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:192
- 原文: 指摘がゼロになるか、最大 5 回に達したら終了する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: design:214、test-plan:291 に同文

### IS65

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:196
- 原文: プロジェクトの規約に従う:
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 出力先決定の導入。具体規則は IS66-IS68
- 重複候補: IS5、design:218、test-plan:295

### IS66

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:198
- 原文: 仕様書用のディレクトリがあればそこに配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: design:220、test-plan:297 に同型

### IS67

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:199
- 原文: 既存の仕様書があればその隣に配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: design:221、test-plan:298 に同型

### IS68

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:200
- 原文: どちらもなければ `docs/` に配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: design:222、test-plan:299 に同文

### IS69

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:202
- 原文: ファイル名はプロジェクト規約に従う。なければ `req-{feature-name}.md` の形式。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: design:224、test-plan:301 に同型

### IS70

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:206
- 原文: プロジェクトにテンプレートがあればそれに従う。なければ以下の構成:
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 雛形は「1. 概要 (1-2 文) / 2. 背景 / 3. スコープ / 4. 機能要件 (正常系・エッジケース・エラー時・状態遷移 (該当する機能のみ)) / 5. 非機能要件 (該当する場合) / 6. 技術的制約 / 7. 受入基準 / 8. 未決事項」。雛形の見出し列そのものは条項化しない指示に従い畳んだ
- 重複候補: design:229、test-plan:306 に同型

### IS71

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:223
- 原文: 各要件は検証可能な記述にする
- 分類: 文レベル
- 性質: 汎用
- 重複候補: spec-reviewer:44（検証可能性）

### IS72

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:224
- 原文: 曖昧な表現 (「適切に」「必要に応じて」「など」) を残さない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: design:256、test-plan:330、spec-reviewer:36 に同趣旨

### IS73

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:225
- 原文: design skill がこの文書だけで設計判断に進めるレベルの情報量を持つ
- 分類: 目的・読者の確定
- 性質: 媒体固有
- 重複候補: design:16 の「実装者が迷わず着手できるレベル」（IS86）と同型

### IS74

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:226
- 原文: 設計方法には踏み込まない。「何を」だけを書き、「どう」は書かない。特定のライブラリ名・API 名・実装手段が機能要件に登場していたら設計判断の混入
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 判定基準として「ライブラリ名・API 名・実装手段の登場」を明示
- 重複候補: spec-reviewer:49（レイヤー混入）、禁止事項 IS81

### IS75

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:227
- 原文: 受入基準の各項目に対して、機能要件または技術的制約の中に検証を可能にする定義があることを確認する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: spec-reviewer:48（受入基準との整合）

### IS76

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:227
- 原文: 「設計判断に委ねる」と書いた項目が受入基準と矛盾しないか検証する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: spec-reviewer:48 に同趣旨

### IS77

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:228
- 原文: Phase 0 で把握したルール・ドキュメントと矛盾する記述がないことを確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS11、design:257、test-plan:331、spec-reviewer:40

### IS78

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:232
- 原文: 要件定義書のパスをユーザーに伝え、design skill への接続を案内する:
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 定型文「要件定義書を出力しました: {path} / 設計書の作成に進む場合は /impl-spec:design {path} で開始できます。」が続く
- 重複候補: design:264、test-plan:335 に同型

### IS79

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:241
- 原文: 推測で要件を埋めない。不明な点は必ずユーザーに質問する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: design:273、test-plan:344 に同型

### IS80

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:242
- 原文: コードの変更をしない。この skill の責務は要件の明確化まで
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: design:274、test-plan:345 に同型

### IS81

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:243
- 原文: 設計判断に踏み込まない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS33、IS49、IS74

### IS82

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:244
- 原文: プロジェクトの規約を無視しない
- 分類: その他
- 性質: 汎用
- 重複候補: design:276（既存パターンを無視しない）

### IS83

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:245
- 原文: AskUserQuestion を使わずにテキストだけで質問しない
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: design:277、test-plan:347 に同文

### IS84

- 位置: plugins/impl-spec/skills/requirements/SKILL.md:246
- 原文: 成果物に策定過程の記録を含めない。セルフレビューでの指摘・修正等の作業履歴は成果物に書かない。成果物には最終状態のみを記載する
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: design:279、test-plan:349 にほぼ同文

## plugins/impl-spec/skills/design/SKILL.md

### IS85

- 位置: plugins/impl-spec/skills/design/SKILL.md:15-16
- 原文: 要件定義書 (requirements skill の出力) を入力に、「どう作るか」を設計レベルで明確化する。<br>出力は設計書。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS1、IS185 と同型のスコープ宣言

### IS86

- 位置: plugins/impl-spec/skills/design/SKILL.md:16
- 原文: 実装者 (人または implement agent) がこの文書とコードベースから迷わず着手できるレベルを目指す。
- 分類: 目的・読者の確定
- 性質: 媒体固有
- 重複候補: IS73（design skill が設計判断に進めるレベル）と同型

### IS87

- 位置: plugins/impl-spec/skills/design/SKILL.md:20
- 原文: 設計書は「判断の記録」であり「コードの下書き」ではない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: 禁止事項 IS182（設計書にコード実装を書かない）

### IS88

- 位置: plugins/impl-spec/skills/design/SKILL.md:22
- 原文: 境界の基準: **変更した場合に他のコンポーネントとの調整が必要になるもの** は設計書に書く。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「設計書が書くもの」の列挙（コンポーネント間のインターフェースとコントラクト / データモデルとスキーマ / 統合点とプロトコル / 障害モードとエラーハンドリング戦略 / パフォーマンスやセキュリティの制約 / 変更対象の全インスタンス）をここに畳んだ。why は「実装者はコントラクトの範囲内で自身の知識を最大限に活かせる。設計書が内部実装まで規定すると、実装者の創造性が制約され、かつ設計書が実質的にコードの二重管理になる」(:42)
- 重複候補: IS165（粒度原則を守る）

### IS89

- 位置: plugins/impl-spec/skills/design/SKILL.md:22
- 原文: そうでないものは実装者に委ねる。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「実装者に委ねるもの」の列挙（コンポーネント内部のロジック実装 / 関数の分割やローカル変数の設計 / アルゴリズムの具体的な実装方法 / コードの書き方）をここに畳んだ
- 重複候補: IS165、IS182

### IS90

- 位置: plugins/impl-spec/skills/design/SKILL.md:31
- 原文: 変更対象の全インスタンス (同一パターンでも省略せず列挙する)
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 列挙項目のうち括弧内が規範
- 重複候補: IS164（:238）、IS166（:252）、spec-reviewer:55（網羅性）

### IS91

- 位置: plugins/impl-spec/skills/design/SKILL.md:49
- 原文: Phase 0 で CLAUDE.md / rules / 設計規約を読み取り、以降の全フェーズで参照する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS2、test-plan:56

### IS92

- 位置: plugins/impl-spec/skills/design/SKILL.md:50
- 原文: 調査はプロジェクトで利用可能なツールを優先する (Serena MCP, LSP 等があれば使う。なければ Read / Grep / Glob / Agent で代替)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS3、test-plan:57 に同文

### IS93

- 位置: plugins/impl-spec/skills/design/SKILL.md:51
- 原文: 設計判断はプロジェクトの既存パターン・規約を尊重する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: IS169（既存パターンとの一貫性）、IS180（:276）

### IS94

- 位置: plugins/impl-spec/skills/design/SKILL.md:51
- 原文: 逸脱する場合は理由を明示する
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS180（:276）に同趣旨

### IS95

- 位置: plugins/impl-spec/skills/design/SKILL.md:52
- 原文: 出力ファイルの配置先・命名・フォーマットはプロジェクトの規約に従う
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS5、test-plan:59 に同文

### IS96

- 位置: plugins/impl-spec/skills/design/SKILL.md:53
- 原文: プロジェクトの用語を使う
- 分類: 文レベル
- 性質: 汎用
- 重複候補: IS6、test-plan:60 に同文

### IS97

- 位置: plugins/impl-spec/skills/design/SKILL.md:57
- 原文: 他のフェーズに先立ち、プロジェクトの方針を理解する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 読み取る対象は「1. `CLAUDE.md` (技術スタック、ディレクトリ構成、コーディング規約、アーキテクチャ方針) / 2. `.claude/rules/` / 3. プロジェクト内のドキュメント / 4. 利用可能な MCP サーバー」。工程との切り分けに迷った
- 重複候補: IS9、test-plan:64

### IS98

- 位置: plugins/impl-spec/skills/design/SKILL.md:62
- 原文: `.claude/rules/` (プロジェクト固有のルール。設計に影響する制約を特定。最も信頼度の高いソース)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS10、test-plan:69、spec-reviewer:25

### IS99

- 位置: plugins/impl-spec/skills/design/SKILL.md:66
- 原文: Phase 0 で把握した情報は以降の全フェーズで照合基準として使う。Phase 2 の調査、Phase 4 の品質チェックで、ここで把握したルールやドキュメントと矛盾する記述がないか常に検証する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS11 に同文

### IS100

- 位置: plugins/impl-spec/skills/design/SKILL.md:68
- 原文: Phase 0 の結果をユーザーに報告する必要はない。内部的に保持して以降で参照する。
- 分類: その他
- 性質: 汎用
- 重複候補: IS12、test-plan:84 に同文

### IS101

- 位置: plugins/impl-spec/skills/design/SKILL.md:75
- 原文: 引数なしの場合: AskUserQuestion でファイルパスを聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS13、test-plan:93 に同文

### IS102

- 位置: plugins/impl-spec/skills/design/SKILL.md:77
- 原文: 要件定義書を読み込んだら以下を確認する:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 確認項目は「スコープが明確か / 各要件が検証可能な記述になっているか / 受入基準が定義されているか」
- 重複候補: test-plan:102 に同型（入力の検証）

### IS103

- 位置: plugins/impl-spec/skills/design/SKILL.md:83
- 原文: 不十分な場合はユーザーに伝え、requirements skill での再作成を提案する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS106（:88）、test-plan:107

### IS104

- 位置: plugins/impl-spec/skills/design/SKILL.md:88
- 原文: requirements から引き継いだ未決事項や、読み込み時に発見した要件の曖昧さは、Phase 3 で設計判断と併せて解決する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: test-plan の上流フィードバック原則（:31-49）と同趣旨

### IS105

- 位置: plugins/impl-spec/skills/design/SKILL.md:88
- 原文: 解決した場合は要件定義書も直接更新する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS178（:275）、test-plan:46

### IS106

- 位置: plugins/impl-spec/skills/design/SKILL.md:88
- 原文: 設計段階で決着できない場合のみ requirements skill での再作成を提案する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS103、IS179（:275）

### IS107

- 位置: plugins/impl-spec/skills/design/SKILL.md:92
- 原文: requirements skill の Phase 2 より深い調査を行う。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### IS108

- 位置: plugins/impl-spec/skills/design/SKILL.md:93
- 原文: 設計判断に必要な実装詳細まで把握する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS107 と一続き

### IS109

- 位置: plugins/impl-spec/skills/design/SKILL.md:97
- 原文: Phase 0 で把握したプロジェクトの利用可能ツールに応じて調査方法を選ぶ。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS16、test-plan:115 に同文

### IS110

- 位置: plugins/impl-spec/skills/design/SKILL.md:99
- 原文: Serena MCP がある場合: シンボル解決・型情報・依存グラフ・コールグラフを活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS17、test-plan:117

### IS111

- 位置: plugins/impl-spec/skills/design/SKILL.md:100
- 原文: LSP がある場合: 定義ジャンプ・参照検索・型ヒエラルキーを活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS18、test-plan:118

### IS112

- 位置: plugins/impl-spec/skills/design/SKILL.md:101
- 原文: 上記がない場合: Agent (Explore) を起動して網羅的に調査する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS19 に同文、test-plan:119

### IS113

- 位置: plugins/impl-spec/skills/design/SKILL.md:105
- 原文: 要件定義書の各要件に対して、以下を調査する:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 調査対象は「1. 変更対象となるファイル群の特定 (パスと該当箇所の行番号) / 2. 既存のアーキテクチャパターン / 3. 類似機能の実装パターン / 4. 依存関係の詳細 / 5. テストの構成とパターン / 6. DB スキーマ・API エンドポイント (該当する場合) / 7. 設計上の制約 (rules で規定されたパターン、禁止事項)」。工程との切り分けに迷った
- 重複候補: IS21、test-plan:123-127

### IS114

- 位置: plugins/impl-spec/skills/design/SKILL.md:117
- 原文: 既存コードの削除や置換を伴う要件では、対象コードが参照している / されている箇所を全て追跡する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: spec-reviewer:56（削除・置換の波及）

### IS115

- 位置: plugins/impl-spec/skills/design/SKILL.md:117
- 原文: 関連する state、副作用、テストへの波及を把握してから設計に進む。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: spec-reviewer:56

### IS116

- 位置: plugins/impl-spec/skills/design/SKILL.md:121
- 原文: 変更・削除対象ファイルに対応するテストを特定し、削除・修正が必要なテストを洗い出す。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: test-plan:320（既存テストへの影響）

### IS117

- 位置: plugins/impl-spec/skills/design/SKILL.md:125
- 原文: 調査結果の検証は Serena MCP を優先し、なければ grep / Read で行う。特に以下は必ず自分で裏付けを取る:
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS23 に同文、test-plan:142

### IS118

- 位置: plugins/impl-spec/skills/design/SKILL.md:127
- 原文: 否定的記述 (「存在しない」「していない」「のみ」): 不在を確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS24 に同文、spec-reviewer:39

### IS119

- 位置: plugins/impl-spec/skills/design/SKILL.md:128
- 原文: 固有名詞 (関数名、ファイルパス、コンポーネント名): 実在を確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS25 に同文

### IS120

- 位置: plugins/impl-spec/skills/design/SKILL.md:130
- 原文: Agent に委任した調査結果も同様に検証する。Agent は「見つけられなかった」と「存在しない」を区別しない。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why を同文中に含む
- 重複候補: IS26 に同文

### IS121

- 位置: plugins/impl-spec/skills/design/SKILL.md:132
- 原文: Phase 0 で把握した規約・既存ドキュメントを調査の照合基準として使う。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS27 に同文

### IS122

- 位置: plugins/impl-spec/skills/design/SKILL.md:134
- 原文: 変更対象レイヤーのエントリポイントを全件確認し、スコープに関連するものが漏れていないか検証する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS29 にほぼ同文

### IS123

- 位置: plugins/impl-spec/skills/design/SKILL.md:134
- 原文: 起動シーケンスやバックグラウンド処理の起動パスも含める。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### IS124

- 位置: plugins/impl-spec/skills/design/SKILL.md:136
- 原文: 同じ機能を複数の技術スタックで提供する場合、各スタックの制約を特定する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS174（:260 各クライアントのコントラクトを個別に定義）

### IS125

- 位置: plugins/impl-spec/skills/design/SKILL.md:140
- 原文: 調査結果をユーザーにテキストで報告する:
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 報告項目は「変更が必要なファイル群の一覧 (パスと行番号) / プロジェクトの既存パターン / 設計上の選択肢の予告 (「以下の点について設計判断が必要です」)」
- 重複候補: IS30、test-plan:146

### IS126

- 位置: plugins/impl-spec/skills/design/SKILL.md:148
- 原文: AskUserQuestion を使って、設計の選択肢を確定させる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS32、test-plan:155

### IS127

- 位置: plugins/impl-spec/skills/design/SKILL.md:149
- 原文: 要件 (何を作るか) ではなく、設計 (どう作るか) に集中する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS33 の裏返し

### IS128

- 位置: plugins/impl-spec/skills/design/SKILL.md:153
- 原文: プロジェクトの既存パターンに沿う選択肢を推奨として提示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: test-plan:169 に同趣旨

### IS129

- 位置: plugins/impl-spec/skills/design/SKILL.md:154
- 原文: 各選択肢のトレードオフ (実装コスト、保守性、パフォーマンス、既存コードとの一貫性) を明示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### IS130

- 位置: plugins/impl-spec/skills/design/SKILL.md:155
- 原文: コードベース調査で判明した事実を根拠に選択肢を絞る
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: test-plan:168 に同趣旨

### IS131

- 位置: plugins/impl-spec/skills/design/SKILL.md:156
- 原文: 自明な判断 (プロジェクトのパターンに 1 つしか合致しないもの) は質問せず、報告にとどめる
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS34、test-plan:156

### IS132

- 位置: plugins/impl-spec/skills/design/SKILL.md:157
- 原文: 構造的な判断 (分類、グルーピング、カテゴリ分け、適用範囲のマッピング) は skill が勝手に作らない。構造はユーザーとインクリメンタルに合意しながら組み立てる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS36 に同文

### IS133

- 位置: plugins/impl-spec/skills/design/SKILL.md:157
- 原文: 「全部」「統一」「一律」等の方針が来た場合は、全件・全パターンを洗い出して提示し、各々が本当に含まれるか確認する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS37 に同文

### IS134

- 位置: plugins/impl-spec/skills/design/SKILL.md:157
- 原文: 回答の適用範囲を元の文脈から拡大する場合も確認する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS38 に同文

### IS135

- 位置: plugins/impl-spec/skills/design/SKILL.md:158
- 原文: 設計判断の影響が大きい場合や、既存パターンと異なるアプローチが候補に上がった場合、コミュニティや公式のトレンド・推奨を調査して判断材料にする。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 限定として「WebSearch/WebFetch が利用可能な場合に限る」
- 重複候補: なし

### IS136

- 位置: plugins/impl-spec/skills/design/SKILL.md:158
- 原文: 調査が有用かどうか自体をユーザーに聞いてもよい。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### IS137

- 位置: plugins/impl-spec/skills/design/SKILL.md:159
- 原文: AskUserQuestion の選択肢形式を活用する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS40、test-plan:170 に同文

### IS138

- 位置: plugins/impl-spec/skills/design/SKILL.md:160
- 原文: 独立した質問は 4 問までまとめて聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS41、test-plan:171 に同文

### IS139

- 位置: plugins/impl-spec/skills/design/SKILL.md:164
- 原文: 以下の観点から質問を構成する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 観点は「1. 既存踏襲 vs 再設計 / 2. アーキテクチャ / 3. データ設計 / 4. API 設計 (該当する場合) / 5. 実装アプローチ / 6. エラーハンドリング方式 / 7. マイグレーション (該当する場合)」。項目 1 に含まれる順序規定は IS141 に分離
- 重複候補: IS44、test-plan:158-164

### IS140

- 位置: plugins/impl-spec/skills/design/SKILL.md:164
- 原文: 調査で確定済みの観点はスキップ。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS45 に同趣旨

### IS141

- 位置: plugins/impl-spec/skills/design/SKILL.md:166
- 原文: 既存踏襲 vs 再設計: 対象領域を既存のパターンに合わせるか、ゼロベースで設計し直すか。最も上流の判断として最初に確認する
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS35（上流の判断を先に確認）

### IS142

- 位置: plugins/impl-spec/skills/design/SKILL.md:176
- 原文: 以下の全てを満たしたらインタビュー終了:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 条件は「各要件に対する設計方針が確定している / 変更対象のファイルと変更内容が特定されている / 設計上の選択肢について判断が確定し、理由が記録されている / 未確定項目がゼロ (2 案併記は許容しない。インタビューで決着させる)」。最後の項目は IS143 に分離。工程との切り分けに迷った
- 重複候補: IS51、test-plan:175

### IS143

- 位置: plugins/impl-spec/skills/design/SKILL.md:181
- 原文: 未確定項目がゼロ (2 案併記は許容しない。インタビューで決着させる)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS168（:254 未確定項目がゼロ）、spec-reviewer:35（未確定項目の残存）

### IS144

- 位置: plugins/impl-spec/skills/design/SKILL.md:185
- 原文: インタビュー結果をまとめた設計書を Markdown ファイルとして出力する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS53、test-plan:186

### IS145

- 位置: plugins/impl-spec/skills/design/SKILL.md:186
- 原文: 出力前に spec-reviewer agent でセルフレビューを行い、指摘があれば修正してから出力する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS54 に同文、test-plan:187

### IS146

- 位置: plugins/impl-spec/skills/design/SKILL.md:190
- 原文: ファイルに書き出す前に、Agent ツールで `spec-reviewer` を起動する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 起動パラメータは「subagent_type: `impl-spec:spec-reviewer` / 入力: 設計書のドラフト全文、doc_type は `design`、対応する要件定義書のパス / 出力: 指摘リスト」
- 重複候補: IS55 に同文、test-plan:268

### IS147

- 位置: plugins/impl-spec/skills/design/SKILL.md:198
- 原文: skill が自力で修正できるもの (ファイル一覧と詳細の不一致、曖昧表現の書き換え等): そのまま修正する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS56、test-plan:276

### IS148

- 位置: plugins/impl-spec/skills/design/SKILL.md:199
- 原文: ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS57 に同文、test-plan:277

### IS149

- 位置: plugins/impl-spec/skills/design/SKILL.md:201
- 原文: 以下は「ユーザーへの再質問が必要」に分類する:
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: 体言止めの項目「未確定項目、網羅性の不足で判断が要るもの」(:203) をここに畳んだ
- 重複候補: IS58、test-plan:279

### IS150

- 位置: plugins/impl-spec/skills/design/SKILL.md:204
- 原文: 技術的事実の検証が必要なもの: まず検証し、検証結果をユーザーに提示した上で設計判断を確認する。検証結果から「自明」に見えても、判断はユーザーに委ねる
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS59 にほぼ同文

### IS151

- 位置: plugins/impl-spec/skills/design/SKILL.md:205
- 原文: 要件定義書の記述間の不整合: どちらを権威的ソースとするかはユーザーに確認する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: test-plan:282 にほぼ同文

### IS152

- 位置: plugins/impl-spec/skills/design/SKILL.md:206
- 原文: 既存コードの挙動が設計の前提になるもの (トランザクション有無、z-index の重なり順等): コードを読んで事実を確認し、その事実と共に設計判断をユーザーに提示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS60 にほぼ同文

### IS153

- 位置: plugins/impl-spec/skills/design/SKILL.md:208-209
- 原文: 分類に迷ったら「ユーザーへの再質問が必要」側に倒す。<br>推測で埋めた判断が間違っていた場合のコストは、追加質問のコストより高い。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why を併記
- 重複候補: IS61 に同文、test-plan:285-286

### IS154

- 位置: plugins/impl-spec/skills/design/SKILL.md:211-212
- 原文: 実行順序: インタビューを先に行い、確定させてから自力修正に進む。<br>自力修正を先にやると修正モードの慣性で設計判断も自力解決してしまうリスクがある。
- 分類: 構成・順序
- 性質: 汎用
- 補足: why を併記。工程との切り分けに迷った
- 重複候補: IS62 にほぼ同文、test-plan:288-289

### IS155

- 位置: plugins/impl-spec/skills/design/SKILL.md:214
- 原文: 修正後は再度 spec-reviewer を回す。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS63 に同文、test-plan:291

### IS156

- 位置: plugins/impl-spec/skills/design/SKILL.md:214
- 原文: 指摘がゼロになるか、最大 5 回に達したら終了する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS64 に同文、test-plan:291

### IS157

- 位置: plugins/impl-spec/skills/design/SKILL.md:218
- 原文: プロジェクトの規約に従う:
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS65 に同文、test-plan:295

### IS158

- 位置: plugins/impl-spec/skills/design/SKILL.md:220
- 原文: 設計書・plan 用のディレクトリがあればそこに配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS66、test-plan:297

### IS159

- 位置: plugins/impl-spec/skills/design/SKILL.md:221
- 原文: 要件定義書と同じディレクトリに配置 (対になる文書として)
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS67、test-plan:298

### IS160

- 位置: plugins/impl-spec/skills/design/SKILL.md:222
- 原文: どちらもなければ `docs/` に配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS68 に同文、test-plan:299

### IS161

- 位置: plugins/impl-spec/skills/design/SKILL.md:224
- 原文: ファイル名はプロジェクト規約に従う。なければ `design-{feature-name}.md` の形式。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS69、test-plan:301

### IS162

- 位置: plugins/impl-spec/skills/design/SKILL.md:225
- 原文: 対応する要件定義書との関連がわかる命名にする。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: test-plan:302 にほぼ同文

### IS163

- 位置: plugins/impl-spec/skills/design/SKILL.md:229
- 原文: プロジェクトにテンプレートがあればそれに従う。なければ以下の構成:
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 雛形は「1. 概要 (数行) / 2. 対応する要件定義書 / 3. アーキテクチャ / 4. 変更対象ファイル一覧 / 5. コントラクト定義 / 6. 設計判断の記録 / 7. 実装順序 / 8. リスク・懸念事項 (あれば)」。雛形内の規範は IS164 に分離
- 重複候補: IS70 に同文、test-plan:306

### IS164

- 位置: plugins/impl-spec/skills/design/SKILL.md:238
- 原文: 全インスタンスを列挙する。「同様」で省略しない
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS90、IS166、spec-reviewer:55

### IS165

- 位置: plugins/impl-spec/skills/design/SKILL.md:251
- 原文: 粒度原則を守る: コントラクトと統合点を具体的に書き、内部実装は書かない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS88、IS89、IS182、spec-reviewer:53

### IS166

- 位置: plugins/impl-spec/skills/design/SKILL.md:252
- 原文: 変更対象の全インスタンスが列挙されている (省略しない)
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS90、IS164

### IS167

- 位置: plugins/impl-spec/skills/design/SKILL.md:253
- 原文: 設計判断の理由が記録されている
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS87（判断の記録）

### IS168

- 位置: plugins/impl-spec/skills/design/SKILL.md:254
- 原文: 未確定項目がゼロ
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS143、spec-reviewer:35

### IS169

- 位置: plugins/impl-spec/skills/design/SKILL.md:255
- 原文: プロジェクトの既存パターンとの一貫性が保たれている
- 分類: その他
- 性質: 汎用
- 重複候補: IS93、IS180

### IS170

- 位置: plugins/impl-spec/skills/design/SKILL.md:256
- 原文: 曖昧な表現 (「適切に」「必要に応じて」) を残さない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: IS72、test-plan:330、spec-reviewer:36

### IS171

- 位置: plugins/impl-spec/skills/design/SKILL.md:257
- 原文: Phase 0 で把握したルール・ドキュメントと矛盾する記述がないことを確認する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS77 に同文、test-plan:331

### IS172

- 位置: plugins/impl-spec/skills/design/SKILL.md:258
- 原文: 状態遷移を定義する場合、全状態 × 全イベントの組み合わせに対して振る舞いが定義されている。未定義の組み合わせを残さない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: spec-reviewer:57 に同趣旨、IS46

### IS173

- 位置: plugins/impl-spec/skills/design/SKILL.md:259
- 原文: コントラクトとして定義するインターフェースは、全メソッドの引数型・戻り値型・副作用の有無が明記されている
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: spec-reviewer:58 に同趣旨

### IS174

- 位置: plugins/impl-spec/skills/design/SKILL.md:260
- 原文: 技術スタックが異なる複数のクライアントがある場合、各クライアントのコントラクトを個別に定義する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS124

### IS175

- 位置: plugins/impl-spec/skills/design/SKILL.md:264
- 原文: 設計書のパスをユーザーに伝える:
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 定型文「設計書を出力しました: {path} / この設計書に基づいて実装を開始できます。」が続く
- 重複候補: IS78、test-plan:335

### IS176

- 位置: plugins/impl-spec/skills/design/SKILL.md:273
- 原文: 推測で設計判断を埋めない。不明な点は必ずユーザーに質問する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS79 にほぼ同文、test-plan:344

### IS177

- 位置: plugins/impl-spec/skills/design/SKILL.md:274
- 原文: コードの変更をしない。この skill の責務は設計書の作成まで
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS80 にほぼ同文、test-plan:345

### IS178

- 位置: plugins/impl-spec/skills/design/SKILL.md:275
- 原文: 要件の不備を見つけた場合はユーザーに報告し、承認を得て要件定義書を直接更新する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS105、test-plan:46

### IS179

- 位置: plugins/impl-spec/skills/design/SKILL.md:275
- 原文: design skill のスコープ内で解決できない場合のみ requirements skill での再作成を提案する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS103、IS106

### IS180

- 位置: plugins/impl-spec/skills/design/SKILL.md:276
- 原文: プロジェクトの既存パターンを無視しない。逸脱する場合は理由を明示してユーザーに確認する
- 分類: その他
- 性質: 汎用
- 補足: 例外として「逸脱する場合は理由を明示してユーザーに確認」
- 重複候補: IS82、IS93、IS94

### IS181

- 位置: plugins/impl-spec/skills/design/SKILL.md:277
- 原文: AskUserQuestion を使わずにテキストだけで質問しない
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS83 に同文、test-plan:347

### IS182

- 位置: plugins/impl-spec/skills/design/SKILL.md:278
- 原文: 設計書にコード実装を書かない。コントラクトの記述に必要な型シグネチャやスキーマ定義は書くが、関数の中身やロジックの実装は書かない
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 例外として「型シグネチャやスキーマ定義は書く」
- 重複候補: IS87、IS165、test-plan:348（テストコードを書かない）

### IS183

- 位置: plugins/impl-spec/skills/design/SKILL.md:279
- 原文: 成果物に策定過程の記録を含めない。セルフレビューでの指摘・修正、上流文書の不備発見・修正等の作業履歴は成果物に書かない。成果物には最終状態のみを記載する
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS84 にほぼ同文、test-plan:349 に同文

### IS184

- 位置: plugins/impl-spec/skills/design/SKILL.md:280
- 原文: 実装 agent (impl 等) の編集境界外にあるファイルを plan の変更対象に含めない。プロジェクトに protected directory (実装 agent から編集を禁じられた領域、例: Claude Code の `.claude/` 配下) がある場合、その編集はユーザー責務として plan から分離する。plan に含めると実装 agent が plan エラーで停止するか、agent が境界を越えて編集することで設計ミスが顕在化しなくなる
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why として「plan エラーでの停止、または境界越え編集による設計ミスの隠蔽」
- 重複候補: なし

## plugins/impl-spec/skills/test-plan/SKILL.md

### IS185

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:16
- 原文: 要件定義書の受入基準と設計書のコントラクトを入力に、テスト計画を独立した文書として作成する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS1、IS85 と同型のスコープ宣言

### IS186

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:17
- 原文: 受入基準を全件テストに変換し、漏れをゼロにすることを目的とする。
- 分類: 目的・読者の確定
- 性質: 媒体固有
- 重複候補: IS265（:260 全受入基準に少なくとも 1 つのテスト）、IS286（:325）

### IS187

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:18
- 原文: トレーサビリティ表で受入基準とテストの対応を可視化し、漏れを構造的に防ぐ。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS284（:310 トレーサビリティ表の記載規定）

### IS188

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:22
- 原文: テスト計画で最優先に網羅すべきはエントリポイント (入り口) から見た E2E 的な観点。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS245（:211 まず全受入基準に E2E 的テストを設計する）

### IS189

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:23
- 原文: シーケンス図をイメージして、ユーザーがアクセスする入り口の全ケースと、それに対する結果を網羅する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS188 と一続き

### IS190

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:25
- 原文: バックエンド: API endpoint が入り口。各エンドポイントに対して、リクエストのバリエーション (正常系・異常系・境界値) と期待するレスポンス・副作用を網羅する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS255（:241）、IS256（:242）にほぼ同趣旨

### IS191

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:27
- 原文: フロントエンド: ユーザー操作が入り口。Testing Library の哲学と同じく、ユーザーが見て操作するものを起点に、操作の結果として画面に何が起きるかを網羅する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS258（:247）にほぼ同趣旨

### IS192

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:27
- 原文: 内部の state や hook を直接テストするのではなく、ユーザー操作 → 結果の流れで検証する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS258（:247）に同趣旨

### IS193

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:29
- 原文: この E2E 的な観点でのテストは全プロジェクトで必須。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS245（:211 これが必須層）

### IS194

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:29
- 原文: 内部状態や内部関数の単体テストはプロジェクトの方針に依存するため、Phase 0 で把握した規約に従う。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS246（:212、:219 内部テストはプロジェクトの方針に依存）

### IS195

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:33
- 原文: 要件定義書と設計書は所与の入力ではない。
- 分類: その他
- 性質: 媒体固有
- 補足: why として「テスト計画を立てる過程で上流文書の不備が見つかることは自然なことで、むしろテスト計画の価値の一つ」(:34)
- 重複候補: IS200（:49 上流文書の修正はスコープ内）

### IS196

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:36
- 原文: テスト観点から発見しやすい上流の問題:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 列挙は「受入基準の網羅性不足 / 受入基準の曖昧さ / 設計書のコントラクト不足 / 要件と設計の不整合」。検出観点の提示であり工程との切り分けに迷った
- 重複候補: spec-reviewer:63-69（test-plan 固有のチェック観点）

### IS197

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:45
- 原文: フィードバック内容をユーザーに報告し、上流文書の修正が必要か確認する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS239（:198）、IS178（design:275）

### IS198

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:46
- 原文: ユーザーが修正を承認した場合、該当する上流文書を直接更新する (要件定義書・設計書とも)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS105（design:88）、IS240（:199）

### IS199

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:47
- 原文: テスト計画書は更新後の上流文書に基づいて最終化する
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS241（:200）

### IS200

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:49
- 原文: 上流文書の修正は test-plan skill のスコープ内。requirements / design skill に差し戻す必要はない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS179（design:275 の再作成提案）と対照

### IS201

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:56
- 原文: Phase 0 で CLAUDE.md / rules / テスト規約を読み取り、以降の全フェーズで参照する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS2、IS91 に同型

### IS202

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:57
- 原文: 調査はプロジェクトで利用可能なツールを優先する (Serena MCP, LSP 等があれば使う。なければ Read / Grep / Glob / Agent で代替)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS3、IS92 に同文

### IS203

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:58
- 原文: テストの命名規約・配置規約・フレームワーク選択はプロジェクトの慣行に合わせる
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS288（:327 テストファイルの配置先が規約に沿っている）

### IS204

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:59
- 原文: 出力ファイルの配置先・命名・フォーマットはプロジェクトの規約に従う
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS5、IS95 に同文

### IS205

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:60
- 原文: プロジェクトの用語を使う
- 分類: 文レベル
- 性質: 汎用
- 重複候補: IS6、IS96 に同文

### IS206

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:64
- 原文: 他のフェーズに先立ち、プロジェクトのテスト方針を理解する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 読み取る対象は「1. `CLAUDE.md` (技術スタック、テストフレームワーク、ディレクトリ構成) / 2. `.claude/rules/` / 3. プロジェクト内のドキュメント: テスト方針、CI 設定、既存のテスト計画等を Glob で探索する / 4. 利用可能な MCP サーバー」。工程との切り分けに迷った
- 重複候補: IS9、IS97

### IS207

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:69
- 原文: `.claude/rules/` (テストに関するルール。最も信頼度の高いソース)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS10、IS98、spec-reviewer:25

### IS208

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:75
- 原文: 以下をプロジェクトから読み取る。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 対象は「テストフレームワーク (Go: Ginkgo/testing、JS: Vitest/Jest、E2E: Playwright/Cypress 等) / テストファイルの配置規約 / テスト命名規約 / モック・フィクスチャの慣行 / E2E テストのパターン / CI でのテスト実行構成」
- 重複候補: IS203

### IS209

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:75
- 原文: 明示されていない項目は Phase 2 の調査で推定する:
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### IS210

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:84
- 原文: Phase 0 の結果をユーザーに報告する必要はない。内部的に保持して以降で参照する。
- 分類: その他
- 性質: 汎用
- 重複候補: IS12、IS100 に同文

### IS211

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:93
- 原文: 引数なしの場合: AskUserQuestion でファイルパスを聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS13、IS101 に同文

### IS212

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:98
- 原文: リンクがない場合は AskUserQuestion でパスを聞く。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS211 と同型（要件定義書の特定時）

### IS213

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:102
- 原文: 両文書を読み込んだら以下を確認する:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 確認項目は「要件定義書に受入基準が定義されているか / 設計書にコントラクト定義と変更対象ファイル一覧があるか」
- 重複候補: IS102（design:77）に同型

### IS214

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:107
- 原文: 不十分な場合はユーザーに伝え、該当 skill での補完を提案する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS103（design:83）に同型

### IS215

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:115
- 原文: Phase 0 で把握したプロジェクトの利用可能ツールに応じて調査方法を選ぶ。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS16、IS109 に同文

### IS216

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:117
- 原文: Serena MCP がある場合: テストファイルの依存関係・テスト対象の参照を活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS17、IS110 に同型

### IS217

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:118
- 原文: LSP がある場合: テスト対象の定義・参照検索を活用する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS18、IS111 に同型

### IS218

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:119
- 原文: 上記がない場合: Agent (Explore) を起動して調査する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS19、IS112 に同型

### IS219

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:123-127
- 原文: 1. 既存テストの網羅状況: 設計書の変更対象ファイルに対応するテストの有無と内容<br>2. テストパターン: プロジェクトで使われている describe/it 構造、モック方法、フィクスチャ管理<br>3. テストユーティリティ: 共通のヘルパー、カスタムマッチャー、テストファクトリ<br>4. E2E テスト基盤: ページオブジェクト、テストデータのセットアップ方法、テスト環境の構成<br>5. 既存テストのカバー範囲: 受入基準のうち、既存テストで既にカバーされているものの特定
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 導入の行動規定文がない列挙のため、列挙全体を 1 件として扱った。工程との切り分けに迷った
- 重複候補: IS21、IS113 の調査対象列挙

### IS220

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:131
- 原文: 受入基準の各項目に対して、既にカバーするテストが存在するかを判定する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS250（:231 既存カバー状況をトレーサビリティ表に反映）

### IS221

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:132
- 原文: 判定は実際のテストコードを読んで行う。テストファイルの存在だけでは判定しない。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 判定基準は「テストが受入基準の振る舞いをアサートしている → カバー済み / テストが存在するが受入基準の振る舞いをアサートしていない → 未カバー / テストが存在しない → 未カバー」(:136-138)
- 重複候補: IS223（:142）、spec-reviewer:65（既存カバレッジの正確性）

### IS222

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:142
- 原文: Serena MCP を優先し、なければ grep / Read で検証する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS23、IS117 に同趣旨

### IS223

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:142
- 原文: 特に「既にカバー済み」の判定は、テストコードの実在とアサーション内容を確認する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS221、spec-reviewer:65

### IS224

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:146
- 原文: 調査結果をユーザーにテキストで報告する:
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 報告項目は「テストフレームワークと規約の把握結果 / 既存テストのカバー状況 (受入基準ごと) / 新規テストが必要な受入基準の一覧 / インタビューが必要な判断事項の予告」
- 重複候補: IS30、IS125 に同型

### IS225

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:155
- 原文: AskUserQuestion を使って、テスト戦略の判断を確定させる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS32、IS126 に同型

### IS226

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:156
- 原文: Phase 2 の調査で自明に決まる判断は質問せず報告にとどめる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS34、IS131 に同趣旨

### IS227

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:160-164
- 原文: テスト層の分類が曖昧な受入基準 (API テストと E2E のどちらで検証するか等)<br>テスト不可能な受入基準の扱い (主観的な品質基準、外部サービス依存等)<br>モック戦略の判断 (外部 API をモックするか、テスト環境を用意するか)<br>テスト環境の制約 (CI で E2E が実行できるか、ブラウザ拡張のテスト手段等)<br>カバレッジの優先度 (全受入基準を一度にテスト化するか、段階的に進めるか)
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 「質問が必要になる場面」の列挙。導入の行動規定文がないため列挙全体を 1 件とした
- 重複候補: IS44、IS139 の質問カテゴリ列挙

### IS228

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:168
- 原文: Phase 2 の調査で判明した事実を根拠に選択肢を絞る
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS130（design:155）にほぼ同文

### IS229

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:169
- 原文: プロジェクトの既存テストパターンに沿う選択肢を推奨として提示する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS128（design:153）にほぼ同文

### IS230

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:170
- 原文: AskUserQuestion の選択肢形式を活用する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS40、IS137 に同文

### IS231

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:171
- 原文: 独立した質問は 4 問までまとめて聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS41、IS138 に同文

### IS232

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:175
- 原文: 以下の全てを満たしたらインタビュー終了:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 条件は「全受入基準のテスト層分類が確定している / テスト不可能な受入基準の扱いが決まっている / モック・フィクスチャの方針が確定している / 未確定項目がゼロ」。工程との切り分けに迷った
- 重複候補: IS51、IS142 に同型

### IS233

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:182
- 原文: インタビューの必要がない場合 (調査で全て確定した場合) は Phase 3 をスキップして Phase 4 に進む。
- 分類: 取捨選択
- 性質: 汎用
- 補足: 工程との切り分けに迷った
- 重複候補: なし（test-plan のみ。requirements / design にはスキップ規定がない）

### IS234

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:182
- 原文: スキップする旨をユーザーに報告する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### IS235

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:186
- 原文: トレーサビリティ表とテストシナリオをまとめたテスト計画書を Markdown ファイルとして出力する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS53、IS144 に同型

### IS236

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:187
- 原文: 出力前に spec-reviewer agent でセルフレビューを行い、指摘があれば修正してから出力する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS54、IS145 に同文

### IS237

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:193
- 原文: 要件定義書の受入基準セクションから全項目を抽出する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS186、IS265

### IS238

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:194
- 原文: 受入基準がリスト形式でない場合 (散文の中に検証条件が埋まっている場合) は、検証可能な振る舞いを 1 つずつ分離して列挙する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### IS239

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:198
- 原文: 上流フィードバックとしてユーザーに報告する (「この振る舞いは受入基準にないがテストすべき」)
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: IS197（:45）に同趣旨

### IS240

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:199
- 原文: ユーザーが同意したら要件定義書の受入基準を更新する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS198（:46）に同趣旨

### IS241

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:200
- 原文: 更新後の受入基準をトレーサビリティ表に含める
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS199（:47）、IS284

### IS242

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:202
- 原文: 受入基準の追加なしにテスト対象を増やさない。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「テスト計画は受入基準が起点という原則を守りつつ、受入基準自体の不備は上流フィードバックで補完する」が趣旨説明として続く
- 重複候補: IS297（:346 禁止事項）にほぼ同文

### IS243

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:206
- 原文: 各受入基準を振る舞いの性質に基づいてテスト層に分類する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: spec-reviewer:64（テスト層の妥当性）

### IS244

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:207
- 原文: 分類基準はプロジェクトのテストフレームワークに合わせる。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS203、IS289

### IS245

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:211
- 原文: まず全受入基準に対して E2E 的なテスト (入り口 → 結果) を設計する。これが必須層
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: E2E 的テストの入り口は「バックエンド: API endpoint へのリクエスト → レスポンス + 副作用 (DB 状態、外部呼び出し等) / フロントエンド: ユーザー操作 (クリック、入力、ナビゲーション) → 画面に表示される結果」(:216-217)
- 重複候補: IS188、IS193、IS254（:237）

### IS246

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:212
- 原文: その上で、E2E だけでは検証が不十分な振る舞いに対して内部テストを追加する
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: 有効な場面は「複雑なビジネスロジック (計算、バリデーション) を入り口テストだけでは組み合わせ爆発する場合 / エラーハンドリングの分岐が多く、入り口テストで全パスを通すのが困難な場合 / パフォーマンスクリティカルな処理を隔離してベンチマークしたい場合」（プロジェクトの方針に依存）(:219-223)
- 重複候補: IS194、IS254（:237）

### IS247

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:225
- 原文: 1 つの受入基準が複数層にまたがる場合は各層にテストを配置する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### IS248

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:227
- 原文: 実行型テスト (テストフレームワークが actual code を実行する形式) では検証できない構造的 AC (例: 「重複コードがない」「特定リテラルが source 内に 1 箇所のみ存在」「特定の rule に違反がない」) は、テストフレームワークではなく code review レイヤー (人間レビュー or プロジェクトに code review agent があれば agent) に委譲する。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why として「テスト実行を担う agent はテストフレームワークの実行と報告のみを責務とするため、grep ベースの構造検証を実行担当に渡すと責務逸脱と空振りが起きる」
- 重複候補: IS285（:311 静的検査 (code-review) の表記）

### IS249

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:227
- 原文: トレーサビリティ表では「静的検査 (code review)」のような形で実行主体を明示する。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS285（:311）にほぼ同趣旨。表記が「静的検査 (code review)」と「静的検査 (code-review)」で揺れている

### IS250

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:231
- 原文: Phase 2 で特定した既存テストのカバー状況をトレーサビリティ表に反映する。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS220

### IS251

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:232
- 原文: カバー済みの項目は新規テスト設計の対象から除外するが、
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS253（:236 未カバーの受入基準に対して設計する）

### IS252

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:232
- 原文: トレーサビリティ表には記載する。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS286（:325 全受入基準がトレーサビリティ表に含まれている）

### IS253

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:236
- 原文: 未カバーの受入基準に対してテストシナリオを設計する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS251

### IS254

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:237
- 原文: 入り口 → 結果の E2E 的テストを先に設計し、必要に応じて内部テストを追加する。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS245、IS246 に同趣旨

### IS255

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:241
- 原文: 各エンドポイントに対して、入力のバリエーションを網羅する (正常系、異常系、境界値、認証・認可)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS190（:25）

### IS256

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:242
- 原文: 各入力に対する期待結果を明示する (ステータスコード、レスポンスボディ、DB 状態変更、外部呼び出し)
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS190、IS287（:326 アサーションが具体的で検証可能）

### IS257

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:243
- 原文: テストデータのセットアップ方法を明示する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS261（:250 モック・フィクスチャの要件を明示）、IS289（:328）

### IS258

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:247
- 原文: ユーザー操作を起点にする。内部の state や hook ではなく、ユーザーが見て触れるものでテストする
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS191、IS192 にほぼ同文

### IS259

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:248
- 原文: 操作の自然な流れ (操作 → フィードバック → 結果) を 1 テストにまとめる
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS260（:249）と対

### IS260

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:249
- 原文: 非同期処理が挟まっていても、ユーザーが追加操作なしで結果を見られるなら分割しない
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: IS259 の補強

### IS261

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:250
- 原文: モック・フィクスチャの要件を明示する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS257、IS289（:328）に同趣旨

### IS262

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:251
- 原文: プロジェクトの規約に従うアサーション方式を使う
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS203、IS244

### IS263

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:255
- 原文: ページ遷移・復元・複数画面にまたがる操作フローを検証する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### IS264

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:256
- 原文: フロントエンド単体テストではカバーできないブラウザ統合の振る舞いに限定する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS290（:329 既存テストとの重複がない）

### IS265

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:260
- 原文: 全受入基準に少なくとも 1 つのテストが紐付いていることを確認する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS186、IS286、spec-reviewer:63

### IS266

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:263
- 原文: テスト可能だが漏れていた → テストを追加設計する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### IS267

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:264
- 原文: テスト不可能 (主観的品質基準等) → 理由を付記して除外する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: テスト計画書の構成「6. テスト対象外の受入基準: テスト不可能な項目とその理由」（IS283 に畳んだ）

### IS268

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:268
- 原文: ファイルに書き出す前に、Agent ツールで `spec-reviewer` を起動する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 起動パラメータは「subagent_type: `impl-spec:spec-reviewer` / 入力: テスト計画書のドラフト全文、doc_type は `test-plan`、対応する要件定義書と設計書のパス / 出力: 指摘リスト」
- 重複候補: IS55、IS146 に同文

### IS269

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:276
- 原文: skill が自力で修正できるもの (トレーサビリティの記載漏れ、テスト ID の不整合等): そのまま修正する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS56、IS147 に同型

### IS270

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:277
- 原文: ユーザーへの再質問が必要なもの: Phase 3 に戻り AskUserQuestion で確認してから修正する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS57、IS148 に同文

### IS271

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:279
- 原文: 以下は「ユーザーへの再質問が必要」に分類する:
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: 体言止めの項目「テスト層の分類判断、テスト不可能な項目の扱い」(:281)、「テスト戦略の判断が必要なもの: テストの優先度、カバレッジの範囲、テスト手法の選択等」(:283) をここに畳んだ
- 重複候補: IS58、IS149 に同文

### IS272

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:282
- 原文: 上流文書 (要件定義書・設計書) の記述間の不整合: どちらを権威的ソースとするかはユーザーに確認する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS151（design:205）にほぼ同文

### IS273

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:285-286
- 原文: 分類に迷ったら「ユーザーへの再質問が必要」側に倒す。<br>推測で埋めた判断が間違っていた場合のコストは、追加質問のコストより高い。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why を併記
- 重複候補: IS61、IS153 に同文

### IS274

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:288-289
- 原文: 実行順序: インタビューを先に行い、確定させてから自力修正に進む。<br>自力修正を先にやると修正モードの慣性で判断が必要なものも自力解決してしまうリスクがある。
- 分類: 構成・順序
- 性質: 汎用
- 補足: why を併記。工程との切り分けに迷った
- 重複候補: IS62 に同文、IS154

### IS275

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:291
- 原文: 修正後は再度 spec-reviewer を回す。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS63、IS155 に同文

### IS276

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:291
- 原文: 指摘がゼロになるか、最大 5 回に達したら終了する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS64、IS156 に同文

### IS277

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:295
- 原文: プロジェクトの規約に従う:
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS65、IS157 に同文

### IS278

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:297
- 原文: テスト計画・仕様書用のディレクトリがあればそこに配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS66、IS158 に同型

### IS279

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:298
- 原文: 設計書と同じディレクトリに配置 (対になる文書として)
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS67、IS159 に同型

### IS280

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:299
- 原文: どちらもなければ `docs/` に配置
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS68、IS160 に同文

### IS281

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:301
- 原文: ファイル名はプロジェクト規約に従う。なければ `test-plan-{feature-name}.md` の形式。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS69、IS161 に同型

### IS282

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:302
- 原文: 対応する要件定義書・設計書との関連がわかる命名にする。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS162 にほぼ同文

### IS283

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:306
- 原文: プロジェクトにテンプレートがあればそれに従う。なければ以下の構成:
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 雛形は「1. 概要 (1-2 文) / 2. 対応する文書 / 3. トレーサビリティ表 / 4. テストシナリオ (テスト ID・ファイル配置先・対応する受入基準・テスト構造・セットアップ・操作手順・アサーション対象) / 5. 既存テストへの影響 / 6. テスト対象外の受入基準」。雛形内の規範は IS284・IS285 に分離
- 重複候補: IS70、IS163 に同文

### IS284

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:310
- 原文: トレーサビリティ表: 受入基準とテストの対応。全受入基準を列挙し、テスト層・テスト ID・状態 (新規/既存カバー/テスト対象外) を記載
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS187、IS252、IS286

### IS285

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:311
- 原文: テスト層には Ginkgo / Vitest / Playwright 等の実行型テストの他、構造的 AC を code-review に委譲する場合は「静的検査 (code-review)」を使う
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: IS249（:227）と表記が揺れている

### IS286

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:325
- 原文: 全受入基準がトレーサビリティ表に含まれている (漏れゼロ)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS186、IS265、spec-reviewer:63

### IS287

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:326
- 原文: 各テストシナリオのアサーションが具体的で検証可能
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: IS71（各要件は検証可能な記述にする）、spec-reviewer:66

### IS288

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:327
- 原文: テストファイルの配置先がプロジェクトの規約に沿っている
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: IS203

### IS289

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:328
- 原文: モック・フィクスチャの要件が明示されている
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS257、IS261

### IS290

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:329
- 原文: 既存テストとの重複がない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS251、IS264

### IS291

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:330
- 原文: 曖昧な表現 (「適切にテストする」「必要に応じて検証」) を残さない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: IS72、IS170 に同型、spec-reviewer:36

### IS292

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:331
- 原文: Phase 0 で把握したテスト規約と矛盾する記述がない
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS77、IS171 に同型

### IS293

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:335
- 原文: テスト計画書のパスをユーザーに伝え、次のステップを案内する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 定型文「テスト計画書を出力しました: {path}」が続く
- 重複候補: IS78、IS175 に同型

### IS294

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:336
- 原文: 案内内容はプロジェクトのワークフローに合わせる (手動実装、team-implement への引き渡し等)。
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: なし

### IS295

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:344
- 原文: 推測でテスト方針を決めない。プロジェクトの慣行と受入基準に基づく
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: IS79、IS176 に同型

### IS296

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:345
- 原文: コードの変更をしない。この skill の責務はテスト計画と上流文書のフィードバックまで
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS80、IS177 に同型

### IS297

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:346
- 原文: 受入基準に存在しない振る舞いを受入基準の追加なしにテスト対象に含めない。テストすべき振る舞いを発見したら、まず上流フィードバックで受入基準を追加する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS242（:202）にほぼ同文

### IS298

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:347
- 原文: AskUserQuestion を使わずにテキストだけで質問しない
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 使用指示
- 重複候補: IS83、IS181 に同文

### IS299

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:348
- 原文: テスト計画書にテストコードの実装を書かない。テスト構造とアサーション対象を書くが、コードは書かない
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 例外として「テスト構造とアサーション対象は書く」
- 重複候補: IS182（design:278）に同型

### IS300

- 位置: plugins/impl-spec/skills/test-plan/SKILL.md:349
- 原文: 成果物に策定過程の記録を含めない。セルフレビューでの指摘・修正、上流文書の不備発見・修正等の作業履歴は成果物に書かない。成果物には最終状態のみを記載する
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS183（design:279）に同文、IS84

## plugins/impl-spec/agents/spec-reviewer.md

### IS301

- 位置: plugins/impl-spec/agents/spec-reviewer.md:9
- 原文: requirements / design / test-plan skill が出力する成果物を、ファイル書き出し前にレビューする。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS54、IS145、IS236（各 skill 側のセルフレビュー指示）

### IS302

- 位置: plugins/impl-spec/agents/spec-reviewer.md:10
- 原文: 呼び出し元の skill が入力としてドラフト全文と doc_type を渡す。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 入力仕様は「`draft`: レビュー対象の Markdown 全文 / `doc_type`: `requirements`、`design`、または `test-plan` / `requirements_path`: 対応する要件定義書のパス (doc_type が `design` または `test-plan` の場合) / `design_path`: 対応する設計書のパス (doc_type が `test-plan` の場合)」(:14-17)
- 重複候補: IS55、IS146、IS268（各 skill 側の起動パラメータ）

### IS303

- 位置: plugins/impl-spec/agents/spec-reviewer.md:21
- 原文: ドラフトだけでなく、プロジェクトのルール・ドキュメントを自分で読んで照合する。呼び出し元の skill が見落としたものを検出するために、独立した探索が必要。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why として「呼び出し元の skill が見落としたものを検出するため」
- 重複候補: IS11、IS77（skill 側の照合基準）

### IS304

- 位置: plugins/impl-spec/agents/spec-reviewer.md:25-27
- 原文: 1. `.claude/rules/` — 最も信頼度が高い。ここに反していればほぼ確実に指摘する<br>2. `CLAUDE.md` — プロジェクトの概要・構造・規約<br>3. `docs/`, `plans/`, `specs/` 等のドキュメント — 設計方針、既存の仕様・要件・ADR。矛盾があれば「確認すべき」レベルの指摘
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 情報源の信頼度序列と、序列に応じた指摘の強さを 1 件として扱った
- 重複候補: IS10、IS98、IS207（rules が最も信頼度の高いソース）

### IS305

- 位置: plugins/impl-spec/agents/spec-reviewer.md:29
- 原文: 探索は Glob でプロジェクトのドキュメント配置を把握し、対象領域に関連するものを Read する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS9、IS97、IS206（Glob での探索）

### IS306

- 位置: plugins/impl-spec/agents/spec-reviewer.md:35
- 原文: 未確定項目の残存: 「TBD」「要検討」「2 案」「どちらか」等、判断が保留されている記述がないか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS143、IS168（未確定項目がゼロ）

### IS307

- 位置: plugins/impl-spec/agents/spec-reviewer.md:36
- 原文: 曖昧表現: 「適切に」「必要に応じて」「など」「同様に」等、検証不能な表現がないか
- 分類: 文レベル
- 性質: 汎用
- 重複候補: IS72、IS170、IS291

### IS308

- 位置: plugins/impl-spec/agents/spec-reviewer.md:37
- 原文: 内部整合性: 文書内で矛盾する記述がないか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### IS309

- 位置: plugins/impl-spec/agents/spec-reviewer.md:38
- 原文: スコープ整合性: スコープセクションで除外したものが、他のセクションで暗黙に含まれていないか
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### IS310

- 位置: plugins/impl-spec/agents/spec-reviewer.md:39
- 原文: 否定的記述の裏付け: 「存在しない」「していない」「のみ」等の否定的な記述に対して、それを裏付ける調査への言及があるか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS24、IS118（否定的記述は不在を確認する）

### IS311

- 位置: plugins/impl-spec/agents/spec-reviewer.md:40
- 原文: プロジェクトルール・ドキュメントとの矛盾: 自律探索で把握したルール・ドキュメントとドラフトの記述が矛盾しないか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS77、IS171、IS292

### IS312

- 位置: plugins/impl-spec/agents/spec-reviewer.md:44
- 原文: 検証可能性: 各要件が検証可能な記述になっているか。主観的・定性的な表現が残っていないか
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: IS71（各要件は検証可能な記述にする）

### IS313

- 位置: plugins/impl-spec/agents/spec-reviewer.md:45
- 原文: 状態遷移の完全性: 時間経過で状態が変わる振る舞いがある場合、全状態と遷移条件が定義されているか
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS46（requirements:131）

### IS314

- 位置: plugins/impl-spec/agents/spec-reviewer.md:46
- 原文: 暗黙の技術的前提: 要件の実現が既存の仕組みの変更を前提としている場合、その変更がスコープで明示されているか
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS47（requirements:132）

### IS315

- 位置: plugins/impl-spec/agents/spec-reviewer.md:47
- 原文: ドメイン概念の定義: 集合的な概念の境界と分類基準が定義されているか
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: IS48（requirements:133）

### IS316

- 位置: plugins/impl-spec/agents/spec-reviewer.md:48
- 原文: 受入基準との整合: 受入基準の各項目に対して、機能要件または技術的制約の中に検証を可能にする定義があるか。「設計判断に委ねる」とされた項目が受入基準と矛盾しないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS75、IS76（requirements:227）

### IS317

- 位置: plugins/impl-spec/agents/spec-reviewer.md:49
- 原文: レイヤー混入: 特定のライブラリ名・API 名・実装手段が機能要件に登場していないか。登場していたら設計判断の混入
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS74（requirements:226）にほぼ同文

### IS318

- 位置: plugins/impl-spec/agents/spec-reviewer.md:53
- 原文: 粒度原則の遵守: コントラクトと統合点が書かれているか。内部ロジックの実装コードが混入していないか
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS165（design:251）、IS182

### IS319

- 位置: plugins/impl-spec/agents/spec-reviewer.md:54
- 原文: ファイル一覧と詳細の整合: 変更対象ファイル一覧に載っているファイルが全て詳細設計でカバーされているか。逆に詳細に出てくるが一覧にないファイルがないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS147（design:198 の自力修正例）

### IS320

- 位置: plugins/impl-spec/agents/spec-reviewer.md:55
- 原文: 網羅性: 同一パターンの全インスタンスが列挙されているか。「同様」「他も同じ」で省略していないか
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS90、IS164、IS166

### IS321

- 位置: plugins/impl-spec/agents/spec-reviewer.md:56
- 原文: 削除・置換の波及: 既存コードの削除や置換がある場合、関連する参照・副作用・テストへの影響が記述されているか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS114、IS115（design:117）

### IS322

- 位置: plugins/impl-spec/agents/spec-reviewer.md:57
- 原文: 状態遷移の網羅: 状態遷移定義がある場合、全状態 × 全イベントの組み合わせに対して振る舞いが定義されているか。未定義の組み合わせがないか
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: IS172（design:258）に同文

### IS323

- 位置: plugins/impl-spec/agents/spec-reviewer.md:58
- 原文: コントラクトのシグネチャ完全性: 新規のインターフェースを定義する場合、全メソッドの引数型・戻り値型・副作用の有無が明記されているか
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: IS173（design:259）に同文

### IS324

- 位置: plugins/impl-spec/agents/spec-reviewer.md:59
- 原文: 要件定義書との整合: requirements_path が渡された場合、要件定義書を Read し、設計書との整合を検証する。受入基準が設計方針と矛盾しないか、スコープと変更対象が一致しているか、機能要件とコントラクトが矛盾しないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS330（:68 test-plan 固有の要件定義書整合）

### IS325

- 位置: plugins/impl-spec/agents/spec-reviewer.md:63
- 原文: トレーサビリティの完全性: 要件定義書の受入基準が全件トレーサビリティ表に含まれているか。漏れている受入基準がないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS265、IS286

### IS326

- 位置: plugins/impl-spec/agents/spec-reviewer.md:64
- 原文: テスト層の妥当性: 各受入基準に対するテスト層の分類が、振る舞いの性質に合っているか。プロジェクトのテスト規約と矛盾しないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS243、IS244

### IS327

- 位置: plugins/impl-spec/agents/spec-reviewer.md:65
- 原文: 既存カバレッジの正確性: 「既存カバー済み」とされた項目が、本当に該当の振る舞いをアサートするテストが存在するか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS221、IS223

### IS328

- 位置: plugins/impl-spec/agents/spec-reviewer.md:66
- 原文: テストシナリオの検証可能性: 各テストシナリオのアサーション対象が具体的で、曖昧さがないか
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: IS287（test-plan:326）

### IS329

- 位置: plugins/impl-spec/agents/spec-reviewer.md:67
- 原文: テスト ID の整合: トレーサビリティ表のテスト ID とテストシナリオセクションのテスト ID が一致しているか。片方にしかない ID がないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS269（test-plan:276 のテスト ID 不整合）

### IS330

- 位置: plugins/impl-spec/agents/spec-reviewer.md:68
- 原文: 要件定義書との整合: requirements_path が渡された場合、要件定義書を Read し、受入基準の文言がトレーサビリティ表と一致しているか。受入基準の追加・変更が反映されているか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS324（:59）と同型

### IS331

- 位置: plugins/impl-spec/agents/spec-reviewer.md:69
- 原文: 設計書との整合: design_path が渡された場合、設計書を Read し、コントラクト定義や変更対象ファイルとテストシナリオの対象が整合しているか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: IS324、IS330 と同型

### IS332

- 位置: plugins/impl-spec/agents/spec-reviewer.md:73
- 原文: 指摘リストを返す。
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS55、IS146、IS268 の「出力: 指摘リスト」

### IS333

- 位置: plugins/impl-spec/agents/spec-reviewer.md:73
- 原文: 各指摘には以下を含める:
- 分類: 文書種別の構造
- 性質: 汎用
- 補足: 含める要素は「該当箇所 (セクション名または引用) / チェック観点の番号 / 指摘内容」
- 重複候補: なし

### IS334

- 位置: plugins/impl-spec/agents/spec-reviewer.md:79
- 原文: 指摘がない場合は空リストを返す。
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: IS64、IS156、IS276（指摘がゼロになったら終了）

### IS335

- 位置: plugins/impl-spec/agents/spec-reviewer.md:83
- 原文: 整合性チェック (design の要件定義書整合、test-plan の要件定義書・設計書整合) で不整合を発見した場合、ドラフト側の修正だけでなく入力文書側の修正が必要なケースも指摘する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: IS178、IS198（上流文書の直接更新）

### IS336

- 位置: plugins/impl-spec/agents/spec-reviewer.md:85
- 原文: レビュー対象のドラフトだけでなく、関連文書の品質も含めて指摘する。
- 分類: 取捨選択
- 性質: 汎用
- 補足: 前提として「requirements / design / test-plan は全体で 1 つの実装計画ドキュメント群を構成する」
- 重複候補: IS335 と一続き

### IS337

- 位置: plugins/impl-spec/agents/spec-reviewer.md:87
- 原文: 指摘にはどちらの文書に修正が必要かを明記する:
- 分類: 表記・記法
- 性質: 汎用
- 補足: 書き分けは「ドラフト側の修正が必要: 「ドラフトのセクション X を修正」/ 入力文書側の修正が必要: 「要件定義書のセクション Y に不備。修正が必要」/ 両方の修正が必要: 両方を明記」
- 重複候補: なし

### IS338

- 位置: plugins/impl-spec/agents/spec-reviewer.md:95
- 原文: read-only agent。成果物の修正はしない
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### IS339

- 位置: plugins/impl-spec/agents/spec-reviewer.md:96
- 原文: 指摘は事実ベースで行う。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### IS340

- 位置: plugins/impl-spec/agents/spec-reviewer.md:96
- 原文: 改善案の提示は呼び出し元の skill の責務
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: IS56、IS147、IS269（skill 側が自力修正する）

### IS341

- 位置: plugins/impl-spec/agents/spec-reviewer.md:97
- 原文: ドメイン知識に基づく判断 (要件の妥当性、設計の適切さ) はスコープ外。構造的・形式的な品質だけをチェックする
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

## 検算用の集計

| ファイル | 抽出条項数 | 総行数 | 見出し数 (`^#{2,4}`) | 箇条書き数 (`^\s*[-*]`) |
| --- | --- | --- | --- | --- |
| `plugins/impl-spec/skills/requirements/SKILL.md` | 84 | 246 | 21 | 53 |
| `plugins/impl-spec/skills/design/SKILL.md` | 100 | 280 | 27 | 76 |
| `plugins/impl-spec/skills/test-plan/SKILL.md` | 116 | 349 | 33 | 88 |
| `plugins/impl-spec/agents/spec-reviewer.md` | 41 | 97 | 11 | 13 |
| 合計 | 341 | 972 | 92 | 230 |

### AskUserQuestion 使用指示の突合

`grep -ro "AskUserQuestion"` による実測は 4 ファイル合計 16 件
（requirements 5 / design 5 / test-plan 6 / spec-reviewer 0）。
補足に「AskUserQuestion 使用指示」と明記した条項も 16 件で一致する。

- requirements 5 件: IS13 (:52)、IS32 (:110)、IS40 (:119)、IS57 (:178)、IS83 (:245)
- design 5 件: IS101 (:75)、IS126 (:148)、IS137 (:159)、IS148 (:199)、IS181 (:277)
- test-plan 6 件: IS211 (:93)、IS212 (:98)、IS225 (:155)、IS230 (:170)、IS270 (:277)、IS298 (:347)
- spec-reviewer 0 件（agent は質問を発しない read-only agent のため）

### 旧抽出 (2026-07-30、IS 全体 29 件) との件数差

差は 312 件で、抽出単位の粒度差がほぼ全てを占める。旧抽出は 1 節・1 テーマを 1 件に丸めていたと推定される。
今回は「〜する / 〜しない」の 1 文を 1 件とし、1 行の箇条書きに独立した規定が複数あれば割ったため、
たとえば requirements:117 の構造的判断の bullet 1 行が 3 件 (IS36-IS38) に、
禁止事項 6 行が 6 件になっている。3 skill が同型の節（横断原則・調査ツールの選択・セルフレビュー・
出力先の決定・禁止事項）をほぼ同文で持つため、同じ規範が 3 回計上される構造的な重複も件数を押し上げている
（重複候補欄で相互参照済み。実質的にユニークな規範は 150 件前後と見込まれる）。

工程として除外した量は、4 ファイル 972 行のうち概算 130 行。内訳は Phase の進行を述べる導入文
（各 skill の「Phase N: 〜」直下の 1〜2 行、計 12 箇所程度）、引数の場合分けと Read 手順、
インタビューの進め方 5 ステップ (requirements:144-148)、生成アルゴリズムの Step 見出しと手順の並び
(test-plan:191-264 のうち順序を述べる部分) など。
体言止めの列挙（読み取る対象・調査対象・質問のカテゴリ・文書構成の雛形列・終了条件の条件列）は
条項化せず、それを導く行動規定文 1 件の補足に畳んだ。この畳み込みで約 70 項目が個別条項にならずに済んでいる。
