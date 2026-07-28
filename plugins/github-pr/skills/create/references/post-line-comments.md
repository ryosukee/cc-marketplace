# 差分コメント

PR 作成後、Changed files の差分に対してコメントを追加する。
PR 本文を読んだだけでは具体がイメージしづらい変更箇所を補足説明するためのもの。
共通のフォーマットルールは [formatting-rules.md](shared/formatting-rules.md) に従う。

コメントには2種類ある:

- 行指定コメント: 差分内の特定の行（範囲）に対するコメント
- ファイルコメント: ファイル単位の補足コメント（行を指定しない）

## コメントする基準

- PR 本文を読めば自明な変更にはコメントしない
- 「PR 本文のこの話は具体的にはここ」という対応関係を示したい箇所にコメントする
- 設計判断の理由がある箇所（「こういう事情があるのでこの方法を採用した」）
- 複数箇所の変更に依存関係がある場合は、コメント同士で相互参照する
- 外部ソースの引用は [external-citation.md](shared/external-citation.md) に従う

## 行指定コメント: 範囲指定を基本とする

単一行ではなく、意味のあるまとまり（関数、セクション、設定ブロック等）を範囲指定でコメントする。

## ファイルコメント: ファイル単位の補足

ファイルの削除・新規作成・リネーム・移動など、ファイル単位での補足が必要な場合はファイルコメントを使う。
行の差分に対するコメントではなく、そのファイルの変更全体に対する説明になる。

使い分け:

- ファイル削除: なぜ削除したか、内容の移行先はどこか
- ファイル新規作成: なぜ新設したか、既存ファイルとの関係
- リネーム・移動: 旧パスからの変更理由

## 投稿方法

行指定コメントとファイルコメントは異なる API エンドポイントを使う。

### 行指定コメント: Review API で一括投稿

```bash
gh api repos/{owner}/{repo}/pulls/{number}/reviews \
  --method POST \
  -f event="COMMENT" \
  -f body="" \
  --input /tmp/review-comments.json
```

`/tmp/review-comments.json` の形式:

```json
{
  "comments": [
    {
      "path": "path/to/file.md",
      "start_line": 10,
      "line": 25,
      "body": "背景セクションで触れた○○の対応箇所。\nここでは△△という理由で□□を採用している。"
    },
    {
      "path": "path/to/other-file.md",
      "start_line": 5,
      "line": 12,
      "body": "`path/to/file.md` L10-25 の変更と対になる修正。あちらで○○を変えたのでこちらの参照も更新。"
    }
  ]
}
```

注意:

- `start_line` と `line` は PR の diff 上での行番号（ファイル全体の行番号）
- `side` はデフォルトで `RIGHT`（変更後の側）。削除行にコメントする場合は `"side": "LEFT"` を指定

### ファイルコメント: 個別コメント API で投稿

Review API の `comments` 配列は `subject_type` をサポートしていないため、ファイルコメントは個別コメント API を使う。

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments \
  --method POST \
  -f path="path/to/deleted-file.md" \
  -f subject_type="file" \
  -f commit_id="$(gh api repos/{owner}/{repo}/pulls/{number} --jq '.head.sha')" \
  -f body="内容を各 authoring rule に統合したため削除。移行先:
- rule-authoring.md のファイル命名セクション
- skill-authoring.md のファイル命名セクション"
```

複数のファイルコメントがある場合は、それぞれ個別に API を呼ぶ。

### 共通の注意

- コメント本文で他の箇所を参照する際はファイルパスと行番号を明記する

## コメントの更新

既存コメントの編集と、スレッドへの返信が API で可能:

```bash
# 既存コメントの編集
gh api repos/{owner}/{repo}/pulls/comments/{comment_id} \
  --method PATCH -f body="更新された内容"

# スレッドへの返信
gh api repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies \
  --method POST -f body="返信内容"
```

更新方針は状況に応じて判断する。ユーザーから具体的に「このコメントを編集して」「返信で追記して」等の指示があれば、それに従う。

> **TODO**: GitHub のスレッド返信形式でのコメント更新・追加を体系化したい。現状はターミナル上で個別に方法を指定すれば実行可能。
