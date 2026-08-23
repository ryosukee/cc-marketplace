# 条項抽出: HC / FN / AQ

## HC — plugins/claude-user-communication/skills/html-communication/SKILL.md

### HC1

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:8-9
- 原文: 調査報告・設計判断の比較・設問の多い確認など、前提や構造が入り組んだ内容は、ターミナルへのテキスト出力ではなく self-contained な HTML ページを生成して見せる。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: UC の「重厚でスクロールが必要な分量・比較表・設問が多い → HTML」判定と同趣旨。AQ15 / AQ16 にも同趣旨

### HC2

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:10
- 原文: 構造化して順序立てて読める形に作り込むこと自体が目的なので、体裁は手を抜かない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC3

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:14
- 原文: HTML にする: 前提説明が長い調査報告、複数の表・比較を含む設計判断、設問が概ね 4 問を超える確認、順序立てた説明が必要なもの
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: UC の判定基準、AQ15（設問 4 問超は HTML フォーム）と同趣旨

### HC4

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:15
- 原文: テキストのまま: 短い報告、単発〜少数の質問
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: UC「数行・数点に収まる報告、単発から少数の質問: フリーテキスト」と同趣旨

### HC5

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:15-16
- 原文: レンダリングバグ修正までは AskUserQuestion を使わず、チャットのフリーテキストで質問する。[ユーザーへの確認は選択肢形式で](../ask-with-choices/SKILL.md) 冒頭の警告参照
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ1（AskUserQuestion 使用禁止の時限措置）と同趣旨

### HC6

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:20
- 原文: 配置先ディレクトリと配信 URL は環境変数から解決する（値のセットアップは環境側の文書の管轄）。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC7

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:22
- 原文: `CLAUDE_HTML_COMMUNICATION_DIR`: 共通ページディレクトリ。未設定なら既定値 `~/.local/share/claude-html-communication` を使う
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC8

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:23-24
- 原文: `CLAUDE_HTML_COMMUNICATION_BASE_URL`: 配信のベース URL（例: `https://<ホスト名>.<tailnet 名>.ts.net`）。ページの serve URL は `{CLAUDE_HTML_COMMUNICATION_BASE_URL}/{ファイル名}`、一覧のルート URL は `{CLAUDE_HTML_COMMUNICATION_BASE_URL}/`
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC9

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:25-26
- 原文: `CLAUDE_HTML_COMMUNICATION_BASE_URL` が未設定・空の場合は、ページ提示の前にユーザーに URL を確認し、そのセッションではその値を使う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC10

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:26
- 原文: あわせて環境変数としての恒久設定を提案する
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC11

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:30-33
- 原文: 共通ページディレクトリ（`CLAUDE_HTML_COMMUNICATION_DIR`。無ければ `mkdir -p` で作る）に `{略号}-f{NNN}.html`（form）/ `{略号}-r{NNN}.html`（report）の名前で書く。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why「番号空間をプロジェクトごとに閉じることで、並行セッションが同じ番号を取り合わなくなり、他プロジェクトのページを上書きすることが命名上ありえなくなる」
- 重複候補: なし

### HC12

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:34
- 原文: 略号はプロジェクトごとの短い識別子で、index 内の `projects` 台帳が正典。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC13

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:35-36
- 原文: 台帳に無いプロジェクトなら、そのプロジェクトの最初のページを作るときに決めて登録する（3〜5 文字。既存の値と衝突しないことを台帳で確認する）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC14

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:37-38
- 原文: **発番はファイルシステムを見る**: `ls {略号}-f*.html` の最大連番 + 1（3 桁ゼロ埋め、該当が無ければ 001。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC15

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:38
- 原文: 欠番は再利用しない）。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC16

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:39
- 原文: index のエントリから求めない。一覧の読み落としで既存ページを上書きする事故が起きている
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why は実例（一覧の読み落としによる上書き事故）
- 重複候補: HC14 の裏返し

### HC17

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:40-42
- 原文: 日付・内容はファイル名に持たせず、index のエントリ（`project` / `created` / `title`）とページの `<title>` で管理する。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why「短い名前にするのは serve URL をタスクや通知の 1 行に省略なしで収めるため（一覧 UI は末尾から省略され、途切れた URL はリンクとして機能しない）」
- 重複候補: なし

### HC18

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:43
- 原文: 既存ページの移行: 完了（`answered` / `confirmed`）のページは改名しない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC19

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:44-45
- 原文: 未完了のページは、そのプロジェクトを作業対象にしているセッションが新名へ改名し、旧名を転送スタブにする。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC30（転送スタブ）と同趣旨

### HC20

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:45-46
- 原文: 旧命名（`YYYY-MM-DD-<プロジェクト>-<内容>-<種別>.html`）と接頭辞なしの旧短名（`f008.html` 等）は、完了分をそのまま据え置く。
- 分類: その他
- 性質: 媒体固有
- 補足: 「3 世代が同居するが、index は `file` の値をそのまま使うので表示は壊れない」が根拠
- 重複候補: HC18 と同趣旨

### HC21

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:48-50
- 原文: ブラウザで自動で開かない（`open` コマンドを実行しない）。
- 分類: その他
- 性質: 媒体固有
- 補足: why「`file://` 直開きは「一覧に戻る」等の相対リンクが serve 側の一覧と繋がらず不便なため。閲覧はユーザーが提示された serve URL（またはファイルパス）から自分で行う」
- 重複候補: なし

### HC22

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:51
- 原文: ユーザーに見せる閲覧用 HTML（確認フォーム・調査レポートを含む全部）はここに置く。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC23

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:52
- 原文: scratchpad は単一セッション内で使い切る中間物専用で、閲覧用 HTML は置かない
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC22 の裏返し

### HC24

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:53
- 原文: 種別は連番の直前の f = form（要回答）/ r = report（読むだけ）で表す。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC11 と同じ命名規約の一部

### HC25

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:54
- 原文: 連番シリーズ（第 N 回フォーム等）はファイル名ではなく title で表す
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC17 と同趣旨

### HC26

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:55
- 原文: サブディレクトリは作らない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC27

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:55-56
- 原文: プロジェクトの分離は略号の接頭辞で、グルーピングは index.html 側で表現する
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC28

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:57
- 原文: 改稿は同名上書きにする（URL は初版のまま維持）。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC37（`file` と `created` は改稿で変えない）と同趣旨

### HC29

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:57
- 原文: 別議題は新しい連番で作る。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC30

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:58-59
- 原文: ファイル名を変える必要が生じたら、旧名を新名への転送スタブ（0 秒 meta refresh + 通常リンク）にして配布済み URL を生かす
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC19 と同趣旨

### HC31

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:60
- 原文: 各ページの左下に「一覧に戻る」ボタン（`./` = index へのリンク）を常時固定のオーバーレイで置く。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC83（report 形式の `#footer-nav`）と対応

### HC32

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:61-62
- 原文: 固定位置はビューポート左端ではなく本文カラムの左端に揃える（例: `left: max(12px, calc((100vw - <カラム幅>px) / 2 + <カラム padding>px))`）。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC33

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:63
- 原文: 下部固定フッターがあるページではフッター左端に置いてよい
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC34

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:64-66
- 原文: **生成に使った skill の版をページと index の両方に記録する。** ページ側は `<meta name="generator" content="claude-html-communication X.Y.Z">` と、下部バー（report は `#footer-nav`）の `#ver`。index 側はエントリの `skillVersion`。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why「古い雛形で作られたページを参考にしないための目印で、下の「既存のページを読んで参考にしない」を版で裏づける」
- 重複候補: HC47（参照する前に版を確認する）と対応

### HC35

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:67
- 原文: 版は `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` の `version` を読んで入れる。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC36

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:70-74
- 原文: **ページを作り直したら、ページ側と index 側を同じターンで揃える。** ページだけ直して index を置き去りにすると、一覧の版が古いまま残り、次に参考可否を判断するときに誤った版を見る。実際にこの取り違えが起きている。更新するのは次の全部で、変わっていない項目だけを据え置く
- 分類: その他
- 性質: 媒体固有
- 補足: 更新対象の表（75-84 行）を畳んだ。「ページ / `<meta name="generator">` / 作り直したとき必ず」「ページ / 下部バー（report は `#footer-nav`）の `#ver` / 作り直したとき必ず」「ページ / `<title>` / 議題・設問数の表現が変わったとき」「index / `skillVersion` / 作り直したとき必ず」「index / `title` / ページの `<title>` と一字一致させる」「index / `questions` / 設問の総数が変わったとき（form のみ）」「index / `type` / form と report を入れ替えたとき」「index / `status` / `statusChanged` / 状態が変わったとき」。why は実際に取り違えが起きたこと
- 重複候補: HC109（title の一字一致）、HC118（status 更新）と重複する行を含む

### HC37

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:86
- 原文: `file` と `created` は改稿で変えない（URL と初出日は初版のまま維持する）
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC28（改稿は同名上書き）と同趣旨

### HC38

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:87
- 原文: ページは必ず `templates/page.html` を起点に作る。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC39 と表裏

### HC39

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:87-88
- 原文: 既存のページをコピーして作らない。一度コピーで分岐すると、そのページ系統は以後の雛形更新を受け取らなくなる。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC41（skill と雛形が定めている事柄は既存ページを見ずに決める）と同趣旨

### HC40

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:89
- 原文: 改稿・続編も同じで、雛形の最新版から作り直す
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC38 の適用範囲拡張

### HC41

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:91-94
- 原文: **この skill と雛形が定めている事柄は、既存ページを見ずに決める。** 何が定めに当たるかは版ごとに変わるので、ここでは列挙しない。いま skill と雛形に書いてあることが、そのまま対象になる。既存ページから取ると、そのページが作られた当時の定めを持ち込むことになる
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC39 と同趣旨

### HC42

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:95-96
- 原文: 規定されていない、その議題に固有の見せ方の工夫は参照してよい。雛形が持てない一点物なので、過去の工夫から学ぶ価値がある。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC41 の例外

### HC43

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:97
- 原文: 取るのは考え方だけで、実装は写さず雛形の上で作り直す
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC38 と同趣旨

### HC44

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:98-100
- 原文: 先に [見せ方のパターン集](./references/patterns/README.md) を見る。使ってよい条件と使ってはいけない条件が揃っているので、過去のページを読むより早く採否を決められる。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC45

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:101
- 原文: パターン集に無ければ、これまでどおり過去のページを参照してよい
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC42 と同趣旨

### HC46

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:102-103
- 原文: パターン集に無い形をその場で作ったら、次に使えるものだけパターン集へ足す。追加の手順はパターン集の README にある
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC47

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:104-107
- 原文: 参照する前に必ずそのページの版を確認する。ページ下部と `<meta name="generator">`、index の一覧に出る。版が古いほど現行の規定との食い違いが多く、見せ方の工夫だけを取るつもりでも古い規定が混入しやすい。版の記録が無いページは、記録を入れる前のもので最も古い
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC34（版の記録）と対応

### HC48

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:108
- 原文: 改稿対象そのものと、リンク先として内容を確認する場合は、この制限の対象外
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC49

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:109-111
- 原文: 雛形が持つもの: ライト/ダーク・印刷スタイル・セーフエリア・下書き自動保存（端末ローカル）・一覧に戻る・回答コピー・form / report 両方の追従領域・3 pane・本文の範囲と現在地の追従・脚注と補足の双方向リンク
- 分類: その他
- 性質: 媒体固有
- 補足: 行動を規定する文ではなく雛形の同梱物の列挙。落とさない方針に従い、その他として拾った
- 重複候補: なし

### HC50

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:112
- 原文: 構造は 3 pane。左に設問 `#q-pane`、中央に本文 `#bd`、右に脚注と補足 `#fn-pane`。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC51

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:113-114
- 原文: 1340px 以上で 3 列になり、それ未満は DOM 順のまま 本文 → 設問 → 脚注 の 1 列で流れる。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: why「DOM 順をこの並びにするのは、狭幅で読み終えた直後に答えられるようにするため」
- 重複候補: なし

### HC52

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:115
- 原文: 本文には `section.rng[data-q]` で設問ごとの範囲を作る。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC53

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:116-118
- 原文: 範囲のラベル（`.rlabel`）は「設問 2」とだけ書き、「設問 2 の判断材料」のように役割を説明しない。読み手が知りたいのはいまどの設問を読んでいるかで、その範囲が判断材料であることは 3 pane の並びと設問カードの追従が示している。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC165（表を語る文を置かない）と同型の「UI が示すことを日本語で言い直さない」

### HC54

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:119
- 原文: 前提部分は範囲を持たせない（その位置では設問をどれも開かない）。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC55

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:120
- 原文: 追従は各範囲と表示領域の重なりの高さで決める。節の先頭が閾値を超えたかという点の判定はしない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC56

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:121
- 原文: 読んでいる範囲の設問カードが開き、手で開閉したものは自動追従から外れる
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC57

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:122-125
- 原文: 地の文と UI の色の役割は既定の 3 つを全ページで通す。ページごとに割り当てを変えない
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: 3 つの定義（123-125 行）「青 `--link` = 操作できるもの + 現在地」「地の濃淡 = 構造（見出しの罫・表の罫・区切り）」「琥珀 `--mark` = 本文中の要点」
- 重複候補: HC58〜HC64（図の内外の色規定）が例外・派生

### HC58

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:126
- 原文: **図の中は色を自由に使ってよい。** 条件は 3 つ
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC57 の例外

### HC59

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:127
- 原文: 何の色かを凡例で示す
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC60

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:128
- 原文: 色だけに意味を載せず、字面か形を併記する（WCAG 1.4.1）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC62、HC208（設問カードのマーカー）と同趣旨

### HC61

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:129
- 原文: その色を図の外（地の文・表・設問・UI）へ持ち出さない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC63 と同趣旨

### HC62

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:130-131
- 原文: 図の外でパターンが固有の色を持ってよいのは、**その色に定着した意味がある場合に限る**。差分の赤と緑、判定の可否のように、読み手が別の意味に取りようがないもの。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC57 の例外

### HC63

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:132
- 原文: 足すときは色だけに意味を載せず、字面か形を併記する。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC60 と同一趣旨（図の外版）

### HC64

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:133
- 原文: 色はそのパターンの中で閉じ、本文の地の文へ持ち出さない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC61 と同一趣旨

### HC65

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:134-135
- 原文: 本文テキスト `--fg` と構造の線 `--rule-strong` は必ず別トークンにする。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why「兼用すると両者のコントラストが 1.00 になり、ダークで区別が消える（実測で確認済み）」
- 重複候補: なし

### HC66

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:136
- 原文: 現在地は範囲の左の縦罫を 2px の `--link` に変える。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC67

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:136-137
- 原文: 面は敷かず、専用の色相も作らない。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: 根拠「文書 UI の先例 8 件のうち新色相を立てたものは 0 件で、5 件が主アクセントの流用だった」
- 重複候補: HC57 と同趣旨

### HC68

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:138-139
- 原文: 見出しの標識は左の縦罫 4px、色は無彩の `--rule-strong`。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: why「青にすると現在地の青い縦罫と 2 本並んで役割が読めなくなる」
- 重複候補: HC66 と対

### HC69

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:140
- 原文: 脚注と補足は番号の系列を分ける。脚注は数字 (1, 2)、補足は英字 (a, b)
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC70

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:141
- 原文: フォントサイズは雛形の 4 段階（`1.4em` / `1.15em` / `1em` / `0.875em`）だけを使い、新しい段を足さない。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC71

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:142
- 原文: 図の CSS（下記の `data-scope="figures"`）だけはこの制限の対象外
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC70 の例外。HC94（色役割とフォント段の制限は適用しない）と重複

### HC72

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:143
- 原文: 下部固定バー（追従エリア）は要素の種類で 3 ゾーンに分ける。詰め込まず、種類ごとに置き場を決める
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC73

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:144-146
- 原文: 情報ゾーン（`.bar-info`、最上段の細い帯）: 操作しない読むだけのラベルだけを置く。ボタンを混ぜない
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC74

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:145-146
- 原文: プロジェクト名バッジ `#proj`・進捗 `#cnt` を左、状態メッセージ `#res` と版 `#ver` を右。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC75

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:147
- 原文: 入力ゾーン（`#free` 単独）: 自由記入欄を全幅で最大化する（`width: 100%`、高さも確保）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC231（自由記入欄は下部固定領域に置く）と対応

### HC76

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:148-149
- 原文: 操作ゾーン（`.bar-actions`、最下段）: ナビ（`#back` 一覧に戻る）を左に隔離し、操作ボタン群（`.action-cluster`）を右へ寄せる。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC77

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:149-150
- 原文: 主操作（回答をコピー）は右端でアクセント塗り、副操作（リセット）はゴースト（`.subbtn`）にして主副を見た目で分ける。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC78

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:151-152
- 原文: 3 つのボタンは常に 1 行に収める。
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: 実測「副操作のラベルを「入力をリセット」まで伸ばすと 3 pane の狭い bar で折り返す（1340px で内幅 306px に対し合計 339px。実測）」
- 重複候補: なし

### HC79

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:153-154
- 原文: 3 pane のときバーは脚注 pane の真下へ寄せ、そこから画面右端まで伸ばす（`left: calc(50% + 344px); right: 0`）。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: why「設問 pane の下ではなく脚注 pane の下に置くのは、設問カードが使える縦幅を最大に取るため」「列幅 300px 丁度で止めるとボタン 3 つが 1 行に収まらないので、右端は画面端まで伸ばす」
- 重複候補: HC78 と関連

### HC80

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:155
- 原文: 丈を削るのは `#fn-pane` だけにする。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### HC81

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:157
- 原文: プロジェクト名バッジ（`#proj`）で、どのプロジェクトの確認・報告かをスクロール位置に関わらず常に示す。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC74 と重複

### HC82

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:158
- 原文: プロジェクト名は index のエントリの `project` と同じ値にする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC109（title の一字一致）と同型

### HC83

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:159-160
- 原文: report 形式（設問なしの読む専用ページ）は操作ボタンが無いので、追従する固定領域（`#footer-nav`）に「一覧に戻る」とプロジェクトバッジを横並びで置くだけにする。スクロールしても消えないようにする。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC31 と対応

### HC84

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:161
- 原文: 雛形にコメントアウトで入れてあるので、`#bar` と入れ替えて使う
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC85

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:162
- 原文: 表は雛形の形をそのまま使う。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC38 と同趣旨

### HC86

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:163
- 原文: `min-width` で狭幅時の潰れを防ぎ、
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC87

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:163-164
- 原文: 横スクロール領域は `role="region"` と `tabindex="0"` でキーボードから操作できるようにし、
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC88

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:164
- 原文: `caption`（`aria-labelledby` の参照先）と `scope="col"` を必ず書く
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC167（caption は表の下）と対応

### HC89

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:165
- 原文: 図も表と同じ作法でキャプションを付ける。雛形の `.fig` で包み、`.cap` を図の下に置く。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC88 / HC167 と同趣旨

### HC90

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:166
- 原文: 字の大きさと色は表の `caption` と揃える。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC91

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:166
- 原文: 番号を振り、何の図かを書く。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC92

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:167
- 原文: 図を語る文を本文に置かない（表と同じ）
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「図表を語る文を置かない」は媒体を問わず効く執筆規範だが、ここでは 3 pane のキャプション運用が前提。判断保留とした
- 重複候補: HC165（表を語る文を本文に置かない）と同趣旨。JR の「文章自身を語る文を削る」とも重なる

### HC93

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:168-169
- 原文: **図の CSS は本文の CSS と分ける。** 雛形の `<style>` の後ろに `<style data-scope="figures">` をもう 1 つ置き、図のための CSS だけをそこへ入れる。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC94

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:170
- 原文: 色役割とフォント段の制限は、この `style` の中には適用しない。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC71 と重複

### HC95

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:171
- 原文: 機械検査もこの `style` を対象から外す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### HC96

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:172
- 原文: 図を Tailwind で組んでよい。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC97

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:172-174
- 原文: 外部 CDN は使えないので、生成時に CLI を回して使ったクラスだけの CSS を出し、`data-scope="figures"` の `style` へ貼り込む。手順は [見せ方のパターン集](./references/patterns/README.md) にある。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC134（CSS/JS はすべてインライン）と同趣旨

### HC98

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:175
- 原文: リセット（preflight）は読み込まない。読み込むと雛形の表・見出し・段落の作りが消える
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC99

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:176-177
- 原文: 同ディレクトリの `index.html` で一覧と状態を管理する（Claude が生成・更新。エントリは index 内のインライン JS 配列 `entries`）
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC100

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:178
- 原文: 1 つの議題に複数ページを作るときは、代表ページ 1 件だけを index に登録する。
- 分類: その他
- 性質: 媒体固有
- 補足: why「index に同レイヤーで並べると、読む側には無関係な複数件に見えて読む順が決まらない」
- 重複候補: HC261（複数ページを作った議題では代表ページの分だけを出す）と同趣旨

### HC101

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:179
- 原文: 代表は回答・確認を受けるページ（設問があれば form、無ければ主レポート）。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC102

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:180-181
- 原文: 判断材料の明細などサブページは index に登録せず、代表ページの本文からリンクし、
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC100 と同趣旨

### HC103

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:181
- 原文: サブページ側にも代表ページへのリンクを本文冒頭に置く。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: なし

### HC104

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:183
- 原文: サブページは index にエントリを持たないため状態管理をしない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC102 の帰結

### HC105

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:183
- 原文: 掃除は代表ページの状態で行い、
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC119（掃除の規定）と対応

### HC106

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:184
- 原文: 代表を削除するときはサブページのファイルも一緒に削除する
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC107

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:185-186
- 原文: form 型のエントリには設問総数 `questions`（数値）を持たせ、一覧に「設問 N 問」を表示する。
- 分類: その他
- 性質: 媒体固有
- 補足: 「これは設問セクション数ではなく答える設問の総数（1 セクションに複数設問がありうるため）」
- 重複候補: HC196（確認事項も設問の総数に数える）と関連

### HC108

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:186
- 原文: report 型には持たせない
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC107 の裏返し

### HC109

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:187
- 原文: エントリの `title` はページの `<title>` と一字一致させる。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC36 の表の同項目と重複。FN の「TOC の機械導出」と同型

### HC110

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:187-188
- 原文: 改稿でページ側の title を変えたら index も同時に更新する（一覧の表示名と遷移先の名前がずれると探せない）
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC36 と重複

### HC111

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:189
- 原文: form を `awaiting` で登録したら、TaskCreate で回答待ちタスクを作る。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC112

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:189-191
- 原文: subject は「{serve URL} ← {ページ title}に回答」の形で URL を先頭に置く（一覧 UI は末尾から省略されるため。短名ファイルの URL なら省略なしで収まる）。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC17 と同じ why（一覧 UI の末尾省略）

### HC113

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:191
- 原文: report の `unconfirmed` も同様に確認待ちタスクを作る。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC111 の report 版

### HC114

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:192
- 原文: 回答・確認を受領したターンで completed にする。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC117 / HC118（index 側の状態遷移）と同型

### HC115

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:193
- 原文: task ツールが提供されない環境（subagent 等）では作らない
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC116

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:194-195
- 原文: ページ作成時のエントリは必ず未完了で登録する。状態は form → `awaiting`（回答待ち）、report → `unconfirmed`（確認待ち）。提示しただけのページを完了扱いにしない
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC117 と対

### HC117

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:196-198
- 原文: 状態遷移は必ず「未完了 → 完了」を踏む: form は「## HTML フォーム回答」を受領したターンで `answered`（回答済み）へ、report はユーザーから内容への確認応答（会話での言及・了解）を受けたターンで `confirmed`（確認済み）へ更新する
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC118 と重複（form 側の遷移タイミング）

### HC118

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:199-200
- 原文: 「## HTML フォーム回答」を受け取ったら、そのターンの最初の操作として index.html の当該エントリを `answered` に更新する。回答内容の反映作業より前に status を先に落とす
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC117 と重複

### HC119

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:201
- 原文: index を書き換えるたびに掃除する。新規追加のときだけでなく、状態を完了へ更新したときも行う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC120

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:202-203
- 原文: 同じプロジェクトの完了（`answered` / `confirmed`）エントリが 10 件を超えていたら、古い順にファイルと index エントリを削除して直近 10 件だけ残す。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC121

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:204
- 原文: 未完了（`awaiting` / `unconfirmed`）は数に関わらず削除しない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC120 の例外

### HC122

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:205
- 原文: ユーザーの「掃除して」には指示された範囲で即時対応する
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC123

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:206-207
- 原文: セッションが操作してよいのは、自分のプロジェクトのページと index.html（+ PWA 固定アセット）だけ。他プロジェクトのページの改稿・削除はしない
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC124

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:208-210
- 原文: index の最下部に運用元を明記する: この skill（cc-marketplace の claude-user-communication plugin、`plugins/claude-user-communication/skills/html-communication/`）に基づく Claude Code の HTML コミュニケーション用ディレクトリである旨と、skill の GitHub URL を footer に書く。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC125

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:211
- 原文: index を再生成するときも維持する
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC126

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:212-213
- 原文: PWA 固定アセットを配置する: `manifest.json`（name = claude-html-communication、start_url = index.html、display = standalone）と `icon-192.png` / `icon-512.png`。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC127

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:213-214
- 原文: index の `<head>` に `<link rel="manifest">` と theme-color を入れる。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC128

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:214
- 原文: 「閲覧用 HTML のみ」の例外はこれらと index.html だけ
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC22 の例外

### HC129

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:215-216
- 原文: index・PWA アセットが消えていたら、この skill の `templates/`（index.html 雛形・manifest.json・icon-192.png・icon-512.png）から再生成する
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC38（雛形起点）と同趣旨

### HC130

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:217-219
- 原文: パターンを追加・削除・修正したら作り直し、共通ページディレクトリへ置く。
- 分類: その他
- 性質: 媒体固有
- 補足: 対象は `gallery.html`。「`gallery.html` は [見せ方のパターン集](./references/patterns/README.md) を実物で並べたページ。`scripts/build-gallery.mjs` が生成する」が前提の記述
- 重複候補: HC46（パターン集へ足す）と対応

### HC131

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:219-220
- 原文: index からはリンクで辿らせ、一覧のエントリは持たせない（回答・確認の対象ではないため、状態遷移も掃除の対象にもならない）
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC102（サブページを index に登録しない）と同型

### HC132

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:221-223
- 原文: 雛形 `templates/index.html` の表示仕様（レンダリング JS・CSS）を変えたら、配信中の index.html にも同じ変更を適用する。配信中の index は以後エントリだけを更新し続けるため、雛形の更新は自動では届かない
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC133

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:224-226
- 原文: モバイル閲覧: claude-html-communication は tailnet 内限定の HTTPS 配信にしてある。提示時のターミナル出力には、ファイルパス / ページの serve URL / 一覧のルート URL の 3 つを必ず併記する（出力の全体像は下記「提示時のターミナル出力」）
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC260（ターミナルに書いてよいのは 2 つだけ）と重複

### HC134

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:227
- 原文: CSS/JS はすべてインラインで self-contained にする。外部 CDN・フォント・画像に依存しない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC97（Tailwind の CDN 不可）と同趣旨

### HC135

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:228
- 原文: `prefers-color-scheme` でライト/ダーク両対応にする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC49（雛形が持つもの）に含まれる

### HC136

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:229
- 原文: 構成は「前提（この文書は何の話か）→ 結論・概要 → 詳細 →（あれば）設問」の順。
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 結論先行の骨格は汎用だが、「（あれば）設問」まで含む並びは HTML フォーム前提。判断保留
- 重複候補: JR の結論先行、UC「結論・概要から詳細へ辿れる構造」と同趣旨。HC153（冒頭に地図を置く）と重複

### HC137

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:229
- 原文: セクション番号か目次を付ける
- 分類: 文書種別の構造
- 性質: 判断保留
- 補足: 節番号・目次は文書一般にも効くが、ここでは 3 pane の追従とセクション番号 2 系統が前提
- 重複候補: HC156（設問へのリンクの目次も置かない）と緊張関係

### HC138

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:230-231
- 原文: 結論の前に 2〜3 文の前提を置く。何のトピックか、どういう経緯でこの文書が要るのかを、他の作業から戻った読者がコンテキストを復帰できる粒度で書く。いきなり結論から始めない
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC153（冒頭に地図を置く）とほぼ同文。UC の HTML 化時の構造規定とも重なる

### HC139

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:232
- 原文: セクション番号は設問の有無で 2 系統に分け、両者を混ぜて通し番号にしない
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC141〜HC143 が細目

### HC140

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:233-234
- 原文: ラベルは、その `h2` の中に設問ブロックがあるかだけで決まる。設問があれば節の見出しを「設問 2/3」にする。判断材料の説明が同じ節にあっても変わらない
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC139 の細目

### HC141

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:235-236
- 原文: 判断材料が長くて節を分けたいなら、説明の節と設問の節を分けて、設問の節に判断材料を置かない。
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: なし

### HC142

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:236
- 原文: 同じ節に混ぜたなら見出しは設問側にする
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC140 と同趣旨

### HC143

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:237
- 原文: 設問を含むセクション: 「設問 2/3」のように、分母を設問セクション数にした番号を付ける
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC139 の細目

### HC144

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:238
- 原文: 設問が無い読む専用のセクション（前提・報告・比較・分析）: 「説明 2」のように別系統で番号を付ける（分母なし）
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC139 の細目

### HC145

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:239
- 原文: ラベルは `設問` と `説明` に固定する。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC146

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:239
- 原文: 末尾の「参考資料（判断には不要）」は読み飛ばし可の別枠で、この 2 系統に含めない
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC179（参考資料セクションへ隔離）と対応

### HC147

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:240-241
- 原文: ターン構造と無関係にブラウザで表示されるため、[ユーザーへの確認は選択肢形式で](../ask-with-choices/SKILL.md) に記載のレンダリングバグの影響を受けない
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 行動規定ではなく HTML 媒体の性質の宣言。HTML を選ぶ根拠として機能するので拾った
- 重複候補: AQ のレンダリングバグ節と対応

### HC148

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:245
- 原文: 情報デザイン norm ライブラリ（product-boilerplate repo の `docs/norms/`、出典付き）に従う。
- 分類: その他
- 性質: 判断保留
- 補足: 外部 norm ライブラリへの委譲。ライブラリ側が汎用の情報デザイン規範なので媒体固有と断定できない
- 重複候補: なし

### HC149

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:247-249
- 原文: 本文を書く前に 2 つ整理する（必須・最初にやる）／構成と出力に入る前に、次の 2 つを先に決める。
- 分類: 目的・読者の確定
- 性質: 汎用
- 補足: 見出し自身が規範（必須・最初にやる）を含むため、直後の本文と合わせて 1 件にした
- 重複候補: なし

### HC150

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:251-252
- 原文: 何を本文に書き、何を補足に回すか。読者がこの判断・理解に要る情報だけを本文に残し、細部は末尾の「参考資料（判断には不要）」へ回す。情報過多は避ける
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: HC161 / HC179 と同趣旨。JR「短くする目的で重要な情報を落とさない」と表裏

### HC151

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:253-254
- 原文: どの順で説明するか。読者が「何の話だっけ」とならない並びにする。前提は簡潔に、詳細は補足へ
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC138 と同趣旨

### HC152

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:256-257
- 原文: 提示前に確認: 本文の各セクションが読者の判断・理解に要るか。前提や細部が膨らんでいたら補足へ移し、説明順が追えるかを確かめる。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: HC150 / HC151 の提示前チェック版

### HC153

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:261-262
- 原文: 冒頭に地図を置く: 前提（何の話か・経緯）→ この文書の目的。前提の後に結論・答えを出す（前提は結論の手前に置く 2〜3 文、背景の長い経緯とは別物）
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC138 とほぼ同文。JR の結論先行の例外規定（冒頭の地図）とも重なる

### HC154

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:263-264
- 原文: 「読み方」の節を書かない。どこから読むか・どこを飛ばしてよいかの案内は置かない。構成と見出しで分かるようにするのが先で、案内文が要る時点で構成が悪い
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: JR「文章自身を語る文を削る」と同趣旨。HC155 が特例化

### HC155

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:265-267
- 原文: **冒頭に設問の件数・所在・設問どうしの関係を書かない。** 「決めることは 6 件で、各設問は判断材料の直後にあります」「設問 2〜4 は設問 1 で案 1 系を選んだ場合の設計判断です」の類は、読み方の案内そのもの。上から順に読めば分かる並びにするのが先で、予告が要るなら並びが悪い。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC154 の特例

### HC156

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:268
- 原文: 設問へのリンクの目次も置かない。件数は設問 pane の見出しと下部バーの進捗が示す
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC137（セクション番号か目次を付ける）と緊張関係

### HC157

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:269-272
- 原文: **ラベル + コロンで段落を作らない。** `この文書: …` `読み方: …` `結論: …` のような、太字ラベルにコロンを付けて説明を続ける形は使わない（user global rule「日本語テキストの執筆要点」が AI 口調の定型として禁じており、適用範囲に HTML 報告が含まれる）。HTML では構造で表す
- 分類: 文レベル
- 性質: 汎用
- 補足: 根拠は user global rule「日本語テキストの執筆要点」の AI 口調の定型禁止
- 重複候補: JR の `**ラベル**:` 形式禁止、MF「太字見出しで段落を区切らない」と同趣旨

### HC158

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:273-274
- 原文: ラベルが要るなら、ラベルを独立した行にして小さく弱い色で置く（雛形の `.eyebrow`）。コロンは付けない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC157 の代替手段

### HC159

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:275
- 原文: 節として立つ内容なら見出し（`h2` / `h3`）にする
- 分類: 文書種別の構造
- 性質: 汎用
- 重複候補: MF「構造を出したいならサブセクションか箇条書きのネストにする」と同趣旨

### HC160

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:276
- 原文: ラベルが無くても分かる内容なら、ラベルごと消して地の文にする
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: HC157 の代替手段

### HC161

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:277
- 原文: 冗長にしない。不要な細部・重複・言い換えを削る。読者が判断に使わない情報は参考資料へ逃すか落とす。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: JR「一つの主張は一度だけ書く」と同趣旨。HC150 とも重複

### HC162

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:278
- 原文: 各セクションは判断に効く分だけにし、網羅のための説明を足さない
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: HC161 と同趣旨

### HC163

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:279
- 原文: 1 議題 1 セクション。
- 分類: 文書種別の構造
- 性質: 汎用
- 重複候補: FN「論点の統合: 1 議題 1 設問」と同型

### HC164

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:279
- 原文: 判断セクションは「決めること → 背景 → 判断材料 → 設問」の同型に揃える
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: HC136（構成の順）と同型

### HC165

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:280-282
- 原文: **表を語る文を本文に置かない。** 表の直前にリード文を置かず、表について解説する段落も書かない。何の一覧かは `caption` が、注目すべき行はハイライトが担うので、それを日本語で言い直す文は文章自身を語る文にあたる。
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「表を語る文を置かない」自体は文章一般に効くが、caption とハイライトが役割を担うという前提は HTML ページ固有
- 重複候補: HC92（図を語る文を本文に置かない）と同趣旨。JR「文章自身を語る文を削る」

### HC166

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:282-283
- 原文: 表の前提・条件・読みどころは補足（`.su`）へ出し、表のセルから参照マーカーで飛ばす
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC170 / HC172 と同趣旨

### HC167

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:284
- 原文: **`caption` は表の下に置く**（`caption-side: bottom`）。表の本体を先に見せる
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC89（図の `.cap` を図の下に）と同趣旨

### HC168

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:285-286
- 原文: **「決め手」という語を使わない。** 表のどの行が効くかはハイライトが示す。「決め手は◯◯の行」「どこが決め手か」の類の文を書かない
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: HC165 と同趣旨

### HC169

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:287
- 原文: テーブルのセルは流し読みできる短い判定値（体言止め・記号・数値）にし、文を書かない。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### HC170

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:288
- 原文: 根拠・詳細は脚注か補足へ出す。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC166 / HC175 と同趣旨

### HC171

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:288
- 原文: 1 セル 1 情報。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: HC213（1 語 1 補足）と同型

### HC172

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:288-290
- 原文: **表の直下に補足リストを置かない。** 脚注と補足は pane に出るので、本文を汚さずに表と同時に読める
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: HC166 と同趣旨

### HC173

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:291
- 原文: 比較表は「列 = 選択肢、行 = 観点」で列は 5 以下。
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 比較表の軸取りは文章一般にも効くが、選択肢を列に置く形は選択肢 UI と連動した設計
- 重複候補: HC234（比較設問には多観点の比較表）と対応

### HC174

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:291
- 原文: 判断を分ける行はハイライトする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC165 / HC168（ハイライトが役割を担う）と対応

### HC175

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:292
- 原文: 出典・長い補足を本文の括弧書きで埋め込まない。出典はチップ等に分離する
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 括弧書きへの詰め込み禁止は汎用、チップへの分離は HTML 固有
- 重複候補: HC170 と同趣旨

### HC176

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:293
- 原文: 用語は初出の位置で説明する。
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC212 / HC221、FN「用語の出自: 初出で必ず定義する」と同趣旨

### HC177

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:293
- 原文: 冒頭に用語集を置かない（下記）
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC211 と重複

### HC178

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:294
- 原文: 脚注は本文と双方向のページ内リンクにする（下記）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC222 と重複

### HC179

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:295
- 原文: 回答・判断に不要な資料は末尾の参考資料セクションへ隔離し、「読み飛ばしてよい」と明記する
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 隔離は汎用の取捨選択だが、「読み飛ばしてよい」の明記は HC154（読み方の案内を置かない）と衝突しうる HTML 固有の運用
- 重複候補: HC146 / HC150 と同趣旨

### HC180

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:296
- 原文: フォームには入力の下書き自動保存を実装する（localStorage、入力の都度保存・再訪時に復元。端末ローカル）
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC49（雛形が持つもの）に含まれる

### HC181

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:297
- 原文: 「リセット」ボタンを併設する（localStorage の下書きを消して空に戻す）
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC77（副操作＝リセット）と対応

### HC182

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:298
- 原文: 端末をまたいだ下書きの持ち運びは行わない。下書きは書いた端末の中だけで復元する
- 分類: その他
- 性質: 媒体固有
- 重複候補: HC180 の限定

### HC183

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:299
- 原文: 推奨バッジには根拠の併記と覆し可能性（非推奨側も選べることの明示）を必須にする
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 推奨に根拠と覆し可能性を添える規範自体は選択肢提示一般に効くが、「推奨バッジ」は UI 要素
- 重複候補: HC184 / HC194、FN「覆しフラグは選択肢単位で付与する」と同趣旨

### HC184

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:300-302
- 原文: 推奨案の短所に「他案が勝つ条件」を書く（これが覆し可能性の明示を兼ねる）
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 前置きは「選択肢の説明を長所と短所に分ける形（雛形の `.proscons`）を使うときは 3 つを守る」
- 重複候補: HC183 / HC195 と同趣旨

### HC185

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:302
- 原文: 1 行 1 文 60 字以内にする（`label` はクリック対象で読み込む場所ではない）
- 分類: 文レベル
- 性質: 媒体固有
- 重複候補: なし

### HC186

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:302-303
- 原文: 選択肢の説明（`.d` = 案の中身）と積層して使う（長所短所 = 案の帰結）。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### HC187

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:304
- 原文: 選択肢が 2 つで片方が明確に優位なときは使わない。短所が空振りする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC184 の適用条件

### HC188

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:305
- 原文: **推奨が依存する前提には、実測か一次情報の出典を必ず付ける。**
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: user global rule「調査は一次情報から始める」、FN「事実主張の正確さ」「量的表現のマーカー」と同趣旨

### HC189

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:306
- 原文: 出典は実装・公式ドキュメント・変更履歴・過去の回答フォームのいずれか。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: user global rule「調査は一次情報から始める」の探索順序と同趣旨

### HC190

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:307-308
- 原文: **自分が同じセッションで書いた文書を出典にしない。** 要約は限定・条件・例外を落とすので、それを根拠にすると落ちたことが分からないまま前提になる。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: user global rule「自分の記述を出典の代わりにしない」とほぼ同文

### HC191

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:309
- 原文: 実測値と推定値は区別して書く
- 分類: 文レベル
- 性質: 汎用
- 重複候補: JR「事実と意見を区別する」、FN「量的表現のマーカー」と同趣旨

### HC192

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:310-311
- 原文: **選択肢は、正典の判断フローの種別を全件並べてから落とす。** user global rule / 参照知識 skill / 作業手順 skill / agent / hook / CLAUDE.md の 6 種を当て、
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 「全件並べてから落とす」は汎用の選択肢設計だが、列挙されている 6 種は dotclaude 系の作業に固有
- 重複候補: FN「網羅性: 遷移表・仕分け表は対象全件を列挙してから分類する」と同趣旨

### HC193

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:312-313
- 原文: 採らない種別には落とした理由を 1 文で書く。並べずに 2〜3 案だけ出すと、読者は「他に手が無い」と受け取る
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC194 と同趣旨

### HC194

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:314-315
- 原文: **推奨の説明には「他案を排除する理由」を書く。** 推奨案の利点だけを書かない。「A は速い」は根拠ではなく、「B は速いが復旧手段が無い」が根拠。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC183 / HC193 と同趣旨

### HC195

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:315-316
- 原文: 覆せる条件も、読者がその場で真偽を判定できる形にする（「今後 〜 しか出ないなら」のような全称命題は判定できない）
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC184 と同趣旨

### HC196

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:318
- 原文: **確認事項も設問として扱う。** 設問の総数と進捗に数え、数えない扱いをしない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC107（questions は答える設問の総数）と対応

### HC197

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:319-320
- 原文: 選択肢を持たない「承認するだけ」の確認は、1 つのカードにまとめてチェックリスト（雛形の `.checks`）にしてよい。設問カードを乱立させずに合意を取れる
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN「一括確認枠の掲載条件」と対応

### HC198

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:321-323
- 原文: **ただし設問の順序とトピックのグルーピングを優先する。** 関係のない内容を「確認だから」という理由で 1 つのカードにまとめない。分けたほうが読める並びなら、確認であってもカードを分ける
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC197 の限定。FN「一括確認枠の掲載条件」と同趣旨

### HC199

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:324-325
- 原文: **既定チェック済みにしない。** 読み飛ばしても「承認」として記録され、合意を取った証拠にならない。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### HC200

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:325
- 原文: 未操作は「未確認」として回答テキストに出す
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC243（未回答は `未回答` と明記）と同趣旨

### HC201

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:326
- 原文: 判断が要るもの（選ぶ余地があるもの）は通常の設問にする。チェックリストに混ぜない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC197 の限定。FN「一括確認枠の掲載条件」と同趣旨

### HC202

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:327-328
- 原文: **まだ読んでいない後続の設問を前提にした条件を、判断材料に書かない（非推奨）。** 読者はその設問の選択肢も用語もまだ知らないので、条件が判定できない。
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 上から順に読む前提は HTML ページの並びに依存するが、前方参照の禁止自体は文章一般に効く
- 重複候補: FN「設問の自立性」と同趣旨

### HC203

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:328-329
- 原文: 前提が要るならその設問より前に置くか、条件ごと 1 つの設問へ統合するのが先
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: FN「論点の統合」と同趣旨

### HC204

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:330
- 原文: それでも書くときは「設問 N で推奨案を選んだ場合」までにとどめる。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC202 の例外

### HC205

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:331
- 原文: 個別の選択肢の名前や、その説明を読まないと分からない用語を出さない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC219（自分で作った語を説明なしに使わない）と同趣旨

### HC206

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:332
- 原文: 1 文に条件を 2 つ以上詰めない。条件が 2 つあるなら文を分ける
- 分類: 文レベル
- 性質: 汎用
- 重複候補: JR の文の分割規範と同趣旨

### HC207

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:333-334
- 原文: **設問カードには回答済みかどうかのマーカーを付ける**（雛形の `.qstat`）。折り畳んだ状態でも、どこまで答えたかが一覧で分かるようにする。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### HC208

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:335-336
- 原文: 色は使わず、形（輪郭の丸 / 塗りの丸）と語（未回答 / 回答済み）の両方で区別する。雛形の色役割は 3 つに固定してあり、状態を表す枠が無い。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC57 / HC60 と同趣旨

### HC209

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:337
- 原文: 判定は下部バーの進捗と揃えて、選択肢を選んだら回答済みとする（補足欄だけの記入は未回答）
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### HC210

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:341-343
- 原文: 用語の説明は本文に置かず、補足（`.su`）へ出して本文から参照マーカーで飛ばす。定義を要るのは知らない読者だけで、知っている読者には本文を分断する障害物になる。3 pane では補足 pane が本文と同時に見えるので、飛ばずに読める。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC176 / HC166 と同趣旨

### HC211

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:345
- 原文: 冒頭に用語集の節を作らない。
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC177 と重複

### HC212

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:345
- 原文: 語が初めて判断に関わる位置で参照マーカーを置く
- 分類: 構成・順序
- 性質: 媒体固有
- 重複候補: HC176 と同趣旨

### HC213

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:346
- 原文: 1 語 1 補足。1 補足に複数の語を詰めない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC171（1 セル 1 情報）と同型

### HC214

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:347
- 原文: 説明は 1〜3 文。何であるかと、その判断にどう効くかまでを書く
- 分類: 文レベル
- 性質: 判断保留
- 補足: 補足 pane の分量規定だが、定義文の内容規定（何であるか＋どう効くか）は汎用に効く
- 重複候補: なし

### HC215

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:348
- 原文: 短い定義を並べるときは `※ 語 = 定義` の形を 1 行ずつ使い、語だけを太字にする。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: MF の `※ 参照` 記法と形が近い

### HC216

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:349
- 原文: 補足 pane の中で使う書き方で、本文には置かない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC210 と同趣旨

### HC217

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:350
- 原文: 1 つの節で 3 語を超えるなら、説明の順序か構成が間違っている。語を減らすか節を分ける
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: なし

### HC218

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:352-355
- 原文: **識別子・番号つきの語は、必ず補足に実体を書く。** 規範 ID（`DG14`）、フェーズ番号（`T4`）、フォーム番号（`f017`）、PR 番号、独自の分類コードが対象。番号だけでは何を指すか分からず、読者は台帳を開かないと判定できない。ページ内で完結させる。
- 分類: 取捨選択
- 性質: 判断保留
- 補足: 「ページ内で完結させる」は HTML 固有の言い回しだが、識別子に実体を添える規範自体は文書一般に効く
- 重複候補: FN「設問の自立性」と同趣旨

### HC219

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:357
- 原文: **自分で作った語を説明なしに使わない。**
- 分類: 文レベル
- 性質: 汎用
- 補足: 実例「設問の見出しに「スコープ手段」という造語を置き、定義を書かないまま選択肢を問うたことがある（回答不能になった）」
- 重複候補: JR「独自の新語を作らない」、FN「新語導入の規律」「用語の出自」と同趣旨

### HC220

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:358
- 原文: 既存の一般語・公式名を先に探し、あればそれを使う。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: FN「新語導入の規律」とほぼ同文

### HC221

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:358-359
- 原文: 無ければ作ってよいが、初出で必ず定義する。
- 分類: 文レベル
- 性質: 汎用
- 補足: 判定基準（371-372 行）「その説明を消したとき、直後の表や設問が読めなくなるか。なるなら補足に置く。ならないならその語は本文に要らない」が節末に付く
- 重複候補: HC176 / FN「用語の出自」と同趣旨

### HC222

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:376-377
- 原文: 出典・実測値・根拠を脚注へ逃がしたら、本文の参照記号と脚注を相互にリンクする。番号だけを振って飛べない状態にしない。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC178 と重複

### HC223

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:379
- 原文: 本文側: `<sup>` の中にリンクを置き、脚注へ飛ばす。id は `fnref-{番号}-{同一脚注内の連番}`
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC224

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:380
- 原文: 脚注側: id は `fn-{番号}`。先頭の番号を参照元へのリンクにし、末尾に戻りリンク（`↩`）を置く
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC225

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:381-382
- 原文: 同じ脚注を複数箇所から参照するときは、参照ごとに別の id を振り、戻りリンクを参照の数だけ並べる（`↩1` `↩2`）。戻り先が 1 つに潰れると往復できない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC226

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:383
- 原文: `scroll-margin-top` を入れ、飛んだ先がビューポート端に貼りつかないようにする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC227

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:384
- 原文: `:target` で飛んだ先を一時的に強調する。番号だけでは着地点が分からない
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### HC228

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:393-394
- 原文: 参照記号と脚注の対応（リンク切れ・id の重複・脚注の定義漏れ / 参照漏れ）は、下記「提示前の機械検査」のスクリプトが検査する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 行動規定ではなく検査の分担の宣言だが、HC222〜HC227 の担保先を定めるので拾った
- 重複候補: HC244 と対応

### HC229

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:398-399
- 原文: 設問は関連するセクションの直下に置く。ページ末尾にまとめて並べない
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: why「設問が多いとき、末尾集約は判断材料と設問の往復スクロールが発生して回答しづらい」
- 重複候補: HC141 と同趣旨

### HC230

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:400
- 原文: 回答コピー機能は全セクションの設問を集約して 1 テキストにする（配置と集約は別）
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC239 と重複

### HC231

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:401-402
- 原文: 最終確認などの自由記入欄は、ページ末尾ではなくスクロール追従の下部固定領域に置く（コピー用フッター内など）。上から順に読みながら、気づいた点を都度記入できるようにする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC75（入力ゾーン）と重複

### HC232

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:403
- 原文: 各設問に選択肢 (radio / checkbox) を用意し、
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ6（可能な限り選択肢から選べる形式にする）と同趣旨

### HC233

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:403
- 原文: 推奨案には推奨バッジを付ける
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC183 と重複

### HC234

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:404-405
- 原文: 技術選定などの比較設問には、選択肢の説明文だけで判断させない。設問の直前に多観点の比較表 (機能・性能・実績・エコシステム・リスク・移行性・保守状況など、その選定で効く観点) を置き、
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 「説明文だけで判断させない」は選択肢提示一般に効く。比較表の直前配置は HTML ページ固有
- 重複候補: HC173 / AQ30（各選択肢の詳細は本文で先に提示する）と同趣旨

### HC235

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:405-406
- 原文: 各観点は調査の裏取り付きで書く。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC188 と同趣旨

### HC236

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:406
- 原文: 選択肢の description は比較表の結論の要約に徹する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: AQ31（option `description` は本文の要約として書く）とほぼ同文

### HC237

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:407
- 原文: 選択肢に収まらない回答用に、設問ごとに「その他」の自由記述欄を付ける
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ8（「Other」で自由入力できる）と同趣旨

### HC238

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:408
- 原文: 設問ごとに補足記入欄（任意）を付ける
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC237 と近接

### HC239

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:409-410
- 原文: ページ末尾に回答の live preview と「回答をコピー」ボタンを置く。ボタンはそれまでの選択・自由記述を 1 つのテキストに整形してクリップボードへコピーする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC230 と重複

### HC240

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:411-418
- 原文: 整形フォーマットは Claude Code にそのまま貼れる形にする:（`## HTML フォーム回答（{テーマ}）` / `- Q1（{設問}）: {回答}` / `- Q2（{設問}）: {回答}` / `- 補足: {自由記述}`）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: HC265 / AQ17 と対応

### HC241

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:420
- 原文: クリップボード API が使えない環境向けに、preview の textarea を全選択コピーできるフォールバックを付ける
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### HC242

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:421
- 原文: 未回答の設問がある状態でもコピーは許可し、
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### HC243

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:421
- 原文: 未回答は `未回答` と明記する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC200（未操作は「未確認」として出す）と同趣旨

### HC244

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:425-429
- 原文: ページを生成・改稿したら、op-review より前に検査スクリプトを実行する。（`"${CLAUDE_PLUGIN_ROOT}/skills/html-communication/scripts/validate-page.sh" <ページのパス>`）
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 「Exit: 0 = 指摘なし、1 = 指摘あり、2 = 前提条件エラー（node / npx が無い等）」（438 行）
- 重複候補: なし

### HC245

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:431-432
- 原文: 3 層（html-validate / linkinator --check-fragments / 雛形固有の自作検査 + onclick grep）を一括実行し、指摘を JSON で stdout に集約する。`total` が 0 になるまで直して再実行する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC255（レビューは指摘 0 件まで繰り返さない）と対照的

### HC246

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:433-434
- 原文: 検査対象はそのセッションで生成・改稿したページだけ。過去ページには旧雛形由来の指摘が残っているため、一括適用しない
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC123（他プロジェクトのページを触らない）と同趣旨

### HC247

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:435-436
- 原文: 「一覧に戻る」リンク（`./`）の解決に同ディレクトリの index.html が要る。共通ページディレクトリ内のファイルパスで実行する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC22 と対応

### HC248

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:437
- 原文: npx のキャッシュがあればオフラインで動く。1 ページ約 7 秒（初回のみダウンロードで + 数秒）
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 実測値の記載。行動規定ではないが検査の実行判断に使う情報として拾った
- 重複候補: なし

### HC249

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:439
- 原文: 検査を通したら、ターミナルに書く内容を URL と問いだけに絞る。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC260 と重複

### HC250

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:440
- 原文: 申し送りを書きたくなったらページへ足して、検査からやり直す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC262 と重複

### HC251

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:444
- 原文: 設問を含むフォームは、提示前に `page-reviewer` agent を **1 本だけ** 起動する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 実測の根拠は 467-479 行（4 facet 2 ラウンド 8 本で指摘 133 件・828k トークン・1 ラウンド約 14 分、統合後 1 本で 84.8k トークン・約 80% 減）
- 重複候補: FN1 と重複

### HC252

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:445
- 原文: 設問の無い報告は起動しない。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### HC253

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:447-451
- 原文: 呼び出すときに渡すもの。（対象ページの絶対パス / 一次情報の所在（台帳・設計ドキュメント・実装・過去の回答フォーム） / そのページが何を決めるためのものか）
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### HC254

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:453-455
- 原文: agent が見るのは、一次情報との突合（捏造と誤引用）と、推奨・選択肢集合の妥当性だけ。文言・マークアップ・可読性は見ない。それらは上の機械検査と、下の作成規範が持つ。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: FN の facet 移管表と同趣旨

### HC255

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:459
- 原文: **指摘 0 件まで繰り返さない。**
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC245（機械検査は total が 0 になるまで）と対照

### HC256

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:461
- 原文: 推奨または選択肢集合を変える指摘が出たら、直して **もう 1 度だけ** 回す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### HC257

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:462
- 原文: 文言・マークアップの指摘は、そのラウンドで直して終わる。再ラウンドしない
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC254 と同趣旨

### HC258

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:463
- 原文: レビュー実行中は対象ファイルを編集しない。agent は起動時点の版を読む
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: agent レビュー一般に効く運用規範だが、対象は HTML ページに限定されている
- 重複候補: なし

### HC259

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:482-484
- 原文: 取りこぼしが実際に判断を歪めたら、[提示前レビューの norm](./references/review-norms.md) の表を見直す。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 前提「clarity を外したことで残る穴は、未定義の造語のように文脈を知らない読者にしか気づけないもの。機械検査が拾えるのは識別子・文長・参照マーカーまでで、造語は判定できない」
- 重複候補: FN2 とほぼ同文

### HC260

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:488-492
- 原文: ターミナルに書いてよいのは次の 2 つだけ。（ページの serve URL / 一覧のルート URL / ファイルパス。 ユーザーへの問い（op-review を回すか、次にどちらへ進むか等））
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 判定基準（498-500 行）「いま書こうとしている文は URL か問いか。どちらでもないならページへ移す。結論・要約・セクション構成の説明・表の再現・推奨の根拠は、すべてページの中にある」
- 重複候補: HC133 / HC249 と重複

### HC261

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:491
- 原文: 複数ページを作った議題では代表ページの分だけを出す（サブページは代表からリンクで辿る）
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: HC100 と同趣旨

### HC262

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:494-495
- 原文: **申し送りもページに書く。** 既提示ページの改稿である旨、index の状態を変えた理由、op-review が未実施である旨、確度の低い箇所。すべてページの参考資料か該当箇所に置く。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC250 と重複

### HC263

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:496
- 原文: ターミナルに申し送りの枠を作らない。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: why（502-504 行）「「ページに書いていない申し送り」を例外として認めると、提示のたびにその枠を埋める内容を探すようになる。ページに書けたはずの内容がターミナルへ逃げ、読まなくても分かる要約が再生産される」
- 重複候補: HC262 の裏返し

### HC264

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:500
- 原文: ユーザーの直接の質問への回答も、ページに書いたなら書かない。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC260 と同趣旨

### HC265

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:508
- 原文: ユーザーから「## HTML フォーム回答」で始まるテキストが貼られたら HTML フォームの回答として扱う。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ17 とほぼ同文。HC118 と対応

### HC266

- 位置: plugins/claude-user-communication/skills/html-communication/SKILL.md:510-511
- 原文: 以降の解釈まとめ・作業フローは [ユーザーへの確認は選択肢形式で](../ask-with-choices/SKILL.md) の「複数回の質問と回答後のフロー」と同じ。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ17 と重複

## FN — plugins/claude-user-communication/skills/html-communication/references/review-norms.md

### FN1

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:3
- 原文: レビューは `page-reviewer` agent 1 本で行う（[SKILL.md](../SKILL.md) の「提示前のレビュー」）。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 経緯（6-16 行）「以前は 4 facet（内容整合 / 情報デザイン / clarity / 設計妥当性）を並列で回していた。実測（2026-08-18、ih-f007）で、判断を変えた指摘が内容整合と設計妥当性からしか出ず、情報デザインと clarity は 48% のトークンを使って 0 件だったため」。移管表は「内容整合 → `page-reviewer` の手順 (a)」「設計妥当性 → `page-reviewer` の手順 (b)〜(e)」「情報デザイン → 雛形（`templates/page.html`）と機械検査」「clarity → 機械検査と、SKILL.md の作成規範 3 項目」
- 重複候補: HC251 と重複

### FN2

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:17-20
- 原文: clarity を agent から外したことで、文脈を知らない読者にしか気づけない指摘（未定義の造語など）を取りこぼす余地が残る。機械検査が拾うのは識別子・文長・用語の参照マーカーの有無までで、造語そのものは判定できない。取りこぼしが実際に出たら、この表を見直す。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC259 とほぼ同文

### FN3

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:24
- 原文: 以下はユーザーレビューで繰り返し指摘された観点。今後も指摘があればここに追記する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### FN4

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:26
- 原文: 設問の自立性: 設問が参照する定義・分類・根拠はすべて同一文書内に再掲する（置き換え型フォームは特に）
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 「設問」を「読者が判断する箇所」と読めば汎用。ここでは確認フォームの設問が対象
- 重複候補: HC218（識別子・番号つきの語は補足に実体を書く）、HC202 と同趣旨

### FN5

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:27
- 原文: 論点の統合: 相互依存する論点を複数の設問に分けない。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC203（条件ごと 1 つの設問へ統合）と同趣旨。UC「判断が 2 件以上なら分割」と緊張関係

### FN6

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:27
- 原文: 1 議題 1 設問
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC163（1 議題 1 セクション）と同型

### FN7

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:28
- 原文: 確定と未確定の峻別: 確定事項を無断で再質問・変更しない。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: user global rule「長い調査・設計では確定事項の台帳を持つ」と同趣旨

### FN8

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:28
- 原文: 覆す選択肢には明示フラグ。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN12 / HC183 と同趣旨

### FN9

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:28
- 原文: 確定していないものを確定扱いしない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: JR「事実と意見を区別する」と同趣旨

### FN10

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:29
- 原文: 一括確認枠の掲載条件: 一括承認の枠に入れてよいのは確定事項からの変更を含まない項目（純粋なバージョン更新等）のみ。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC197 / HC201 と同趣旨

### FN11

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:29-30
- 原文: 既存構成からの乗り換え・覆しは変更の大小を問わず個別設問 + 明示フラグで扱う
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN8 / HC201 と同趣旨

### FN12

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:31
- 原文: 覆しフラグは選択肢単位で付与する: 1 設問に覆しに該当する選択肢が複数ある場合、その全選択肢の説明文にフラグを付ける。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN8 の細目

### FN13

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:32
- 原文: 設問文での言及はフラグの代替にならない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN12 の裏返し

### FN14

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:33
- 原文: 管理物の増加への警戒: 専用ファイル・独立 skill 等の新規管理物を増やす提案は、増減の検算と負債リスクの明示を伴う
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### FN15

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:34
- 原文: 最小ロードの粒度: rule 等の適用範囲は「本当にそれを必要とする対象」に絞られているかを疑う（広域ひとまとめを許さない）
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: なし

### FN16

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:35
- 原文: 実例は実測値そのまま: 実在 repo に帰属させる例示は実際のパス・値を転記し、
- 分類: 文レベル
- 性質: 汎用
- 重複候補: HC188 / HC191 と同趣旨

### FN17

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:35
- 原文: 理想化するなら架空例と明示
- 分類: 文レベル
- 性質: 汎用
- 重複候補: FN38（量的表現のマーカー）と同趣旨

### FN18

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:36
- 原文: 事実主張の正確さ: 数値・列挙は実測と突合。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: HC188、user global rule「調査は一次情報から始める」と同趣旨

### FN19

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:36
- 原文: 個数表記は同一文書内の列挙個数とも突合する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: FN37（メタデータの突合）と同趣旨

### FN20

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:36
- 原文: 省略には省略マーカー
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: FN24（中略の明示）と同趣旨

### FN21

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:37
- 原文: 対話残留の排除: 「あなた」等の対話依存表現を使わない。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: JR の AI 口調・チャット残留表現の禁止と同趣旨

### FN22

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:37
- 原文: ユーザー発言は「第N回指示の『…』」形式で引用
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 引用形式の規定。回数つきフォームの系列を前提にしているが、文書一般の出典表記としても読める
- 重複候補: FN23 と同趣旨

### FN23

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:38
- 原文: 引用の verbatim 徹底: 「」で括る引用は回答原文からそのままコピーする（部分文字列として原文に存在するかで検算)。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: HC190（自分の要約を出典にしない）と同趣旨

### FN24

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:38-39
- 原文: 中間を省く場合は「…（中略）…」を明示する。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: FN20 と同趣旨

### FN25

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:39
- 原文: 圧縮したい場合は「」を使わず地の文で要約する
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: FN23 の裏返し

### FN26

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:40-41
- 原文: 処遇の単一正: 対象ごとの処遇（移行対象・スコープ内外等）は設問セクションを唯一の正とし、他セクションでは結論を再記述せず「→ N.n 参照」のポインタにする。
- 分類: 構成・順序
- 性質: 判断保留
- 補足: 「一つの主張は一度だけ書く」の適用だが、正の置き場を設問セクションに固定する点はフォーム固有
- 重複候補: JR「一つの主張は一度だけ書く」、HC161 と同趣旨

### FN27

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:41
- 原文: 再記述する場合は文言一致を検算する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: HC109（title の一字一致）、FN36 と同型

### FN28

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:42-43
- 原文: 論点移動時の波及検索: 設問をセクション間で移動・分離したら、本文だけでなく placeholder・例文・注記も含めて移動した論点名で artifact 全体を検索し、旧配置前提の参照を更新する
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: 波及検索そのものは文書一般に効くが、対象が設問・placeholder という HTML フォームの構成要素
- 重複候補: FN29 と同型

### FN29

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:44-46
- 原文: 用語改称時の全置換: 用語・呼称を変えたら、旧語で artifact 全体を検索して残存 0 を確認してから提示する。対象は本文・表のセル・見出し・選択肢のタイトルと説明文に加えて、回答生成用のスクリプト内文字列まで含む
- 分類: 検知・レビュー手順
- 性質: 判断保留
- 補足: why「回答テキストはそのまま確定の記録になるため、ここが残ると誤った確定が記録される」。検索範囲にスクリプト内文字列を含む点は HTML フォーム固有
- 重複候補: FN28 と同型。MF「タイトルを変更した場合は被リンク側も更新する」と同趣旨

### FN30

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:47
- 原文: 確定チェーンの突合: 「確定事項の記録」は直前回で確定した項目を先に列挙し 1:1 で突合してから書く。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: user global rule「長い調査・設計では確定事項の台帳を持つ」と同趣旨

### FN31

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:48
- 原文: 部分確定（「ここまではよい」等）は対象範囲を項目単位に分解して漏れなく記録する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: FN30 の細目

### FN32

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:49
- 原文: 変更点の明示: 過去回の内容から変えた箇所を「〜のまま」と書かない。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: なし

### FN33

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:49
- 原文: 変更として明示し確認範囲に含める。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: FN11（覆しは個別設問 + 明示フラグ）と同趣旨

### FN34

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:50
- 原文: 無変更の項目も「（確定済み: {内容の要約}、変更なし）」の形で内容を再掲する
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 再掲の書式まで指定している。連続するフォームの回次を前提にした規定
- 重複候補: FN4（同一文書内に再掲）と同趣旨

### FN35

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:51
- 原文: 網羅性: 遷移表・仕分け表は対象全件を列挙してから分類する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: HC192（判断フローの種別を全件並べてから落とす）と同趣旨

### FN36

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:52
- 原文: TOC の機械導出: 目次のリンクテキストはセクション見出しの文字列をそのまま複製する（別文言で要約しない）
- 分類: 表記・記法
- 性質: 判断保留
- 補足: 目次を持つ文書一般に効くが、HC156 は HTML ページで設問の目次を禁じている
- 重複候補: HC109（title の一字一致）、MF「リンク文字列には対象ドキュメントの h1 をそのまま使う」と同趣旨

### FN37

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:53
- 原文: メタデータの突合: 回数・問数等のカウント改訂時は本文だけでなく title 等のメタデータ領域も grep で全出現箇所を突合する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: HC36（ページと index を同じターンで揃える）、FN19 と同趣旨

### FN38

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:54
- 原文: 量的表現のマーカー: 具体数値（レイテンシ・サイズ・期間等）は「裏取り済み」か「推定（未実測）」かを明示する
- 分類: 文レベル
- 性質: 汎用
- 重複候補: HC191（実測値と推定値は区別）、JR「事実と意見を区別する」とほぼ同文

### FN39

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:55
- 原文: 用語の出自: AI が持ち込んだ命名・専門用語はユーザー定義と区別し、
- 分類: 文レベル
- 性質: 汎用
- 補足: 検算方法「用語ごとに「ユーザーの発言に遡れるか」で検算する」
- 重複候補: HC219 と同趣旨

### FN40

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:55
- 原文: 初出で必ず定義する。
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: HC176 / HC221 とほぼ同文

### FN41

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:56-57
- 原文: 過去回の選択肢文や図表の注記を経由して定着した用語を「定義済み」扱いしない（レビュー agent は経緯を知っているため気づけない。用語ごとに「ユーザーの発言に遡れるか」で検算する）
- 分類: 文レベル
- 性質: 判断保留
- 補足: 判定の主体がレビュー agent である点は運用固有だが、規範自体は文書一般に効く
- 重複候補: HC190（自分の書いた文書を出典にしない）と同趣旨

### FN42

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:58
- 原文: 新語導入の規律: 概念に名前を付ける前に、既存の一般用語・業界標準語を調査し、あればそれを使う。
- 分類: 文レベル
- 性質: 汎用
- 補足: 出典「clarity norm C12〜C13。例: 独自語「スロット化」→ 一般語「パラメータ化」に置き換えた類の事例」
- 重複候補: HC220 とほぼ同文。JR「独自の新語を作らない」

### FN43

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:59
- 原文: 独自のコイン語・分類コードを作らない。
- 分類: 文レベル
- 性質: 汎用
- 重複候補: JR「用語は 1 概念 1 語で通す。独自の新語を作らない」とほぼ同文

### FN44

- 位置: plugins/claude-user-communication/skills/html-communication/references/review-norms.md:59-60
- 原文: 導入する場合はユーザーの明示合意を取る
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC221（初出で必ず定義する）より強い要求。user global rule「設計判断を含む作業は提案と実装を分ける」と同趣旨

## AQ — plugins/claude-user-communication/skills/ask-with-choices/SKILL.md

### AQ1

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:9-11
- 原文: レンダリングバグ（後述「AskUserQuestion を単独ターンで発行する（レンダリングバグ回避）」）が修正されるまで、AskUserQuestion は使用禁止。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: why「ターン分割ワークアラウンドで会話ターンを 1 回余計に消費するなら、選択肢 UI の利点がそもそも薄いため」
- 重複候補: HC5 と同趣旨

### AQ2

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:12
- 原文: 代替: 簡単な確認はチャットのフリーテキストで質問し、
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC4 / HC5、UC「数行・数点に収まる報告、単発から少数の質問: フリーテキスト」と同趣旨

### AQ3

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:12-13
- 原文: 複雑・設問が多い確認は [入り組んだ説明・報告・確認は HTML で行う](../html-communication/SKILL.md) の HTML フォームにする。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ15、HC3、UC の HTML 判定と同趣旨

### AQ4

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:14-15
- 原文: 修正の追跡と解除条件・解除手順は claude-known-issues plugin の台帳（エントリ id: `askuserquestion-rendering`）が管理する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### AQ5

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:15-16
- 原文: バグ修正を確認したらこの警告を削除し、以下の本来の運用に戻す。
- 分類: その他
- 性質: 媒体固有
- 重複候補: AQ47（レンダリングバグ修正後の運用）と対応

### AQ6

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:18
- 原文: ユーザーに確認・質問をする際は、可能な限り `AskUserQuestion` ツールを使い、選択肢から選べる形式にすること。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 根拠「自由記述よりも選択肢の方が回答しやすい」（20 行）。AQ1 の時限措置で現在は停止中
- 重複候補: UC「判断をユーザーに委ねる問いが主題: ask-with-choices skill を読む」と対応

### AQ7

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:21
- 原文: 選択肢が明確に列挙できる場合は必ず選択肢形式にする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ6 と同趣旨

### AQ8

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:22
- 原文: 選択肢に収まらない場合はユーザーが「Other」で自由入力できる
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: ツールの性質の説明。行動規定ではないが選択肢設計の前提として拾った
- 重複候補: HC237（「その他」の自由記述欄）と同趣旨

### AQ9

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:23
- 原文: **独立した複数の判断を求める場合は、1つの質問にまとめず複数の質問に分ける**（AskUserQuestion は最大4問まで対応。TUI ではタブ形式で表示され、各質問を独立して回答できる）
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: UC「判断が 2 件以上: 1 件ずつ順に出すか、HTML にまとめる」と同趣旨。FN5（相互依存する論点を分けない）と緊張関係

### AQ10

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:24
- 原文: **複数質問機能 (4 問まで) は積極的に活用する**。1 問ずつ送ると往復回数が増えてユーザーの待ち時間が伸びるため、まとめられるものはまとめる。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: UC「判断が 2 件以上: 1 メッセージに並べない」と衝突しうる

### AQ11

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:24
- 原文: 独立性が低い・順序依存があるなど分割が必要なケースだけ 1 問にする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ9 の限定

### AQ12

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:25
- 原文: **5問以上の場合は複数回に分けて AskUserQuestion する**。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ15（4 問超は HTML フォーム）と閾値が近接

### AQ13

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:25
- 原文: 1回目の回答を待ってから2回目を発行する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ34 と同趣旨

### AQ14

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:26
- 原文: **複数回に分ける場合は、AskUserQuestion の前に全体計画を提示する**: 「全N問を M回に分けて確認します（1回目: Q1〜Q4、2回目: Q5〜Q6）」のように、総質問数・分割回数・各回の内容を事前に示す。ユーザーが見通しを持てるようにする
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC155（冒頭に設問の件数・所在を書かない）と正反対の規定

### AQ15

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:30-31
- 原文: 前提説明が長い・設問が多い（目安 4 問超）・比較表が必要な確認は、AskUserQuestion ではなく [入り組んだ説明・報告・確認は HTML で行う](../html-communication/SKILL.md) の HTML フォームを使う。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC3、AQ3、UC の HTML 判定と同趣旨

### AQ16

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:32
- 原文: AskUserQuestion は軽い確認・少数の設問に使う。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: HC4 と同趣旨

### AQ17

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:33-34
- 原文: ユーザーから「## HTML フォーム回答」で始まるテキストが貼られたら HTML フォームの回答として扱い、以降は「複数回の質問と回答後のフロー」の解釈まとめ以降と同じ手順で進める。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC265 / HC266 と重複

### AQ18

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:38
- 原文: 複雑な判断を聞く時、選択肢 (option) を列挙する前に、その判断の上流にある **意味的・構造的決定** を先に明示する。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why（40-44 行）「ユーザーが「判断材料が足りない」でキャンセルする」「選択肢の前提が伝わらず誤答される」「option `description` に収まらない長文説明が必要になる」
- 重複候補: HC234（設問の直前に比較表を置く）と同趣旨

### AQ19

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:46
- 原文: 対処: AskUserQuestion を呼ぶ前の本文で、判断に関連する上流決定を表・箇条書きで整理し、その上で option を提示する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 上流決定の具体例（48-54 行）「分類決定 (何が A カテゴリで何が B カテゴリか)」「構造決定 (何層構造でどこに何を置くか)」「原則 (何を優先軸にするか)」「依存関係 (どの層が他を import 可・不可か)」「過去 phase の確定事項 (新 phase の入力になるもの)」
- 重複候補: AQ18 の実装。AQ27 と同趣旨

### AQ20

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:56
- 原文: 特に「phase 転換直後の命名 / 配置判断」「大規模 refactor の個別選択」など、直前の議論や別 phase で決まった前提に依存する質問は、その前提を明示しないと選択肢の意味が理解できない。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: AQ18 の適用場面。FN4（設問の自立性）と同趣旨

### AQ21

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:60-62
- 原文: 承認は「目的」ではなく「具体的な手段・構成」に対して与えられる。実行中にブロッカーへ当たって手段を変える必要が生じたら、その時点で承認は失効している。代替手段がどれほど妥当に見えても、実装・状態変更に進む前に確認へ戻る。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: why（69-71 行）「合意済みの構成が環境制約で不可能と判明した際、代替構成を無断で構築し永続設定まで書き込んで指摘を受けた実例 (2026-07)。「目的への前進は承認済み」という認識で、手段レベルの承認を取り直さなかったのが原因」
- 重複候補: user global rule「設計判断を含む作業は提案と実装を分ける」と同趣旨

### AQ22

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:63-64
- 原文: 「検証のため」「一時的」でも同じ。プロセス起動・デーモン設定・設定ファイル書き込みなど、会話の外に残る状態を作る操作は実装に含める
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: AQ21 の適用範囲

### AQ23

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:65
- 原文: 読み取りだけの調査・比較検討は対象外。ブロッカーの分析と代替案の整理までは進めてよい
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: AQ21 の例外

### AQ24

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:66
- 原文: 確認時には「何が計画と変わるか」「増える管理物・残る状態」を明記する
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: FN14（管理物の増加への警戒）、FN33（変更として明示）と同趣旨

### AQ25

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:75
- 原文: ユーザーが判断するための材料 (現状、選択肢のトレードオフ、推奨案とその理由、影響範囲、関連ファイルパスや行番号) はできるだけ多く伝える。配置場所は以下の使い分け:
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: HC234 と同趣旨。HC150 / HC161（冗長にしない・本文を絞る）と緊張関係

### AQ26

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:77
- 原文: **AskUserQuestion 内 (`question` 文と option `description`)** にも、収まる範囲で十分な情報を入れる。ここを薄くしない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ46（question 文と option description を自立させる）と同趣旨

### AQ27

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:78
- 原文: **AskUserQuestion を呼ぶ前のテキスト出力** にも背景・比較・現状調査結果を出す。ここも省略しない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ19 と同趣旨

### AQ28

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:79
- 原文: 両方やる。どちらか一方だけにしない
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ26 / AQ27 の統合規定

### AQ29

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:81
- 原文: ただし AskUserQuestion の各 option `description` には文字数の制約 (おそらく数行程度) がある。詳細を入れたいのに入り切らない場合は、**削るのではなく、AskUserQuestion を呼ぶ前のテキスト出力に追加で書き出す**。「入らないから事前に出す」のであって「事前に出すから option は削る」ではない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: JR「短くする目的で重要な情報を落とさない」と同趣旨

### AQ30

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:85-90
- 原文: AskUserQuestion を発行する前に、各選択肢について以下を本文で明示する。option `description` の中だけで完結させようとしない。（何をするか (具体的な作業内容、対象ファイル名、関数名、概算行数) / トレードオフ (利点・欠点・規模・リスク) / 推奨案とその根拠 (調査結果に基づくエビデンス、rule 名や公式 docs) / 影響範囲 (どのファイル / どの規約に関係するか)）
- 分類: 確認・質問の作り方
- 性質: 判断保留
- 補足: 4 項目の中身（何をするか・トレードオフ・根拠・影響範囲）は選択肢提示一般に効くが、本文と option description の二層構造は AskUserQuestion 固有
- 重複候補: HC234 / HC194 と同趣旨

### AQ31

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:92
- 原文: option `description` は本文の要約として書く。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: HC236（description は比較表の結論の要約に徹する）とほぼ同文

### AQ32

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:92
- 原文: 本文で詳細を出してから AskUserQuestion を呼ぶ。「事前テキスト → AskUserQuestion」の順序を守る。
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: why（95 行）「option description には文字数制約があり、複雑な設計判断の詳細は収まらない。詳細を見せずに判断を求めると「情報不足で判断できない → キャンセル → 詳細要求」の往復が発生し、ユーザーの時間を浪費する」
- 重複候補: AQ19 / AQ27 と同趣旨

### AQ33

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:93
- 原文: ただしレンダリングバグ（後述「AskUserQuestion を単独ターンで発行する」）が存続する間は、この順序を同一ターン内ではなくターン分割で実現する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ37〜AQ39 と重複

### AQ34

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:99
- 原文: **質問間に作業を挟まない**: 複数回に分けて質問する場合、前の回の回答が返ってきたらすぐに次の回の質問を発行する。質問間に調査・作業・反映を行わない。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ13 / AQ43 と重複

### AQ35

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:99
- 原文: すべての質問回答が終わってから次の作業に進む
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ34 と同趣旨

### AQ36

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:100-104
- 原文: **全質問完了後は自由入力で確認する**: すべての回答が揃ったら、勝手に作業を始めず以下の手順を踏む: 1. 回答の解釈をまとめる（各質問の回答要約） 2. 次の作業の簡単なプランを説明する 3. AskUserQuestion を使わずに「他に気になることや変更点はありますか？」と自由入力での返答を促す 4. ユーザーが「特になし」等の回答であればそのまま作業に進む。追加の指示があれば反映する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 4 工程は手順だが、「勝手に作業を始めず」「AskUserQuestion を使わずに自由入力を促す」が埋め込まれた規範なので工程ごと畳んで 1 件にした
- 重複候補: HC266 が参照先として同じフローを指す

### AQ37

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:114
- 原文: このバグが直るまで、同一ターンでの「事前テキスト → AskUserQuestion」は機能しない。以下のフローで回避する:
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: バグの一次情報（108-112 行）「Claude Code に「同一ターン内でツール呼び出しに挟まれた assistant テキストが TUI に表示されない」バグが open で存在する（2026-07 時点、v2.1.170 頃から報告）」「該当 issue: [#75182](https://github.com/anthropics/claude-code/issues/75182)、[#75034](https://github.com/anthropics/claude-code/issues/75034)、[#67071](https://github.com/anthropics/claude-code/issues/67071)」
- 重複候補: AQ33 と重複

### AQ38

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:116
- 原文: 判断材料の本文（上流決定・各選択肢の詳細・推奨案）は、AskUserQuestion を発行しないターンの最終テキストとして出力する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ32 のバグ回避版

### AQ39

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:117
- 原文: ターンの末尾は「読み終えたら何でもよいので返信してください。次のターンで質問 UI を出します」で締める
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### AQ40

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:118
- 原文: ユーザーの返信を受けたターンでは、AskUserQuestion をターン最初のアクションとして単独発行する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ42 と重複

### AQ41

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:119
- 原文: AskUserQuestion より前にツール呼び出しもテキスト出力も置かない
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ40 の裏返し

### AQ42

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:120
- 原文: 複数回に分けて質問する場合も、各回とも 2 と同様に単独発行する。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ40 の適用拡張

### AQ43

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:120
- 原文: 「質問間に作業を挟まない」ルールはこのフローでも維持する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: AQ17 と重複

### AQ44

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:121
- 原文: 回答を受け取った後の作業（ファイル編集・調査・報告）は同一ターンで続けてよい。ターン末尾の最終テキストは正常に表示される
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ41 の例外

### AQ45

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:122
- 原文: 事前本文が不要な軽い質問は、テキストを添えずに AskUserQuestion を単独発行してよい。
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 重複候補: AQ16 と同趣旨

### AQ46

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:123
- 原文: いずれの場合も、本文が読めなくても回答できるよう `question` 文と option `description` を自立させる（バグで本文が消えるケースへの保険）
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: FN4（設問の自立性）、AQ26 と同趣旨

### AQ47

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:128-129
- 原文: このセクションはレンダリングバグ修正後の運用。バグ存続中は前セクションのターン分割フローが優先で、AskUserQuestion と同一ターンに本文を置かないため、末尾マーカーとバッファの出番はない。
- 分類: その他
- 性質: 媒体固有
- 補足: AQ48〜AQ50 の適用条件を定める条項
- 重複候補: AQ5 と対応

### AQ48

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:133
- 原文: **AskUserQuestion の直前に重要な情報（図表・ツリー・コードブロック等）を配置しない**。重要な情報は AskUserQuestion より十分前に出力を完了させる
- 分類: 構成・順序
- 性質: 媒体固有
- 補足: 前提（131 行）「AskUserQuestion の選択 UI が表示されると、直前の出力テキストの最後の数行が隠れる（実測: 約1行）」
- 重複候補: なし

### AQ49

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:134-141
- 原文: **バッファ行を入れる直前に、末尾マーカーを出力する**。以下のフォーマットを使う:（`---` / `*--- 出力ここまで / 以下 AskUserQuestion UI に隠れないように調整バッファ ---*`）これにより、ユーザーがスクロールした際に本文の末尾とバッファの境界を判別できる
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: AQ50 と対

### AQ50

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:142-146
- 原文: **バッファは以下の1行のみ**。隠れるのは最後の1行だけなので、末尾マーカーの後に以下を1行出力すれば十分（`*------------------------------------------------------------------------------*`）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: AQ49 と対

### AQ51

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:150
- 原文: ユーザーが AskUserQuestion をキャンセルし、プロンプトで補足情報を返してきた場合、以下の手順で対応すること:
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### AQ52

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:152
- 原文: **回答カバレッジの判定**: キャンセルされた AskUserQuestion の各 question に対して、ユーザーの補足が回答を含んでいるか判定する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### AQ53

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:153
- 原文: **話題の逸脱判定**: ユーザーの補足が元の質問とは別の話題（修正依頼、方針変更、新しい指示など）を含んでいるか判定する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### AQ54

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:154-161
- 原文: **判断の明示**: 以下のフォーマットで判断を出力し、ユーザーが確認できるようにする:（`## AskUserQuestion 補足の解釈` / `- Q1「{質問内容}」→ {回答あり: 要約 / 回答なし}` / `- Q2「{質問内容}」→ {回答あり: 要約 / 回答なし}` / `- 別の話題: {あり: 要約 / なし}`）
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: AQ36 の解釈まとめと同型

### AQ55

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:163
- 原文: **未回答の質問がある場合**: 別の話題の対応を優先しつつ、未回答の質問が作業に必要なら改めて確認する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### AQ56

- 位置: plugins/claude-user-communication/skills/ask-with-choices/SKILL.md:163
- 原文: （ただし既に回答済みの質問は再度聞かない）
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: FN7（確定事項を無断で再質問しない）と同趣旨

## 検算

| 略号 | ファイル | 抽出件数 | 総行数 | 見出し数 (h2〜h4) | 箇条書き数 (行頭が - または \* の行) |
| --- | --- | --- | --- | --- | --- |
| HC | plugins/claude-user-communication/skills/html-communication/SKILL.md | 266 | 511 | 15 | 160 |
| FN | plugins/claude-user-communication/skills/html-communication/references/review-norms.md | 44 | 60 | 1 | 22 |
| AQ | plugins/claude-user-communication/skills/ask-with-choices/SKILL.md | 56 | 163 | 9 | 37 |
| 計 | — | 366 | 734 | 25 | 219 |

旧抽出（2026-07-30、HC 54 / FN 27 / AQ 17）との差は HC +212 / FN +17 / AQ +39。

差の見立て。HC は当時から skill が 0.22.0 まで版を重ね、3 pane・図の CSS スコープ・パターン集・
機械検査・page-reviewer 統合・PWA アセットといった節が丸ごと追加されている。加えて 1 箇条書きの中に
独立した規定が 2〜4 個入っている行（表の `min-width` / `role` / `caption` の 3 指定、`.proscons` の
3 条件、脚注リンクの本文側・脚注側・複数参照など）を項目単位で分割したため、箇条書き数 160 の
1.66 倍の件数になった。FN の +17 は蓄積観点の追記が続いた分と、「A する。B しない」形の 1 行を
2 件に割った分。AQ はファイル自体の伸びが小さく、増分の大半はレンダリングバグ回避フロー
（ターン分割 5 工程、末尾マーカーとバッファ）と、1 行に 2 規定を含む箇条書きの分割による。
