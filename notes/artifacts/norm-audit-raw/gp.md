# 条項抽出: GP（github-pr）

## plugins/github-pr/skills/create/SKILL.md

### GP1

- 位置: plugins/github-pr/skills/create/SKILL.md:8
- 原文: gh CLI を優先し、利用不可時は MCP ツールにフォールバックする。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP8 / GP16（同趣旨の gh → MCP フォールバックが同ファイル内で 3 回）

### GP2

- 位置: plugins/github-pr/skills/create/SKILL.md:29
- 原文: 連続的な PR（Phase 1 → 2 → 3 等）では、前の PR のブランチから派生していることが多い。PR 作成前にベースブランチを確認し、ユーザーに提示する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 前段の「派生していることが多い」が確認を課す理由。
- 重複候補: GP3（同じベースブランチ確認を条件付きで再掲）

### GP3

- 位置: plugins/github-pr/skills/create/SKILL.md:31
- 原文: `main` 以外がベースの場合 → ユーザーにベースブランチを確認（「ベースブランチは `phase2/...` で合っていますか？」）
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: GP2

### GP4

- 位置: plugins/github-pr/skills/create/SKILL.md:32
- 原文: ベースが他の PR のブランチの場合 → その PR が先にマージされる必要がある旨を本文の WARNING に反映する（ステップ3 参照）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: GP29 / GP30（generate-body.md の WARNING 規定）

### GP5

- 位置: plugins/github-pr/skills/create/SKILL.md:43
- 原文: PR あり → URL を報告し、更新するか確認。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: GP19（エラーハンドリング表「PR が既に存在 | URL を報告し、更新を提案」）

### GP6

- 位置: plugins/github-pr/skills/create/SKILL.md:43
- 原文: 以降の作成フローは実行しない
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP7

- 位置: plugins/github-pr/skills/create/SKILL.md:47
- 原文: [generate-body.md](references/generate-body.md) に従い、規模判定・テンプレート選択・タイトル生成・本文生成を行う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP149（update-pr.md「body の生成ルールは generate-body.md に従う」）

### GP8

- 位置: plugins/github-pr/skills/create/SKILL.md:58
- 原文: gh CLI が利用できない場合は MCP にフォールバック:
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP1 / GP16

### GP9

- 位置: plugins/github-pr/skills/create/SKILL.md:74
- 原文: [post-line-comments.md](references/post-line-comments.md) に従い、PR の差分に行指定コメントを追加する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP155（update-pr.md の同趣旨の参照）

### GP10

- 位置: plugins/github-pr/skills/create/SKILL.md:75
- 原文: ショート版テンプレートの場合は行指定コメント不要。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP118（short/rules.md「行指定コメントは不要（変更が自明なため）」）

### GP11

- 位置: plugins/github-pr/skills/create/SKILL.md:79
- 原文: 以下を表示:（- PR URL / - PR 番号 / - タイトル / - ブランチ: `<head> → <base>` / - 差分コメント数（行指定 + ファイル））
- 分類: その他
- 性質: 媒体固有
- 補足: 作成フロー完了時の報告項目の指定（本文 79-85 行）。
- 重複候補: GP158 / GP167（update-pr.md の報告フォーマット指定）

### GP12

- 位置: plugins/github-pr/skills/create/SKILL.md:91
- 原文: | title | PR タイトル（日本語） | コミットから自動生成 |
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: タイトルの言語を日本語に固定し、既定の生成元をコミットとする規定。
- 重複候補: GP25（generate-body.md「ユーザー指定のタイトルを使用、またはコミットから自動生成（日本語）」）

### GP13

- 位置: plugins/github-pr/skills/create/SKILL.md:92
- 原文: | base | ベースブランチ | main |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP14

- 位置: plugins/github-pr/skills/create/SKILL.md:93
- 原文: | draft | ドラフト PR として作成 | true |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP26 の前提（generate-body.md「PR は draft で作成される」）

### GP15

- 位置: plugins/github-pr/skills/create/SKILL.md:107
- 原文: | gh 未認証 | `gh auth login` を提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: address-review/SKILL.md:241 の同一行

### GP16

- 位置: plugins/github-pr/skills/create/SKILL.md:108
- 原文: | gh CLI 利用不可 | MCP ツールにフォールバック |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP1 / GP8

### GP17

- 位置: plugins/github-pr/skills/create/SKILL.md:109
- 原文: | main との差分なし | 警告を表示して中止 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP18

- 位置: plugins/github-pr/skills/create/SKILL.md:110
- 原文: | コミットされていない変更あり | コミットまたは stash を提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP19

- 位置: plugins/github-pr/skills/create/SKILL.md:111
- 原文: | PR が既に存在 | URL を報告し、更新を提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP5

### GP20

- 位置: plugins/github-pr/skills/create/SKILL.md:112
- 原文: | Review API 失敗 | 行指定コメントをスキップし、PR URL のみ報告 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

## plugins/github-pr/skills/create/references/generate-body.md

### GP21

- 位置: plugins/github-pr/skills/create/references/generate-body.md:5
- 原文: 事前に取得した差分情報から PR のテンプレートを選択する。判断軸はファイル数や行数ではなく **差分を見れば変更内容が自明に理解できるか** にある。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 判定基準は 8-10 行の表（ショート版=「差分を見れば変更内容が自明に理解できる。レビュアーが本文の補助なしで判断できる」/ ロング版=「設計判断・非自明な理由・複数箇所の連携があり、レビュアーが全体像を把握するのに本文の補助が必要」）と 14-15 行の典型例（ショート版: 単一箇所のバグ修正、ドキュメント更新、config bump、コメント/文言修正、リネーム、依存バージョン更新、ルール/スキル/プロンプトの調整 / ロング版: 新機能追加、アーキテクチャ変更、複数箇所をまたぐリファクタ、バグの根本原因が非自明、複数の独立した変更を含む）。
- 重複候補: なし

### GP22

- 位置: plugins/github-pr/skills/create/references/generate-body.md:5
- 原文: 多ファイルでも内容が自明ならショート版でよい。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: GP21

### GP23

- 位置: plugins/github-pr/skills/create/references/generate-body.md:17
- 原文: 判断が難しい場合はユーザーに確認する。
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 「迷ったらユーザーに確認する」は媒体を問わない汎用の作法だが、ここでは PR テンプレート選択という媒体固有の判断に限定されている。
- 重複候補: GP2 / GP144（他のユーザー確認規定）

### GP24

- 位置: plugins/github-pr/skills/create/references/generate-body.md:19
- 原文: リポジトリに `.github/PULL_REQUEST_TEMPLATE.md` が存在する場合はそのテンプレートを優先する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: なし

### GP25

- 位置: plugins/github-pr/skills/create/references/generate-body.md:23
- 原文: ユーザー指定のタイトルを使用、またはコミットから自動生成（日本語）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP12

### GP26

- 位置: plugins/github-pr/skills/create/references/generate-body.md:27
- 原文: PR は draft で作成される。本文の**最下部 (How to check の後)** に以下の折りたたみを挿入する。PR author が draft → open にする前に確認すべき最低限のタスク。
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: 挿入する内容は 30-37 行の `<details open><summary>Pre-open checklist</summary>` ブロックで、項目は「- [ ] PR body の内容を確認した（必要に応じて手動で書き換えてよい）」「- [ ] セルフレビューをし、行指定コメントの内容を確認した」「- [ ] How to check のリスト内容が妥当であることを確認した」「- [ ] How to check の各項目を確認しチェックをつけた」の 4 件。
- 重複候補: GP27（同じ「最下部に置く」を配置ルールとして再掲）

### GP27

- 位置: plugins/github-pr/skills/create/references/generate-body.md:42
- 原文: レビュアー視点で本文の先頭にあるとノイズになるため、最下部に置く
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: why は「レビュアー視点で本文の先頭にあるとノイズになる」。
- 重複候補: GP26

### GP28

- 位置: plugins/github-pr/skills/create/references/generate-body.md:43
- 原文: デフォルトは `open` 属性を付けて開いたままにする。チェックボックスをクリックするたびに閉じるのを避けるため
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は「チェックボックスをクリックするたびに閉じるのを避けるため」。
- 重複候補: なし

### GP29

- 位置: plugins/github-pr/skills/create/references/generate-body.md:47
- 原文: ベースブランチが `main` 以外の場合（= 他の PR のブランチから派生している場合）、本文の最先頭に以下を記載する:
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: 記載内容は 50-51 行の `> [!WARNING]` / `> #XX から先にマージします`。`#XX` はベースブランチに対応する PR 番号（54 行）。
- 重複候補: GP4 / GP30

### GP30

- 位置: plugins/github-pr/skills/create/references/generate-body.md:54
- 原文: この WARNING はテンプレートの構成よりも前（本文の1行目）に置く。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP29

### GP31

- 位置: plugins/github-pr/skills/create/references/generate-body.md:55
- 原文: `#XX` の書き方は [formatting-rules.md の「PR 参照 (`#XX`) の書き方」](shared/formatting-rules.md) に従う。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP45（同一ファイル 90 行に同じ参照）

### GP32

- 位置: plugins/github-pr/skills/create/references/generate-body.md:59
- 原文: 選択したテンプレートとルールを Read し、その構成に従って本文を生成する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP33

- 位置: plugins/github-pr/skills/create/references/generate-body.md:65
- 原文: 一文は短く。接続が多い長文より、短文 + 箇条書き
- 分類: 文レベル
- 性質: 汎用
- 補足: 節の導入（63 行）に why がある。「PR 本文は `.md` ファイルではないため、Markdown 向けの整形ルールが自動適用されない」。規範そのものは媒体非依存。
- 重複候補: GP41（79 行「短文 + 箇条書きで、1 ブロックの分量を軽く保つ」）

### GP34

- 位置: plugins/github-pr/skills/create/references/generate-body.md:66
- 原文: 複数の文が改行なく続く長い段落は避ける。話題や論点の区切りで改行・空行を入れる
- 分類: 文レベル
- 性質: 汎用
- 重複候補: GP35 / GP41

### GP35

- 位置: plugins/github-pr/skills/create/references/generate-body.md:67
- 原文: 3〜4 文を超えるなら段落を分けるか箇条書きに切り替える
- 分類: 文レベル
- 性質: 汎用
- 重複候補: GP34

### GP36

- 位置: plugins/github-pr/skills/create/references/generate-body.md:71
- 原文: PR 本文の冒頭 (概要セクション) は、レビュアーが背景知識なしで、ぱっと見で主題を把握できるように書く。PR 本文は内部調査の過程や発見順から書いてしまいがちなので、明示的に意識する。
- 分類: 構成・順序
- 性質: 汎用
- 補足: 「読者が背景知識なしで冒頭で主題を把握できるように書く」は結論先行・読者想定の汎用規範を PR 本文の語彙で述べたもの。why は「内部調査の過程や発見順から書いてしまいがち」。
- 重複候補: GP40（78 行「結論から書く。調査の過程や発見順から始めない」）

### GP37

- 位置: plugins/github-pr/skills/create/references/generate-body.md:75
- 原文: **「何の PR か」を 1 フレーズで言い切る → 詳細はネストで**
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 「最初に 1 フレーズで言い切る」は汎用の結論先行だが、「詳細はネストで」は箇条書きのネストという表現形式に踏み込んでいる。
- 重複候補: GP38（直下で同趣旨を再掲）

### GP38

- 位置: plugins/github-pr/skills/create/references/generate-body.md:76
- 原文: 概要の最初の行は「◯◯ の改善です」「◯◯ のバグ修正です」のような 1 フレーズ宣言にする
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 中身は結論先行の汎用規範。例文が PR 固有（改善・バグ修正）なだけ。
- 重複候補: GP37

### GP39

- 位置: plugins/github-pr/skills/create/references/generate-body.md:77
- 原文: 複数の情報 (何を・なぜ・どう) を 1 行に詰め込まない。詳細は下のネスト箇条書きに分ける
- 分類: 文レベル
- 性質: 汎用
- 重複候補: GP46（90 行「1 行に詰めず、独立した箇条書き項目にする」）

### GP40

- 位置: plugins/github-pr/skills/create/references/generate-body.md:78
- 原文: 結論から書く。調査の過程や発見順から始めない
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: GP36

### GP41

- 位置: plugins/github-pr/skills/create/references/generate-body.md:79
- 原文: 短文 + 箇条書きで、1 ブロックの分量を軽く保つ。ぱっと見で重い段落を作らない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: GP33 / GP34 / GP35

### GP42

- 位置: plugins/github-pr/skills/create/references/generate-body.md:80
- 原文: 読者が知りたい順に並べる。順番の例はいくつかあり、PR の性質で変わる
- 分類: 構成・順序
- 性質: 汎用
- 補足: 例（81-83 行）は「バグ修正: 症状 → 原因 → 対応」「機能追加: 何を作ったか → なぜ必要か → 変更の要点」「リファクタ: 何を整理したか → 動機 → 影響範囲」。84 行に「順番は一例。PR ごとに読者が一番知りたい順を考える」という判定基準。
- 重複候補: GP36 / GP40

### GP43

- 位置: plugins/github-pr/skills/create/references/generate-body.md:85
- 原文: 概要と変更の詳細で抽象レベルを分ける
- 分類: 構成・順序
- 性質: 汎用
- 補足: 86-87 行に区分の定義（概要=方針レベル「◯◯ の方針を追加」「◯◯ の挙動を変更」/ 変更の詳細=実装レベル（セクション名、関数名、コード変更））。
- 重複候補: GP93（long/rules.md:9「箇条書きは要点のピックアップ。変更の詳細…は書かない」）

### GP44

- 位置: plugins/github-pr/skills/create/references/generate-body.md:88
- 原文: 概要でセクション名や関数名を繰り返さない。重複になる
- 分類: 構成・順序
- 性質: 汎用
- 補足: 「一つの主張は一度だけ書く」の PR 版。why は「重複になる」。
- 重複候補: GP43

### GP45

- 位置: plugins/github-pr/skills/create/references/generate-body.md:90
- 原文: PR 番号 (`#XX`) の書き方は [shared/formatting-rules.md](shared/formatting-rules.md) の「PR 参照 (`#XX`) の書き方」に従う。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP31

### GP46

- 位置: plugins/github-pr/skills/create/references/generate-body.md:90
- 原文: 1 行に詰めず、独立した箇条書き項目にする。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP82（formatting-rules.md:32 の同趣旨）/ GP39

### GP47

- 位置: plugins/github-pr/skills/create/references/generate-body.md:94
- 原文: 冒頭で要点を伝える目的のために、以下を使える場面があれば使う。該当しない PR では不要:
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 以下 GP48-GP53 が列挙された手段。
- 重複候補: なし

### GP48

- 位置: plugins/github-pr/skills/create/references/generate-body.md:96
- 原文: 症状の Before/After 対比 (「本来 X / 実際 Y」のような短い対比)
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 「理想と現状を短い対比で示す」は媒体非依存の説明手段だが、ここでは PR 冒頭の要点提示の手段として置かれている。
- 重複候補: GP79（formatting-rules.md の「対比の主語を明示する」と対象が重なる）

### GP49

- 位置: plugins/github-pr/skills/create/references/generate-body.md:97
- 原文: 症状を示す外部リンク (Slack 通知、Actions run、Issue、Sentry 等)
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP85（外部ソースのリンク付与）

### GP50

- 位置: plugins/github-pr/skills/create/references/generate-body.md:98
- 原文: スクリーンショット埋め込み (URL だけでなく `<img>` タグで本文中に直接埋める)
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### GP51

- 位置: plugins/github-pr/skills/create/references/generate-body.md:99
- 原文: 定常フロー外のきっかけの明示 (Slack 議論、会議の話題、思いつき、障害通知 等)
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 100 行に例外「project によっては「定常フロー」自体がないこともある。その場合は「何がきっかけで思い立ったか」を素直に書く」。
- 重複候補: なし

### GP52

- 位置: plugins/github-pr/skills/create/references/generate-body.md:101
- 原文: 主目的以外の「おまけ変更」の予告 (本来は別 PR 推奨だが、まとめる場合は冒頭で開示)
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 括弧内に「本来は別 PR 推奨」という別の推奨が畳まれている。
- 重複候補: なし

### GP53

- 位置: plugins/github-pr/skills/create/references/generate-body.md:102
- 原文: 「原因ではない可能性」の先回り排除 (レビュアーが自然に疑いそうな別原因を「〜は正しかった」と明示)
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「読者が抱く疑問を先回りして書く」は汎用の読者想定に接続するが、記述は PR レビューの文脈に閉じている。
- 重複候補: なし

### GP54

- 位置: plugins/github-pr/skills/create/references/generate-body.md:106
- 原文: 背景知識としてリポジトリ内の既存ドキュメントを参照する場合、main の最新ではなく commit ハッシュ付き permalink を使う。将来ドキュメントが更新されてもレビュアーが PR 作成時点の内容を参照できる。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は 2 文目。リンク形式は 109 行 `https://github.com/{owner}/{repo}/blob/{commit_sha}/path/to/doc.md`。
- 重複候補: なし

### GP55

- 位置: plugins/github-pr/skills/create/references/generate-body.md:112
- 原文: `{commit_sha}` は PR の HEAD コミット (`git rev-parse HEAD`) を使うのが分かりやすい。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP54

### GP56

- 位置: plugins/github-pr/skills/create/references/generate-body.md:116
- 原文: [external-citation.md](shared/external-citation.md) に従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP105 / GP129（long/rules.md と post-line-comments.md に同じ参照）

### GP57

- 位置: plugins/github-pr/skills/create/references/generate-body.md:120
- 原文: PR authorがレビュー前にチェックを入れ、検証済みの状態でレビューに出すためのセクション。レビュアーも自身の環境で同じ手順を再現できる。
- 分類: 目的・読者の確定
- 性質: 媒体固有
- 補足: How to check セクションの目的と読者（PR author とレビュアー）の規定。
- 重複候補: GP76（154 行「PR authorが結果を確認してチェックを入れる」）

### GP58

- 位置: plugins/github-pr/skills/create/references/generate-body.md:124
- 原文: **レビュー以外に確認手段がない PR では How to check セクション自体を省略してよい**。無理に埋めるとノイズになる。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 判定基準は 126-127 行。「省略可: ドキュメント/コメント/文言の修正、スキル/ルール/プロンプトの調整、意味的変更のない fmt、typo 修正」「必須: コード変更、挙動変更、バグ修正、新機能、設定の意味的変更」。why は「無理に埋めるとノイズになる」。
- 重複候補: GP108 / GP119 / GP122（long/rules.md、short/rules.md、short/template.md に同趣旨）

### GP59

- 位置: plugins/github-pr/skills/create/references/generate-body.md:129
- 原文: 境界ケース (ドキュメントだが CI で lint される、スキルだが自動検証がある等) は省略せず 1〜2 項目だけ入れる。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP58

### GP60

- 位置: plugins/github-pr/skills/create/references/generate-body.md:131
- 原文: レビューでしか判断できないこと（記述の内容面での正確性、設計の妥当性等）は含めない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### GP61

- 位置: plugins/github-pr/skills/create/references/generate-body.md:131
- 原文: 逆に、レビュアーが手動でやると面倒だがコマンドで代替できること（網羅性の grep 確認等）は積極的に入れる。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP71（149 行「grep、diff、ファイル内容の直接確認など、決定的に検証できる手段を使う」）

### GP62

- 位置: plugins/github-pr/skills/create/references/generate-body.md:131
- 原文: 実行可能なものはできるだけエビデンスを残す。コマンドなら実行結果のログ、動作確認ならキャプチャなど。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP73（151 行のエビデンス転記規定）

### GP63

- 位置: plugins/github-pr/skills/create/references/generate-body.md:133
- 原文: 以下の観点をタグとして使う。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: タグは 135-140 行の 3 種。`[正確性]`（今回の変更自体が意図通りに実現できている / テストがカバーしている、grep で変更の反映を確認できる等）、`[前提]`（変更方針の根拠（参照した情報源、前提とした事実）が正しい / 参照した公式ドキュメントへのリンク、既存実装でバグが再現し修正後に消えることの確認等）、`[デグレ]`（変更していない周辺箇所で壊れていない / 既存テストが通る、旧い参照が残っていない等）。
- 重複候補: なし

### GP64

- 位置: plugins/github-pr/skills/create/references/generate-body.md:133
- 原文: 該当する項目がない観点は省略する。無理に全観点を埋めない。
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「枠を無理に埋めない」は汎用の作法だが、対象が How to check のタグ体系という媒体固有の構造。
- 重複候補: GP58（「無理に埋めるとノイズになる」）

### GP65

- 位置: plugins/github-pr/skills/create/references/generate-body.md:144
- 原文: 主項目（チェックボックス行）は「何を確認するか」を断定形で書く。疑問形（「〜か」）にしない
- 分類: 文レベル
- 性質: 媒体固有
- 補足: 145 行に why「チェックを入れる = この状態であることを確認した、という意味になる」。
- 重複候補: なし

### GP66

- 位置: plugins/github-pr/skills/create/references/generate-body.md:146
- 原文: 確認手順はネストに書く。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP37 / GP39（詳細をネストに送る同趣旨）

### GP67

- 位置: plugins/github-pr/skills/create/references/generate-body.md:146
- 原文: 長ければ `<details>` で折りたたむ
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP99 / GP107（long/rules.md の `<details>` 折りたたみ規定）

### GP68

- 位置: plugins/github-pr/skills/create/references/generate-body.md:147
- 原文: 確認手段は確実で再現可能な方法を選ぶ。結果が毎回同じになる方法を優先する
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: 検証手段の質の規定で、文章作法とは軸が違う。ただし「根拠を確からしいものに限る」という汎用則の変種とも読める。
- 重複候補: GP71 / GP72

### GP69

- 位置: plugins/github-pr/skills/create/references/generate-body.md:148
- 原文: CI / ユニットテストがあればそれで十分。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP68

### GP70

- 位置: plugins/github-pr/skills/create/references/generate-body.md:148
- 原文: CI が自動実行される場合でも「このテストが通る」程度の言及はしてよい
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP69

### GP71

- 位置: plugins/github-pr/skills/create/references/generate-body.md:149
- 原文: grep、diff、ファイル内容の直接確認など、決定的に検証できる手段を使う
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: 手段の列挙は開発作業固有だが、「決定的に検証できるものを根拠にする」という要求自体は媒体非依存。
- 重複候補: GP61 / GP68

### GP72

- 位置: plugins/github-pr/skills/create/references/generate-body.md:150
- 原文: 「Claude に質問して回答を確認」のような非決定的な方法は避ける
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: GP71 の否定形だが、除外対象が具体的に指定されているので別条項として立てた。
- 重複候補: GP68 / GP71

### GP73

- 位置: plugins/github-pr/skills/create/references/generate-body.md:151
- 原文: コマンド結果をエビデンスとして載せる場合は Bash tool で実行し、出力をそのまま転記する。テキストとして生成しない
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 「観測結果を捏造せず実測値を載せる」は媒体を問わない事実記述の規範。
- 重複候補: GP62

### GP74

- 位置: plugins/github-pr/skills/create/references/generate-body.md:152
- 原文: 複数コマンドがある場合はスクリプトにまとめて一括実行し、stdout を貼る
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP73

### GP75

- 位置: plugins/github-pr/skills/create/references/generate-body.md:153
- 原文: Claude 等で実行した結果には実行者がわかるラベルを付ける（例: `(Claude 実行)`）
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 「事実の出所を明示する」という汎用則の一適用だが、ラベル文字列まで媒体固有に固定している。
- 重複候補: GP73

### GP76

- 位置: plugins/github-pr/skills/create/references/generate-body.md:154
- 原文: Claude が実行した結果であってもチェックボックスは `[ ]` のままにする。PR authorが結果を確認してチェックを入れる
- 分類: その他
- 性質: 媒体固有
- 補足: 2 文目は責務の所在（PR author がチェックする）。
- 重複候補: GP57

## plugins/github-pr/skills/create/references/shared/formatting-rules.md

### GP77

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:7
- 原文: このタスクや変更について何も知らない初見の人に伝えるつもりで書く。
- 分類: 目的・読者の確定
- 性質: 汎用
- 補足: 読者水準の設定そのもので、PR 固有の語彙を含まない。
- 重複候補: GP36（generate-body.md「レビュアーが背景知識なしで…把握できるように書く」）

### GP78

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:8
- 原文: 専門用語やプロジェクト固有の概念は本文中で必ず説明する。「知っているだろう」は前提にしない。
- 分類: 目的・読者の確定
- 性質: 汎用
- 補足: 2 文目は 1 文目の否定形での言い換え。
- 重複候補: GP77

### GP79

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:12
- 原文: 現状と理想の対比を書くとき、「何がそう言っているのか」を必ず明示する。
- 分類: 文レベル
- 性質: 汎用
- 補足: why は 13 行「主語がないと、このリポジトリの話なのか外部仕様の話なのかが読み取れない」。15-23 行に NG / OK の例（NG: 主語がなく曖昧「`description`/`globs`/`alwaysApply` の3フィールドを必須と記載していた」/ OK: 「このリポジトリの rule-authoring.md では…」）。
- 重複候補: GP106（long/rules.md:24 が同じ規範を参照で再掲）

### GP80

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:27
- 原文: まず箇条書きで書くことを考える。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: GP81

### GP81

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:27
- 原文: 情報の構造として比較・対応関係が明確でテーブルが適していると判断した場合のみテーブルにする。
- 分類: 表記・記法
- 性質: 汎用
- 補足: 判定基準は「情報の構造として比較・対応関係が明確」であること。
- 重複候補: GP80

### GP82

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:32
- 原文: `#XX` リンクは必ず箇条書きの独立した項目にし、後ろに文を続けない。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は 31 行「他の PR を `#37` 等で参照する場合、GitHub UI 上で PR タイトルに展開されて長くなる」。37-50 行に例（NG: 「- マージ済み, #37」「- Phase1 (#37) はフロントマターの...」）。
- 重複候補: GP46 / GP31 / GP45

### GP83

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:34
- 原文: `#XX` を主項目にし、補足情報（マージ済み、状態等）はネストする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP82

### GP84

- 位置: plugins/github-pr/skills/create/references/shared/formatting-rules.md:35
- 原文: 文脈の説明が先にある場合は、説明を主項目にして `#XX` をネストする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP83

## plugins/github-pr/skills/create/references/shared/external-citation.md

### GP85

- 位置: plugins/github-pr/skills/create/references/shared/external-citation.md:7
- 原文: 外部ソースを根拠として利用する場合、該当ページへのリンクを必ず付与する
- 分類: その他
- 性質: 汎用
- 補足: 出典明示の義務そのもので、PR 固有の要素がない。
- 重複候補: GP56 / GP105 / GP129（各所からこのファイルを参照している）

### GP86

- 位置: plugins/github-pr/skills/create/references/shared/external-citation.md:8
- 原文: セクション末尾、または箇条書きのネストにリンクを配置する
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 出典リンクの配置位置の規定。「セクション末尾かネスト」という選択肢は markdown 文書一般に通じるが、PR 本文と差分コメントを想定した書き方になっている。
- 重複候補: GP85

### GP87

- 位置: plugins/github-pr/skills/create/references/shared/external-citation.md:9
- 原文: リンクを貼る前に参照先の中身を Read / WebFetch で確認し、引用内容との正確性・整合性を検証する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 判定基準は 10-11 行「URL が有効であること」「引用している主張が参照先に実際に書かれていること」。
- 重複候補: GP73（エビデンスを生成せず実測を転記する規定）

### GP88

- 位置: plugins/github-pr/skills/create/references/shared/external-citation.md:12
- 原文: リンク切れや内容の不一致が見つかった場合はリンクを貼らず、その旨を明記する
- 分類: その他
- 性質: 汎用
- 補足: この条項は前半「リンクを貼らず」を指す。
- 重複候補: GP89（同一文の後半）

### GP89

- 位置: plugins/github-pr/skills/create/references/shared/external-citation.md:12
- 原文: リンク切れや内容の不一致が見つかった場合はリンクを貼らず、その旨を明記する
- 分類: その他
- 性質: 汎用
- 補足: この条項は後半「その旨を明記する」を指す。未確認・不確実を明示する汎用則。
- 重複候補: GP88

## plugins/github-pr/skills/create/references/long/rules.md

### GP90

- 位置: plugins/github-pr/skills/create/references/long/rules.md:3
- 原文: [テンプレート](template.md) と併せて適用する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP116（short/rules.md:3 の同一文）

### GP91

- 位置: plugins/github-pr/skills/create/references/long/rules.md:4
- 原文: 共通のフォーマットルールは [formatting-rules.md](../shared/formatting-rules.md) に従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP117 / GP124（short/rules.md:4、post-line-comments.md:5 の同一文）

### GP92

- 位置: plugins/github-pr/skills/create/references/long/rules.md:8
- 原文: 理由+要旨を接続して 1〜2 行に収める。個別にカウントしない
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP111（long/template.md:14 に同じ指示が雛形として埋め込まれている）

### GP93

- 位置: plugins/github-pr/skills/create/references/long/rules.md:9
- 原文: 箇条書きは要点のピックアップ。変更の詳細（具体的なフィールド名、パラメータ等）は書かない
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「概要には詳細を書かない」という抽象レベル分離は汎用だが、書かない対象がテンプレートのセクション構成に紐付いている。
- 重複候補: GP43（generate-body.md:85「概要と変更の詳細で抽象レベルを分ける」）

### GP94

- 位置: plugins/github-pr/skills/create/references/long/rules.md:10
- 原文: シンプルな変更ならそのまま理由+要旨を書き下せばよい
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP92

### GP95

- 位置: plugins/github-pr/skills/create/references/long/rules.md:11
- 原文: 複数の内容が混ざっていてまとめに迷う場合は、この PR の背後にある要求まで遡る。PR は何かの要求を実現するために存在するので、その要求から書き始めると全体を包括できる
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 「上位の目的まで遡って要約する」は汎用の要約技法だが、遡る先が「PR の背後にある要求」という媒体固有の概念で表現されている。why は 2 文目。
- 重複候補: GP42（読者が知りたい順の並べ方）

### GP96

- 位置: plugins/github-pr/skills/create/references/long/rules.md:12
- 原文: どうしても 1 つの要旨に包括できない場合のみ「要旨 → 箇条書き → 要旨 → 箇条書き」を繰り返す
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP95

### GP97

- 位置: plugins/github-pr/skills/create/references/long/rules.md:16
- 原文: 「全体方針」は複数 PR にまたがる連続的な変更計画の場合のみ記載。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP110（long/template.md:8 の該当セクションのプレースホルダ）

### GP98

- 位置: plugins/github-pr/skills/create/references/long/rules.md:16
- 原文: 冒頭にこの PR がシリーズの一部であることを明記し、計画の全体像は折りたたむ
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP99（同じ「見出しを残して本文を折りたたむ」型）

### GP99

- 位置: plugins/github-pr/skills/create/references/long/rules.md:17
- 原文: 「背景」「変更の詳細」はサブセクションタイトルを見出しとして残し、本文は `<details>` で折りたたむ。ぱっと見の長さを抑えてレビュアーの認知負荷を下げる
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は「ぱっと見の長さを抑えてレビュアーの認知負荷を下げる」。
- 重複候補: GP67 / GP107（同じ `<details>` 折りたたみ規定）

### GP100

- 位置: plugins/github-pr/skills/create/references/long/rules.md:18
- 原文: `<summary>` 内のテキストは `─` で装飾する: `<details><summary>─ テキスト ─</summary>`
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### GP101

- 位置: plugins/github-pr/skills/create/references/long/rules.md:19
- 原文: 「変更の詳細」は概要と背景で十分伝わるなら省略可能
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP114（long/template.md:39「{概要だけでは伝わらない場合のみ。」）

### GP102

- 位置: plugins/github-pr/skills/create/references/long/rules.md:20
- 原文: 「当初の plan」は実装時の plan が記録にある場合に追記。なければ省略
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP112（long/template.md:21 の注釈指示）

### GP103

- 位置: plugins/github-pr/skills/create/references/long/rules.md:21
- 原文: 具体的なファイルの変更箇所は行指定コメントで説明する（本文には書かない）
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP126（post-line-comments.md:15 の対応関係を示すコメント規定）

### GP104

- 位置: plugins/github-pr/skills/create/references/long/rules.md:22
- 原文: 背景や変更の詳細の `<details>` 内に隠れている参考リンクのうち、概要の理解にも重要なものがあれば、概要セクション末尾にピックアップして列挙してもよい
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP86（external-citation.md のリンク配置規定）

### GP105

- 位置: plugins/github-pr/skills/create/references/long/rules.md:23
- 原文: 背景や変更の詳細で外部ソースを根拠にする場合は [external-citation.md](../shared/external-citation.md) に従う
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP56 / GP129

### GP106

- 位置: plugins/github-pr/skills/create/references/long/rules.md:24
- 原文: 現状と理想の対比を書くときは [formatting-rules.md の「対比の主語を明示する」](../shared/formatting-rules.md) に注意
- 分類: 文レベル
- 性質: 汎用
- 補足: 参照先 GP79 と同一の規範。
- 重複候補: GP79

### GP107

- 位置: plugins/github-pr/skills/create/references/long/rules.md:25
- 原文: How to check はエビデンス（実行結果等）を含むと長くなりやすい。見出しは残し、本文を `<details>` で折りたたんでよい
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は「エビデンス（実行結果等）を含むと長くなりやすい」。
- 重複候補: GP99 / GP67

### GP108

- 位置: plugins/github-pr/skills/create/references/long/rules.md:26
- 原文: How to check はレビュー以外に確認手段がない PR ではセクションごと省略する (判断は [generate-body.md の How to check 省略可能なケース](../generate-body.md#省略可能なケース) を参照)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP58 / GP119 / GP122

## plugins/github-pr/skills/create/references/long/template.md

### GP109

- 位置: plugins/github-pr/skills/create/references/long/template.md:1
- 原文: <!-- markdownlint-disable MD041 MD022 -->
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: テンプレートファイル自身に対する lint 抑止の指示。PR 本文の書き方ではなくファイルの扱いを規定する。
- 重複候補: GP120（short/template.md:1 の同一行）

### GP110

- 位置: plugins/github-pr/skills/create/references/long/template.md:8
- 原文: {シリーズ全体の目的と各 PR の位置づけ}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「全体方針」セクションに書く内容の指定。
- 重複候補: GP97 / GP98

### GP111

- 位置: plugins/github-pr/skills/create/references/long/template.md:14
- 原文: {「A なので B をした」のように理由と要旨を接続して 1〜2 行。その下に変更の要点のみを箇条書きで簡潔に列挙}
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP92 / GP93

### GP112

- 位置: plugins/github-pr/skills/create/references/long/template.md:21
- 原文: > {注釈: memory から復元 / 後から推測して生成 のいずれか}
- 分類: その他
- 性質: 判断保留
- 補足: 記載内容の出所（復元か推測か）を注記させる指示で、事実と推測を区別する汎用則の一適用。ただし対象が「当初の plan」セクションに固定されている。
- 重複候補: GP75（実行者ラベルの付与）/ GP102

### GP113

- 位置: plugins/github-pr/skills/create/references/long/template.md:34
- 原文: {変更対象が「何であるか」「何に使われているか」の説明。レビュアーがこの PR の変更を理解するための事前知識。変更の動機もここに含める}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「背景」セクションに書く内容の指定。読者（レビュアー）の事前知識を補う目的が明示されている。
- 重複候補: GP77 / GP78

### GP114

- 位置: plugins/github-pr/skills/create/references/long/template.md:39
- 原文: {概要だけでは伝わらない場合のみ。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「変更の詳細」セクションの記載条件。
- 重複候補: GP101

### GP115

- 位置: plugins/github-pr/skills/create/references/long/template.md:39
- 原文: トピックごとにサブセクションに分ける}
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 「話題ごとに区切る」という汎用の構成則を、テンプレートのサブセクション構造として述べたもの。
- 重複候補: GP34（話題の区切りで改行・空行を入れる）

## plugins/github-pr/skills/create/references/short/rules.md

### GP116

- 位置: plugins/github-pr/skills/create/references/short/rules.md:3
- 原文: [テンプレート](template.md) と併せて適用する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP90

### GP117

- 位置: plugins/github-pr/skills/create/references/short/rules.md:4
- 原文: 共通のフォーマットルールは [formatting-rules.md](../shared/formatting-rules.md) に従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP91 / GP124

### GP118

- 位置: plugins/github-pr/skills/create/references/short/rules.md:8
- 原文: 行指定コメントは不要（変更が自明なため）
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why は「変更が自明なため」。
- 重複候補: GP10

### GP119

- 位置: plugins/github-pr/skills/create/references/short/rules.md:9
- 原文: How to check はレビュー以外に確認手段がない PR ではセクションごと省略する (ドキュメント/コメント/文言修正、スキル/ルール調整等)
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP58 / GP108 / GP122

## plugins/github-pr/skills/create/references/short/template.md

### GP120

- 位置: plugins/github-pr/skills/create/references/short/template.md:1
- 原文: <!-- markdownlint-disable MD041 MD022 -->
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP109

### GP121

- 位置: plugins/github-pr/skills/create/references/short/template.md:4
- 原文: {何をしたか、なぜしたかを簡潔に}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: Summary セクションに書く内容の指定。
- 重複候補: GP92 / GP111 / update-pr.md:149 の同型の指示（GP161）

### GP122

- 位置: plugins/github-pr/skills/create/references/short/template.md:7
- 原文: {レビュー以外に確認手段がない PR では How to check セクション自体を省略する}
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP58 / GP108 / GP119

## plugins/github-pr/skills/create/references/post-line-comments.md

### GP123

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:3
- 原文: PR 作成後、Changed files の差分に対してコメントを追加する。
- 分類: その他
- 性質: 媒体固有
- 補足: 4 行に目的「PR 本文を読んだだけでは具体がイメージしづらい変更箇所を補足説明するためのもの」。7-10 行にコメントの 2 種類の定義（行指定コメント=差分内の特定の行（範囲）に対するコメント / ファイルコメント=ファイル単位の補足コメント（行を指定しない））。
- 重複候補: GP9

### GP124

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:5
- 原文: 共通のフォーマットルールは [formatting-rules.md](shared/formatting-rules.md) に従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP91 / GP117

### GP125

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:14
- 原文: PR 本文を読めば自明な変更にはコメントしない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP44（重複を書かない）/ GP118

### GP126

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:15
- 原文: 「PR 本文のこの話は具体的にはここ」という対応関係を示したい箇所にコメントする
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP103（long/rules.md:21「具体的なファイルの変更箇所は行指定コメントで説明する」）

### GP127

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:16
- 原文: 設計判断の理由がある箇所（「こういう事情があるのでこの方法を採用した」）
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「コメントする基準」節の列挙項目で、コメントを付ける対象箇所の規定。
- 重複候補: GP126

### GP128

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:17
- 原文: 複数箇所の変更に依存関係がある場合は、コメント同士で相互参照する
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP138（94 行「コメント本文で他の箇所を参照する際はファイルパスと行番号を明記する」）

### GP129

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:18
- 原文: 外部ソースの引用は [external-citation.md](shared/external-citation.md) に従う
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP56 / GP105

### GP130

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:22
- 原文: 単一行ではなく、意味のあるまとまり（関数、セクション、設定ブロック等）を範囲指定でコメントする。
- 分類: その他
- 性質: 媒体固有
- 補足: 節見出し（20 行）が「行指定コメント: 範囲指定を基本とする」。
- 重複候補: なし

### GP131

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:26
- 原文: ファイルの削除・新規作成・リネーム・移動など、ファイル単位での補足が必要な場合はファイルコメントを使う。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 27 行に説明「行の差分に対するコメントではなく、そのファイルの変更全体に対する説明になる」。
- 重複候補: なし

### GP132

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:31
- 原文: ファイル削除: なぜ削除したか、内容の移行先はどこか
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: GP133 / GP134

### GP133

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:32
- 原文: ファイル新規作成: なぜ新設したか、既存ファイルとの関係
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: GP132 / GP134

### GP134

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:33
- 原文: リネーム・移動: 旧パスからの変更理由
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: GP132 / GP133

### GP135

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:73
- 原文: `side` はデフォルトで `RIGHT`（変更後の側）。削除行にコメントする場合は `"side": "LEFT"` を指定
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP136

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:77
- 原文: Review API の `comments` 配列は `subject_type` をサポートしていないため、ファイルコメントは個別コメント API を使う。
- 分類: その他
- 性質: 媒体固有
- 補足: why は前段の API 制約。
- 重複候補: GP137

### GP137

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:90
- 原文: 複数のファイルコメントがある場合は、それぞれ個別に API を呼ぶ。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP136

### GP138

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:94
- 原文: コメント本文で他の箇所を参照する際はファイルパスと行番号を明記する
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP128

### GP139

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:110
- 原文: 更新方針は状況に応じて判断する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP140

### GP140

- 位置: plugins/github-pr/skills/create/references/post-line-comments.md:110
- 原文: ユーザーから具体的に「このコメントを編集して」「返信で追記して」等の指示があれば、それに従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP139

## plugins/github-pr/skills/create/references/update-pr.md

### GP141

- 位置: plugins/github-pr/skills/create/references/update-pr.md:4
- 原文: 新しいコミットの追加、レビュー指摘への対応、body の手動編集など、PR が更新された後に実行する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP142

- 位置: plugins/github-pr/skills/create/references/update-pr.md:6
- 原文: 更新フローでは各アクションの結果を記録し、最後にまとめて報告する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: この条項は前半「各アクションの結果を記録し」を指す。実行箇所は 54 行・117 行・123 行・163 行の「→ 記録:」。
- 重複候補: GP143

### GP143

- 位置: plugins/github-pr/skills/create/references/update-pr.md:6
- 原文: 更新フローでは各アクションの結果を記録し、最後にまとめて報告する。
- 分類: その他
- 性質: 媒体固有
- 補足: この条項は後半「最後にまとめて報告する」を指す。
- 重複候補: GP157 / GP166

### GP144

- 位置: plugins/github-pr/skills/create/references/update-pr.md:24
- 原文: | open | → ユーザーに確認して分岐（下記参照） |
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 選択肢の説明は 30-31 行。「全体見直し: まだ誰もレビューしていない等、body を書き直してよい場合。draft と同じフロー（ステップ1〜3）に進む」「差分コメントのみ: レビュー中で body は変えたくない場合。PR コメントで変更内容を説明する追記フロー（ステップ4〜5）に進む」。
- 重複候補: GP5 / GP23

### GP145

- 位置: plugins/github-pr/skills/create/references/update-pr.md:37
- 原文: まず現在の body を API で取得する。ユーザーが手動で書き換えている可能性があるため、ローカルのキャッシュや以前の生成結果を使わない。
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: 「自分の過去の生成物を出典代わりにせず原本を取り直す」という汎用則の PR 版。why は「ユーザーが手動で書き換えている可能性があるため」。
- 重複候補: GP87（リンク先を貼る前に原文を確認する）

### GP146

- 位置: plugins/github-pr/skills/create/references/update-pr.md:43
- 原文: 新規作成と同じ気持ちで body 全体を確認する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP147

### GP147

- 位置: plugins/github-pr/skills/create/references/update-pr.md:44
- 原文: 現在の差分（`git diff <base>...HEAD --stat` + コミットログ）と取得した body を比較し、以下を確認する:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 確認項目は 46-49 行。「概要が現在の変更内容を正確に反映しているか」「How to check の項目が現在の差分に対して妥当か（不要な項目、追加すべき項目）」「How to check のエビデンス（grep 結果等）が古くなっていないか」「Pre-open チェックリストの内容が適切か」。
- 重複候補: GP146

### GP148

- 位置: plugins/github-pr/skills/create/references/update-pr.md:51
- 原文: 更新が必要な場合は `gh pr edit <number> --body "..."` で body を更新する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP149

- 位置: plugins/github-pr/skills/create/references/update-pr.md:52
- 原文: body の生成ルールは [generate-body.md](generate-body.md) に従う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP7

### GP150

- 位置: plugins/github-pr/skills/create/references/update-pr.md:54
- 原文: → 記録: body を更新したか、主な変更点は何か
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP142

### GP151

- 位置: plugins/github-pr/skills/create/references/update-pr.md:58
- 原文: 既存の差分コメント（行指定・ファイル）を API で取得し、現在の差分と照合する:
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 確認事項は 66-68 行。「コメントが指している行やファイルがまだ差分に存在するか」「コメントの内容が現在のコードと整合しているか」「新しい差分に対してコメントを追加すべき箇所がないか」。
- 重複候補: GP147

### GP152

- 位置: plugins/github-pr/skills/create/references/update-pr.md:72
- 原文: コメントは削除しない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP153

### GP153

- 位置: plugins/github-pr/skills/create/references/update-pr.md:74
- 原文: 1. スレッドに「この変更により古くなった」旨の返信を投稿 2. スレッドを resolve する
- 分類: その他
- 性質: 媒体固有
- 補足: 74-75 行の 2 手順。GP152 の「削除しない」の代替行動として規定されている。返信文例は 81 行「このコメントは後続のコミットにより古くなったため resolve します。」。
- 重複候補: GP152

### GP154

- 位置: plugins/github-pr/skills/create/references/update-pr.md:117
- 原文: → 記録: resolve したコメント数と対象ファイル
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP142 / GP150

### GP155

- 位置: plugins/github-pr/skills/create/references/update-pr.md:121
- 原文: 新しい差分に対するコメントは [post-line-comments.md](post-line-comments.md) のルールに従って追加する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP9

### GP156

- 位置: plugins/github-pr/skills/create/references/update-pr.md:123
- 原文: → 記録: 追加したコメント数と対象ファイル
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP142 / GP150 / GP154

### GP157

- 位置: plugins/github-pr/skills/create/references/update-pr.md:127
- 原文: ステップ1〜2 で記録した内容をまとめて報告する。このステップを省略しない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP143 / GP166

### GP158

- 位置: plugins/github-pr/skills/create/references/update-pr.md:129
- 原文: 報告フォーマット:（**PR #XX 更新報告:** / - body 更新: あり/なし（変更点の要約） / - コメント追加: N件（対象ファイル） / - コメント resolve: N件（対象ファイル） / - PR URL）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 131-137 行のコードブロックが報告の定型。
- 重複候補: GP11 / GP167

### GP159

- 位置: plugins/github-pr/skills/create/references/update-pr.md:143
- 原文: body は変更しない。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 追記フロー（open でレビュー中）限定の規定。
- 重複候補: GP160

### GP160

- 位置: plugins/github-pr/skills/create/references/update-pr.md:143
- 原文: 代わりに PR にコメントを投稿し、今回のコミットで何を変更したかを説明する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP159

### GP161

- 位置: plugins/github-pr/skills/create/references/update-pr.md:149
- 原文: {このコミットで何をしたか、なぜしたかを簡潔に}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: PR コメント本文の雛形（147-153 行）に埋め込まれた指示。前後に「## {コミットの要約}」と「- {変更点1} / - {変更点2}」がある。
- 重複候補: GP121（short/template.md:4「{何をしたか、なぜしたかを簡潔に}」）

### GP162

- 位置: plugins/github-pr/skills/create/references/update-pr.md:159
- 原文: コミット単位ではなく、今回プッシュした変更全体をまとめる
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP211（address-review のグルーピング原則）

### GP163

- 位置: plugins/github-pr/skills/create/references/update-pr.md:160
- 原文: レビュアーが「前回見た時点からどう変わったか」を把握できる内容にする
- 分類: 目的・読者の確定
- 性質: 媒体固有
- 重複候補: GP77 / GP36

### GP164

- 位置: plugins/github-pr/skills/create/references/update-pr.md:161
- 原文: レビュー指摘への対応であれば、どの指摘に対応したかを明記する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: address-review の返信規範（GP202-GP206 群）

### GP165

- 位置: plugins/github-pr/skills/create/references/update-pr.md:163
- 原文: → 記録: コメントを投稿したか、内容の要約
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP142 / GP150

### GP166

- 位置: plugins/github-pr/skills/create/references/update-pr.md:167
- 原文: ステップ4 の記録をまとめて報告する。このステップを省略しない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP157

### GP167

- 位置: plugins/github-pr/skills/create/references/update-pr.md:169
- 原文: 報告フォーマット:（**PR #XX 追記報告:** / - PR コメント: 投稿済み（内容の要約） / - PR URL）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 171-175 行のコードブロックが報告の定型。
- 重複候補: GP158 / GP11

## plugins/github-pr/skills/address-review/SKILL.md

### GP168

- 位置: plugins/github-pr/skills/address-review/SKILL.md:8
- 原文: GitHub PR に付いた `@claude` 宛のコメントを全て取得し、全体を把握した上でまとまりのある単位で対応する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: この条項は前半「全て取得し、全体を把握した上で」を指す。
- 重複候補: GP183（92 行「全コメントを読んだ上で…対応計画を立てる」）

### GP169

- 位置: plugins/github-pr/skills/address-review/SKILL.md:8
- 原文: GitHub PR に付いた `@claude` 宛のコメントを全て取得し、全体を把握した上でまとまりのある単位で対応する。
- 分類: その他
- 性質: 媒体固有
- 補足: この条項は後半「まとまりのある単位で対応する」を指す。
- 重複候補: GP211（220-222 行「まとまり単位のコミット原則」）

### GP170

- 位置: plugins/github-pr/skills/address-review/SKILL.md:15
- 原文: レビューの本体コメントに `@claude` がある場合、そのレビューに属するインラインコメント全部を対象にする。各インラインコメントに `@claude` は不要
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 2 文目は 1 文目の帰結の明示。10-13 行に前提の定義（GitHub の PR コメントはレビュー（本体コメント + それにぶら下がるインラインコメント群）と PR 会話への単発コメント (conversation comment) の 2 種類）。
- 重複候補: GP180（67 行が同じ規則を参照で再掲）

### GP171

- 位置: plugins/github-pr/skills/address-review/SKILL.md:17
- 原文: インラインコメント自身に `@claude` がある場合、そのコメント単体を対象にする。本体コメントが空になる単発インラインコメント (Add single comment) はこの規則で拾う
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 2 文目はこの規則が拾う対象の補足。
- 重複候補: GP170

### GP172

- 位置: plugins/github-pr/skills/address-review/SKILL.md:19
- 原文: conversation comment は `@claude` を含むものだけ対象にする
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP170 / GP171

### GP173

- 位置: plugins/github-pr/skills/address-review/SKILL.md:20
- 原文: スレッド返信 (`in_reply_to_id` が非 null) も同じ規則で対象判定する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP170

### GP174

- 位置: plugins/github-pr/skills/address-review/SKILL.md:21
- 原文: 対象になったコメントと同じスレッドの他の返信は、指摘の文脈として読む
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP178（変更の文脈がない場合の推測）

### GP175

- 位置: plugins/github-pr/skills/address-review/SKILL.md:22
- 原文: rocket リアクションが付いたコメントは対応済みとして除外する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP181（72-73 行で同じ除外規定を再掲）

### GP176

- 位置: plugins/github-pr/skills/address-review/SKILL.md:26
- 原文: PR URL または PR 番号（プロンプトから取得。無ければ現在のブランチの PR を `gh pr view` で解決）
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP177

- 位置: plugins/github-pr/skills/address-review/SKILL.md:27
- 原文: 前回実行タイムスタンプ（任意。指定があればそれ以降のコメントのみ対応）
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP216（234 行「前回実行タイムスタンプが渡されていれば、それ以降の新しいコメントのみ対象にする」）

### GP178

- 位置: plugins/github-pr/skills/address-review/SKILL.md:28
- 原文: 変更の文脈（任意。設計意図、実装方針、変更の背景など）／レビューコメントの解釈や修正方針の判断に使う。文脈がない場合は PR の diff とコミットメッセージから推測する
- 分類: その他
- 性質: 媒体固有
- 補足: 28-29 行。任意入力の用途と、欠けている場合の代替手段の規定。
- 重複候補: GP174

### GP179

- 位置: plugins/github-pr/skills/address-review/SKILL.md:64
- 原文: `--paginate` は必須。返信を含めるとコメント数が 30 件を超えることがあり、ページネーションなしだと後半のコメントが取りこぼされる。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: why は 2 文目（取りこぼし）。
- 重複候補: GP168（全て取得する）

### GP180

- 位置: plugins/github-pr/skills/address-review/SKILL.md:67
- 原文: インラインコメントの対象判定は「対象コメントの決め方」に従う。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 判定基準は 68 行「`review_id` が `@claude` 付きレビューの id 集合に含まれるか、コメント自身の body が `@claude` を含めば対象」。
- 重複候補: GP170 / GP171 / GP172

### GP181

- 位置: plugins/github-pr/skills/address-review/SKILL.md:72
- 原文: 対応済みコメントには rocket リアクションが付いている。各コメントのリアクションを確認し、rocket が付いているコメントは対応対象から除外する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP175

### GP182

- 位置: plugins/github-pr/skills/address-review/SKILL.md:87
- 原文: レビュー本体コメントにはリアクション API が無い。レビュー単位の対応済み判定は、そのレビューに属するインラインコメント全部に rocket が付いているかで行う。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: why は 1 文目（API の制約）。
- 重複候補: GP181

### GP183

- 位置: plugins/github-pr/skills/address-review/SKILL.md:92
- 原文: 全コメントを読んだ上で、以下の手順で対応計画を立てる。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP168

### GP184

- 位置: plugins/github-pr/skills/address-review/SKILL.md:94
- 原文: 各コメントを種別に分類する
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 種別とアクションの対応は 96-101 行の表（GP185-GP188）。
- 重複候補: なし

### GP185

- 位置: plugins/github-pr/skills/address-review/SKILL.md:98
- 原文: | 修正要求 | コード修正 + 返信 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP186 / GP187 / GP188

### GP186

- 位置: plugins/github-pr/skills/address-review/SKILL.md:99
- 原文: | 質問 | コメント返信で回答。コード修正は不要な場合が多い |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP196（126-127 行「PR コメントのみで解決できるもの…はコメント返信だけで完了する」）

### GP187

- 位置: plugins/github-pr/skills/address-review/SKILL.md:100
- 原文: | 提案 (suggestion) | 妥当性を評価し、採否と理由を返信。採用ならコード修正 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP204（解釈を明示する）

### GP188

- 位置: plugins/github-pr/skills/address-review/SKILL.md:101
- 原文: | nitpick | 対応するが優先度は低い |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP189

- 位置: plugins/github-pr/skills/address-review/SKILL.md:103
- 原文: conversation comment とレビュー本体コメントに全体方針や横断的な指示がないか確認する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: GP190

### GP190

- 位置: plugins/github-pr/skills/address-review/SKILL.md:103
- 原文: あればそれを全修正の前提方針とする
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP189

### GP191

- 位置: plugins/github-pr/skills/address-review/SKILL.md:105
- 原文: 修正を伴うコメントを内容の関連性でグルーピングする
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: グルーピング軸は 106-108 行。「同じファイルへの指摘」「同じ設計方針に関する指摘（複数ファイルにまたがる場合あり）」「依存関係のある指摘（A の修正が B に影響する）」。
- 重複候補: GP211 / GP213

### GP192

- 位置: plugins/github-pr/skills/address-review/SKILL.md:109
- 原文: グループ間の依存関係を確認し、対応順序を決める。先に対応したグループのコミットが後のグループの対応で書き換えられないよう、全体の整合性を考慮する
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: 2 文目が順序決定の判定基準。
- 重複候補: GP214（226 行の同趣旨）

### GP193

- 位置: plugins/github-pr/skills/address-review/SKILL.md:113
- 原文: コメントの対応方針を判断する際、以下のいずれかに該当する場合は**コードを修正する前に PR コメントで方針を確認する**。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 該当条件は 116-119 行。「対応方針が自明でない（複数の解釈がありえる）」「複数の選択肢がある（どのアプローチを取るか判断が必要）」「コード設計や構造を変える必要がある」「指示が曖昧で、意図の確認が必要」。
- 重複候補: GP23（判断が難しい場合はユーザーに確認する）

### GP194

- 位置: plugins/github-pr/skills/address-review/SKILL.md:124
- 原文: レビューコメントのスレッドに返信する形で、自分の解釈と対応案を書く
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: GP204（188 行「解釈を明示する」）

### GP195

- 位置: plugins/github-pr/skills/address-review/SKILL.md:125
- 原文: 選択肢がある場合は案を列挙してどれが望ましいか聞く
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: 「選択肢を列挙して選んでもらう」は媒体を問わない確認の作法。
- 重複候補: GP193

### GP196

- 位置: plugins/github-pr/skills/address-review/SKILL.md:126
- 原文: PR コメントのみで解決できるもの（説明・補足・方針合意）はコメント返信だけで完了する。コード修正が不要なケースも考慮する
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: GP186

### GP197

- 位置: plugins/github-pr/skills/address-review/SKILL.md:128
- 原文: 確認が取れてからコード修正に進む
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP193

### GP198

- 位置: plugins/github-pr/skills/address-review/SKILL.md:130
- 原文: 自明な修正（typo、明らかなバグ、指示が具体的で一意に決まるもの）はそのまま対応してよい。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: GP193 の例外規定。
- 重複候補: GP193

### GP199

- 位置: plugins/github-pr/skills/address-review/SKILL.md:138
- 原文: `git add` → `git commit`（グループの修正内容を要約したメッセージ）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: コミットメッセージの内容規定（グループの修正内容の要約）。
- 重複候補: GP211 / GP162

### GP200

- 位置: plugins/github-pr/skills/address-review/SKILL.md:141
- 原文: 対応した各コメントに rocket リアクションを付ける（対応済みマーク）
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP175 / GP181

### GP201

- 位置: plugins/github-pr/skills/address-review/SKILL.md:160
- 原文: @{user_login} 対応しました ({commit_sha}) / **解釈**: {コメントをどう解釈したか} / **修正内容**: - {具体的な変更 1} - {具体的な変更 2}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 返信本文の定型（インラインコメント宛 160-166 行、conversation comment 宛 175-181 行に同一の本文）。メンション・コミット SHA・解釈・修正内容の 4 要素で構成する指定。
- 重複候補: GP202 / GP203 / GP204

### GP202

- 位置: plugins/github-pr/skills/address-review/SKILL.md:186
- 原文: メンションは `user_login` から動的に取得する。固定ユーザー名にしない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP201

### GP203

- 位置: plugins/github-pr/skills/address-review/SKILL.md:187
- 原文: コミット SHA を明記する（GitHub 上でコミットへのリンクになる）
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は括弧内。228-229 行にも根拠がある。「各コメントへの返信にコミット SHA を含めるため、どのコメントがどのコミットに対応しているかは追跡可能に保たれる。」
- 重複候補: GP201

### GP204

- 位置: plugins/github-pr/skills/address-review/SKILL.md:188
- 原文: 解釈を明示する（レビュアーが認識ズレを早期に検出できる）
- 分類: 文書種別の構造
- 性質: 判断保留
- 補足: 「自分がどう読んだかを書いて認識ズレを検出させる」は媒体非依存の確認作法だが、ここではレビュー返信の必須要素として規定されている。why は括弧内。
- 重複候補: GP194 / GP201

### GP205

- 位置: plugins/github-pr/skills/address-review/SKILL.md:189
- 原文: 同じグループで対応した他のコメントがある場合、関連コメントとして言及する
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP128（コメント同士の相互参照）

### GP206

- 位置: plugins/github-pr/skills/address-review/SKILL.md:190
- 原文: レビュー本体コメントへの返信はスレッドを持たないため、conversation comment で行う
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: why は「スレッドを持たないため」。
- 重複候補: GP131（行指定コメントとファイルコメントの使い分け）

### GP207

- 位置: plugins/github-pr/skills/address-review/SKILL.md:194
- 原文: PR に conversation comment として結果を報告する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP143 / GP157

### GP208

- 位置: plugins/github-pr/skills/address-review/SKILL.md:194
- 原文: レビュアーをメンションする。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: GP202

### GP209

- 位置: plugins/github-pr/skills/address-review/SKILL.md:196
- 原文: 全コメントが個別対応（1 コメント 1 コミット）で完了した場合は簡潔に:（@{user_login} 全 {N} 件のコメントに対応しました。各コメントへの返信をご確認ください。）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 198-200 行が定型文。
- 重複候補: GP210

### GP210

- 位置: plugins/github-pr/skills/address-review/SKILL.md:202
- 原文: グルーピングを含む対応を行った場合は、どのコメントをどうグルーピングしたか、なぜまとめたかを明示して報告する:
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 定型は 205-218 行。「グルーピングして対応したもの」「個別に対応したもの」に分け、各行に commit_sha・指摘内容の 1 文要約・コメント URL・グルーピング理由を書く。
- 重複候補: GP209 / GP164

### GP211

- 位置: plugins/github-pr/skills/address-review/SKILL.md:222
- 原文: 関連するコメント群をグルーピングし、1 グループ 1 コミットで対応する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP169 / GP191

### GP212

- 位置: plugins/github-pr/skills/address-review/SKILL.md:224
- 原文: 独立した指摘は 1 コメント 1 コミット
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP211

### GP213

- 位置: plugins/github-pr/skills/address-review/SKILL.md:225
- 原文: 同じファイル・同じ方針に関する複数の指摘は 1 コミットにまとめる
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP191 / GP211

### GP214

- 位置: plugins/github-pr/skills/address-review/SKILL.md:226
- 原文: 前のコミットの変更が後のコミットで書き換えられないよう、全体を見て対応順序と修正範囲を決める
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: GP192

### GP215

- 位置: plugins/github-pr/skills/address-review/SKILL.md:233
- 原文: session resume で呼ばれた場合も同じフローを実行する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP216

- 位置: plugins/github-pr/skills/address-review/SKILL.md:234
- 原文: 前回実行タイムスタンプが渡されていれば、それ以降の新しいコメントのみ対象にする。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 234-235 行に補足「セッションコンテキストに過去の対応履歴があれば、重複対応を自然に回避できる」。
- 重複候補: GP177

### GP217

- 位置: plugins/github-pr/skills/address-review/SKILL.md:241
- 原文: | gh 未認証 | `gh auth login` を提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: GP15（create/SKILL.md:107 の同一行）

### GP218

- 位置: plugins/github-pr/skills/address-review/SKILL.md:242
- 原文: | PR が見つからない | PR 番号を確認するよう提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP219

- 位置: plugins/github-pr/skills/address-review/SKILL.md:243
- 原文: | push 権限なし | リポジトリの権限を確認するよう提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP220

- 位置: plugins/github-pr/skills/address-review/SKILL.md:244
- 原文: | 対象コメントなし | 「新しい @claude コメントはありません」と報告して終了 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP221

- 位置: plugins/github-pr/skills/address-review/SKILL.md:245
- 原文: | コミット中にコンフリクト | コンフリクトの内容を報告し、手動解決を提案 |
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### GP222

- 位置: plugins/github-pr/skills/address-review/SKILL.md:246
- 原文: | 指摘内容が曖昧 | ステップ 4 に従い、修正前にスレッドで確認質問を投稿 |
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: GP193

## 検算用の集計

| ファイル | 抽出件数 | 総行数 | 見出し数 | 箇条書き数 |
| --- | ---: | ---: | ---: | ---: |
| skills/create/SKILL.md | 20 | 112 | 12 | 21 |
| skills/create/references/generate-body.md | 56 | 154 | 12 | 52 |
| skills/create/references/shared/formatting-rules.md | 8 | 50 | 4 | 13 |
| skills/create/references/shared/external-citation.md | 5 | 12 | 1 | 6 |
| skills/create/references/long/rules.md | 19 | 26 | 2 | 16 |
| skills/create/references/long/template.md | 7 | 57 | 8 | 3 |
| skills/create/references/short/rules.md | 4 | 9 | 1 | 2 |
| skills/create/references/short/template.md | 3 | 9 | 2 | 1 |
| skills/create/references/post-line-comments.md | 18 | 112 | 8 | 15 |
| skills/create/references/update-pr.md | 27 | 175 | 13 | 20 |
| skills/address-review/SKILL.md | 55 | 246 | 14 | 33 |
| 合計 | 222 | 962 | 77 | 182 |

見出し数は行頭の `##` `###` `####` の一致数、箇条書き数は行頭（インデント込み）の `-` `*` の一致数（いずれも 2026-08-20 実測）。

### 旧抽出 54 件との差の見立て

- 抽出単位が違う。今回は「1 文 1 規定」まで割っており、箇条書き 1 行に複数の動作が入る箇所（例: external-citation.md:12 の「リンクを貼らず、その旨を明記する」、update-pr.md:6 の「記録し、報告する」）を 2 件に分けた。箇条書き総数 182 に対して 222 件なので、平均して箇条書き 1 行あたり 1.2 件の水準になる
- 旧抽出が拾っていなかったと思われる層を今回含めた。エラーハンドリング表の各行（GP15-20、GP217-222 の計 12 件）、パラメータ表の既定値（GP12-14）、「〜に従う」形の参照指示（GP7・GP9・GP56・GP91 など計 12 件前後）、テンプレートファイルのプレースホルダに埋め込まれた指示（GP110-115、GP121-122）は、規範ではなく工程・目次として落とされやすい
- 依頼の「工程は抽出しない」の線引きも件数を動かす。gh コマンドの実行順は落としたが、API の選択理由（GP136）やリアクション付与（GP200）のように工程の中に「〜する」が埋まっているものは残した。この判断を厳しくすると 30 件ほど減り、緩めると 20 件ほど増える幅がある
