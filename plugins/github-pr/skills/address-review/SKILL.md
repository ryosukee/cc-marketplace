---
name: address-review
description: GitHub PR に付いた @claude 宛のレビューコメントに対応する前に必ず読む。「レビュー対応して」「PR コメント対応」「レビュー指摘直して」「address review」と言われたとき、およびレビューコメントへの修正・返信を始める時点が発動点。対象コメントの収集・分類・グルーピングから、修正・コミット・push・返信・対応済みマークまでを一連で行う。要 gh CLI。
---

# PR レビュー対応スキル

GitHub PR に付いた `@claude` 宛のコメントを全て取得し、全体を把握した上で 1 コメント 1 コミットで対応する。

## 対象コメントの決め方

GitHub の PR コメントは 2 種類ある。レビュー（本体コメント + それにぶら下がるインラインコメント群）と、
PR 会話への単発コメント (conversation comment)。対象は次の規則で決める。

- レビューの本体コメントに `@claude` がある場合、そのレビューに属するインラインコメント全部を対象にする。
  各インラインコメントに `@claude` は不要
- インラインコメント自身に `@claude` がある場合、そのコメント単体を対象にする。
  本体コメントが空になる単発インラインコメント (Add single comment) はこの規則で拾う
- conversation comment は `@claude` を含むものだけ対象にする
- スレッド返信 (`in_reply_to_id` が非 null) も同じ規則で対象判定する。
  対象になったコメントと同じスレッドの他の返信は、指摘の文脈として読む
- rocket リアクションが付いたコメントは対応済みとして除外する

## 入力

- PR URL または PR 番号（プロンプトから取得。無ければ現在のブランチの PR を `gh pr view` で解決）
- 前回実行タイムスタンプ（任意。指定があればそれ以降のコメントのみ対応）
- 変更の文脈（任意。設計意図、実装方針、変更の背景など）
    - レビューコメントの解釈や修正方針の判断に使う。文脈がない場合は PR の diff とコミットメッセージから推測する

## ワークフロー

### ステップ 1: PR 情報の取得とチェックアウト

```bash
# owner/repo を取得
gh repo view --json owner,name --jq '"\(.owner.login)/\(.name)"'

# PR の状態を確認
gh pr view {number} --json state,headRefName,baseRefName

# head ブランチをチェックアウト（現在のブランチが head と異なる場合）
gh pr checkout {number}
```

### ステップ 2: 対象コメントの収集

レビュー本体・インラインコメント・conversation comment の 3 つを取得する。

```bash
# レビュー本体（@claude 付きレビューの id を集める）
gh api repos/{owner}/{repo}/pulls/{number}/reviews --paginate \
  --jq '.[] | select(.body | contains("@claude")) | {id, body, user_login: .user.login, submitted_at}'

# インラインコメント（全件取得し、対象判定は次の手順で行う）
gh api repos/{owner}/{repo}/pulls/{number}/comments --paginate \
  --jq '.[] | {id, review_id: .pull_request_review_id, path, line, start_line, body, user_login: .user.login, in_reply_to_id, created_at}'

# conversation comment（PR 全体へのコメント）
gh api repos/{owner}/{repo}/issues/{number}/comments --paginate \
  --jq '.[] | select(.body | contains("@claude")) | {id, body, user_login: .user.login, created_at}'
```

`--paginate` は必須。返信を含めるとコメント数が 30 件を超えることがあり、
ページネーションなしだと後半のコメントが取りこぼされる。

インラインコメントの対象判定は「対象コメントの決め方」に従う。
`review_id` が `@claude` 付きレビューの id 集合に含まれるか、コメント自身の body が `@claude` を含めば対象。

#### 対応済みコメントの除外

対応済みコメントには rocket リアクションが付いている。各コメントのリアクションを確認し、
rocket が付いているコメントは対応対象から除外する。

リアクション確認の API パスはコメント種別で異なる:

```bash
# インラインコメントのリアクション確認
gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions \
  --jq '.[] | select(.content == "rocket")'

# conversation comment のリアクション確認
gh api repos/{owner}/{repo}/issues/comments/{comment_id}/reactions \
  --jq '.[] | select(.content == "rocket")'
```

レビュー本体コメントにはリアクション API が無い。レビュー単位の対応済み判定は、
そのレビューに属するインラインコメント全部に rocket が付いているかで行う。

新着の判定は rocket の有無だけで行う。`created_at` などの時刻で先に絞らない。
時刻の基準（UTC と現地時刻、前回の実行時刻の記憶）がずれると、rocket の無いコメントを取りこぼす。
API 呼び出しを減らしたいなら、rocket の確認を全件に対して 1 回のループで行う。

### ステップ 3: 分類・全体把握・グルーピング

全コメントを読んだ上で、以下の手順で対応計画を立てる。

1. 各コメントを種別に分類する

    | 種別 | アクション |
    | --- | --- |
    | 修正要求 | コード修正 + 返信 |
    | 質問 | コメント返信で回答。コード修正は不要な場合が多い |
    | 提案 (suggestion) | 妥当性を評価し、採否と理由を返信。採用ならコード修正 |
    | nitpick | 対応するが優先度は低い |

2. conversation comment とレビュー本体コメントに全体方針や横断的な指示がないか確認する。
   あればそれを全修正の前提方針とする
3. 修正を伴うコメントの対応順序を決める。依存関係のある指摘（A の修正が B に影響する）は
   A を先にし、先に入れたコミットが後のコミットで書き換えられないようにする
4. 同じコミットにまとめてよいのは、同じ行・隣接する行への指摘で、別々に直すと互いの差分が
   衝突するものだけ。同じファイル・同じ設計方針というだけではまとめない

### ステップ 4: 対応方針の確認

コメントの対応方針を判断する際、以下のいずれかに該当する場合は
**コードを修正する前に PR コメントで方針を確認する**。

- 対応方針が自明でない（複数の解釈がありえる）
- 複数の選択肢がある（どのアプローチを取るか判断が必要）
- コード設計や構造を変える必要がある
- 指示が曖昧で、意図の確認が必要

確認の方法:

1. レビューコメントのスレッドに返信する形で、自分の解釈と対応案を書く
2. 選択肢がある場合は案を列挙してどれが望ましいか聞く
3. PR コメントのみで解決できるもの（説明・補足・方針合意）はコメント返信だけで完了する。
   コード修正が不要なケースも考慮する
4. 確認が取れてからコード修正に進む

自明な修正（typo、明らかなバグ、指示が具体的で一意に決まるもの）はそのまま対応してよい。

### ステップ 5: コメント単位の対応

コメントごとに以下を実行する。

1. コメントの内容を解釈し、対象ファイルと修正方針を決める
2. 指摘を問題の型として読み、同じ型が PR の他の箇所（他ファイル・他の成果物）に
   無いかを確認する。規模が大きければ、指摘から型を抽出して subagent に全体を洗わせる。
   レビュアーは同型の全箇所を指摘し尽くさない
3. 指摘された箇所を修正し、`git add` → `git commit`（そのコメントへの対応だと分かるメッセージ。
   対象の path:line か指摘の要約を入れる）
4. 横展開で直す分は、指摘箇所の commit とは別の commit にする。同型が複数ファイルにまたがっても
   1 つの横展開 commit にまとめてよい（元の指摘が 1 つなので）。メッセージに「横展開」と
   元の指摘を書く
5. `git push`
6. コメントに返信（ステップ 6 の形式）。横展開で直した分は、返信に commit と件数を書く
7. コメントに rocket リアクションを付ける（対応済みマーク）

```bash
# インラインコメントに rocket リアクション
gh api repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions \
  --method POST -f content=rocket

# conversation comment に rocket リアクション
gh api repos/{owner}/{repo}/issues/comments/{comment_id}/reactions \
  --method POST -f content=rocket
```

### ステップ 6: 返信の投稿

インラインコメントへの返信:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments \
  --method POST \
  -f body="@{user_login} 対応しました ({commit_sha})

**解釈**: {コメントをどう解釈したか}

**修正内容**:
- {具体的な変更 1}
- {具体的な変更 2}" \
  -F in_reply_to={comment_id}
```

conversation comment への返信:

```bash
gh api repos/{owner}/{repo}/issues/{number}/comments \
  --method POST \
  -f body="@{user_login} 対応しました ({commit_sha})

**解釈**: {コメントをどう解釈したか}

**修正内容**:
- {具体的な変更 1}
- {具体的な変更 2}"
```

返信のルール:

- メンションは `user_login` から動的に取得する。固定ユーザー名にしない
- コミット SHA を明記する（GitHub 上でコミットへのリンクになる）
- 解釈を明示する（レビュアーが認識ズレを早期に検出できる）
- 同じ commit で対応した他のコメントがある場合（差分が衝突する隣接の指摘）、関連コメントとして言及する
- レビュー本体コメントへの返信はスレッドを持たないため、conversation comment で行う

### ステップ 7: 結果の報告

PR に conversation comment として結果を報告する。レビュアーをメンションする。

コメントごとに commit を 1 行で並べる。同じ commit に複数のコメントをまとめた場合は、
まとめた理由（衝突する差分）を添える:

```text
@{user_login} 全 {N} 件のコメントに対応しました。

- {commit_sha}: {指摘内容の 1 文要約}（{コメント URL}）
- {commit_sha}: {指摘内容の 1 文要約}（{コメント URL}）。横展開: {commit_sha}
- {commit_sha}: 次の 2 件を同じ commit で対応（同じ行への指摘で差分が衝突するため）
    - {指摘内容の 1 文要約}（{コメント URL}）
    - {指摘内容の 1 文要約}（{コメント URL}）

コード変更なし（返信のみ）: {指摘内容の 1 文要約}（{コメント URL}）
```

## 1 コメント 1 コミットの原則

レビュアーは commit 単位で「このコメントをどう直したか」を確認する。
まとめた commit は、どの差分がどの指摘への対応かを読み解く手間をレビュアーに移す。

- 独立した指摘は 1 コメント 1 コミット。同じファイル・同じ方針というだけではまとめない
- 同じ commit にしてよいのは、同じ行・隣接する行への指摘で、別々に直すと差分が衝突するものだけ
- 横展開は指摘箇所の commit と分け、元の指摘ごとに 1 commit
- 前のコミットの変更が後のコミットで書き換えられないよう、対応順序を決める

why: 実例（2026-08-23、PR #6）。21 件を「個別修正 1 commit + 横展開 1 commit」の 2 つにまとめ、
「レビュー対応に対して 1 つずつ確認しようにも確認しづらい」と差し戻された。

## resume 時の動作

session resume で呼ばれた場合も同じフローを実行する。前回実行タイムスタンプが渡されていれば、
それ以降の新しいコメントのみ対象にする。セッションコンテキストに過去の対応履歴があれば、
重複対応を自然に回避できる。

## エラーハンドリング

| エラー | 対処 |
| --- | --- |
| gh 未認証 | `gh auth login` を提案 |
| PR が見つからない | PR 番号を確認するよう提案 |
| push 権限なし | リポジトリの権限を確認するよう提案 |
| 対象コメントなし | 「新しい @claude コメントはありません」と報告して終了 |
| コミット中にコンフリクト | コンフリクトの内容を報告し、手動解決を提案 |
| 指摘内容が曖昧 | ステップ 4 に従い、修正前にスレッドで確認質問を投稿 |
| インライン返信が 422 (one pending review per pull request) | 同一アカウントの未送信 (pending) レビューが塞いでいる。pending を勝手に submit・削除せず (下書きの公開・消失になる)、ユーザーに送信を依頼する。急ぎの返信は conversation コメントで行う |
