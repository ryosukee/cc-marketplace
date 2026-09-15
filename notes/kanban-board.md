# kanban のタスク管理

| 項目 | 内容 |
| --- | --- |
| 目的 | 並行して走る話題をカードで追う道具を決め、導入するまでの確定事項を積む |
| 生存期間 | 道具を導入し、運用の手順を plugin か CLAUDE.md へ移すまで |
| 対象議題 | kanban の導入（並行する話題をカードで追う道具の選定から、plugin での運用まで） |

## この decision-record が参照する artifacts

artifacts は `notes/artifacts/` に置く。各 artifacts は冒頭でこの decision-record へ逆参照する。
生存期間はこの decision-record と同じで、冒頭の表が持つ。どの artifacts をいつ処遇するかは計画のタスクにある。

| artifacts | 目的 |
| --- | --- |
| [kanban のタスク管理を求めた発言の実文](./artifacts/kanban-requirements-origin.md) | kanban を求めたユーザー発言の実文 |
| [kanban の板の道具を、観点を定義して比較し直す](./artifacts/kanban-matrix.md) | 道具の比較。観点の誤りで結論は失効（確定 1） |
| [Linear Free プランの制限と repo の対応](./artifacts/kanban-linear-free-plan-2026-09-03.md) | Linear Free の上限と repo の対応の一次情報 |
| [Plane Cloud Free と Community Edition の差](./artifacts/kanban-plane-cloud-vs-ce-2026-09-03.md) | Plane Cloud Free と Community Edition の差 |
| [Plane Cloud Free の上限・公式 CLI・公式 MCP・API レート制限](./artifacts/kanban-plane-free-limits-cli-mcp-2026-09-04.md) | Plane Free の上限・CLI・MCP・レート制限 |
| [OpenProject / YouTrack / Wekan / Beads の repo 切り分け単位と上限](./artifacts/kanban-candidates-repo-units-2026-09-03.md) | 他 4 候補の repo 切り分け単位と無料枠の上限 |
| [Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md) | Plane の階層構造・データモデル・REST API |
| [kanban の候補を確定した要件で実測し直す](./artifacts/kanban-candidates-2026-09-02.md) | 確定した要件で候補を測り直した記録 |
| [kanban-md の追加調査と比較検討](./artifacts/kanban-md-followup.md) | kanban-md の追加調査。不採用の根拠 |

## 確定事項

### 確定 1 前の比較は、言われていない要件の上に立っていた

結論。`notes/artifacts/kanban-matrix.md` が「依頼で与えられた要件は 6 つ」として比較の土台に置いた
6 件のうち、2 件はユーザーの発言に遡れない（「板の実体は自前のファイルに置く」
「壊れたときに気づける」）。逆に、発言にあって 6 件に入っていない項目が 8 つあった。
この比較と、そこから出た taskmd の推奨は成立しない。

決めなかった範囲。`kanban-matrix.md` に書かれた候補ごとの実測値そのものは否定していない。
使えないのは観点の組み方と結論であって、個々の観測ではない。

決め手。transcript の全走査で、2 件を述べたユーザー発言が 1 件も見つからなかった。
「板の実体は自前のファイル」の出所は ccm-f058 の設問への回答で、その 3 択は Claude が構成したもの。

出典。ccm-f065 への回答（2026-09-01T18:32:11.109Z）の Q1「元から要件になかったよ」。
実文は [実文 5 ccm-f065 への回答](./artifacts/kanban-requirements-origin.md#実文-5-ccm-f065-への回答)。

反映先。反映なし（この確定は、以後の設計が古い比較を前提にしないための記録）。

### 確定 2 確定した要件は 6 件

結論。次の 6 件を要件として確定した。

1. 人が kanban の UI で見る。ターミナルの中でも外でもよい
2. Claude 側は UI を必要とせず、状態を読み書きできる口があればよい
3. カードは、どこで誰が作業しているかを状態として持つ
4. セッションをまたいで残る。毎セッションの引き継ぎ作業が要らない
5. 人から全件が見える
6. セッションごとの一覧という見方ができる

決めなかった範囲。「多すぎても煩雑にならない」「標準のタスクツールと同程度に軽い」は、
判定できる条件になっていないため要件にしていない。

決め手。いずれも 2026-08-31 と 2026-09-01 のユーザー発言に直接遡れる。

出典。[実文 1](./artifacts/kanban-requirements-origin.md#実文-1-タスクの見える化を求めた最初の発言)、
[実文 2](./artifacts/kanban-requirements-origin.md#実文-2-kanban-の語の初出とtasktools-の不足の説明)、
[実文 8](./artifacts/kanban-requirements-origin.md#実文-8-ボードは-1-つでセッションごとの見え方はフィルター)、
[実文 12](./artifacts/kanban-requirements-origin.md#実文-12-取り逃しの追い方と標準のタスクツールの不足)。

反映先。候補の比較の観点。

### 確定 3 ボードの単位は優先条件で、必須条件ではない

結論。「ボードの実体が repo ごとに 1 つ」は、ボードの中身を commit できる利点があるが、
必須条件から一段落ちる優先条件として扱う。実体を repo ごとに分けるか、
1 つのボードにフィルターで見え方を作るかは、どちらでもよい。

決めなかった範囲。優先条件どうしの重みの順序は決めていない。

決め手。要件を候補の足切りに使わない方針が先にあり、この項目もその対象になる。

出典。2026-09-01T19:05:55.844Z の発言と、2026-09-02 の訂正。
実文は [実文 11](./artifacts/kanban-requirements-origin.md#実文-11-要件を候補の足切りに使わない) と
[実文 15](./artifacts/kanban-requirements-origin.md#実文-15-ボードの単位は必須条件ではなく優先条件)。

反映先。候補の比較の観点（落とす条件ではなく重みとして使う）。

### 確定 4 親子・依存関係・独自の属性の 3 つを要件にする

結論。ccm-f066 の設問 1 から 3 の回答で、次の 3 つを要件にした。

- カードが親子の関係を持てる。jira の epic に当たる形で、norm-refit が親、その中の実タスクが子になる
- カードどうしの依存（順序の制約）が見える
- カードに名前の付いた独自の属性を足せる

決めなかった範囲。親子が何段まで必要かは決めていない。
成果物（HTML ページ）をカードへ紐づける形の詳細も決めていない。

決め手。3 つとも 2026-08-31 の発言に不足として挙がっており、
親子については 2026-09-02 に用途（epic として norm-refit を親にする）まで示された。

出典。ccm-f066 への回答。
実文は [実文 16](./artifacts/kanban-requirements-origin.md#実文-16-ccm-f066-への回答)。

反映先。候補の比較の観点。Orca は依存関係と独自の属性を持たないため、この 3 件で候補から外れる。

### 確定 5 今回は導入まで進める

結論。要件の確定で止めず、道具を決めて未着手の一覧を取り込むところまで進める。

決めなかった範囲。取り込みの粒度（`todo.md` の 43 項目をそのままカードにするか、
分解するか）は決めていない。

決め手。ccm-f066 の設問 4 の回答。

出典。[実文 16](./artifacts/kanban-requirements-origin.md#実文-16-ccm-f066-への回答)。

反映先。この文書の作業メモの進め方。

### 確定 6 台帳はこのファイル

結論。kanban のタスク管理の確定事項は `notes/kanban-board.md`（このファイル）に積み、
`notes/README.md` に 1 行を持つ。

決めなかった範囲。導入後に運用の手順をどこへ移すかは決めていない。

決め手。`notes/artifacts/` に明細が 3 本ある一方、それを束ねる本体が無く、
`rules/notes-authoring.md` が求める目的・生存期間・対象タスクの表を持つファイルが不在だった。

出典。ccm-f066 への回答の補足「note はそれで ok」。
実文は [実文 16](./artifacts/kanban-requirements-origin.md#実文-16-ccm-f066-への回答)。

反映先。`notes/README.md` の一覧。

### 確定 7 カードの内容は外部のサービスに置いてよい。ただし GitHub Projects は採らない

結論。カードの題名・本文・属性の値が外部のサービスに置かれることを許す。
ただし GitHub Projects v2 は採らない。project 単位で使えない場合があり、
チームの公共リソースになってしまうため。使いたいのはチームの中でも個人で使えるもの。

決めなかった範囲。どのサービスなら許すかの線引きは決めていない。

決め手。この repo は既に GitHub にあり、issue と PR の本文は同じ場所に置かれている。
GitHub Projects を外すのは配置の可否ではなく、個人で使えるかどうかの理由になる。

出典。ccm-f067 への回答（2026-09-03）。実文は
[実文 18](./artifacts/kanban-requirements-origin.md#実文-18-ccm-f067-への回答)。

反映先。候補の比較。GitHub Projects v2 を候補から外す。

### 確定 8 常駐は許す。自宅サーバでも手元の mac-mini local でもよい

結論。常駐するプロセスの有無と必要リソースは、重みとしては見るが候補を落とす条件にしない。
自前の自宅サーバに常駐させてもよく、kanban のサービスごと常駐させてもよい。
最初は手元の mac-mini local でもよい。

決めなかった範囲。どのマシンへ置くかは決めていない。

決め手。ccm-f067 の設問 2 の回答と、その補足。

出典。ccm-f067 への回答（2026-09-03）。実文は
[実文 18](./artifacts/kanban-requirements-origin.md#実文-18-ccm-f067-への回答)。

反映先。候補の比較。4 コア・4 GB の常駐を理由に不利にしていた候補
（OpenProject CE・YouTrack Server・Wekan）が横並びに戻る。

### 確定 9 未着手の一覧は 1 項目 1 枚でそのまま取り込む

結論。`todo.md` の項目を、分解せずに 1 項目 1 枚のカードとして取り込む。

決めなかった範囲。取り込んだ後に分解するかどうかは、着手のときに決める。

決め手。ccm-f067 の設問 4 の回答。

出典。ccm-f067 への回答（2026-09-03）。実文は
[実文 18](./artifacts/kanban-requirements-origin.md#実文-18-ccm-f067-への回答)。

反映先。導入の手順。

### 確定 10 セッションごとの絞り込みは kanban 側で行う。ラベルで足りるなら独自の属性は必須でない

結論。セッションごとの一覧は、kanban の UI 側で絞れる必要がある。
そのために名前の付いた独自の属性が要るなら、要件 3 は必須になる。
ただし実測の結果、ラベルでもこの絞り込みは満たせることが分かった。

- Plane の公式ドキュメントは "Once labels exist, you can apply several to a single work item,
  then filter, group, and sort your work items by them across every layout" と書く。
  board のレイアウトでもラベルで絞れる
- Linear は label groups を持ち、"Label groups create one level of nesting in your workspace and
  team labels" と書く。`session` グループの下にセッションごとのラベルを置ける。
  1 グループ 250 ラベルが上限

したがって要件 3 は「名前の付いた属性を足せること」ではなく
「セッションごとの一覧を kanban の UI で絞れること」として扱う。
これを満たす手段は、カスタムフィールドとラベルの 2 通りある。

決めなかった範囲。ラベルで運用する場合の掃除の手順は決めていない。
セッションが増えるとラベルが増え続け、Linear では 1 グループ 250 の上限に当たる。

決め手。ユーザーの発言「セッションごとの一覧を何かしらの方法で kanban 側で絞れて欲しい。
そのために独自の属性をつける必要があるなら必須になるね」。
条件は絞り込みができることで、実現の手段は問われていない。

出典。2026-09-03 の発言。実文は
[実文 20](./artifacts/kanban-requirements-origin.md#実文-20-セッションごとの絞り込みは-kanban-側で行う)。
Plane と Linear の文言は 2026-09-03 に公式ドキュメントから取得した。

反映先。候補の比較。Linear と Plane Community Edition が候補に戻る。

### 確定 11 道具は Plane。Cloud Free と Community Edition のどちらかは未定。次点は YouTrack Server

結論。kanban の道具は Plane にする。Cloud Free と Community Edition のどちらにするかは、
Cloud Free に work item 数の上限があるかを確かめてから決める。次点は YouTrack Server。
Linear・OpenProject・Wekan・Beads・自前実装は候補から外れた。

決めなかった範囲。エディション。Cloud Free の上限の有無（2026-09-03 の調査では公式に記載なし。
Community Edition は「無制限」と明記しているため、Free は有限ではないかという疑問が残る）。

決め手。ccm-f068 への回答「その他: plane cloud or comunity, 次点で youtrack」。

出典。2026-09-04 の回答。実文は
[実文 21](./artifacts/kanban-requirements-origin.md#実文-21-ccm-f068-への回答)。

反映先。導入の手順。候補の比較はこれで終了。

### 確定 12 Claude 側のラップは cc-marketplace の plugin にする

結論。カードを読み書きする手順と、いまのセッションをカードへ結び付ける仕組みは、
cc-marketplace の plugin として作る。全 repo のセッションが同じ手順で使える。

決めなかった範囲。plugin の名前と構成（skill / hook / agent のどれを持つか）。
Plane との接続手段（CLI / API 直叩き / MCP）。ユーザーは補足で
「token 節約的には mcp より cli の方がよいと思ってる」と述べているが、これは回答ではなく補足で、
CLI の有無を確かめてから決める。

決め手。ccm-f068 への回答「cc-marketplace の plugin にする」。

出典。2026-09-04 の回答。実文は
[実文 21](./artifacts/kanban-requirements-origin.md#実文-21-ccm-f068-への回答)。

反映先。新しい plugin。`.claude/rules/plugin-design.md` の kernel パターンと
「環境固有の値は settings.json の env に置く」（API key の置き場）が当たる。

### 確定 13 Plane Cloud Free に work item 数・project 数の上限は無いものとして扱う

結論。Plane Cloud Free の work item 数・project 数に上限は無いものとして扱い、
確定 11 の「決めなかった範囲」に残していた「Free は有限ではないか」という疑問を閉じる。
公式が数値で示す Free の上限は席数 12・AI credits 500 / 席 / 月・添付 1 件 5MB の 3 つで、
1 人で使う限りどれも効かない。

決めなかった範囲。エディションそのもの（Cloud Free か Community Edition か）は ccm-f069 で問う。
Cloud 側の実装は非公開なので、上限が無いという判定は公式資料とコードからの推定であり、
作成が失敗し始めたら上限に当たったと見て Community Edition へ移す。

決め手。価格ページの機能表で件数を持つ行は席数だけで、Projects / Work Items の行は件数なし。
Community Edition のコードの料金比較表が Free の見出しに "Unlimited projects" と
"Unlimited cycles and modules" を持ち、上限を数える実装が無い。公式ブログが Community Edition を
"At 99.9% parity with the Free plan of our Cloud" と書く。
「CE が無制限と明記しているなら Free は有限では」という読みは、どの公式資料にも支持されない。

出典。2026-09-04 の調査。実文は
[Plane Cloud Free の上限・公式 CLI・公式 MCP・API レート制限](./artifacts/kanban-plane-free-limits-cli-mcp-2026-09-04.md)。
問いの実文は [実文 21](./artifacts/kanban-requirements-origin.md#実文-21-ccm-f068-への回答) の補足。

反映先。ccm-f069 の設問 1 の推奨（Cloud Free）。導入時のエディションの選択。

### 確定 14 エディションは Plane Cloud Free

結論。Plane Cloud Free を使う。Community Edition の常駐は立てない。
確定 11 が「未定」として残していたエディションの選択を閉じる。

決めなかった範囲。Cloud Free で運用できなくなったときの移り先は決めていない。
確定 11 の次点（YouTrack Server）は Plane 自体が使えなかったときの退避先で、
エディションの退避先は Community Edition になる。移す条件は確定 13 のとおり
「work item の作成が失敗し始めたとき」。

決め手。確定 13 で件数の上限が無いものとして扱うと決めたことで、
Cloud Free を採らない理由が「カードの内容を手元に置きたい」だけになった。
確定 7 でカードの内容は外部のサービスに置いてよいと決めてあるので、この理由は立たない。
立てるものが無く、新機能が Cloud に先に来る。

出典。ccm-f069 の設問 1 への回答（2026-09-04）。実文は
[実文 22](./artifacts/kanban-requirements-origin.md#実文-22-ccm-f069-への回答)。

反映先。plugin の接続先（Cloud の API エンドポイントと workspace slug）。API key は Cloud で発行する。

### 確定 15 plugin は Plane の REST API を自分のスクリプトから直接叩く

結論。常用の接続手段は REST API の直叩き。公式 MCP server（hosted 版・stdio 版）と
公式 CLI（Plane Compose）は常用の経路にしない。

決めなかった範囲。API の呼び出しをどの言語・どの形のスクリプトで書くかは決めていない
（plugin の構成と一緒に決める）。429 に当たったときの待ち方も未定。

決め手。MCP は tool 30 個の定義が毎セッション context に載る。
実文 21 の補足が「token 節約的には mcp より cli の方がよい」と述べており、
context に載る量を最小にする選択が API 直叩きになる。
plugin のスクリプトから叩く形は、cc-marketplace の kernel パターン
（`scripts/` のエントリスクリプト経由で state に触る）にそのまま乗る。
引き受けるのは、API の変更への追従と 429 の対処を自分で持つこと。

出典。ccm-f069 の設問 2 への回答（2026-09-04）。実文は
[実文 22](./artifacts/kanban-requirements-origin.md#実文-22-ccm-f069-への回答)。
API のレート制限（key 1 本あたり 60 req/分、超過は 429）の実文は
[Plane Cloud Free の上限・公式 CLI・公式 MCP・API レート制限](./artifacts/kanban-plane-free-limits-cli-mcp-2026-09-04.md)。

反映先。plugin のスクリプト。API key の置き場は settings.json の env（確定 12）。

### 確定 16 未着手の一覧の一括取り込みも、同じスクリプトで 1 件ずつ API を叩く

結論。`todo.md` の 27 件前後の取り込みは、確定 15 で作るスクリプトを使って 1 件ずつ作る。
Plane Compose（`pipx install plane-compose`）は入れない。

決めなかった範囲。取り込む前に差分を見る手段は決めていない。
Compose の `plane diff` に相当するものが要るなら、スクリプト側で作る。

決め手。この 1 回のために pipx の依存を増やさない。
Compose を採る利点（親子と依存を YAML でまとめて書け、push 前に差分を見られる）は、
27 件前後の 1 回限りの取り込みでは、依存を 1 つ増やすコストに見合わない。
確定 15 のスクリプトが既にあるので、追加で書くものが無い。

出典。ccm-f069 の設問 3 への回答（2026-09-04）。実文は
[実文 22](./artifacts/kanban-requirements-origin.md#実文-22-ccm-f069-への回答)。

反映先。`todo.md` の取り込み手順（確定 9 の 1 項目 1 枚）。plugin のスクリプトの要件。

### 確定 17 repo と project を 1 対 1 で対応させる

結論。1 つの repo を 1 つの Plane project にする。全 repo を 1 project へまとめる案と、
能動的な repo だけ project にする案は採らない。

決めなかった範囲。repo が無い作業（dotfiles の設定変更のような、どの repo にも属さないもの）を
どこへ入れるかは決めていない。project を新しく作るのはいつかも決めていない。

決め手。repo ごとに独立した board が手に入り、state と label を repo の事情に合わせて変えられる。
Plane では State・Label・Cycle・Module がすべて project の中に閉じるので、
1 project へまとめると board の列を repo ごとに定義できなくなる。
横断の board を得る利点は、確定 19 で横断を見ないと決めたことで消えた。

出典。ccm-f074 の設問 1 への回答（2026-09-05）。実文は
[実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。
軸が project に閉じることの根拠は
[Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md)の 2 節。

反映先。plugin が持つ repo と project id の対応表。project の作成手順。

### 確定 18 セッションごとの絞り込みは Label に載せる

結論。セッションを表す軸は Label にする。Cycle と Module は使わない。

決めなかった範囲。label の名前の付け方（セッション id をそのまま使うのか、日付を足すのか）と、
増え続けた label をいつ消すかは決めていない。確定 10 が残した掃除の論点がそのまま残る。

決め手。1 つの work item が複数のセッションで触られることがあり、それを表せるのは
複数持てて上限の無い Label だけ。Cycle は 1 work item に 1 つしか付かず、
別の cycle へ入れると前の所属が消える。Label は work item の作成と同じ 1 回の
API 呼び出しで付けられ、Cycle と Module は専用の endpoint がいる。

出典。ccm-f074 の設問 2 への回答（2026-09-05）。実文は
[実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。
確定 10 が定めた「kanban の UI で絞れること」を、Label で満たす形になる。

反映先。plugin が work item を作るときに付ける label。label の掃除の手順（未定）。

### 確定 19 project をまたいだ一覧は作らない

結論。repo をまたいで work item を見る手段は用意しない。見るのは常に 1 つの project のボードだけ。
推奨した workspace view の表も、plugin のスクリプトが作る横断の一覧も採らない。

決めなかった範囲。横断で見たい場面が実際に出てきたときにどうするかは決めていない。
Cloud Free で横断を board の形で見る手段は無いので、そのときは表か、
plugin のスクリプトが作る一覧のどちらかに戻ることになる。

決め手。ユーザーが横断を見ないと選んだ。これにより確定 17 の
「1 repo = 1 project にすると横断の board が作れない」という短所が効かなくなる。

出典。ccm-f074 の設問 3 への回答（2026-09-05）。実文は
[実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。

反映先。plugin のスクリプトに横断の一覧を作らない。workspace view の設定をしない。

### 確定 20 既存の workspace の project は消して作り直す。消す作業はユーザーが行う

結論。いま使っている Plane の workspace をそのまま使い、その中の project を消して作り直す。
新しい workspace は作らない。**消す作業と引越しはユーザーが行う。Claude は既存の project も
work item も消さない。**

決めなかった範囲。引越しの時期と、引越し後にどの project が残るかは決めていない。
既存の workspace の中身は見ていない。

決め手。workspace を 1 つに保つと slug が 1 つに決まり、plugin の設定が 1 行で済む。
workspace の一覧を返す API が v1 に無いため、workspace が 2 つあるとどちらを見るかを
設定で固定することになる。破棄の許可は「場合によっては今 plane で使っている内容は
破棄してもよい」という留保付きで出ており、消す判断と作業はユーザーの側にある。

出典。ccm-f074 の設問 4 への回答（2026-09-05）。実文は
[実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。
回答に「勝手に消さないでね。こっちで引越しをする」という条件が付いている。

反映先。plugin のスクリプトに削除の経路を作らない。導入の手順は、
ユーザーの引越しが終わったところから始める。

### 確定 21 複数セッションにまたがる仕事は親 work item と sub work item で束ねる

結論。段階が続く仕事は、束ねそのものを 1 枚の work item にして、その下に sub work item を置く。
Module と Cycle は束ねに使わない。

決めなかった範囲。入れ子を何段まで作るかは決めていない（Plane 側の段数の上限も未確認）。
親子は v1 API では同一 project に限られるため、repo をまたぐ仕事をどう表すかも決めていない。

決め手。束ねそのものがカードになるので、段階の状態・担当・説明を board の上で持てる。
Module は複数持てるが束ね自体がカードにならず、状態も担当も持てない。
Cycle は 1 work item に 1 つしか付かず、確定 18 の Label と役割が重ならないとしても、
期間で区切る道具なので段階の表現には合わない。

出典。ccm-f074 の設問 5 への回答（2026-09-05）。実文は
[実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。
親子が v1 API で同一 project に限られることの根拠は
[Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md)の 5.5 節。

反映先。plugin が work item を作るときの `parent` の扱い。`todo.md` の取り込みで親を作るかどうか。

### 確定 22 board の列は Plane の既定の state をそのまま使う

結論。project 作成時に入る Backlog / Todo / In Progress / Done / Cancelled の 5 つを
そのまま列にする。Claude の作業に固有の state（回答待ち・レビュー待ちなど）は足さない。
運用してみて変える必要が出たら、そのときに変える。

決めなかった範囲。どうなったら変えるかの条件は決めていない。
変えるときに全 project の state を揃える手順も決めていない。

決め手。ccm-f074 の設問 6 は「デフォルトの state 一般的じゃなくない？」として保留された。
これは ccm-f074 の本文が、列に出る state の名前ではなく内部の group
（Backlog / Unstarted / Started / Completed / Cancelled）を挙げていたことによる。
実際に列に出るのは Backlog / Todo / In Progress / Done / Cancelled で、一般的な並びになる。
state の名前は後から `PATCH` で変えられるので、いま決め切らなくても取り返しがつく。

出典。ccm-f074 の設問 6 への回答（2026-09-05）と、その後のやり取り
「state は一旦それをデフォルトとして、運用していく中で変更があったら変えよう」。
実文は [実文 23](./artifacts/kanban-requirements-origin.md#実文-23-ccm-f074-への回答)。
既定の state の根拠は
[Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md)の
「project 作成時に入る既定の state」。

反映先。plugin が work item を作るときに引く state の名前。project の作成手順（state を触らない）。

### 確定 23 セッションの軸を Module に置き換える案は採らない（確定 18 を維持）

結論。セッションごとの絞り込みは Label のままにする。Module へ移す案は採らない。

決めなかった範囲。Module を別の用途（機能単位の束ねなど）で使うかは決めていない。
Label が増え続けたときの掃除は、確定 18 と同じく未定のまま。

決め手。Module が Label に対して持つのは、束ね自体が進捗と開始日・目標日を持つことと、
Modules の一覧画面と Timeline に出ること。セッションは「誰がいつ触ったか」の記録で、
まとまりとして完了させる作業ではないため、この 2 つが効かない。
加えて Module は work item の作成とは別の呼び出し
（`POST /modules/{module_id}/module-issues/`）と、セッション開始時の Module 作成が要る。
セッションは 1 日に何本も立つので、進捗バーつきで一覧に並ぶ Module は数が増えたときの
見え方が Label より重くなる。

出典。2026-09-05 のやり取り。「なるほど、ならどのセッションが実行しているかは
module の方が相性良さそうに思えた」という提案に対し、上の比較を示したうえで
「label のままで」と決まった。

反映先。確定 18 のまま。plugin のスクリプトは Module を触らない。

### 確定 24 plugin の名前は `plane-kanban`

結論。cc-marketplace に新設する plugin の名前は `plane-kanban`。

決めなかった範囲。skill の名前と、スクリプトのファイル名。

決め手。ccm-f086 の設問 1 で推奨どおり。Claude が示した根拠は、サービス名 + 対象の形が `github-pr` と同じ命名になり、
Plane に依存していることが名前から読めること。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/`（新設）、`.claude-plugin/marketplace.json`、README.md、CLAUDE.md の plugin 一覧。

### 確定 25 構成は作業手順 skill だけ。hook は持たない

結論。plugin は作業手順 skill 1 本だけを持ち、SessionStart hook も Stop hook も agent も持たない。
skill は work item の一覧・作成・state の変更と、いまのセッションの label を付ける操作を 1 本で持つ。
`todo.md` の取り込みは同じスクリプトの 1 回限りの使い方で、別の skill にしない。
各タスクの管理と詳細は Plane に寄せるが、いまどのタスクをどういう目的で進めているかという背景は、
当面は session plugin の引き継ぎ資料が持つ。

決めなかった範囲。session plugin との疎結合の形と、依存をどこまで埋め込むか。
session 側の skill の内容を変えるときに決める。SessionStart hook を後から足すかどうか。

決め手。ccm-f086 の設問 2 で、推奨（作業手順 skill 1 本 + SessionStart hook 1 本）を採らずに選んだ。
補足は「各タスクの管理や詳細は plane, kanban に寄せるが、今その中のどれをどういう目的で進めているのかなどの
背景はまだ session plugin 管理にするということでいいと思う」。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/skills/` の構成（skill 1 本）。`hooks/` は作らない。
session plugin の handover skill は当面変えない。

### 確定 26 スクリプトは bash + curl + jq で書く

結論。plugin のスクリプトは bash + curl + jq で書く。work item の説明（`description_html`）の変換は、
段落と改行だけを扱う。

決めなかった範囲。markdown の見出しや箇条書きの記法を Plane 上で再現するか。

決め手。ccm-f086 の設問 3 で推奨どおり。既存の plugin と同じ規約で読めることによる。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/scripts/`。`.claude/rules/coding.md` の Bash 規約が当たる。

### 確定 27 対応 CodingAgent は最初から Claude Code + Codex

結論。plugin は最初から Claude Code と Codex の両方で使える形にし、両方で検証してから公開する。
Codex 用には skill の入口と、Codex で同じ発火点を作る実装（adapter）を足す。

決めなかった範囲。skill の入口を共通の SKILL.md にするか CodingAgent 別にするか
（`docs/cross-client-architecture.md` の A / B）。hook を持たないので hook の実装方式の選択は無い。

決め手。ccm-f086 の設問 4 で、推奨（Claude Code only で始める）を採らずに選んだ。理由は述べていない。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/` の `.claude-plugin/plugin.json` と `.codex-plugin/plugin.json`、
`.agents/plugins/marketplace.json`、README の対応 CodingAgent。

### 確定 28 repo と project の対応は、project の name を repo のディレクトリ名に揃えて API で引く

結論。ユーザーが project の name を repo のディレクトリ名に揃える。スクリプトは project の一覧 API で
name が一致する project の id を引き、`CLAUDE_PLUGIN_DATA` に保存する。対応表は持たない。

決めなかった範囲。保存したファイルの形式と、保存した id が古くなったとき（project を作り直したとき）の引き直し方。

決め手。ccm-f086 の設問 5 で推奨どおり。repo が増えても plugin 側に手を入れないことによる。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/scripts/` の project 解決の処理。保存先は `CLAUDE_PLUGIN_DATA`。

### 確定 29 project が無い repo では、ユーザーが `init` を呼んだときだけ作る。skill は無ければ案内する

結論。project の作成は、ユーザーが skill の `init` の操作を呼んだときだけスクリプトが行う。
どの操作でも自動では作らない。skill を読んだときに対応する project が無ければ、
skill は `init` で作れることを案内する。

決めなかった範囲。identifier の決め方（ユーザーが指定するか、repo 名から機械的に作るか）。

決め手。ccm-f086 の設問 6 で推奨どおり。補足は「skill を読んだ時に project がなければ案内するみたいなことは入れたい」。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/skills/` の SKILL.md（project が無いときの案内）と `init` のスクリプト。

### 確定 30 セッションの label は `session:<日付>-<セッション id の先頭 8 桁>`

結論。セッションを表す label の名前は `session:<日付>-<セッション id の先頭 8 桁>`。
スクリプトは作る前に label の一覧を引き、同名があればそれを使う。

決めなかった範囲。label の色。増え続けた label をいつ消すか（確定 18 が残した論点のまま）。

決め手。ccm-f086 の設問 7 で推奨どおり。Plane の UI で日付順に読め、古い日付の label をまとめて消せることによる。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/scripts/` の label を付ける処理。

### 確定 31 `todo.md` は Claude が書いた取り込み一覧から、スクリプトが 1 件ずつ work item にする

結論。Claude が `todo.md` を読み、依頼ごとの題名・本文・親を取り込み一覧のファイルに書く。
スクリプトはその一覧に従って work item を 1 件ずつ作り、作成した work item の id を一覧に書き戻す。
途中で失敗しても、再実行で作成済みの行を飛ばせる。
下に独立した依頼を持つ 3 つの見出し（「cc-marketplace への依頼」「norm-refit と無関係で、引き継ぎの復元タスクに
長く残っていたもの」「efso-idp セッション（2026-09-02）からの依頼」）は親 work item にし、その依頼を sub work item にする。

決めなかった範囲。取り込み一覧のファイルの形式と置き場。

決め手。ccm-f086 の設問 8 で推奨どおり。見出しの階層だけでは依頼と節を区別できず、
コードブロック内の見出しを誤検出することによる。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`plugins/plane-kanban/scripts/` の一括作成の処理。`todo.md` の取り込み手順。

### 確定 32 取り込んだ後の `todo.md` は削除し、以後の依頼は work item として作る

結論。取り込みが終わったら `todo.md` を削除する。以後、他のセッションからの依頼は plugin のスクリプトで
work item として作る。

決めなかった範囲。plugin を入れていない環境のセッションから依頼を出す手段。

決め手。ccm-f086 の設問 9 で推奨どおり。同じ依頼が 2 か所にある状態を作らないことによる。

出典。ccm-f086 への回答（2026-09-15）。実文は
[実文 24](./artifacts/kanban-requirements-origin.md#実文-24-ccm-f086-への回答)。

反映先。`todo.md` の削除（取り込みの後）。他 repo のセッションへの依頼の出し方の案内。

### 確定 33 kanban 用に新しい workspace を作り、既存の workspace は残す（確定 20 を上書き）

結論。kanban 用に Plane の workspace を新しく作る。既存の workspace とその project はそのまま残し、消さない。
確定 20 の「既存 workspace の project を消して作り直す」を上書きする。plugin の設定に書く workspace slug は
新しい workspace のもの。

決めなかった範囲。新しい workspace の名前と slug。既存の workspace を将来消すかどうか。

決め手。Free plan でも workspace を複数作れると確かめられたため。公式 docs に「Create additional workspaces」の
手順があり、数の上限は書かれていない（`kanban-plane-cloud-vs-ce-2026-09-03.md` の 5 節）。
ユーザーの発言は「free で複数作れるなら kanban 用に新しい workspace を作るで ok」。

出典。ユーザーとの対話 2026-09-15（ccm-f086 の補足「plane って free plan で workspace 複数作れたっけ？
作れるなら既存の workspace はそのままに kanban 用には新規で作ればいいかと思った」と、その後の返答）。

反映先。確定 20 の「消す作業と引越し」は不要になる。導入の手順は、ユーザーが新しい workspace を作り、
API key を発行し、slug と API key を settings.json の env に書くところから始める。

### 確定 34 epic のような束ねは親 work item で表す。Module は併用の候補に残す

結論。Jira の epic に当たる、複数のタスクを束ねる単位は、親 work item とその下の sub work item で表す。
epic の中のタスクがさらに子タスクを持つ形（3 段以上）も同じ仕組みで作る。
Module は epic の代わりには使わず、複数の epic を横切る別の切り口が要るときに親子と併用する候補として残す。
確定 21 を epic の用途まで広げたもの。

決めなかった範囲。UI と API が受け付ける入れ子の段数（docs に記載なし。データモデルでは `Issue.parent` が
work item 自身への参照で、段数の制限は無い）。新しい workspace と API key ができたら実際の API で確かめる。
Module を併用する場面。

決め手。Plane の Epic は work item type の 1 つで、docs は「An epic is still the parent layer above individual work items.
Work items still link to an epic through the Parent field.」と書く。Free では型が使えないだけで、
「Without hierarchy, any work item can be a sub-work item of any other, regardless of type.」のとおり親子は使える。
親 work item は 1 枚のカードなので、epic 自体が state・担当・説明を持ち board に出る。Module は
「A module can span multiple Cycles」の説明どおり cycle をまたぐ仕事を束ねる器で、カードではなく state も担当も持たない。
ユーザーは「ok」と答えた。

出典。ユーザーとの対話 2026-09-15。docs の引用は
[Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md)の 1.4 節・2.4 節・2.6 節。
`Issue.parent` の定義は同 2.9 節。

反映先。plugin `plane-kanban` の work item 作成の `parent` の扱い（段数を制限しない）。
norm-refit を移すときの構造（norm-refit を親、段階を sub work item）。

### 確定 35 API key と workspace slug は macOS の Keychain からだけ読む

結論。plugin のスクリプトは Plane の Personal Access Token と workspace slug を macOS の Keychain
（service `plane-kanban-api-key` と `plane-kanban-workspace-slug`）から `security find-generic-password` で読む。
環境変数や `settings.json` の `env` には置かず、環境変数の分岐も持たない。
plugin は macOS 限定で、GUI にログインして login keychain が開いていることを前提にする。この前提は README の Requirements に書く。

決めなかった範囲。Claude が `security` を直接呼んで鍵を読むのを止める仕組み（Claude Code の permission の deny を置くか、
コンパイル済みの helper を Keychain の ACL の唯一の app にするか）。Linux で使う必要が出たときの手段。

決め手。ユーザーの発言「keychain only はだめなん？分岐とか secrets.fish とか使わず」と、
「macOS 限定、GUI が必要で ok, requierments にちゃんと書いておいて」。Claude が示した比較は、
`settings.json` の `env` は 0644 の平文に鍵が残る、dotfiles の `secrets.fish` 経由はシェルを経由しない起動で空になる、
Keychain を直接読めば両方の問題が無い、というもの。

出典。ユーザーとの対話 2026-09-15（PR #28 の Diffo レビュー中）。

反映先。`plugins/plane-kanban/scripts/lib/plane.sh` の `plane_require_env`、README の Requirements と
「Keychain に入れる 2 項目」、SKILL.md の前提、`tests/fake-curl/security`（PR #28 の `6cae20d`）。

### 未確定 板を既製のサービスに任せ、Claude 側をラップする構成

結論は出ていない。Symphony が Linear の板を読むスケジューラであることを受けて、
Linear や Plane をデータソースとして使い、Claude やエージェントとのやり取りを
別の仕組みでラップする案が出た。ラップする側は自前実装でも plugin / skill でもよいとされている。

この構成を採ると、要件の置き場が 2 つに分かれる。

- 板に要るもの: kanban の UI、親子、依存、カードの CRUD の口、セッションをまたいで残る
- Claude 側に置けるもの: セッションとカードの対応、作業場所の記録、その絞り込み

分岐点は要件 3（カードに名前の付いた独自の属性）をどちらに置くか。
板に置くなら Linear と Plane Community Edition は落ちたままになる
（Linear はユーザー定義のカスタムフィールドを持たず、Plane CE は Pro 以上の機能）。
確定 10 のとおり、板側でもラベルで絞り込みが成立するため、この 2 つは板側の手段で候補に戻る。
代償は、状態が板と手元の 2 か所に割れることと、
Claude 側に置いた属性を人が UI で見られなくなること。

出典。2026-09-03 の発言。実文は
[実文 19](./artifacts/kanban-requirements-origin.md#実文-19-板を既製のサービスに任せclaude-側をラップする案)。

反映先。未定。要件 3 の置き場が決まってから比較を組み直す。

## 作業メモ

### Orca の判定

`kind: git` で登録した repo ではカード 1 枚が git worktree 1 つに対応し、
カードのスキーマは固定で独自の属性を足せず、依存関係を持たない。
確定 4 の 3 件のうち 2 件を満たさないため、Orca をそのまま使う道は閉じた。
判定の根拠は ccm-f066 の説明 3 にある。

親子だけは `orca worktree create --parent-worktree` で 1 段持てる。

### 候補の範囲

データの実体が Markdown である必要は無い。UI から操作できることが、
人が読める形をデータ側に求める理由を消している。
自己ホストできるかどうかも、候補を落とす条件ではなく差として記録する。
Jira・Linear・Plane のような製品レベルのサービスも候補に入る。

Claude が候補の洗い出しを依頼するとき、SaaS を除外する条件を自分で付けていた。
これは要件ではなかったので取り消した。
実文は [実文 17](./artifacts/kanban-requirements-origin.md#実文-17-データの形は問わない製品レベルのサービスも候補に入る)。

エージェント向けの kanban も候補に戻した。前回それらを外した理由は
「1 カード = 1 実行単位だから」で、これはカードの粒度についての判定になる。
いま効く条件は親子・依存・独自の属性・UI なので、外した理由が条件と噛み合っていない。
戻すのは UI がリッチなもの（cline/kanban、Symphony ほか）。
Orca だけは、依存関係を持たずカードに独自の属性を足せないことが確定しているので外したままにする。

外部のサービスを採る場合、決めていないことが 2 つある。タスクの内容が外部へ出ることの可否と、
Claude が API を叩くための token の置き場。後者は
`.claude/rules/plugin-design.md` の「環境固有の値は settings.json の env に置く」が当たる。

### Plane の階層構造の調査（2026-09-04）

公式ドキュメントと Community Edition のソースで裏を取った。実文は
[Plane の階層構造とデータモデル](./artifacts/kanban-plane-hierarchy-2026-09-04.md)。
構成の設計に効くのは次の 4 点。

- 必須の階層は Workspace > Project > Work item > Sub work item の 1 本。
  Cycle・Module・Label・State はすべて Project にぶら下がり、project の境界を越えない
- Cloud Free に project 横断の kanban は無い。Board layout が付くのは project の work items 画面と
  project view だけで、workspace view は spreadsheet 固定。teamspace view は Pro 以上。
  ただし workspace view が Cloud Free に含まれるかの明文は公式のどこにも無い
- work item 数・project 数の上限は公式資料にも Community Edition のコードにも無い。
  確定 13 を覆す材料は出なかった
- v1 API に view と workspace 一覧が無い。work item の一覧は project をまたげず、
  親子は同一 project に限られる（Community Edition の serializer。Cloud は未確認）

公式資料どうしの矛盾 5 件と未確認 11 件を、実文の側に残してある。

### 次にやること（2026-09-15 更新）

サービス・エディション・接続手段・Plane の中の構成は確定 11〜23 で、plugin の設計は確定 24〜32 で決まった。
残るのは workspace の扱いの見直しと、実際に作る作業。

1. ユーザーが kanban 用の workspace を新しく作り、API key を発行する（確定 33）。
   できたら、親子の入れ子の段数を API で確かめる（確定 34 の決めなかった範囲）
2. plugin `plane-kanban` を作る（確定 24〜32）。実装は PR #28（2026-09-15）。API key と workspace slug は settings.json の env。
   マージして導入したら、実際の API で `init-project.sh` と `create-work-item.sh` を試す
3. `todo.md` の依頼を work item として取り込む（確定 31）。取り込んだら `todo.md` を消す（確定 32）
4. norm-refit の計画とタスクを kanban へ移すかを決める。ccm-f086 の補足でユーザーが移したいと述べた。
   Cloud Free で使える束ねは親 work item と sub work item（確定 21）と Module で、
   Plane の Epic は work item type の 1 つで Pro 以上（`kanban-plane-hierarchy-2026-09-04.md` 1.4 節）。
   移すなら、`notes/norm-refit-plan.md` を `notes/artifacts/` へ移す 2026-09-15 の確定
   （`notes/norm-refit.md`）との関係も決め直す

### 落とした候補の理由

cline/kanban はカードのスキーマが固定で、親を指すフィールドもラベルも任意のキーも無い
（`src/core/api-contract.ts` の `runtimeBoardCardSchema`）。
列は `z.enum(["backlog", "in_progress", "review", "trash"])` の 4 つ固定で、
ユーザーが定義できない。カードの単位は 1 タスク = 1 worktree で、
README が "Each task card gets its own terminal and worktree, all handled for you automatically." と書く。
Research Preview。依存は `fromTaskId` / `toTaskId` で持っている。UI は落ちる理由になっていない。

Symphony は kanban の UI を持たない。README の説明が
"Symphony monitors a Linear board for work and spawns agents to handle the tasks" で、
板そのものは Linear 側にある。カードの CRUD もできない。
この構成が、上の「未確定」の案の先例になる。

### UI のスクリーンショット

候補 8 件（OpenProject / YouTrack / Wekan / Kandev / cline-kanban / Vikunja / Planka / Plane）の
kanban のボードが写った画像を、公式サイト・公式ドキュメント・公式 repo から取得した。
保存先はセッションの scratchpad で、次のページへ貼り込む。

2 件は静止画が公開されておらず、公式の GIF からフレームを抜いた加工物になる
（cline-kanban と Planka）。Wekan は公式に存在する唯一のボード画像で、
右端をポップアップが覆っている。

### 詰めていない構想

session plugin の handover をカードで代替できるのではないか、という話が出ている。
タスクに関する依存の情報はカードへ書き、書き込む先のカードが無い情報だけを handover に残す形。
fork した先での handover の同時書き込みや重複のリスクが減る。
本人が「詳細はまた詰めたい」と述べているので、いまは決めない。
実文は [実文 16](./artifacts/kanban-requirements-origin.md#実文-16-ccm-f066-への回答) の補足 3。

成果物をカードへ紐づける構想もある。norm-refit の進捗レポートを親カードに紐づければ、
claude-html-communication の index に必ずしも置かなくてよくなる、という形。
これも詳細は決めていない。

### 全 repo を 1 サービスに載せる前提での上限と切り分け（2026-09-03）

ccm-f068 は 250 件の見込みを立てず、repo を Linear のどの単位に対応させるかも決めていなかった。
全 repo を 1 サービスに載せる前提（確定 3 の優先条件の範囲内）で、候補 6 件を公式の一次情報で確かめ直した。
実文は次の 3 本。

- [Linear Free プランの制限と repo の対応](./artifacts/kanban-linear-free-plan-2026-09-03.md)。
  250 件は archive 済みを除く全 issue に掛かり、閉じた issue も自動 archive まで数える。
  超えると新規作成が止まる。Project は Team をまたげ、数の上限は記載なし
- [Plane Cloud Free と Community Edition の差](./artifacts/kanban-plane-cloud-vs-ce-2026-09-03.md)。
  公式が「Community Edition は Cloud Free と機能同等」と明記。Cloud Free の差は席数 12 と AI credits。
  work item 数・project 数の上限は Cloud Free に記載なし、Community Edition は無制限と明記
- [OpenProject / YouTrack / Wekan / Beads の切り分け単位と上限](./artifacts/kanban-candidates-repo-units-2026-09-03.md)。
  4 件とも件数の上限は記載なし。横断の kanban を公式に持つのは YouTrack Server と Beads + bv

250 件の見込み（観測、2026-09-03）: `todo.md` の cc-marketplace 宛の依頼 27 件前後 + 復元タスク 13 件、
html-communication の index に出る project は 9 個。cc-marketplace だけで 40 件前後が板に乗る。

ccm-f068 はこの前提で同名上書きで改稿する（回答を受けていないため）。推奨は Linear から Plane Cloud Free へ。
