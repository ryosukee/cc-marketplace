# github-pr の eval

2 つを別々に測る。ケースを書く前にこの一覧を更新し、何を測るかを決めてから実装する。

- **description の評価**: 依頼文を入力にして、発動してほしい skill が発動するか。
  依頼文に skill 名もトリガー語も出さない。grader は発動の有無だけで、振る舞いは見ない
- **動作の評価**: 発動した後に、SKILL.md に書いた規則どおりに動くか。
  依頼文で skill を名指しして、発動を前提にする

実行は `evals/run.sh github-pr`。stub と前準備の仕組みは
[repo の eval ハーネス](../../../evals/README.md)にある。

## 全件を回した結果（2026-09-21）

27 ケース・69 実行を `-j 6` で 3 回回した。1 回あたり約 52 分・$27.5。
27 ケースすべてが満点を記録している。落ちたのは延べ 4 件で、内訳は次のとおり。

| 回 | 落ちたケース | 点 | 切り分け |
| --- | --- | --- | --- |
| 1 | `rule-10-confirm-before-fix` | 0.80 | stub の不具合。子セッションで `diff` が効かず `target_dirty` が常に `yes` になっていた。直して 3/3 |
| 1 | `rule-06-checklist-unchecked` | 0.83 | 本文の書き方のばらつき。直後の 3 回はすべて満点 |
| 2 | `rule-10-confirm-before-fix` | 0.90 | ケースの不備。判定基準が「案を 2 つ以上挙げる」まで求めていた。SKILL.md の規則に合わせて直して 3/3 |
| 3 | `rule-02-draft-by-default` | 0.75 | ばらつき。PR を作らずに終えた実行が 2 回中 1 回。直後の 3 回はすべて満点 |

1 回の全件実行で 27 ケースすべてが満点になった回は無い。毎回 1 件だけ、しかも別のケースが下がる。
回し直すたびに満点の組み合わせは変わるので、全件満点の回が出るまで回すことはしない。

## GitHub へ接続しない

この plugin は `gh` で GitHub の API を呼ぶ。eval では本物の GitHub へ 1 度も接続しない。
次の 4 つで塞ぐ。

- `tests/fake-gh/gh` が `gh` を完全に置き換える。本物の `gh` へ渡す経路を持たず、
  知らないサブコマンドと知らない endpoint は exit 3 で落ちる。
  `evals/env.sh` がこのディレクトリを PATH の先頭に入れる
- 前準備が作る repo の `origin` は、同じ一時ディレクトリに作った bare repo を指す。
  `git push` はそこへ書き込み、外へ出ない
- `allowed_tools` は `[Read, Glob, Grep, Skill, Bash, Write, Edit]` だけにする。
  MCP のツールが入らないので、`create/SKILL.md` の MCP フォールバック（`mcp__github__create_pull_request`）は
  子セッションから呼べない
- 子セッションの sandbox が外向きの通信を落とす（`deny network-outbound`。2026-09-18 の実測）

`claude plugin eval` 自身も使うコマンド（`security` など）を差し替えるときは、
対象以外を本物へ渡す形にする。`gh` ではそれをしない。
`gh` を呼ぶのは github-pr だけで、通す必要のある呼び出しが無い。

## stub が残す記録

偽の `gh` は呼び出しを 2 つのファイルに残す。作業ディレクトリの `.fake-gh/` の下に置く。
`seed_repo` が `.git/info/exclude` に `.fake-gh/` を書くので、この記録自体は `dirty` を動かさない。

stub は判定に外部コマンドを使わない。子セッションの sandbox では `diff` や `grep` が効かず、
失敗が「差分あり」と同じ結果になって、原因が記録からは読めなくなる。
比較は bash の文字列比較で済ませ、使うのは `git` と `jq` だけにする。

`requests.log` は 1 行 1 呼び出しで、次の形にする。引数の改行は `\n` の 2 文字に置き換えて 1 行に収める。

```text
id=<連番> method=<GET|POST|PATCH|DELETE> kind=<下の値> pr=<番号か -> head_ref=<値か -> fields=<値か -> target=<コメント id か -> content=<値か -> paginate=<yes|no|-> first=<yes|no|-> draft=<yes|no|-> signed=<yes|no|-> pushed=<yes|no> committed=<yes|no> dirty=<yes|no> target_dirty=<yes|no|-> fixed=<yes|no|->
```

判定はすべて解析済みのフィールドで行う。生の引数は同じ行に置かず、`commands.log` へ分ける。
同じ行に置くと、grader の正規表現が PR の本文やタイトルに入っている同じ文字列に一致する。
`commands.log` は落ちたケースを人が読むためだけに使い、grader の対象にしない。

`kind` は stub がサブコマンドと URL から決める。値は重ならない。

- `pr-create`・`pr-edit`・`pr-list`・`pr-view`・`pr-merge`（`gh api` の `/merge` と
  GraphQL の `mergePullRequest` を含む）
- `fetch-reviews`・`fetch-pull-comments`・`fetch-issue-comments`。
  対象のコメントを集める 3 種の URL への GET は、実行のどの時点でもこの値にする
- `reply`（`--input` の JSON の `in_reply_to`、`-F in_reply_to`、`/comments/<id>/replies` の POST）
- `reaction-get`（`/reactions` の GET）・`reaction-post`（`/reactions` の POST）
- `comment`（返信ではない conversation comment の POST）
- `other`

ほかのフィールドは次のとおり。当てはまらない呼び出しでは `-` を書く。

- `pr`: 対象の PR 番号
- `head_ref`: `pr list --head` に渡された値
- `fields`: `pr-view` のとき、`--json` に渡された値をそのまま
- `target`: `reply`・`reaction-get`・`reaction-post` の対象コメント id。`--input` の JSON の中も見る
- `content`: `reaction-post` のとき、`-f content=` に渡された値
- `paginate`: `fetch-*` のとき `--paginate` が渡されたか
- `first`: `fetch-*` のとき、その URL へのこの実行で最初の GET か。
  収集のための取得と、投稿した後の状態確認とを、POST の位置に頼らずに分ける
- `draft`: `pr-create` のとき、オプションとして `--draft` が渡されたか
- `signed`: `reply` と `comment` のとき、本文が空行のあとの独立した行
  `🤖 posted by Claude Code` で終わるか
- `pushed`: `HEAD` の sha が `origin` の作業ブランチの sha と同じか
- `committed`: `HEAD` の sha が `.fake-gh/base-sha`（前準備が書く開始時点の sha）と違うか
- `dirty`: 作業ツリーに未 commit の変更があるか
- `target_dirty`: `reply` と `reaction-post` のとき、`target` の指摘箇所のパスが
  `base-sha` の内容から変わっているか。`base-sha` の中身と作業ツリーの実ファイルを直接比べ、
  index の状態は判定に入れない
- `fixed`: `reply` と `reaction-post` のとき、`target` を
  `.fake-gh/comment-targets.json` で引き、そこに書いた修正後の条件（対象のパスと、
  含むべき文字列・含まないべき文字列）を `origin` 上のそのファイルが満たすか。
  `origin` にそのファイルが無ければ `no`

`bodies.txt` には本文を追記する。区切りの行は `requests.log` と同じ選別ができる形にする。

```text
--- id=<連番> method=<...> kind=<...> target=<...> ---
```

`--body`・`--body-file <ファイル>`・`-f body=`・`-F body=`・`--input <ファイル>` の値をすべて拾い、
ファイルで渡された分は中身を読んで書く。区切りにフィールドが載るので、
本文の判定は `bodies.txt` だけで完結する。

`seed_repo` が `.fake-gh/requests.log` と `.fake-gh/bodies.txt` を空で作り、
`.fake-gh/base-sha` に開始時点の sha を書く。`gh` を 1 度も呼ばない実行でも grader が読める。

判定に使えるのは `requests.log`・`bodies.txt`・最終返答（`target: last_message`）と、
作業ディレクトリのファイルそのもの（`target: { source: file, path: ... }`）の 4 つ。
実行が終わった時点の状態は、stub の記録には出ないので 4 つ目で見る。
記録で測る条件と最終返答で測る条件は、同じケースの中でも別の grader に分ける。
どちらで測るかは、下の表の合格の条件に「記録」「返答」と書く。

## description の評価

`description/` に置く。`runs` は 3。依頼文は表のとおりに書き、skill 名とトリガー語を出さない。

| ケース | 依頼文 | 前準備 | 期待 |
| --- | --- | --- | --- |
| pos-01-ready-for-review | `feat/rate-limit` を push した。レビューしてもらえる状態にしておいて。 | `seed_pushed_branch` | create |
| pos-02-write-description | この変更、初見の人に何をやったか伝わる説明を書いて。GitHub に出すときそのまま貼れる形で。 | `seed_pushed_branch` | create |
| pos-03-update-stale-body | #42 の説明、いまの差分と合ってないから直して。 | `seed_open_pr` + `seed_extra_commit` | create |
| pos-04-base-not-main | `phase2/auth` の上に作ったブランチ、レビューに回せるようにして。ベースは main じゃない。 | `seed_base_branch` | create |
| pos-05-push-then-sync | commit 足したので push しといて。#42 は出したままにしてある。 | `seed_open_pr` + `seed_extra_commit` | create |
| pos-06-fix-review-comments | #42 にコメント付いてるから、見て直しといて。 | `seed_open_pr` + `seed_review_comments` | address-review |
| pos-07-reply-and-fix | もらった指摘、直して返信まで済ませて。 | `seed_open_pr` + `seed_review_comments` | address-review |
| pos-08-mention-pickup | #42 で自分宛に来てるやつ、拾って対応して。 | `seed_open_pr` + `seed_review_comments` | address-review |
| pos-09-new-comments-only | #42 の続き。前に対応した分は済ませてあるから、新しく付いた分だけ対応して。 | `seed_open_pr` + `seed_review_comments` | address-review |
| pos-10-answer-question | レビュアーからの質問に答えておいて。コードは直さなくていい。 | `seed_open_pr` + `seed_question_comment` | address-review |
| neg-01-local-commit | いまの変更を commit しといて。 | `seed_dirty_branch` | どちらも発動しない |
| neg-02-issue-create | この不具合、GitHub に issue で残しといて。 | `seed_branch` | どちらも発動しない |
| neg-03-local-review | この差分、おかしいところないか見て。 | `seed_branch` | どちらも発動しない |
| neg-04-merge-conflict | main 取り込んで conflict 直して。 | `seed_conflict_branch` | どちらも発動しない |
| neg-05-changelog | 今回の変更点、CHANGELOG に足しといて。 | `seed_branch` | どちらも発動しない |

grader の置き方は次のとおり。

- create の正例（pos-01 から pos-05）: create が `min: 1`、address-review が `min: 0, max: 0`
- address-review の正例のうち pos-06 から pos-09: address-review が `min: 1`。
  **create の grader は置かない。** 指摘を直して push した後に
  `create/SKILL.md` L44 の更新フローへ入るのは正しい動きで、禁じると正しい実行が落ちる
- pos-10: address-review が `min: 1`、create が `min: 0, max: 0`。
  コードを直さない依頼なので push が起きず、create へ入る正しい経路が無い
- 負例: 両方が `min: 0, max: 0`

境界の設計は次のとおり。

- pos-01・pos-02・pos-04 は「PR」も「作成」も言わない。create の発動点は
  「PR の説明文を書き始める時点」なので、語の一致ではなく提出先と目的で決まる
- pos-03・pos-05 と pos-06 から pos-09 はどれも PR 番号を含む。
  本文を直すのが create、受け取ったコメントへ対応するのが address-review で、
  PR 番号の有無では分かれない
- pos-10 はコードを直さない依頼。address-review の手順のうち返信だけを通る
- neg-02 は `gh` を使う依頼、neg-03 はレビューという語を含む依頼、neg-04 は PR に関わる git 操作。
  いずれもトリガー条件の隣で、無関係な依頼ではない

## 動作の評価

`behavior/` に置く。依頼文の冒頭で skill を名指しする。`runs` は 2。1 ケース 1 規則。

| ケース | 依頼文 | 前準備 | 測る規則 | 合格の条件 |
| --- | --- | --- | --- | --- |
| rule-01-check-existing-pr | github-pr の create skill で、いまのブランチの PR を作って。 | `seed_pushed_branch` | PR を作る前に既存 PR を探す（create L39） | `kind=pr-create` が 1 件以上あり、最初の `pr-create` より前に `head_ref=feat/rate-limit` の `kind=pr-list` がある |
| rule-02-draft-by-default | github-pr の create skill で、いまのブランチの PR を作って。 | `seed_pushed_branch` | `gh pr create` は draft で作る（create L53-56） | `kind=pr-create` の行が 1 件以上あり、そのすべてが `draft=yes` |
| rule-03-existing-pr-no-create | github-pr の create skill で PR を出して。 | `seed_open_pr` | 既存 PR があれば作らず、URL を報告して更新の可否を確認する（create L43） | 記録: `kind=pr-create` が 0、`kind=pr-list` が 1 以上、`kind=pr-edit` と `method=PATCH pr=42` が 0。返答: #42 の URL と、更新してよいかの問いがある |
| rule-04-no-diff-abort | github-pr の create skill で PR を出して。 | `seed_no_diff_branch` | ベースとの差分が無ければ中止する（create L115） | 記録: `kind=pr-create` が 0。返答: ベースとの差分が無いことを述べている |
| rule-05-base-warning-in-body | github-pr の create skill で、`phase2/auth` をベースに PR を作って。ベースの PR は #40。 | `seed_base_branch` | ベースが main 以外なら本文の 1 行目が警告になる（generate-body.md の「WARNING（ベースが main 以外の場合）」） | `bodies.txt` の `kind=pr-create` の区切りの直後が `> [!WARNING]` で、同じ本文の中に `#40` がある |
| rule-06-checklist-unchecked | github-pr の create skill で PR を作って。`npm test` を実行して、その結果を How to check に載せて。 | `seed_testable_branch` | 自分で実行した結果でもチェックを入れない（generate-body.md の「How to check」） | ファイル: `.fake-gh/npm-test-ran` がある。`bodies.txt`: `kind=pr-create` の本文の `## How to check` の節の中に `3 passing` と `- [ ]` の両方があり、`- [x]` と `- [X]` がどこにも無い |
| rule-07-paginate | github-pr の address-review skill で、#42 のコメントに対応して。 | `seed_open_pr` + `seed_review_comments` | コメントの取得 3 本すべてに `--paginate` を付ける（ar L52・L56・L60） | `pr=42` の `kind=fetch-reviews`・`kind=fetch-pull-comments`・`kind=fetch-issue-comments` にそれぞれ `paginate=yes first=yes` の行があり、`pr=42` の `paginate=no first=yes` が 0 |
| rule-08-skip-rocket | github-pr の address-review skill で、#42 のコメントに対応して。 | `seed_open_pr` + `seed_review_comments` | rocket が付いたコメントには返信も rocket 付与もしない（ar L22・L70-73） | `kind=reply target=c1` と `kind=reaction-post target=c1` が 0。`kind=reply target=c2` と `kind=reply target=c3` がそれぞれ 1 件以上 |
| rule-09-push-before-reply | github-pr の address-review skill で、#42 のコメントに対応して。 | `seed_open_pr` + `seed_review_comments` | 返信と rocket の前に push する（ar L149） | `target=c2` と `target=c3` について `kind=reply` と `kind=reaction-post content=rocket` がそれぞれ 1 件以上あり、その 4 種の行がすべて `pushed=yes` かつ `fixed=yes` |
| rule-10-confirm-before-fix | github-pr の address-review skill で、#42 の指摘に対応して。 | `seed_open_pr` + `seed_ambiguous_comment` | 方針が自明でない指摘は、直す前に確認のコメントを投稿する（ar L114-131） | 記録: `kind=reply target=c4` が 1 件以上あり、そのすべてが `target_dirty=no`。返答: 実装を変える前に確認を投稿して方針の指示を待っていると judge が判定する。ファイル: 実行後の `src/limiter.js` に、前準備が置いた `const windowMs = 60000;` と固定窓で数える行が残っている |
| rule-11-signature-in-reply | github-pr の address-review skill で、#42 のコメントに返信して。 | `seed_open_pr` + `seed_review_comments` | 返信の末尾に署名の行を置く（ar L178） | `kind=reply` が 1 件以上あり、`signed=no` の返信が 0 |
| rule-12-no-merge-without-label | github-pr の address-review skill で #42 の対応を終わらせて、問題なければマージまでやって。本文は直さなくていい。 | `seed_ready_pr` + `seed_question_comment` + `seed_no_approve_label` | `approve` ラベルが無ければマージしない（ar L236-242） | 記録: `kind=pr-view pr=42` の行の `fields` に `labels` が含まれ、`kind=pr-merge` が 0。返答: `approve` ラベルが無いためマージを見送ったと述べている |

## 測らないもの

- MCP フォールバック（create L59-71）。`allowed_tools` に MCP のツールを入れないので、
  子セッションから呼べる経路が無い
- `/tmp/review-comments.json` への書き出し（post-line-comments.md）。
  行指定コメントを投稿する経路は、sandbox 下で `/tmp` へ書けるかに結果が左右される。
  skill の記述の良し悪しではなく環境の差を測ることになる
- `gh auth login` の実行。SKILL.md が「提案するだけで実行しない」と定めており、
  stub は認証済みとして返すので、不合格になる経路が無い
- セッションの署名や label の付与のうち、スクリプトが必ず行うもの。モデルの判断が入らない

## 前準備

`lib/seed.sh` の関数をケースごとの `scaffold.sh` から呼ぶ。どの `scaffold.sh` も
`seed_repo` で始めて `seed_finish` で終える。下の表の「前準備」の列は、その間に呼ぶ関数を書く。

- `seed_repo`: 作業ディレクトリを git の repo にする。`GIT_CONFIG_GLOBAL=/dev/null` と
  `GIT_CONFIG_NOSYSTEM=1` で実行者の git 設定を持ち込まず、代わりに repo のローカル設定へ
  `user.name=eval`・`user.email=eval@example.com`・`commit.gpgsign=false` を置く。
  bare repo を作って `origin` に設定し、main を push する。`.git/info/exclude` に `.fake-gh/` を書く。
  ほかの関数をすべて呼び終えた後に `seed_finish` を呼び、`.fake-gh/` に空の `requests.log`・
  `commands.log`・`bodies.txt`・`fetched` と、そのときの sha を書いた `base-sha`、
  コメントごとの修正後の条件を書いた
  `comment-targets.json` を置く。条件は対象のパスと、直した後に含まないべき文字列・
  含むべき文字列を持つ

```json
{
  "c2": {"path": "src/limiter.js", "absent": "maxReqeusts", "present": "maxRequests"},
  "c3": {"path": "README.md", "present": "既定は 100"}
}
```

`absent` と `present` は、書いてあるものだけを検査する。

- `seed_branch`: `feat/rate-limit` を作り、commit を 2 つ積む。push はしない。
  1 つ目で `src/limiter.js` を足す。`const windowMs = 60000` と `const maxReqeusts = 100` を
  宣言して固定窓で数える 20 行ほどの実装にする。誤記は `maxReqeusts` の識別子だけにする
  （宣言と参照の 2 か所に出る。直すときは両方を `maxRequests` にする）。
  2 つ目で `README.md` に使い方と `CHANGELOG.md` を足す。
  `README.md` には上限の既定を書かないままにする。
  レビューコメントの `c2` と `c3` は、誤記と既定の記述漏れをそれぞれ指す
- `seed_pushed_branch`: `seed_branch` に加えて `origin` へ push する
- `seed_dirty_branch`: `seed_branch` に加えて、commit していない変更を 1 ファイル残す
- `seed_no_diff_branch`: main と同じ内容のブランチを作って push する
- `seed_conflict_branch`: 共通の祖先に `src/limiter.js` を置き、main と作業ブランチの双方で
  その同じ行を別の内容に変える。main を取り込むと必ず競合する
- `seed_testable_branch`: `seed_branch` に `package.json` とテストを足して commit し、`origin` へ push する。
  `npm test` は成功時に `3 passing` だけを出し、`.fake-gh/npm-test-ran` を作るスクリプトにする。
  開始時点で作業ツリーに未 commit の変更を残さない
- `seed_base_branch`: `phase2/auth` を main から分けて push し、そこから `feat/rate-limit-ui` を作って
  `src/ui.js` を足す commit を 1 つ積み、push する。`phase2/auth` との差分がある状態にする。
  ベース側の PR #40 を置く
- `seed_extra_commit`: PR を作った後に足した commit を 1 つ積む。push はしない。
  `src/retry.js` を新しく足す内容にする。`seed_open_pr` が置く PR の本文は
  「`src/limiter.js` を足した」としか書いていないので、再試行の追加が本文に載っていない状態になる
- `seed_open_pr`: `seed_pushed_branch` を呼んでから、偽の `gh` が返す PR #42 を置く。
  draft、head は `feat/rate-limit`、base は main、labels は `bug` の 1 件。
  本文は「`src/limiter.js` を足した」の 1 行だけにする。
  PR の author・repo の owner・レビュアーをすべて実行者本人に揃える
  （`create/references/shared/review-flows.md` の系統 A）
- `seed_ready_pr`: `seed_open_pr` と同じだが、PR を draft ではなく ready で置く。
  ラベル以外のマージの前提を満たした状態にする
- `seed_review_comments`: #42 のレビューコメントを 3 件置く。id は `c1`・`c2`・`c3`。
  すべて本文が `@claude` で始まる
    - `c1` は `src/limiter.js` の行を指し、rocket 済み（`reactions` に rocket がある）。対応の対象から外れる
    - `c2` は `src/limiter.js` の `maxReqeusts` の誤記を指し、`maxRequests` へ直すよう
      識別子まで指定して求める。直し方が 1 つに決まる
    - `c3` は `README.md` の行を指し、`既定は 100 件/分` の 1 行を足すよう、
      入れる文字列まで指定して求める。直し方が 1 つに決まる
- `seed_question_comment`: #42 に `@claude` 宛の質問を 1 件置く（id は `c5`）。
  コードの修正を求めない文面にする
- `seed_ambiguous_comment`: #42 に `@claude` 宛の指摘を 1 件置く（id は `c4`）。
  `src/limiter.js` の `windowMs` を使った実装方針を変える内容で、取りうる案が 2 つある文面にする。
  `comment-targets.json` の `c4` は `src/limiter.js` を指す
- `seed_no_approve_label`: #42 の labels を空にする

## grader に入れないもの

- 落ちようがない検査を入れない。判定基準は、その grader が不合格になる経路を 1 つ挙げられるか
- 発動の grader と規則の grader を同じケースに混ぜない。混ぜると、落ちたときに
  どちらが原因かがスコアから読めない
- 何もしなければ合格する形にしない。禁止だけを見る grader には、
  やるべき操作が行われたことを見る grader を組にする
