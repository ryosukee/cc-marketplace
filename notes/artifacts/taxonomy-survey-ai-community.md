# AI が書く文章の悪さを、コミュニティが実務でどう集めて分けているか

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

調査日・閲覧日: 2026-09-25。調査者: Claude（subagent）。

## 目的と範囲

AI（Claude）が書いた日本語の技術文書へのレビュー指摘を階層的に分類するにあたり、
最上位（語・文・ブロック・節の中・節どうし・文書間の 6 単位）の下に置く分類の参考として、
コミュニティの実務資料（lint の規則集、癖の一覧、スタイルガイド、skill、ブログ）が
AI の文章の悪さをどう集め、どう分けているかを調べた。

- 学術論文は扱わない。資料が論文を根拠として引いている場合は「論文を引いている」とだけ書き、論文そのものは読んでいない
- 調べた資料は 19 件。日本語の資料を優先した（日本語 12 件、英語 6 件、分野外の参照 1 件）
- 資料の評価（各資料の 4 番目の項目）と、6 単位への対応づけ（表 1）は、この調査者の判断である。資料の主張ではない
- 資料は本文で [資料名] の形で引く。版・ライセンス・URL は末尾の「参考文献」にある

### 確かめ方の区別

各項目の末尾に、次のどれで確かめたかを付ける。

- 【原文】: 資料の原文（Markdown・wikitext・記事本文）を取得し、調査者が自分で読んだ
- 【要約経由】: 一次情報のページを WebFetch で取得したが、ページの中身は取得ツール内の別モデルが抜き出した要約として受け取った。原文そのものは見ていない
- 【二次】: 検索結果の抜粋や、別の資料による紹介から得た
- 【未確認】: 確かめられなかった

## 結論

1. 分け方の最上位の軸は、資料によって 3 系統に分かれる。
   言語の層で分ける系統（語彙・文の構造・書式・構成）、直しにくさの層で分ける系統（記号の残骸 → 語彙・文体 → 思考の型 → 立場）、
   生成の仕組みで分ける系統（演出・規則的な適用・水増し・会話の残留）である。
   範囲の単位を最上位に置く資料は無かった
2. どの系統でも、最上位とは別に「確度」または「重さ」の軸を持つ資料が多い。
   1 回の出現で直すものと、他の兆候と重なったときだけ直すものを分けている
3. 集め方は 3 通りある。実例に出典を付けて集める（[Wikipedia:Signs of AI writing]）、
   コーパスの前後比較で数える（[逆瀬川 Qiita 7万記事の分析]、[slop-score]）、書き手の経験で挙げる（残りの大半）。
   日本語の資料の多くは [Wikipedia:Signs of AI writing] と [blader/humanizer] を下敷きにしており、項目が互いに引き写されている。
   資料の数ほど独立した根拠は無い
4. 6 単位への対応は、語・文・ブロックが厚く、節どうしは一部の資料だけ、文書間はほぼ扱われていない
5. 多くの資料の目的は「AI が書いたことを見抜く」（兆候の検出）で、「文章の欠陥を直す」ではない。
   [Wikipedia:Signs of AI writing] は、兆候そのものを問題として直すことをはっきり戒めている。
   レビュー指摘の分類に使うなら、兆候としての分類と欠陥としての分類を分けて読む必要がある（調査者の判断）

## 資料どうしの比較

### 最上位の軸と確度の軸

- 言語の層で分ける
    - [Wikipedia:Signs of AI writing]: Content / Language and grammar / Style / Markup ほか（ページの第 2 階層の見出し）
    - [tropes.md]: Word Choice / Sentence Structure / Paragraph Structure / Tone / Formatting / Composition（tropes.md の第 2 階層の見出し）
    - [avoid-ai-writing]: Content / Language / Structure / Communication / Meta Patterns（README の節 Pattern reference）
    - [gonta223/humanizer-ja]: 語彙・表現 / 構造・フォーマット / 文体・トーン / 日本語固有パターン / セルフ監査（SKILL.md のカテゴリ1〜5）
    - [textlint-rule-preset-ai-writing] と [textlint-rule-preset-ai-words-ja] は、規則の ID がそのまま分類になっている
- 直しにくさの層で分ける
    - [makotofalcon/humanizer-ja]: 第1層 記号・書式の残骸 / 第2層 語彙・文体の偏り / 第3層 思考構造の型（SKILL.md の節 基本原則の表）
    - [Rapls スキル]: 第0層 立場と主体 を最上位に足した 4 層（記事の節 4層構造）
    - [Ichiro note]: 表面的なAI臭さ / 本質的なAI臭さ（本文冒頭）
- 生成の仕組みで分ける
    - [blader/humanizer]: Staging instead of stating / Rhythm by rule / Inflation and borrowed authority / Formatting by rule / Leftovers from the chat and the draft（SKILL.md の節 A〜E）
- 確度・重さの軸を別に持つ
    - [blader/humanizer]: 強い順に番号を振り、`weak alone`（単独では弱い）の印を付ける（SKILL.md の節 Why AI text sounds the way it does）
    - [avoid-ai-writing]: P0 Credibility killers / P1 Obvious AI smell / P2 Stylistic polish（SKILL.md の節 Severity tiers）
    - [Rapls スキル]: S / A / B の確度ランク（記事の節 確度ランク）
    - [tropes.fyi]: 1 回の使用は問題でなく、重なりと反復が問題だと注記する【要約経由】

### 集め方

- 実例に出典（版の番号）を付けて集める: [Wikipedia:Signs of AI writing] だけ
- コーパスの前後比較で数える: [逆瀬川 Qiita 7万記事の分析]、[slop-score]。
  [textlint-rule-preset-ai-words-ja] は前者の結果を辞書に取り込んでいる
- 書き手の経験や観察で挙げ、根拠を示さない: 残りの大半
- 他の資料から引き写す: 英語の humanizer 系は [Wikipedia:Signs of AI writing] を、日本語の humanizer 系は [Wikipedia:Signs of AI writing] と [blader/humanizer] を下敷きにしている。
  [Rapls スキル] は [stop-slop]、[blader/humanizer]、[minorun365 スキル] を出典に挙げる

### 6 単位への対応

| 資料 | 語 | 文 | ブロック | 節の中 | 節どうし | 文書間 |
| --- | --- | --- | --- | --- | --- | --- |
| Wikipedia:Signs of AI writing | ○ | ○ | ○ | ○ | ○ | △ |
| blader/humanizer | ○ | ○ | ○ | ○ | △ | △ |
| stop-slop | ○ | ○ | △ | △ | − | − |
| avoid-ai-writing | ○ | ○ | ○ | ○ | △ | − |
| tropes.md / tropes.fyi | ○ | ○ | ○ | ○ | ○ | − |
| slop-score | ○ | ○ | △ | − | − | − |
| MQM | ○ | ○ | △ | − | − | △ |
| textlint-rule-preset-ai-writing | ○ | △ | ○ | △ | △ | − |
| textlint-rule-preset-ai-words-ja | ○ | △ | − | − | − | − |
| 逆瀬川 Qiita 7万記事の分析 | ○ | ○ | ○ | − | − | − |
| k16shikano 日本語技術文書の文章規範 | ○ | ○ | ○ | ○ | ○ | − |
| k16shikano 認知リズム | − | ○ | ○ | ○ | ○ | − |
| minorun365 見分け方 | △ | ○ | ○ | △ | − | − |
| minorun365 スキル | ○ | ○ | ○ | ○ | ○ | − |
| Rapls スキル | ○ | ○ | ○ | ○ | ○ | − |
| gonta223/humanizer-ja | ○ | ○ | ○ | ○ | △ | − |
| makotofalcon/humanizer-ja | ○ | ○ | ○ | ○ | △ | − |
| fibujrsl Zenn | ○ | ○ | ○ | ○ | △ | − |
| Ichiro note | − | − | △ | − | ○ | − |

※ 表 1 資料ごとの 6 単位への対応。○ は複数の項目で扱う、△ は一部の項目だけ、− は扱わない。調査者の判断

6 単位のどれにも収まらない項目がある。[Rapls スキル] の第0層（立場と主体）、[Ichiro note] の「本質的なAI臭さ」、
[makotofalcon/humanizer-ja] の第3層にある「ポジションを取らない中立性」は、範囲ではなく書き手の立場を問うている。
文書全体に広がるが、「文書間」ではない。範囲の軸とは別の軸として扱うことになる（調査者の判断）。

## 資料ごとの記録

### 1. Wikipedia:Signs of AI writing

1. 所在と作り手
    - [Wikipedia:Signs of AI writing]。WikiProject AI Cleanup の advice ページで、方針（policy）としては承認されていない。
      2026 年 8 月付で「最新のモデルに合わせて更新が要る」旨のテンプレートが貼られている【原文】
2. 分類の組み方とカテゴリ名
    - 最上位（第 2 階層の見出し）: Caveats / Content / Language and grammar / Style / Communication intended for the user / Markup / Citations / Comment-specific indicators / Edit summaries / Miscellaneous / Signs of human writing / Ineffective indicators / Historical indicators【原文】
    - 節 Content（ショートカット WP:AI-ISM）の下位: Undue emphasis on significance, legacy, and broader trends（意義・遺産・大きな潮流の過度な強調）、Canned emphasis on notability, attribution, and media coverage、Superficial analyses（表面的な分析）、Promotional and advertisement-like language、Vague attributions and overgeneralization of opinions、Outline-like conclusions about challenges and future prospects（課題と展望の定型の結び）ほか【原文】
    - 節 Language and grammar の下位: High density of "AI vocabulary" words（WP:AIVOCAB）、Avoidance of basic copulatives ("is"/"are" phrases)、Vague expression of connection or association、Negative parallelisms（Not just X, but also Y / Not X, but Y / Y rather than X）、Rule of three【原文】
    - 節 Style の下位: Title case、Headings only containing other headings、Overuse of boldface、Inline-header vertical lists、Overuse of em dashes、Emoji as formatting、Unusual use of tables、Skipping heading levels ほか【原文】
    - 節 Communication intended for the user の下位: Collaborative communication、Knowledge-cutoff disclaimers and speculation about gaps in sources、Phrasal templates and placeholder text【原文】
    - 節 Historical indicators（古いモデルに多かった兆候）の下位: Didactic disclaimers、Section summaries（WP:CONCLUSION）、Prompt refusal、Abrupt cut offs、Lexical diversity/elegant variation（WP:AIELEVAR）ほか【原文】
3. 集め方
    - Wikipedia の記事・下書き・コメントからの実例で、多くの例に版の差分へのリンクが付く（ページ冒頭の導入文）【原文】
    - 節 High density of "AI vocabulary" words の語の一覧には、論文や報道で過剰使用が裏付けられた語だけを足すという編集注記がある。語ごとに論文・報道を引く【原文】
    - 節 Content の冒頭で、兆候の生じる仕組みを「平均への回帰」（統計的にありがちな一般的記述へ寄り、具体的で珍しい事実が落ちる）と説明している【原文】
4. 評価
    - 実例と版の差分を伴う点で、調べた資料の中で根拠が最も厚い
    - 目的は未申告の AI 生成を見抜くことで、ページ冒頭が「兆候は問題の徴候であって問題そのものではない」「兆候だけを直すと検出が難しくなる」と書いている。欠陥の分類として使うと、兆候と欠陥が混ざる
    - Ineffective indicators（完璧な文法、接続語単独、形式ばった文体）と Historical indicators を別節に分けている点は、分類を育てる運用の参考になる。兆候がモデルの世代で入れ替わる前提で作られている
    - 百科事典の記事という文種に寄っており、宣伝調や「受賞歴」節のような項目は技術文書には当たりにくい
5. 対応する単位
    - 語・文・ブロック・節の中・節どうしを扱う。文書間は節 Citations の一部（DOIs that lead to unrelated articles）と節 Markup の一部（Non-existent templates）だけ
6. 確かめ方
    - 見出し構成と上の各項目は wikitext の原文から確認した【原文】

### 2. blader/humanizer

1. 所在と作り手
    - [blader/humanizer]。GitHub アカウント blader が保守する agent skill。調査時点で star 約 5.2 万【原文】
2. 分類の組み方とカテゴリ名
    - 生成の仕組みで 5 群に分け、25 項目を強い順に並べる（SKILL.md の節 A〜E、項目番号 1〜25）【原文】
    - A. Staging instead of stating（述べる代わりに演出する）: 1 Not X but Y / 2 One-line closers and dramatic fragments / 3 Sayings that sound deep / 4 Staged run-up before the point / 5 Arguing with no one
    - B. Rhythm by rule（規則で作るリズム）: 6 Forced triads / 7 Repeated sentence openings / 8 Dashes as the universal connector / 9 Stacked qualifiers / 10 Hyphenated pairs everywhere / 11 Passive voice and missing subjects
    - C. Inflation and borrowed authority（水増しと借り物の権威）: 12 Overused AI words / 13 Inflated significance / 14 Vague connection or association / 15 Shallow -ing riders / 16 Sales language / 17 Borrowed authority / 18 Avoiding is, are, and has
    - D. Formatting by rule: 19 Bold as decoration / 20 Decorative headings / 21 Curly quotation marks
    - E. Leftovers from the chat and the draft（会話と下書きの残留物）: 22 Chatbot residue / 23 Knowledge-limit disclaimers and guesses / 24 A heading repeated in the first sentence / 25 Writing about the previous version
3. 集め方
    - [Wikipedia:Signs of AI writing] と、Wikipedia ほかでの AI 生成文のレビューから、と SKILL.md の節 Source に書く。個々の項目の出典は示さない【原文】
4. 評価
    - 5 群の分け方は、項目の見た目ではなく「なぜ AI がそう書くか」（読者と題材を広く覆う既定の選択）で束ねており、レビュー指摘の原因分類に最も近い
    - 「語の癖はモデルの版ごとに変わるが、構造の癖は残る」として構造を先に置く判断は、[Wikipedia:Signs of AI writing] の Historical indicators の観察と整合する
    - `weak alone` の印と「複数の兆候の重なりで判断する」規則（SKILL.md の節 When not to act）は、1 件ずつの指摘では判定できない分布型の欠陥を扱う手当てになっている
    - 項目 12 の語彙の一覧は [Wikipedia:Signs of AI writing] からの写しで、独自の根拠は無い
5. 対応する単位
    - 語・文・ブロック・節の中（項目 24 の見出し直後の繰り返し、項目 2 の段落末の決め台詞）を扱う。
      節どうしは「毎節同じ締め」（項目 2）と「課題と展望の定型節」（項目 13）だけ。文書間は項目 25 が近い
6. 確かめ方
    - SKILL.md の原文を読んだ【原文】

### 3. hardikpandya/stop-slop

1. 所在と作り手
    - [stop-slop]。Hardik Pandya の skill。調査時点で star 約 1.8 万【原文】
2. 分類の組み方とカテゴリ名
    - SKILL.md の節 Core Rules の 8 本: Cut filler phrases / Break formulaic structures / Use active voice / Be specific / Put the reader in the room / Vary rhythm / Trust readers / Cut quotables【原文】
    - references/phrases.md の見出し: Throat-Clearing Openers / Emphasis Crutches / Business Jargon / Adverbs ほか【原文】
    - references/structures.md の見出し: Binary Contrasts / Negative Listing / Dramatic Fragmentation / Rhetorical Setups / Formulaic Constructions / False Agency / Narrator-from-a-Distance / Passive Voice / Sentence Starters to Avoid / Rhythm Patterns / Word Patterns【原文】
    - SKILL.md の節 Scoring の 5 軸: Directness / Rhythm / Trust / Authenticity / Density【原文】
3. 集め方
    - SKILL.md に根拠の記述は無い。README は読めていない【未確認】
4. 評価
    - 句と構造の 2 本立ては実用的だが、「副詞をすべて削る」「受動態を使わない」のような一律の禁止を含み、技術文書に当てると正しい記述まで削る
    - False Agency（無生物が人の動作をする）は、日本語の資料が「無生物主語」「擬人化」と呼ぶものと同じ現象で、言語を越えて観察されている
5. 対応する単位
    - 語・文が中心。段落末の決め台詞と、文章自身に言及する繋ぎ（SKILL.md の節 Quick Checks の Meta-joiners）を少し扱う
6. 確かめ方
    - SKILL.md と 2 つの reference の見出しを原文で読んだ。phrases.md は冒頭の 80 行だけ【原文】

### 4. conorbronsdon/avoid-ai-writing

1. 所在と作り手
    - [avoid-ai-writing]。Conor Bronsdon の skill と検出エンジン。調査時点で star 約 4,700、閲覧日にも更新されている【原文】
2. 分類の組み方とカテゴリ名
    - README の節 Pattern reference: Content Patterns / Language Patterns / Structure Patterns / Communication Patterns / Meta Patterns の 5 群に通し番号 1〜36。
      以後は版ごとの追加群（Structural Detection (v3.4)、AI-tool fingerprints & later additions (v3.5–3.8)、Conversational-register patterns (v3.15)、Narrated candor (v3.21) ほか）で 56 まで【原文】
    - SKILL.md の節 Severity tiers: P0 Credibility killers / P1 Obvious AI smell / P2 Stylistic polish【原文】
    - 検出エンジンは 53 の type に分け、人向けの目録と数を意図的に変えていると README の節 Pattern reference に書く。対応表は detector/CATEGORIES.md（未読）【原文】
    - 書き手向けの判定 2 つ（README の節 Pattern reference の末尾）: paragraph-reshuffle immunity（本文の段落を入れ替えても壊れないか）、treadmill effect（この段落で新しいことは何か）【原文】
3. 集め方
    - README の節 Credits に Pangram Labs の検出研究、[Wikipedia:Signs of AI writing]、[blader/humanizer]、brandonwise/humanizer、OpenClaw の humanizer 群を挙げる【原文】
    - 一部の項目は実際のやり取りから足したと書く（例: GitHub の issue への返信を人間に指摘された件から、表の # 52〜53 を v3.15 で追加）【原文】
    - 閾値（表の # 41、ハッシュタグ 6 個以上）を「経験的」と書くが、データは示さない【原文】
4. 評価
    - 項目数が最も多いが、群の中身は版ごとの継ぎ足しで、群の境界は一貫していない。例: 太字の多用と em dash が表の # 15（Formatting）の同じ行に入っている
    - P0〜P2 の重さは「読者の信頼をどれだけ失うか」で決めており、欠陥の分類に移しやすい。P0 に知識の区切りの断り書き、根拠の無い権威づけ、意義の水増しを置く判断は妥当
    - 段落入れ替えの判定は、節の中の構成（段落の順序に意味があるか）を機械的に問う方法として使える
5. 対応する単位
    - 語・文・ブロック・節の中を扱う。節どうしは表の # 33 Excessive structure と段落入れ替えの判定だけ
6. 確かめ方
    - README の節 Pattern reference と Credits、SKILL.md の節 Severity tiers を原文で読んだ。references/patterns.md は読んでいない【原文】

### 5. tropes.fyi と tropes.md

1. 所在と作り手
    - [tropes.fyi] のサイトと、system prompt に貼る用の [tropes.md]（gist）。Ossama Chaib（ossama.is、GitHub では ossa-ma）が作り保守する【原文】
2. 分類の組み方とカテゴリ名
    - tropes.md の第 2 階層の見出し: Word Choice / Sentence Structure / Paragraph Structure / Tone / Formatting / Composition の 6 群【原文】
    - tropes.md の第 3 階層の見出しの例: "Quietly" and Other Magic Adverbs、Negative Parallelism、Tricolon Abuse、Short Punchy Fragments、Listicle in a Trench Coat、Invented Concept Labels（造語のラベル）、Em-Dash Addiction、Bold-First Bullets、Fractal Summaries（入れ子の要約）、One-Point Dilution（1 点を薄めて引き延ばす）、Content Duplication、The Signposted Conclusion【原文】
    - サイトは 49 の trope と 10 の behavior を載せる【要約経由】
3. 集め方
    - 作者の観察（Hacker News や Reddit で見た AI の文章）で、投稿や検証の仕組みは書かれていない【要約経由】
4. 評価
    - Composition 群（Fractal Summaries、Content Duplication、One-Point Dilution）は、他の英語資料が薄い節どうしの悪さを名前付きで挙げており、6 単位の「節どうし」の下位の参考になる
    - Invented Concept Labels は、日本語の資料の「必殺技造語」（[Rapls スキル]）と同じ現象を指す
    - 根拠は作者の経験だけで、項目の粒度もまちまち
5. 対応する単位
    - 語・文・ブロック・節の中・節どうしを扱う。文書間は扱わない
6. 確かめ方
    - tropes.md の見出しを原文で読んだ。サイトの件数と集め方は要約経由【原文】【要約経由】

### 6. EQ-Bench の slop-score

1. 所在と作り手
    - [slop-score]。Samuel J. Paech（EQ-Bench）が作る。ブラウザで使うページは [slop-score のページ](https://eqbench.com/slop-score.html)【原文】
2. 分類の組み方とカテゴリ名
    - 分類ではなく合成指標（README の節 Slop Score Calculation）: Slop Words 60% / Not-x-but-y Patterns 25% / Slop Trigrams 15%【原文】
    - ほかに N-gram repetition score、Lexical diversity (MATTR-500)、平均文長・段落長、over-represented words, bigrams, and trigrams を出す（README の節 Generating the Leaderboard）【原文】
3. 集め方
    - 人間の基準文と比べて AI の出力で過剰な語と 3-gram の一覧を事前に作り、モデルに創作 150 本・エッセイ 150 本を書かせて照合する。
      「not X but Y」は正規表現 10 本と品詞付きの正規表現 35 本で検出する（README の節 Implementation Details）【原文】
4. 評価
    - 「過剰に出る」ことを人間の基準との比較で定義しており、語と句の兆候を数える手本になる。一覧そのものの作り方（基準文の中身）は README に無い
    - 対象は英語の創作とエッセイで、技術文書には直接は当たらない
    - 否定の対句（not X but Y）を語彙と並ぶ独立の柱にしている点は、[Wikipedia:Signs of AI writing]・[blader/humanizer] と一致する
5. 対応する単位
    - 語・文（対句）。段落長は測るが評価には入れない
6. 確かめ方
    - README を原文で読んだ【原文】

### 7. MQM（Multidimensional Quality Metrics）

1. 所在と作り手
    - [MQM Error Typology]。MQM Council が保守する翻訳品質の誤りの類型。現行は MQM 2.0【要約経由】
2. 分類の組み方とカテゴリ名
    - 最上位 7 次元: Terminology / Accuracy / Linguistic Conventions / Style / Locale Conventions / Audience Appropriateness / Design and Markup。
      各次元の下に下位の型がさらに入れ子になる（例: Accuracy > Mistranslation の下に MT hallucination）【要約経由】
3. 集め方
    - 開発の経緯はページに少ししか書かれていない【要約経由】
4. 評価
    - AI に特有の分類ではない。機械の出力（機械翻訳）に対する誤りを階層で分け、運用で育ててきた実務の類型として、階層の組み方の参考に挙げた
    - Accuracy（原文との対応）を独立の次元にしている点は、AI の文章の悪さの資料がほぼ扱わない「文書間」（参照先・元資料との食い違い）の下位を考える手がかりになる
5. 対応する単位
    - 語・文が中心。Accuracy と Terminology は元の文書や用語集との対応を問うので文書間に当たる
6. 確かめ方
    - 取得ツールの要約だけで確かめた。原文の階層の全件は見ていない【要約経由】

### 8. textlint-rule-preset-ai-writing

1. 所在と作り手
    - [textlint-rule-preset-ai-writing]。作者は azu、textlint-ja の organization に置かれている【原文】
2. 分類の組み方とカテゴリ名
    - README の節 含まれるルール の規則 5 本がそのまま分類になる【原文】
    - 規則 no-ai-list-formatting: 太字の見出し付き・絵文字付きの箇条書き
    - 規則 no-ai-hype-expressions: 誇張・ハイプ表現。option 名（disableAbsolutenessPatterns / disableAbstractPatterns / disabledPredictivePatterns）から、下位に「絶対性・完全性を演出する表現」「抽象的・感覚的効果を演出する表現」「権威的・予言的な表現」の 3 群がある
    - 規則 no-ai-emphasis-patterns: 強調。下位に「絵文字と太字の組み合わせ」「情報系プレフィックス」「見出し内の太字」
    - 規則 no-ai-colon-continuation: 述語で終わる文の後にコロンを置き、コード・箇条書きなどのブロックを続ける英語的な型。形態素解析で述語を判定する
    - 規則 ai-tech-writing-guideline: 簡潔性 / 明確性 / 具体性 / 一貫性 / 構造化 の 5 観点で提案する
    - README の節 原則: 「表現を縛るのではなく、構造を縛ることで、より自然な表現にすることを目的としています。」【原文】
3. 集め方
    - README に根拠の記述は無い【原文】
4. 評価
    - 機械で確実に拾える型（書式の型、コロンの後のブロック）に絞っており、誤検出の少ない規則集として実用的
    - ai-tech-writing-guideline の 5 観点は一般的なテクニカルライティングの観点で、AI に特有ではない
    - 誇張表現の 3 群（絶対性・抽象的効果・予言）は、語の単位の下位として小さくまとまっている
5. 対応する単位
    - 語（誇張）、ブロック（箇条書き・強調・コロンの後のブロック）が中心。ai-tech-writing-guideline の一貫性の観点が文書全体の用語の揺れを見る
6. 確かめ方
    - README を原文で読んだ。規則の実装は読んでいない【原文】

### 9. textlint-rule-preset-ai-words-ja

1. 所在と作り手
    - [textlint-rule-preset-ai-words-ja]。p1ass が作る。2026-09-12 に作られた新しい repo【原文】
    - 作った経緯は [p1ass ブログ] にある【要約経由】
2. 分類の組み方とカテゴリ名
    - README の節 ルール の規則は 2 本。no-ai-words（辞書の語と言い回し）と、no-short-topic-comma（「ポイントは、次の 3 つです。」のような、主題を短く示しただけで打つ読点。既定で無効）【原文】
    - README の節 検出する単語 の辞書は 53 語で、群に分けていない。例: 効く、走る、焼く (焼き込む)、経路、正本、正典、実測、照合、突き合わせる、入口、土台、構図、線引き、落とし穴、素通り、切り分ける、踏み込む、既定では、定石、静かに、ゲート【原文】
    - README の節 概要 は対象を「英語をそのまま直訳したような動詞や日常では使わない硬い名詞、一般的ではない比喩表現で使われる単語」と書く【原文】
3. 集め方
    - README の節 参考 は、[逆瀬川 Qiita 7万記事の分析] で増加が報告された語を辞書に取り込んだと書く【原文】
    - [p1ass ブログ] によると、最初は作者が AI の出力を読んで不自然に感じた約 9 語から始め、後で前述の分析の結果を足した。作者の分野（ソフトウェアの技術文書）に偏るとも書く【要約経由】
4. 評価
    - 語を形態素（基本形）で照合するので、活用形も拾える。語の単位の兆候を機械で数える日本語の手段として、調べた中で唯一
    - 辞書の語の多くは、単独では正しい日本語である（照合、切り分ける、入口）。悪さは語の誤りではなく、比喩としての転用と頻度にある。1 件ずつの指摘ではなく、分布として扱う必要がある
5. 対応する単位
    - 語。読点の規則だけが文
6. 確かめ方
    - README を原文で読んだ。ブログは要約経由【原文】【要約経由】

### 10. 逆瀬川の Qiita 7 万記事の分析

1. 所在と作り手
    - [逆瀬川 Qiita 7万記事の分析]。逆瀬川の個人ブログ、2026-09-11【原文】。著者の X アカウントが @gyakuse であることは要約経由【要約経由】
2. 分類の組み方とカテゴリ名
    - 指標の群（節 記事の組み立て方が大きく変わった、節 語彙は何が増えて何が減ったか）: 地の文の長さ、太字、箇条書き、文の長さ、読点、語彙【原文】
    - 節 AI以前はまれで2026年に広がった語彙 の 5 群: 「確かめることや疑うことを表す語」（実測、疑う、照合、見落とす、突き合わせる、断定、取り違える）、「位置や役割を場所や物にたとえる語」（入口、土台、道具、核心、主役、構図、線引き）、「障害や失敗を表す語」（事故、混ざる、落とし穴、破綻、実害、素通り）、「作業を比喩的に表す動詞」（切り分ける、潰す、踏み込む、塞ぐ、溶かす、逃がす、倒す）、「判断や評価を述べる語」（既定、別物、定番、要点、素朴、定石、桁違い）【原文】
    - 同じ節で著者は「分け方は私の判断ですが」と断っている【原文】
3. 集め方
    - Qiita API で各年 8 月の記事を集め、2019〜2022 年の傾向を直線で延ばした予測値と 2026 年を比べる。著者を単位にしたブートストラップで信頼区間を出す（Appendix B）【原文】
    - 語の条件（節 探し方）: AI 以前に含む記事が 0.5% 以下、2026 年の 2 組でどちらも 0.8% 以上かつ AI 以前の 5 倍以上、英字・固有名詞・数ではない。さらに著者 30 人以上、1 人の著者が 2 割以下の条件で絞り、385 語を得た【原文】
    - 節 まとめ: 2026 年の記事は AI 以前と比べて地の文が約 2 倍、太字が約 3 倍、箇条書きが約 1.8 倍。「しましょう」のような、よく言われる AI の目印はむしろ減っていた【原文】
4. 評価
    - 調べた日本語の資料の中で、数えて確かめた唯一の資料。語の群の分け方は著者の判断だが、各群の語は数字で裏付けられている
    - 著者自身が節 何がわかって何がわからないか で限界を挙げている。AI が書いた文と、AI に影響された人の書き方を区別できない。語が増えた理由が AI にあるかは確かめていない【原文】
    - 対象は Qiita の技術記事で、依頼の対象（設計書・規範文書・調査報告）に近い。技術文書の語の単位の下位を作るときの第一の参考になる
    - 「しましょう」の減少は、経験で作った一覧が古くなることを示す
5. 対応する単位
    - 語・文（文長・読点）・ブロック（太字・箇条書き）。節や文書間の悪さは扱わない
6. 確かめ方
    - 語の群、探し方、限界、まとめ、Appendix の一部は本文を原文で読んだ。統計の手順の細部は要約経由【原文】【要約経由】

### 11. k16shikano「日本語技術文書の文章規範」

1. 所在と作り手
    - [k16shikano 日本語技術文書の文章規範]。k16shikano が書いた skill 形式の規範（frontmatter の name は japanese-tech-writing）【原文】
2. 分類の組み方とカテゴリ名
    - 第 2 階層の見出し 10 節: 段落と論証の構成 / 論証の厳密さ / 読み手の負荷の管理 / 視点と語り / 演出の抑制 / LLM っぽい表現の禁止 / 翻訳調の比喩と擬人化の禁止 / 冗長の排除 / 見出しの付け方 / 読者への誠実さ【原文】
    - 節 LLM っぽい表現の禁止 の下位: 予告と総括 / 正面から系 / 空虚な形容 / 空虚な動詞 / 接続の型 / 弱い緩和と称賛【原文】
    - 節 翻訳調の比喩と擬人化の禁止 の下位: 英語慣用句の直訳（運ぶ、開かれている、露出する、住む）/ 無生物主語構文の直輸入 / 研究者の話し言葉の混入（効く、刺さる、筋がいい）【原文】
3. 集め方
    - 根拠の記述は無い。書籍の原稿を書く・推敲する作業から作った規範と読める（調査者の推測）【原文】
4. 評価
    - AI に特有の悪さ（空句、翻訳調）と、人間の文章にも共通する悪さ（論証の厳密さ、段落構成）を別の節に分けている。レビュー指摘の分類で「AI に特有か」を属性として持たせる参考になる
    - 翻訳調を「英語の慣用比喩が直訳されて、日本語では生きた比喩になる」という機構で説明し、判定の手順（字義どおりの動作を想像できるか → 主体と対象を具体語で言い直せるか）まで書いている。項目の定義が判定可能な形になっている点で、調べた資料の中で最も運用しやすい
    - [逆瀬川 Qiita 7万記事の分析] で増えた語（効く、入口、土台）と、節 翻訳調の比喩と擬人化の禁止 の例が重なる。経験の規範と計数が同じ現象を指している
5. 対応する単位
    - 語・文・ブロック（段落）・節の中（論証の順序、前方参照の位置）・節どうし（節 論証の厳密さ の「章・節をまたいで、同じ概念の扱いを一致させる」、節 冗長の排除 の隣接する節の役割の重複）を扱う
6. 確かめ方
    - gist の全文を原文で読んだ【原文】

### 12. k16shikano「認知リズムを生むための日本語ライティング規範」

1. 所在と作り手
    - [k16shikano 認知リズム]。11 と併用する前提の規範（frontmatter の name は cognitive-rhythm-writing）【原文】
2. 分類の組み方とカテゴリ名
    - 第 2 階層の見出し: 併用する規範 / 基本原理 / 文の拍 / 段落の密度波形 / 冒頭の設計 / 節の入り方 / 列挙の着地 / 問いの回収と結び / 緩みと駄文の見分け方 / 執筆後の点検手順 / 修正指示への使い方【原文】
    - 節 緩みと駄文の見分け方 は判定の軸を 1 本だけ置く。「その文が更新するのは「状況」か、「文書」か。」【原文】
3. 集め方
    - 根拠の記述は無い【原文】
4. 評価
    - AI の悪さの一覧ではなく、平坦な文章を直すための規範。ただし「文書を更新する文」（進行の実況、本文の性格づけ、装置の宣言）を駄文とする判定は、AI の文章の空句を 1 本の基準でまとめている
    - 「短く断定調へ整形すると決め台詞に見えて残りやすい」という駄文の混入経路の指摘は、[blader/humanizer] の項目 2（One-line closers）と同じ現象を、生成の過程から説明している
    - 節 執筆後の点検手順 の「漏出テスト」（規範の語彙・例文が本文にそのまま現れていないか）は、AI に規範を与えて書かせたときに特有の悪さで、他の資料には無い
5. 対応する単位
    - 文・ブロック・節の中（冒頭、節の入り方、結び）・節どうし（節と節の橋を次節の頭に置く、立てた問いの回収）を扱う
6. 確かめ方
    - gist の全文を原文で読んだ【原文】

### 13. minorun365「ペロッ…これはAI生成記事！ 見分け方のコツ」

1. 所在と作り手
    - [minorun365 見分け方]。minorun365（みのるん）の Qiita 記事【原文】
2. 分類の組み方とカテゴリ名
    - 見出し: 特徴① 箇条書きが多い ＆ 行頭が太字 / 特徴② 見出しでやけにコロンが使われる / 特徴③ 抽象名詞による体言止めが多い【原文】
3. 集め方
    - 本文冒頭に「実際にChatGPTにサンプル記事を生成させてみた結果を例に、紹介します。」とある【原文】
4. 評価
    - 3 点とも後の日本語の資料（[Rapls スキル]、humanizer-ja 群）に引き継がれている。日本語の資料の系譜の起点の 1 つ
    - 抽象名詞による体言止めは、依頼にある名詞構文と同じ現象を、文末の形から捉えている
5. 対応する単位
    - 文（体言止め）・ブロック（箇条書き）・見出し
6. 確かめ方
    - 本文を Qiita API の原文で読んだ【原文】

### 14. minorun365「あなたの技術ブログの「AI臭さ」を抜くスキル公開します」

1. 所在と作り手
    - [minorun365 スキル]。minorun365 の Qiita 記事【原文】
2. 分類の組み方とカテゴリ名
    - 節 1. AI臭い表現の禁止リスト を、節「文体で避ける表現」と節「構成で避けるパターン」に分ける【原文】
    - 節 文体で避ける表現 の例: 太字の多用、ダッシュ、「項目名: 説明」のセット形式、見出し・スライドタイトルの「です・ます」調、締めを全部「体言止め」で揃える、「！」の多用、過剰な接続詞の連打、「〜することができます」、「〜を活用する」の乱用、「〜についてご紹介します」、具体的な行為を抽象動詞に言い換える【原文】
    - 節 構成で避けるパターン の例: アジェンダ・目次の自動挿入、まとめセクション、均等に網羅的なリスト、「以下の通りです」→ 箇条書き、結論の先出し + 箇条書き展開【原文】
3. 集め方
    - 根拠の記述は無い。表の「なぜダメか」の列に、AI がそう書く理由を 1 行ずつ添えている【原文】
4. 評価
    - 文体と構成の 2 分割は単純だが、構成の側に節どうしの悪さ（目次の自動挿入、まとめ節）を明示的に置いている点で、日本語の資料の中では節の単位を扱う数少ない例
    - 「結論の先出し + 箇条書き展開」を避ける規則は、判断文書で重点先行を求める一般の規範と衝突する。文種を分けずに一律に当てると、正しい構成まで崩す
5. 対応する単位
    - 語・文・ブロック・節の中・節どうし
6. 確かめ方
    - 本文の見出し・表・箇条書きを Qiita API の原文で読んだ【原文】

### 15. Rapls「AIが書いた日本語から「AI臭さ」を消すスキルと、採点スクリプトを公開します」

1. 所在と作り手
    - [Rapls スキル]。Rapls の Qiita 記事【原文】
2. 分類の組み方とカテゴリ名
    - 節 4層構造: 第0層 立場と主体（主体の消失、両論併記、中間温度の欠如、毒の不在）/ 第1層 記号・書式の残骸 / 第2層 語彙・文体 / 第3層 思考構造【原文】
    - 節 確度ランク: S（ほぼ確定シグナル。人間はまず書かない）/ A（強いシグナルだが文脈依存）/ B（弱いシグナル。人間も普通に使う）【原文】
    - 項目の見出しの例: 「S級：モノが人間の動詞をやっている」「S級：一人称の消失と一般化」「A級：必殺技造語」「A級：既製品の比喩と決め台詞」「S級：命題型の見出し」「A級：構成のテンプレ」【原文】
    - 過剰修正を検査する節 やりすぎ検査 と、節 5軸採点（立場 / 主体性 / 具体性 / リズム / 削減）を持つ【原文】
    - 採点スクリプト check.py は、第0層の合計、AI マーカーの合計、文長の変動係数（0.5 以上が目安、0.4 未満はリズムが機械的）、語尾の上位 2 種の比率（80% 超なら単調）、直しすぎの兆候を出す【原文】
3. 集め方
    - 節 出典 に [Wikipedia:Signs of AI writing]、[stop-slop]、[blader/humanizer]、Daichi Nagashima（「立場と主体」の層はここから多くを借りたと書く）、[minorun365 スキル] を挙げる【原文】
4. 評価
    - 確度ランクの定義（B は頻度が閾値を超えたときだけ直す）と「直しすぎた文章という別のテンプレが生まれる」という指摘は、兆候を欠陥として一律に直す危険への手当てになっている
    - 第0層は、ブログの文種（書き手の体験と意見が価値になる）を前提にしている。「毒の不在」や「一人称の消失」は、規範文書や設計書では欠陥にならない
    - 「掟5：断定と伝聞を、情報の出所で分ける」（自分の計測は言い切り、調べた事実は伝聞を残す）は、技術文書にもそのまま当たる
5. 対応する単位
    - 語・文・ブロック・節の中（導入テンプレ、命題型の見出し）・節どうし（構成のテンプレ）。第0層は範囲の単位に収まらない
6. 確かめ方
    - 見出し・表・箇条書き・スクリプトの説明・出典を Qiita API の原文で読んだ【原文】

### 16. gonta223/humanizer-ja

1. 所在と作り手
    - [gonta223/humanizer-ja]。SKILL.md の author 欄は SuguruKun_ai。調査時点で star 148【原文】
2. 分類の組み方とカテゴリ名
    - SKILL.md の 5 カテゴリ 20 パターン: カテゴリ1: 語彙・表現（AI頻出語）/ カテゴリ2: 構造・フォーマット / カテゴリ3: 文体・トーン / カテゴリ4: 日本語固有パターン / カテゴリ5: セルフ監査【原文】
    - カテゴリ4 の中身: 14. 敬語の均一化 / 15. 主語の過剰明示 / 16. 「〜することができます」の多用 / 17. 体温のない結論【原文】
3. 集め方
    - SKILL.md 冒頭に、WikiProject AI Cleanup の知見をベースに日本語特有のパターンを足し、[blader/humanizer] に着想を得たと書く。日本語固有の項目の根拠は示さない【原文】
4. 評価
    - 「日本語固有パターン」を 1 群として切り出している点は参考になる。ただし「主語の過剰明示」は、主語の脱落を問題にする技術文書の規範と逆向きで、文種を選ぶ
    - カテゴリ5 のセルフ監査は悪さの分類ではなく手順で、分類の群に混ざっている
    - パターン 17 の「体温のない結論」を「思ってます」で直す指示は、ブログの口語を前提にしている
5. 対応する単位
    - 語・文・ブロック・節の中（パターン 18 冒頭チェック、19 結論チェック）。節どうしはパターン 8 見出しの過剰構造化だけ
6. 確かめ方
    - SKILL.md の見出しとカテゴリ4・5 の本文、README を原文で読んだ【原文】

### 17. makotofalcon/humanizer-ja

1. 所在と作り手
    - [makotofalcon/humanizer-ja]。makotofalcon の skill。調査時点で star 8【原文】
2. 分類の組み方とカテゴリ名
    - SKILL.md の 3 層 25 パターン: 第1層：記号・書式の残骸パターン / 第2層：語彙・文体の偏りパターン / 第3層：思考構造の型パターン【原文】
    - 節 基本原則 の表に難易度の列を置く（第1層「注意すれば即座に除去できる」、第3層「人間が主体的に再構成しない限り解消できない」）【原文】
    - パターンの例: 5.「これにより」——日本語AI文章の最大マーカー / 8. 漢語の過剰連続 / 9. 文末パターンの固定化 / 14. 同義語の使い回し（エレガント・バリエーション）/ 19. ポジションを取らない中立性 / 21. 金太郎飴の構成（「転」の不在）【原文】
    - 節 英語AI頻出語との対応（delve → 深掘りする、foster → 促進する・醸成する ほか）と、節 各モデル固有の癖 の表を持つ【原文】
3. 集め方
    - frontmatter の description に、[Wikipedia:Signs of AI writing] と日本語圏のブログ・note・Qiita・X での議論を横断的に統合したと書く。
      節 参考文献 に mieru-ca、Books&Apps（安達裕哉）、Qiita の minorun365 と robitan、note の Ichiro、論文 2 本を挙げる【原文】
    - 節 各モデル固有の癖 の記述（例: Claude は過剰な共感と丁寧すぎる敬語）の根拠は示さない【原文】
4. 評価
    - 直しにくさで層を分ける方式は、レビュー指摘への対応の工数を見積もる軸としては使えるが、範囲の軸とは直交する
    - 英語の頻出語を日本語に対応づける表は、訳語の選び方が作者の判断で、[逆瀬川 Qiita 7万記事の分析] の計数とは一致しない語が多い（深掘りする、促進する は同分析の増加語に無い）
5. 対応する単位
    - 語・文・ブロック・節の中。節どうしはパターン 21 金太郎飴の構成だけ
6. 確かめ方
    - SKILL.md の見出し・層の表・対応表・参考文献を原文で読んだ。各パターンの本文は読んでいない【原文】

### 18. fibujrsl「生成AIっぽい文章の特徴をまとめる」

1. 所在と作り手
    - [fibujrsl Zenn]。Zenn のユーザー fibujrsl（表示名「名前決めてね」）【原文】
2. 分類の組み方とカテゴリ名
    - 見出し 1〜10: 記号や書式の痕跡が残る / 文のリズムが均一になる / 進行がマニュアル化する / 判断が弱い / 抽象語と万能語が多くなる / 比喩が量産型になる / 余白がなく、整いすぎる / 因果の型が固定される / 強調のやり方が偏る / 括弧による補足が多い【原文】
3. 集め方
    - 本文に外部へのリンクや出典は無い。作者の観察による【原文】
4. 評価
    - 見出し 7「余白がなく、整いすぎる」（未検証の範囲や想定外のケースが書かれていない）と見出し 8「因果の型が固定される」（観測方法や比較条件が無い）は、見た目の兆候ではなく技術文書としての欠陥を指しており、依頼の対象に直接当たる
    - 見出し 3「進行がマニュアル化する」は、見出しで分かる内容を本文冒頭で繰り返すことを挙げ、節の中の単位の悪さを扱う
5. 対応する単位
    - 語・文・ブロック・節の中。節どうしは構造宣言の多さだけ
6. 確かめ方
    - 見出しと見出し 1〜8 の本文を Zenn API の原文で読んだ【原文】

### 19. Ichiro「noterに嫌われるAI臭い記事を生成しないプロンプトはあるのか？」

1. 所在と作り手
    - [Ichiro note]。Ichiro（SIer）の note【原文】
2. 分類の組み方とカテゴリ名
    - 本文冒頭の段落 AI臭さとは何だろうか？ が 2 つに分ける【原文】
    - 表面的なAI臭さ: 「大文字表題」「突如現れる箇条書き」「親切すぎるほどの説明、冗長さ」「文章の構成よりも、テンプレート表題で構成を作っていく（はじめに→特徴→メリデメ→まとめ）」
    - 本質的なAI臭さ: 「当たり障りがない（ポジションを取らない）」「メリデメを示し、最後はBYAF（But You Are Free, あなた次第）」「私はこう思うがない（I think 〜）」
3. 集め方
    - note の読者の反応についての作者の見立てと、Gemini に制約付きのプロンプトを与える試行による【原文】
4. 評価
    - 2 分割は粗いが、[makotofalcon/humanizer-ja] の第3層と [Rapls スキル] の第0層の源流の 1 つ（[makotofalcon/humanizer-ja] が参考文献に挙げている）
    - 「本質的」の側は立場の有無を問うもので、範囲の単位では分けられない
5. 対応する単位
    - ブロック（箇条書き）と節どうし（テンプレートの表題による構成）。本質的な側は範囲の単位に収まらない
6. 確かめ方
    - 本文を note の API の原文で読んだ【原文】

## AI の出力に特有で、人間の文章の誤りの分類に入りにくい悪さ

人間の文章の誤りの分類（誤字・文法・係り受け・冗長・論理の飛躍・用語の揺れ）に入りにくいものを 5 つ挙げる。
選定と説明は調査者の判断で、各項目の末尾に、そう言える資料を挙げる。

1. 情報を足さない演出。誰も主張していない命題を否定して対にする「X ではなく Y」、どこにも無い反論への先回りの弁明、段落を言い直すだけの一行の締め、造語のラベル。
   冗長の一種に見えるが、冗長が同じ情報の繰り返しであるのに対し、これは存在しない命題を作り出す。
   資料: [Wikipedia:Signs of AI writing] の節 Negative parallelisms、[blader/humanizer] の節 A（とくに項目 1 と 5）、[stop-slop] の references/structures.md の Binary Contrasts、[tropes.md] の Invented Concept Labels、[k16shikano 日本語技術文書の文章規範] の節 演出の抑制、[Rapls スキル] の「A級：必殺技造語」、[slop-score] が否定の対句を独立の柱にしていること
2. 具体の平均化と意義の水増し。具体的で珍しい事実が一般的な記述に置き換わり、同時に意義を大きく言う。
   誤りは「書いてあること」ではなく「書かれなくなった具体」にあり、元の情報を持たないレビュアーには見えない。
   資料: [Wikipedia:Signs of AI writing] の節 Content の冒頭（平均への回帰の説明）と節 Undue emphasis on significance, legacy, and broader trends、[blader/humanizer] の節 C、[avoid-ai-writing] の P0（Significance inflation on routine events）、[textlint-rule-preset-ai-writing] の規則 no-ai-hype-expressions、[fibujrsl Zenn] の見出し 5
3. 会話と生成過程の残留物。チャットの挨拶・申し出、知識の区切りの断り書き、埋められていない placeholder、生成ツールの引用マークアップ、読者の知らない前の版や作業の過程への言及。
   人間の書き手はこの種の文脈を持たないので、人間の誤りの分類に対応する枠が無い。
   資料: [Wikipedia:Signs of AI writing] の節 Communication intended for the user・Markup・Edit summaries、[blader/humanizer] の節 E（項目 25 Writing about the previous version を含む）、[avoid-ai-writing] の Communication Patterns と表の # 43〜45、[k16shikano 認知リズム] の節 執筆後の点検手順 の漏出テスト
4. 1 件ずつでは誤りでなく、分布としてだけ悪い型。行頭太字の箇条書き、三つ組、em dash、均一な文長、語尾の固定、比喩として転用された頻出語（入口、土台、実測、切り分ける）。
   どの 1 件も正しい日本語でありうるので、出現箇所ごとの誤りの分類では拾えず、文書の中の頻度か他の兆候との重なりで判定するしかない。
   資料: [blader/humanizer] の `weak alone` と節 B・D、[Rapls スキル] の節 確度ランク の B の定義、[tropes.fyi] の注記、[逆瀬川 Qiita 7万記事の分析]（太字約 3 倍、箇条書き約 1.8 倍、語の出現率）、[textlint-rule-preset-ai-words-ja]、[slop-score]
5. 確かめていないことを滑らかに埋める。資料に無い事柄を「〜と考えられる」「おそらく〜」で推測して埋める、検証の条件や未確認の範囲を書かずに整った結論を置く。
   人間の分類では「根拠不足」に入るが、AI の場合は欠けていることが文面から見えない（言い淀みが無く、形が整っている）点で性質が違う。
   資料: [Wikipedia:Signs of AI writing] の節 Knowledge-cutoff disclaimers and speculation about gaps in sources、[blader/humanizer] の項目 23、[avoid-ai-writing] の表の # 46 Speculative gap-filling、[k16shikano 日本語技術文書の文章規範] の節 読者への誠実さ（「確認していないことを、確認したかのように滑らかに書かない。」）、[fibujrsl Zenn] の見出し 7 と 8

## 見つけたが読んでいない資料

次は、調べた資料の中で引かれていたか、検索で見つかったが、原文を読んでいない。内容は【未確認】。
調べた資料の 19 件には数えていない。

- mieru-ca の「これにより」の分析、Books&Apps（安達裕哉）の「ChatGPT的」文章の 3 大要因、Qiita の robitan によるモデルごとの文体の分析（いずれも [makotofalcon/humanizer-ja] の参考文献）
- Daichi Nagashima の「立場と主体」の枠組み（[Rapls スキル] の出典。リンク先は [genshi.ai](https://genshi.ai/)）
- [KANNOHI1/humanizer-jp](https://github.com/KANNOHI1/humanizer-jp)（2026-09-24 作成）と [matsuikentaro1/humanizer-japanese](https://github.com/matsuikentaro1/humanizer-japanese)
- [brandonwise/humanizer](https://github.com/brandonwise/humanizer) と Pangram Labs の検出研究（[avoid-ai-writing] の節 Credits）
- [Qiita 81万記事・13億字・8.8GBを15年分測ったら、生成AIより先に日本語が変わっていた](https://qiita.com/ykhirao/items/ceb4a8846d0e4480bf9f)（検索結果の題名だけを見た）
- [AI Writing Tropes: The Complete List](https://julieholmes.com/ai-writing-tropes/)、[AIっぽさはどこからくるのか](https://zenn.dev/todesking/scraps/da4b4a01cec42b)

## 参考文献

閲覧日はすべて 2026-09-25。版の欄の commit と gist の revision は、閲覧の直後に API で確かめた最新のもの。
閲覧日の当日に更新された資料（[avoid-ai-writing]、[k16shikano 日本語技術文書の文章規範]）は、読んだ時点の版と一致するかを確かめていない。
ライセンスの欄の「記載なし」は、読んだ範囲に表示が無かったことを表す。サイト全体の規約までは確かめていない。

- [Wikipedia:Signs of AI writing]
    - 名前: Wikipedia:Signs of AI writing
    - 作成者・保守者: WikiProject AI Cleanup（Wikipedia の編集者による共同編集）
    - URL: [https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
    - 版: revision ID 1376434705（2026-09-24T03:34:26Z）
    - ライセンス: CC BY-SA 4.0（英語版 Wikipedia のサイト設定）
    - 閲覧日: 2026-09-25
- [blader/humanizer]
    - 名前: humanizer
    - 作成者・保守者: blader（GitHub）
    - URL: [https://github.com/blader/humanizer](https://github.com/blader/humanizer)
    - 版: commit 9862685f575c65a8247f90369951df1b3416e3d6（2026-09-06）、release v3.0.0（SKILL.md の version 3.0.0）
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [stop-slop]
    - 名前: stop-slop
    - 作成者・保守者: Hardik Pandya（GitHub の hardikpandya）
    - URL: [https://github.com/hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop)
    - 版: commit 8da1f030185bdfe8471220585162991eaeb970e9（2026-03-17）。release なし
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [avoid-ai-writing]
    - 名前: avoid-ai-writing
    - 作成者・保守者: Conor Bronsdon（GitHub の conorbronsdon）
    - URL: [https://github.com/conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing)
    - 版: commit 1be7702796e5f2ee79119ccb9f963ddd21f87420（2026-09-25T03:04:32Z）、最新 release v3.36.0
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [tropes.fyi]
    - 名前: Tropes - AI Writing Pattern Directory
    - 作成者・保守者: Ossama Chaib（ossama.is）
    - URL: [https://tropes.fyi/](https://tropes.fyi/)
    - 版: 版の表示なし
    - ライセンス: 【未確認】
    - 閲覧日: 2026-09-25（要約経由）
- [tropes.md]
    - 名前: AI Writing Tropes to Avoid（tropes.md）
    - 作成者・保守者: Ossama Chaib（GitHub の ossa-ma）
    - URL: [https://gist.github.com/ossa-ma/f3baa9d25154c33095e22272c631f5a1](https://gist.github.com/ossa-ma/f3baa9d25154c33095e22272c631f5a1)
    - 版: gist revision 42ac5e508e7cafd78330df3b97213efdc7e6382a（2026-09-22）
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [slop-score]
    - 名前: slop-score（Slop-Score: Writing Metrics Analyzer）
    - 作成者・保守者: Samuel J. Paech（GitHub の sam-paech、EQ-Bench）
    - URL: [https://github.com/sam-paech/slop-score](https://github.com/sam-paech/slop-score)
    - 版: commit 289264ab2a0df1358ef81ced3c259610ea709514（2025-11-22）。release なし
    - ライセンス: 本体は MIT。同梱の wordfreq の移植は Apache-2.0、その語頻度データは CC BY-SA 4.0（README の節 License）
    - 閲覧日: 2026-09-25
- [MQM Error Typology]
    - 名前: MQM Error Typology
    - 作成者・保守者: MQM Council
    - URL: [https://themqm.org/error-types-2/typology/](https://themqm.org/error-types-2/typology/)
    - 版: MQM 2.0。ページの更新日の表示なし
    - ライセンス: CC BY 4.0（要約経由）
    - 閲覧日: 2026-09-25（要約経由）
- [textlint-rule-preset-ai-writing]
    - 名前: @textlint-ja/textlint-rule-preset-ai-writing
    - 作成者・保守者: azu、textlint-ja
    - URL: [https://github.com/textlint-ja/textlint-rule-preset-ai-writing](https://github.com/textlint-ja/textlint-rule-preset-ai-writing)
    - 版: commit 45bb6485062b96a8578c5fa6ae37a41de01d9b80（2026-05-13）、最新 release v1.7.0
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [textlint-rule-preset-ai-words-ja]
    - 名前: textlint-rule-preset-ai-words-ja
    - 作成者・保守者: p1ass
    - URL: [https://github.com/p1ass/textlint-rule-preset-ai-words-ja](https://github.com/p1ass/textlint-rule-preset-ai-words-ja)
    - 版: commit deb67606b384a173ee56ebdc1d15845eb1a8be93（2026-09-24）、最新 release v1.2.1
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [p1ass ブログ]
    - 名前: AIが書いた日本語に頻出する単語を指摘するtextlintプリセットを作った
    - 作成者・保守者: p1ass（ぷらすのブログ）
    - URL: [https://blog.p1ass.com/posts/textlint-rule-preset-ai-words-ja/](https://blog.p1ass.com/posts/textlint-rule-preset-ai-words-ja/)
    - 版: 公開 2026-09-13（ページの datePublished）
    - ライセンス: 【未確認】
    - 閲覧日: 2026-09-25（要約経由）
- [逆瀬川 Qiita 7万記事の分析]
    - 名前: 生成AI以前と以後でエンジニアの文章はどう変わったのか: Qiitaの7万記事を数えてみた話
    - 作成者・保守者: 逆瀬川（逆瀬川ちゃんのブログ）
    - URL: [https://nyosegawa.com/posts/qiita-writing-before-after-ai/](https://nyosegawa.com/posts/qiita-writing-before-after-ai/)
    - 版: 2026-09-11（ページ内の日付）
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [k16shikano 日本語技術文書の文章規範]
    - 名前: 日本語技術文書の文章規範（japanese-tech-writing）
    - 作成者・保守者: k16shikano
    - URL: [https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d](https://gist.github.com/k16shikano/fd287c3133457c4fd8f5601d34aa817d)
    - 版: gist revision 8f2d57610a73efc97d743c9b0b0ecb1002e09fa4（2026-09-25T02:21:44Z）
    - ライセンス: Unlicense（frontmatter の license 欄）
    - 閲覧日: 2026-09-25
- [k16shikano 認知リズム]
    - 名前: 認知リズムを生むための日本語ライティング規範（cognitive-rhythm-writing）
    - 作成者・保守者: k16shikano
    - URL: [https://gist.github.com/k16shikano/eb2929f13ed19c97188393d297be8432](https://gist.github.com/k16shikano/eb2929f13ed19c97188393d297be8432)
    - 版: gist revision a3b1e26beced71d582e13314fb6f5b179b023c76（2026-09-24T06:13:12Z）
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [minorun365 見分け方]
    - 名前: ペロッ…これはAI生成記事！ 見分け方のコツ
    - 作成者・保守者: minorun365（みのるん）
    - URL: [https://qiita.com/minorun365/items/68740e4ba1d81177199b](https://qiita.com/minorun365/items/68740e4ba1d81177199b)
    - 版: 投稿 2025-04-23T14:46:18+09:00、最終更新 2025-04-23T20:26:25+09:00
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [minorun365 スキル]
    - 名前: あなたの技術ブログの「AI臭さ」を抜くスキル公開します
    - 作成者・保守者: minorun365（みのるん）
    - URL: [https://qiita.com/minorun365/items/699e89544da8b0de300d](https://qiita.com/minorun365/items/699e89544da8b0de300d)
    - 版: 投稿 2026-07-13T09:56:53+09:00、最終更新 2026-07-13T09:57:44+09:00
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [Rapls スキル]
    - 名前: AIが書いた日本語から「AI臭さ」を消すスキルと、採点スクリプトを公開します
    - 作成者・保守者: Rapls
    - URL: [https://qiita.com/Rapls/items/b98b09ec57c7e4b7be05](https://qiita.com/Rapls/items/b98b09ec57c7e4b7be05)
    - 版: 投稿・最終更新 2026-08-25T08:03:39+09:00
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [gonta223/humanizer-ja]
    - 名前: humanizer-ja（Humanizer JA）
    - 作成者・保守者: gonta223（SKILL.md の author 欄は SuguruKun_ai）
    - URL: [https://github.com/gonta223/humanizer-ja](https://github.com/gonta223/humanizer-ja)
    - 版: commit a1e343696e43aa50e7218891f3319ab22cde3464（2026-03-23）、SKILL.md の version 1.0.0。release なし
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [makotofalcon/humanizer-ja]
    - 名前: humanizer-ja（Humanizer-JA）
    - 作成者・保守者: makotofalcon
    - URL: [https://github.com/makotofalcon/humanizer-ja](https://github.com/makotofalcon/humanizer-ja)
    - 版: commit 4cc01cdd5aff4102888e9396c3ba16da99828f78（2026-03-24）、SKILL.md の version 1.0.0。release なし
    - ライセンス: MIT
    - 閲覧日: 2026-09-25
- [fibujrsl Zenn]
    - 名前: 生成AIっぽい文章の特徴をまとめる
    - 作成者・保守者: fibujrsl（表示名「名前決めてね」）
    - URL: [https://zenn.dev/fibujrsl/articles/4958a844214709](https://zenn.dev/fibujrsl/articles/4958a844214709)
    - 版: 公開 2026-02-14T22:50:40+09:00、本文の最終更新 2026-02-16T14:35:02+09:00
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
- [Ichiro note]
    - 名前: noterに嫌われるAI臭い記事を生成しないプロンプトはあるのか？
    - 作成者・保守者: Ichiro | SIer（note の ichiro_blogpost）
    - URL: [https://note.com/ichiro_blogpost/n/nbd95a781a6b1](https://note.com/ichiro_blogpost/n/nbd95a781a6b1)
    - 版: 公開 2025-12-17T22:16:08+09:00
    - ライセンス: 記載なし
    - 閲覧日: 2026-09-25
