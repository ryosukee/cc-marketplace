# github-pr の eval

description の評価と動作の評価の 2 つを、別々のケースで測る。
実行は `evals/run.sh github-pr`。2 つの評価の定義、ケースの書式、stub と前準備の仕組みは
[Plugin eval ハーネス](../../../evals/README.md)にある。

## GitHub へ接続しない

この plugin は `gh` で GitHub の API を呼ぶ。eval では本物の GitHub へ 1 度も接続しない。
次の 4 つで塞ぐ。

- `tests/fake-gh/gh` が `gh` を完全に置き換える。本物の `gh` へ渡す経路を持たず、
  知らないサブコマンドと知らない endpoint は exit 3 で落ちる。
  `evals/env.sh` がこのディレクトリを PATH の先頭に入れる
- 前準備が作る repo の `origin` は、同じ一時ディレクトリに作った bare repo を指す。
  `git push` はそこへ書き込み、外へ出ない
- `allowed_tools` は `[Read, Glob, Grep, Skill, Bash, Write, Edit]` だけにする。
  MCP のツールが入らないので、`create/SKILL.md` の MCP フォールバック (`mcp__github__create_pull_request`) は
  子セッションから呼べない
- 子セッションの sandbox が外向きの通信を落とす (`deny network-outbound`)

`gh` を呼ぶのは github-pr だけで、`claude plugin eval` 自身が使う呼び出しが無い。
だから本物へ渡す経路を持たせず、丸ごと差し替える。

## stub が残す記録

偽の `gh` は呼び出しを 3 つのファイルに残す。`requests.jsonl`・`commands.log`・`bodies.txt` で、
どれも作業ディレクトリの `.fake-gh/` の下に置く。
`seed_repo` が `.git/info/exclude` に `.fake-gh/` を書くので、この記録自体は `dirty` を動かさない。

`requests.jsonl` は 1 行 1 呼び出しの JSON。grader の `pattern` はこの中の文字列を探す。
フィールドの名前・並び・型と、`kind` が取りうる値は
[偽の gh](../tests/fake-gh/gh) の `record_fields` と `record_kinds` が持つ。
各フィールドが何を表すかも、その定義に添えたコメントにある。
1 レコードが 1 行に収まるので、`"kind":"reply"[^\n]*"signed":false` のように
同じ呼び出しの中での前後関係を書ける。

生の引数は `commands.log` へ分ける。`commands.log` は落ちたケースを人が読むためだけに使い、
grader の対象にしない。

`bodies.txt` には投稿された本文を追記する。複数行のまま検査できるように、本文は生で置き、
1 件ごとに JSON の 1 行で挟む。この区切りの形も stub のヘッダにある。

判定に使えるのは `requests.jsonl`・`bodies.txt`・最終返答 (`target: last_message`) と、
作業ディレクトリのファイルそのもの (`target: { source: file, path: ... }`) の 4 つ。
実行が終わった時点の状態は、stub の記録には出ないので 4 つ目で見る。
記録で測る条件と最終返答で測る条件は、同じケースの中でも別の grader に分ける。
どちらで測るかは、下の一覧の合格の条件に「記録」「返答」「ファイル」と書く。

## description の評価

`description/` に置く。`runs` は 3。依頼文に skill 名とトリガー語を出さない。

- `pos-01-ready-for-review`
    - 依頼文: `feat/rate-limit` を push した。レビューしてもらえる状態にしておいて。
    - 前準備: `seed_pushed_branch`
    - 期待: create が発動する
- `pos-02-write-description`
    - 依頼文: この変更、初見の人に何をやったか伝わる説明を書いて。GitHub に出すときそのまま貼れる形で。
    - 前準備: `seed_pushed_branch`
    - 期待: create が発動する
- `pos-03-update-stale-body`
    - 依頼文: #42 の説明、いまの差分と合ってないから直して。
    - 前準備: `seed_open_pr` と `seed_extra_commit`
    - 期待: create が発動する
- `pos-04-base-not-main`
    - 依頼文: `phase2/auth` の上に作ったブランチ、レビューに回せるようにして。ベースは main じゃない。
    - 前準備: `seed_base_branch`
    - 期待: create が発動する
- `pos-06-fix-review-comments`
    - 依頼文: #42 にコメント付いてるから、見て直しといて。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 期待: address-review が発動する
- `pos-07-reply-and-fix`
    - 依頼文: もらった指摘、直して返信まで済ませて。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 期待: address-review が発動する
- `pos-08-mention-pickup`
    - 依頼文: #42 で自分宛に来てるやつ、拾って対応して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 期待: address-review が発動する
- `pos-09-new-comments-only`
    - 依頼文: #42 の続き。前に対応した分は済ませてあるから、新しく付いた分だけ対応して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 期待: address-review が発動する
- `pos-10-answer-question`
    - 依頼文: レビュアーからの質問に答えておいて。コードは直さなくていい。
    - 前準備: `seed_open_pr` と `seed_question_comment`
    - 期待: address-review が発動する
- `neg-01-local-commit`
    - 依頼文: いまの変更を commit しといて。
    - 前準備: `seed_dirty_branch`
    - 期待: どちらも発動しない
- `neg-02-issue-create`
    - 依頼文: この不具合、GitHub に issue で残しといて。
    - 前準備: `seed_branch`
    - 期待: どちらも発動しない
- `neg-03-local-review`
    - 依頼文: この差分、おかしいところないか見て。
    - 前準備: `seed_branch`
    - 期待: どちらも発動しない
- `neg-04-merge-conflict`
    - 依頼文: main 取り込んで conflict 直して。
    - 前準備: `seed_conflict_branch`
    - 期待: どちらも発動しない
- `neg-05-changelog`
    - 依頼文: 今回の変更点、CHANGELOG に足しといて。
    - 前準備: `seed_branch`
    - 期待: どちらも発動しない

grader の置き方は次のとおり。

- create の正例（pos-01 から pos-04）: create が `min: 1`、address-review が `min: 0, max: 0`
- address-review の正例のうち pos-06 から pos-09: address-review が `min: 1`。
  **create の grader は置かない。** 指摘を直して push した後に
  [create の SKILL.md](../skills/create/SKILL.md) 44 行目の更新フローへ入るのは正しい動きで、
  禁じると正しい実行が落ちる
- pos-10: address-review が `min: 1`、create が `min: 0, max: 0`。
  コードを直さない依頼なので push が起きず、create へ入る正しい経路が無い
- 負例: 両方が `min: 0, max: 0`

境界の設計は次のとおり。

- pos-01・pos-02・pos-04 は「PR」も「作成」も言わない。create の発動点は
  「PR の説明文を書き始める時点」なので、語の一致ではなく提出先と目的で決まる
- pos-03 と pos-06 から pos-09 はどれも PR 番号を含む。
  本文を直すのが create、受け取ったコメントへ対応するのが address-review で、
  PR 番号の有無では分かれない
- pos-10 はコードを直さない依頼。address-review の手順のうち返信だけを通る
- neg-02 は `gh` を使う依頼、neg-03 はレビューという語を含む依頼、neg-04 は PR に関わる git 操作。
  いずれもトリガー条件の隣で、無関係な依頼ではない

## 動作の評価

`behavior/` に置く。依頼文の冒頭で skill を名指しする。`runs` は 2。1 ケース 1 規則。

- `rule-01-check-existing-pr`
    - 依頼文: github-pr の create skill で、いまのブランチの PR を作って。
    - 前準備: `seed_pushed_branch`
    - 測る規則: PR を作る前に既存 PR を探す（[create の SKILL.md](../skills/create/SKILL.md) 39 行目）
    - 合格の条件（記録）: `"kind":"pr-create"` が 1 件以上あり、最初の `pr-create` より前に
      `"kind":"pr-list"` で `"head_ref":"feat/rate-limit"` のものがある
- `rule-02-draft-by-default`
    - 依頼文: github-pr の create skill で、いまのブランチの PR を作って。
    - 前準備: `seed_pushed_branch`
    - 測る規則: `gh pr create` は draft で作る（[create の SKILL.md](../skills/create/SKILL.md) 53 行目から 56 行目）
    - 合格の条件（記録）: `"kind":"pr-create"` の行が 1 件以上あり、そのすべてが `"draft":true`
- `rule-03-existing-pr-no-create`
    - 依頼文: github-pr の create skill で PR を出して。
    - 前準備: `seed_open_pr`
    - 測る規則: 既存 PR があれば作らず、URL を報告して更新の可否を確認する
      （[create の SKILL.md](../skills/create/SKILL.md) 43 行目）
    - 合格の条件（記録）: `"kind":"pr-create"` が 0、`"kind":"pr-list"` が 1 以上、
      `"kind":"pr-edit"` と `"method":"PATCH"` かつ `"pr":42` が 0
    - 合格の条件（返答）: #42 の URL と、更新してよいかの問いがある
- `rule-04-no-diff-abort`
    - 依頼文: github-pr の create skill で PR を出して。
    - 前準備: `seed_no_diff_branch`
    - 測る規則: ベースとの差分が無ければ中止する（[create の SKILL.md](../skills/create/SKILL.md) 115 行目）
    - 合格の条件（記録）: `"kind":"pr-create"` が 0
    - 合格の条件（返答）: ベースとの差分が無いことを述べている
- `rule-05-base-warning-in-body`
    - 依頼文: github-pr の create skill で、`phase2/auth` をベースに PR を作って。ベースの PR は #40。
    - 前準備: `seed_base_branch`
    - 測る規則: ベースが main 以外なら本文の 1 行目が警告になる
      （[本文の作り方](../skills/create/references/generate-body.md) の「WARNING（ベースが main 以外の場合）」）
    - 合格の条件（記録）: `bodies.txt` の `"kind":"pr-create"` の区切りの直後が `> [!WARNING]` で、
      同じ本文の中に `#40` がある
- `rule-06-checklist-unchecked`
    - 依頼文: github-pr の create skill で PR を作って。`npm test` を実行して、その結果を How to check に載せて。
    - 前準備: `seed_testable_branch`
    - 測る規則: 自分で実行した結果でもチェックを入れない
      （[本文の作り方](../skills/create/references/generate-body.md) の「How to check」）
    - 合格の条件（ファイル）: `.fake-gh/npm-test-ran` がある
    - 合格の条件（記録）: `bodies.txt` の `"kind":"pr-create"` の本文の `## How to check` の節の中に
      `3 passing` と `- [ ]` の両方があり、`- [x]` と `- [X]` がどこにも無い
- `rule-07-paginate`
    - 依頼文: github-pr の address-review skill で、#42 のコメントに対応して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 測る規則: コメントの取得 3 本すべてに `--paginate` を付ける
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 52・56・60 行目）
    - 合格の条件（記録）: `"pr":42` の `"kind":"fetch-reviews"`・`"kind":"fetch-pull-comments"`・`"kind":"fetch-issue-comments"`
      にそれぞれ `"paginate":true,"first":true` の行があり、`"pr":42` の `"paginate":false,"first":true` が 0
- `rule-08-skip-rocket`
    - 依頼文: github-pr の address-review skill で、#42 のコメントに対応して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 測る規則: rocket が付いたコメントには返信も rocket 付与もしない
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 22・70-73 行目）
    - 合格の条件（記録）: `"kind":"reply"` と `"kind":"reaction-post"` で `"target":"c1"` のものが 0。
      `"kind":"reply"` で `"target":"c2"` のものと `"target":"c3"` のものがそれぞれ 1 件以上
- `rule-09-push-before-reply`
    - 依頼文: github-pr の address-review skill で、#42 のコメントに対応して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 測る規則: 返信と rocket の前に push する
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 149 行目）
    - 合格の条件（記録）: `"target":"c2"` と `"target":"c3"` について `"kind":"reply"` と
      `"kind":"reaction-post"` で `"content":"rocket"` がそれぞれ 1 件以上あり、その 4 種の行がすべて
      `"pushed":true` かつ `"fixed":true`
- `rule-10-confirm-before-fix`
    - 依頼文: github-pr の address-review skill で、#42 の指摘に対応して。
    - 前準備: `seed_open_pr` と `seed_ambiguous_comment`
    - 測る規則: 方針が自明でない指摘は、直す前に確認のコメントを投稿する
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 114 行目から 131 行目）
    - 合格の条件（記録）: `"kind":"reply"` で `"target":"c4"` の行が 1 件以上あり、そのすべてが `"target_dirty":false`
    - 合格の条件（返答）: 実装を変える前に確認を投稿して方針の指示を待っていると judge が判定する
    - 合格の条件（ファイル）: 実行後の `src/limiter.js` に、前準備が置いた `const windowMs = 60000;` と
      固定窓で数える行が残っている
- `rule-11-signature-in-reply`
    - 依頼文: github-pr の address-review skill で、#42 のコメントに返信して。
    - 前準備: `seed_open_pr` と `seed_review_comments`
    - 測る規則: 返信の末尾に署名の行を置く
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 178 行目）
    - 合格の条件（記録）: `"kind":"reply"` が 1 件以上あり、`"signed":false` の返信が 0
- `rule-12-no-merge-without-label`
    - 依頼文: github-pr の address-review skill で #42 の対応を終わらせて、問題なければマージまでやって。
      本文は直さなくていい。
    - 前準備: `seed_ready_pr`・`seed_question_comment`・`seed_no_approve_label`
    - 測る規則: `approve` ラベルが無ければマージしない
      （[address-review の SKILL.md](../skills/address-review/SKILL.md) 236 行目から 242 行目）
    - 合格の条件（記録）: `"kind":"pr-view","pr":42` の行の `fields` に `labels` が含まれ、`"kind":"pr-merge"` が 0
    - 合格の条件（返答）: `approve` ラベルが無いためマージを見送ったと述べている

## 測らないもの

- MCP フォールバック（[create の SKILL.md](../skills/create/SKILL.md) 59 行目から 71 行目）。
  `allowed_tools` に MCP のツールを入れないので、子セッションから呼べる経路が無い
- `/tmp/review-comments.json` への書き出し
  （[行指定コメントの投稿](../skills/create/references/post-line-comments.md)）。
  行指定コメントを投稿する経路は、sandbox 下で `/tmp` へ書けるかに結果が左右される。
  skill の記述の良し悪しではなく環境の差を測ることになる
- `gh auth login` の実行。[create の SKILL.md](../skills/create/SKILL.md) 113 行目と
  [address-review の SKILL.md](../skills/address-review/SKILL.md) 267 行目は、
  `gh` が未認証のときに `gh auth login` を提案するとだけ定めている。
  stub は認証済みとして返すので、不合格になる経路が無い
- セッションの署名や label の付与のうち、スクリプトが必ず行うもの。モデルの判断が入らない

## 前準備

[前準備の関数](../evals/lib/seed.sh)をケースごとの `scaffold.sh` から呼ぶ。どの `scaffold.sh` も
`seed_repo` で始めて `seed_finish` で終える。上の一覧の「前準備」は、その間に呼ぶ関数を書いている。

各関数が何を置くかは、その関数の定義に添えたコメントにある。`pattern` に書く値
（コメントの id、ブランチ名、fixture の中身）も、その関数の中に実物がある。
