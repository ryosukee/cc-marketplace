# 条項抽出: SS（session）

対象は `plugins/session/` 配下 8 本（合計 769 行）。処遇の判定は含まない。
抽出単位は「1 つの指示・規範」。手順書の工程（ステップの実行順、skill 間の呼び出し順）は含まず、
工程に埋め込まれた規範（成果物・振る舞いの規定）は含む。

## plugins/session/skills/start/SKILL.md

### SS1

- 位置: plugins/session/skills/start/SKILL.md:18
- 原文: 特定された `.handover/` の絶対パスを以降のステップすべてで使う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: debrief SKILL.md:73、handover SKILL.md:18、handover-init.md:14 に同文・同趣旨

### SS2

- 位置: plugins/session/skills/start/SKILL.md:24
- 原文: `.handover/todo/` 内の全ファイルを Read する (ステップ 1 で特定したパス基準)。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 「全ファイル」を対象とする全件性の規定。工程との切り分けに迷った
- 重複候補: なし

### SS3

- 位置: plugins/session/skills/start/SKILL.md:30-34
- 原文: 読み込んだ全 handover を統合して、次の 3 点だけを提示する。1. 何をしている途中か (1〜2 文) 2. どこまで終わったか (成果物の識別子。PR 番号・コミット ID) 3. 続きの起点 (最初に読むファイル、最初に実行すること)
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 提示する項目を 3 点に限定する上限規定。ただし 2 は「成果物の識別子」を要求しており、識別子については省略禁止の方向
- 重複候補: handover-template.md:32 の「成果物を識別子で書く」と同趣旨（識別子の明示）

### SS4

- 位置: plugins/session/skills/start/SKILL.md:36
- 原文: これに復元タスクの一覧を添える。登録の可否を判断する対象なので一覧で出す。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why = 登録の可否を判断する対象だから
- 重複候補: なし

### SS5

- 位置: plugins/session/skills/start/SKILL.md:38
- 原文: handover の節を順に要約しない。
- 分類: 構成・順序
- 性質: 汎用
- 重複候補: retrospective SKILL.md:23「時系列ではなくテーマごとに整理する」と近い（元資料の並び順をなぞらない）

### SS6

- 位置: plugins/session/skills/start/SKILL.md:38-39
- 原文: 上の 3 点と復元タスク以外は提示しない。詳細が要るときはユーザーが handover を読む。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why = 詳細が要るときはユーザーが handover を読むから
- 重複候補: retrospective SKILL.md:92「項目名と優先度だけを箇条書きで出す。ほかは何も書かない」と同趣旨

### SS7

- 位置: plugins/session/skills/start/SKILL.md:41-42
- 原文: 提示後、読み込んだ todo/ の handover ファイルを archive/ へ移動する（確認不要。archive は全件保持の移動であり、見返す必要が出たら archive/ を読めばよい）。
- 分類: その他
- 性質: 媒体固有
- 補足: 例外的にユーザー確認を不要とする指定。why = archive は全件保持の移動だから
- 重複候補: handover-init.md:31「archive/: 消化済みの引き継ぎ資料 (全件保持)」

### SS8

- 位置: plugins/session/skills/start/SKILL.md:43-44
- 原文: 読むだけの参照台帳など handover でないファイルが todo/ にある場合は移動せず、本来の置き場への移設をユーザーに提案する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: handover-init.md:33「引き継ぎ資料以外を置かない」と同趣旨

### SS9

- 位置: plugins/session/skills/start/SKILL.md:46-49
- 原文: そのうえでユーザーに判断を委ねる: - タスクの復元: 復元タスクとして記載されたタスクを復元するか - 方向: 前回の続きをするか、別のことをするか
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### SS10

- 位置: plugins/session/skills/start/SKILL.md:51
- 原文: ユーザーの指示に従って、承認されたタスクを TaskCreate で登録する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 承認されたものだけを登録する（無断登録の禁止）
- 重複候補: retrospective SKILL.md:186「勝手に書き換えない。ユーザー承認を必ず経る」

### SS11

- 位置: plugins/session/skills/start/SKILL.md:53-54
- 原文: 実行した処理は必ず報告する。archive へ移動したファイル名と、登録したタスクの一覧を、ステップ 5 までの報告に含める。黙って移動・登録しない。
- 分類: その他
- 性質: 汎用
- 補足: 報告から落としてはいけない項目を列挙する省略禁止の方向
- 重複候補: end SKILL.md:39-45 の完了報告項目と趣旨が近い

### SS12

- 位置: plugins/session/skills/start/SKILL.md:56-58
- 原文: TaskCreate 系ツールが提供されていない環境では、登録の代わりに draft にタスクボード節を作り、進行管理の正とする（この制約の追跡は claude-known-issues plugin の台帳エントリ `task-tools-unavailable` が管理する）。
- 分類: その他
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:102、handover SKILL.md:43 に同趣旨のツール不提供時の代替

### SS13

- 位置: plugins/session/skills/start/SKILL.md:64
- 原文: ファイル名: セッション内容を表す slug を仮で付ける (例: `continue-auth-refactor.md`)
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: handover SKILL.md:67-68 の slug 確定、debrief SKILL.md:76 の slug 決定

### SS14

- 位置: plugins/session/skills/start/SKILL.md:65
- 原文: 内容: handover テンプレートの骨格 (セクション見出しのみ)
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover SKILL.md:25「handover-template.md をもとに新規作成する」

### SS15

- 位置: plugins/session/skills/start/SKILL.md:66
- 原文: ステップ 3 で読み込んだ情報があれば「背景」「ゴール・原則」に転記する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: debrief SKILL.md:78-84 の「書き込むセクション」対応表

### SS16

- 位置: plugins/session/skills/start/SKILL.md:71-72
- 原文: 既存 draft の内容をユーザーに提示する / 再利用するか新規作成するか確認する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 前回 end せず終了した場合の分岐に付随する確認義務
- 重複候補: なし

### SS17

- 位置: plugins/session/skills/start/SKILL.md:76-78
- 原文: 復元タスクの筆頭を起点として、次に着手するものを 1 つ提案する。候補を並べない。復元タスクは既にステップ 3 で一覧にしてあり、そこから選ぶのはユーザーの判断になる。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: why = 復元タスクは既に一覧化済みで、選択はユーザーの判断だから
- 重複候補: retrospective SKILL.md:109「1 メッセージにつき 1 項目」と同方向（1 件に絞る）

### SS18

- 位置: plugins/session/skills/start/SKILL.md:80
- 原文: AskUserQuestion は使わず、テキスト出力のみ。ユーザーが自由に返答できるようにする。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 不使用指定。why = ユーザーが自由に返答できるようにするため
- 重複候補: retrospective SKILL.md:107「AskUserQuestion ではなく自由対話形式」

## plugins/session/skills/debrief/SKILL.md

### SS19

- 位置: plugins/session/skills/debrief/SKILL.md:25
- 原文: セッション中に触れた他リポジトリがある場合、そのリポジトリでも `git status -s` を実行する。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 対象範囲を自リポジトリに限定しない全件性の規定。省略禁止の方向。工程との切り分けに迷った
- 重複候補: handover-template.md:36「セッション中に触れた他リポジトリも含む」

### SS20

- 位置: plugins/session/skills/debrief/SKILL.md:27
- 原文: 異常な状態 (main 上の未コミット、宙に浮いた worktree、stash 残留等) があれば警告として記録する。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover-template.md:40「異常な状態があれば警告として明記」

### SS21

- 位置: plugins/session/skills/debrief/SKILL.md:31-35
- 原文: 会話コンテキストからこのセッションで完了した作業を抽出する: - 成果物 (PR 番号、コミット ID、変更ファイル等) - 設計判断、方針決定 - 外部サービスへの変更 (デプロイ、設定変更等)
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 拾う対象を 3 種に列挙する。識別子（PR 番号・コミット ID）で書く方向
- 重複候補: handover-template.md:32「成果物を識別子で書く」

### SS22

- 位置: plugins/session/skills/debrief/SKILL.md:40
- 原文: タスク管理の種類はハードコードしない。
- 分類: その他
- 性質: 媒体固有
- 重複候補: なし

### SS23

- 位置: plugins/session/skills/debrief/SKILL.md:40-41
- 原文: プロジェクトの CLAUDE.md、README、設定ファイル等からタスク管理方法を推定し、それぞれについて棚卸しする。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 例として JIRA / GitHub Issues / Linear / プロジェクト内の TODO ファイル（43-48 行）。タスク管理が特定できない場合はこのステップをスキップする（50 行）。「それぞれについて」は全件性の規定。工程との切り分けに迷った
- 重複候補: handover-template.md:38「プロジェクトのタスク管理の棚卸し結果」

### SS24

- 位置: plugins/session/skills/debrief/SKILL.md:54
- 原文: TaskList を確認し、未完了 (in_progress, pending) のタスクを一覧化する。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 未完了の定義を status で与える。工程との切り分けに迷った
- 重複候補: handover SKILL.md:39「draft に記載された未完了の事項 + TaskList を 2 つに分ける」

### SS25

- 位置: plugins/session/skills/debrief/SKILL.md:56-61
- 原文: 会話コンテキストから、タスク化されていないが未完了の作業も洗い出す: - やろうとしていたが着手しなかったこと - ユーザーから要求があったが完了しなかったこと - 議論の中で出たが実行されなかった改善案 - 途中で方針変更して取りやめたもの
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: タスク管理ツールに載っていないものも落とさない省略禁止の方向
- 重複候補: handover SKILL.md:41-42「粒度・優先度を問わず全件を書く」

### SS26

- 位置: plugins/session/skills/debrief/SKILL.md:63-64
- 原文: **やらないと決めたものは未完了に含めない。** retrospective で却下した codify 候補、ユーザーが不要と判断した提案、対象外と決めた範囲は、未完了ではなく決着済み。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 判定基準（67-68 行）= ユーザーが「やらない」と言ったか、「今回はやらない」と言ったか。前者は決着済みで、後者だけが未完了
- 重複候補: retrospective SKILL.md:171-172、181-182 に同じ判定基準

### SS27

- 位置: plugins/session/skills/debrief/SKILL.md:65
- 原文: 記録が要るなら handover の「却下と決めたこと」節へ回す。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:176 に同文

### SS28

- 位置: plugins/session/skills/debrief/SKILL.md:73
- 原文: 特定された `.handover/` の絶対パスを以降のステップすべてで使う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: start SKILL.md:18、handover SKILL.md:18、handover-init.md:14 に同文・同趣旨

### SS29

- 位置: plugins/session/skills/debrief/SKILL.md:76
- 原文: draft が存在しない場合は新規作成する (slug はセッション内容から決定)。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: start SKILL.md:64、handover SKILL.md:67-68 の slug 規定

### SS30

- 位置: plugins/session/skills/debrief/SKILL.md:80
- 原文: 「現在地と再開手順」: 会話コンテキストから「何をしている途中か」を抽出して記述
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover-template.md:24-28 の同節の記載指示

### SS31

- 位置: plugins/session/skills/debrief/SKILL.md:81
- 原文: 「完了したこと」: ステップ 2 の完了事項と、ステップ 1 の `git log` から本セッション分のコミット ID
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: コミット ID を落とさない（識別子の省略禁止の方向）
- 重複候補: handover-template.md:32、handover SKILL.md:136

### SS32

- 位置: plugins/session/skills/debrief/SKILL.md:82
- 原文: 「現在の作業状態」: ステップ 1 の物理状態と警告、ステップ 3 の棚卸し結果
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover-template.md:36-40

### SS33

- 位置: plugins/session/skills/debrief/SKILL.md:83
- 原文: 「参照すべき資料」: セッション中に参照・作成したドキュメント、設計書、外部 URL 等を収集して記載
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover-template.md:42-46

### SS34

- 位置: plugins/session/skills/debrief/SKILL.md:84
- 原文: 「復元タスク」: ステップ 4 の未完了。やらないと決めたものとの切り分けは handover が行う
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 責務境界（切り分けの担当は handover）を含む
- 重複候補: handover SKILL.md:37-49 のタスク分類

### SS35

- 位置: plugins/session/skills/debrief/SKILL.md:88
- 原文: 棚卸し結果のサマリをユーザーに提示する。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: end SKILL.md:40「全体のサマリに絞る」

### SS36

- 位置: plugins/session/skills/debrief/SKILL.md:89
- 原文: 警告がある場合は対応要否を確認する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: end SKILL.md:22「警告への対応が必要な場合はここで解決する」

## plugins/session/skills/retrospective/SKILL.md

### SS37

- 位置: plugins/session/skills/retrospective/SKILL.md:12-13
- 原文: セッションで得た学びを rules/skills/agents/CLAUDE.md に codify する。学びの抽出・明文化のみを担う。
- 分類: その他
- 性質: 媒体固有
- 補足: skill の責務を抽出・明文化に限定する境界規定
- 重複候補: handover-reviewer.md:84-97「扱わないこと」と同型の責務境界

### SS38

- 位置: plugins/session/skills/retrospective/SKILL.md:23
- 原文: 時系列ではなくテーマごとに整理する。
- 分類: 構成・順序
- 性質: 汎用
- 補足: 洗い出しの観点は「何が繰り返し起きたか」「何が実害になったか (バグ、差し戻し、やり直し、事故)」「どんな判断ルールが発生したか」「どんなワークフローが機能した / しなかったか」（25-28 行）
- 重複候補: start SKILL.md:38「handover の節を順に要約しない」と同方向

### SS39

- 位置: plugins/session/skills/retrospective/SKILL.md:32-37
- 原文: `.claude/rules/`, `.claude/skills/`, `.claude/agents/`, `CLAUDE.md`, `README.md` をざっと確認し: - セッション中に使った rules/skills が実態と乖離していないか - ユーザーの指摘・訂正のうちルール化されていないものはないか - 使われていないセクション・機能はないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 工程との切り分けに迷った
- 重複候補: なし

### SS40

- 位置: plugins/session/skills/retrospective/SKILL.md:41
- 原文: このセッションで実際に発動・参照した skill/rule を対象に検証する。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 検証観点は skill の手順（記述通りに動いたか、実運用と乖離したステップはないか）、skill の trigger (description)、rule の制約、agent の定義（43-46 行）
- 重複候補: なし

### SS41

- 位置: plugins/session/skills/retrospective/SKILL.md:50-51
- 原文: セッション中に行った変更が、反映すべき関連箇所に行き渡っているかを確認する。反映先はプロジェクトによって異なる。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 反映漏れを落とさない省略禁止の方向
- 重複候補: 同ファイル 188 行「承認された項目は関連する変更を漏れなく反映する」

### SS42

- 位置: plugins/session/skills/retrospective/SKILL.md:55
- 原文: memory に蓄積された知見のうち、rule や skill に昇格すべきものがないかチェックする。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS43

- 位置: plugins/session/skills/retrospective/SKILL.md:59-64
- 原文: | 優先度 | 基準 | 対応 | / | A | 実害があった + 将来再現する | 強く推奨 | / | B | 再利用価値が高い | 推奨 | / | C | あると便利、実害は小 | 任意 | / | D | 無関係 / 一度きり | 不要 |
- 分類: 取捨選択
- 性質: 汎用
- 補足: codify 候補の優先度分類基準。表 1 つを 1 件として数えた
- 重複候補: なし

### SS44

- 位置: plugins/session/skills/retrospective/SKILL.md:68
- 原文: パターンとして再現するかで判断する (発生回数ではない)
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SS45

- 位置: plugins/session/skills/retrospective/SKILL.md:69
- 原文: 1 回でもパターン化できるものは対象
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: なし

### SS46

- 位置: plugins/session/skills/retrospective/SKILL.md:70
- 原文: 実害があったものは 1 回でも対象
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: 同ファイル 59-64 行の優先度 A の基準

### SS47

- 位置: plugins/session/skills/retrospective/SKILL.md:74-76
- 原文: 明文化しない基準 - 偶然性が高い - 自明すぎるもの - このセッションだけの特殊状況
- 分類: 取捨選択
- 性質: 汎用
- 補足: 3 項目は名詞句の列挙で、単独では指示文にならないため 1 件にまとめた
- 重複候補: 同ファイル 187 行「過剰に抽出しない」

### SS48

- 位置: plugins/session/skills/retrospective/SKILL.md:80-86
- 原文: | 知見の性質 | 昇格先 | / | `paths:` で対象を絞れる制約 | `.claude/rules/{topic}.md` | / | 特定タスクでのみ参照される知識 | `.claude/skills/ref-{topic}/` | / | 繰り返し実行した対話的な手順 | `.claude/skills/op-{name}/` | / | agent の振る舞い改善 | `.claude/agents/{name}.md` | / | プロジェクト概要・ドメイン知識 | `CLAUDE.md` |
- 分類: その他
- 性質: 媒体固有
- 補足: 知見の性質から配置先を決める対応表。表 1 つを 1 件として数えた
- 重複候補: handover SKILL.md:49-53「どちらにも入らない事項」の行き先対応と同型

### SS49

- 位置: plugins/session/skills/retrospective/SKILL.md:88
- 原文: 既存ファイルに追記で済むなら追記。新規ファイル乱立を避ける。
- 分類: その他
- 性質: 汎用
- 重複候補: なし

### SS50

- 位置: plugins/session/skills/retrospective/SKILL.md:92
- 原文: **項目名と優先度だけ**を箇条書きで出す。ほかは何も書かない。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: start SKILL.md:38-39「上の 3 点と復元タスク以外は提示しない」

### SS51

- 位置: plugins/session/skills/retrospective/SKILL.md:94
- 原文: 何が起きたか、なぜ失敗したか、ルールの文面は書かない。すべてステップ 6 の管轄
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: 同ファイル 162 行（判断材料をルール本文に含めない）と方向が近い

### SS52

- 位置: plugins/session/skills/retrospective/SKILL.md:95-96
- 原文: レポートを書かない。「レポート」を埋めようとすると、定義済みの唯一の構造であるステップ 6 の提示フォーマットを流し込むことになり、全件の詳細が 1 メッセージに並ぶ
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: why = 全件の詳細が 1 メッセージに並ぶため
- 重複候補: 同ファイル 109 行「1 メッセージにつき 1 項目」

### SS53

- 位置: plugins/session/skills/retrospective/SKILL.md:97
- 原文: ユーザーが着手の可否と順序を決められる粒度で止める
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: start SKILL.md:36「登録の可否を判断する対象なので一覧で出す」

### SS54

- 位置: plugins/session/skills/retrospective/SKILL.md:102
- 原文: TaskCreate が使えない環境では、一覧をそのまま進行リストとして扱い、順に処理する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: start SKILL.md:56-58、handover SKILL.md:43 のツール不提供時の代替

### SS55

- 位置: plugins/session/skills/retrospective/SKILL.md:107
- 原文: AskUserQuestion ではなく自由対話形式。
- 分類: 確認・質問の作り方
- 性質: 汎用
- 補足: AskUserQuestion 不使用指定
- 重複候補: start SKILL.md:80「AskUserQuestion は使わず、テキスト出力のみ」

### SS56

- 位置: plugins/session/skills/retrospective/SKILL.md:109
- 原文: **1 メッセージにつき 1 項目。** 複数項目の詳細を同じメッセージにまとめない。
- 分類: 形式・媒体判定
- 性質: 汎用
- 補足: 判定基準（112-113 行）= いま書こうとしているメッセージに、下記の提示フォーマットの構造が 2 つ以上あるか。あるなら分割する。why（115-116 行）= 複数の判断を 1 メッセージに並べると、ユーザーは全部を読んでから答えることになる。1 件ずつなら、その 1 件だけを読んで答えられる
- 重複候補: start SKILL.md:76-78「候補を並べない」

### SS57

- 位置: plugins/session/skills/retrospective/SKILL.md:110
- 原文: 各項目の対話開始時に `[x/n] {項目名}` 形式で進捗を示す。
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: なし

### SS58

- 位置: plugins/session/skills/retrospective/SKILL.md:120-121
- 原文: ルールや skill の文面をユーザーに提示する前に、以下の検証を自分で行う。検証に通らなければ文面を修正してから提示する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: handover SKILL.md:90-92（提示前の agent レビュー）と同方向

### SS59

- 位置: plugins/session/skills/retrospective/SKILL.md:122
- 原文: 2 回修正しても通らなければその旨をユーザーに伝えて対話に入る。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 反復の打ち切り条件
- 重複候補: handover SKILL.md:107-110 の反復の終了条件

### SS60

- 位置: plugins/session/skills/retrospective/SKILL.md:126-130
- 原文: インシデントから 3 段階以上遡る: - 何をしたか (行動) - なぜそうしたか (判断) - なぜそう判断したか (前提・思考パターン)
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS61

- 位置: plugins/session/skills/retrospective/SKILL.md:132-133
- 原文: 表面の行動ではなくルール化すべきは最深層の判断構造。「X をした → X するな」のような行動のそのままのルール化は、形が変わると適用できない。
- 分類: その他
- 性質: 汎用
- 補足: why = 形が変わると適用できないため
- 重複候補: 同ファイル 144 行（狭すぎるルールの検出）

### SS62

- 位置: plugins/session/skills/retrospective/SKILL.md:137-140
- 原文: ルールを書いたら、元のインシデントの場面を具体的に再現する: - 「自分がまさにあの行動をしようとしている瞬間に、このルールを読んだら止まるか？」 - 止まらないなら、なぜ止まらないかを分析してルールを修正する
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS63

- 位置: plugins/session/skills/retrospective/SKILL.md:144
- 原文: 狭すぎないか: このインシデントの具体形にしか適用できないルールになっていないか。インシデント固有の名前 (ファイル名、ツール名、シナリオ名) がルール本文に残っていたら狭い
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 判定基準 = インシデント固有の名前がルール本文に残っているか
- 重複候補: 同ファイル 150-151 行（冷読テスト）

### SS64

- 位置: plugins/session/skills/retrospective/SKILL.md:145
- 原文: 広すぎないか: 何にでも当てはまって判断基準にならないルールになっていないか。誰でも同意するが行動を変える基準にならないなら広い
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 判定基準 = 誰でも同意するが行動を変える基準にならないか
- 重複候補: なし

### SS65

- 位置: plugins/session/skills/retrospective/SKILL.md:146
- 原文: 直前のインシデントに引っ張られていないか: 補足説明がインシデントの再説明になっていないか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: 同ファイル 162 行（判断材料をルール本文に含めない）

### SS66

- 位置: plugins/session/skills/retrospective/SKILL.md:150-151
- 原文: このセッションのコンテキストを知らない人がこのルールを読んで「何をすればいいか」がわかるか。インシデント固有の文脈に依存した表現になっていないか。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: 同ファイル 144 行（スコープチェックの狭すぎ判定）

### SS67

- 位置: plugins/session/skills/retrospective/SKILL.md:155-160
- 原文: 自己検証を通過したら、以下の構造でユーザーに提示する。 - 何が起きたか: セッション中の具体的な事実 (行動と結果) - 本来どうあるべきだったか: 理想の判断・行動 - なぜ失敗したか: 根本原因 (自己検証 a で掘り下げた判断構造) - 提案: 反映先ファイルパスと変更内容のドラフト
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「提案」に反映先ファイルパスを含めることを要求（識別子の省略禁止の方向）
- 重複候補: なし

### SS68

- 位置: plugins/session/skills/retrospective/SKILL.md:162
- 原文: 「何が起きたか」「本来どうあるべきだったか」「なぜ失敗したか」は提案の判断材料としてユーザーに見せるもので、ルール本文には含めない。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: 同ファイル 146 行（補足説明がインシデントの再説明になっていないか）

### SS69

- 位置: plugins/session/skills/retrospective/SKILL.md:166-167
- 原文: 全項目の対話・反映が完了したら、変更の確定方法をユーザーに確認する。コミット、PR 作成、保留など、プロジェクトのワークフローに合わせる。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: handover SKILL.md:137「commit しない。working tree に残す」と扱いが対照的

### SS70

- 位置: plugins/session/skills/retrospective/SKILL.md:171-172
- 原文: codify 候補をスキップする、対応不要とする、という判断は「やらないと決めた」という意味で、先送りではない。以後の棚卸しで未完了として拾わず、次セッションの作業候補にもしない。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 判定基準（181-182 行）= ユーザーが「やらない」と言ったか、「今回はやらない」と言ったか。前者は却下で、次セッションの候補に出さない。後者だけが先送りで、復元タスクに載る
- 重複候補: debrief SKILL.md:63-68 に同じ判定基準

### SS71

- 位置: plugins/session/skills/retrospective/SKILL.md:174-175
- 原文: 却下した項目を draft の未完了として書かない。書くと debrief と handover が復元タスクへ引き継ぎ、次セッションが作業候補として提示する
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 実例（178-179 行）= 前回 skip した codify 2 件が未完了として handover に載り、次セッションの開始時に作業候補として提示して差し戻された
- 重複候補: handover SKILL.md:45「復元タスクには入れない」

### SS72

- 位置: plugins/session/skills/retrospective/SKILL.md:176-177
- 原文: 記録が要るなら handover の「却下と決めたこと」節へ回す。同じ候補を毎回蒸し返さないための記録で、やることの一覧ではない
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: debrief SKILL.md:65 に同文、handover-template.md:59-60 に同趣旨

### SS73

- 位置: plugins/session/skills/retrospective/SKILL.md:186
- 原文: 勝手に書き換えない。ユーザー承認を必ず経る
- 分類: 確認・質問の作り方
- 性質: 汎用
- 重複候補: start SKILL.md:51「承認されたタスクを TaskCreate で登録する」

### SS74

- 位置: plugins/session/skills/retrospective/SKILL.md:187
- 原文: 過剰に抽出しない。「とりあえず codify」はノイズ化の原因
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: 同ファイル 74-76 行（明文化しない基準）

### SS75

- 位置: plugins/session/skills/retrospective/SKILL.md:188
- 原文: 承認された項目は関連する変更を漏れなく反映する
- 分類: 取捨選択
- 性質: 汎用
- 補足: 省略禁止の方向（関連箇所を落とさない）
- 重複候補: 同ファイル 50-51 行（今回の作業の反映漏れ）

## plugins/session/skills/handover/SKILL.md

### SS76

- 位置: plugins/session/skills/handover/SKILL.md:18
- 原文: 特定された `.handover/` の絶対パスを以降のステップすべてで使う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: start SKILL.md:18、debrief SKILL.md:73、handover-init.md:14 に同文・同趣旨

### SS77

- 位置: plugins/session/skills/handover/SKILL.md:24-25
- 原文: セッションの会話コンテキストから引き継ぎに必要な情報を収集する / `${CLAUDE_SKILL_DIR}/references/handover-template.md` をもとに新規作成する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: draft が存在しない場合の規定
- 重複候補: start SKILL.md:65「内容: handover テンプレートの骨格」

### SS78

- 位置: plugins/session/skills/handover/SKILL.md:29-35
- 原文: draft の各セクションを確認し、不足があれば補完する。テンプレートの全セクションが埋まっている必要はないが、最低限以下が含まれていることを確認する: - 背景 (何をしていたか) - ゴール・原則 (ユーザーが明示した方針) - 現在地と再開手順 (どこまで進んだか、次セッションが最初にやること)
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 例外 = テンプレートの全セクションが埋まっている必要はない。必須 3 節は省略禁止の方向
- 重複候補: handover-reviewer.md:88「テンプレートの必須 9 節の過不足・重複」（機械検査の担当）

### SS79

- 位置: plugins/session/skills/handover/SKILL.md:41-42
- 原文: **復元タスク**: 次セッションでやる必要があるもの。粒度・優先度を問わず全件を `## 復元タスク` セクションに書く。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（粒度・優先度による間引きを禁じ、全件を要求する）
- 重複候補: handover-template.md:51「次セッションでやる必要があるものは、粒度を問わずすべてここに書く」

### SS80

- 位置: plugins/session/skills/handover/SKILL.md:42
- 原文: 「タスクとして追跡するほどではない」を理由に降格させない
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（間引きの言い訳を名指しで禁じる）
- 重複候補: debrief SKILL.md:56-61「タスク化されていないが未完了の作業も洗い出す」

### SS81

- 位置: plugins/session/skills/handover/SKILL.md:43
- 原文: （ツール不提供の環境では、次セッションが draft / handover のタスクボードで管理する前提で書く）
- 分類: その他
- 性質: 媒体固有
- 重複候補: start SKILL.md:56-58、retrospective SKILL.md:102 のツール不提供時の代替

### SS82

- 位置: plugins/session/skills/handover/SKILL.md:44-45
- 原文: **却下**: やらないと決めたもの。`## 却下と決めたこと` セクションに、決めた内容と決めた回だけを書く。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 書く内容を 2 要素に限定する上限規定
- 重複候補: handover-template.md:62「- {項目}: 却下 ({決めた回})」

### SS83

- 位置: plugins/session/skills/handover/SKILL.md:45
- 原文: 復元タスクには入れない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:174-175「却下した項目を draft の未完了として書かない」

### SS84

- 位置: plugins/session/skills/handover/SKILL.md:46-47
- 原文: 却下として残すのは次セッションが再提案しうるものだけで、検討そのものが無効になったものは書かない
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: handover-reviewer.md:65-66「検討そのものが無効になったもの（前提が消えたもの）が書かれていないか」

### SS85

- 位置: plugins/session/skills/handover/SKILL.md:49-53
- 原文: どちらにも入らない事項は handover に書かない。行き先はそれぞれ別にある。 - 作業の前提・制約: そのタスクの description か、該当の設計ドキュメント - 恒常的な運用の約束: 「ゴール・原則」 - セッション中に起きた事故・失敗: retrospective の codify。codify しないなら書かない
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 除外と同時に行き先の対応表を与える
- 重複候補: handover-template.md:3-4「どちらでもない事項は書かない」、retrospective SKILL.md:80-86 の昇格先表

### SS86

- 位置: plugins/session/skills/handover/SKILL.md:55
- 原文: 分類はユーザーに確認する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:186「ユーザー承認を必ず経る」

### SS87

- 位置: plugins/session/skills/handover/SKILL.md:57-58
- 原文: **確認が済んだら、完了済みのタスクを task list から削除する。** 残すのは次セッションへ引き継ぐ未完了のものだけにする。
- 分類: その他
- 性質: 媒体固有
- 補足: why（60-61 行）= 完了済みが残ると、システムリマインダーが毎ターン提示し続け、次セッションにも引き継がれる。完了の記録は handover の「完了したこと」が持つので、task list に残す必要が無い
- 重複候補: なし

### SS88

- 位置: plugins/session/skills/handover/SKILL.md:62
- 原文: 削除するのは status が completed のものだけ。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: なし

### SS89

- 位置: plugins/session/skills/handover/SKILL.md:62-63
- 原文: 却下したものは「却下と決めたこと」へ移してから削除する
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:176、debrief SKILL.md:65 の「却下と決めたこと」への回付

### SS90

- 位置: plugins/session/skills/handover/SKILL.md:67-68
- 原文: draft のファイル名 (slug) がセッション内容を適切に表しているか確認する。draft のファイル名 (slug) がセッション内容を適切に表していなければ変更する。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: start SKILL.md:64、debrief SKILL.md:76 の slug 規定

### SS91

- 位置: plugins/session/skills/handover/SKILL.md:76
- 原文: todo/ へ移した handover に対して検査スクリプトを実行する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 工程との切り分けに迷った（機械検査を必ず通すという規範として拾った）
- 重複候補: handover-reviewer.md:35「機械検査が未実行なら、その旨を報告して終わる」

### SS92

- 位置: plugins/session/skills/handover/SKILL.md:82
- 原文: 9 種を検査し、指摘を JSON で stdout に出す。`total` が 0 になるまで直して再実行する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: Exit コードの規定（83 行）= 0 = 指摘なし、1 = 指摘あり、2 = 前提条件エラー
- 重複候補: 同ファイル 107 行「指摘 0 件まで繰り返さない」（agent レビューでは逆の方針）

### SS93

- 位置: plugins/session/skills/handover/SKILL.md:84-86
- 原文: 出力の `git` は検査結果ではなく実測した git 状態。branch / HEAD / 未コミット件数 / stash 件数 / upstream との ahead-behind / worktree 数が入る。**これを「現在の作業状態」の記述と自分で突き合わせる。** 食い違っていたら handover を直す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover-reviewer.md:92「git の branch / HEAD / 未コミット / stash / upstream / worktree との突合」（agent は扱わない）

### SS94

- 位置: plugins/session/skills/handover/SKILL.md:87-88
- 原文: パスの指摘が、これから作る予定の置き場を指しているだけのこともある。その場合は「（新設予定）」と本文に明記して、実在しないことが意図だと分かるようにする
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### SS95

- 位置: plugins/session/skills/handover/SKILL.md:92
- 原文: 機械検査を通してから `handover-reviewer` agent を **1 本だけ** 起動する。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover-reviewer.md:17「handover を確定する前に 1 度だけ回す」

### SS96

- 位置: plugins/session/skills/handover/SKILL.md:94-98
- 原文: 呼び出すときに渡すもの。 - 対象 handover ファイルの絶対パス - 機械検査の JSON 出力 - そのセッションで触れた台帳・設計ドキュメントの所在
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover-reviewer.md:29-33 に同じ 3 点

### SS97

- 位置: plugins/session/skills/handover/SKILL.md:100-102
- 原文: agent が見るのは、節をまたいだ記述の矛盾、やることの集約、却下の妥当性、handover の外にあるファイルの内容についての主張の検算の 4 点だけ。識別子の実在と git の突合はステップ 6 が持つ。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 機械検査と agent の責務境界
- 重複候補: handover-reviewer.md:17、84-97 の責務境界

### SS98

- 位置: plugins/session/skills/handover/SKILL.md:107
- 原文: **指摘 0 件まで繰り返さない。**
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why（113-124 行）= 実測（2026-08-18〜19、R1〜R5 で打ち切り）で 5 ラウンド・指摘 6 件に subagent トークン 284.1k・ツール 107 回・1,738 秒を使って収束しなかった。R2 で一度 approve を取ったあと追記のたびに新しい指摘が出続けた。指摘 0 件だった R2 が指摘を出した R1 より多くのトークンを使っている（54.7k 対 47.7k）。指摘 6 件のうち次セッションの行動が変わるものは 2 件
- 重複候補: retrospective SKILL.md:122「2 回修正しても通らなければ〜対話に入る」

### SS99

- 位置: plugins/session/skills/handover/SKILL.md:109
- 原文: 次セッションの行動が変わる指摘が出たら、直して **もう 1 度だけ** 回す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover-reviewer.md:107-108（行動が変わるかの判定を各指摘に付ける）

### SS100

- 位置: plugins/session/skills/handover/SKILL.md:110
- 原文: 文言・構造の指摘は、そのラウンドで直して終わる。再ラウンドしない
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS101

- 位置: plugins/session/skills/handover/SKILL.md:111
- 原文: レビュー実行中は対象ファイルを編集しない。agent は起動時点の版を読む
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: why = agent は起動時点の版を読むため
- 重複候補: handover-reviewer.md:110「read-only。handover ファイルを編集しない」（主体は逆）

### SS102

- 位置: plugins/session/skills/handover/SKILL.md:128-131
- 原文: 以下をユーザーに伝える: - handover のファイルパス - 次セッション開始方法: `/session:start`
- 分類: その他
- 性質: 媒体固有
- 重複候補: end SKILL.md:42-45 の完了報告項目

### SS103

- 位置: plugins/session/skills/handover/SKILL.md:135
- 原文: ユーザーが明示した原則・方針・feedback は必ず保持する
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（要約・圧縮で落とすことを禁じる）
- 重複候補: handover-template.md:14「ユーザーが明示した方針・原則・フィードバック。採用しないと決めた選択肢を含む」

### SS104

- 位置: plugins/session/skills/handover/SKILL.md:136
- 原文: ファイル path / commit hash / ブランチ名などの具体識別子は省略しない
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（一般の執筆規範と逆向き。次セッションが識別子で再開するため）
- 重複候補: handover-template.md:32「成果物を識別子で書く」、start SKILL.md:33「成果物の識別子。PR 番号・コミット ID」

### SS105

- 位置: plugins/session/skills/handover/SKILL.md:137
- 原文: commit しない。working tree に残す
- 分類: その他
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:166-167（変更の確定方法をユーザーに確認する）と対照的

## plugins/session/skills/handover/references/handover-template.md

### SS106

- 位置: plugins/session/skills/handover/references/handover-template.md:3
- 原文: 次セッションでやる必要があるものは「復元タスク」、やらないと決めたものは「却下と決めたこと」に書く。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: handover SKILL.md:41-47 のタスク分類

### SS107

- 位置: plugins/session/skills/handover/references/handover-template.md:4
- 原文: どちらでもない事項は書かない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: handover SKILL.md:49「どちらにも入らない事項は handover に書かない」

### SS108

- 位置: plugins/session/skills/handover/references/handover-template.md:8
- 原文: {この取り組みの起点。発端となった問題や要件}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「背景」節に書く内容の指定
- 重複候補: handover SKILL.md:33「背景 (何をしていたか)」

### SS109

- 位置: plugins/session/skills/handover/references/handover-template.md:12
- 原文: {原初の目的}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「ゴール・原則」節に書く内容の指定
- 重複候補: handover SKILL.md:34「ゴール・原則 (ユーザーが明示した方針)」

### SS110

- 位置: plugins/session/skills/handover/references/handover-template.md:14
- 原文: {ユーザーが明示した方針・原則・フィードバック。採用しないと決めた選択肢を含む}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（採用しなかった選択肢まで残すことを要求する）
- 重複候補: handover SKILL.md:135「ユーザーが明示した原則・方針・feedback は必ず保持する」

### SS111

- 位置: plugins/session/skills/handover/references/handover-template.md:18
- 原文: {セッション中に合意した設計判断。確定台帳を持つプロジェクトでは、台帳の所在と到達点だけを書く}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 台帳がある場合は所在と到達点に絞る（重複記載の抑制）
- 重複候補: なし

### SS112

- 位置: plugins/session/skills/handover/references/handover-template.md:20
- 原文: {rules / skills / agents / スクリプト / 環境・ツーリングへの変更。なければ「なし」}
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: 空欄にせず「なし」と明記する指定
- 重複候補: 同ファイル 38 行「対象が無ければ書かない」（扱いが逆）

### SS113

- 位置: plugins/session/skills/handover/references/handover-template.md:24
- 原文: {何が終わり、何が残っているか}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 「現在地と再開手順」節に書く内容の指定
- 重複候補: debrief SKILL.md:80

### SS114

- 位置: plugins/session/skills/handover/references/handover-template.md:26
- 原文: {次セッションが最初にやること。読むファイル・実行するコマンドを名指しで書く}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（ファイル名・コマンドを名指しで書くことを要求する）
- 重複候補: start SKILL.md:34「続きの起点 (最初に読むファイル、最初に実行すること)」

### SS115

- 位置: plugins/session/skills/handover/references/handover-template.md:28
- 原文: {background で動いている処理、待ち事項、ブロッカーがあればここに書く}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: なし

### SS116

- 位置: plugins/session/skills/handover/references/handover-template.md:32
- 原文: {成果物を識別子で書く: PR 番号、コミット ID、変更ファイル、外部サービスへの変更}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（成果物を識別子で名指しする）
- 重複候補: handover SKILL.md:136、debrief SKILL.md:31-35、start SKILL.md:33

### SS117

- 位置: plugins/session/skills/handover/references/handover-template.md:36
- 原文: {git branch, status, worktree, stash。セッション中に触れた他リポジトリも含む}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（他リポジトリを落とさない）
- 重複候補: debrief SKILL.md:25「そのリポジトリでも `git status -s` を実行する」

### SS118

- 位置: plugins/session/skills/handover/references/handover-template.md:38
- 原文: {プロジェクトのタスク管理の棚卸し結果。対象が無ければ書かない}
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 対象が無いときは節を空にする（「なし」と書かせる 20 行と扱いが逆）
- 重複候補: debrief SKILL.md:50「タスク管理が特定できない場合はこのステップをスキップする」

### SS119

- 位置: plugins/session/skills/handover/references/handover-template.md:40
- 原文: {異常な状態があれば警告として明記}
- 分類: 文書種別の構造
- 性質: 媒体固有
- 重複候補: debrief SKILL.md:27「異常な状態〜があれば警告として記録する」

### SS120

- 位置: plugins/session/skills/handover/references/handover-template.md:44-46
- 原文: | ファイル | 内容 | / |---|---| / | {path} | {一言要約} |
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 「参照すべき資料」は path と一言要約の 2 列の表で書く
- 重複候補: debrief SKILL.md:83

### SS121

- 位置: plugins/session/skills/handover/references/handover-template.md:51
- 原文: 次セッションでやる必要があるものは、粒度を問わずすべてここに書く。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: 省略禁止の方向（粒度による間引きの禁止）
- 重複候補: handover SKILL.md:41-42 に同趣旨

### SS122

- 位置: plugins/session/skills/handover/references/handover-template.md:53-55
- 原文: | subject | description | / |---------|-------------| / | {タスク名} | {説明} |
- 分類: 形式・媒体判定
- 性質: 媒体固有
- 補足: 復元タスクは subject / description の 2 列の表で書く
- 重複候補: handover-reviewer.md:88-89「復元タスクの表構造、subject / description の空欄」（機械検査の担当）

### SS123

- 位置: plugins/session/skills/handover/references/handover-template.md:59-60
- 原文: やらないと決めたもの。**次セッションの作業候補にしない。** 同じ候補を蒸し返さないための記録で、やることの一覧ではない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: retrospective SKILL.md:176-177 に同趣旨

### SS124

- 位置: plugins/session/skills/handover/references/handover-template.md:62
- 原文: - {項目}: 却下 ({決めた回})
- 分類: 表記・記法
- 性質: 媒体固有
- 補足: 却下項目は「項目: 却下 (決めた回)」の形式で書く
- 重複候補: handover SKILL.md:44-45「決めた内容と決めた回だけを書く」

## plugins/session/skills/end/SKILL.md

### SS125

- 位置: plugins/session/skills/end/SKILL.md:13
- 原文: 全工程を確認なしで連続実行する。
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 補足: 工程間でユーザー確認を挟まない指定
- 重複候補: start SKILL.md:41-42「確認不要」

### SS126

- 位置: plugins/session/skills/end/SKILL.md:22
- 原文: 警告への対応が必要な場合はここで解決する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: debrief SKILL.md:89「警告がある場合は対応要否を確認する」

### SS127

- 位置: plugins/session/skills/end/SKILL.md:39,42-45
- 原文: 全工程の完了後、以下を報告する。 - 実行した工程の一覧 - retrospective の codify 結果 - handover のファイルパス (handover ステップ 7 で報告済みなら省略) - 次セッションの開始方法 (`/session:start`)
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: 例外 = handover のファイルパスは handover ステップ 7 で報告済みなら省略
- 重複候補: handover SKILL.md:128-131 の完了報告項目

### SS128

- 位置: plugins/session/skills/end/SKILL.md:40
- 原文: 各 skill が既に報告した情報は繰り返さず、全体のサマリに絞る。
- 分類: 取捨選択
- 性質: 汎用
- 重複候補: start SKILL.md:38-39「上の 3 点と復元タスク以外は提示しない」

## plugins/session/references/handover-init.md

### SS129

- 位置: plugins/session/references/handover-init.md:7-10
- 原文: 以下の順で `.handover/` を探す。見つかった時点で探索終了。 1. CWD (primary working directory) 直下 (例: `ls .handover/`) 2. git root 直下 (CWD と異なる場合のみ。非 git プロジェクトではスキップ)
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 補足（12 行）= CWD は Claude Code 起動時の作業ディレクトリで、git root とは異なる場合がある。工程との切り分けに迷った
- 重複候補: なし

### SS130

- 位置: plugins/session/references/handover-init.md:14
- 原文: 見つかった `.handover/` の絶対パスを以降すべての操作で使う。
- 分類: その他
- 性質: 媒体固有
- 重複候補: start SKILL.md:18、debrief SKILL.md:73、handover SKILL.md:18 に同趣旨

### SS131

- 位置: plugins/session/references/handover-init.md:15
- 原文: skill 側の `.handover/` への言及はすべてこの絶対パスに読み替える。
- 分類: その他
- 性質: 媒体固有
- 重複候補: 同ファイル 14 行と対

### SS132

- 位置: plugins/session/references/handover-init.md:21
- 原文: CWD と git root が異なる (かつ git root が存在する) なら、どちらに `.handover/` を作成するかユーザーに確認する。同じ場合や非 git プロジェクトの場合は CWD に作成する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### SS133

- 位置: plugins/session/references/handover-init.md:22
- 原文: `.gitignore` に `.handover/` を追加するかも合わせて確認する
- 分類: 確認・質問の作り方
- 性質: 媒体固有
- 重複候補: なし

### SS134

- 位置: plugins/session/references/handover-init.md:23
- 原文: 承認後、`draft/` `todo/` `archive/` の 3 つのサブディレクトリを含めて作成する
- 分類: その他
- 性質: 媒体固有
- 補足: 承認を得てから作成する（無断作成の禁止）
- 重複候補: retrospective SKILL.md:186「ユーザー承認を必ず経る」

### SS135

- 位置: plugins/session/references/handover-init.md:27
- 原文: `.handover/` はこのプロジェクトのセッションを次のセッションへ繋ぐためだけの場所。
- 分類: その他
- 性質: 媒体固有
- 補足: 用途の限定（置き場の責務境界）
- 重複候補: 同ファイル 33 行「引き継ぎ資料以外を置かない」

### SS136

- 位置: plugins/session/references/handover-init.md:29-31
- 原文: - `draft/`: 進行中セッションの記録 (最大 1 ファイル) - `todo/`: 確定済み・次セッションで未消化の引き継ぎ資料 - `archive/`: 消化済みの引き継ぎ資料 (全件保持)
- 分類: その他
- 性質: 媒体固有
- 補足: draft は最大 1 ファイル、archive は全件保持という数量規定を含む
- 重複候補: start SKILL.md:41-42「archive は全件保持の移動」、同ファイル 48 行「複数ファイルがある場合は最新 (mtime)」

### SS137

- 位置: plugins/session/references/handover-init.md:33
- 原文: 引き継ぎ資料以外を置かない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: start SKILL.md:43-44「handover でないファイルが todo/ にある場合は移動せず〜提案する」

### SS138

- 位置: plugins/session/references/handover-init.md:33-34
- 原文: 他プロジェクトへ渡す依頼文・プロンプト・調査の中間生成物は、自セッションの scratchpad に置くか、依頼文としてユーザーへ渡す。
- 分類: その他
- 性質: 媒体固有
- 補足: 除外したものの行き先を指定する
- 重複候補: handover SKILL.md:49-53「行き先はそれぞれ別にある」

### SS139

- 位置: plugins/session/references/handover-init.md:36-38
- 原文: **他プロジェクトの `.handover/` に書き込まない。編集も新規作成も禁止。** `.handover/` に書けるのは、そのプロジェクトを作業対象にしているセッションだけ。
- 分類: その他
- 性質: 媒体固有
- 補足: 判定基準（42-43 行）= そのファイルを消化するのがこのプロジェクトの次のセッションか。違うなら `.handover/` の外に置く
- 重複候補: なし

### SS140

- 位置: plugins/session/references/handover-init.md:38-40
- 原文: 他のセッション・他のプロジェクトへタスクを引き継ぐとき、渡し先 repo の `.handover/todo/` へ直接ファイルを作りたくなるが、やらない。依頼文と資料の所在をユーザー経由で渡し、受け取った側のセッションが自分の `.handover/` へ取り込む。
- 分類: その他
- 性質: 媒体固有
- 重複候補: 同ファイル 36-38 行と対

### SS141

- 位置: plugins/session/references/handover-init.md:47
- 原文: 存在確認で特定された `.handover/` の `draft/` 内のファイルを対象とする。
- 分類: その他
- 性質: 媒体固有
- 補足: 工程との切り分けに迷った
- 重複候補: なし

### SS142

- 位置: plugins/session/references/handover-init.md:48
- 原文: 複数ファイルがある場合は最新 (mtime) を使用する。
- 分類: その他
- 性質: 媒体固有
- 重複候補: 同ファイル 29 行「draft/: 進行中セッションの記録 (最大 1 ファイル)」

## plugins/session/agents/handover-reviewer.md

### SS143

- 位置: plugins/session/agents/handover-reviewer.md:17
- 原文: handover を確定する前に 1 度だけ回す。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:92「**1 本だけ** 起動する」、同 107 行「指摘 0 件まで繰り返さない」

### SS144

- 位置: plugins/session/agents/handover-reviewer.md:17
- 原文: 見るのは **次セッションの行動が変わる欠陥だけ**。
- 分類: 取捨選択
- 性質: 媒体固有
- 補足: why（19-25 行）= 以前は 4 観点（背景・動機 / 進捗・成果物 / 手順・参照先 / やることの集約）で突合も含めて全部を agent がやっていた。実測（2026-08-18〜19、R1〜R5 で打ち切り）で 5 ラウンド・指摘 6 件に subagent トークン 284.1k・ツール 107 回・1,738 秒を使って収束せず、ツール 43 回の大半が commit hash・パス・git 状態の突合に消えていた。同じ突合は手元の Bash 1 呼び出しで再現でき、結果は一致した
- 重複候補: handover SKILL.md:100-102「agent が見るのは〜4 点だけ」

### SS145

- 位置: plugins/session/agents/handover-reviewer.md:29-33
- 原文: 呼び出し元が次を渡す。 - 対象 handover ファイルの絶対パス - 機械検査の JSON 出力（`total` が 0 であること） - そのセッションで触れた台帳・設計ドキュメントの所在
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:94-98 に同じ 3 点

### SS146

- 位置: plugins/session/agents/handover-reviewer.md:35
- 原文: 機械検査が未実行なら、その旨を報告して終わる。この agent は機械検査の代替ではない。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:92「機械検査を通してから〜起動する」

### SS147

- 位置: plugins/session/agents/handover-reviewer.md:39
- 原文: 上から順に実行する。前の段で見つけた食い違いは、後の段の前提にしない。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 前段は工程だが、後段（前提にしない）は規範。工程との切り分けに迷った
- 重複候補: なし

### SS148

- 位置: plugins/session/agents/handover-reviewer.md:43
- 原文: **節をまたいで矛盾する記述の検出がこの段の目的。** 次セッションはどちらか一方だけを読んで動く。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: why = 次セッションはどちらか一方だけを読んで動くため
- 重複候補: なし

### SS149

- 位置: plugins/session/agents/handover-reviewer.md:45
- 原文: 「現在地と再開手順」で未決着とされた論点が、「却下と決めたこと」では決着済みになっていないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS150

- 位置: plugins/session/agents/handover-reviewer.md:46
- 原文: 「決定事項」で確定とされたものが、「復元タスク」では検討対象として残っていないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS151

- 位置: plugins/session/agents/handover-reviewer.md:47
- 原文: 「完了したこと」に書かれた成果が、「現在の作業状態」で未着手として書かれていないか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS152

- 位置: plugins/session/agents/handover-reviewer.md:49
- 原文: 矛盾を見つけたら、どちらが正かは決めず、両方の該当箇所を引用して指摘する。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: 同ファイル 103 行「何が問題か（節名と該当箇所の引用）」

### SS153

- 位置: plugins/session/agents/handover-reviewer.md:53-54
- 原文: 次セッションでやる必要のある事項が、「復元タスク」以外の節の地の文に紛れていないかを見る。紛れているものは、復元タスクへ移すか削るかを求める。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:41-42「粒度・優先度を問わず全件を `## 復元タスク` セクションに書く」

### SS154

- 位置: plugins/session/agents/handover-reviewer.md:56
- 原文: 地の文の「〜する必要がある」「〜が残っている」「〜を詰める」は、復元タスクに対応する行があるか
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: なし

### SS155

- 位置: plugins/session/agents/handover-reviewer.md:57-58
- 原文: 復元タスクの description が、次セッションが着手できる粒度か。対象ファイル・判定基準・着手の順序のどれかが無いものは指摘する
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 省略禁止の方向（対象ファイル・判定基準・着手の順序を落とさない）
- 重複候補: handover-template.md:26「読むファイル・実行するコマンドを名指しで書く」

### SS156

- 位置: plugins/session/agents/handover-reviewer.md:62
- 原文: 「却下と決めたこと」に、やらないと決めたもの以外が混ざっていないかを見る。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:44-47 の却下の規定

### SS157

- 位置: plugins/session/agents/handover-reviewer.md:64
- 原文: 却下の理由が書かれているか。理由の無い却下は次セッションが蒸し返す
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: why = 理由が無いと次セッションが蒸し返すため。handover SKILL.md:44-45 が「決めた内容と決めた回だけを書く」としている点と緊張関係にある
- 重複候補: handover-template.md:59-60「同じ候補を蒸し返さないための記録」

### SS158

- 位置: plugins/session/agents/handover-reviewer.md:65-66
- 原文: 検討そのものが無効になったもの（前提が消えたもの）が書かれていないか。これは蒸し返されないので書く必要が無い
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 重複候補: handover SKILL.md:46-47 に同趣旨

### SS159

- 位置: plugins/session/agents/handover-reviewer.md:68
- 原文: 先送りの含みを持つ語（保留・あとで・いずれ 等）は機械検査が拾う。ここでは見ない。
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 機械検査との責務境界
- 重複候補: 同ファイル 84-97「扱わないこと」

### SS160

- 位置: plugins/session/agents/handover-reviewer.md:72-73
- 原文: handover が **他のファイルの中身** について述べている箇所を列挙し、実物に当たって確かめる。ここが機械化できない唯一の突合で、この agent が持つ理由でもある。
- 分類: 検知・レビュー手順
- 性質: 汎用
- 補足: 実例（80 行）= 実測（2026-08-18、R4）で出た「台帳の未解決課題を 2 件と書いたが実際は 1 件」がこの型
- 重複候補: なし

### SS161

- 位置: plugins/session/agents/handover-reviewer.md:75
- 原文: 台帳・設計ドキュメントの件数（「未解決課題は 2 件」等）が実物と一致するか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS162

- 位置: plugins/session/agents/handover-reviewer.md:76
- 原文: 「〜に記録した」「〜に書いてある」の参照先に、実際にその内容があるか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS163

- 位置: plugins/session/agents/handover-reviewer.md:77
- 原文: 引用符で括った箇所が原文と一致するか
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS164

- 位置: plugins/session/agents/handover-reviewer.md:78
- 原文: 過去の回の決定を引くとき、その決定が実在するか。`git show <rev>:<path>` で当たれる
- 分類: 検知・レビュー手順
- 性質: 汎用
- 重複候補: なし

### SS165

- 位置: plugins/session/agents/handover-reviewer.md:82
- 原文: **突合していないものを「一致している」と書かない。**
- 分類: 文レベル
- 性質: 汎用
- 重複候補: 同ファイル 111 行「推測で欠陥を作らない。根拠を示せないものは「疑い」として分ける」

### SS166

- 位置: plugins/session/agents/handover-reviewer.md:82
- 原文: 確認した項目と未確認の項目を分けて報告する。
- 分類: 文書種別の構造
- 性質: 汎用
- 重複候補: 同ファイル 104 行「無いなら「疑い」と明記する」

### SS167

- 位置: plugins/session/agents/handover-reviewer.md:86-94
- 原文: 次は機械検査（`skills/handover/scripts/check-handover.mjs`）が持つ。**この agent では見ない。** - テンプレートの必須 9 節の過不足・重複 - 復元タスクの表構造、subject / description の空欄 - commit hash の実在 - パスの実在、パスの省略記号 - git の branch / HEAD / 未コミット / stash / upstream / worktree との突合 - 却下の節の先送り語 - 存在しない節への参照、名指しの無い 後述 / 前述 / 上記 / 下記
- 分類: 検知・レビュー手順
- 性質: 媒体固有
- 補足: 機械検査との責務境界（7 項目の除外リスト）
- 重複候補: handover SKILL.md:100-102「識別子の実在と git の突合はステップ 6 が持つ」

### SS168

- 位置: plugins/session/agents/handover-reviewer.md:96
- 原文: これらを見つけても報告しない。
- 分類: 取捨選択
- 性質: 媒体固有
- 重複候補: 同ファイル 68 行「ここでは見ない」

### SS169

- 位置: plugins/session/agents/handover-reviewer.md:96-97
- 原文: 機械検査が拾えていないなら、検査の側を直すべき事案として **1 行だけ**「機械検査の漏れ」として挙げる。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### SS170

- 位置: plugins/session/agents/handover-reviewer.md:101-105
- 原文: 指摘ごとに 3 点を書く。 - 何が問題か（節名と該当箇所の引用） - なぜそう言えるか（当たった実物のパスと該当箇所。無いなら「疑い」と明記する） - どう直すか（具体的な置換文字列か、復元タスクへ移す行の中身）
- 分類: 文書種別の構造
- 性質: 汎用
- 補足: 「当たった実物のパス」を要求する（識別子の省略禁止の方向）
- 重複候補: retrospective SKILL.md:155-160 の提示フォーマット

### SS171

- 位置: plugins/session/agents/handover-reviewer.md:107-108
- 原文: 各指摘に **「次セッションの行動が変わるか」** の判定を付ける。呼び出し元はこれで再ラウンドの要否を決める。
- 分類: 文書種別の構造
- 性質: 媒体固有
- 補足: why = 呼び出し元が再ラウンドの要否を決めるため
- 重複候補: handover SKILL.md:109「次セッションの行動が変わる指摘が出たら、直して **もう 1 度だけ** 回す」

### SS172

- 位置: plugins/session/agents/handover-reviewer.md:108
- 原文: 指摘が 0 件なら「approve」と明記する。
- 分類: 表記・記法
- 性質: 媒体固有
- 重複候補: なし

### SS173

- 位置: plugins/session/agents/handover-reviewer.md:110
- 原文: read-only。handover ファイルを編集しない
- 分類: その他
- 性質: 媒体固有
- 重複候補: handover SKILL.md:111「レビュー実行中は対象ファイルを編集しない」

### SS174

- 位置: plugins/session/agents/handover-reviewer.md:111
- 原文: 推測で欠陥を作らない。根拠を示せないものは「疑い」として分ける
- 分類: 文レベル
- 性質: 汎用
- 重複候補: 同ファイル 82 行「突合していないものを「一致している」と書かない」

### SS175

- 位置: plugins/session/agents/handover-reviewer.md:112
- 原文: 日本語で書く
- 分類: 表記・記法
- 性質: 汎用
- 重複候補: なし

### SS176

- 位置: plugins/session/agents/handover-reviewer.md:112
- 原文: 冗長な前置きと総括を書かない
- 分類: 文レベル
- 性質: 汎用
- 重複候補: retrospective SKILL.md:95-96「レポートを書かない」

## 検算用の集計

| ファイル | 抽出条項数 | 総行数 | 見出し数 | 箇条書き数 |
| --- | ---: | ---: | ---: | ---: |
| `skills/start/SKILL.md` | 18 | 88 | 7 | 8 |
| `skills/debrief/SKILL.md` | 18 | 89 | 7 | 21 |
| `skills/retrospective/SKILL.md` | 39 | 188 | 19 | 38 |
| `skills/handover/SKILL.md` | 30 | 137 | 12 | 31 |
| `skills/handover/references/handover-template.md` | 19 | 62 | 9 | 1 |
| `skills/end/SKILL.md` | 4 | 45 | 5 | 4 |
| `references/handover-init.md` | 14 | 48 | 4 | 3 |
| `agents/handover-reviewer.md` | 34 | 112 | 8 | 31 |
| 合計 | 176 | 769 | 71 | 137 |

見出し数は正規表現 `^#{2,4}` にスペースを続けた行の数、箇条書き数は行頭の空白に続く `-` または `*` とスペースで始まる行の数（いずれも実測）。

AskUserQuestion 不使用指定は 2 件（SS18 = `skills/start/SKILL.md:80`、SS55 = `skills/retrospective/SKILL.md:107`）。
`grep -rn AskUserQuestion` で 8 ファイルを走査したヒットも 2 件で、抽出件数と一致する。

省略の禁止に関する条項は 20 件。補足に「省略禁止の方向」と明記したのは次の ID。

SS3 / SS11 / SS19 / SS25 / SS31 / SS41 / SS67 / SS75 / SS78 / SS79 / SS80 / SS103 / SS104 / SS110 /
SS114 / SS116 / SS117 / SS121 / SS155 / SS170

このうち「識別子を省略しない」を直接規定するのは SS31 / SS103 / SS104 / SS114 / SS116 / SS170 の 6 件、
「全件を書く」を直接規定するのは SS19 / SS25 / SS79 / SS80 / SS117 / SS121 の 6 件。
近縁だが補足の文言を変えたものに SS2（`.handover/todo/` 内の全ファイルを Read する = 全件性）、
SS21（成果物を PR 番号・コミット ID で書く）、SS23（推定したタスク管理のそれぞれについて棚卸しする）がある。

### 旧抽出（2026-07-30、SS 全体で 14 件）との差

差の主因は粒度で、対象の増加ではない。旧抽出時点の 8 本は合計 676 行（`git rev-list -1 --before=2026-07-31` = `3f921e6` 時点の実測）で、
現在の 769 行との差は +93 行（template が 103 → 62 行に縮み、handover SKILL.md が 77 → 137 行に伸びた差し引き）。
14 % の増加で 14 件が 176 件になる説明はつかない。

今回は「〜する / 〜しない / 〜の形式で書く」の文 1 つを 1 件とし、1 文に独立した規定が 2 つあれば割った。
旧抽出はファイルあたり 2 件弱で、節・skill 単位の要約に近い粒度だったと見られる。
なお 2026-08 に入った追加分（機械検査 9 種、handover-reviewer の 4 観点への縮小、「却下と決めたこと」節、
タスクツール不提供時の代替）は現在の 176 件のうち 30 件前後を占め、増分の一部ではあるが主因ではない。

工程として除外したのは、工程見出し 30 個（start 5 / debrief 6 / retrospective 7 / handover 8 / end 4）と、
その配下の純手順文（git コマンド列、「ステップ N に進む」、`/session:debrief` 等の skill 呼び出し、
draft から todo への移動指示、エラーハンドリング表）でおよそ 60 行。
工程に埋め込まれた規範（成果物の中身・報告の粒度・省略の禁止・確認の要否）は残したため、
除外はファイルの見た目の分量ほど件数を削っていない。
