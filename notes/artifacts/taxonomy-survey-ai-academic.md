# AI の出力に特有の文章の悪さを分類した学術研究の調査

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

AI（LLM）が書いた文章の悪さを分類した学術研究を集め、分類の組み方・作り方・妥当さを資料ごとにまとめる。
使い道は、AI が書いた日本語の技術文書へのレビュー指摘を分類する階層（最上位は語・文・ブロック・節の中・節どうし・文書間の 6 単位）の下位分類を作るときの参考。

範囲は次のとおり。

- 対象: 査読のある会議・論文誌の論文と、arXiv の論文（査読の有無を明記する）
- 対象外: lint の規則、Wiki のページ、スタイルガイド、ブログ（別の調査が担当する）
- 事実の誤り（hallucination）の分類は、文章の書き方の悪さと関係する部分だけを扱う

調べた資料は 22 件で、うち査読を経たものは 17 件。
本文を読めず、要旨や書誌ページだけで書いたものは 8 件ある。
本文からは [著者 年] の形で引き、書誌は末尾の「参考文献」に 1 件ずつ並べる。
閲覧日はすべて 2026-09-25。

## 確認の程度の表記

各資料の「確認の程度」は、次の 4 段階で書く。

- PDF 直読: 論文の PDF のページを自分で読んだ
- 本文抽出: WebFetch で論文本文（HTML 版・PMC 版）を取得し、取得ツールが抽出した内容を読んだ。原文の逐語とは照合していない
- 要旨のみ: 要旨・書誌ページ・リポジトリの記録だけを読んだ。分類や方法論の節は読んでいない
- 未確認: 上のどれでも確かめられていない

## 分類の体系そのものを作った研究

### LLM の生成文への編集の分類（LAMP）[Chakrabarty 2025]

- 所在と査読: CHI 2025 の論文。査読あり
- 分類の階層: 1 階層で 7 カテゴリ。括弧内は 8,035 件の編集に占める割合
    - Cliché（決まり文句。17%）
    - Unnecessary/Redundant Exposition（不要・重複した説明。18%）
    - Purple Prose（美文調・過剰な修飾。約 5%）
    - Poor Sentence Structure（文構造の悪さ。移行の欠如・run-on 文・過度に複雑な構文を含む。20%）
    - Lack of Specificity and Detail（具体性・詳細の欠如。約 9%）
    - Awkward Word Choice and Phrasing（不自然な語選び・言い回し。不明確な代名詞の参照と受動態の過多を含む。28%）
    - Tense Inconsistency（時制の不一致。約 3%）
- 出典の箇所: カテゴリ名と定義は 4.4 節「Final Taxonomy for Fine-Grained Edits」（4.4.1〜4.4.7）と Table 3。割合は 5.3 節と Figure 5(a)。arXiv の HTML 版 v5 による。ページ番号は未確認
- 作り方
    - 予備調査（4.2 節）: MFA（創作の修士）を持つ書き手 8 人が 25 段落ずつ、計 200 段落を編集し、約 1,600 件の編集と 50 の初期カテゴリを得た。著者 2 人が独立に統合して議論を重ね、4 人以上の参加者が挙げたカテゴリだけを残して 7 つにした（編集の 95% を覆う）
    - 本調査: 主に MFA を持つ職業的な書き手 18 人が、LLM の生成した 1,057 段落（GPT-4o 393、Claude-3.5-Sonnet 368、Llama-3.1-70b 296）を分類に沿って編集した
    - 題材: 文芸的なフィクションが 80%、残りが旅行・食・個人のエッセイ
    - 一致度（5.2 節）: 50 段落を 3 人が独立に編集し、スパン単位の precision が平均 0.57
- 評価（自分の判断）
    - 各カテゴリが実際の修正と結び付いている点が強い。「何を直したか」から作った分類なので、レビュー指摘の分類とは作り方が近い
    - 題材が創作に偏っている。Purple Prose と Tense Inconsistency は技術文書では出にくく、そのまま持ち込めない
    - 抽象度が揃っていない。Tense Inconsistency は文法の誤りで、Unnecessary Exposition はブロック単位の内容の判断。Awkward Word Choice は代名詞の参照・受動態まで抱える受け皿になっている。6 単位に当てると、語（Cliché、Awkward Word Choice）・文（Poor Sentence Structure、Tense）・ブロック（Exposition、Specificity）に散る
    - カテゴリ自体は編集の一般的な観点で、AI に固有とは言えない。AI の文章に多いことは示しているが、同じ分類で人間の文章を編集して頻度を比べたかは確認できていない（未確認）
    - 一致度 0.57 は中程度で、カテゴリの境界は書き手の間でも揺れる
- 確認の程度
    - カテゴリ名・定義・方法論・頻度・節と表の番号: 本文抽出（arXiv の HTML 版 v5）
    - CHI 2025 での発表と DOI: 検索結果と arXiv の書誌ページで確かめた

### AI の「slop」の分類 [Shaib 2025]

- 所在と査読: arXiv の v2（2026-01-24）のヘッダは「Preprint. Under Review.」。
  共著者 Wallace の業績ページは COLM 2026 の proceedings に載ると記すが、会議側の proceedings では確かめていない。査読の有無は未確定として扱う
- 分類の階層: 3 階層（Themes → Final Codes → Granular Codes）。括弧内は専門家の回答のうちそのコードを含んだ数
    - Information Utility（情報の有用性）
        - Density → IU1: Density（情報密度。長さに対する実質的な内容の量。5）
        - Relevance → IU2: Relevance（課題・プロンプトとの関連。9）
    - Information Quality（情報の質）
        - Factuality → IQ1: Factuality（不正確さ・hallucination・誤った主張。7）
        - Bias → IQ2: Bias（必要な主観的視点の有無。2）
    - Style Quality（文体の質）
        - Structure → SQ1: Repetition（同じ語句の過剰な反復。7）、SQ2: Templatedness（定型の構造への依存。2）
        - Coherence → SQ3: Coherence（論理の流れ。6）
        - (Aspects of) Tone → SQ4: Fluency（言語の自然さ。4）、SQ5: Verbosity（伝える情報に対する冗長さ。5）、SQ6: Word Complexity（文脈に対して不必要に難しい語彙。1）、SQ7: Tone（文脈に対する文体・声の適切さ。過度の形式ばりを含む。3）
- 出典の箇所: 階層と件数は Table 1（3 ページ）。コードの説明は 3.3 節「Finalized "Slop" Taxonomy」（4〜5 ページ）。一致度は Table 3（5 ページ）。いずれも arXiv v2 の PDF
- 作り方
    - 定義の収集（3 節）: 執筆・ジャーナリズム・言語学・NLP・哲学の専門家 19 人から「slop」の定義と特徴を集めた
    - コード化: 質的内容分析と演繹的コーディングで、新しいコードが出なくなるまでコード表を作った。初期コードは 15 個（Factuality, Information Density, Bias, Relevance, Repetition, Templatedness, Verbosity, Word Complexity, Tone, Coherence, Fluency, Diversity, Engagement, Vagueness, Utility）。全著者が見直し、重複するもの（例: Vagueness と Information Density）を畳んで 3 つの Theme に分けた
    - 注釈（3.2 節・4 節）: Upwork で雇った校閲者 5 人の予備注釈の後、3 人を残した。ニュース記事 213 本と QA の文章 123 本に、語単位・複数ラベルのスパン注釈を付けた。ニュース記事は人間の原文・AI の生成（Claude、GPT-4o、o1-pro）・「人間らしく」書かせた生成を含み、QA は MS MARCO の 100 問に 5 モデルが答えたもの
    - 一致度: 文書全体を slop とみなすかの 2 値判定は Cohen's κ が −0.15、0.29、0.06 で低い（AC1 では 0.12、0.42、0.28）。Theme 単位の α_MASI は 0.34〜0.45。スパンの precision は 0.65〜0.80
    - slop 判定との関係: Relevance・Density・Tone が最も強く効いた（β はそれぞれ 0.06、0.05、0.05）
- 評価（自分の判断）
    - 集めた中で、AI らしい文章の悪さそのものを分類の対象に据えた唯一の研究。3 つの Theme（情報の有用性・情報の質・文体の質）は範囲の単位とは別の軸で、6 単位の下に置くより、直交する第 2 の軸として使える
    - コードの根拠が薄い。19 人の短い定義から作ったため、Word Complexity は 1 件、Templatedness と Bias は 2 件しか支えがない
    - 階層の組み方に無理がある。Fluency と Verbosity を「(Aspects of) Tone」の下に置く理由が本文で説明されていない
    - 人間の文章にもこの分類で slop のスパンが付く。論文自身、人間の文章も slop と読まれうると書いており、分類は「AI に固有の悪さ」ではなく「AI に多い悪さ」を測っている
    - 英語のニュースと短い QA だけで作っており、日本語の技術文書への当てはまりは検証されていない
- 確認の程度
    - 分類表・方法論・注釈データ・一致度: PDF 直読（arXiv v2 の 1〜5 ページ）
    - β の値: 本文抽出（arXiv の HTML 版 v2）。PDF の該当ページは読んでいない

### GPT-3 の生成文の誤りの分類（Scarecrow）[Dou 2022]

- 所在と査読: ACL 2022 の long paper。査読あり
- 分類の階層: 2 階層で 10 種の誤り。各スパンに重大度（3 段階）と説明文を付ける
    - Language Errors（言語の誤り）
        - Grammar and Usage: 語の欠落・余分・誤り・語順の誤り
        - Off-Prompt: 生成がプロンプトと無関係か、プロンプトと矛盾する
        - Redundant: 語彙・意味・話題の過剰な反復
        - Self-Contradiction: 生成が自身と矛盾する
        - Incoherent: 混乱しているが、上のどの誤りにも当たらない
    - Factual Errors（事実の誤り）
        - Bad Math: 計算・換算の誤り
        - Encyclopedic: 注釈者が誤りと知っている事実
        - Commonsense: 世界の基本的な理解に反する
    - Reader Issues（読み手の問題。誤りではないが、理解に外部の助けが要る箇所）
        - Needs Google: 主張の確認に検索が要る
        - Technical Jargon: 理解に専門知識が要る
- 出典の箇所: 分類表は Table 1（Proceedings の 7251 ページ）。3 分類の説明は 4.4 節「Error Types」（7255 ページ）。重大度は 4.5 節（7255 ページ）
- 作り方
    - 誤りの型は、言語学的な分析・生成文で観察された誤り・一般の人が 2 時間以内の訓練で使えること、の 3 つの釣り合いで選んだ
    - 固定のラベルを持たずに予備注釈を数回行い（クラウドワーカー 30 人、60 段落に 750 件）、分類を絞り込んだ
    - 本調査は Amazon Mechanical Turk で、1.3k 段落に 13k 件の注釈、41k のスパンを集めた。題材は英語のニュースの続き（80〜145 トークン）。GPT-2 Small・GPT-2 XL・Grover-Mega・GPT-3 DaVinci と人間の原文を比べた
- 評価（自分の判断）
    - スパン単位で、重大度と説明を併せて取る設計はレビュー指摘の分類に近く、手順が厳密
    - GPT-3 以前の、指示追従の訓練を受けていないモデルが題材。冗長な前置き・定型の構成・迎合のような、指示追従の訓練後に目立つ悪さは入っていない
    - Reader Issues を「誤り」から分けた点は取り込む価値がある。人間の原文で最も多いのがこの 2 つで、人間の悪さと AI の悪さの境目を示している
    - Redundant が語彙・意味・話題の反復をまとめて持つ。6 単位に当てると語・文・ブロックにまたがるので、分けて使う必要がある
    - 結果の中で AI に固有の傾向として読めるのは、Redundant と Self-Contradiction が中〜大規模のモデルで増え、人間で減るという点（Figure 2、7252 ページ）
- 確認の程度
    - 分類表・方法論・結果: PDF 直読（ACL Anthology の PDF、7250〜7256 ページ）
    - 注釈者間の一致度: 未確認（該当の付録を読んでいない）

### AI が書いたと判断する手がかりの分類 [Russell 2025]

- 所在と査読: ACL 2025 の long paper。査読あり
- 分類の階層: 1 階層。専門家が「AI が書いた」と判断した根拠の分類で、括弧内は全説明に占める割合
    - 本文 Table 3 の 6 つ: Vocabulary（53.1%）、Sentence Structure（35.9%）、Grammar & Punctuation（24.8%）、Originality（23.7%）、Quotes（22.3%）、Clarity（19.5%）
    - 付録の図に出る残り: Formatting、Conclusions、Formality、Names、Tone、Introductions、Factuality、Topics、Other
    - Sentence Structure の定義は「"not only … but also" の多用、項目を常に 3 つ並べる、のような予測できる型」を含む。Clarity は「説明しすぎる・無関係な詳細を入れる」を含む
    - 別に、専門家の手がかりを整理した検出ガイドがあり、節は Vocabulary / Word Choice Patterns、Grammar、Sentence Structure、Formatting、Tone、Introductions、Conclusions、Content、Contextual Accuracy and Factuality、Creativity & Originality。「AI の語彙」は品詞別（Nouns・Verbs・Adjectives・Adverbs・Phrases）に並ぶ
- 出典の箇所
    - 6 カテゴリの定義と割合: Table 3（5348 ページ）
    - 残りのカテゴリ名: Figure 9〜14 の横軸（5370〜5371 ページ）。完全版の分類表 Table 17 は読めていない
    - 検出ガイドの節: Table 11（5361 ページ）
    - AI の語彙の一覧: Table 12（5362 ページ）
    - 分類の手順: 付録 D.1「Categorization of Comments」（5358 ページ）
- 作り方
    - 米国の 8 誌から集めた 1,000 語未満の英語のノンフィクション記事 300 本と、同じ題で LLM（GPT-4o、Claude-3.5-Sonnet、o1-Pro、言い換え版、人間らしく書かせた版）に書かせた記事を組にした
    - LLM を書く仕事で頻繁に使う注釈者 5 人（編集者・コピーライターなど）が、判定・確信度・根拠スパン・説明文を付けた（計 1,790 件）
    - 説明の分類: 著者 2 人が 25 件の説明を独立に注釈して合意し、カテゴリを作った。残りの約 1,500 件は GPT-4o に分類させた。GPT-4o の分類の妥当性は「25 件の大半が著者のラベルと合った」とだけ書かれ、数値の一致度は無い
- 評価（自分の判断）
    - 分類の対象は「悪さ」ではなく「AI が書いた手がかり」。Names（登場人物の名前）や Quotes（引用の不自然さ）は検出の手がかりで、文章の欠陥とは限らない
    - それでも、Introductions と Conclusions（「きれいにまとめて終える」「既に書いたことを要約し直す長い結び」）は、節の中・節どうしの単位で AI に多い型を具体的に名指ししていて、使える
    - 分類の大半を GPT-4o が付け、検証が弱い。注釈者も 5 人と少ない
- 確認の程度: PDF 直読（ACL Anthology の PDF。上に挙げたページ）

### Verbosity Compensation の型 [Zhang 2025]

- 所在と査読: ACL 系の workshop（2nd Workshop on Uncertainty-Aware NLP）の論文。査読あり（workshop の査読）
- 分類の階層: 1 階層。Verbosity Compensation（簡潔に答えるよう指示されても、情報を失わずに圧縮できる応答を返すこと）の型
    - Ambiguity: 正確に答えない
    - Repeating Question: 質問の語を繰り返す、または無関係な情報を出す
    - Enumerating: 正解を当てようと複数の答えを並べる
    - Verbose Detail: 余計に詳しい説明や書式記号を出す
    - 5 つ目の型（書式に関するもの）の正確な名前: 未確認
- 出典の箇所: 型の一覧は Table 1（arXiv の HTML 版による）。ページ番号は未確認
- 作り方
    - 知識・推論の QA データセット 5 種で 14 モデルを試した
    - 6 つのモデルとデータセットの組で、誤答かつ冗長な応答を人手で見て型に分けた。注釈者の数・件数・一致度は書かれていない
- 評価（自分の判断）
    - 冗長さを「不確かさの補償」という原因に結び付けた点が、人間の誤りの分類に無い観点。冗長な応答ほど正答率が低いという結果は、冗長さを信頼性の信号として扱う根拠になる
    - 分類の作り方の記述は薄い。題材も短い答えの QA で、文書の冗長さへそのまま広げられない
- 確認の程度
    - 要旨と会議名: 要旨のみ（ACL Anthology）
    - 型の名前と定義・作り方: 本文抽出（arXiv の HTML 版 v2）。型の数と名前の対応が抽出結果の中で揺れており、PDF で確かめていない

### 選好モデルが過大に評価する 5 特徴 [Bharadwaj 2026]

- 所在と査読: arXiv の書誌は ICLR 2026 で発表と記す。査読あり
- 分類の階層: 1 階層の 5 特徴
    - length（長さ。内容を足さない長さ）
    - structure（箇条書き・番号付きの構造を散文より好むこと）
    - jargon（不要な専門用語）
    - sycophancy（利用者の意見・前提への同調）
    - vagueness（具体的な情報ではなく、多くの面を浅く覆う広い記述）
- 出典の箇所: 2.2 節「Biases Under Consideration」と Table 1（arXiv の HTML 版 v3 による）。ページ番号は未確認
- 作り方
    - 特徴はデータから作った分類ではない。「LM の生成で頻繁に観察される」として選び、length・structure・sycophancy は先行研究を引いている。選定の根拠は本文にそれ以上書かれていない
    - 各特徴を人工的に強めた反実仮想の組を作り、選好モデルが強めた側を選ぶ率（60% 超）と、人間の選好からのずれ（約 40%）を測った
- 評価（自分の判断）
    - 分類としての新しさは無いが、機構の証拠として使える。これらの特徴は人間の選好ラベルとは弱い負の相関（平均 r = −0.12）しか無いのに、報酬モデルのラベルとは正の相関（平均 r = +0.36）を持つ。訓練の段階でこれらの特徴が報われていることが、AI の文章に多い理由の説明になる
    - vagueness の定義は、AI の文章の「曖昧さ」を語の曖昧さではなく「浅く広く覆う」内容の問題として捉えており、ブロック単位の分類の参考になる
- 確認の程度
    - 要旨と会議名: 要旨のみ（arXiv の書誌ページ）
    - 特徴の定義と選定の記述: 本文抽出（arXiv の HTML 版 v3）

### LLM の hallucination の分類 [Huang 2025]

- 所在と査読: ACM Transactions on Information Systems の論文。査読あり
- 分類の階層（文章の書き方と関係する部分に絞る）: 2 階層
    - Factuality Hallucination
        - Factual Contradiction（entity-error、relation-error）
        - Factual Fabrication（unverifiability、overclaim）
    - Faithfulness Hallucination
        - Instruction inconsistency（利用者の指示からの逸脱）
        - Context inconsistency（利用者が与えた文脈との食い違い）
        - Logical inconsistency（出力の内部の論理の矛盾。推論の段どうし、段と最終的な答えの間）
- 出典の箇所: 2.3 節「Hallucinations in Large Language Models」の Table 1（arXiv PDF の 6 ページ）と、2.3.1〜2.3.2 節の定義（6〜7 ページ）
- 作り方: 文献の調査に基づく分類で、実データへの注釈は無い。Ji らの intrinsic / extrinsic の区分を下敷きにしている
- 評価（自分の判断）
    - 文章の書き方と重なるのは 2 か所。overclaim（「主観的な偏りによって普遍的な妥当性を欠く主張」）は根拠のない誇張に当たり、Logical inconsistency は文書の中の自己矛盾に当たる
    - 分類の軸が「何と食い違うか」（世界・指示・与えた文脈・自身）で揃っている。この軸は、節の中・節どうし・文書間の矛盾を分けるときに使える
    - overclaim の定義は例が 1 つだけで、誇張と事実の捏造の境目が曖昧
- 確認の程度
    - 分類と定義: PDF 直読（arXiv v2 の PDF、4〜7 ページ）
    - 掲載誌の巻号と DOI: 検索結果による。ACM の版は開いていない

## 分類ではなく、AI と人間の文章の差を測った研究

この節の研究は分類の体系を作っていない。下位分類の個々の項目に、AI に多いことの証拠を与える。

### 文法と修辞の特徴の比較 [Reinhart 2025]

- 所在と査読: PNAS の論文。査読あり
- 分類の組み方: Biber の語彙・文法・修辞の特徴セット（66 特徴）で、人間と LLM の使用頻度を比べた。悪さの分類ではない
- 作り方: 共通のプロンプトから人間と LLM（Llama 3 の各版、GPT-4o）の平行コーパスを 2 つ作った。HAP-E は学術・ニュース・フィクション・話し言葉・ブログ・台本にわたり、人間の文章の 500 語を渡して続きを同じ文体で書かせた。HAP-E の本数は抽出結果の間で食い違った（12,000 本と、除外後 8,290 本）
- 主な結果（指示追従の訓練を受けたモデル）
    - 多い: 現在分詞節（GPT-4o で人間の約 5 倍）、主語の that 節（約 2.6 倍）、名詞化（約 2 倍）、句の並列（約 1.9 倍）
    - 少ない: 動作主の無い受動態（GPT-4o で人間の約半分）
    - 語彙: 「tapestry」「camaraderie」「palpable」などが人間の 100 倍以上
    - 差は指示追従の訓練を受けたモデルで大きく、ベースモデルでは小さい
- 出典の箇所: 特徴ごとの倍率は結果の節「Differences in style and vocabulary」と Figure 3、過剰な語は Table 1（arXiv の HTML 版 v2 による）。ページ番号は未確認
- 評価（自分の判断）
    - 確立した言語使用域の枠組みと平行コーパスを使っており、方法が最も堅い
    - 名詞化の過剰は、名詞構文を下位分類に立てる根拠になる。ただし英語の結果で、日本語の名詞構文とは構文の対応が取れていない
    - 差が指示追従の訓練で大きくなる点は、悪さの原因を訓練に求める他の研究 [Bharadwaj 2026] [Zhou 2024] と整合する
- 確認の程度
    - 要旨と掲載誌: 要旨のみ（arXiv の書誌ページ）
    - 特徴ごとの倍率・コーパスの説明: 本文抽出（arXiv の HTML 版 v2）。抽出結果の間で倍率とコーパスの本数が揺れたため、細かい数値は PDF で照合するまで仮の値として扱う

### ChatGPT と生徒の論説文の比較 [Herbold 2023]

- 所在と査読: Scientific Reports の論文。査読あり
- 分類の組み方: 教員による 7 観点の評価と、6 つの言語特徴（語彙の多様性 MTLD、統語の複雑さ、名詞化、法助動詞、認識のマーカー、談話標識）の比較
- 作り方: 90 題の論説文を、人間（英語を母語としない高校生相当の投稿）・ChatGPT-3・ChatGPT-4 の 3 種で比べ、ドイツの中等教育の教員 111 人が 7 段階で評価した。本数は抽出結果の間で食い違った（270 本と 658 本。後者は評価の件数の可能性がある）
- 主な結果: GPT のほうが名詞化が多く文が複雑で、生徒のほうが法助動詞と認識の構文を多く使う。AI の論説文は構造化の度合いが高く、結びの節の書き出しが同一になる
- 出典の箇所: 節・表の番号は未確認
- 評価（自分の判断）
    - 「結びの書き出しが同一」は、文書間の単位で見える定型の証拠になる
    - 比べた人間は英語を母語としない生徒で、熟練した書き手との差ではない。教員は AI の文章を高く評価しており、この研究の枠組みでは AI の特徴は「悪さ」と判定されていない
- 確認の程度: 本文抽出（PMC 版）

### ChatGPT と学生の論説文のメタ談話の比較 [Jiang 2025]

- 所在と査読: English for Specific Purposes の論文。査読あり
- 分類の組み方: Hyland のメタ談話の枠組み（interactive / interactional）を当てた比較
- 主な結果（要旨による）: ChatGPT の論説文は hedges・boosters・attitude markers などの interactional なメタ談話が有意に少なく、非人称的で説明的な調子になる。構造の一貫性は interactive な移行の標識で作っている
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）
    - 「AI は誇張する」という通念と逆向きの結果で、boosters（強調の標識）の頻度は学生より少ない。根拠のない誇張は、強調の標識の多さではなく、特定の評価語 [Kobak 2025] の偏りとして分類するほうが実態に合うと考える
    - 本文を読めておらず、コーパスの規模・モデルの版は分からない
- 確認の程度: 要旨のみ（大学のリポジトリ）。ScienceDirect の本文は取得できなかった

### 生物医学の要旨での過剰な語彙 [Kobak 2025]

- 所在と査読: Science Advances の論文。査読あり
- 分類の組み方: 頻度が異常に増えた語（excess words）を、content words（内容語）と style words（文体語）の 2 つに分ける
- 作り方: 2010〜2024 年の PubMed の要旨 1,500 万本超で、年ごとの語の頻度を予測値と比べた。2013〜2024 年の excess words 900 語を、著者が年を伏せて手で分類した（内容語 51.3%、文体語 45.2%）
- 主な結果: 2024 年の excess words 454 語のうち文体語は 379 語で、動詞が 66%、形容詞が 14%。「delves」「underscores」「showcasing」、頻出語では「potential」「findings」「crucial」
- 出典の箇所: 内容語と文体語の分類・品詞の内訳は 2.1 節「Excess words indicate widespread LLM usage」と Figure 3。語の例は 2.1 節と Figure 2（arXiv の HTML 版 v3 による）。ページ番号は未確認
- 評価（自分の判断）
    - ChatGPT の公開を境にした自然実験で、語の偏りの証拠として最も堅い
    - 分類は 2 値だけで、語単位の下位分類としては粗い。文体語の中を評価語・動詞の言い換え・接続語に分けることはしていない
    - 1 つ 1 つの語は誤りではない。悪さはコーパス全体の分布として現れる
- 確認の程度
    - 分類の手順と数値: 本文抽出（arXiv の HTML 版 v3）
    - 掲載誌と巻号: arXiv の書誌ページで確かめた

### 統語テンプレートの検出と計測 [Shaib 2024]

- 所在と査読: EMNLP 2024 の論文。査読あり
- 分類の組み方: 品詞の列を「統語テンプレート」と定義し、その出現率を測る。分類の体系は持たない
- 主な結果（要旨による）: モデルは人間の参照文より高い率でテンプレート化した文を出す。モデルの文のテンプレートの 76% は事前学習データに見つかり（人間の文では 35%）、RLHF などの調整でも消えない
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 語ではなく構文の型の反復を測る手段で、文単位・文書間の単位の定型を扱う根拠になる。[Shaib 2025] の Templatedness の計測はこの研究に依っている
- 確認の程度: 要旨のみ（ACL Anthology）

### 不確かさを表明しない LM [Zhou 2024]

- 所在と査読: ACL 2024 の long paper。査読あり
- 分類の組み方: 認識のマーカー（確信・不確かさを示す表現）の有無を扱う。分類の体系は持たない
- 主な結果（要旨による）: 公開されたモデルは誤答のときでも不確かさを表明しない。確信度を言わせると過信し、確信を示した応答の誤り率は平均 47%。調整用の選好データでは、人間が不確かさを含む文を嫌う偏りがある
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 確信度のヘッジが欠ける原因を選好データに求めており、「根拠のない断定」を AI 特有の悪さとして立てる根拠になる
- 確認の程度: 要旨のみ（ACL Anthology）

### LLM ごとの癖 [Sun 2025]

- 所在と査読: ICML 2025（PMLR 267）の論文。査読あり
- 分類の組み方: 出力からモデル（ChatGPT、Claude、Grok、Gemini、DeepSeek）を当てる分類課題。癖の所在を「語の分布」と「意味内容」の 2 層で調べた
- 主な結果（要旨による）: 5 モデルの識別で 97.1%。癖は語の分布に根ざし、別の LLM で書き換え・翻訳・要約しても残るので、意味内容にも埋め込まれている
- 出典の箇所: 要旨とプロジェクトページだけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 悪さの分類ではなく、モデルごとの癖の実在を示す研究。癖が書き換えで消えないことは、語の置き換えでは直らない構成の型があることを示唆する
- 確認の程度: 要旨のみ（arXiv の書誌ページ v2 と著者のプロジェクトページ）

### 反復する言い回しの抑制（Antislop）[Paech 2026]

- 所在と査読: ICLR 2026 の論文（会議の proceedings に掲載）。査読あり
- 分類の組み方: slop を「LLM の出力に特有の反復する言い回し」と定義し、人間の文章を基準にモデルごとの過剰な型を抽出して抑える。型の種類（単語・複数語の句・正規表現の構文の型）の区別があるかは未確認
- 主な結果（要旨による）: 一部の型は人間の文章の 1,000 倍以上の頻度で出る。8,000 以上の型を抑えても品質を保てる
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 「slop」を語句の反復だけに限った定義で、[Shaib 2025] の多次元の定義より狭い。語単位の過剰使用を測る手段として使える
- 確認の程度: 要旨のみ（arXiv の書誌ページ v2 と ICLR の proceedings のページ）

### ChatGPT と人間の専門家の回答の比較（HC3）[Guo 2023]

- 所在と査読: arXiv のみ。査読のある場での発表は確認できなかった
- 分類の組み方: ChatGPT の特徴 5 点と、人間との違い 4 点を並べる
    - 特徴: 定義 → 段階的な詳しい答え → まとめ、という整った構成で書く。長く詳しい答えを返す。偏り・有害な情報が少ない。知識の範囲外の質問に答えない。事実を捏造することがある
    - 人間との違い: 質問に厳密に沿う。客観的で均衡の取れた答えを返す。形式ばった言葉を使う。感情の表出が少ない
- 作り方: HC3 コーパス（約 4 万問）を公開し、100 組以上を読んだボランティア 200 人以上のフィードバックを著者がまとめた
- 出典の箇所: 人手評価の節（ar5iv の HTML 版による）。節番号は未確認
- 評価（自分の判断）: 手順が弱く、仮説の一覧として扱う。「定義 → 詳細 → まとめ」の構成は、節の中の単位の定型として他の研究 [Russell 2025] [Herbold 2023] と整合する
- 確認の程度: 本文抽出（ar5iv の HTML 版。arXiv v1 に基づく）

### AI の物語の談話の特徴（StoryScope）[Russell 2026]

- 所在と査読: arXiv のみ
- 分類の組み方: 物語の談話レベルの特徴 304 個を 10 の次元に分けた。次元の名前は未確認
- 主な結果（要旨による）: 約 5,000 語の物語 61,608 本で、物語の特徴だけで人間と AI を 93.2%（macro-F1）で識別した。AI の物語は説明しすぎと直線的な筋に傾く
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 創作が対象で、技術文書への距離は大きい。文体の手がかりを除いても、談話の構成だけで AI を識別できる点は、節どうし・文書全体の単位にも AI の型があることの傍証になる
- 確認の程度: 要旨のみ（arXiv の書誌ページ v6）

### slop の特徴づけ（Why Slop Matters）[Kommers 2025]

- 所在と査読: arXiv の書誌は ACM AI Letters に採録（2025-12-23）と記す。査読あり
- 分類の組み方: 典型的な slop の特徴 3 つ（superficial competence: 表面の質の下に中身が無い、asymmetry of effort: 生成の労力が極端に小さい、mass producibility: 大量に作れる）と、slop が変化する 3 次元（instrumental utility、personalization、surrealism）
- 作り方: 概念的な論考で、データに基づく分類ではない
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: superficial competence は、[Shaib 2025] で Density・Relevance が slop 判定に最も効いたことと整合する。ほかの 2 特徴と 3 次元は生産と流通の話で、文章の分類には使わない
- 確認の程度: 要旨のみ（arXiv の書誌ページ v1）

### AI の生成文の言語的特徴のサーベイ [Terčon 2025]

- 所在と査読: arXiv のみ
- 分類の組み方（要旨による）: 既存研究を、言語記述のレベル・モデルの種類・ジャンル・言語・プロンプトの与え方で整理する
- 主な結果（要旨による）: AI の文章は形式ばった非人称の文体に傾き、名詞・限定詞・前置詞が多く、形容詞・副詞が少ない。語彙の多様性が低く、反復が多い。研究は英語と GPT に偏っている
- 出典の箇所: 要旨だけを読んだため、節・表の番号は未確認
- 評価（自分の判断）: 形容詞が全体としては少ないという結果は、[Kobak 2025] の評価形容詞の偏りと矛盾しない。品詞全体の頻度と特定の語の過剰使用は別の現象で、分類でも分けて扱う
- 確認の程度: 要旨のみ（arXiv の書誌ページ v1。HTML 版は取得できなかった）

## 日本語を対象にした研究

日本語の LLM の文章の悪さを分類した査読論文は見つからなかった。
見つかったのは、文体の統計的な差で AI と人間を識別する研究と、モデル固有の言い回しを抽出した査読なしの発表。

### ChatGPT の日本語論文の文体計量 [Zaitsu 2023]

- 所在と査読: PLOS ONE の論文。査読あり
- 分類の組み方: 文体の特徴 4 種（品詞 bigram、助詞の bigram、読点の位置、機能語の率）による識別。悪さの分類ではない
- 作り方: 心理学系の日本語論文（36 人の単著 72 本）と、GPT-3.5・GPT-4 がそれぞれ生成した 72 本、各約 1,000 字の計 216 本
- 主な結果: 機能語の率だけで 98.1%、全特徴で 100% の精度で識別した
- 出典の箇所: 節・表の番号は未確認
- 評価（自分の判断）: 日本語の AI の文章が、助詞・助動詞・接続詞の使い方の分布で人間と系統的に違うことを示す。どの助詞がどちら向きに違うかは抽出結果が曖昧で、下位分類の具体的な項目には落とせていない
- 確認の程度: 本文抽出（PMC 版）。特徴ごとの増減の向きは未確認

### 7 つの LLM と人間の日本語の文体計量 [Zaitsu 2025]

- 所在と査読: PLOS ONE の論文。査読あり
- 分類の組み方: 機能語の unigram、品詞 bigram、機能語と品詞を組み合わせた句の型による識別
- 作り方: 人間の書いたパブリックコメント 100 本と、7 つの LLM（GPT-4o、o1、Claude 3.5、Gemini、Copilot、Llama 3.1、Perplexity）が 50 本ずつ書いた 350 本。別に 403 人の日本語話者に人間と AI を判定させた
- 主な結果: ランダムフォレストで 99.8% の精度。人間の判定者は識別が苦手で、言い回しの表面的な印象に頼った
- 出典の箇所: 節・表の番号は未確認
- 評価（自分の判断）: 日本語でも AI の文章の差は機能語の分布にあり、読み手が気づく言い回しとは一致しない。レビュー指摘として拾える悪さと、統計的に AI を識別する特徴は別物だと分かる
- 確認の程度: 本文抽出（PLOS の記事ページ）。数値は PDF で照合していない

### LLM ごとの日本語の頻出フレーズ [林 2026]

- 所在と査読: 言語処理学会 第 32 回年次大会の発表論文。PDF の各ページの脚注に「This work is published without peer review」とある。査読なし
- 分類の組み方: 分類の体系は持たない。生成文の埋め込みによるモデル識別と、n-gram の頻度の比によるモデルごとの頻出フレーズの抽出
- 作り方: Ichikara の質問と、UltraChat の質問を日本語に訳したもの、各 3,985 件を 9 モデル（GPT-5.2、Claude Sonnet、Gemini 3 Pro と、オープンモデル 6 種）に与えた。商用 3 モデルの識別は 98.2%、オープンモデル 6 種は 93.0%
- 抽出された頻出フレーズの例
    - ChatGPT: 「もしよければ，次を教えてください。」「差し支えなければ，次を教えてください。」
    - Gemini: 「以下の通りです。」「まとめました。」「結論から申し上げますと，」
    - Claude: 「ていただければ，より具体的なアドバイスができます」「具体的に知りたいことはありますか？」「主な理由は以下の通りです：」
    - LLM-jp: 「ステップバイステップで説明します。」「について，一般的なことを述べます。」
- 出典の箇所: 頻出フレーズは付録 A の表 5（予稿集 4063 ページ）。抽出の方法は 3.4 節（4060 ページ）。モデルごとの傾向の要約は 3.4 節と 4 節（4061 ページ）
- 評価（自分の判断）
    - 日本語で、モデルごとの定型の導入句・締めの句を実データから出した唯一の資料。導入句（「以下の通りです」「ステップバイステップで説明します」）と、利用者へ追加の情報を求める締め（「もしよければ〜」「具体的に知りたいことはありますか？」）は、文書に残ると対話の残留になる
    - 題材は対話の応答で、技術文書ではない。査読を経ておらず、抽出したフレーズの選び方（上位からの代表例）も恣意の余地がある
- 確認の程度: PDF 直読（予稿集 4058〜4063 ページの全 6 ページ）

### 調べたが対象から外した資料

- [Tarumoto 2024]: 査読ありの日本語の論文だが、要旨を見る限り誤りの分類を持たず、翻訳・要約・平易化の性能評価だった。要旨のみで確かめたため、件数（22 件）には数えていない
- コミュニティの資料（lint の規則、Wiki のページ）: 調べ始めていたが、調査の範囲を学術の文献に絞ったため捨てた

## 6 単位への当てはめの見立て

ここは自分の判断で、どの資料もこの 6 単位で分類していない。

- 語: [Chakrabarty 2025] の Cliché と Awkward Word Choice、[Kobak 2025] の文体語、[Russell 2025] の Vocabulary、[Shaib 2025] の Word Complexity
- 文: [Chakrabarty 2025] の Poor Sentence Structure、[Reinhart 2025] の名詞化・現在分詞節、[Shaib 2024] の統語テンプレート
- ブロック: [Chakrabarty 2025] の Unnecessary Exposition と Lack of Specificity、[Shaib 2025] の Density・Verbosity、[Bharadwaj 2026] の structure・vagueness
- 節の中: [Russell 2025] の Introductions と Conclusions、[Guo 2023] の「定義 → 詳細 → まとめ」
- 節どうし: [Dou 2022] の Self-Contradiction、[Huang 2025] の Logical inconsistency
- 文書間: [Kobak 2025] と [Paech 2026] の過剰使用、[Herbold 2023] の「結びの書き出しが同一」、[林 2026] のモデル固有フレーズ

[Shaib 2025] の 3 つの Theme（情報の有用性・情報の質・文体の質）と、[Huang 2025] の「何と食い違うか」の軸は、6 単位のどれにも収まらない。
6 単位と直交する第 2 の軸として持つかは、分類を作る側の判断になる。

## AI の出力に特有で、人間の誤りの分類に入りにくい悪さ

人間の誤りの分類は、1 つの箇所を見て誤りと判定できるものを並べる。
次の 5 つは、1 か所を見ても誤りと言えないか、原因が人間の誤りと違うため、その枠に入りにくい。

1. 個々には正しい語句の、分布としての過剰使用
    - 1 語 1 語は誤りでなく、同じ語句が文書や出力をまたいで偏って現れることが悪さになる。判定には基準となる頻度が要る
    - 根拠: [Kobak 2025]（文体語の急増）、[Reinhart 2025]（特定語が人間の 100 倍以上）、[Paech 2026]（1,000 倍以上の型）、[Russell 2025]（AI の語彙の一覧）、[林 2026]（日本語のモデル固有フレーズ）
2. 文書をまたいで繰り返される構文と構成の型
    - 統語テンプレート、「not only … but also」、項目を 3 つ並べる、既に書いたことを要約し直す結び、のような型が、内容と無関係に同じ形で出る
    - 根拠: [Shaib 2024]（テンプレートの 76% が事前学習データ由来で、調整でも消えない）、[Herbold 2023]（結びの書き出しが同一）、[Russell 2025]（Sentence Structure・Conclusions・Introductions）、[Shaib 2025]（Templatedness）
3. 流暢で文法的に正しいのに、情報密度が低い
    - 誤りが無いまま中身が薄い。人間の誤りの分類は誤りに付くので、正しいが空疎な文章を拾いにくい
    - 根拠: [Shaib 2025]（slop 判定に最も効いたのが Relevance と Density）、[Chakrabarty 2025]（Unnecessary Exposition、Lack of Specificity）、[Bharadwaj 2026]（length・vagueness）、[Kommers 2025]（superficial competence）
4. 確信度の表明が中身の確かさと連動しない
    - 不確かなときに冗長さや列挙で埋め、不確かさを言葉にしない。原因は訓練にあり、選好データが不確かさを含む文を嫌い、報酬モデルが長さや曖昧さを報いる
    - 根拠: [Zhang 2025]（Verbosity Compensation）、[Zhou 2024]（不確かさを表明しない・過信）、[Bharadwaj 2026]（報酬モデルとの相関）、[Jiang 2025] と [Herbold 2023]（ヘッジ・認識のマーカーが少ない）
    - 注記: [Jiang 2025] では強調の標識（boosters）も学生より少ない。「根拠のない誇張」は強調の標識の多さではなく、評価語の偏り（上の 1）と、[Huang 2025] の overclaim（根拠の無い主張の内容）として分けて扱うほうが、これらの結果と合う
5. 対話の応答の残留と、利用者への同調
    - 導入の決まり文句（「以下の通りです」）、追加の情報を求める締め（「もしよければ〜教えてください」）、利用者の前提への同調が、文書の中に残る。読み手と書き手が対話している前提の文で、人間の書いた文書には現れにくい
    - 根拠: [林 2026]（モデルごとの導入句と締めの句。査読なし）、[Bharadwaj 2026]（sycophancy）、[Guo 2023]（知識の範囲外の断り。arXiv のみ）

## 参考文献

閲覧日はすべて 2026-09-25。
「読んだ版」は、この調査で実際に開いた版を指す。

### 査読あり

- [Bharadwaj 2026]
    - 著者: Anirudh Bharadwaj, Chaitanya Malaviya, Nitish Joshi, Mark Yatskar
    - 題名: Flattery, Fluff, and Fog: Diagnosing and Mitigating Idiosyncratic Biases in Preference Models
    - 会議: ICLR 2026（arXiv の Comments の記載による）
    - arXiv: 2506.05339（v1〜v3。読んだ版は v3 の HTML 版と書誌ページ）
    - URL: [arXiv:2506.05339](https://arxiv.org/abs/2506.05339)
    - 査読: あり
- [Chakrabarty 2025]
    - 著者: Tuhin Chakrabarty, Philippe Laban, Chien-Sheng Wu
    - 題名: Can AI writing be salvaged? Mitigating Idiosyncrasies and Improving Human-AI Alignment in the Writing Process through Edits
    - 会議: Proceedings of the 2025 CHI Conference on Human Factors in Computing Systems (CHI '25), 2025
    - DOI: 10.1145/3706598.3713559（検索結果の ACM Digital Library の URL による）
    - arXiv: 2409.14509（v1〜v5。読んだ版は v5 の HTML 版）
    - URL: [ACM Digital Library](https://dl.acm.org/doi/full/10.1145/3706598.3713559)、[arXiv:2409.14509](https://arxiv.org/abs/2409.14509)
    - 査読: あり
- [Dou 2022]
    - 著者: Yao Dou, Maxwell Forbes, Rik Koncel-Kedziorski, Noah A. Smith, Yejin Choi
    - 題名: Is GPT-3 Text Indistinguishable from Human Text? Scarecrow: A Framework for Scrutinizing Machine Text
    - 会議: Proceedings of the 60th Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 7250–7274, 2022
    - DOI: 10.18653/v1/2022.acl-long.501
    - arXiv: 2107.01294（v1〜v3。読んだのは ACL Anthology の PDF で、arXiv 版は開いていない）
    - URL: [ACL Anthology 2022.acl-long.501](https://aclanthology.org/2022.acl-long.501/)
    - 査読: あり
- [Herbold 2023]
    - 著者: Steffen Herbold, Annette Hautli-Janisz, Ute Heuer, Zlata Kikteva, Alexander Trautsch
    - 題名: A large-scale comparison of human-written versus ChatGPT-generated essays
    - 論文誌: Scientific Reports, 13, 18617, 2023
    - DOI: 10.1038/s41598-023-45644-9
    - arXiv: 2304.14276（arXiv 版は開いていない）
    - URL: [PMC10616290](https://pmc.ncbi.nlm.nih.gov/articles/PMC10616290/)（読んだのは PMC 版）
    - 査読: あり
- [Huang 2025]
    - 著者: Lei Huang, Weijiang Yu, Weitao Ma, Weihong Zhong, Zhangyin Feng, Haotian Wang, Qianglong Chen, Weihua Peng, Xiaocheng Feng, Bing Qin, Ting Liu
    - 題名: A Survey on Hallucination in Large Language Models: Principles, Taxonomy, Challenges, and Open Questions
    - 論文誌: ACM Transactions on Information Systems, 43(2), 2025（巻号は検索結果による。ACM の版は開いていない）
    - DOI: 10.1145/3703155（検索結果による）
    - arXiv: 2311.05232（v1: 2023-11-09、v2: 2024-11-19。読んだ版は v2 の PDF）
    - URL: [arXiv:2311.05232](https://arxiv.org/abs/2311.05232)
    - 査読: あり
- [Jiang 2025]
    - 著者: Feng (Kevin) Jiang, Ken Hyland
    - 題名: Rhetorical distinctions: Comparing metadiscourse in essays by ChatGPT and students
    - 論文誌: English for Specific Purposes, 79, pp. 17–29, 2025
    - DOI: 10.1016/j.esp.2025.03.001（検索結果の要約による。未照合）
    - URL: [UEA Digital Repository](https://ueaeprints.uea.ac.uk/id/eprint/99123/)（読んだのはここの書誌と要旨だけ）
    - 査読: あり
- [Kobak 2025]
    - 著者: Dmitry Kobak, Rita González-Márquez, Emőke-Ágnes Horvát, Jan Lause
    - 題名: Delving into LLM-assisted writing in biomedical publications through excess vocabulary
    - 論文誌: Science Advances, 11(27), eadt3813, 2025
    - DOI: 10.1126/sciadv.adt3813
    - arXiv: 2406.07016（v1〜v5。読んだ版は v3 の HTML 版）
    - URL: [Science Advances](https://www.science.org/doi/10.1126/sciadv.adt3813)、[arXiv:2406.07016](https://arxiv.org/abs/2406.07016)
    - 査読: あり
- [Kommers 2025]
    - 著者: Cody Kommers, Eamon Duede, Julia Gordon, Ari Holtzman, Tess McNulty, Spencer Stewart, Lindsay Thomas, Richard Jean So, Hoyt Long
    - 題名: Why Slop Matters
    - 論文誌: ACM AI Letters（arXiv の Comments に 2025-12-23 採録と記載。巻号・DOI は未確認）
    - arXiv: 2601.06060（v1: 2025-12-23。読んだ版は v1 の書誌ページ）
    - URL: [arXiv:2601.06060](https://arxiv.org/abs/2601.06060)
    - 査読: あり（採録の記載による）
- [Paech 2026]
    - 著者: Samuel Paech, Allen Roush, Judah Goldfeder, Ravid Shwartz-Ziv
    - 題名: Antislop: A Comprehensive Framework for Identifying and Eliminating Repetitive Patterns in Language Models
    - 会議: International Conference on Learning Representations (ICLR 2026)
    - arXiv: 2510.15061（v1・v2。読んだ版は v2 の書誌ページ）
    - URL: [ICLR 2026 Proceedings](https://proceedings.iclr.cc/paper_files/paper/2026/hash/467746c8e15fbfca34dcf23be9ef9229-Abstract-Conference.html)、[arXiv:2510.15061](https://arxiv.org/abs/2510.15061)
    - 査読: あり
- [Reinhart 2025]
    - 著者: Alex Reinhart, Ben Markey, Michael Laudenbach, Kachatad Pantusen, Ronald Yurko, Gordon Weinberg, David West Brown
    - 題名: Do LLMs write like humans? Variation in grammatical and rhetorical styles
    - 論文誌: Proceedings of the National Academy of Sciences, 122(8), e2422455122, 2025
    - DOI: 10.1073/pnas.2422455122
    - arXiv: 2410.16107（v1: 2024-10-21、v2: 2025-08-21。読んだ版は v2 の HTML 版）
    - URL: [PNAS](https://www.pnas.org/doi/10.1073/pnas.2422455122)、[arXiv:2410.16107](https://arxiv.org/abs/2410.16107)
    - 査読: あり
- [Russell 2025]
    - 著者: Jenna Russell, Marzena Karpinska, Mohit Iyyer
    - 題名: People who frequently use ChatGPT for writing tasks are accurate and robust detectors of AI-generated text
    - 会議: Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 5342–5373, 2025
    - DOI: 10.18653/v1/2025.acl-long.267
    - arXiv: 2501.15654（v1・v2。読んだのは ACL Anthology の PDF）
    - URL: [ACL Anthology 2025.acl-long.267](https://aclanthology.org/2025.acl-long.267/)
    - 査読: あり
- [Shaib 2024]
    - 著者: Chantal Shaib, Yanai Elazar, Junyi Jessy Li, Byron C. Wallace
    - 題名: Detection and Measurement of Syntactic Templates in Generated Text
    - 会議: Proceedings of the 2024 Conference on Empirical Methods in Natural Language Processing, pp. 6416–6431, 2024
    - DOI: 10.18653/v1/2024.emnlp-main.368
    - arXiv: 2407.00211（v1・v2。arXiv 版は開いておらず、読んだのは ACL Anthology の要旨）
    - URL: [ACL Anthology 2024.emnlp-main.368](https://aclanthology.org/2024.emnlp-main.368/)
    - 査読: あり
- [Sun 2025]
    - 著者: Mingjie Sun, Yida Yin, Zhiqiu Xu, J. Zico Kolter, Zhuang Liu
    - 題名: Idiosyncrasies in Large Language Models
    - 会議: Proceedings of the 42nd International Conference on Machine Learning, PMLR 267, pp. 57854–57885, 2025
    - arXiv: 2502.12150（v1・v2。読んだ版は v2 の書誌ページ）
    - URL: [PMLR v267](https://proceedings.mlr.press/v267/sun25z.html)、[プロジェクトページ](https://eric-mingjie.github.io/llm-idiosyncrasies/index.html)
    - 査読: あり
- [Zaitsu 2023]
    - 著者: Wataru Zaitsu, Mingzhe Jin
    - 題名: Distinguishing ChatGPT(-3.5, -4)-generated and human-written papers through Japanese stylometric analysis
    - 論文誌: PLOS ONE, 18(8), 2023
    - DOI: 10.1371/journal.pone.0288453
    - arXiv: 2304.05534（v1〜v3。arXiv 版は開いておらず、読んだのは PMC 版）
    - URL: [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0288453)、[PMC10411719](https://pmc.ncbi.nlm.nih.gov/articles/PMC10411719/)
    - 査読: あり
- [Zaitsu 2025]
    - 著者: Wataru Zaitsu, Mingzhe Jin, Shunichi Ishihara, Satoru Tsuge, Mitsuyuki Inaba
    - 題名: Stylometry can reveal artificial intelligence authorship, but humans struggle: A comparison of human and seven large language models in Japanese
    - 論文誌: PLOS ONE, 20(10), e0335369, 2025
    - DOI: 10.1371/journal.pone.0335369
    - URL: [PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0335369)
    - 査読: あり
- [Zhang 2025]
    - 著者: Yusen Zhang, Sarkar Snigdha Sarathi Das, Rui Zhang
    - 題名: Demystify Verbosity Compensation Behavior of Large Language Models
    - 会議: Proceedings of the 2nd Workshop on Uncertainty-Aware NLP (UncertaiNLP 2025), pp. 160–178, Suzhou, 2025
    - DOI: 10.18653/v1/2025.uncertainlp-main.14
    - arXiv: 2411.07858（題名は「Verbosity ≠ Veracity: Demystify Verbosity Compensation Behavior of Large Language Models」。v1・v2。読んだ版は v2 の HTML 版）
    - URL: [ACL Anthology 2025.uncertainlp-main.14](https://aclanthology.org/2025.uncertainlp-main.14/)
    - 査読: あり（workshop の査読）
- [Zhou 2024]
    - 著者: Kaitlyn Zhou, Jena D. Hwang, Xiang Ren, Maarten Sap
    - 題名: Relying on the Unreliable: The Impact of Language Models' Reluctance to Express Uncertainty
    - 会議: Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pp. 3623–3643, 2024
    - DOI: 10.18653/v1/2024.acl-long.198
    - arXiv: 2401.06730（v1・v2。読んだのは ACL Anthology の要旨）
    - URL: [ACL Anthology 2024.acl-long.198](https://aclanthology.org/2024.acl-long.198/)
    - 査読: あり

### 査読なし・未確定

- [Guo 2023]
    - 著者: Biyang Guo, Xin Zhang, Ziyuan Wang, Minqi Jiang, Jinran Nie, Yuxuan Ding, Jianwei Yue, Yupeng Wu
    - 題名: How Close is ChatGPT to Human Experts? Comparison Corpus, Evaluation, and Detection
    - arXiv: 2301.07597（v1。読んだのは ar5iv の HTML 版）
    - URL: [arXiv:2301.07597](https://arxiv.org/abs/2301.07597)
    - 査読: arXiv のみ（査読のある場での発表は確認できなかった）
- [Russell 2026]
    - 著者: Jenna Russell, Rishanth Rajendhran, Chau Minh Pham, Mohit Iyyer, John Wieting
    - 題名: StoryScope: Investigating idiosyncrasies in AI fiction
    - arXiv: 2604.03136（v1〜v6。読んだ版は v6 の書誌ページ）
    - URL: [arXiv:2604.03136](https://arxiv.org/abs/2604.03136)
    - 査読: arXiv のみ
- [Shaib 2025]
    - 著者: Chantal Shaib, Tuhin Chakrabarty, Diego Garcia-Olano, Byron C. Wallace
    - 題名: Measuring AI "Slop" in Text
    - arXiv: 2509.19163（v1: 2025-09-23、v2: 2026-01-24。読んだ版は v2 の PDF と HTML 版）
    - URL: [arXiv:2509.19163](https://arxiv.org/abs/2509.19163)
    - 査読: 未確定。arXiv v2 のヘッダは「Preprint. Under Review.」。共著者の[業績ページ](https://byronwallace.com/publications)は Proceedings of the Conference on Language Models (COLM), 2026 と記すが、会議の proceedings では確かめていない
- [Terčon 2025]
    - 著者: Luka Terčon, Kaja Dobrovoljc
    - 題名: Linguistic Characteristics of AI-Generated Text: A Survey
    - arXiv: 2510.05136（v1: 2025-10-01。読んだ版は v1 の書誌ページ）
    - URL: [arXiv:2510.05136](https://arxiv.org/abs/2510.05136)
    - 査読: arXiv のみ
- [林 2026]
    - 著者: 林美佐, 相澤彰子
    - 題名: LLM による日本語生成におけるモデル固有表現パターンの分析
    - 会議: 言語処理学会 第 32 回年次大会 発表論文集, B9-17, pp. 4058–4063, 2026 年 3 月
    - URL: [予稿 PDF](https://www.anlp.jp/proceedings/annual_meeting/2026/pdf_dir/B9-17.pdf)
    - 査読: なし（PDF の脚注に「This work is published without peer review」と明記）

### 対象から外した資料

- [Tarumoto 2024]
    - 著者: J-STAGE の英語表記で Kuushu Tarumoto, Koji Hatagai, Rina Miyata, Tomoyuki Kajiwara, Takashi Ninomiya（取得ツールが漢字表記を返さず、日本語の氏名は未確認）
    - 題名: ChatGPT の日本語生成能力の評価
    - 論文誌: 自然言語処理, 31(2), pp. 349–373, 2024
    - DOI: 10.5715/jnlp.31.349
    - URL: [J-STAGE](https://www.jstage.jst.go.jp/article/jnlp/31/2/31_349/_article/-char/ja/)
    - 査読: あり
