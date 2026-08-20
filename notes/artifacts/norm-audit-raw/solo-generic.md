# 単独の汎用条項（重複候補なし × 性質=汎用）

1350 条項のうち、抽出時に重複相手が挙がらず、かつ媒体・種別に依存しないと判定された 63 件。
重複グループの判定が終わったあとに、単独で処遇を決める対象。

重複候補が「なし」であることは抽出 agent の判定で、重複が実在しないことの保証ではない。
判定のときに既存 rule への grep で裏を取る。

## その他（4 件）

- `IS8` 「特定プロジェクトの仕組みを知っている」のではなく、「目の前のプロジェクトを読んで合わせる」。
    - 位置: plugins/impl-spec/skills/requirements/SKILL.md:29
- `JR1` 日本語のテキストを出力するすべての場面（md ファイル・ターミナル返答・HTML 報告）に適用する。
    - 位置: rules/japanese-text-writing.md:3
- `SK11` 構成順について共通原則と分類別規範が衝突したら、分類別規範を優先する
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:55
- `SS49` 既存ファイルに追記で済むなら追記。新規ファイル乱立を避ける。
    - 位置: plugins/session/skills/retrospective/SKILL.md:88

## 取捨選択（12 件）

- `IS14` 取り込んだ概要から、実装の対象範囲を推定する。<br>この時点では推定にとどめ、確定は Phase 3 で行う。
    - 位置: plugins/impl-spec/skills/requirements/SKILL.md:54-55
- `IS309` スコープ整合性: スコープセクションで除外したものが、他のセクションで暗黙に含まれていないか
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:38
- `IS338` read-only agent。成果物の修正はしない
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:95
- `IS341` ドメイン知識に基づく判断 (要件の妥当性、設計の適切さ) はスコープ外。構造的・形式的な品質だけをチェックする
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:97
- `SK16` 読者が自力で補える中間段階の説明は書かない
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:64
- `SK17` 数文にわたる議論を一文に圧縮できるなら、圧縮した一文だけを残す
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:65
- `SK21` 短さのために重要な情報を落とさない。削ってよいのは冗長（同じ情報の重複）だけで、前提・条件・例外・反例・数値は圧縮後も残す
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:81-82
- `SK23` 列挙を「など」でぼかして情報を落とさない。網羅できるなら全件書き、省くなら省いたことを明示する
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:84
- `SK33` 後で参照する必要のない固有名（ファイル名・関数名・識別子）を本文に出さず、一般的な言い方で済ませる
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:101
- `SS43` | 優先度 | 基準 | 対応 | / | A | 実害があった + 将来再現する | 強く推奨 | / | B | 再利用価値が高い | 推奨 | / | C | あると便利、実害は小 | 任意 | / | D | 無関係 / 一度きり | 不要 |
    - 位置: plugins/session/skills/retrospective/SKILL.md:59-64
- `SS44` パターンとして再現するかで判断する (発生回数ではない)
    - 位置: plugins/session/skills/retrospective/SKILL.md:68
- `SS45` 1 回でもパターン化できるものは対象
    - 位置: plugins/session/skills/retrospective/SKILL.md:69

## 形式・媒体判定（5 件）

- `IS294` 案内内容はプロジェクトのワークフローに合わせる (手動実装、team-implement への引き渡し等)。
    - 位置: plugins/impl-spec/skills/test-plan/SKILL.md:336
- `SK1` ジャンルが混在する文書は節単位で分類を切り替える（例: README の中の設計判断の節には判断文書の規範を適用する）
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:24
- `SK3` | 書くもの | 分類 | reference |<br>| README・API リファレンス・設定ガイド | 参照 | 参照ドキュメントの規範 |<br>| 運用手順・セットアップ手順 | 参照 | 同上 |<br>| rule・CLAUDE.md・skill などの規範・運用文書 | 参照 | 同上（特に「関心事の分離」） |<br>| 設計書・ADR・RFC・提案書 | 判断 | 判断文書の規範 |<br>| 技術調査・検証レポート・ベンチマーク | 判断 | 同上 |<br>| 障害報告・進捗報告・PR 説明・ターミナルでの報告 | 判断 | 同上 |<br>| Issue・コミットメッセージ・チャットでの連絡 | 判断 | 同上（報告の短縮形） |<br>| HTML 報告・確認フォームの本文 | 判断 | 同上（画面構成は参照の規範も併用） |<br>| 論文・研究報告・学術寄りの厳密な記事 | 論文 | 論文・学術文書の規範 |<br>| 技術ブログ・入門記事・解説文 | 解説 | 解説・入門記事の規範 |<br>| エッセイ・書籍の章・物語的な構成の文章 | 読み物 | 読み物の規範 |
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:31-43
- `UC5` 調査・比較・検証の依頼で、着手の時点で分量が読めるならそこで決めてよい。
    - 位置: rules/user-communication-format.md:9
- `UC6` 量と性質で選ぶ。
    - 位置: rules/user-communication-format.md:13

## 文レベル（14 件）

- `FN32` 変更点の明示: 過去回の内容から変えた箇所を「〜のまま」と書かない。
    - 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:49
- `HC169` テーブルのセルは流し読みできる短い判定値（体言止め・記号・数値）にし、文を書かない。
    - 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:287
- `IS339` 指摘は事実ベースで行う。
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:96
- `SK22` 助詞を省略しない。「は・を・に・から」で語と語の関係を明示する
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:83
- `SK29` 検出・保証・解決を「必ず」できるかのように書かない。条件付きで正確に述べる
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:94
- `SK34` 修飾語は係り先の直前に置く。
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:102
- `SK36` 一文を長くしすぎない。接続の多い長文は文を分ける。ただし導入で必要な文脈共有（範囲・観点・前提）を削って短くしない
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:103-104
- `SK37` 二重否定を使わない。
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:105
- `SK38` 同じ助詞の連続（「の」の三連など）を避ける
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:105
- `SK40` 誇張形容: 「非常に重要」「画期的」「革新的」「強力な」「シームレスな」。根拠のない評価語を消し、事実と数値で示す
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:111-112
- `SK42` 分析風の付け足し: 「〜を浮き彫りにしている」「〜を示唆している」。事実で文を止める
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:115
- `SK45` 文頭接続詞の連発: 同一段落内で 2 文以上連続の文頭接続詞（「さらに」「また」「そのため」）を置かない。段落頭で前段落との論理関係を示す接続表現は対象外
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:118-119
- `SK46` チャット残留: 「以下に示します」「お役に立てば幸いです」「素晴らしい質問ですね」
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:120
- `SK47` 回りくどい繋辞: 「〜として位置づけられている」「〜と言えるでしょう」は「〜だ」に直すか削る
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:121

## 文書種別の構造（1 件）

- `IS333` 各指摘には以下を含める:
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:73

## 検知・レビュー手順（12 件）

- `IS20` いずれの場合も Read / Grep / Glob は補助的に使える。
    - 位置: plugins/impl-spec/skills/requirements/SKILL.md:70
- `IS209` 明示されていない項目は Phase 2 の調査で推定する:
    - 位置: plugins/impl-spec/skills/test-plan/SKILL.md:75
- `IS308` 内部整合性: 文書内で矛盾する記述がないか
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:37
- `SS147` 上から順に実行する。前の段で見つけた食い違いは、後の段の前提にしない。
    - 位置: plugins/session/agents/handover-reviewer.md:39
- `SS160` handover が **他のファイルの中身** について述べている箇所を列挙し、実物に当たって確かめる。ここが機械化できない唯一の突合で、この agent が持つ理由でもある。
    - 位置: plugins/session/agents/handover-reviewer.md:72-73
- `SS161` 台帳・設計ドキュメントの件数（「未解決課題は 2 件」等）が実物と一致するか
    - 位置: plugins/session/agents/handover-reviewer.md:75
- `SS162` 「〜に記録した」「〜に書いてある」の参照先に、実際にその内容があるか
    - 位置: plugins/session/agents/handover-reviewer.md:76
- `SS163` 引用符で括った箇所が原文と一致するか
    - 位置: plugins/session/agents/handover-reviewer.md:77
- `SS164` 過去の回の決定を引くとき、その決定が実在するか。`git show <rev>:<path>` で当たれる
    - 位置: plugins/session/agents/handover-reviewer.md:78
- `SS60` インシデントから 3 段階以上遡る: - 何をしたか (行動) - なぜそうしたか (判断) - なぜそう判断したか (前提・思考パターン)
    - 位置: plugins/session/skills/retrospective/SKILL.md:126-130
- `SS62` ルールを書いたら、元のインシデントの場面を具体的に再現する: - 「自分がまさにあの行動をしようとしている瞬間に、このルールを読んだら止まるか？」 - 止まらないなら、なぜ止まらないかを分析してルールを修正する
    - 位置: plugins/session/skills/retrospective/SKILL.md:137-140
- `SS64` 広すぎないか: 何にでも当てはまって判断基準にならないルールになっていないか。誰でも同意するが行動を変える基準にならないなら広い
    - 位置: plugins/session/skills/retrospective/SKILL.md:145

## 構成・順序（2 件）

- `HC217` 1 つの節で 3 語を超えるなら、説明の順序か構成が間違っている。語を減らすか節を分ける
    - 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:350
- `SK13` 段落の最初の文で、その段落が何の話か分かるようにする（全分類共通）
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:56

## 目的・読者の確定（1 件）

- `HC149` 本文を書く前に 2 つ整理する（必須・最初にやる）／構成と出力に入る前に、次の 2 つを先に決める。
    - 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:247-249

## 確認・質問の作り方（6 件）

- `FN14` 管理物の増加への警戒: 専用ファイル・独立 skill 等の新規管理物を増やす提案は、増減の検算と負債リスクの明示を伴う
    - 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:33
- `FN15` 最小ロードの粒度: rule 等の適用範囲は「本当にそれを必要とする対象」に絞られているかを疑う（広域ひとまとめを許さない）
    - 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:34
- `IS129` 各選択肢のトレードオフ (実装コスト、保守性、パフォーマンス、既存コードとの一貫性) を明示する
    - 位置: plugins/impl-spec/skills/design/SKILL.md:154
- `IS234` スキップする旨をユーザーに報告する。
    - 位置: plugins/impl-spec/skills/test-plan/SKILL.md:182
- `IS4` 質問の粒度・観点はプロジェクトのドメインとアーキテクチャに合わせる
    - 位置: plugins/impl-spec/skills/requirements/SKILL.md:25
- `IS43` 分ける場合は事前に全体計画を提示する
    - 位置: plugins/impl-spec/skills/requirements/SKILL.md:121

## 表記・記法（6 件）

- `IS337` 指摘にはどちらの文書に修正が必要かを明記する:
    - 位置: plugins/impl-spec/agents/spec-reviewer.md:87
- `SK31` 新しい概念に名前を付ける前に既存の一般用語を探し、独自語を作らない
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:99
- `SK35` 複合語句のスコープが曖昧なら「」で括る
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:102
- `SK44` 装飾の型: `**ラベル**:` で始まる箇条書きの連発、絵文字 bullet、項目数を 3 に揃えた列挙
    - 位置: plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md:117
- `SS175` 日本語で書く
    - 位置: plugins/session/agents/handover-reviewer.md:112
- `SS57` 各項目の対話開始時に `[x/n] {項目名}` 形式で進捗を示す。
    - 位置: plugins/session/skills/retrospective/SKILL.md:110

