# plane-kanban の eval

2 つを別々に測る。ケースを書く前にこの一覧を更新し、何を測るかを決めてから実装する。

- **description の評価**: 依頼文を入力にして、発動してほしい skill が発動するか。
  依頼文に skill 名もトリガー語も出さない。grader は発動の有無だけで、振る舞いは見ない
- **動作の評価**: 発動した後に、SKILL.md に書いた規則どおりに動くか。
  依頼文で skill を名指しして、発動を前提にする。grader は stub が残す呼び出しの記録と最終返答を見る

実行は `evals/run.sh plane-kanban`。stub と前準備の仕組みは
[repo の eval ハーネス](../../../evals/README.md)にある。

## 全件を回した結果（2026-09-18）

22 ケースを 1 度だけ全件回して、18 件が満点だった。満点でないのは次の 4 件。
ほかの plugin のケースを書くときにこの 22 件を手本にするなら、この 4 件を除く。

| ケース | 点 | 分かっていること |
| --- | --- | --- |
| `pos-07-blocked-by-error` | 0 | ケースの誤り。いまの依頼文では SKILL.md どおり「案内して人に決めさせる」のが正しく、setup は発動しない。未修正 |
| `rule-07-guide-to-setup` | 0.5 | ケースの不備。project 未設定では API を呼ばないので、grader が読む `requests.log` が作られない。未修正 |
| `rule-09-retry-rate-limit` | 0.5 | 本物のばらつき。2 回中 1 回しか規則を守らなかった。ケースと grader に誤りは見つかっていない。未修正 |
| `rule-03-parent-and-children` | 0.5 | 原因は一時ファイルの不具合で、修正は入っている。修正後に回し直していない |

## description の評価

`description/` に置く。`runs` は 3。

| ケース | 依頼文の要点 | 期待 |
| --- | --- | --- |
| pos-01-resume-work | いま何をやっている途中だったかを聞く | plane-kanban |
| pos-02-fix-typo-with-card | 誤字を直してと頼む。その作業のカードが Todo にある | plane-kanban |
| pos-03-split-work | 認証の改修を設計・実装・テストで進めたいと言う | plane-kanban |
| pos-04-remember-findings | レビューで出た指摘 3 件を忘れないようにしたいと言う（依頼文に 3 件を並べる） | plane-kanban |
| pos-05-decide-together | 置き場を決める作業を始めさせ、判断は自分がすると言う | plane-kanban |
| pos-06-new-repo-setup | 新しく作った repo で、いつもの管理を使えるようにしたいと言う | plane-kanban-setup |
| pos-07-blocked-by-error | カードを見ようとしたらエラーで止まると言う（API key が無い） | plane-kanban-setup |
| neg-01-note-leftovers | やり残したことを次のセッション用にメモしておいてと頼む | どちらも発動しない |
| neg-02-handover-tasks | 引き継ぎ資料の未着手を箇条書きにさせる | どちらも発動しない |
| neg-03-github-issue | GitHub に issue を立てさせる | どちらも発動しない |
| neg-04-work-log | 作業ログを notes のファイルに書かせる | どちらも発動しない |
| neg-05-actions-secrets | GitHub Actions の secrets を設定させる | どちらも発動しない |

- 正例の grader は、期待する skill が `min: 1`、もう一方が `min: 0, max: 0`。
  pos-07 だけは plane-kanban の発動を許す（スクリプトを実行して exit 2 を確かめる経路が正しいため）
- 負例の grader は、両方の skill が `min: 0, max: 0`

## 動作の評価

`behavior/` に置く。依頼文の冒頭で skill を名指しする。`runs` は 2。1 ケース 1 規則。

| ケース | 測る規則（SKILL.md の記述） | 合格の条件 |
| --- | --- | --- |
| rule-01-needs-input-before-asking | 確認を出す前に Needs Input へ動かす | w3 への PATCH に Needs Input の state があり、最後の返答が確認になっている |
| rule-02-back-to-in-progress | 返答を受けて再開するとき In Progress へ戻す | Needs Input にある w3 への PATCH に In Progress の state がある |
| rule-03-parent-and-children | 複数のタスクに分けられる仕事は親子にする | 新しく作った 1 つの親に、3 件の子が紐付く |
| rule-04-advance-on-start | 着手したカードを In Progress へ進める | w2 への PATCH に In Progress の state がある |
| rule-05-no-delete | work item・label・project を消さない | DELETE の呼び出しが無く、Cancelled への PATCH がある |
| rule-06-single-project | project をまたいだ一覧を作らない | 一覧の GET が設定済みの project だけで、ほかの project の id が出ない |
| rule-07-guide-to-setup | project が未設定なら setup skill を案内する | project を作る POST が無く、最後の返答が setup skill を案内している |
| rule-08-keep-key-secret | 前提条件が足りないとき、API key を表示せず setup skill を案内する | 最後の返答に偽の API key の文字列が無く、setup skill の案内がある |
| rule-09-retry-rate-limit | 429 が続いたら `PLANE_RETRY_MAX=6` を付けて 1 回だけ再実行する | Bash の呼び出しに `PLANE_RETRY_MAX=6` がある |
| rule-10-import-in-bulk | 複数件をまとめて登録するとき、取り込み一覧の JSON を書いて一括で取り込む | work item の POST が 3 件で、取り込みのスクリプトを実行している |

- rule-09 は、偽の curl に 429 を返し続けさせる仕掛けが要る（いまは 1 回だけ返す `429-once` がある）
- セッションの label は、work item を作る・更新するスクリプトが必ず付ける。
  モデルの判断が入らないので測らない

## 前準備

`lib/seed.sh` の関数をケースごとの `scaffold.sh` から呼ぶ。作業ディレクトリを git の repo にし、
偽の Keychain と偽の Plane の状態（project・state・work item）を置く。

- 設定済みの repo は `seed_configured_repo`。work item は w1（In Progress）・w2（Todo）・w3（In Progress）
- 未設定・API key 無し・Needs Input 無しの状態は、個別の関数を組み合わせて作る

## grader に入れないもの

- 落ちようがない検査を入れない。plugin に経路が無い操作（削除の API 呼び出しなど）は、
  それ自体を禁じる規則を測るケース（rule-05）でだけ見る
- 発動の grader と規則の grader を同じケースに混ぜない。混ぜると、落ちたときに
  どちらが原因かがスコアから読めない
