# 定義せずに作った呼び名を止める仕組み（外の実践）

2026-09-01 に調べた。起点は「書き手が短い呼び名を作り、合意された用語のように使い、
圧縮した自覚も無い」という失敗で、これが繰り返し起きている。

問いは 2 つ。この現象に名前はあるか。事後の検証ではなく、書く前・書く最中に効く仕組みはあるか。

調査は subagent 6 本（制限言語と用語管理 / 法律起草と仕様記法 /
スタイルガイドと plain language と心理学 / ドキュメントツールチェーン / 日本語圏の実務 / 親）で分担した。

## 結論

**この複合体を指す確立した名前は無い。** 隣接する概念には名前がある。

**書き手の判断に頼る事前の指示は、この失敗には効かない。** 書き手が自分の圧縮を
検出できないことが実験で示されており、しかも自己評価の誤りが自分の推定レンジの外に出る。
効くのは判断そのものを消す仕組みか、検査を受け手へ移す仕組みになる。

## 名前

### 最も近いもの

**Writer-Based prose** の **code words**。Linda Flower, *College English* 41(1), 1979,
pp.19-37, doi:10.2307/376357。逐語。

> the writer may depend on code words to carry his or her meaning.
> That is, the language may be "saturated with sense" and able to evoke-for the writer-a
> complex but unexpressed context.

「書き手にとってだけ意味が飽和している語」という記述で、今回の失敗そのものを指している。
作文教育で定着した語。

### 機序に付いている名前

**inner speech の省略性**（Vygotsky, *Thought and Language*, MIT Press 1962, pp.15, 22。
Flower が引用）。inner speech は highly elliptical で、explicit subjects and referents disappear。

### 正常な側にだけ付いている名前

**conceptual pact** と **lexical entrainment**（Brennan & Clark,
*JEP: LMC* 22(6), 1482-1493, 1996, doi:10.1037/0278-7393.22.6.1482）。抄録の逐語。

> when speakers refer to an object, they are proposing a conceptualization of it,
> a proposal their addressees may or may not agree to

短縮そのものは正常な言語運用で、正常たらしめているのは受け手の同意になる。
名前が付いているのは同意が成立した側だけで、成立しないまま使い続ける側には無い。

**grounding criterion** と **presentation phase / acceptance phase**
（Clark & Brennan, "Grounding in Communication", 1991）。
「It takes both phases for a contribution to be complete.」
ただし同論文は books・newspapers のような一方向の媒体を明示的に対象外にしている。

### 採らなかった候補

nonce word / occasionalism（語形の性質を指し、既存語への新義付与も無自覚も含まない）、
ISO 1087:2019 の new term / clipped term（正規の用語作業としての造語と結果物の分類）、
semantic drift（共同体の通時変化）、private language（哲学）。
term drift・shorthand drift・conceptual telescoping は定訳を確認できなかった。

## 書き手は自分の圧縮を検出できない

事前の指示を設計するうえで、これが前提になる。

| 実験 | 結果 |
| --- | --- |
| Newton 1990 の tapper 実験 | 送り手の推定平均 50%（範囲 10-95）に対し実測 2.5%。**実測が推定レンジの外側**に落ちる |
| Hayes & Bajzek 2008, *Written Communication* 25(1), 104-118 | 技術用語への習熟度が上がるほど、他者の理解度を大幅に過大評価する |
| Nickerson 1999, *Psychological Bulletin* 125(6), 737-759 | 自分の知識の他者への投影は既定動作で、意識的に止めない限り走る |

実務側の記録も同じ方向を指す。Federal Plain Language Guidelines の VBA 事例。逐語。

> When each reader was asked a general question about understanding the letter,
> they all said that it was clear. Yet several would have done something other than
> what VBA wanted because they had a different definition of "service-connected."

**「分かりますか」と聞く検査は失敗し、言い直させる検査は成功した。**

## 判断を消す仕組み

10 の型が見つかった。判断を何に置き換えているかで並べる。

### 1. 閉じた語彙。使える語が事前に決まっている

書き手は語を選ばない。「読者は知っているか」の推定が「辞書にあるか」の照合になる。

- **ASD-STE100 Simplified Technical English**（ASD / STEMG、Issue 9、2025-01-15）。
  語彙・構文・**意味**の 3 層で制限する。意味の層の条項が
  「Keep to the approved meaning of a word in the Dictionary.
  Do not use the word with any other meaning.」
  **この 1 条だけが、通常語に私的な意味を当てる形を正面から禁じている**
- **執筆・翻訳のための制限語彙**（杉野峰大ほか、言語処理学会第 27 回年次大会、2021）。
  ASD-STE100 の日本語版。承認語 / 非承認語の二値なので、
  その場の造語は定義上すべて非承認になる
- **簡約日本語**（国立国語研究所、野元菊雄。1988-1994）。2,000 語、多義語は基礎的な意味 3 義まで
- **ICAO 標準用語法**（Annex 10 Vol II）。5.1.1.1「ICAO standardized phraseology shall be
  used in all situations for which it has been specified」

**この型の反証。** Caterpillar Fundamental English は 1982 年に廃止された。
「the basic guidelines of CFE were not enforceable in the English documents produced」。
後継の Caterpillar Technical English は「制限が強制可能であること」を設計要件にして作り直された。
閉じた語彙があっても、強制手段が無ければ判断は書き手に戻る。

### 2. 短縮形を書かせず、定義への参照を書かせる

書き手が打つ文字列に短縮形が存在しない。「いま圧縮した」と気づく工程そのものが消える。
**今回の失敗に構造的に最も近い型。**

- **DITA `<abbreviated-form>`**（OASIS DITA 1.3）。空要素で、本文には
  `<abbreviated-form keyref="abs"/>` としか書かない。表示文字列は 100% 参照先から来る
- **ReSpec `data-abbr`**。略語が頭文字から生成され、書き手が短縮形を独立に作る経路が無い
- **LaTeX `glossaries` の `\gls{}`**。初出かどうかを書き手が判定しない
- **ClauseBase Clause9 の concept**（`#Distributor`）。起草者は語ではなく概念参照を書く

### 3. 未解決の参照でビルドが落ちる

集合の差分という機械的操作が「この語は定義済みか」の記憶を代替する。

| 仕組み | 未定義参照の扱い | 既定で止まるか |
| --- | --- | --- |
| Sphinx `:term:` | WARNING: term not in glossary | 止まらない。`-W` で止まる |
| LaTeX `\gls{}` | PackageError | 止まる |
| Bikeshed autolink | link-error | 止まらない。`--die-on` で止まる |
| ReSpec xref | No matching definition found | 止まらない。`--haltonerror` で止まる |

強制へ変える層は w3c/spec-prod の `BUILD_FAIL_ON` で、`link-error` 以上にすると
PR がマージ不能になる。

**この型の限界。** 検査対象はマークアップした語だけ。地の文に打った語は検出しない。

### 4. 表記が自己申告する

字面そのものが「これは定義語だ」と告げるので、読み手も編集者も記憶に頼らない。

- **アスタリスク表示**（Australia OPC Drafting Direction 1.6）。定義語の各 subsection での
  初出に `*` を前置する。**さらに、`*` の欠落が解釈に影響しないよう本文の定型条項で無効化されている。**
  「If a term is not identified by an asterisk, disregard that fact in deciding whether or not
  to apply to that term a definition」。検査漏れが法的効果に転化しない設計
- **定義語の頭文字大文字**（契約起草、MSCD 6.10）
- **RFC 2119 / 8174 の全大文字**。「The words have the meanings specified herein only
  when they are in all capitals.」

**この型への反証。** Martin Cutts, "Capitalizing Defined Terms"（Plain Language Commission, 2024）。
大文字は文頭や固有名詞でも起きるので飽和する。
自然言語で他の用途を持たない専用記号（`*`、`[=term=]`）のほうが飽和しにくい。

判例が 1 件ある。*GB Building Solutions v SFS Fire Services* [2017] EWHC 1289 (TCC)。
"Practical Completion" と小文字 practical completion の差で約 60 万ポンドの帰属が決まった。

### 5. 構文の定型が短縮の瞬間を捕まえる

短縮した位置と短縮形の初出が物理的に同一になるので、内省の工程が要らない。

- **defined-term parenthetical**（MSCD 5.18 / 5.37）
- **parenthetical definition**（US House Legislative Counsel Manual, HLC 117-2 sec. 326(i)）。
  定型が「どの範囲でこの短縮が有効か」を必ず同居させる
- **「（以下「〇〇」という。）」**（日本の法制執務と公用文）。文化審議会「公用文作成の考え方」Ⅰ-ク。
  略称を導入する行為に文型が義務づけられており、括弧書きを書かずに略称を使うことは
  法令の形式として成立しない

### 6. 主観評価を計数に落とす

「読者は分かるか」という答えの出ない問いを、数えられる量に置き換える。

- **Federal Plain Language Guidelines**（PLAIN、2011）。「limit the number of abbreviations
  you use in one document to no more than three, and preferably two.」
  加えて略語ではなく平易なニックネームを作れと指示する
- **Microsoft Writing Style Guide**。「Don't introduce acronyms that are used just once」
- **MSCD 第 5 版**。定義の語数に対する短縮形の語数の比と、使用回数の 2 つの整数で判定する

### 7. 外部台帳への存在照会

- **ASD-STE100 の Technical Name**。承認は「official documentation, engineering drawings,
  company glossaries, or terminology databases」にあるかで決まる。
  **その場で作った短縮語は、外部の既存台帳に載っていないという理由だけで排除される**
- **RFC 4949 の D 型**。場当たりの略語を作る行為そのものが登録簿の管理対象になっている
- **W3C Manual of Style**。「Use the terms found in these documents instead of
  creating your own」

### 8. 判断の所在を書き手から第三者へ移す

- **RFC 7322 3.6**。「Some cases are marginal, and the RFC Editor will make the final judgment」
- **AU OPC の head drafter ゲート**。定義の原則から逸脱するには head drafter の同意が要る
- **IBM ETerms / Acrolinx Term Harvesting**。未知語の検出は自動、辞書への登録承認は
  terminologist。書き手が自分の造語を自分で承認する経路が無い

### 9. 受け手に言い直させる

判断を観測に置き換える。**この型だけが、書き手の無自覚を前提にしても機能する。**

- **Paraphrase Testing**（Federal Plain Language Guidelines V.a, pp.100-103）。
  6 から 9 人に、指定の停止点ごとに自分の言葉で内容を言わせ、訂正しない。
  「Testing your documents should be an integral part of your plain-language planning and
  writing process, not something you do after the fact」。**事後の検査ではなく執筆中の工程**
- **Readback**（ICAO Annex 10 Vol II）。受信側が受け取った内容を読み返す手続
- **code words の丸付け演習**（Flower 1979）。判定基準を「読者に伝わるか」（無自覚では答えられない）
  から「自分の頭の中の大きな塊の代わりに置いた表現はどれか」（自分の記憶にはある）へ移している

### 10. 集合の差分（往復検査）

定義と使用の 2 集合の対称差を取る。内容理解を要さない。

- Bikeshed `unusedInternalDfns`、ReSpec `no-unused-dfns`、idnits の keywords モジュール
- 契約起草ツール群が共通して持つ 3 分類: undefined / unused / inconsistent capitalization

CrossCheck 開発者が判断不要である理由を言語化している。
「CrossCheck doesn't use AI. ... the issues CrossCheck looks for manifest themselves in
a few set ways. For the problems we're addressing, we don't need AI and all its associated uncertainty.」

## 今回の失敗に届かない仕組み

構造的に届かない理由があるもの。

- **略語規範のほぼ全部**（Microsoft / Google / Apple / GOV.UK / CMOS / RFC 7322 / 公用文 Ⅰ-ク）。
  「綴り出した語 → その頭文字」という派生関係のある短縮を前提にしている。
  派生関係の無い圧縮には発火しない
- **whitelist 型のチェッカー**。Boeing Simplified English Checker の論文（ACL 1993）の逐語。
  「The BSEC currently does little to guarantee that writers have used a word in the
  'Simplified English' meaning, only that they have selected the correct part of speech.」
  通常語は語形の検査を通過する
- **blacklist 型のリンター**（Vale の `reject.txt`、textlint-rule-prh）。
  登録済みのペアでしか動かない。その場で発明した語はどの辞書にも無いので原理的に 0 件
- **マークアップ依存の機構全部**。地の文に打った語は検査対象外
- **Google の style guide に「新語を作るな」の条項は無い**。word list 導入部は逆に
  「Terminology decisions ... often require judgments」と判断を書き手へ差し戻している

## 今回の失敗に届きうる仕組み

1. **意味の層まで固定した閉じた語彙。** ASD-STE100 の「Keep to the approved meaning」と、
   日本語版の承認語 / 非承認語の二値
2. **ツールが自分の割り当てた意味を書き手に見せ返す。** Caterpillar ClearCheck（CLAW'96）。
   「an author who writes "...a message appears at the bottom of the screen" may be shown
   a message indicating that "appear" will be interpreted to mean that the message comes
   into view at that moment」
3. **短縮形を書かせない参照解決。** DITA / ReSpec `data-abbr` / Clause9
4. **受け手に言い直させる。** Paraphrase Testing / Readback
5. **narrative テスト**（AU OPC Drafting Direction 1.5 para 22-25）。
   **今回の事態を正面から扱った唯一の条項。**
   ラベルがその条文の叙述の外へ出た瞬間に、冒頭定義節への登録が義務になる。
   DD 1.6 para 28 が「Labels should be used sparingly and should not be used to avoid
   asterisking a term」で抜け道を塞いでいる
6. **「略語は使わない」の例外なしの禁止。**
   在留支援のためのやさしい日本語ガイドライン（出入国在留管理庁・文化庁、2020-08）。
   例外が無いので判断が生じない。JIS・公用文・法制執務（初出で定義すれば使ってよい）と真逆の設計

## 効果の記録

定量的な記録があるのは 4 件だけ。

- **AECMA Simplified English が文章理解を有意に改善**。Shubert, Spyridakis, Holmback & Coney
  (1995), *Journal of Technical Writing and Communication* 25(4), 347-369、および
  Chervak, Drury & Ouellette (1996)。複雑な文章と非母語話者で効果が大きい。
  Stewart (1998) は同方向だが有意でない
- **「やさしい日本語」の指示達成率 85-91% 対 29-60%**。佐藤和之、産業日本語研究会シンポジウム資料
- **プロが書いた自動車修理書でも動詞の異なり 15.9% / 延べ 3.1% が非承認語**。杉野ほか 2021
- **Boeing SE Checker の精度 79% / 再現率 89%**、入力の約 90% でパース成功（ACL 1993）

失敗側の測定。

- 1950-2019 の PubMed タイトル 2,487 万件・抄録 1,825 万件から 111 万個のユニーク略語。
  30% が 1 回しか現れず、規則的に使われるのは 0.2%
  （Barnett & Doubleday, *eLife* 9:e60080, doi:10.7554/eLife.60080）
- 法令文でさえ、定義規定から正式名称と略称のペアを機械抽出する手法の正答率は 63%
  （北野・西山、言語処理学会第 31 回年次大会 2025）

**記録が無い範囲。** 定義語の頭文字大文字、アスタリスク表示、往復検査、
DITA / LaTeX / Sphinx / Bikeshed / ReSpec、ISO 704、Paraphrase Testing の定量値、
Microsoft / Google / Apple の各条項。定義語の誤り発生率やツール導入の効果測定は、
法務・仕様記法の両領域を通じて存在しない。

## 一次情報と二次情報の別

**本文を取得して逐語を確認したもの。** ICAO Annex 10 Vol II、Federal Plain Language Guidelines、
Flower 1979、Clark & Brennan 1991、Brennan & Clark 1996 抄録、Kuhn 2014、
Boeing SE Checker 論文、Caterpillar CLAW'96 論文、RFC 7322、Microsoft Writing Style Guide、
Google style guide、W3C Manual of Style、OASIS DITA 1.3、
Sphinx / Bikeshed / ReSpec / DITA-OT / Vale の GitHub ソース、
UK OPC Drafting Guidance、US House Legislative Counsel Guide、Cutts 2024、
公用文作成の考え方、在留支援のためのやさしい日本語ガイドライン、杉野ほか 2021、eLife 60080。

**二次情報しか無いもの。** MSCD 本文（有料。Adams のブログが逐語引用した節のみ）、
INCOSE Guide for Writing Requirements（403。rule 番号が版で食い違う）、
Acrolinx の term status 挙動、Apple Style Guide、IBM Style Guide、JTCA 日本語スタイルガイド。

**本文に到達できなかったもの。** ISO 24495-1:2023、ISO 1087:2019、ISO 12620、ISO 30042
（iso.org が 403）、Pinker *The Sense of Style*、Krauss & Weinheimer の原論文、
Plain Writing Act of 2010 法文。
