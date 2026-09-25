# 人間が書いた文章の誤りの分類体系: 学術文献と標準の調査

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

調査日: 2026-09-25。対象は、査読のある会議・論文誌の論文、学術書、標準化団体の規格、学術の注釈体系、要求仕様の曖昧さの研究。
スタイルガイド・lint の規則・plain language の指針は、別の調査が担当するので扱わない。

## この文書の読み方

- 各分類体系について、次の 5 項目を書く。(1) 名前・一次情報の所在・査読の有無、(2) 階層の組み方、
  (3) 運用しながら直す仕組み、(4) 私たちの 6 単位（語・文・ブロック・節の中・節どうし・文書間）との対応、(5) 確かめ方
- 確かめ方の表記は 3 種類ある
    - **原文で確認**: 一次情報の PDF を取得し、`pdftotext` で本文を取り出して、該当箇所を自分で読んだ
    - **Web ページの要約経由**: WebFetch で一次情報の Web ページを取得したが、本文は WebFetch 内部の要約モデルを通して受け取った。
      引用として返ってきた文も、要約モデルが写したもので、自分では原文と突き合わせていない
    - **二次情報**: 別の論文・解説・百科事典の記述から得た
- 確かめられなかったものは「未確認」と書く
- 出典は本文で [著者 年] の形で引き、末尾の「参考文献」に書誌情報を並べる
- (4) の対応づけは、各体系のカテゴリ名と定義を読んで私が判定したもので、原典が 6 単位で整理しているわけではない

## 一覧

| # | 分類体系 | 分野 | 種別 | 段数 | 上位だけで付ける使い方 |
| --- | --- | --- | --- | --- | --- |
| 1 | MQM（Multidimensional Quality Metrics） | 翻訳の品質評価 | 査読論文 + コミュニティ仕様 + ISO 5060 の土台 | 3（版により 3 以上） | 明示的に許す |
| 2 | ISO 5060:2024 | 翻訳の品質評価 | 国際規格 | 主 / 下位の 2 段（定義で確認） | 未確認 |
| 3 | SAE J2450 | 翻訳の品質評価（自動車） | 業界規格 | 1 段 + 重大度 | 該当しない（平坦） |
| 4 | ERRANT | 文法誤り訂正 | 査読論文（ACL 2017） | 操作 × 種別の 2 軸、種別は 1〜2 段 | 集計の段で上位へ畳める |
| 5 | NUCLE の誤りタグ | 文法誤り訂正（学習者英語） | 査読論文（BEA 2013） | 2 段（13 群 / 27 種） | 未確認 |
| 6 | Cambridge Learner Corpus の誤りコード | 学習者英語 | 会議論文（Corpus Linguistics 2003） | 誤りの型 × 品詞の 2 軸 | 明示的に許す |
| 7 | NAIST 誤用コーパスの誤用タイプ | 日本語学習者の作文 | 査読論文（自然言語処理 2016） | 76 種を階層定義、実験では 3 段に組み直し | 第 1 階層へ畳んで使った実例あり |
| 8 | 曖昧さのハンドブック（Berry ら） | 要求仕様・契約書 | 学術者によるハンドブック（査読なし） | 2 段（4 類 + 関連現象） | 該当しない（参照用の分類） |
| 9 | Requirements Smells（Femmer ら） | 要求仕様 | 査読論文（JSS 2017） | 1 段（本文は 8 種と書くが定義は 9 つ）+ 対象単位の属性 | 該当しない（平坦） |
| 10 | ISO/IEC/IEEE 29148:2018 | 要求工学 | 国際規格 | 品質特性 2 群 + 言語の基準 | 未確認 |
| 11 | ソフトウェア文書の問題の分類（Aghajani ら） | ソフトウェア文書 | 査読論文（ICSE 2019 / 2020） | 4 以上（162 種） | 親カテゴリへ畳んで使った実例あり |
| 12 | 推敲の分類（Faigley & Witte ほか） | 作文研究・NLP | 査読論文（CCC 1981）と後続 | 最大 3 段 | 後続研究で下位を畳んだ実例あり |
| 13 | IteraTeR の編集意図 | 推敲（NLP） | 査読論文（ACL 2022） | 2 段 | 該当しない |
| 14 | 岩淵悦太郎 編著『悪文』 | 日本語の悪文研究 | 学術書（一般向け） | 2 段（8 章 + 節） | 該当しない（注釈体系ではない） |

※ 表 1 調べた分類体系の一覧。段数と「上位だけで付ける使い方」は、各節の本文で出典つきで書く

---

## 1. MQM（Multidimensional Quality Metrics）

### 1.1 名前と一次情報の所在

- 翻訳の品質を誤りの種類で評価するための、誤りの種類（issue type / error type）の階層と、評価指標の宣言の枠組み
- 一次情報は 3 系統ある
    - 査読論文: [Lommel 2014]（Tradumàtica 12 号、2014 年）
    - 仕様: MQM の定義文書。初期の版は QTLaunchPad / QT21 のプロジェクト（EU の研究資金）が公開した（[MQM spec 0.1.5 2014]）。
      現在は MQM Council（コミュニティ）が themqm.org で MQM 2.0 を維持している（[MQM Council typology]）
    - 規格との関係: MQM Core は「ISO 5060 と整合する既定」として示されている（[MQM Council Core]）。ISO 5060 は 2 節
- 種別: 学術（査読論文）とコミュニティ（仕様の維持）の両方。規格そのものではない

### 1.2 階層の組み方

- 現行（MQM 2.0）の最上位は 7 つの dimension: Terminology、Accuracy、Linguistic Conventions、Style、Locale Conventions、
  Audience Appropriateness、Design and Markup（[MQM Council typology]）
- 3 段目まである例として、Accuracy > Mistranslation > False friend / Misrepresentation of technical relationship /
  MT hallucination が示されている（[MQM Council typology]）
- MQM Core は、上 2 段だけを取り出した既定の部分集合（[MQM Council Core]）。2 段目の一覧は次のとおり
    - Terminology: Inconsistent with terminology resource、Inconsistent use of terminology、Wrong term
    - Accuracy: Mistranslation、Overtranslation、Undertranslation、Addition、Omission、Do not translate、Untranslated
    - Linguistic conventions: Grammar、Punctuation、Spelling、Unintelligible、Character encoding、Textual conventions
    - Style: Organization style、Third-party style、Inconsistent with external reference、Language register、
      Awkward style、Unidiomatic style、Inconsistent style
    - Locale conventions: Number format、Currency format、Measurement format、Time format、Date format、
      Address format、Telephone format、Shortcut key
    - Audience appropriateness: Culture-specific reference、Offensive
    - Design and markup: Layout、Markup tag、Truncation/text expansion、Missing text、Link/cross-reference
- 2014 年の版（0.1.5）の最上位は別の組み方だった: Accuracy、Fluency、Design、Verity、Internationalization、
  Compatibility（非推奨）、Other（[MQM spec 0.1.5 2014]）。2014 年 10 月時点の階層は 114 種（[Lommel 2014] p.458）

### 1.3 運用しながら直す仕組み

- **上位のノードをそのまま付けてよい**。[Lommel 2014] p.458 に次の文がある

  > Every node (including very high-level ones like Accuracy and Fluency) can serve as an issue type, and children of an
  > issue represent specific cases of the parent issue. As a result an MQM metric can be declared at various levels of granularity.

- **親は子で覆えない誤りの受け皿になる**。同論文 p.460 の例の指標では「Accuracy and Fluency serving for any issues not
  covered by their children」と書かれている
- **細かく分けすぎない**。同論文 p.459 は、評価者は細かいカテゴリほど区別しにくいので、指標は評価の目的に要る細かさに留めるのが
  良いとしている（原文: 「it is more difficult for evaluators to distinguish between fine-grained categories than higher-level ones」）。
  同じ段落は、自動検出の道具は細かく付け、後段で一般の型へ変換するかを決めるのがよいとも書く
- 仕様 0.1.5 には「if no specific categories apply precisely at a specific level, the parent should be selected」という規定があるとして返ってきた
  （[MQM spec 0.1.5 2014]、Web ページの要約経由）
- **拡張の手順**: 仕様 0.1.5 では、独自の issue type を user extension として足せる。ID は `x-` で始め、親（既存の型か別の拡張）と定義を持たせる。
  拡張は他の仕組みとの相互運用性を持たないと注記されている（[MQM spec 0.1.5 2014]、Web ページの要約経由）。
  [Lommel 2014] p.458 も、MQM に無い細部は custom MQM extensions として実装できると書く
- **版の管理**: MQM 1.0 から MQM 2.0 へ改訂され、2.0 の変更履歴が公開されている（[MQM Council typology]、Web ページの要約経由）
- **部分集合の選び方**: スコアカードの型は 12 前後に抑えることを勧める記述がある（[MQM Council design]、Web ページの要約経由）

### 1.4 6 単位との対応

- 語: Terminology の全体、Mistranslation、Spelling、Locale conventions の書式類
- 文: Grammar、Punctuation、Unintelligible、Awkward style、Unidiomatic style
- ブロック: Layout、Truncation/text expansion、Missing text（表・画面上の要素の欠落を含む）
- 節の中・節どうし: Inconsistent use of terminology、Inconsistent style（文書の中の一貫性）。節の構成そのものを扱う型は見当たらない
- 文書間: Inconsistent with terminology resource、Inconsistent with external reference、Link/cross-reference、
  Organization style / Third-party style（外部の規範への不適合）
- 注: MQM の Accuracy は原文と訳文の対応を見る型で、原文の無い技術文書には直接は当てはまらない。
  「参照すべき正の情報（仕様・コード）との対応」と読み替えれば、文書間の単位に当たる

### 1.5 確かめ方

- 原文で確認: [Lommel 2014] の p.458–460 の記述（階層の性質、細かさの指針、親を受け皿にする例、拡張への言及、114 種）
- Web ページの要約経由: 現行 7 dimension、MQM Core の 2 段目の一覧、MQM 2.0 と変更履歴、スコアカードの型を 12 前後にする記述、
  仕様 0.1.5 の最上位・親を選ぶ規定・`x-` 拡張の規則
- 未確認: MQM Full の全ノードと段数の上限。MQM 2.0 の変更履歴の中身。qt21.eu の定義文書（接続を拒否され読めなかった）

---

## 2. ISO 5060:2024

### 2.1 名前と一次情報の所在

- ISO 5060:2024 Translation services — Evaluation of translation output — General guidance（[ISO 5060 2024]）
- 標準化団体（ISO）の規格。要求事項ではなく手引き（guidance）

### 2.2 階層の組み方

- 3.4 節の用語定義で、誤りの分類を 2 段として定義している（規格のプレビューを原文で確認）
    - 3.4.2 error typology: 「classification system of errors」
    - 3.4.3 error type: 「class of translation error identified by name, definition and position in an error typology」
    - 3.4.4 main error type: 「superordinate error type」
    - 3.4.5 error sub-type: 「subordinate error type」
- 5.4 節 Error typology が本体だが、プレビューに含まれず読めなかった。
  二次情報では 7 つの主カテゴリ（Terminology、Accuracy、Linguistic conventions、Style、Locale conventions、Audience appropriateness など）と
  重大度（Critical / Major / Minor）を持つとされる（[Slator 2024]）。MQM Core と同じ 7 つである可能性が高いが、未確認

### 2.3 運用しながら直す仕組み

- 5.5 節 Error type weights、5.6〜5.7 節の重大度、5.8 節 Counting repeated errors が目次にある。中身は未確認
- 繰り返し出る同じ誤りの数え方を節として持つことは、目次から確認できる

### 2.4 6 単位との対応

- MQM Core と同じなら 1.4 と同じ。未確認

### 2.5 確かめ方

- 原文で確認: 題名、3.4 節の用語定義、目次（規格のプレビュー PDF）
- 二次情報: 7 つの主カテゴリと重大度（[Slator 2024]）
- 未確認: 5.4 節の本文、下位カテゴリ、上位だけで付ける使い方の可否

---

## 3. SAE J2450

### 3.1 名前と一次情報の所在

- SAE J2450 Translation Quality Metric（[SAE J2450]）。自動車の業界団体 SAE International の規格
- 2001 年 8 月に recommended practice として出て、2005 年に規格になった。現行は J2450_201608（二次情報）

### 3.2 階層の組み方

- 平坦な 7 種: Wrong term、Syntactic error、Omission、Word structure or agreement error、Misspelling、Punctuation error、
  Miscellaneous error。各誤りに重大度 2 段（serious / minor）を掛ける（[Wikipedia SAE J2450]）

### 3.3 運用しながら直す仕組み

- 未確認（規格本文を読めなかった。SAE のページは本文を返さなかった）

### 3.4 6 単位との対応

- 語と文だけ。ブロック以上は扱わない

### 3.5 確かめ方

- 二次情報: 7 種と重大度、版の年（[Wikipedia SAE J2450]）
- 補足: [Lommel 2014] p.457 が「seven for SAE J2450」と、7 種であることに触れている（原文で確認）
- 未確認: 規格本文、カテゴリの判定規則

---

## 4. ERRANT（ERRor ANnotation Toolkit）

### 4.1 名前と一次情報の所在

- [Bryant 2017]: ACL 2017（第 55 回年次大会）の長論文。査読のある学術の場
- 英語の文法誤り訂正（GEC）で、原文と訂正文の差分から編集を取り出し、規則で誤りの種類を付ける道具と分類体系

### 4.2 階層の組み方

- 2 つの軸を掛け合わせる（3.4 節、Table 2、p.795–796）
    - 操作の軸: `M:`（Missing）、`R:`（Replacement）、`U:`（Unnecessary）
    - 種別の軸: 25 の main error categories。ADJ、ADJ:FORM、ADV、CONJ、CONTR、DET、MORPH、NOUN、NOUN:INFL、NOUN:NUM、
      NOUN:POSS、ORTH、OTHER、PART、PREP、PRON、PUNCT、SPELL、UNK、VERB、VERB:FORM、VERB:INFL、VERB:SVA、VERB:TENSE、WO
- 種別の軸は品詞を上位に置き、`NOUN:NUM` のようにコロンで下位を付ける。実質 1〜2 段
- 受け皿の型が 2 つある: OTHER（「Errors that do not fall into any other category (e.g. paraphrasing)」）と
  UNK（「The annotator detected an error but was unable to correct it」）

### 4.3 運用しながら直す仕組み

- **集計の段で粒度を選べる**。p.796 の原文

  > This means we can choose to evaluate, for example, only replacement errors (anything prefixed by ‘R:’),
  > only noun errors (anything suffixed with ‘NOUN’) or only replacement noun errors (‘R:NOUN’).

- **カテゴリを増やすことへの注意**。p.796 で、`could → should` を modal error と呼ばず tense error にした理由を挙げ、
  狭い区別のためにカテゴリと規則を増やすのは実用的でないとして、
  「our final framework aims to be a compromise between informativeness and practicality」と書く
- 分類は品詞などデータセットに依存しない情報だけで決まり、決定的（p.795）。版の管理や追加の手順は論文には無い

### 4.4 6 単位との対応

- 語（ほぼ全部）と文（WO、VERB:SVA、PUNCT）。ブロック以上は扱わない。編集の単位がトークン列なので構造的に扱えない

### 4.5 確かめ方

- 原文で確認: 会議名・頁、2 軸の構成、25 種の一覧、OTHER と UNK の定義、粒度の選び方、カテゴリ追加への注意
- 未確認: 付録 A の有効な組み合わせの全一覧（読んでいない）

---

## 5. NUCLE（NUS Corpus of Learner English）の誤りタグ

### 5.1 名前と一次情報の所在

- [Dahlmeier 2013]: BEA 第 8 回ワークショップ（NAACL 併設）の論文。査読のある学術の場
- シンガポール国立大学の学生の英作文に、誤りの種類と訂正を付けたコーパス

### 5.2 階層の組み方

- 27 の誤りカテゴリを 13 の群にまとめた 2 段（Table 1、p.24–25）。群と、群に属するタグは次のとおり
    - Verbs: Vt（Verb Tense）、Vm（Verb modal）、V0（Missing verb）、Vform（Verb form）
    - Subject-verb agreement: SVA
    - Articles/determiners: ArtOrDet
    - Nouns: Nn（Noun Number）、Npos（Noun possessive）
    - Pronouns: Pform（Pronoun form）、Pref（Pronoun reference）
    - Word choice: Wcip（Wrong collocation/idiom/preposition）、Wa（Acronyms）、Wform（Word form）、Wtone（Tone）
    - Sentence Structure: Srun（Runons, comma splice）、Smod（Dangling modifier）、Spar（Parallelism）、Sfrag（Fragment）、
      Ssub（Subordinate clause）
    - Word Order: WOinc（Incorrect sentence form）、WOadv（Adverb/adjective position）
    - Transitions: Trans（Link words/phrases）
    - Mechanics: Mec（Punctuation, capitalization, spelling, typos）
    - Redundancy: Rloc（Local redundancy）
    - Citation: Cit（Citation）
    - Others: Others（Other errors）、Um（Unclear meaning）
- 語の単位の Wa は「Using acronyms without explaining what they stand for」と定義されている。私たちの「未定義語」に当たる

### 5.3 運用しながら直す仕組み

- 既存のタグセット（CELC で開発されたもの）を、試行注釈での注釈者の意見に基づいて小さく直してから採用した（p.23）
- 27 種を選んだ理由は、統計に意味が出る程度に細かく、大きなタグセットほど複雑でない妥協点だから（p.23）
- 上位の群だけを付ける使い方の記述は無い。未確認

### 5.4 6 単位との対応

- 語: Word choice の群、Nouns、Mechanics
- 文: Verbs、SVA、Sentence Structure、Word Order
- ブロック: Transitions（文と文のつなぎ）、Rloc（局所の冗長）
- 文書間: Cit（引用の不備）
- 語〜文にまたがる受け皿: Um（意味が取れない）

### 5.5 確かめ方

- 原文で確認: 会議名・頁、13 群 / 27 種の全一覧、Wa と Um の定義、タグセットの由来と修正の経緯

---

## 6. Cambridge Learner Corpus（CLC）の誤りコード

### 6.1 名前と一次情報の所在

- [Nicholls 2003]: Corpus Linguistics 2003 会議の論文集（UCREL Technical Papers）。学術の会議
- Cambridge University Press が構築した学習者英語コーパスの誤りコード

### 6.2 階層の組み方

- 大半のコードは 2 文字で、1 文字目が誤りの一般的な型、2 文字目が求められる語の品詞（p.573–574）
    - 一般的な型: F（wrong Form used）、M（something Missing）、R（word or phrase needs Replacing）、
      U（word or phrase is Unnecessary）、D（word is wrongly Derived）
    - 品詞: A（Pronoun）、C（Conjunction）、D（Determiner）、J（Adjective）、N（Noun）、Q（Quantifier）、T（Preposition）、
      V（Verb）、Y（Adverb）
- ほかに、句読点（MP / RP / UP）、可算性（CN / CQ / CD）、False friend（FF + 品詞）、一致（AGA / AGD / AGN / AGV）、
  追加のコード（AS、CE、CL、ID、IN、IV、L、S、SA、SX、TV、W、X）がある（p.574）
- 二次情報では全体で 88 種（[Dahlmeier 2013] 6 節が CLC を 88 カテゴリと書く）

### 6.3 運用しながら直す仕組み

- **細かく決められないときは上位の型だけを付ける**。p.574 の原文

  > The codes M, R, and U can occur alone where no more specific information can be given.

- **分類そのものを目的にしない**。p.572 に、体系的な分類を作ることが目的ではなく、同じ種類の誤りを 1 つの見出しに集めて
  取り出せるようにすることが目的だと書かれている。コードは「bookmarks to the contexts in which an error repeatedly occurs」
- **受け皿**: CE（Complex Error）は、複数の誤りが絡んで意図が決まらない語群をまとめる受け皿（p.574）
- **検索用のまとめコード**: スペリング系の区別は、`<#SPELL>` という群のコードで検索すれば無視できる（p.574）
- **確信が無ければ一般の型へ**: FF は既知の false friend だと確信できるときだけ使い、それ以外は R として扱う（p.574）

### 6.4 6 単位との対応

- 語（大半）と文（W 語順、AS 項構造、句読点）。L（inappropriate register）は語〜文の文体。ブロック以上は扱わない

### 6.5 確かめ方

- 原文で確認: 頁（572–581）、2 軸の構成、各コード、M / R / U を単独で使う規定、目的の記述、CE、`<#SPELL>`
- 未確認: 88 種という総数（[Dahlmeier 2013] の記述による二次情報）

---

## 7. NAIST 誤用コーパスの誤用タイプ（日本語学習者の作文）

### 7.1 名前と一次情報の所在

- [大山 2016]: 『自然言語処理』（言語処理学会の論文誌）23 巻 2 号。査読のある論文誌
- 日本語学習者の作文に誤用タイプを付け、階層を使って自動分類する研究。誤用タイプ表の設計の経緯を詳しく書いている

### 7.2 階層の組み方

- 全 76 種の誤用タイプを階層的に定義し、第 1 階層は 23 種（3.2.3 節、p.202）。実験に使った 17 種と使わなかった 6 種が表 2（p.203）
    - 表 2 の誤用タイプ: 助詞、語彙選択、表記、不足、動詞、余剰、文体、名詞化、接続、形容詞、指示詞、語順、コロケーション、
      「だ」の使用、否定、副詞、代名詞、名詞、名詞修飾、モダリティ、成句、全文変換、その他
- 設計の元にした先行の分類（3.2.2 節、p.200–202。いずれも [大山 2016] を通した二次情報）
    - 市川（1997, 2000）: 8 つの主要分類（ムード、テンス・アスペクト、自動詞・他動詞・ヴォイス、やりもらい、取り立て助詞、
      格助詞・連体助詞・複合助詞、連用修飾・連体修飾、従属節）と 86 の下位項目。
      市川（2001）はさらに各下位項目を「脱落、付加、混同、誤形成、位置、その他」に分ける
    - SST コーパス: 品詞を第 1 階層、「活用の誤り、格の誤り、単複の誤り、語彙選択の誤り」などを第 2 階層に置く
- 実験では 17 種を 3 段に組み直した（3.2.5 節、p.205–206）。第 1 段で「不足」「余剰」「置換」、第 2 段で「置換」を文法的誤用と語彙的誤用に分ける
- 誤用の範囲の単位について、細川（1993）が寺村（1972）に基づいて「1) 語彙レベルの誤用、2) 文構成レベルの誤用、3) 談話レベルの誤用」の
  3 レベルを立てていると紹介している（p.206。二次情報）。私たちの最上位（誤りの範囲の単位）と同じ発想の先行例

### 7.3 運用しながら直す仕組み

- **同じ下位タイプを複数の親の下に重ねない**。SST コーパスでは「活用の誤り」が名詞・動詞・副詞・代名詞の下にそれぞれあり、
  注釈者が意識するタグが増えて作業が煩雑になる。そこで NAIST 誤用コーパスは多クラスではなく多ラベルで付ける設計にし、
  複雑な階層を把握しなくても付けられるようにした（p.200–201）
- **親の下に置いていた型を独立させた**。市川の分類では「脱落、付加」が各項目の下位にあったが、事例が少ないので
  「不足」「余剰」を独立した項にした（p.202）
- **第 1 階層へ畳んで使う**。76 種を第 1 階層までまとめ上げて実験に使った（p.202）
- **分類の迷いから階層を組み直した**。日本語教師 11 人に分類させると「語彙選択」が他の型と混同されやすかったので、17 種を 3 段に組み直した（p.205–206）
- 分類表の作り方として、清水ら（2004）の 2 方式（文法記述から作る / 実際の誤用分析から作る）を紹介している（p.201。二次情報）

### 7.4 6 単位との対応

- 語: 表記、語彙選択、コロケーション、指示詞、助詞、動詞などの語形
- 文: 語順、名詞修飾、全文変換、不足・余剰
- ブロック: 接続（文と文のつなぎを含む）
- 談話レベル（ブロック以上）は、細川（1993）の枠組みにはあるが、この研究では扱っていない（p.206）

### 7.5 確かめ方

- 原文で確認: 論文誌・巻号・頁、76 種 / 第 1 階層 23 種、表 2、3 段への組み直し、多ラベルにした理由、「不足」「余剰」の独立、市川・SST の構成の紹介
- 二次情報: 市川・SST・清水ら・細川の分類の中身（本論文の紹介による）
- 未確認: 付録 B の 76 項目の全一覧（読んでいない）。細川（1993）の原典

---

## 8. 曖昧さのハンドブック（Berry, Kamsties, Krieger）

### 8.1 名前と一次情報の所在

- [Berry 2003]: 『From Contract Drafting to Software Specification: Linguistic Sources of Ambiguity — A Handbook』Version 1.0、2003 年 11 月
- 要求工学と法学の研究者が著者のハンドブックで、著者のサイトで公開されている。査読を経た出版物ではない

### 8.2 階層の組み方

- 3.3 節（p.10–14）で、言語学の曖昧さを 4 類に分け、関連する現象を加える
    - Lexical ambiguity: homonymy、polysemy（systematic polysemy を含む）
    - Syntactic ambiguity: analytical、attachment、coordination、elliptical
    - Semantic ambiguity: coordination、referential、scope
    - Pragmatic ambiguity: referential、deictic
    - 関連する現象: Vagueness and Generality（3.3.5 節）、Language Error（3.3.6 節。文法・句読点・語の選択などの誤りで、書き手の意図と違う意味に読まれるもの）
- 3.2 節（p.7–9）で、ソフトウェア工学の定義として、曖昧さを 2 系統に分ける先行研究を紹介している
    - language ambiguities（言語に耳のある読者なら誰でも気づける）と software engineering ambiguities（領域の知識が無いと気づけない）
    - Gause と Weinberg の 2 源泉: missing information（情報の欠落）と communication errors（表現の不十分さ）。
      ハンドブックが扱うのは後者の expression inadequacies
- 5 章は、語ごと・構文ごとの具体的な項目の一覧（5.1 Ambiguous, Vague, and Uncertain Words、5.2 Quantification、
  5.3 Only, Also, and Others、5.4 Structural Ambiguity（5.4.2 Pronoun References、5.4.3 This and Whole Ideas を含む）、
  5.5 Parallelism、5.7 Time Expressions など）

### 8.3 運用しながら直す仕組み

- **分類は排他でない**。p.10 の原文: 「Note that this classification is not mutually exclusive. Rather, the ambiguity or ambiguities occurring
  in a single ambiguous text may be a combination of several kinds.」。3.3.6 節でも Language Error は他の類と排他でないと書く
- 版は Version 1.0。カテゴリを足す手順は無い（手引書であって注釈体系ではない）

### 8.4 6 単位との対応

- 語: lexical ambiguity、vagueness、5.1 と 5.2 の語の項目
- 文: syntactic ambiguity、scope ambiguity、5.4 の構造の項目
- ブロック: referential ambiguity（照応先が前の文にある場合）、5.4.3 This and Whole Ideas（指示語が前の考え全体を指す場合）
- 文書間: software engineering ambiguities と missing information は、読者の領域知識や文書の外の情報に依存する。
  ハンドブックは扱わないと明言している

### 8.5 確かめ方

- 原文で確認: 題名・版・日付、3.2 節と 3.3 節の分類と定義、排他でないという記述、5 章の見出し

---

## 9. Requirements Smells（Femmer ら）

### 9.1 名前と一次情報の所在

- [Femmer 2017]: Journal of Systems and Software 123 巻。査読のある論文誌。arXiv 版（1611.08847）で読んだ

### 9.2 階層の組み方

- 平坦な一覧で、各 smell に影響を受ける単位（Entity）を属性として付ける（3.2 節、arXiv 版 p.9–10）
    - Subjective Language（Entity: Word）
    - Ambiguous Adverbs and Adjectives（Entity: Adverb, Adjective）
    - Loopholes（Entity: Word）
    - Open-ended, Non-verifiable Terms（Entity: Word）
    - Superlatives（Entity: Adverb, Adjective）
    - Comparatives（Entity: Adverb, Adjective）
    - Negative Statements（Entity: Word）
    - Vague Pronouns（Entity: Pronoun）
    - Incomplete References（Entity: Text reference）
- 注: 1 節（arXiv 版 p.2）は「eight smells」を定義すると書くが、3.2 節の定義を数えると上の 9 つある。
  食い違いの理由（どれかを smell として数えていないのか、版の違いか）は未確認
- 各 smell は ISO/IEC/IEEE 29148 の requirements language criteria から導いたもの（p.9）

### 9.3 運用しながら直す仕組み

- **smell と欠陥を分ける**（3.1 節、p.8）。smell は品質違反の兆候で、必ず欠陥になるわけではなく、
  問題かどうかは文脈で個別に判断し、レビューで確かめる。smell は必ず具体的な位置（語や語の並び）を指す
- 網羅的な smell の集合を作るのは今後の課題だと書く（p.9）。追加の手順は無い

### 9.4 6 単位との対応

- 語: Subjective Language、Ambiguous Adverbs and Adjectives、Loopholes、Open-ended Terms、Superlatives、Comparatives
- 文: Negative Statements
- ブロック: Vague Pronouns（照応先が文の外にある場合）
- 文書間: Incomplete References（読者が辿れない参照）

### 9.5 確かめ方

- 原文で確認: 論文誌（arXiv 版の記載 doi:10.1016/j.jss.2016.02.047）、smell の定義と Entity、smell と欠陥の区別
- 二次情報: 巻 123・頁 190–213（検索結果の書誌による）

---

## 10. ISO/IEC/IEEE 29148:2018

### 10.1 名前と一次情報の所在

- ISO/IEC/IEEE 29148:2018 Systems and software engineering — Life cycle processes — Requirements engineering（[ISO 29148 2018]）
- 標準化団体（ISO / IEC / IEEE）の規格

### 10.2 階層の組み方

- 個々の要求の品質特性と、要求の集合の品質特性を分ける（[Femmer 2017] p.9 の紹介による二次情報）
- 個々の要求の特性は 9 つ: necessary、appropriate、unambiguous、complete、singular、feasible、verifiable、correct、conforming。
  集合の特性は 5 つ（検索結果の解説による二次情報。集合側の 5 つの名前は確認していない）
- requirements language criteria を持ち、[Femmer 2017] の smell はここから導かれている（二次情報）

### 10.3 運用しながら直す仕組み

- 未確認

### 10.4 6 単位との対応

- 個々の要求の特性は語〜ブロック、集合の特性（一貫性・完全性）は節どうし〜文書間に当たる。未確認の情報に基づく判定

### 10.5 確かめ方

- 二次情報のみ。規格本文は有料で読めなかった

---

## 11. ソフトウェア文書の問題の分類（Aghajani ら）

### 11.1 名前と一次情報の所在

- [Aghajani 2019]: ICSE 2019（ソフトウェア工学の主要会議）の論文「Software Documentation Issues Unveiled」。査読のある学術の場。
  メーリングリスト・Stack Overflow・issue・PR から 878 件の文書関連の記録を分析し、162 種の問題の分類を作った
- [Aghajani 2020]: 同じ著者らの ICSE 2020 の論文「Software Documentation: The Practitioners' Perspective」。
  2019 年の分類を要約し、実務者 146 人への調査に使った。今回はこちらを原文で読んだ

### 11.2 階層の組み方

- 最上位は 4 つ（[Aghajani 2020] 3.2 節）
    - Information Content (What): 文書に何が書いてあるかの問題。分析した記録の 55%。2 段目は Correctness、Completeness、Up-to-dateness
    - Information Content (How): どう書かれ、どう組まれているかの問題。2 段目は Maintainability、Readability、Usability、Usefulness
    - Process Related: 文書を作る工程の問題（9%）。2 段目は Internationalization、Contributing to Documentation、Doc-generator configuration、
      Development issues caused by documentation、Traceability の 5 つ
    - Tool Related: 文書の道具の問題（15%）
- 多段の階層で、例として Correctness は 5 つの下位を持ち、その 1 つがさらに 2 つに分かれて 4 段になる（3.2 節）
- 調査に使った 3 段目の例（Figure 2）
    - Correctness: Faulty tutorial、Inappropriate installation instructions、Erroneous code examples、Wrong code comments、Wrong translation
    - Completeness: Missing user documentation、Missing code behavior clarifications、Missing diagrams、Missing code comments、Missing links ほか
    - Up-to-dateness: Outdated/Obsolete references、Code-documentation inconsistency、Outdated example、Outdated version information ほか
    - Maintainability: Superfluous content、Clone/Duplicate content、Lengthy files
    - Readability: Clarity、Conciseness、Spelling and grammar
    - Usability: Accessibility/findability、Information organization、Format/presentation ほか
    - Usefulness: Content is not useful in practice
- 各 2 段目の下に「Other ... issues」の受け皿がある（Figure 2）

### 11.3 運用しながら直す仕組み

- **親カテゴリに畳んで使った**。2020 年の調査では 162 種を回答者に読ませるのは多すぎるので、
  同じ親を持つよく似た問題をまとめ、51 種にした（3.2 節）。例として「behavior described in the documentation is not implemented」と
  「code must change to match the documentation」の 2 つを、親の Code-documentation inconsistency だけで扱った
- 版の管理・追加の手順は未確認（2019 年の論文を読めていない）

### 11.4 6 単位との対応

- 語〜文: Readability の Spelling and grammar、Clarity、Conciseness
- ブロック: Erroneous code examples、Missing diagrams、Format/presentation
- 節の中・節どうし: Superfluous content、Clone/Duplicate content、Lengthy files、Information organization
- 文書間: Code-documentation inconsistency、Outdated/Obsolete references、Missing links、Accessibility/findability、Traceability
- 6 単位の中で、文書間と節どうしの問題をもっとも厚く扱っている

### 11.5 確かめ方

- 原文で確認: [Aghajani 2020] の、2019 年の分類の要約（4 分類と 2 段目、多段の階層、51 種への畳み方）と Figure 2 の項目
- 二次情報: 2019 年の分類の中身は、同じ著者らによる 2020 年の要約を通したもの
- 未確認: [Aghajani 2019] 本文（Figure 1 の 162 種の全体）。著者サイトの PDF は 404 だった

---

## 12. 推敲の分類（Faigley & Witte とその後続）

### 12.1 名前と一次情報の所在

- [Faigley 1981]: College Composition and Communication 32 巻 4 号（NCTE の論文誌）。査読のある学術誌。作文研究の推敲の分類の起点
- 後続を整理した概説: [Lan 2026]（Findings of ACL 2026、arXiv 2609.01610）。推敲の意図の分類（edit intention taxonomy、EIT）を 20 以上比べ、系譜を図示している

### 12.2 階層の組み方

- Faigley & Witte の最上位は、Surface Changes（意味を変えない表面の変更）と Text-Base Changes（内容を変える変更）。
  後者を Microstructure と Macrostructure に分ける（[Lan 2026] 付録 D.3。二次情報）
- Faigley & Witte の最下位（表面の変更の中の formal / meaning-preserving の区別、追加・削除・置換などの操作）は、原文を読めておらず未確認
- [Lan 2026] 5.1 節の整理（二次情報）: 多くの EIT は木構造で、平坦なものから最大 3 段まである。
  3 段のものは、意味を保つ変更と意味を変える変更を最上位で分ける

### 12.3 運用しながら直す仕組み

- **系譜で育つ**。[Lan 2026] 5.2 節は、後の EIT が前の EIT のカテゴリを統合・分割・改名して作られてきたとし、
  進化の型を 4 つ挙げる: reuse-based、merge-based、refinement-based、hierarchy adaptation
- **下位を畳んだ実例**。Zhang と Litman（2016）は、自分たちの 2015 年の分類の Surface の下位カテゴリを 1 つの Surface に畳み、
  事例の少ない Rebuttal を Warrant に統合した（[Lan 2026] 付録 D.3。二次情報）
- **例は葉にしか付かない**。[Lan 2026] 5.1 節は、例が葉のカテゴリにだけ示される分類が多く、解釈と比較を難しくしていると指摘する

### 12.4 6 単位との対応

- Surface Changes は語〜文、Microstructure はブロック〜節の中、Macrostructure は節どうし〜文書全体の要旨に当たる。
  原文未確認の情報に基づく判定

### 12.5 確かめ方

- 原文で確認: [Lan 2026] の 5.1 節、5.2 節、付録 D.3 の記述
- 二次情報: Faigley & Witte の最上位 2 分類と Micro / Macro の区別、Zhang と Litman（2016）の畳み方（いずれも [Lan 2026] 経由）
- 未確認: [Faigley 1981] 本文（NCTE / JSTOR で読めなかった）

---

## 13. IteraTeR の編集意図

### 13.1 名前と一次情報の所在

- [Du 2022]: ACL 2022 の長論文。査読のある学術の場。arXiv 2203.03802
- Wikipedia・arXiv の論文要旨・Wikinews の、人間による推敲の履歴に、編集意図を付けたコーパス

### 13.2 階層の組み方

- 2 段（4.2.1 節、Table 4、p.3576）
    - MEANING-CHANGED: 「Update or add new information to the text.」
    - NON-MEANING-CHANGED の下に 4 つ
        - FLUENCY: 「Fix grammatical errors in the text.」
        - COHERENCE: 「Make the text more cohesive, logically linked and consistent as a whole.」
        - CLARITY: 「Make the text more formal, concise, readable and understandable.」
        - STYLE: 「Convey the writer's writing preferences, including emotions, tone, voice, etc..」
    - OTHER: 「Edits that are not recognizable and do not belong to the above intentions.」
- 先行研究（Rathjens 1985、Harris 2017）の上に作ったと書かれている（p.3576）
- 編集の対象の単位を定義している（3 節、p.3575）: token と phrase への変更を sentence-level、sentence への変更を paragraph-level、
  paragraph への変更を document-level の編集と呼ぶ
- 1 つの編集には 1 つの意図だけを付ける前提（p.3575）

### 13.3 運用しながら直す仕組み

- 上記の分類に収まらない編集のために OTHER を設けた（p.3576–3577）。全体の 1.44%
- 版の管理・追加の手順は無い

### 13.4 6 単位との対応

- 語・文: FLUENCY、CLARITY、STYLE
- ブロック: COHERENCE（文と文のつながり）。sentence 単位の編集は paragraph-level と定義されている
- 節の中・節どうし: paragraph 単位の編集（document-level）の定義はあるが、意図のカテゴリは単位を区別しない
- 文書間: 扱わない（MEANING-CHANGED は情報の更新で、外部との不整合の分類ではない）

### 13.5 確かめ方

- 原文で確認: 会議名・頁、Table 4 の定義と比率、単位の定義、1 編集 1 意図の前提、OTHER の位置づけ

---

## 14. 岩淵悦太郎 編著『悪文』

### 14.1 名前と一次情報の所在

- [岩淵 1979]: 日本評論社、第 3 版、1979 年。初版は 1960 年代前半（二次情報では「昭和 36 年以来」、別の二次情報では 1960 年）。
  2016 年に角川ソフィア文庫から『悪文 伝わる文章の作法』として再刊
- 国語学者の岩淵悦太郎が編著した研究書（一般向け）。査読の対象ではない

### 14.2 階層の組み方

- 章と節の 2 段。出版社のページの目次（[日本評論社 悪文]、Web ページの要約経由）
    - 悪文のいろいろ: わかりにくい文章 / 誤解される表現 / 堅すぎる文章 / 混乱した文章
    - 構想と段落: 段落なしは困る / 改行しすぎは段落なしにひとしい / 構想の立たない文章 / 構想のよくない文章
    - 文の切りつなぎ: 長すぎる文はくぎる / 判決文のまずさ / ニュース放送のわかりやすさ / すぎたるは及ばざるがごとし / 歯切れのよい文章
    - 文の途中での切り方: 中止法のいろいろ / 長い文は読みにくいか / 「そうして結合」をつないだ文 / 連用形による中止法 / 句読法 /
      接続助詞の「が」 / 悪文としての中止法
    - 文の筋を通す: 首尾が整っていない / 省略がすぎる / 並べ方がまずい / 副詞のおさめが悪い / 助詞へのおさめが悪い
    - 修飾の仕方: 助詞のくりかえしと省きすぎ / 並列の一方を忘れた文 / 修飾語のかかり方が乱れた文 / どこにかかるのか、わからない修飾語 /
      離れすぎた修飾語 / 長すぎる修飾語 / はさみこみ
    - 言葉を選ぶ: ひとり合点 / 「ように」の使い方一つでも / 引っかかるつながり方 / 無知か、慣用の無視か / あまりにも感覚的 / イメージがちぐはぐ
    - 敬語の使い方: 皇室敬語の今と昔 / 敬語の三種と、そのきまり / 敬語のつけすぎ / 敬語の誤用 / 敬語の不足 / 文体の不統一
    - 悪文をさけるための五十か条
- 章の並びは、読者への効果（第 1 章）→ 構想と段落 → 文の切りつなぎ → 文の筋 → 修飾 → 語の選択 → 敬語、と大きい単位から小さい単位へ下りる

### 14.3 運用しながら直す仕組み

- 版を重ねて改稿している（第 3 版は旧版を全面的に改稿した、という二次情報）。注釈体系ではないので、カテゴリを足す手順は無い

### 14.4 6 単位との対応

- 語: 言葉を選ぶ（「ひとり合点」は、読者に通じない語を書き手だけが分かっている状態で、私たちの「指すものが判断できない」に近い）
- 文: 文の切りつなぎ、文の途中での切り方、文の筋を通す、修飾の仕方
- ブロック: 構想と段落（段落なし・改行しすぎ）
- 節の中・節どうし: 構想の立たない文章、構想のよくない文章
- 文書全体: 敬語の使い方の「文体の不統一」
- 文書間: 扱わない

### 14.5 確かめ方

- Web ページの要約経由: 目次（出版社のページ）、版と刊行年
- 二次情報: 初版年、改稿の経緯、「五十か条」の存在（書評ブログと検索結果）
- 未確認: 本文。各節の中の分類と、「五十か条」の項目

---

## 私たちの分類の階層を作るうえで参考になる点

### 1. 事例に上位だけを付け、細分類を参照用に置く運用には先例がある

- MQM は、階層のどのノードも issue type として使えるとし、親を子で覆えない誤りの受け皿にする例を示す [Lommel 2014] p.458, p.460
- CLC は、細かく決められないときに誤りの型（M / R / U）だけを単独で付けると規定する [Nicholls 2003] p.574
- Aghajani らは、調査のときに同じ親を持つ問題を親カテゴリだけにまとめて使った [Aghajani 2020] 3.2 節
- 推敲の分類では、後続の研究が下位カテゴリを 1 つに畳んだ [Lan 2026] 付録 D.3
- 細かさの判断の根拠として、評価者は細かいカテゴリほど区別しにくい、という MQM の指針が使える [Lommel 2014] p.459

### 2. 同じ細分類を複数の親の下に重ねず、独立した軸に分ける

- ERRANT は「操作（M / R / U）」と「種別」、CLC は「誤りの型」と「品詞」を別の軸にして掛け合わせる [Bryant 2017] p.795–796、[Nicholls 2003] p.573
- NAIST 誤用コーパスは、品詞の下に同じ型（活用の誤りなど）を重ねると注釈が煩雑になるので、多ラベルで付ける設計にした [大山 2016] p.200–201
- Requirements Smells は、smell の分類とは別に、影響を受ける単位（Word、Pronoun、Text reference）を属性として付ける [Femmer 2017] 3.2 節
- 私たちに当てはめると、最上位の「範囲の単位」と、その下の「読者に何が起きるか」（例: 名詞が何を指すか判断できない）を別の軸にすれば、
  「指示語」のように複数の単位にまたがる細分類を単位ごとに重複して持たずに済む。この当てはめは私の推論

### 3. 各段に受け皿と、分類できないことを表す型を置く

- ERRANT の OTHER と UNK [Bryant 2017] Table 2、NUCLE の Others と Um（Unclear meaning）[Dahlmeier 2013] Table 1、
  CLC の CE [Nicholls 2003] p.574、IteraTeR の OTHER [Du 2022] Table 4、Aghajani らの各 2 段目の「Other ... issues」[Aghajani 2020] Figure 2
- 受け皿に溜まった事例は、新しい細分類を立てる材料になる。受け皿の比率を見ていつ分類を足すかを決める規定は、調べた範囲には無かった（私の推論）

### 4. 分類を足す・統合するときの手順と記録を先に決めておく

- MQM は、独自の型に ID の接頭辞（`x-`）・親・定義を必須にしている [MQM spec 0.1.5 2014]（Web ページの要約経由）
- 推敲の分類の系譜は、統合・分割・改名で育ち、その型は reuse / merge / refinement / hierarchy adaptation の 4 つに整理されている [Lan 2026] 5.2 節
- NUCLE は、既存のタグセットを試行注釈での注釈者の意見で直してから採用した [Dahlmeier 2013] p.23。
  NAIST 誤用コーパスは、注釈者が混同する型（語彙選択）が見つかったことを理由に階層を組み直した [大山 2016] p.205–206
- ERRANT は、狭い区別のためにカテゴリを増やすことを避け、情報量と実用性の妥協点を選んだと明記している [Bryant 2017] p.796
- 私たちに当てはめると、細分類を足すときに「親」「定義」「代表事例」「足した理由」を記録する形にしておけば、
  後から統合・分割したときに経緯を辿れる。例を葉にだけ付けると解釈が難しくなる、という指摘 [Lan 2026] 5.1 節 から、上位にも代表事例を置くのがよい。この当てはめは私の推論

### 5. 1 つの指摘に複数の分類が当たることを前提にし、「兆候」と「欠陥」を分けて扱う

- Berry らは、曖昧さの 4 類は排他でなく、1 つの曖昧な文に複数の類が重なりうると明記する [Berry 2003] p.10
- IteraTeR は 1 編集 1 意図を前提にしている [Du 2022] p.3575。排他にするか多ラベルにするかは、分類の設計で先に決める必要がある
- Femmer らは、smell は品質違反の兆候であり、欠陥かどうかは文脈で判断すると区別する [Femmer 2017] 3.1 節。
  レビュー指摘の事例を集めるときも、「指摘された箇所の特徴」と「読者に実際に起きた問題」を分けて記録すると、分類が表面の形に引きずられにくい。この当てはめは私の推論
- Berry らの「言語の曖昧さ」と「領域知識が無いと気づけない曖昧さ」、「表現の不十分さ」と「情報の欠落」という 2 つの区別 [Berry 2003] p.7–9 と、
  Aghajani らの What（内容）と How（書き方）の区別 [Aghajani 2020] 3.2 節 は、同じ単位の中で「書き方の誤り」と「内容の欠落・誤り」を分ける 2 段目の候補になる

---

## 参考文献

閲覧日はすべて 2026-09-25。

- [Aghajani 2019] Emad Aghajani, Csaba Nagy, Olga Lucero Vega-Márquez, Mario Linares-Vásquez, Laura Moreno, Gabriele Bavota, Michele Lanza.
  Software Documentation Issues Unveiled. Proceedings of the 41st International Conference on Software Engineering (ICSE 2019), pp. 1199–1210, 2019.
  DOI: 10.1109/ICSE.2019.00122。本文は未読（頁は二次情報）。書誌の確認に使った URL: <https://dl.acm.org/doi/abs/10.1109/ICSE.2019.00122>
- [Aghajani 2020] Emad Aghajani, Csaba Nagy, Mario Linares-Vásquez, Laura Moreno, Gabriele Bavota, Michele Lanza, David C. Shepherd.
  Software Documentation: The Practitioners' Perspective. Proceedings of the ACM/IEEE 42nd International Conference on Software Engineering (ICSE 2020), 2020.
  DOI: 10.1145/3377811.3380405。引いた箇所: 3.2 節、Figure 2（PDF に頁番号が印字されていないため節と図で示す）。
  読んだ PDF: <https://homepages.dcc.ufmg.br/~figueiredo/disciplinas/papers/icse20aghajani.pdf>
  （著者名の全員と頁範囲は PDF の冒頭で確認していない。筆頭著者と DOI は PDF で確認）
- [Berry 2003] Daniel M. Berry, Erik Kamsties, Michael M. Krieger. From Contract Drafting to Software Specification: Linguistic Sources of Ambiguity — A Handbook.
  Version 1.0, November 2003. 引いた箇所: 3.2 節（p.7–9）、3.3 節（p.10–14）、5 章。
  URL: <https://cs.uwaterloo.ca/~dberry/handbook/ambiguityHandbook.pdf>
- [Bryant 2017] Christopher Bryant, Mariano Felice, Ted Briscoe. Automatic Annotation and Evaluation of Error Types for Grammatical Error Correction.
  Proceedings of the 55th Annual Meeting of the Association for Computational Linguistics (ACL 2017), Volume 1: Long Papers, pp. 793–805, Vancouver, 2017.
  ACL Anthology ID: P17-1074。DOI: 10.18653/v1/P17-1074（DOI は ACL Anthology の命名規則からの推定で、未確認）。
  引いた箇所: 3.2–3.4 節、Table 2（p.795–796）。URL: <https://aclanthology.org/P17-1074.pdf>
- [Dahlmeier 2013] Daniel Dahlmeier, Hwee Tou Ng, Siew Mei Wu. Building a Large Annotated Corpus of Learner English: The NUS Corpus of Learner English.
  Proceedings of the Eighth Workshop on Innovative Use of NLP for Building Educational Applications (BEA), pp. 22–31, Atlanta, 2013.
  ACL Anthology ID: W13-1703。引いた箇所: 2 節（p.23）、Table 1（p.24–25）、6 節（Related Work）。URL: <https://aclanthology.org/W13-1703.pdf>
- [Du 2022] Wanyu Du, Vipul Raheja, Dhruv Kumar, Zae Myung Kim, Melissa Lopez, Dongyeop Kang. Understanding Iterative Revision from Human-Written Text.
  Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (ACL 2022), Volume 1: Long Papers, pp. 3573–3590, 2022.
  arXiv: 2203.03802。DOI: 10.18653/v1/2022.acl-long.250（DOI は ACL Anthology の命名規則からの推定で、未確認）。
  引いた箇所: 3 節（p.3575）、4.2.1 節と Table 4（p.3576）。URL: <https://aclanthology.org/2022.acl-long.250.pdf>
- [Faigley 1981] Lester Faigley, Stephen Witte. Analyzing Revision. College Composition and Communication, 32(4), pp. 400–414, 1981.
  本文は未読。書誌は検索結果による。URL: <https://publicationsncte.org/content/journals/10.58680/ccc198115887>
- [Femmer 2017] Henning Femmer, Daniel Méndez Fernández, Stefan Wagner, Sebastian Eder. Rapid quality assurance with Requirements Smells.
  Journal of Systems and Software, 123, pp. 190–213, 2017. DOI: 10.1016/j.jss.2016.02.047。arXiv: 1611.08847。
  引いた箇所: 3.1 節（arXiv 版 p.8）、3.2 節（arXiv 版 p.9–10）。巻と頁は検索結果による。URL: <https://arxiv.org/pdf/1611.08847>
- [ISO 5060 2024] ISO. ISO 5060:2024 Translation services — Evaluation of translation output — General guidance. 2024.
  引いた箇所: 3.4.2–3.4.5（用語定義）、目次。読んだプレビュー: <https://cdn.standards.iteh.ai/samples/80701/f170773c3b1a4730a51c5d322122db52/ISO-5060-2024.pdf>
  規格のページ: <https://www.iso.org/standard/80701.html>
- [ISO 29148 2018] ISO/IEC/IEEE. ISO/IEC/IEEE 29148:2018 Systems and software engineering — Life cycle processes — Requirements engineering. 2018.
  本文は未読。URL: <https://standards.ieee.org/standard/29148-2018.html>
- [Lan 2026] Fangping Lan, Qi Zhang, Eduard Dragut. Making Revisions Understandable: A Survey of Edit Intentions, Methods, and Applications.
  Findings of the Association for Computational Linguistics: ACL 2026, 2026. arXiv: 2609.01610。
  引いた箇所: 5.1 節、5.2 節、付録 D.3。URL: <https://arxiv.org/pdf/2609.01610>
- [Lommel 2014] Arle Lommel, Hans Uszkoreit, Aljoscha Burchardt. Multidimensional Quality Metrics (MQM): A Framework for Declaring and Describing Translation Quality Metrics.
  Tradumàtica: tecnologies de la traducció, 12, pp. 455–463, 2014. DOI: 10.5565/rev/tradumatica.77（DOI は検索結果による）。
  引いた箇所: p.457–460。URL: <https://ddd.uab.cat/pub/tradumatica/tradumatica_a2014n12/tradumatica_a2014n12p455.pdf>
- [MQM Council Core] MQM Council. The MQM CORE Typology. Web ページ。URL: <https://themqm.org/the-mqm-typology/>
- [MQM Council design] MQM Council. MQM-Core and Scorecard Design. Web ページ。URL: <https://themqm.org/error-types-2/design/>
- [MQM Council typology] MQM Council. The MQM Error Typology（MQM 2.0）. Web ページ。URL: <https://themqm.org/error-types-2/typology/>
- [MQM spec 0.1.5 2014] Arle Lommel ほか（QTLaunchPad）. Multidimensional Quality Metrics (MQM) Specification, version 0.1.5, 2014-02-14.
  著者表記は未確認。URL: <https://tranquality.info/mqm/mqm-spec-2014-02-14.html>
- [Nicholls 2003] Diane Nicholls. The Cambridge Learner Corpus — error coding and analysis for lexicography and ELT.
  Proceedings of the Corpus Linguistics 2003 Conference (UCREL Technical Papers 16), pp. 572–581, Lancaster University, 2003.
  論文集の名前と UCREL Technical Papers の番号は URL からの推定で、未確認。引いた箇所: p.572–574。
  URL: <https://ucrel.lancs.ac.uk/publications/CL2003/papers/nicholls.pdf>
- [SAE J2450] SAE International. J2450 Translation Quality Metric. 初版 2001 年、現行 J2450_201608。本文は未読。
  URL: <https://www.sae.org/standardsdev/j2450p1.htm>
- [Slator 2024] Slator. New ISO Standard 5060 Focuses on Human Evaluation to Ensure Translation Quality. 2024（業界ニュースの記事。二次情報）。
  URL: <https://slator.com/new-iso-standard-5060-focuses-on-human-evaluation-to-ensure-translation-quality/>
- [Wikipedia SAE J2450] Wikipedia. SAE J2450（二次情報）。URL: <https://en.wikipedia.org/wiki/SAE_J2450>
- [岩淵 1979] 岩淵悦太郎 編著. 悪文 第 3 版. 日本評論社, 1979. ISBN: 9784535574755（ISBN は検索結果による）。本文は未読
- [日本評論社 悪文] 日本評論社. 悪文［第 3 版］の書籍ページ（目次）. URL: <https://www.nippyo.co.jp/shop/book/885.html>
- [大山 2016] 大山浩美, 小町守, 松本裕治. 日本語学習者の作文における誤用タイプの階層的アノテーションに基づく機械学習による自動分類.
  自然言語処理, 23(2), pp. 195–225, 2016. DOI: 10.5715/jnlp.23.195（DOI は J-STAGE の URL からの推定で、未確認。終頁も未確認）。
  引いた箇所: 3.2.2 節（p.200–202）、3.2.3 節と表 2（p.202–203）、3.2.5 節（p.204–206）。
  URL: <https://www.jstage.jst.go.jp/article/jnlp/23/2/23_195/_article/-char/ja/>
