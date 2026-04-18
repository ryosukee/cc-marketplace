---
name: handover
description: >-
  context 逼迫時や明示要求時に次セッションへの引き継ぎ資料を生成。
  Task 一覧 / 決定事項 / 現在地 / 再開手順 / 再開 prompt を含む
  HANDOVER.md を project root に書き出す。commit はしない。
  "handover"、"引き継ぎ"、"次セッション"、"ハンドオーバー"、
  "session handover" 等で発動。
---

# handover

長時間セッションの context が上限に近い時、または user の明示要求時に、
次セッションが迷わず再開できる `HANDOVER.md` を project root に書き出す。

## 責務境界

session-closing plugin は 2 skill を持つ。役割が違うので混同しない。

| skill | 目的 | 出力 |
| --- | --- | --- |
| retrospective | セッションで得た学びを rule / skill / CLAUDE.md に codify | 既存 .md の更新 + commit |
| handover | 次セッションへの状態引き継ぎ | project root の HANDOVER.md (commit なし) |

retrospective を実行した後に handover を呼ぶ運用も、handover だけ呼ぶ運用も OK。

## 成果物

- project root の `HANDOVER.md`
- md 末尾に再開用 prompt テンプレートを含む
- commit はしない。user / main session が任意に扱えるよう working tree に残すだけ

## 手順

### 1. 既存 HANDOVER.md の退避

project root に既に `HANDOVER.md` があれば、上書きせず rename する。

- 既存 md 先頭や本文から作成日を抽出する。
  見つからなければ `git log -1 --format=%cd --date=short -- HANDOVER.md` を使い、
  git 管理外なら mtime を日付に変換する
- `HANDOVER-{YYYY-MM-DD}.md` にリネーム
- 同名が既にあれば `HANDOVER-{YYYY-MM-DD}-2.md` のように suffix を足す

### 2. セッション状態の棚卸し

以下を main session の状態から集める。

- 背景と原初の目的
- user と合意した設計判断、trade-off、open question の確定 / 未確定
- 現在地 (今どこまで進んで、何が途中か、background で動いている処理)
- 参照すべき成果物 / rule / doc の path
- Task 一覧: TaskList を呼び出して pending / in_progress を全件取得。
  一連の流れに関連する完了も背景として残す (無関係な完了は省く)
- 本セッション起点の commit 履歴 (`git log`)
- 懸念・リスク・メモ

Task 情報は必ず TaskList から取得する。memory や推測では書かない。

### 3. HANDOVER.md の生成

以下のテンプレートをベースに埋める。セッションの性質に応じて section を足し引きしてよい。

````markdown
# セッション引き継ぎ資料 ({YYYY-MM-DD})

前セッションの context が上限近いため、次セッションへの引き継ぎ資料。
これを読めば次セッションが迷わず再開できる。

> [!IMPORTANT]
> 作業が軌道に乗ったら本 HANDOVER.md は削除すること。
> 情報は必要な rule / plan / doc に散らばっているはずで、
> 引き継ぎ資料としての役目を終えたら残し続ける価値はない。

## 0. 最初にすること

1. 本資料を読む (特に「現在地」「Task 一覧」)
2. 「再開手順」に沿って作業を再開する
3. TaskList が空なら「Task 一覧」から TaskCreate + TaskUpdate で再登録する
4. 作業が軌道に乗ったら本 HANDOVER.md を削除する

## 1. 背景

{このセッションの起点、発端となった問題や要件}

## 2. ゴール・原則

{原初の目的}

{遵守する原則 (user が明示した方針、採用しないと決めた選択肢など)}

## 3. 決定事項

{session 中に user と合意した設計判断}

{open question のうち確定したもの・未確定のまま残すもの}

## 4. 現在地

{何をしている途中か、進行中の Phase / Step}

{background で動いている処理があればそれも}

## 5. 参照すべき資料

| ファイル | 内容 |
|---|---|
| {path} | {一言要約} |

## 6. コミット履歴 (本セッション起点)

```
{git log の抜粋}
```

## 7. Task 一覧

### 進行中 / 未着手 (再登録対象)

| subject | status | blockedBy | 備考 |
|---|---|---|---|
| {subject} | in_progress | - | ... |
| {subject} | pending | {依存} | ... |

### 関連する完了済み (背景として)

| subject | 成果 |
|---|---|
| {subject} | {成果物 path or commit} |

## 8. 再開手順

### Step 1: ...

### Step 2: ...

## 9. 次セッション開始時の prompt テンプレート

以下を次セッションの user 入力として貼ると main session が本資料を読んで再開する。

```
{作業の一言要約} を継続する。
前セッションの context 上限に近づいたため新セッションを開始した。

最初に以下を実行してほしい:

1. ./HANDOVER.md を読む
2. そこに書かれた「再開手順」に従う
3. Task 一覧の pending / in_progress を TaskCreate + TaskUpdate で再登録する
4. {セッション固有の注意事項があれば記述}
5. 作業が軌道に乗ったら ./HANDOVER.md を削除する
```

## 10. 懸念・リスク・メモ

- {気をつけたいこと}
- {未解決のまま残した論点}
````

### 4. 書き出し

埋めた内容を project root の `HANDOVER.md` として書く。commit はしない。

### 5. 完了報告

以下を user に伝える。

- `HANDOVER.md` を書き出した旨 (既存があれば退避先 path も)
- 次セッション開始時に md 内「次セッション開始時の prompt テンプレート」を貼って再開する想定

## 注意事項

- Task 情報は TaskList から取得する。memory や推測では書かない
- user が明示した原則・方針・feedback は必ず保持する。漏れると次セッションで再説明が要る
- ファイル path / commit hash / ブランチ名などの具体識別子は省略しない。次セッションが着手する起点になる
- commit しない。user / main session が任意に扱う
- handover 自体に持続的な知見を溜めない。次セッションで読み込み後に削除する前提で、知見は rule / plan / doc に分散させる
