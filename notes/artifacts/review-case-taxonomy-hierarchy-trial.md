# 分類の階層の下書きの当てはめの試行

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

[日本語のレビュー指摘の誤りの分類の階層（下書き）](./review-case-taxonomy-hierarchy-draft.md)の上位の分類を、208 件の誤りに当てはめた試行。
208 件は、[事例の誤りの種類と単位の組み合わせ（2026-09-25）](./review-case-error-unit-matrix.md)（以下、仮の一覧）の 207 件に、本体の確定で文の単位に加えた文9-1 を足したもの。
当てはめはすべてこの試行の判断で、ユーザーとは合意していない。

## この表の読み方

- 事例番号: 「文」は[norm-refit の PR レビューの文レベル指摘 事例集](./sentence-level-review-cases.md)、
  「構」は[レビューの構造レベル指摘 事例集](./structure-level-review-cases.md)の番号。枝番は仮の一覧の切り出し方に従う
- 単位: 仮の一覧の単位のまま。単位を変えるべきだと考えた事例は、最後の列に「単位の見直し候補（単位）」と書き、単位は変えていない
- 上位の分類の ID: 下書きの ID。1 件に 1 つだけ付けた
- 確信: 「確か」は定義に照らして迷わなかったもの、「迷った」は 2 つ以上の上位の分類の間で迷ったか、定義に当てはまるか迷ったもの
- 最後の列: 迷った理由と、ほかに当たる上位の分類。「確か」の事例でも、ほかに当たる分類があれば書いた。
  「仮の一覧の注記」は仮の一覧の節「方針に反する疑い」「判断に迷ったもの」の記述を、
  「既存の型の案の注記」は[語の単位の 2 段目の型の案（2026-09-25）](./review-case-word-types-draft.md)・[文の単位の 2 段目の型の案（2026-09-25）](./review-case-sentence-types-draft.md)・[ブロック・節の中・節どうし・文書間の 2 段目の型の案（2026-09-25）](./review-case-wide-unit-types-draft.md)の「境界があいまいな事例」「単位を見直す候補」の記述を指す

## 当てはめの表

| 事例番号 | 単位 | 上位の分類の ID | 確信 | 迷った理由か、ほかに当たる分類 |
| --- | --- | --- | --- | --- |
| 文5-1 | 語 | `word.referent-unclear` | 確か |  |
| 文5-2 | 語 | `word.form-jarring` | 確か |  |
| 文5-3 | 語 | `word.referent-unclear` | 確か |  |
| 文5-4 | 語 | `word.referent-unclear` | 確か |  |
| 文5-5 | 語 | `word.referent-unclear` | 確か |  |
| 文5-6 | 語 | `word.referent-unclear` | 確か | ほか: word.form-jarring（一般的でない語という指摘も含む） |
| 文5-8 | 語 | `word.action-unclear` | 確か |  |
| 文5-9① | 語 | `word.referent-unclear` | 確か |  |
| 文5-9② | 語 | `word.referent-unclear` | 確か |  |
| 文5-10①a | 語 | `word.referent-unclear` | 確か | 汎用語と多義の両方に当たるが、どちらもこの分類の細分類 |
| 文5-10①b | 語 | `word.referent-unclear` | 確か |  |
| 文5-10② | 語 | `word.referent-unclear` | 確か | ほか: word.action-unclear（「反転する」） |
| 文5-13 | 語 | `word.scope-misread` | 迷った | 「各社」が全候補に広がる範囲の問題と取った。どの候補かを指せない問題と取れば word.referent-unclear |
| 文5-14 | 語 | `word.referent-unclear` | 確か |  |
| 文5-16 | 語 | `word.referent-unclear` | 確か |  |
| 文5-18 | 語 | `word.referent-unclear` | 確か |  |
| 文5-19a | 語 | `word.referent-unclear` | 確か |  |
| 文5-19b | 語 | `word.referent-unclear` | 確か |  |
| 文5-20 | 語 | `word.action-unclear` | 迷った | 見出しの「対応」を動作名詞として取った。ほか: word.referent-unclear、sentence.heading-uninformative |
| 文5-21 | 語 | `word.referent-unclear` | 迷った | 見出しの「関連」。ほか: sentence.heading-uninformative |
| 文5-22 | 語 | `word.referent-unclear` | 確か |  |
| 文5-23 | 語 | `word.action-unclear` | 確か | ほか: sentence.info-missing（ラベルの定義の中身が足りない） |
| 文5-25 | 語 | `word.form-jarring` | 迷った | 公式の呼称と違う造語。公式資料で引けない点を重く見れば word.referent-unclear |
| 文5-26 | 語 | `word.referent-unclear` | 確か |  |
| 文5-31 | 語 | `word.referent-unclear` | 確か |  |
| 文5-32 | 語 | `word.referent-unclear` | 確か |  |
| 文5-33 | 語 | `word.referent-unclear` | 確か |  |
| 文5-36 | 語 | `word.form-jarring` | 確か |  |
| 文5-37 | 語 | `word.referent-unclear` | 迷った | after が語の言い換えではなく、別の主張に変わっている |
| 文5-38 | 語 | `word.referent-unclear` | 確か |  |
| 文5-42 | 語 | `word.referent-unclear` | 確か |  |
| 文5-44 | 語 | `word.referent-unclear` | 確か | ほか: word.action-unclear（工程を指す語） |
| 文5-46 | 語 | `word.referent-unclear` | 確か |  |
| 文4-17b | 語 | `word.referent-unclear` | 確か |  |
| 文4-18b | 語 | `word.referent-unclear` | 確か |  |
| 文4-19b | 語 | `word.referent-unclear` | 確か |  |
| 文4-20b | 語 | `word.action-unclear` | 迷った | b が指す語句が仮の一覧に無く、補記の「タスクが動く」と読んだ。「決めたセッション」「失効条件」を指すなら word.referent-unclear |
| 文5-41b | 語 | `word.referent-unclear` | 確か |  |
| 文7-4a | 語 | `word.scope-misread` | 迷った | 例の印が無い点を取った。何の例かが分からない点を取れば word.referent-unclear |
| 文4-22b | 語 | `word.form-jarring` | 確か |  |
| 構11-1b | 語 | `word.referent-unclear` | 確か |  |
| 文5-24 | 語 | `word.referent-unclear` | 確か | 1 語が 4 つの物を指す |
| 文5-27 | 語 | `word.referent-unclear` | 確か | 呼称の揺れ |
| 文5-39 | 語 | `word.referent-unclear` | 確か | 呼称の揺れ |
| 文5-30 | 語 | `word.action-unclear` | 確か |  |
| 文5-34 | 語 | `word.action-unclear` | 確か |  |
| 文5-43 | 語 | `word.action-unclear` | 迷った | 動詞が実体より狭い。範囲の読み違いと取れば word.scope-misread |
| 文13-1 | 語 | `word.action-unclear` | 確か | ほか: word.referent-unclear（「推奨」→「推奨候補」も直した） |
| 文13-2 | 語 | `word.referent-unclear` | 迷った | 直したのは名詞（「推奨」→「推奨候補」）で、名詞と動詞の組で曖昧になる。ほか: word.action-unclear |
| 構10-4c | 語 | `word.action-unclear` | 確か |  |
| 文5-40 | 語 | `word.referent-unclear` | 迷った | 廃止した概念の語。経緯を書いた点を取れば word.other |
| 文15-1 | 語 | `word.scope-misread` | 確か |  |
| 文2-2 | 語 | `word.scope-misread` | 確か |  |
| 文10-2 | 語 | `word.scope-misread` | 確か |  |
| 文10-3 | 語 | `word.scope-misread` | 確か |  |
| 文10-4 | 語 | `word.scope-misread` | 確か |  |
| 文10-1 | 語 | `word.form-jarring` | 確か |  |
| 文11-1 | 語 | `word.scope-misread` | 確か |  |
| 構4-3a | 語 | `word.referent-unclear` | 確か | ほか: across-docs.reference-insufficient（同じ指摘から分けた構4-3b） |
| 文4-1 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-2 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-3 | 文 | `sentence.argument-missing` | 迷った | 見出しの事例。ほか: sentence.heading-uninformative |
| 文4-4 | 文 | `sentence.argument-missing` | 確か | ほか: word.referent-unclear（「対象」「既存パターン」） |
| 文4-5 | 文 | `sentence.argument-missing` | 確か | ほか: word.referent-unclear（「確認の工程」） |
| 文4-6① | 文 | `sentence.argument-missing` | 確か |  |
| 文4-6② | 文 | `sentence.argument-missing` | 確か | 名詞構文 |
| 文4-7 | 文 | `sentence.argument-missing` | 迷った | 誰に向けた指示かを取り違えた。ほか: sentence.topic-mismatch |
| 文4-8 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-9 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-10 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-11 | 文 | `sentence.argument-missing` | 確か | 表のセル |
| 文4-12 | 文 | `sentence.argument-missing` | 迷った | 見出しを名詞句から文へ直した。ほか: sentence.heading-uninformative |
| 文4-13 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-14 | 文 | `sentence.argument-missing` | 迷った | 相手側の制約を書き、こちらが満たすことを主題にしていない。ほか: sentence.topic-mismatch |
| 文4-15 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-16 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-17a | 文 | `sentence.argument-missing` | 確か | 名詞構文 |
| 文4-19a | 文 | `sentence.argument-missing` | 確か |  |
| 文4-20a | 文 | `sentence.argument-missing` | 確か |  |
| 文4-21 | 文 | `sentence.argument-missing` | 確か |  |
| 文4-24a | 文 | `sentence.argument-missing` | 確か |  |
| 文4-24b | 文 | `sentence.argument-missing` | 確か |  |
| 文5-15 | 文 | `sentence.argument-missing` | 確か |  |
| 文5-41a | 文 | `sentence.argument-missing` | 確か |  |
| 文1-2b | 文 | `sentence.topic-mismatch` | 確か |  |
| 文13-3 | 文 | `sentence.topic-mismatch` | 確か | ほか: word.action-unclear（「外れる」） |
| 文16-1 | 文 | `sentence.topic-mismatch` | 確か |  |
| 文1-1 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文1-2a | 文 | `sentence.structure-unresolved` | 確か |  |
| 文1-3 | 文 | `sentence.structure-unresolved` | 確か | ほか: sentence.argument-missing（plugin を動作主にした格） |
| 文3-6 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文2-1 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文2-3 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文3-1 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文3-2 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文3-3 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文3-4 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文6-1 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文5-35 | 文 | `sentence.scope-misread` | 確か | ほか: sentence.heading-uninformative（見出し） |
| 文5-45 | 文 | `sentence.argument-missing` | 迷った | 単位の見直し候補（語）: 名詞「代替 IdP」に何の代替かが無いだけで、語を補えば直る |
| 文8-1 | 文 | `sentence.scope-misread` | 確か |  |
| 文11-2 | 文 | `sentence.scope-misread` | 確か |  |
| 文11-5 | 文 | `sentence.scope-misread` | 確か |  |
| 文3-5 | 文 | `sentence.heading-uninformative` | 迷った | 見出しではなく、箇条書きを導く 1 行。ほか: sentence.argument-missing（主語の欠落） |
| 文5-7 | 文 | `sentence.heading-uninformative` | 確か |  |
| 文5-11 | 文 | `sentence.argument-missing` | 確か | 2 通りに読める原因が、動作主と目的語の欠落 |
| 文5-12 | 文 | `sentence.argument-missing` | 確か |  |
| 文5-17a | 文 | `sentence.heading-uninformative` | 確か |  |
| 文5-17b | 文 | `sentence.argument-missing` | 迷った | 原因は汎用語（「規模」「共通に置く」）。ほか: word.referent-unclear、word.action-unclear |
| 文5-28a | 文 | `sentence.heading-uninformative` | 確か |  |
| 文5-28b | 文 | `sentence.heading-uninformative` | 確か |  |
| 文5-29 | 文 | `sentence.heading-uninformative` | 確か |  |
| 文7-2 | 文 | `sentence.argument-missing` | 迷った | 抽象名詞を主語にした判定基準で、欠けた項を 1 つに絞れない。ほか: sentence.structure-unresolved |
| 文7-5a | 文 | `sentence.argument-missing` | 迷った | 単位の見直し候補（語）: 指摘は「その記述」が何を指すかを問うている |
| 文7-6 | 文 | `sentence.structure-unresolved` | 迷った | 反実仮想の条件を 1 文に詰めた判定基準。基準そのものが成り立たない点は規範の内容の問題 |
| 文7-7 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文4-23a | 文 | `sentence.heading-uninformative` | 確か |  |
| 文4-23b | 文 | `sentence.heading-uninformative` | 確か | 名詞構文でもある |
| 構4-1b | 文 | `sentence.topic-mismatch` | 迷った | 案内の文が、主張（順位が覆る）ではなく条件の所在を主題にした。ほか: sentence.redundant |
| 構28-2 | 文 | `sentence.heading-uninformative` | 確か |  |
| 文7-1 | 文 | `sentence.structure-unresolved` | 確か |  |
| 文7-3 | 文 | `sentence.structure-unresolved` | 迷った | 条件の詰め込みに加え、「軸が実在する」の語も取れない。ほか: word.referent-unclear |
| 文17-1 | 文 | `sentence.register-jarring` | 確か |  |
| 文17-2 | 文 | `sentence.register-jarring` | 確か | ほか: sentence.redundant（同じ指摘が「説明が冗長」とも言う） |
| 文17-3 | 文 | `sentence.register-jarring` | 確か |  |
| 文12-1 | 文 | `sentence.redundant` | 迷った | 冗長というより、誰も立てていない命題を読ませる。AI に多い型の候補 |
| 文11-4 | 文 | `sentence.scope-misread` | 確か |  |
| 文11-6 | 文 | `sentence.scope-misread` | 確か |  |
| 文11-3 | 文 | `sentence.scope-misread` | 確か |  |
| 文7-8 | 文 | `sentence.redundant` | 確か |  |
| 構14-3 | 文 | `sentence.scope-misread` | 確か | 確かさの読み違い |
| 構11-4b | 文 | `sentence.redundant` | 確か |  |
| 構16-5 | 文 | `sentence.redundant` | 迷った | 参照先が持つ中身の数え上げ。ほか: across-docs.duplicated |
| 構21-1a | 文 | `sentence.info-missing` | 迷った | 算出の動作を書いていない。ほか: sentence.argument-missing |
| 構27-2 | 文 | `sentence.other` | 迷った | Markdown が原文の改行を描画しない誤りで、文の構造の誤りではない |
| 構3-1a | 文 | `sentence.other` | 迷った | セルの中で、値の性質のラベルを値の後ろに置いた。ほか: sentence.scope-misread |
| 構15-3 | 文 | `sentence.redundant` | 迷った | 読み手が文脈で判断できる指示を足した。箇条書きの 1 項目ごと消えたので、ほか: block.unneeded-content |
| 文9-1 | 文 | `sentence.info-missing` | 確か | decision-record の確定で、文の単位の「必要な内容が無い」事例に加えた |
| 構1-3a | ブロック | `block.unneeded-content` | 迷った | 個々の値の説明の過剰と取れば語や文（仮の一覧が境界例に挙げた） |
| 構15-2 | ブロック | `block.unneeded-content` | 確か |  |
| 構6-3 | ブロック | `block.topic-boundary-unclear` | 確か |  |
| 構6-2 | ブロック | `block.topic-boundary-unclear` | 確か |  |
| 構6-1 | ブロック | `block.topic-boundary-unclear` | 迷った | 主題の切れ目より、表示上の見やすさの要求。ほか: block.structure-flattened |
| 構10-1 | ブロック | `block.structure-flattened` | 確か |  |
| 構10-3 | ブロック | `block.structure-flattened` | 確か |  |
| 構13-1 | ブロック | `block.unneeded-content` | 確か |  |
| 構13-3 | ブロック | `block.unneeded-content` | 確か |  |
| 構19-1 | ブロック | `block.correspondence-unclear` | 迷った | 同じ値が並ぶ理由が表から読めない。情報の不足と取れば block.other |
| 構12-2 | ブロック | `block.unneeded-content` | 迷った | 扱いの変わらない区別。構12-1（across-sections.division-mismatch）と同じ性質 |
| 構21-1b | ブロック | `block.structure-flattened` | 確か |  |
| 構26-3 | ブロック | `block.topic-boundary-unclear` | 確か |  |
| 構22-1a | ブロック | `block.correspondence-unclear` | 確か |  |
| 構22-1b | ブロック | `block.correspondence-unclear` | 迷った | 再指摘の「= を使え」だけなら記号の選択で、語とも読める（仮の一覧の注記） |
| 構10-4a | ブロック | `block.structure-flattened` | 確か |  |
| 構26-4 | ブロック | `block.structure-flattened` | 迷った | 補足の記法の選択で、文へ狭める余地がある（仮の一覧の注記） |
| 文14-1 | ブロック | `block.structure-flattened` | 迷った | 系列のラベルの語形。ほか: word.referent-unclear（「足切り」「充足」が未定義） |
| 文7-4b | ブロック | `block.correspondence-unclear` | 確か |  |
| 構14-1 | ブロック | `block.certainty-overread` | 確か |  |
| 構1-1 | 節の中 | `in-section.unneeded` | 確か |  |
| 構1-2 | 節の中 | `in-section.unneeded` | 確か |  |
| 構3-1b | 節の中 | `in-section.unneeded` | 確か |  |
| 構15-1 | 節の中 | `in-section.unneeded` | 確か |  |
| 構16-1 | 節の中 | `in-section.unneeded` | 確か |  |
| 構16-2 | 節の中 | `in-section.unneeded` | 確か |  |
| 構1-3b | 節の中 | `in-section.placement` | 確か |  |
| 構2-1 | 節の中 | `in-section.placement` | 確か | ほか: in-section.unneeded（同じ観点の説明を 1 行にまとめる） |
| 構2-2 | 節の中 | `in-section.placement` | 確か |  |
| 構2-3 | 節の中 | `in-section.placement` | 確か |  |
| 構11-1a | 節の中 | `in-section.scope-undeclared` | 確か |  |
| 構11-3 | 節の中 | `in-section.scope-undeclared` | 確か |  |
| 構11-4a | 節の中 | `in-section.scope-undeclared` | 確か |  |
| 構10-4b | 節の中 | `in-section.placement` | 確か |  |
| 構10-2 | 節の中 | `in-section.structure-unclear` | 確か |  |
| 構10-5 | 節の中 | `in-section.structure-unclear` | 確か |  |
| 構23-1 | 節の中 | `in-section.placement` | 迷った | 同じ対象の情報を、種類ごとのブロックに散らした。ほか: in-section.structure-unclear |
| 構27-1 | 節の中 | `in-section.structure-unclear` | 迷った | 単位の見直し候補（ブロック）: 箇条書き全体を 1 ブロックとみなせばブロックで閉じる。Markdown の描画の誤りでもある |
| 構7-2 | 節の中 | `in-section.unneeded` | 迷った | 探索の経緯は文書のどこにも要らない記述で、節の中に限らない |
| 構16-3 | 節どうし | `across-sections.repeated` | 迷った | 「換算用に」は 1 項目の中の不要語とも読める（既存の型の案の注記）。ほか: sentence.redundant |
| 構16-9 | 節どうし | `across-sections.repeated` | 確か |  |
| 構4-1 | 節どうし | `across-sections.misplaced` | 確か |  |
| 構7-1 | 節どうし | `across-sections.misplaced` | 迷った | 作成の経緯を前提の節に書いた。読者に要らない記述と取れば in-section.unneeded に近い |
| 構8-1 | 節どうし | `across-sections.division-mismatch` | 確か |  |
| 構26-1 | 節どうし | `across-sections.division-mismatch` | 確か |  |
| 構4-2 | 節どうし | `across-sections.division-mismatch` | 迷った | 見出しが無く、位置でしか参照できない。ほか: across-sections.role-unclear |
| 構5-1 | 節どうし | `across-sections.repeated` | 確か |  |
| 構5-2 | 節どうし | `across-sections.repeated` | 確か |  |
| 構16-4 | 節どうし | `across-sections.repeated` | 確か |  |
| 構11-2 | 節どうし | `across-sections.role-unclear` | 確か |  |
| 構12-1 | 節どうし | `across-sections.division-mismatch` | 迷った | 扱いの変わらない区別を節として立てた。ほか: across-docs.source-dependent-detail（要件番号の露出） |
| 構14-2 | 節どうし | `across-sections.misplaced` | 迷った | 未確認事項の節に載せなかった。内容の欠落と取れば across-sections.other |
| 文4-22 | 節どうし | `across-sections.other` | 迷った | 単位の見直し候補（文）: 見出し 6 つの 1 つずつなら sentence.heading-uninformative。揃えすぎは AI に多い型の候補 |
| 構28-1 | 節どうし | `across-sections.role-unclear` | 迷った | 中身を運ばない番号で節を構成し、参照した。ほか: across-sections.division-mismatch（チケットの切り方へ束ね直した） |
| 構26-2 | 節どうし | `across-sections.misplaced` | 確か |  |
| 構18-1 | 節どうし | `across-sections.role-unclear` | 確か |  |
| 構4-3b | 文書間 | `across-docs.reference-insufficient` | 確か |  |
| 構9-1 | 文書間 | `across-docs.source-dependent-detail` | 確か |  |
| 構9-2 | 文書間 | `across-docs.source-dependent-detail` | 確か |  |
| 構9-3 | 文書間 | `across-docs.source-dependent-detail` | 確か |  |
| 構9-4 | 文書間 | `across-docs.source-dependent-detail` | 確か |  |
| 構13-2 | 文書間 | `across-docs.duplicated` | 迷った | 導出過程まで載せた表の簡略化とも読める。ほか: block.unneeded-content |
| 構16-6 | 文書間 | `across-docs.duplicated` | 確か |  |
| 構16-7 | 文書間 | `across-docs.duplicated` | 確か |  |
| 構16-8 | 文書間 | `across-docs.duplicated` | 確か |  |
| 構20-1 | 文書間 | `across-docs.duplicated` | 迷った | 押し出し先の文書がまだ無かった。1 項目が長すぎるブロックの問題とも読める（block.unneeded-content） |
| 構20-2 | 文書間 | `across-docs.duplicated` | 確か |  |
| 構11-4c | 文書間 | `across-docs.boundary-mismatch` | 迷った | 文書ごとの詳しさの分担を案内していない。ほか: across-docs.reference-insufficient |
| 構24-1b | 文書間 | `across-docs.reference-insufficient` | 迷った | 理由を 1 文足せば直るので、文へ狭める余地がある（既存の型の案の注記） |
| 構29-1 | 文書間 | `across-docs.boundary-mismatch` | 確か |  |

※ 表 1 208 件の誤りへの上位の分類の当てはめ

## 集計

### 単位ごと・上位の分類ごとの件数

| 単位 | 上位の分類の ID | 件数 |
| --- | --- | ---: |
| 語（計 59） | `word.referent-unclear` | 37 |
| | `word.action-unclear` | 9 |
| | `word.scope-misread` | 8 |
| | `word.form-jarring` | 5 |
| | `word.other` | 0 |
| 文（計 79） | `sentence.argument-missing` | 31 |
| | `sentence.structure-unresolved` | 15 |
| | `sentence.topic-mismatch` | 4 |
| | `sentence.scope-misread` | 8 |
| | `sentence.heading-uninformative` | 9 |
| | `sentence.info-missing` | 2 |
| | `sentence.redundant` | 5 |
| | `sentence.register-jarring` | 3 |
| | `sentence.other` | 2 |
| ブロック（計 20） | `block.topic-boundary-unclear` | 4 |
| | `block.structure-flattened` | 6 |
| | `block.correspondence-unclear` | 4 |
| | `block.unneeded-content` | 5 |
| | `block.certainty-overread` | 1 |
| | `block.other` | 0 |
| 節の中（計 19） | `in-section.unneeded` | 7 |
| | `in-section.placement` | 6 |
| | `in-section.scope-undeclared` | 3 |
| | `in-section.structure-unclear` | 3 |
| | `in-section.other` | 0 |
| 節どうし（計 17） | `across-sections.repeated` | 5 |
| | `across-sections.misplaced` | 4 |
| | `across-sections.division-mismatch` | 4 |
| | `across-sections.role-unclear` | 3 |
| | `across-sections.other` | 1 |
| 文書間（計 14） | `across-docs.source-dependent-detail` | 4 |
| | `across-docs.duplicated` | 6 |
| | `across-docs.reference-insufficient` | 2 |
| | `across-docs.boundary-mismatch` | 2 |
| | `across-docs.other` | 0 |

※ 表 2 単位ごと・上位の分類ごとの件数

### 受け皿・迷った・ほかに当たる分類の件数

| 項目 | 件数 | 208 件に対する割合 |
| --- | ---: | ---: |
| 受け皿に入った件数 | 3 | 1.4% |
| 迷った件数 | 49 | 23.6% |
| 受け皿か迷ったに入った件数（重複を除く） | 49 | 23.6% |
| ほかに当たる上位の分類の ID を書いた件数 | 50 | 24.0% |
| 単位の見直し候補に印を付けた件数 | 4 | 1.9% |

※ 表 3 受け皿・迷った・ほかに当たる分類の件数

- 受け皿の 3 件（構27-2、構3-1a、文4-22）は、3 件とも「迷った」にも入れた。そのため、受け皿か迷ったに入った件数は迷った件数と同じ 49 件になる
- 受け皿と迷ったを合わせた 49 件は全体の 23.6% で、1 割を超える
- 迷った件数を単位ごとに見ると、語 10 件（59 件中）、文 18 件（79 件中）、ブロック 7 件（20 件中）、節の中 3 件（19 件中）、節どうし 7 件（17 件中）、文書間 4 件（14 件中）
- ほかに当たる分類の ID を書いた 50 件の内訳は、迷った 37 件、確か 13 件。迷った 49 件のうち残りの 12 件は、ほかの分類の ID ではなく、単位の見直しや定義への当てはまりで迷った
- 単位の見直し候補の 4 件は、文5-45（語へ）、文7-5a（語へ）、構27-1（ブロックへ）、文4-22（文へ）

## 208 件の数え直し

- 仮の一覧の「単位ごとの誤りの種類」の表から、事例番号を枝番ごとに展開して抜き出した。
  抜き出した件数は 207 件で、単位ごとに語 59・文 78・ブロック 20・節の中 19・節どうし 17・文書間 14 件。仮の一覧の「件数の照合」の表の 207 件と一致した
- 上の表 1 の 208 行を、単位と事例番号の組で、抜き出した 207 件と突き合わせた
    - 仮の一覧にあって表 1 に無い事例: 0 件
    - 表 1 にあって仮の一覧に無い事例: 1 件（文9-1。本体の確定で文の単位に加えた事例）
    - 表 1 の中で事例番号が重なる行: 0 件
    - 単位が仮の一覧と違う行: 0 件
- 表 2 の件数の合計は 59＋79＋20＋19＋17＋14＝208 件で、表 1 の行数と一致した
