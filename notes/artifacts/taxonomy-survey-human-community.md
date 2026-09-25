# 悪文の実務上の分類: コミュニティのプラクティス調査

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

調査日・閲覧日: 2026-09-25。学術文献は対象外。
出典は本文で [資料名] の形で引き、書誌の詳細は末尾の「参考文献」にまとめる。

## 確認の度合いの表記

各項目の末尾に、どう読んで得た内容かを付ける。

- 【原文】: 一次情報の原文そのもの（PDF の紙面、GitHub の raw ファイル、HTML から抜き出した見出しや本文、GitHub API の応答）を自分で読んだ
- 【WebFetch】: 一次情報のページを WebFetch で取得したが、読んだのは要約モデルの出力。一次情報を当たってはいるが、要約の誤りが混ざりうる
- 【二次】: 検索結果の要約から得た
- 【未確認】: 確かめられなかった

WebFetch の要約は、原文に無い分類を作ることがある。[ja-tw] の README を WebFetch で読んだところ、
「Sentence Structure」「Character/Writing」などの 6 分類で規則を束ねて返した。raw の README を読むと、規則は分類の無い
23 件の平らな一覧だった。そのため、分類の段数と名前は、できるかぎり【原文】で確かめた。

## 6 単位への対応の早見表

「○」は規則・観点がある、「△」は少数か間接的、「—」は見当たらない。「機械」は lint が検出する範囲を指す。

| 資料 | 語 | 文 | ブロック | 節の中 | 節どうし | 文書間 |
| --- | --- | --- | --- | --- | --- | --- |
| [公用文2022] | ○ | ○ | △ | ○ | ○ | △ |
| [JTF4.0] | ○ | — | △ | △（見出しの文体） | — | — |
| [JTF-style]（機械） | ○ | △ | — | — | — | — |
| [SmartHR-guide] | ○ | ○ | △ | △ | — | — |
| [SmartHR-preset]（機械） | ○ | ○ | — | — | — | — |
| [ja-tw]（機械） | ○ | ○ | △ | △（文体の混在） | — | — |
| [ai-writing]（機械） | ○ | ○ | △ | △ | — | — |
| [Future-TW] | △ | △ | ○ | ○ | ○ | ○ |
| [Google-style] | ○ | ○ | ○ | ○ | △ | ○ |
| [Google-TW1] | ○ | ○ | ○ | ○ | △ | — |
| [MS-style] | ○ | ○ | ○ | ○ | △ | △ |
| [Vale-docs] と [Vale-Google]（機械） | ○ | ○ | △ | △ | — | — |
| [GitLab-Vale]（機械） | ○ | ○ | △ | △ | — | — |
| [write-good]（機械） | ○ | ○ | — | — | — | — |
| [proselint]（機械） | ○ | ○ | △ | — | — | — |
| [FPLG2011] | ○ | ○ | ○ | ○ | ○ | △ |
| [RedHat-PR] | ○ | ○ | ○ | ○ | ○ | ○ |

表の判定は、各資料の節で挙げた規則・観点から私が割り振ったもの。資料の側が 6 単位で分けているわけではない。

---

## 1. 公用文作成の考え方（文化審議会 建議） [公用文2022]

### 1-1. 所在と保守

- PDF: <https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/93651301_01.pdf>
- 文化審議会の建議。令和 4 年 1 月 7 日。「解説」を付す（表紙）【原文】
- 昭和 26 年の「公用文作成の要領」に代わるものとして、約 70 年ぶりに見直した（前書き、p.(1)）【原文】

### 1-2. 分類の段数と名前

4 段（Ⅰ → 1 → ア → (ア)）。前置きの「基本的な考え方」と、本体の Ⅰ〜Ⅲ からなる（p.(1)〜(8)）【原文】。

- 基本的な考え方（p.(1)〜(2)）
    - 1 公用文作成の在り方: (1) 読み手とのコミュニケーションとして捉える、(2) 文書の目的や種類に応じて考える（表「公用文の分類例」で、法令／告示・通知等／記録・公開資料等／解説・広報等と、想定される読み手を対応させる）
    - 2 読み手に伝わる公用文作成の条件: (1) 正確に書く、(2) 分かりやすく書く、(3) 気持ちに配慮して書く
- Ⅰ 表記の原則（p.(3)〜(5)）: 1 漢字の使い方、2 送り仮名の付け方、3 外来語の表記、4 数字を使う際は、次の点に留意する、5 符号を使う際は、次の点に留意する、6 そのほか、次の点に留意する
- Ⅱ 用語の使い方（p.(5)〜(7)）: 1 法令・公用文に特有の用語は適切に使用し、必要に応じて言い換える、2 専門用語は…、3 外来語は…、4 専門用語や外来語の説明に当たっては…、5 紛らわしい言葉を用いないよう、次の点に留意する、6 文書の目的、媒体に応じた言葉を用いる、7 読み手に違和感や不快感を与えない言葉を使う、8 そのほか
- Ⅲ 伝わる公用文のために（p.(7)〜(8)）: 1 文体の選択に当たっては…、2 標題・見出しの付け方においては…、3 文の書き方においては…、4 文書の構成に当たっては…

Ⅱ-5（p.(5)〜(6)）は、2 段目を読者に起きること、3 段目を語の形で分けている【原文】。

- ア 誤解や混同を避ける: (ア) 同音の言葉による混同を避ける、(イ) 異字同訓の漢字を使い分ける
- イ 曖昧さを避ける: (ア)「から」と「より」を使い分ける、(イ) 程度や時期、期間を表す言葉に注意する、(ウ)「等」「など」の類は、慎重に使う
- ウ 冗長さを避ける: (ア) 表現の重複に留意する、(イ) 回りくどい言い方や不要な繰り返しはしない

### 1-3. 運用しながら直す仕組み

- 建議の中に、改訂の手順や版の管理は書かれていない（読んだのは PDF の 1〜10 枚目、紙面の p.(1)〜(8)）【原文】
- 各省庁の既存ルールや慣用、実態に基づいて留意点をまとめた、と前書きにある（p.(1)）【原文】
- 重大度の段階は無い。文書の種類ごとに、原則からどこまで外れてよいかを変える（例: Ⅰ-5 (2) ア、解説・広報等では「？」「！」を用いてよい）【原文】

### 1-4. 6 単位への対応

- 語: Ⅰ（表記）、Ⅱ（用語）。Ⅰ-6 ク「略語は、元になった用語を示してから用い」（p.(5)）【原文】
- 文: Ⅲ-3 のア〜ス（p.(8)。一文を短くする、主語と述語の関係が分かるようにする、同じ助詞を連続して使わない、係る語と受ける語・指示語と指示される語は近くに置く、係り方で複数の意味に取れないようにする など）【原文】
- ブロック: Ⅲ-3 ウ「三つ以上の情報を並べるときには、箇条書を利用する」、Ⅰ-6 ケ「図表には、分かりやすい位置に標題を付ける」【原文】
- 節の中と節どうし: Ⅲ-2（p.(7)。イ 分量の多い文書では見出しで論点を端的に示す、エ 見出しを追えば全体の内容がつかめる、オ 標題と見出しを呼応させる）、Ⅲ-4（p.(8)。イ 結論は早めに示し、続けて理由や詳細を説明する）【原文】
- 文書間: 基本的な考え方 2 (1) エ「関係法令等を適宜参照できるように、別のページやリンク先に別途示す」（p.(2)）、Ⅲ-4 ウ「通知等は、既存の形式によることを基本とする」（p.(8)）【原文】
- lint による機械検出の区別は無い

## 2. JTF 日本語標準スタイルガイド（翻訳用）第 4.0 版 [JTF4.0]

### 2-1. 所在と保守

- 案内ページ: <https://www.jtf.jp/tips/styleguide>
- PDF: <https://www.jtf.jp/pdf/jtf_style_guide.pdf>
- 一般社団法人 日本翻訳連盟（JTF）翻訳品質委員会。第 4.0 版は 2026 年 7 月 25 日（表紙）【原文】
- 目的は「和訳時の日本語表記を統一するためのガイドライン」。「作文技術」の解説は目的に含めない、と明記している（p.8「JTFスタイルガイドの目的」）【原文】

### 2-2. 分類の段数と名前

3 段（1 → 1.1 → 1.1.1）（p.4〜7 の目次）【原文】。

- 1 基本文型: 1.1 文体（1.1.1 本文、1.1.2 見出し、1.1.3 箇条書き、1.1.4 図表内のテキスト、1.1.5 図表のキャプション）、1.2 句読点の使用
- 2 文字の表記: 2.1 用字、用語、2.2 文字の表記と使い分け、2.3 文字間のスペース
- 3 記号の表記と用途: 3.1 句読点、3.2 記号、3.3 かっこ
- 4 単位の表記: 4.1 単位系、4.2 単位記号の表記、4.3 個別の単位
- 5 分野別の傾向: 5.1〜5.5

冒頭に「『JTF日本語標準スタイルガイド』の12の基本ルール」（p.2〜3）があり、各ルールから該当する節（例: 「2.1.6 カタカナ語の長音」）へ参照している【原文】。

### 2-3. 運用しながら直す仕組み

- 巻末に改訂履歴の表（ページ／見出し／内容）を持つ。第 1.0 版（2012-01-30）から版ごとに変更を記録している（p.45〜）【原文】
- 「時代とともに主流となる表記スタイルが変化する場合は、JTFスタイルガイドを改訂」する、と書いている（p.8）【原文】
- 利用側で、業種の慣習・組織内の規定・JIS と比べて調整してよい。どれを採用しどれを採用しないかを検討して表記基準を定める、としている。記入用の Excel テンプレート「項目別表記スタイル一覧表」を配布している（p.9「JTFスタイルガイドの使い方」「関連文書」）【原文】
- 節の番号が版をまたいで変わっている。第 1.2 版の改訂履歴は「3.1.1 全角文字と半角文字の間」「4.1.1 句点（。）」を挙げる（p.45）が、第 4.0 版では 3.1.1 が「句点（。）」、文字間のスペースは 2.3 にある（p.5）【原文】
- ライセンスは CC BY 4.0。第 3.0 版から（それまでは CC BY-SA 4.0）（p.41〜42「利用許諾」）【原文】

### 2-4. 6 単位への対応

- 語（表記）が大半
- ブロック: 1.1.3 箇条書き、1.1.4 図表内のテキスト、1.1.5 図表のキャプション。いずれも文体の統一の規則【原文】
- 節の中: 1.1.2 見出しの文体【原文】
- 文の組み立て・節どうし・文書間は、目的の外として扱わない（p.8）【原文】

## 3. textlint-rule-preset-JTF-style [JTF-style]

### 3-1. 所在と保守

- <https://github.com/textlint-ja/textlint-rule-preset-JTF-style>
- textlint-ja organization（repo の所在から）【原文】

### 3-2. 分類の段数と名前

- JTF スタイルガイドの「2016年2月22日改訂第2.2版」を元にする（README 冒頭）【原文】
- 規則の ID は、ガイドの節番号と見出しをそのまま使う（例: `1.2.2.ピリオド(.)とカンマ(,)`、`2.2.1.ひらがなと漢字の使い分け`）。分類はガイドの 3 段をそのまま引き継ぐ（README「ルール一覧」「FAQ」）【原文】
- 規則一覧の表の列名は「ページ（v2.1）」【原文】

### 3-3. 運用しながら直す仕組み

- 規則の無効化は、`.textlintrc` で ID に `false` を与える（README「FAQ」）【原文】
- 辞書を使う規則（2.2.1 など）は既定で無効。精度にばらつきがあるため（README「ルール一覧」の 2.2.1 の行に「辞書ベース/デフォルト無効」）【原文】
- 実装できない項目を「不可」「未実装」「チェック項目なし」と表に明記する（例: 1.1.3 箇条書き、4.2.3 スラッシュ）【WebFetch】。「不可(1.2.2参照)」の表記は【原文】

### 3-4. 6 単位への対応

- 機械で扱うのは語（表記・記号・スペース）と、文の句読点
- ガイドの第 4.0 版と節番号がずれているので、ID から今のガイドの節を引けない（2-3 の番号の変化から推論。preset が 4.0 に追従する予定かは【未確認】）

## 4. SmartHR Design System のライティングガイドライン [SmartHR-guide]

### 4-1. 所在と保守

- <https://smarthr.design/products/contents/>
- 株式会社 SmartHR。ページのフッターは「© SmartHR, Inc.」【原文】

### 4-2. 分類の段数と名前

- 最上位（/products/contents/ のナビゲーション）: ライティングガイドラインの使い方、基本的な考え方、用字用語、UIテキスト、エラーメッセージ、ヘルプページ、リリースノート、AI【WebFetch】
- 基本的な考え方の見出し（/products/contents/writing-style/）: 冗長な日本語を避ける、正しい文法表現を使用する、常用漢字表にない読み方は使用しない、平仮名にしたほうが読みやすい漢字は平仮名にする、カタカナ語を用いるときには、まず漢字語での言い換えを検討する、敬語を使いすぎない、同じことを複数の表現で説明しないようにする、社内用語など、一般的でない言葉を使わない【WebFetch】
- 用字用語の下位ページ（/products/contents/idiomatic-usage/）: 索引、漢字とひらがなの使い分け、カタカナ語の表記、数字・数えの表記、記号（括弧、句点、スペースなど）の表記、SmartHRの用語、操作を表す用語、コンポーネントの呼び方、その他類似する用語の使い分け【WebFetch】
- 最上位は「文章の種類（UI テキスト・エラーメッセージ・ヘルプページ）」と「横断の規範（基本的な考え方・用字用語）」を並べている

### 4-3. 運用しながら直す仕組み

- 「ライティングガイドは、絶対に守らないといけない規則ではありません」とする（/products/contents/how-to-use/）。重大度の段階は持たない【WebFetch】
- 用語の追加を、社内 Slack のチャンネルにあるワークフローで提案する（/products/contents/idiomatic-usage/）【WebFetch】
- 版の管理・変更履歴は、読んだページには見当たらない【WebFetch】

### 4-4. 6 単位への対応

- 語（用字用語、社内用語、同じことを複数の表現で説明しない）、文（冗長、文法）が中心【WebFetch】
- UI テキスト・ヘルプページの下位ページまでは読んでいない。ブロックや節に当たる規範の有無は【未確認】

## 5. textlint-rule-preset-smarthr [SmartHR-preset]

### 5-1. 所在と保守

- <https://github.com/kufu/textlint-rule-preset-smarthr>
- GitHub の organization は kufu（SmartHR の旧社名。社名の経緯は【二次】）【原文】（repo の所在から）
- 「SmartHRらしい文書を書くための、textlintルールプリセットを提供します。」（README 冒頭）【原文】

### 5-2. 分類の段数と名前

- 分類は無く、19 件の規則を平らに並べる。用語のゆれは `prh-rules`（辞書）、ほかに `sentence-length`（既定 120 字）、`ja-hiragana-fukushi` など（README「デフォルト設定」）【原文】
- デザインシステムのガイドラインのどの項目を実装したかの対応表は、README の冒頭 80 行には無い【原文】（README の全文は【未確認】）

### 5-3. 運用しながら直す仕組み

- 規則ごとに有効・無効と option を切り替えられる（README「デフォルト設定」）【原文】
- リリースの方針は【未確認】

### 5-4. 6 単位への対応

- 語（表記・用語の辞書・ひらがなにする語）と文（長さ・二重否定・冗長）【原文】

## 6. textlint-rule-preset-ja-technical-writing [ja-tw]

### 6-1. 所在と保守

- <https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing>
- 作者は azu（README「Author」）【原文】
- 「全体的に少し厳しめの設定がデフォルト値」で、文章に合わせて設定値を変える前提（README 冒頭）【原文】

### 6-2. 分類の段数と名前

分類は無く、23 件の規則を平らに並べる（README「ルール一覧」）【原文】。見出しは次のとおり。

1文の長さは100文字以下とする／カンマは1文中に3つまで／読点は1文中に3つまで／連続できる最大の漢字長は6文字まで／漢数字と算用数字を使い分けます／「ですます調」、「である調」を統一します／文末の句点記号として「。」を使います／二重否定は使用しない／ら抜き言葉を使用しない／逆接の接続助詞「が」を連続して使用しない／同じ接続詞を連続して使用しない／同じ助詞を連続して使用しない／UTF8-MAC 濁点を使用しない／不必要な制御文字を使用しない／不必要なゼロ幅スペースを使用しない／感嘆符!！、疑問符?？を使用しない／半角カナを使用しない／弱い日本語表現の利用を使用しない／同一の単語を間違えて連続しているのをチェックする／よくある日本語の誤用をチェックする／冗長な表現をチェックする／入力ミスで発生する不自然なアルファベットをチェックする／対になっていない括弧をチェックする

### 6-3. 運用しながら直す仕組み

- 版の規則を、警告の増減で決めている（README「Semantic Versioning Policy」）【原文】
    - Patch: 各ルールのバグ修正（警告を減らす方向への修正）、ドキュメントの改善、内部的な変更、リリース失敗時の再リリース
    - Minor: 各ルールのバグ修正（警告を増やす方向への修正）、新オプションの追加、既存ルールの非推奨化
    - Major: プリセットへのルールの追加、プリセットからのルールの削除、既存のオプション値の変更
- 安定版は半年ごと（1 月と 7 月）。次期版は `@next` で試せる。次の Major の Issue に CHANGELOG を書きためる（README「Install」「Release Flow」）【原文】
- 例外は、規則の `allow` option と、filter（`textlint-filter-rule-comments`、`textlint-filter-rule-allowlist`）で明示する（README 冒頭）【原文】
- 重大度は textlint 本体の機能で、規則ごとに `"severity"` を `"error"`（既定、終了コード 1）、`"warning"`、`"info"` から選ぶ。`warning` と `info` は終了コード 0。`info` は v15.1.0 から [textlint-config]【WebFetch】

### 6-4. 6 単位への対応（機械検出の範囲）

- 語: 漢字の連続長、半角カナ、誤用、単語の連続、不自然なアルファベット【原文】
- 文: 長さ、読点・カンマの数、二重否定、ら抜き、弱い表現、助詞の連続、逆接の「が」の連続、冗長な表現、括弧の対応、句点【原文】
- ブロック: 「同じ接続詞を連続して使用しない」は隣り合う文を見る [no-doubled-conjunction]【原文】
- 節の中: 「ですます調」「である調」の混在は、本文・見出し・箇条書きをそれぞれ独立して検査する [no-mix-dearu-desumasu]【原文】
- 節どうし・文書間: 規則は無い

## 7. textlint-rule-preset-ai-writing [ai-writing]

### 7-1. 所在と保守

- <https://github.com/textlint-ja/textlint-rule-preset-ai-writing>
- npm のパッケージ名は `@textlint-ja/textlint-rule-preset-ai-writing`【原文】（npm registry の応答）
- 作者は azu【WebFetch】

### 7-2. 分類の段数と名前

- 規則は 5 件: no-ai-list-formatting、no-ai-hype-expressions、no-ai-emphasis-patterns、no-ai-colon-continuation、ai-tech-writing-guideline（README）【WebFetch】
- ai-tech-writing-guideline は、簡潔性・明確性・具体性・一貫性・構造化の 5 観点で改善提案を出す（README の ai-tech-writing-guideline の節）【WebFetch】

### 7-3. 運用しながら直す仕組み

- ai-tech-writing-guideline は `severity: "info"` で提案として出す使い方を README が示す【WebFetch】
- `allows` で文字列・正規表現の例外を指定する【WebFetch】

### 7-4. 6 単位への対応

- 語（誇張語）、文（コロンの使い方）、ブロック（箇条書きの太字の前置き・絵文字）【WebFetch】
- 構造化の観点と `enableDocumentAnalysis` の option が、節の単位の検査かどうかは【未確認】

## 8. フューチャー株式会社 テクニカルライティングガイドライン [Future-TW]

### 8-1. 所在と保守

- 本体: <https://future-architect.github.io/arch-guidelines/documents/forTechnicalWriting/technical_writing_guidelines.html>
- repo: <https://github.com/future-architect/arch-guidelines>
- 公開の告知 [Future-TW告知]: <https://future-architect.github.io/articles/20260819a/> （2026-08-19）
- 社内の有志が作成。対象は設計書・Pull Request の説明・Slack での相談・障害の一次報告 [Future-TW告知]【WebFetch】

### 8-2. 分類の段数と名前

H1 の下に H2 が 11、H3 が 30 余り【WebFetch】。H2 は次のとおり。

メッセージ設計／導入の作法／本論の作法／構造化／簡潔さ／表現の正確性／パターン／アンチパターン／セルフレビュー／レビュー依頼／フィードバック技術

- 告知記事は、これを 設計・執筆・実践応用・品質向上・育成 の 5 段階にまとめている [Future-TW告知]【WebFetch】
- 最上位は、書く工程（設計 → 執筆 → レビュー → 育成）の順
- H3 の例: 「やったことや挙動の羅列は価値が低い」「文章の導入部は情報の非対称性に気をつける」「コミュニケーションで間が空いたときは「文脈」を提供する」「トレードオフを必ず書く」「背景・制約や不採用案も記録する」【WebFetch】

### 8-3. 運用しながら直す仕組み

- 誤りは Pull Request で直すよう告知記事が呼びかけている [Future-TW告知]【WebFetch】
- 版の管理・重大度は、読んだ範囲に無い【WebFetch】
- セルフレビューの観点は 3 つ（H2「セルフレビュー」の H3「自己点検の観点」）: 「新しい示唆があるか？」「過去の経緯と整合性がとれているか？」「読み手にとって「サプライズ」になっていないか？」【WebFetch】

### 8-4. 6 単位への対応

- 節の中・節どうし（導入と本論の作法、結論から述べる PREP、状況から述べる STAR、構造化フォーマットの選び方）が中心【WebFetch】
- 文書間（過去の経緯との整合、間が空いたときに文脈を提供する）【WebFetch】
- 語・文は「用語」「具体例」「簡潔さ」の H3 程度【WebFetch】
- lint との連携は書かれていない【WebFetch】

## 9. Google developer documentation style guide [Google-style]

### 9-1. 所在と保守

- <https://developers.google.com/style>
- Google。保守の体制は明記されていない【WebFetch】

### 9-2. 分類の段数と名前

ナビゲーションは 2 段（区分 → ページ）。各ページの中に H2 以下の見出しがある（/style/highlights の HTML からナビゲーションを抜き出した）【原文】。

- Introduction（About this guide、Highlights、What's new、Philosophy of this guide）
- Key resources（Word list、Product names、Text-formatting summary）
- General principles（Accessibility、Excessive claims、Future features、Global audience、Inclusive language、Jargon、Prescriptive documentation、Third-party content、Timeless documentation、Voice and tone）
- Language and grammar（Abbreviations、Active voice、Anthropomorphism、Articles (a, an, the)、Capitalization、Contractions、Pluralization、Possessives、Prepositions、Present tense、Pronouns、Second person、Sentence structure、Verbs in reference documents）
- Punctuation（Colons … Slashes）
- Formatting and organization（Dates and times、Examples、Figures and other images、Footnotes、Headings and titles、Italics with terms、Lists、Mathematical notation、Notes and other notices、Numbers、Paragraphs、Phone numbers、Procedures、Tables、Units of measurement）
- Linking（Cross-references and linking、Headings as link targets）
- Computer interfaces（API reference code comments、Code in text、Code samples、Command-line syntax、Placeholder formatting、UI elements and interaction）
- HTML and CSS（HTML and semantic tagging、HTML formatting、Markdown versus HTML）
- Names and naming（Example domains and names、Filenames、Trademarks）

### 9-3. 運用しながら直す仕組み

- 優先順位: プロジェクト固有のスタイル → このガイド → 第三者の参考書（綴りは Merriam-Webster、技術以外の文体は Chicago Manual of Style、技術の文体は Microsoft Writing Style Guide）（/style のトップ）【WebFetch】
- 「This guide contains guidelines, not rules. Depart from it when doing so improves your content.」（/style のトップ）【WebFetch】
- 複数の妥当な選択肢のうち、一貫性のために 1 つを選んだ項目がある（/style/philosophy）【WebFetch】
- What's new（/style/whats-new）に、日付ごとの変更の一覧を載せる。例: 2026-07-07「Softened a statement regarding the effect of inconsistent terminology on translation costs.」、2026-04-07「Added guidance about avoiding inconsistent end punctuation in list items.」【WebFetch】
- 変更を誰がどう決めるかは書かれていない（/style/whats-new）【WebFetch】

### 9-4. 6 単位への対応

- 語: Word list、Abbreviations、Jargon、Capitalization
- 文: Active voice、Present tense、Sentence structure、Second person
- ブロック: Lists、Tables、Paragraphs、Procedures、Code samples、Notes and other notices
- 節の中: Headings and titles
- 文書間: Cross-references and linking、Headings as link targets、Timeless documentation（書いた時点に依存する表現）
- 以上の割り振りはページ名からの推定。各ページの本文は読んでいない【原文】（ページ名のみ）
- 機械検出は、Vale の Google 用 package が担う（12 節）

## 10. Google Technical Writing One [Google-TW1]

### 10-1. 所在と保守

- <https://developers.google.com/tech-writing/one>
- Google の研修教材【WebFetch】

### 10-2. 分類の段数と名前

1 段の講座一覧【WebFetch】: Introduction、Just enough grammar (optional)、Words、Active voice、Clear sentences、Short sentences、Lists and tables、Paragraphs、Audience、Documents、Punctuation (optional)、Markdown (optional)、Summary。

語 → 文 → ブロック（Lists and tables、Paragraphs）→ 文書（Documents）の順に単位を上げていく並び。

### 10-3. 運用しながら直す仕組み

教材なので無い。Technical Writing Two の構成は【未確認】。

### 10-4. 6 単位への対応

語・文・ブロック・節の中（Documents）。各講座の本文は読んでいない【未確認】。

## 11. Microsoft Writing Style Guide [MS-style]

### 11-1. 所在と保守

- <https://learn.microsoft.com/en-us/style-guide/welcome/>
- Microsoft。Microsoft Manual of Style の後継（Welcome ページの description）。ページのメタデータにソースの repo（MicrosoftDocs/microsoft-style-guide-pr）がある【WebFetch】

### 11-2. 分類の段数と名前

目次は 2 段（/style-guide/toc.json を取得して上 2 段を出力した）【原文】。最上位は次のとおり。

Microsoft Writing Style Guide（Welcome、What's new）／Microsoft's brand voice: above all, simple and human／Top 10 tips for Microsoft style and voice／Checklists／A–Z word list and term collections／Accessibility guidelines and requirements／Acronyms／Bias-free communication／Capitalization／Chatbots and virtual agents／Content planning／Design planning／Developer content／Final publishing review／Global communications／Grammar and parts of speech／Numbers／Procedures and instructions／Punctuation／Responsive content／Scannable content／Search and writing／Text formatting／URLs and web addresses／Word choice

2 段目の例【原文】:

- Checklists: Acronyms checklist、Capitalization checklist、Grammar and parts of speech checklist、Numbers checklist、Procedures and instructions checklist、Punctuation checklist、Responsive content checklist、Text-formatting checklist、Word choice checklist
- Grammar and parts of speech: Verbs、Person、Nouns and pronouns、Words ending in -ing、Prepositions、Dangling and misplaced modifiers
- Scannable content: Headings、Lists、Pull quotes、Sidebars、Tables
- Word choice: Use contractions、Use simple words, concise sentences、Don't use common words in new ways、Use technical terms carefully、Avoid jargon、Use US spelling and avoid non-English words

最上位は項目名のアルファベット順に近い並びで、階層としての意味づけは薄い。本文の規範を、項目ごとの Checklists に抜き出して別に置いている。

### 11-3. 運用しながら直す仕組み

- What's new のページがある（toc.json）【原文】。中身は【未確認】
- Final publishing review（/style-guide/final-publishing-review）に、公開前の見直し手順がある。例: 「Read only the headings, and then only the first sentence of every paragraph. Do they tell a story? Are there gaps? Repeated ideas?」「Search for and remove unnecessary and redundant elements. Try removing words, sentences, paragraphs, headings, even entire sections.」【WebFetch】（本文がほぼ逐語で返った）
- 重大度の段階は無い（読んだページの範囲）【WebFetch】

### 11-4. 6 単位への対応

- 語: Word choice、A–Z word list、Acronyms、Capitalization
- 文: Grammar and parts of speech（Dangling and misplaced modifiers を含む）
- ブロック: Scannable content の Lists・Tables、Procedures and instructions
- 節の中・節どうし: Scannable content の Headings、Content planning、Final publishing review の「見出しと段落の第 1 文だけを読む」
- 文書間: URLs and web addresses、Search and writing
- 割り振りはページ名からの推定【原文】（ページ名のみ）

## 12. Vale と、Google 用の style package [Vale-docs] [Vale-Google]

### 12-1. 所在と保守

- 文書: <https://docs.vale.sh/topics/styles/> 、 <https://docs.vale.sh/topics/.vale.ini.md>
- 本体: <https://github.com/errata-ai/vale>
- Google 用 package: <https://github.com/errata-ai/Google>
- errata-ai（Vale の開発元の organization）【原文】（repo の所在から）

### 12-2. 分類の段数と名前

- style（ディレクトリ）→ rule（YAML ファイル 1 つ）の 2 段。`Microsoft.HeadingPunctuation` のように style 名と rule 名をドットでつなぐ [Vale-docs]（topics/styles）【WebFetch】
- rule は、検出方式の型（extension point）を 1 つ継承する。型は 12: existence、substitution、occurrence、repetition、consistency、conditional、capitalization、metric、readability、spelling、sequence、script [Vale-docs]（topics/styles）【WebFetch】
- Google 用 package の rule は平らな一覧（`Google/` ディレクトリに AMPM.yml、Acronyms.yml、…、Passive.yml、…、Will.yml、WordList.yml など 30 余り）。rule ごとに、元になった style guide のページへの `link` を持つ（例: Passive.yml は `link: 'https://developers.google.com/style/voice'`）[Vale-Google]【原文】
- 分類の軸は「何を検出するか」ではなく「どう検出するか（型）」

### 12-3. 運用しながら直す仕組み

- rule ごとに `level` を `suggestion`・`warning`・`error` から選ぶ。非ゼロの終了コードになるのは error だけ [Vale-docs]（topics/styles）【WebFetch】。Passive.yml は `level: suggestion`、Headings.yml は `level: warning` [Vale-Google]【原文】
- `.vale.ini` で、rule ごとに `YES`／`NO` で有効・無効を切り替え、`Style.Rule = error` のように level を上書きする。level の上書きはファイル形式の節ごとに効くので、同じ rule を Markdown では error、HTML では warning にできる [Vale-docs]（topics/.vale.ini）【WebFetch】
- `MinAlertLevel` で、報告する最低の level を決める [Vale-docs]（topics/.vale.ini）【WebFetch】
- `Packages` と `vale sync` で、外部の style を取り込む [Vale-docs]（topics/.vale.ini）【WebFetch】
- Google 用 package の Headings.yml には、Microsoft 用の rule から写したときの違いを注記したコメントがある [Vale-Google]【原文】

### 12-4. 6 単位への対応（機械検出の範囲）

- 語・文が中心（existence・substitution で語、occurrence・sequence で文）[Vale-docs]【WebFetch】
- rule に `scope: heading` を指定して、見出しだけを検査できる（Headings.yml）[Vale-Google]【原文】。ほかにどの scope（段落・箇条書き・表など）があるかは【未確認】
- consistency（使い方の不統一）が文書の範囲か複数ファイルの範囲かは、WebFetch の要約が「across files」と返しただけで【未確認】

## 13. GitLab の Vale 運用 [GitLab-Vale]

### 13-1. 所在と保守

- <https://docs.gitlab.com/development/documentation/testing/vale/>
- GitLab。担当チームの記述は【未確認】

### 13-2. 分類の段数と名前

- style は 2 つ。新しい rule の大半は `gitlab_base` に置き、docs.gitlab.com に公開する文書にだけ当てる rule は `gitlab_docs` に置く【WebFetch】

### 13-3. 運用しながら直す仕組み

level ごとに、何に使い、どこに出すかを決めている【WebFetch】。

- Error: ブランドと商標のガイドライン、サイトで正しく描画されなくなるもの。CI を失敗させる
- Warning: 一般的なスタイルガイドの規則、原則、ベストプラクティス。merge request の差分に出るが、pipeline は失敗させない
- Suggestion: 書き直しを要しうる、テクニカルライティングの好み。手元のエディタにだけ出る

rule の追加の手順【WebFetch】。

- error の rule を足すときは、先に文書中の既存の該当箇所を直してから足す
- warning や suggestion を足すときは、増える件数と、規則が主観的すぎないかを検討する
- 本文中での無効化は `<!-- vale gitlab_<type>.rulename = NO -->` か `<!-- vale off -->`

### 13-4. 6 単位への対応

語・文が中心。描画の崩れを error にしているので、ブロック（表・箇条書きの書式）の一部も機械で見ている【WebFetch】。rule の一覧は読んでいない【未確認】。

## 14. write-good [write-good]

### 14-1. 所在と保守

- <https://github.com/btford/write-good>
- 作者は btford（repo の所在から）【原文】。保守の状況の明記は無い【WebFetch】。最後の commit は 2025-03-10【原文】（GitHub API）

### 14-2. 分類の段数と名前

- 「Naive linter for English prose」と名乗る（README 冒頭）【WebFetch】
- 検査は 9 件の平らな一覧: passive、illusion（語の重複）、so（文頭の so）、thereIs（文頭の there is/are）、weasel、adverb、tooWordy、cliches、eprime（既定で無効）（README「Checks」）【WebFetch】

### 14-3. 運用しながら直す仕組み

- 検査ごとに有効・無効を切り替える（CLI の `--no-[checkname]`、`--yes-eprime`）【WebFetch】
- 重大度の段階は無い【WebFetch】

### 14-4. 6 単位への対応

語と文だけ【WebFetch】。

## 15. proselint [proselint]

### 15-1. 所在と保守

- <https://github.com/amperser/proselint>
- amperser（repo の所在から）【原文】。保守者の明記は無い【WebFetch】
- Bryan Garner、George Orwell、Strunk & White などの編集者・作家の助言を集めた、と説明する（README）【WebFetch】

### 15-2. 分類の段数と名前

- 検査の ID をドットでつないだ 1〜2 段（`module.submodule`）。例: `industrial_language.airlinese`、`spelling.able_ible`、`typography.symbols`、`misc.metadiscourse`、`redundancy.ras_syndrome`（README の checks の表）【WebFetch】
- 最上位の module の例: annotations、archaism、cliches、dates_times、hedging、industrial_language、lexical_illusions、malapropisms、misc、mixed_metaphors、redundancy、restricted、social_awareness、spelling、terms、typography、uncomparables、weasel_words【WebFetch】
- `misc` の下に 20 件余りの雑多な検査が入っている【WebFetch】

### 15-3. 運用しながら直す仕組み

- 有効・無効を、階層のどの段でも指定できる。`typography` を有効にすると下位がすべて有効になり、`typography.symbols` だけを無効にすることもできる【WebFetch】
- ファイルの glob ごとに別の検査の組を当てられる【WebFetch】

### 15-4. 6 単位への対応

- 語が大半（spelling、terms、cliches、jargon の類）【WebFetch】
- 文: redundancy、hedging、uncomparables など【WebFetch】
- ブロック: `misc.but`（段落を But で始めない）【WebFetch】
- `misc.metadiscourse`（議論についての議論を避ける）は、文と節のどちらの範囲を見るか【未確認】

## 16. Federal Plain Language Guidelines（2011 年 3 月、Revision 1 2011 年 5 月） [FPLG2011]

### 16-1. 所在と保守

- 旧 plainlanguage.gov の目次（UNT の Web アーカイブ、2012-10-06 の取得）: <https://webarchive.library.unt.edu/web/20121006190813mp_/http:/www.plainlanguage.gov/howto/guidelines/FederalPLGuidelines/TOC.cfm>
- PDF の写し: <https://wid.org/wp-content/uploads/2022/03/FederalPLGuidelines.pdf> 【二次】（検索結果に出たが開いていない）
- 現在の plainlanguage.gov は digital.gov（米国 GSA）の後継ページへ転送される [digital.gov-PL]【原文】（HTTP 301 の応答）。後継の構成は Principles of plain language／Writing for understanding／Design for understanding／Test for understanding の 4 区分 [digital.gov-PL]【WebFetch】
- 作成したのは PLAIN（Plain Language Action and Information Network）【未確認】（記憶による。今回の資料では確かめていない）

### 16-2. 分類の段数と名前

最大 4 段（IV → a → 1 → i）（アーカイブの目次。見出しがほぼ逐語で返った）【WebFetch】。

- I. Introduction
- II. Think about your audience
- III. Organize: a. Organize to meet your readers' needs、b. Address one person, not a group、c. Use lots of useful headings、d. Write short sections
- IV. Write your document
    - a. Words
        - (1) Verbs: Use active voice、Use the simplest form of a verb、Avoid hidden verbs、Use "must" to indicate requirements、Use contractions when appropriate
        - (2) Nouns and pronouns: Don't turn verbs into nouns、Use pronouns to speak directly to readers、Minimize abbreviations
        - (3) Other word issues: Use short, simple words、Omit unnecessary words、Dealing with definitions、Use the same term consistently for a specific thought or object、Avoid legal, foreign, and technical jargon、Don't use slashes
    - b. Sentences: Write short sentences、Keep subject, verb, and object close together、Avoid double negatives and exceptions to exceptions、Place the main idea before exceptions and conditions、Place words carefully
    - c. Paragraphs: Have a topic sentence、Use transition words、Write short paragraphs、Cover only one topic in each paragraph
    - d. Other aids to clarity: Use examples、Use lists、Use tables…、Consider using illustrations、Use emphasis…、Minimize cross-references、Design your document for easy reading
- V. Write for the web
- VI. Test: Paraphrase Testing、Usability Testing、Controlled Comparative Studies、Testing Successes

IV の 2 段目は Words／Sentences／Paragraphs／Other aids to clarity で、範囲の単位による分け方に最も近い。Words の下は品詞（Verbs、Nouns and pronouns）で分けている。

### 16-3. 運用しながら直す仕組み

- 版は 2011 年 3 月版と Revision 1（2011 年 5 月）【二次】（PDF の題名が検索結果に出たもの）
- 規則の足し方・重大度は【未確認】
- VI. Test で、書いた文書を読者で試す方法（言い換えテスト、ユーザビリティテスト）を持つ【WebFetch】

### 16-4. 6 単位への対応

- 語: IV-a
- 文: IV-b
- ブロック: IV-c（段落）、IV-d（例・箇条書き・表・図）
- 節の中: III-c・d（見出し、短い節）、IV-c-4「Cover only one topic in each paragraph」
- 節どうし: III-a（読者の必要に合わせて構成する）
- 文書間: IV-d-6「Minimize cross-references」
- lint は伴わない

## 17. Red Hat peer review guide for technical documentation [RedHat-PR]

### 17-1. 所在と保守

- <https://redhat-documentation.github.io/peer-review/>
- repo: <https://github.com/redhat-documentation/peer-review>
- Red Hat の Customer Content Services（CCS）が作成【二次】（検索結果の要約。本文には「CCS supplementary style guide」の語がある【原文】）
- 規範の出典として IBM Style、Red Hat supplementary style guide for product documentation、Merriam-Webster Dictionary を挙げる（「Peer review checklists」の冒頭）【原文】

### 17-2. 分類の段数と名前

3 段（checklist → 観点 → 確認項目）（「Peer review checklists」の Table 1〜5。HTML から本文を抜き出した）【原文】。

- Language（Table 1）: Spelling errors and typos／Grammar／Correct word usage and entity naming／Correct use of acronyms and abbreviations／Terms and constructions
- Style（Table 2）: Passive voice／Tense／Titles／Number／Formatting
- Minimalism（Table 3）: Customer focus and action orientation／Scannability/Findability／Sentences／Conciseness (no fluff)
- Structure（Table 4）: Structure meets modular guidelines／A logical flow of information／User stories
- Usability（Table 5）: Content／Accessibility／Links／Visual continuity

確認項目の例【原文】:

- 「Named entities are classified on first use.」「Acronyms are expanded on first use.」（Table 1）
- 「Use of problematic terms such as should or may are avoided.」（Table 1）
- 「Module types are not mixed, for example, concept and procedure information is separate.」（Table 4）
- 「Information is presented in the most logical order and location.」「Cross-references are used appropriately and only when useful.」（Table 4）
- 「Modules are as self-contained as possible to facilitate reuse in other locations.」（Table 4）

### 17-3. 運用しながら直す仕組み

- 「adapt the checklists to meet the needs of your team」。チームごとに調整する前提（「Peer review checklists」の冒頭）【原文】
- 指摘に 2 段階の重大度と範囲外を置く（「Providing peer review feedback」と Table 6）【原文】
    - In scope - required: 直してからでないと merge できない。スタイルガイドか原則を根拠に添える（誤字、文法、書式、modular docs のテンプレートへの準拠）
    - In scope - suggested: 直さなくても merge できる。表現を和らげるか `[SUGGESTION]` の札を付ける（言い回しの改善、内容の移動、文体の好み）
    - Out of scope: PR で変えていない部分への指摘など
- 指摘の根拠: 「Support your comments. Use documented resources…」「Explain the impact of the issue on the audience.」「If you cannot find documented support, rethink the need for the comment.」（「Providing peer review feedback」）【原文】
- 繰り返す誤り: 「If you notice a recurring issue, leave a global comment」。`[GLOBAL]` の札で、ほかの箇所にもある誤りをまとめて 1 回指摘する（同上）【原文】
- 規範の更新: 書き手と意見が割れ、その論点がどのガイドにも無いときは、チームで議論する。「In some cases, the guidelines might need to be updated.」（同上）【原文】
- 技術的な正しさは peer review の範囲外（SME と QE が担う）と明記する（同上）【原文】

### 17-4. 6 単位への対応

- 語: Language 全体
- 文: Style（受動態・時制）、Minimalism の Sentences
- ブロック: Scannability（箇条書きと表）、Conciseness の「Admonitions are used only when necessary」
- 節の中: Structure の「Module types are not mixed」
- 節どうし: Structure の「A logical flow of information」
- 文書間: Structure の「Modules are as self-contained as possible…」、Usability の Links、「Product versioning and release dates are accurate」
- lint は伴わない。人のレビューの観点だけ

---

## 分類の階層を作って運用するうえで参考になる点

### 1. 上位を「読者に起きること」、細分類を「語の形」で切る形は、公用文に前例がある

[公用文2022] の Ⅱ-5（p.(5)〜(6)）は、2 段目を「誤解や混同を避ける」「曖昧さを避ける」「冗長さを避ける」と読者に起きることで分け、
3 段目を「同音の言葉」「『から』と『より』」「『等』『など』」と語の形で分けている（1-2 節）。
構想している「読者が、その名詞が何を指すかを判断できない」（上位）の下に「汎用語・未定義語・指示語」（細分類）を置く形と同じ作りになっている。

ほかの資料では、細分類に当たる項目が形で分かれたまま並んでいる。[FPLG2011] の IV-a-2・3「Minimize abbreviations」
「Dealing with definitions」「Use the same term consistently…」（16-2 節）、[RedHat-PR] の Table 1「Named entities are classified on first use」
「Acronyms are expanded on first use」（17-2 節）、[公用文2022] の Ⅰ-6 ク（略語）と Ⅲ-3 サ（指示語は近くに置く）がその例。
これらは、読者に起きることの上位の下へ細分類として集められる。

### 2. 分類の ID を表示の番号にしない。ドットでつないだ意味のある名前にし、どの段でも有効・無効を切り替えられるようにする

[JTF-style] は、JTF スタイルガイド第 2.2 版の節番号を規則の ID に使っている（3-2 節）。
[JTF4.0] は第 4.0 版までに節の番号を振り直しており、同じ番号が別の規則を指すようになった（2-3 節）。
[proselint] は `industrial_language.airlinese` のように意味のある名前をドットでつなぎ、上位を有効にすれば下位がすべて有効になる（15-3 節）。
分類を育てる途中で並べ替え・分割が起きても、事例に付けた分類の名前がずれない形にしておく。

### 3. 分類と重大度は別の軸で持ち、重大度の段ごとに「何に使うか」と「どこで止めるか」を決める

textlint は規則ごとに error／warning／info を選び [textlint-config]（6-3 節）、Vale は suggestion／warning／error を選ぶ。
Vale は同じ規則の段を文書の形式ごとに変えられる [Vale-docs]（12-3 節）。
[GitLab-Vale] は段ごとに用途を決めている。error は描画の崩れとブランドだけで CI を止め、warning は一般の規則で差分に出すだけ、
suggestion は主観の入る好みで手元にだけ出す（13-3 節）。[RedHat-PR] は人のレビューで required と suggested を分け、
suggested には `[SUGGESTION]` の札を付ける（17-3 節）。事例に付ける分類とは別に、「直さないと先へ進めないか」の欄を持つと、
分類を変えずに扱いの強さだけを調整できる。

### 4. 分類の変更を「既存の事例の分類が変わるか」で区別して記録する

[ja-tw] は、版の上げ方を警告の増減で決めている。警告を減らす修正は Patch、増やす修正は Minor、
規則の追加・削除と既定値の変更は Major（6-3 節）。[JTF4.0] は改訂履歴を「ページ／見出し／内容」の表で版ごとに残す（2-3 節）。
[Google-style] は What's new に日付ごとの変更を 1 行ずつ載せる（9-3 節）。分類を育てるときも、分類の追加・分割・統合のうち
既存の事例に付けた分類を付け替える必要が出るものを、それ以外の変更と分けて記録しておくと、付け替えの漏れを追える。

### 5. 節どうし・文書間の誤りは lint では拾えない。人のレビューの観点として別に持ち、繰り返しと規範の欠けを拾う仕組みを付ける

lint が機械で見るのは語と文で、広くても隣り合う文（同じ接続詞の連続）と、本文・見出し・箇条書きごとの文体の混在まで（6-4 節、12-4 節）。
節どうしと文書間の観点は、人のレビューの資料にだけある。[RedHat-PR] の Table 4「Module types are not mixed」
「Information is presented in the most logical order and location」「Modules are as self-contained as possible…」（17-2 節）、
[MS-style] の Final publishing review「Read only the headings, and then only the first sentence of every paragraph」（11-3 節）、
[Future-TW] の「過去の経緯と整合性がとれているか？」（8-3 節）がその例。

運用の仕組みでは、[RedHat-PR] の「Providing peer review feedback」にある 3 つが参考になる。同じ誤りが繰り返すときは `[GLOBAL]` で 1 回だけ指摘する。
根拠となる規範が見つからない指摘は出す必要を考え直す。意見が割れた論点がどのガイドにも無ければ、ガイドの更新を検討する（17-3 節）。
3 つ目は、事例から分類を育てる入口として使える。

---

## 参考文献

閲覧日はすべて 2026-09-25。GitHub の repo は、閲覧日に GitHub API で取得した既定ブランチの先頭 commit と最新 release を書く【原文】。
「最終更新」はページ自身の表示による。書いていない項目は確かめられなかったもの。

### 日本語の指針・スタイルガイド

- [公用文2022] 文化審議会「公用文作成の考え方（建議）」（付）「公用文作成の考え方（文化審議会建議）」解説。令和 4 年（2022 年）1 月 7 日。
  <https://www.bunka.go.jp/seisaku/bunkashingikai/kokugo/hokoku/pdf/93651301_01.pdf>
  ライセンス: 【未確認】。引いた箇所: 基本的な考え方、Ⅰ〜Ⅲ（紙面 p.(1)〜(8)）
- [JTF4.0] 一般社団法人 日本翻訳連盟（JTF）翻訳品質委員会『JTF日本語標準スタイルガイド（翻訳用）』第 4.0 版、2026 年 7 月 25 日。
  <https://www.jtf.jp/pdf/jtf_style_guide.pdf> （案内ページ <https://www.jtf.jp/tips/styleguide> ）
  ライセンス: CC BY 4.0（p.41「利用許諾」）。引いた箇所: 12 の基本ルール（p.2〜3）、目次（p.4〜7）、はじめに（p.8〜9）、改訂履歴（p.45〜）
- [SmartHR-guide] 株式会社 SmartHR「ライティング」（SmartHR Design System）。
  <https://smarthr.design/products/contents/>
  引いたページ: /products/contents/how-to-use/、/products/contents/writing-style/、/products/contents/idiomatic-usage/。
  著作権表示: © SmartHR, Inc.。最終更新日とライセンス: 【未確認】
- [Future-TW] フューチャー株式会社（社内有志）「テクニカルライティングガイドライン」（arch-guidelines）。
  <https://future-architect.github.io/arch-guidelines/documents/forTechnicalWriting/technical_writing_guidelines.html>
  repo: <https://github.com/future-architect/arch-guidelines> 。commit 9d387e19c313b304db103cee5ba53424ea3c1651（2026-09-17）。release なし。
  ライセンス: CC BY 4.0（repo の license 表示）。引いた箇所: H2・H3 の見出し、H2「セルフレビュー」
- [Future-TW告知] フューチャー技術ブログ「テクニカルライティングガイドラインを公開しました」、2026-08-19。
  <https://future-architect.github.io/articles/20260819a/>

### 日本語の lint

- [ja-tw] textlint-ja（作者 azu）「textlint-rule-preset-ja-technical-writing」。
  <https://github.com/textlint-ja/textlint-rule-preset-ja-technical-writing>
  最新 release v12.0.2（2025-01-02、npm の最新版も 12.0.2）。既定ブランチ master の commit 5e73caaf8700db90408bb133b0d792aaea4337d6（2026-03-01）。
  ライセンス: MIT。引いた箇所: README の冒頭、「ルール一覧」、「Semantic Versioning Policy」、「Release Flow」
- [no-mix-dearu-desumasu] textlint-ja「textlint-rule-no-mix-dearu-desumasu」。
  <https://github.com/textlint-ja/textlint-rule-no-mix-dearu-desumasu>
  最新 release v6.0.4（2025-01-16）。commit 86a115aa0cb4c927066adbafe0dcef6fc8c9dc9e（2026-01-22）。ライセンス: MIT。引いた箇所: README 冒頭
- [no-doubled-conjunction] textlint-ja「textlint-rule-no-doubled-conjunction」。
  <https://github.com/textlint-ja/textlint-rule-no-doubled-conjunction>
  最新 release v3.0.1（2026-05-30）。commit 4e39bdb6ae24cda682e7bccc64cb9bb5f7752961（2026-05-30）。ライセンス: MIT。引いた箇所: README 冒頭と Example
- [JTF-style] textlint-ja「textlint-rule-preset-JTF-style」。
  <https://github.com/textlint-ja/textlint-rule-preset-JTF-style>
  最新 release v3.0.3（2025-09-25、npm の最新版も 3.0.3）。commit 2186273a276e5c0acf60fa359f21c537d61730f1（2025-11-18）。
  ライセンス: MIT。引いた箇所: README 冒頭、「ルール一覧」（規則 ID `1.2.2.ピリオド(.)とカンマ(,)`、`2.2.1.ひらがなと漢字の使い分け`）、「FAQ」
- [ai-writing] textlint-ja（作者 azu）「textlint-rule-preset-ai-writing」（npm: @textlint-ja/textlint-rule-preset-ai-writing）。
  <https://github.com/textlint-ja/textlint-rule-preset-ai-writing>
  最新 release v1.7.0（2026-05-13）。既定ブランチ main の commit 45bb6485062b96a8578c5fa6ae37a41de01d9b80（2026-05-13）。
  ライセンス: MIT。引いた箇所: README の規則一覧と ai-tech-writing-guideline の節
- [SmartHR-preset] kufu（株式会社 SmartHR）「textlint-rule-preset-smarthr」。
  <https://github.com/kufu/textlint-rule-preset-smarthr>
  最新 release v1.38.1（2026-09-08、npm の最新版も 1.38.1）。commit d8e9e01ed9601a34cd83a418ca54ba18f49fc8da（2026-09-25）。
  ライセンス: MIT。引いた箇所: README の冒頭と「デフォルト設定」
- [textlint-config] textlint「Configuring textlint」。
  <https://textlint.org/docs/configuring/>
  本体 repo <https://github.com/textlint/textlint> 。最新 release v15.8.0（2026-08-01）。commit 7f19cbd39edf9d4f8838410a27934ecad64f0d53（2026-09-23）。
  ライセンス: MIT（repo）。引いた箇所: rule の severity、無効化、preset の設定

### 英語のスタイルガイド・指針

- [Google-style] Google「Google developer documentation style guide」。
  <https://developers.google.com/style>
  最終更新: トップ 2026-04-27、Highlights 2025-04-02、What's new 2026-07-07。
  ライセンス: CC BY 4.0（コードサンプルは Apache 2.0）（ページのフッター）。
  引いたページ: /style（トップ）、/style/highlights（ナビゲーション）、/style/philosophy、/style/whats-new
- [Google-TW1] Google「Technical Writing One」。
  <https://developers.google.com/tech-writing/one>
  最終更新: 2025-03-28。ライセンス: CC BY 4.0（コードサンプルは Apache 2.0）（ページのフッター）
- [MS-style] Microsoft「Microsoft Writing Style Guide」。
  <https://learn.microsoft.com/en-us/style-guide/welcome/>
  目次: <https://learn.microsoft.com/en-us/style-guide/toc.json> 。ページのメタデータ: updated_at 2026-07-06、git_commit_id db2315b7bd53a2022e3e2d33f05a4ff7f847ba0a（MicrosoftDocs/microsoft-style-guide-pr）。
  著作権表示: © 2024 Microsoft. All rights reserved.（Welcome ページ）。
  引いたページ: toc.json（目次の上 2 段）、/style-guide/final-publishing-review
- [FPLG2011] Federal Plain Language Guidelines、March 2011、Revision 1 May 2011。
  UNT Web アーカイブ（2012-10-06 取得）: <https://webarchive.library.unt.edu/web/20121006190813mp_/http:/www.plainlanguage.gov/howto/guidelines/FederalPLGuidelines/TOC.cfm>
  作成者: PLAIN（Plain Language Action and Information Network）【未確認】。ライセンス: 【未確認】。引いた箇所: 目次（I〜VI）
- [digital.gov-PL] Digital.gov（米国 GSA）「Plain language guide series」。
  <https://digital.gov/guides/plain-language> （旧 <https://www.plainlanguage.gov/guidelines/> から転送）。最終更新とライセンス: 【未確認】
- [RedHat-PR] Red Hat Customer Content Services「Red Hat peer review guide for technical documentation」。
  <https://redhat-documentation.github.io/peer-review/>
  repo: <https://github.com/redhat-documentation/peer-review> 。commit 3b9e73cd66b7da3a1a6e84b5d8ef756618dc5eaf（2023-06-22）。release なし。
  ページの表示「Last updated 2023-06-19」【WebFetch】。ライセンス: CC BY-SA 4.0（repo の license 表示）。
  引いた箇所: 「Peer review checklists」（Table 1〜5）、「Providing peer review feedback」、「Scope examples」（Table 6）

### 英語の lint

- [Vale-docs] errata-ai「Vale documentation」。
  <https://docs.vale.sh/topics/styles/> 、 <https://docs.vale.sh/topics/.vale.ini.md>
  本体 repo <https://github.com/errata-ai/vale> 。最新 release v3.22.0（2026-09-17）。既定ブランチ v3 の commit 2753160f8e5835976340183ddc4a91ed10b7d3ed（2026-09-25）。
  ライセンス: MIT（本体 repo）。文書のライセンス: 【未確認】
- [Vale-Google] errata-ai「Google」（Vale 用の style package）。
  <https://github.com/errata-ai/Google>
  最新 release v0.7.1（2026-08-04）。commit c3f52a84c24aadf48a0806d091244f982c38b149（2026-08-26）。
  ライセンス: MIT。引いた rule: `Google.Passive`（Google/Passive.yml）、`Google.Headings`（Google/Headings.yml）と `Google/` のファイル一覧
- [GitLab-Vale] GitLab「Vale documentation tests」（GitLab Docs の development/documentation/testing/vale）。
  <https://docs.gitlab.com/development/documentation/testing/vale/>
  ページの Last-Modified ヘッダ: 2026-09-25。ライセンス: CC BY-SA 4.0（ページのフッター）
- [write-good] Brian Ford（btford）「write-good」。
  <https://github.com/btford/write-good>
  npm の最新版 1.0.8。commit 6940b034c6f5a7e101c01a24d651a778fc3fe435（2025-03-10）。release なし。ライセンス: MIT。引いた箇所: README の checks の一覧
- [proselint] amperser「proselint」。
  <https://github.com/amperser/proselint>
  最新 release v0.16.0（2025-11-14、PyPI の最新版も 0.16.0）。既定ブランチ main の commit dbed789caae662d06c7c8a5a13dd31f1acd36f5c（2026-06-22）。
  ライセンス: BSD-3-Clause。引いた箇所: README の checks の表（検査 ID）と設定
