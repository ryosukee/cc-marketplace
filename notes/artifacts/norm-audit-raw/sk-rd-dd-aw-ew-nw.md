# 条項抽出: SK / RD / DD / AW / EW / NW

## SK — plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md

### SK1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:24
- 原文: ジャンルが混在する文書は節単位で分類を切り替える（例: README の中の設計判断の節には判断文書の規範を適用する）
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 例として README 内の設計判断の節に判断文書の規範を適用することを挙げる
- 重複候補: なし

### SK2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:26
- 原文: 境界事例は主目的で判定する: 再現させたい → 参照、判断させたい → 判断、学術的に主張・証明したい → 論文、理解させたい → 解説、引き込みたい → 読み物
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 判定基準は「主目的」。5 分類それぞれの主目的が列挙されている
- 重複候補: SK4（表にない文書種も同じ判定方法）と同趣旨

### SK3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:31-43
- 原文: | 書くもの | 分類 | reference |<br>| README・API リファレンス・設定ガイド | 参照 | 参照ドキュメントの規範 |<br>| 運用手順・セットアップ手順 | 参照 | 同上 |<br>| rule・CLAUDE.md・skill などの規範・運用文書 | 参照 | 同上（特に「関心事の分離」） |<br>| 設計書・ADR・RFC・提案書 | 判断 | 判断文書の規範 |<br>| 技術調査・検証レポート・ベンチマーク | 判断 | 同上 |<br>| 障害報告・進捗報告・PR 説明・ターミナルでの報告 | 判断 | 同上 |<br>| Issue・コミットメッセージ・チャットでの連絡 | 判断 | 同上（報告の短縮形） |<br>| HTML 報告・確認フォームの本文 | 判断 | 同上（画面構成は参照の規範も併用） |<br>| 論文・研究報告・学術寄りの厳密な記事 | 論文 | 論文・学術文書の規範 |<br>| 技術ブログ・入門記事・解説文 | 解説 | 解説・入門記事の規範 |<br>| エッセイ・書籍の章・物語的な構成の文章 | 読み物 | 読み物の規範 |
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 分類判定表。10 行の対応づけを 1 件として扱った（行ごとに数えるなら 10 件）。目次ではなく分類の割り当て規定なので抽出対象に含めた。HTML 報告の行だけ「画面構成は参照の規範も併用」という併用指示を含む
- 重複候補: なし

### SK4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:45
- 原文: 表にない文書種は、境界事例と同じく主目的で判定する。
- 分類: 形式・媒体判定
- 性質: 汎用
- 重複候補: SK2 と同趣旨（主目的での判定）

### SK5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:51
- 原文: 実用文書（参照・判断・論文）では、文書・節・段落のどれも読者が最初に知りたい答えから始める（重点先行）。
- 分類: 構成・順序
- 性質: 汎用
- 補足: 適用範囲は実用文書（参照・判断・論文）に限定。解説・読み物は SK10 で別扱い
- 重複候補: DD2（結論・推奨を先頭に置く）、DD18（最重要の一文を最初に置く）と重なる

### SK6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:52
- 原文: 背景や経緯は結論の後ろに置き、
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: DD3（調査の経緯は後ろへ送る）、DD20（長い経緯は参照先へ逃す）と重なる

### SK7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:52
- 原文: 冒頭に地図（目的、扱う範囲、読み方）を置く。
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: RD2（冒頭に地図を置く: 何で・誰が・いつ使うか 3 行以内）、DD4（冒頭に地図を置く: 目的 / 決めること / 読み方）と重なる。SK41 の例外（実用文書の冒頭の地図は書く）とも接続する

### SK8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:53
- 原文: 論文は文書レベルではアブストラクトで結論を前置きし、
- 分類: 構成・順序
- 性質: 種別固有（論文）
- 重複候補: AW4（アブストラクトは本文の縮約）と重なる

### SK9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:53
- 原文: 本文の節順は定型構成（IMRaD 等）に従う
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: AW2（分野の型に従う。実証系は IMRaD）と同趣旨

### SK10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:54
- 原文: 解説・読み物では、構成の順序（概念の導入順・情報の出しどころ）を分類別規範に従って設計する。
- 分類: 構成・順序
- 性質: 種別固有（解説・読み物）
- 重複候補: EW1（読者の理解の順序を設計する）、NW1（推進力を構成で作る）へ委譲する形で重なる

### SK11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:55
- 原文: 構成順について共通原則と分類別規範が衝突したら、分類別規範を優先する
- 分類: その他
- 性質: 汎用
- 補足: 規範同士の優先順位を定めるメタ規定
- 重複候補: なし

### SK12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:56
- 原文: 一つの段落には一つのトピックだけを置く。
- 分類: 構成・順序
- 性質: 汎用
- 補足: 「（全分類共通）」と明示されている
- 重複候補: RD5（1 節 1 トピック）と粒度違いで重なる

### SK13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:56
- 原文: 段落の最初の文で、その段落が何の話か分かるようにする（全分類共通）
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: なし

### SK14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:60
- 原文: 一つの主張は一度だけ書く。言い換えの繰り返し、直後の要約し直し、隣接する節の役割重複を除く
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: RD6（同じ情報を複数の節に書かない）と重なる

### SK15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:61-63
- 原文: 削るかどうかの基準: その文が新しく伝えるのは対象のことか、文章自身のことか。文章自身しか語らない文（進行の実況・見え方の解説・執筆予定の宣言）は削る。削ると論理が飛ぶ場合は、対象側の内容を語る文に書き換える
- 分類: 取捨選択
- 性質: 汎用
- 補足: 判定基準（対象を語るか文章自身を語るか）と、削ると論理が飛ぶ場合の書き換えという例外処理を含む
- 重複候補: NW23・NW24（状況更新か文書更新かで判定し、文書側は削るか書き換える）とほぼ同型。NW33（点検工程）も同軸

### SK16

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:64
- 原文: 読者が自力で補える中間段階の説明は書かない
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SK17

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:65
- 原文: 数文にわたる議論を一文に圧縮できるなら、圧縮した一文だけを残す
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SK18

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:69-70
- 原文: 文書ごとに扱う関心事（何を書くべきか）が決まる。その文書の関心事に属する内容だけを書き、別の関心事に属する内容は対応する文書へ分離する
- 分類: 取捨選択
- 性質: 汎用
- 補足: 判定基準（SKILL.md:71-72）「その記述が変わるタイミングは、この文書が変わるタイミングと同じか。別なら関心事も別で、置き場も別の文書になる」。冗長の排除との違い（SKILL.md:76-77）「冗長の排除は新しい情報を足さない文を削る。関心事の分離は、新しい情報だが別の文書に属する内容を移す。削除ではなく正しい文書への移動」
- 重複候補: RD17・RD18（運用 rule・手順書への適用）が同原則の種別固有版

### SK19

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:73
- 原文: 判断文書では判断の前提・経緯・再現条件がその文書の関心事なので残す。
- 分類: 取捨選択
- 性質: 種別固有（判断）
- 重複候補: DD10（再現条件を残す）、DD16（判断の前提にした制約を本文に残す）と重なる

### SK20

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:74
- 原文: 恒常的な運用 rule・手順書ではセットアップ経緯・環境固有情報が関心事の外なので分離する
- 分類: 取捨選択
- 性質: 種別固有（参照）
- 補足: 参照先として reference-docs.md の「関心事の分離」を指している
- 重複候補: RD18（一度きりのセットアップ手順・環境固有の事情・導入の経緯や日付を環境側の文書へ分離する）とほぼ同文

### SK21

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:81-82
- 原文: 短さのために重要な情報を落とさない。削ってよいのは冗長（同じ情報の重複）だけで、前提・条件・例外・反例・数値は圧縮後も残す
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SK22

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:83
- 原文: 助詞を省略しない。「は・を・に・から」で語と語の関係を明示する
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK23

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:84
- 原文: 列挙を「など」でぼかして情報を落とさない。網羅できるなら全件書き、省くなら省いたことを明示する
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SK24

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:88
- 原文: 事実と意見（解釈・評価）を文単位で区別する。意見は意見と分かる形で書く
- 分類: 文レベル
- 性質: 汎用
- 重複候補: DD11（事実と解釈を分ける）とほぼ同趣旨

### SK25

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:89
- 原文: 数値・性能・実績には「実測」か「推定（未実測）」かを付ける
- 分類: 文レベル
- 性質: 汎用
- 重複候補: DD12（数値には実測か推定かを付ける）とほぼ同文

### SK26

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:90
- 原文: 根拠が本文内で確定していることは断定する。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: AW7（本文内の根拠によって命題が確定している場合に限り断定に直せる）と表裏

### SK27

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:90-92
- 原文: 不確実なことは不確実なまま書き、ヘッジ（「〜の可能性がある」「〜かもしれない」）を保持する。削ってよいのは根拠なく重ねた緩和（同一文に複数のヘッジ、文書全体での高頻度）だけ
- 分類: 文レベル
- 性質: 汎用
- 補足: 削ってよい範囲を「根拠なく重ねた緩和（同一文に複数のヘッジ、文書全体での高頻度）」に限定
- 重複候補: AW7（推量・可能性・反実仮想を機械的に断定へ変えない）、DD14（確定していないことを確定として書かない）と重なる

### SK28

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:93
- 原文: 因果を主張するときは機構（なぜそうなるか）を一文添える
- 分類: 文レベル
- 性質: 汎用
- 重複候補: AW11（因果の主張には機構を一文添える）と同文

### SK29

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:94
- 原文: 検出・保証・解決を「必ず」できるかのように書かない。条件付きで正確に述べる
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK30

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:98
- 原文: 用語は 1 概念 1 語。同義語をローテーションしない。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: AW16（導入後はその語で通す）、EW6（導入した概念は以後その名前で通す）と重なる

### SK31

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:99
- 原文: 新しい概念に名前を付ける前に既存の一般用語を探し、独自語を作らない
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: なし

### SK32

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:100
- 原文: 専門用語・略語は初出で定義する
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: AW15（概念・記号・術語は導入してから使う）と重なる

### SK33

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:101
- 原文: 後で参照する必要のない固有名（ファイル名・関数名・識別子）を本文に出さず、一般的な言い方で済ませる
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SK34

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:102
- 原文: 修飾語は係り先の直前に置く。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK35

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:102
- 原文: 複合語句のスコープが曖昧なら「」で括る
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: なし

### SK36

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:103-104
- 原文: 一文を長くしすぎない。接続の多い長文は文を分ける。ただし導入で必要な文脈共有（範囲・観点・前提）を削って短くしない
- 分類: 文レベル
- 性質: 汎用
- 補足: 例外として、導入で必要な文脈共有（範囲・観点・前提）は削らない
- 重複候補: なし

### SK37

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:105
- 原文: 二重否定を使わない。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK38

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:105
- 原文: 同じ助詞の連続（「の」の三連など）を避ける
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK39

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:109
- 原文: LLM が出しがちな、情報を足さずに「書いている感」だけを付ける型。使わない。
- 分類: 取捨選択
- 性質: 汎用
- 補足: 以下 SK40〜SK47 の総則。個々の型はそれぞれ独立した条項として抽出した
- 重複候補: NW24（文書しか更新しない文は削る）と発想が近い

### SK40

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:111-112
- 原文: 誇張形容: 「非常に重要」「画期的」「革新的」「強力な」「シームレスな」。根拠のない評価語を消し、事実と数値で示す
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK41

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:113-114
- 原文: 空虚な予告と総括: 「本章では〜を見ていく」「まとめると」「要するに」（直前の言い換えだけのとき）。実用文書の冒頭の地図（目的・範囲の明示）は予告ではなく構成要素なので書く
- 分類: 取捨選択
- 性質: 汎用
- 補足: 例外として実用文書の冒頭の地図は書く
- 重複候補: EW9・NW5（態度のない議題表にしない）、NW19（「本節では〜を扱う」で始めない）、NW21（節末の進行予告を置かない）と重なる。例外側は SK7・RD2・DD4 の地図と接続

### SK42

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:115
- 原文: 分析風の付け足し: 「〜を浮き彫りにしている」「〜を示唆している」。事実で文を止める
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK43

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:116
- 原文: 曖昧な権威付け: 「専門家によると」「一般的に〜とされている」。出典を示すか、文ごと削る
- 分類: 文レベル
- 性質: 汎用
- 重複候補: AW21（出典は主張単位で対応が取れるように付ける）、DD13（出典・エビデンスへのリンクを添える）と重なる

### SK44

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:117
- 原文: 装飾の型: `**ラベル**:` で始まる箇条書きの連発、絵文字 bullet、項目数を 3 に揃えた列挙
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: なし

### SK45

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:118-119
- 原文: 文頭接続詞の連発: 同一段落内で 2 文以上連続の文頭接続詞（「さらに」「また」「そのため」）を置かない。段落頭で前段落との論理関係を示す接続表現は対象外
- 分類: 文レベル
- 性質: 汎用
- 補足: 段落頭の接続表現は対象外
- 重複候補: なし

### SK46

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:120
- 原文: チャット残留: 「以下に示します」「お役に立てば幸いです」「素晴らしい質問ですね」
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### SK47

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:121
- 原文: 回りくどい繋辞: 「〜として位置づけられている」「〜と言えるでしょう」は「〜だ」に直すか削る
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

## RD — plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md

### RD1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:11
- 原文: 読者はこれを通読せず「使う」。必要な箇所へ最短で到達でき、読んだとおりに実行できることを最優先する。
- 分類: 目的・読者の確定
- 性質: 種別固有（参照）
- 補足: 読者像（通読せず使う）を根拠に最優先事項を定める
- 重複候補: DD1（結論と根拠の距離を最短にする）と同型の、種別ごとの最優先事項の宣言

### RD2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:15
- 原文: 冒頭に地図を置く: このドキュメントが何で、誰が、いつ使うものかを 3 行以内で書く
- 分類: 構成・順序
- 性質: 種別固有（参照）
- 重複候補: SK7（冒頭に地図）、DD4（冒頭に地図: 目的 / 決めること / 読み方）と重なる。中身の 3 項目だけが異なる

### RD3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:16
- 原文: 見出しだけを拾って目的の節に到達できる構成にする。
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: なし

### RD4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:16
- 原文: 見出しは内容を特定できる具体的な句にする
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: EW13（見出しは、その節が答える問いか、扱う対象を指す具体的な句にする）と重なる

### RD5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:17
- 原文: 1 節 1 トピック。
- 分類: 構成・順序
- 性質: 種別固有（参照）
- 重複候補: SK12（一つの段落には一つのトピック）と粒度違いで重なる

### RD6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:17
- 原文: 同じ情報を複数の節に書かない（変更時に矛盾の原因になる）
- 分類: 取捨選択
- 性質: 種別固有（参照）
- 補足: why は「変更時に矛盾の原因になる」
- 重複候補: SK14（一つの主張は一度だけ書く。隣接する節の役割重複を除く）と重なる

### RD7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:18
- 原文: 比較・対応関係は表、並列の列挙は箇条書き、理由や因果の説明だけを地の文にする
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: なし

### RD8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:19
- 原文: 表のセルは流し読みできる短い判定値にし、文を書かない。
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: なし

### RD9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:19
- 原文: 詳細は表の直下の補足に出す
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: なし

### RD10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:23
- 原文: 1 手順 1 操作。1 つの番号の中で 2 つの操作をさせない
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: なし

### RD11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:24
- 原文: 手順の前に前提（必要な権限・環境・バージョン）、
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: DD10（再現条件として環境・バージョン・手順を残す）と情報項目が重なる

### RD12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:24
- 原文: 後に完了確認（何が確認できれば成功か）を書く
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: なし

### RD13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:25
- 原文: コマンド・設定値は実行して確認済みのものを書く。
- 分類: 検知・レビュー手順
- 性質: 種別固有（参照）
- 重複候補: なし

### RD14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:25
- 原文: 未検証なら未検証と明示する
- 分類: 文レベル
- 性質: 種別固有（参照）
- 重複候補: DD15（未確認の項目は未確認と明示して列挙する）、SK25（実測か推定かを付ける）と同趣旨

### RD15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:26
- 原文: 環境による分岐（OS 別など）は手順の途中で分岐させず、節を分ける
- 分類: 文書種別の構造
- 性質: 種別固有（参照）
- 重複候補: なし

### RD16

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:30
- 原文: 共通原則の「関心事の分離」を、恒常的な運用 rule・手順書に適用する。
- 分類: その他
- 性質: 種別固有（参照）
- 補足: 共通原則の適用範囲を宣言するメタ規定。以下 RD17〜RD19 の総則
- 重複候補: SK18（関心事の分離）の種別固有版であることの明示

### RD17

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:32
- 原文: 運用 rule・手順書には運用の規範だけを書く。
- 分類: 取捨選択
- 性質: 種別固有（参照）
- 重複候補: SK18・SK20 と同趣旨

### RD18

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:32-33
- 原文: 一度きりのセットアップ手順、環境固有の事情、導入の経緯や日付は、環境側の文書（dotfiles の docs 等）や設計記録に分離する
- 分類: 取捨選択
- 性質: 種別固有（参照）
- 補足: why（reference-docs.md:36-39）「運用 rule の改訂時に、rule の関心事ではないセットアップ手順・パッケージ管理の事情・移行日を書き込み、複数回の差し戻しを受けた実例（2026-07。前セッションでも同種の混入が再発）。「この rule を読めば必要な情報が全部揃うべき」という自己完結バイアスが原因で、環境固有の情報を環境側の文書へ分離して解決した。」
- 重複候補: SK20（恒常的な運用 rule・手順書ではセットアップ経緯・環境固有情報を分離する）とほぼ同文

### RD19

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:34
- 原文: 汎用 rule に固有事例を書くのは why の実例として最小限に留め、例と分かる形にする
- 分類: 取捨選択
- 性質: 種別固有（参照）
- 重複候補: なし

### RD20

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:43
- 原文: だ体で書く。
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: AW17（である調で統一する）と同軸で値が異なる

### RD21

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:43
- 原文: 状態の表記は体言止めでよい（「デフォルト: 無効」）。
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: なし

### RD22

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:44
- 原文: 手順の指示文はですます調か命令形のどちらかに文書内で統一する
- 分類: 表記・記法
- 性質: 種別固有（参照）
- 重複候補: なし

### RD23

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/reference-docs.md:45
- 原文: 読者を「あなた」と呼ばず、必要なら役割名（利用者・管理者）で書く
- 分類: 文レベル
- 性質: 種別固有（参照）
- 重複候補: NW27・NW28（「あなた」は境界に限る、論証の中では役割名で書く）と重なる。RD は全面禁止、NW は境界のみ許可という差がある

## DD — plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md

### DD1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:11
- 原文: 読者はこれを根拠に判断するか行動する。結論と根拠の距離を最短にする。
- 分類: 目的・読者の確定
- 性質: 種別固有（判断）
- 重複候補: RD1 と同型（読者像を根拠にした最優先事項の宣言）

### DD2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:15
- 原文: 結論・推奨を先頭に置く。「A を推奨する。理由は 2 点」から始め、
- 分類: 構成・順序
- 性質: 種別固有（判断）
- 重複候補: SK5（重点先行）の種別固有版

### DD3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:15
- 原文: 調査の経緯は後ろへ送る
- 分類: 構成・順序
- 性質: 種別固有（判断）
- 重複候補: SK6（背景や経緯は結論の後ろに置く）とほぼ同文

### DD4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:16
- 原文: 冒頭に地図を置く: 目的 / 決めること / 読み方
- 分類: 構成・順序
- 性質: 種別固有（判断）
- 重複候補: SK7・RD2 と重なる（地図の中身だけが異なる）

### DD5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:17
- 原文: 選択肢の比較は観点を揃える（列 = 選択肢、行 = 観点）。
- 分類: 文書種別の構造
- 性質: 種別固有（判断）
- 重複候補: RD7（比較・対応関係は表）と重なる

### DD6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:17
- 原文: 決め手の観点を本文で名指しする
- 分類: 文書種別の構造
- 性質: 種別固有（判断）
- 重複候補: なし

### DD7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:18
- 原文: 推奨には根拠を併記し、
- 分類: 文書種別の構造
- 性質: 種別固有（判断）
- 重複候補: なし

### DD8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:18
- 原文: 推奨以外も選べること（覆せること）を明示する
- 分類: 確認・質問の作り方
- 性質: 種別固有（判断）
- 補足: 分類は「文書種別の構造」とも取れる。読者に判断を委ねる要素を明示する規定なので確認・質問側に寄せた（判断保留寄り）
- 重複候補: なし

### DD9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:19
- 原文: 調査は方法と結果を分けて書き、
- 分類: 文書種別の構造
- 性質: 種別固有（判断）
- 重複候補: AW2（IMRaD: 方法と結果の分離）と重なる

### DD10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:19
- 原文: 再現条件（環境・バージョン・手順）を残す
- 分類: 取捨選択
- 性質: 種別固有（判断）
- 重複候補: SK19（判断文書では再現条件を残す）とほぼ同文。RD11（前提として権限・環境・バージョン）とも項目が重なる

### DD11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:23
- 原文: 事実と解釈を分ける。「ログに X が出ている（事実）。原因は Y と考える（解釈）」の形で書く
- 分類: 文レベル
- 性質: 種別固有（判断）
- 重複候補: SK24（事実と意見を文単位で区別する）とほぼ同趣旨

### DD12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:24
- 原文: 数値には実測か推定かを付け、
- 分類: 文レベル
- 性質: 種別固有（判断）
- 重複候補: SK25 とほぼ同文

### DD13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:24
- 原文: 出典・エビデンスへのリンクを添える
- 分類: 表記・記法
- 性質: 種別固有（判断）
- 重複候補: AW21（出典は主張単位で対応が取れるように付ける）、SK43（出典を示すか文ごと削る）と重なる

### DD14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:25
- 原文: 確定していないことを確定として書かない。
- 分類: 文レベル
- 性質: 種別固有（判断）
- 重複候補: SK27（不確実なことは不確実なまま書く）、AW7 と重なる

### DD15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:25
- 原文: 未確認の項目は未確認と明示して列挙する
- 分類: 文レベル
- 性質: 種別固有（判断）
- 重複候補: RD14（未検証なら未検証と明示する）と同趣旨

### DD16

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:26
- 原文: 判断の前提にした制約（期限・リソース・既存構成）を本文に残す。前提が変われば結論が変わるため
- 分類: 取捨選択
- 性質: 種別固有（判断）
- 補足: why は「前提が変われば結論が変わるため」
- 重複候補: SK19（判断の前提・経緯・再現条件を残す）と重なる

### DD17

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:30
- 原文: 報告・返答は判断文書の圧縮版として書く。
- 分類: 形式・媒体判定
- 性質: 種別固有（判断）
- 補足: 以下 DD18〜DD22 の総則
- 重複候補: SK3 の判定表（Issue・コミットメッセージ・チャットでの連絡 = 判断の報告の短縮形）と対応

### DD18

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:32
- 原文: 最重要の一文（何が起きたか・何が分かったか・何をしたか）を最初に置く
- 分類: 構成・順序
- 性質: 種別固有（判断）
- 重複候補: SK5・DD2（結論先行）の報告版

### DD19

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:33
- 原文: 次のアクション（誰が・何を・いつまでに）を明示して終える
- 分類: 構成・順序
- 性質: 種別固有（判断）
- 重複候補: なし

### DD20

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:34
- 原文: 長い経緯は参照先へ逃し、
- 分類: 取捨選択
- 性質: 種別固有（判断）
- 重複候補: SK6・DD3（経緯を後ろへ）と重なる

### DD21

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:34
- 原文: 本文は読者が次の行動を決めるのに必要な分だけにする
- 分類: 取捨選択
- 性質: 種別固有（判断）
- 重複候補: DD1（結論と根拠の距離を最短にする）と同軸

### DD22

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/decision-docs.md:35
- 原文: 失敗・未完了を成功と紛れる書き方をしない。結果は結果のまま書く
- 分類: 文レベル
- 性質: 種別固有（判断）
- 重複候補: DD14（確定していないことを確定として書かない）と発想が近い

## AW — plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md

### AW1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:10
- 原文: [判断文書の規範](./decision-docs.md)（結論先行・事実と解釈の峻別・エビデンス）を前提に、以下を追加適用する。
- 分類: その他
- 性質: 種別固有（論文）
- 補足: 規範の継承関係を定めるメタ規定
- 重複候補: EW1（正確さは共通原則と判断文書の規範に従う）と同型の継承宣言

### AW2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:14
- 原文: 分野の型に従う（実証系は IMRaD: 序論・方法・結果・考察）。
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: SK9（本文の節順は定型構成（IMRaD 等）に従う）と同趣旨

### AW3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:14
- 原文: 型がある分野で独自の構成を発明しない
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: なし

### AW4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:15
- 原文: アブストラクトは本文の縮約（目的・方法・結果・結論を各 1〜2 文）。
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: SK8（論文はアブストラクトで結論を前置き）と重なる

### AW5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:15
- 原文: 本文にない主張を入れない
- 分類: 取捨選択
- 性質: 種別固有（論文）
- 重複候補: なし

### AW6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:16
- 原文: 序論で「何が未解決で、本稿が何を加えるか」（先行研究との差分）を明示する
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: なし

### AW7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:20-21
- 原文: 推量・可能性・反実仮想として書かれた文を機械的に断定へ変えない。断定に直せるのは、本文内の根拠によって命題が確定している場合に限る
- 分類: 文レベル
- 性質: 種別固有（論文）
- 補足: 断定に直せる条件を「本文内の根拠によって命題が確定している場合」に限定
- 重複候補: SK26・SK27（確定していることは断定し、不確実さはヘッジを保持）とほぼ同趣旨

### AW8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:22
- 原文: 異なるものを「同じ」とまとめない。区別すべき対象（別々の原因、種類の違う問題）を一括りの語で括らない
- 分類: 文レベル
- 性質: 種別固有（論文）
- 重複候補: なし

### AW9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:23
- 原文: 複数の要因がある事象を単一の原因に還元しない。
- 分類: 文レベル
- 性質: 種別固有（論文）
- 重複候補: AW8 と近接（区別すべきものを潰さない）

### AW10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:23
- 原文: どの根拠がどの主張を支えるかを対応づける
- 分類: 文書種別の構造
- 性質: 種別固有（論文）
- 重複候補: AW21（出典は主張単位で対応が取れるように付ける）と重なる

### AW11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:24
- 原文: 因果の主張には機構（なぜそうなるか）を一文添える
- 分類: 文レベル
- 性質: 種別固有（論文）
- 重複候補: SK28 と同文（共通原則に同じ規定がある）

### AW12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:25
- 原文: 主張の範囲を例が支える範囲に合わせる。例が一部しか支えないなら主張を狭める
- 分類: 文レベル
- 性質: 種別固有（論文）
- 重複候補: SK29（「必ず」できるかのように書かず条件付きで正確に述べる）と発想が近い

### AW13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:26
- 原文: 前方に送った論点（「次節で扱う」）は必ず回収する。
- 分類: 構成・順序
- 性質: 種別固有（論文）
- 重複候補: NW7（立てた問いは明示的に回収する）と同趣旨

### AW14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:26
- 原文: 回収しない伏線を張らない
- 分類: 構成・順序
- 性質: 種別固有（論文）
- 重複候補: NW8（回収位置を指せない問いは削る）と同趣旨

### AW15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:27
- 原文: 概念・記号・術語は導入してから使い、
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: SK32（専門用語・略語は初出で定義する）と重なる

### AW16

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:27
- 原文: 導入後はその語で通す。曖昧な広い語に後退しない
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: EW6（導入した概念は以後その名前で通す。「ツール」「AI」のような曖昧な広い語に後退しない）とほぼ同文。SK30（1 概念 1 語）とも重なる

### AW17

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:31
- 原文: である調で統一する
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: RD20（だ体で書く）と同軸で値が異なる

### AW18

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:32
- 原文: 引用は原文のまま転記し、引用符で括る。
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: なし

### AW19

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:32
- 原文: 中間を省くときは省略を明示する。
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: SK23（省くなら省いたことを明示する）と同趣旨

### AW20

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:33
- 原文: 圧縮したいときは引用符を使わず地の文で要約と分かる形にする
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: なし

### AW21

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:34
- 原文: 出典は主張単位で対応が取れるように付ける。
- 分類: 表記・記法
- 性質: 種別固有（論文）
- 重複候補: DD13（出典・エビデンスへのリンクを添える）、AW10（根拠と主張の対応づけ）と重なる

### AW22

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/academic-writing.md:34
- 原文: 孫引きを避け、一次情報に当たる
- 分類: 検知・レビュー手順
- 性質: 種別固有（論文）
- 補足: 分類は「表記・記法」（出典の書き方）とも取れるが、書き方ではなく裏取りの行動を規定しているので検知・レビュー側にした
- 重複候補: なし

## EW — plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md

### EW1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:10-11
- 原文: 目的は読者に理解させること。内容の正確さは共通原則と[判断文書の規範](./decision-docs.md)の事実の扱いに従い、その上で読者の理解の順序を設計する。
- 分類: 目的・読者の確定
- 性質: 種別固有（解説）
- 補足: 規範の継承（正確さは共通原則と判断文書へ委譲）と、この分類の固有課題（理解の順序の設計）の 2 つを含む。1 件として扱った
- 重複候補: AW1 と同型の継承宣言。SK10（解説・読み物では構成の順序を分類別規範に従って設計する）と対応

### EW2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:15
- 原文: 新しい概念を「X とは Y である」の定義から始めない。
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 重複候補: NW18（理論・概念は名前のない違和感を作ってから名前を与える形で出す）と同趣旨

### EW3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:15-16
- 原文: まずその概念が必要になる困りごとを具体的に見せ、それに名前を与える形で概念を出す。読者の中に「これは何と呼べばいいのか」という空白を作ってから名前を渡す
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 補足: 後半は前半の判定基準・言い換え
- 重複候補: NW18 とほぼ同文

### EW4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:18
- 原文: 一度に導入する新概念を絞る。
- 分類: 取捨選択
- 性質: 種別固有（解説）
- 重複候補: なし

### EW5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:18
- 原文: 読者が保持すべき文脈が増えるときは、なぜもう一つ必要かを前置きする
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 重複候補: なし

### EW6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:19
- 原文: 導入した概念は以後その名前で通す。「ツール」「AI」のような曖昧な広い語に後退しない
- 分類: 表記・記法
- 性質: 種別固有（解説）
- 重複候補: AW16 とほぼ同文。SK30（1 概念 1 語）とも重なる

### EW7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:22-23
- 原文: 性質や分類を列挙したら、列挙しっぱなしにしない。項目を直前の例や読者の経験に対応づける一文を添える（「一つめは、さきほどの失敗の原因そのものだ」）。全項目でなくてよく、一つか二つで効く
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 補足: 適用の程度は「全項目でなくてよく、一つか二つで効く」
- 重複候補: NW17（列挙のあとは項目を場面へ着地させる）と同趣旨

### EW8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:27
- 原文: 冒頭は読者がすでに持っている実感・困りごとから入ってよい。
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 重複候補: NW4（冒頭の型のひとつ「読者の実感の言い直しから仮説へ」）と重なる

### EW9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:28
- 原文: 態度のない議題表（「本稿では A、B、C を扱う」だけの冒頭）にしない。
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 重複候補: NW5（態度のない議題表を冒頭に置かない）とほぼ同文。SK41（空虚な予告）とも重なる

### EW10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:29
- 原文: 何をどう考えたいかが表れた一〜二文の予告は、読む理由を作るので書いてよい
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 補足: EW9 の例外。why は「読む理由を作る」
- 重複候補: NW6（態度を帯びた一〜二文の予告は書いてよい）とほぼ同文

### EW11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:30-31
- 原文: 読者が抱きそうな誤解・反問は、その内容を具体的に書き出してから解消する。漠然と「誤解しないでほしい」とだけ書かない
- 分類: 構成・順序
- 性質: 種別固有（解説）
- 重複候補: NW25（例外 4 形のひとつ「具体的な誤読を「」で引用して退ける反論処理」）、NW20（読者が当然抱く反問で節に入る）と重なる

### EW12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:32
- 原文: 例が作為的に見えるときは隠さずに認め、現実に起こりうる根拠を短く添える
- 分類: 文レベル
- 性質: 種別固有（解説）
- 重複候補: なし

### EW13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:36
- 原文: 見出しは、その節が答える問いか、扱う対象を指す具体的な句にする
- 分類: 文書種別の構造
- 性質: 種別固有（解説）
- 重複候補: RD4（見出しは内容を特定できる具体的な句にする）と重なる

### EW14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:37
- 原文: 作業の手順だけの見出し（「確認する」「例に戻る」）
- 分類: 文書種別の構造
- 性質: 種別固有（解説）
- 補足: 原文は EW15 と 1 文で「〜や、〜見出しにしない」と結ばれている。禁止対象が 2 つあるので 2 件に割った
- 重複候補: なし

### EW15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/explanatory-writing.md:37
- 原文: 節の結論を言い切って山場を先に消す見出しにしない
- 分類: 文書種別の構造
- 性質: 種別固有（解説）
- 重複候補: NW22（山場で効かせる情報を手前の段落で先出ししない）と同趣旨

## NW — plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md

### NW1

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:10
- 原文: 読者はいつでも離脱できるので、最後まで読ませる推進力を構成で作る。
- 分類: 目的・読者の確定
- 性質: 種別固有（読み物）
- 重複候補: RD1・DD1・EW1 と同型（読者像を根拠にした最優先事項の宣言）

### NW2

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:11
- 原文: 共通原則は適用した上で、緊張の設計・語りの技法はこの分類だけで使う（他の分類では使わない）。
- 分類: その他
- 性質: 種別固有（読み物）
- 補足: 規範の適用範囲を定めるメタ規定。他分類への流用を明示的に禁じる
- 重複候補: AW1・EW1 と同型の継承宣言だが、こちらは「他分類では使わない」という排他条件を持つ

### NW3

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:15-17
- 原文: 文章は常に、答えの出ていない問いを少なくとも一つ開いておく。すべての問いが閉じた文章は、そこで読み終えてよい文章になる。答えを出す順番を調整し、最後まで一つは開いた問いを残す
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 補足: why は「すべての問いが閉じた文章は、そこで読み終えてよい文章になる」。実現手段として答えを出す順番の調整を指定
- 重複候補: NW7・NW8（回収）と表裏

### NW4

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:18-20
- 原文: 冒頭の仕事は、最初の数文で未回収の緊張を一つ作ること。型は問わない: 読者の実感の言い直しから仮説へ / 読者への問いかけ（置き去りにせず自分の答えを返す）/ あとで本文が試す一般命題 / 思い込みを肯定的に書き切ってから事実で崩す場面
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 補足: 型は 4 つ例示されるが「型は問わない」
- 重複候補: EW8（冒頭は読者の実感・困りごとから入ってよい）と重なる

### NW5

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:21
- 原文: 態度のない議題表（「本章では A、B、C を扱う」）を冒頭に置かない。
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: EW9 とほぼ同文。SK41（空虚な予告と総括）とも重なる

### NW6

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:22
- 原文: 態度を帯びた一〜二文の予告はそれ自体が緊張を作るので書いてよい
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 補足: NW5 の例外。why は「それ自体が緊張を作る」
- 重複候補: EW10 とほぼ同文

### NW7

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:23
- 原文: 立てた問いは明示的に回収する。
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 補足: 例外として「最後に一つだけ開いたまま残してよい」（narrative-writing.md:23）
- 重複候補: AW13（前方に送った論点は必ず回収する）と同趣旨

### NW8

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:23
- 原文: 回収位置を指せない問いは削る。
- 分類: 取捨選択
- 性質: 種別固有（読み物）
- 重複候補: AW14（回収しない伏線を張らない）と同趣旨。NW35（点検 2）が同じ判定を工程化している

### NW9

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:27
- 原文: 短文で足場を打ち、長めの文で流し、短文で止める。
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW10

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:27
- 原文: 長い断定文を 3 つ以上連続させない
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: NW36（点検 3）が同じ基準を工程化している

### NW11

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:28-29
- 原文: 断定だけで押し切らない。断定と逡巡（あとで裏切られる思い込み・保留・自問）を交互に置く。逡巡は弱さではなく、読者の予測を誘導してから崩す布石として使う
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 補足: why は「読者の予測を誘導してから崩す布石」
- 重複候補: NW23（状況を更新する文はためらい・思い込み・保留の表明でも残してよい）と接続

### NW12

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:30
- 原文: 転回点では「譲歩 → 転回 → 短い停止」の拍が使える
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW13

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:34
- 原文: 密な段落が 2〜3 個続いたら、疎の段落を 1 つ置く。
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW14

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:34-35
- 原文: 疎の段落の機能は、確定事項の一行固定、次の判定対象の提示、視点の距離の切替のいずれかに限る
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW15

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:36
- 原文: 具体（記録・数値・発言）に寄る段落と、意味づけで一段引く段落を交互に置く
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: NW11（断定と逡巡の交互配置）と同型の交互配置規定

### NW16

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:37
- 原文: 箇条書きは本文の呼吸を止める「間」としても使える。
- 分類: 表記・記法
- 性質: 種別固有（読み物）
- 重複候補: RD7（並列の列挙は箇条書き）と用途の規定が異なる

### NW17

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:37
- 原文: 列挙のあとは項目を場面へ着地させる
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: EW7（列挙しっぱなしにせず対応づける一文を添える）と同趣旨

### NW18

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:41-42
- 原文: 理論・概念は、読者の中に名前のない違和感を作ってから、それに名前を与える形で出す。先に理論を出して例で確認する順は、読者の発見を奪う
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 補足: why は「先に理論を出して例で確認する順は、読者の発見を奪う」
- 重複候補: EW2・EW3 とほぼ同趣旨

### NW19

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:43
- 原文: 節の頭を「本節では〜を扱う」の宣言で始めない。
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: NW5（議題表を冒頭に置かない）の節単位版。SK41（空虚な予告）とも重なる

### NW20

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:43-44
- 原文: 前節が残した違和感の言い直し、読者が当然抱く反問（即答せず一度受けてから崩す）、書き手の告白のいずれかで入る
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: EW11（読者が抱きそうな誤解・反問を具体的に書き出してから解消する）と重なる

### NW21

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:45
- 原文: 節末に「次は〜を見る」型の進行予告を置かない。節間の推進力は次節の頭で作る
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: SK15（執筆予定の宣言は削る）、SK41（空虚な予告）と重なる

### NW22

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:46
- 原文: 山場で効かせる情報（数値・固有の事実）を、手前の段落で先出ししない
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: EW15（節の結論を言い切って山場を先に消す見出しにしない）と同趣旨

### NW23

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:52
- 原文: 状況を更新する文は、ためらい・思い込み・保留の表明でも残してよい（緩みとして働く）
- 分類: 取捨選択
- 性質: 種別固有（読み物）
- 補足: 共通の判定軸（narrative-writing.md:49-50）「判定軸は一つ。その文が更新するのは「状況」（対象世界の出来事・データ・語り手の判断状態）か、「文書」（この文章自身の見え方・進行）か。」
- 重複候補: SK15（対象を語る文か文章自身を語る文かで削る判定）と同じ判定軸

### NW24

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:53-54
- 原文: 文書しか更新しない文（「ここまでだと概念の説明に見えるだろう」「次に例へ戻す」）は削る。短い断定調に整形しても駄文のまま。削って論理が飛ぶなら状況側の文に書き換える
- 分類: 取捨選択
- 性質: 種別固有（読み物）
- 補足: 削ると論理が飛ぶ場合は状況側の文に書き換える
- 重複候補: SK15 とほぼ同型（削る／書き換えるの分岐まで一致）。SK39（AI 口調の型を使わない）とも接続

### NW25

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:56-57
- 原文: 例外として残せる形は 4 つ: 具体的な誤読を「」で引用して退ける反論処理 / 境界に置く問いの設置と回収 / 境界での読者への依頼・断り / 例の枠の開閉（「〜としよう」）
- 分類: 取捨選択
- 性質: 種別固有（読み物）
- 補足: NW24 の例外集合。NW33（点検 1）とNW37（点検 4）がこの 4 形を参照する
- 重複候補: EW11（具体的な誤解を書き出してから解消する）と 1 形目が重なる

### NW26

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:61
- 原文: 例示は行為者を主語にした動作の連なりで書く。結果の羅列や受動態で流さない
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW27

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:62
- 原文: 読者を「あなた」と呼ぶのは章の冒頭・結びなどの境界に限る。
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: RD23（読者を「あなた」と呼ばない）と重なる。RD は全面禁止、NW は境界のみ許可

### NW28

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:62
- 原文: 論証の中では役割名で書く
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: RD23（必要なら役割名（利用者・管理者）で書く）とほぼ同文

### NW29

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:63
- 原文: 溜め・修辞疑問・感嘆符・短い決め台詞（独立段落でも、段落内の短い体言止めでも）は、議論の山場に限って使う
- 分類: 文レベル
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW30

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:64
- 原文: 本文中の太字強調は論理の要所に限り、一節に一、二箇所まで
- 分類: 表記・記法
- 性質: 種別固有（読み物）
- 重複候補: SK44（装飾の型: `**ラベル**:` の連発を使わない）と重なる

### NW31

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:65
- 原文: 結びは抽象論や一般則で終えない。
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: なし

### NW32

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:65
- 原文: 冒頭の場面・読者の経験・序盤の問いへ着地させてから閉じる
- 分類: 構成・順序
- 性質: 種別固有（読み物）
- 重複候補: NW7（立てた問いは明示的に回収する）と重なる

### NW33

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:69-71
- 原文: 段落頭の文と独立した短文をすべて拾い、状況更新か文書更新かを判定する。（中略）文書側は例外 4 形に該当しない限り削除するか書き換える
- 分類: 検知・レビュー手順
- 性質: 種別固有（読み物）
- 補足: 執筆後の点検工程 1。工程そのものではなく、埋め込まれた規範（判定と、文書側の削除・書き換え）を抽出した。（中略）部分は NW34 として別立て
- 重複候補: NW24 の点検版

### NW34

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:70
- 原文: 規範由来の語彙（「緊張」「回収」「拍」など）をそのまま使った文も文書更新側として扱う。
- 分類: 検知・レビュー手順
- 性質: 種別固有（読み物）
- 補足: NW33 の判定に埋め込まれた独立した規定なので分離した
- 重複候補: なし

### NW35

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:72
- 原文: 立てた問い・思い込み・約束を列挙し、それぞれの回収位置を指す。指せないものは回収を書くか、問いごと削る
- 分類: 検知・レビュー手順
- 性質: 種別固有（読み物）
- 補足: 執筆後の点検工程 2 に埋め込まれた規範
- 重複候補: NW7・NW8 の点検版。AW13・AW14 とも重なる

### NW36

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:73
- 原文: 長い断定文が 3 つ以上連続する箇所を探し、短い足場か逡巡を挟む
- 分類: 検知・レビュー手順
- 性質: 種別固有（読み物）
- 補足: 執筆後の点検工程 3 に埋め込まれた規範
- 重複候補: NW10・NW11 の点検版

### NW37

- 位置: plugins/japanese-text-writing/skills/japanese-text-writing/references/narrative-writing.md:74
- 原文: 二人称の呼びかけ・依頼・謙抑が本文中盤にないか確認し、あれば境界へ移すか削る
- 分類: 検知・レビュー手順
- 性質: 種別固有（読み物）
- 補足: 執筆後の点検工程 4 に埋め込まれた規範
- 重複候補: NW27・NW28（「あなた」は境界に限る）の点検版。NW25 の 3 形目（境界での読者への依頼・断り）とも接続

## 検算用の集計

| ファイル | 抽出条項数 | 総行数 | 見出し数 (`^#{2,4}`) | 箇条書き数 (`^\s*[-*]`) |
| --- | --- | --- | --- | --- |
| SK (SKILL.md) | 47 | 131 | 11 | 41 |
| RD (references/reference-docs.md) | 23 | 45 | 4 | 16 |
| DD (references/decision-docs.md) | 22 | 35 | 3 | 15 |
| AW (references/academic-writing.md) | 22 | 34 | 3 | 15 |
| EW (references/explanatory-writing.md) | 15 | 37 | 4 | 11 |
| NW (references/narrative-writing.md) | 37 | 74 | 7 | 24 |
| 合計 | 166 | 356 | 32 | 122 |

箇条書き数は frontmatter の `sources:` 配下も含む生の grep 値（SK 6 行、RD 3 行、DD 2 行、AW 2 行、EW 2 行、NW 2 行）。

### 旧抽出（2026-07-30）との件数差

参考値は SK 27 / RD 13 / DD 13 / AW 13 / EW 9 / NW 21（計 96）で、今回は 166 件。差の見立ては 3 点。

- 旧抽出は箇条書き 1 行 = 1 件に近い粒度で、RD 13 は本文の箇条書き 13 行（16 − frontmatter 3）と完全に一致する。今回は「1 文に独立した規定が 2 つあれば 2 件に割る」という指示に従い、1 つの箇条書きから 2〜3 件を切り出した（例: RD11 と RD12 は「手順の前に前提、後に完了確認」の 1 行から 2 件）
- 箇条書き以外の地の文にある規範を今回は拾った。SK の分類判定表・SK4（表にない文書種の判定）・各 reference 冒頭の「対象/最優先事項」宣言（RD1・DD1・EW1・NW1）・総則行（SK39・DD17・RD16・AW1・NW2）がこれに当たる
- NW の「執筆後の点検」4 工程から、埋め込まれた規範を 5 件（NW33〜NW37）抽出した。工程の実行順は抽出していない
