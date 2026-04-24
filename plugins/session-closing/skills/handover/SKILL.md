---
name: handover
description: >-
  context 逼迫時や明示要求時に次セッションへの引き継ぎ資料を生成。
  Task 一覧 / 決定事項 / 現在地 / 再開手順を含む
  HANDOVER-{slug}.md を project root に書き出す。commit はしない。
  "handover"、"引き継ぎ"、"次セッション"、"ハンドオーバー"、
  "session handover" 等で発動。
---

# handover

長時間セッションの context が上限に近い時、または user の明示要求時に、
次セッションが迷わず再開できる `HANDOVER-{slug}.md` を project root に書き出す。
slug はセッションの作業内容を表す英語 kebab-case (例: `refactor-auth-middleware`)。

## 責務境界

session-closing plugin は 2 skill を持つ。役割が違うので混同しない。

| skill | 目的 | 出力 |
| --- | --- | --- |
| retrospective | セッションで得た学びを rule / skill / CLAUDE.md に codify | 既存 .md の更新 + commit |
| handover | 次セッションへの状態引き継ぎ | project root の HANDOVER-{slug}.md (commit なし) |

retrospective を実行した後に handover を呼ぶ運用も、handover だけ呼ぶ運用も OK。

## 成果物

- project root の `HANDOVER-{slug}.md`
- slug はセッションの作業内容を表す英語 kebab-case (3-5 words)。
  例: `refactor-auth-middleware`, `investigate-session-leak`, `add-plugin-update-hook`
- 冒頭に「最初にすること」と「このセッション固有の注意事項」を置き、
  次セッションがファイルを読むだけで再開できる構成にする
- commit はしない。user / main session が任意に扱えるよう working tree に残すだけ

## 手順

### 1. ファイル名の決定

セッションの作業内容から slug を決める。

- 英語 kebab-case、3-5 words
- セッションの主たる作業を表す動詞 + 対象の形式
- ファイル名: `HANDOVER-{slug}.md`
- 万一 project root に同名ファイルがあれば末尾に timestamp (`-HHmmss`) を付けて回避

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
- セッション中に変更した rules / skills / agents / infra:
  `.claude/` 配下 (rules, skills, agents) や開発スクリプト (CI, build script 等) に
  加えた変更を洗い出す。次セッションが「前回何が変わったか」を把握するために必要。
  retrospective で codify 済みでも、handover に変更一覧として記録する
  (codify の内容と handover の文脈説明は別の責務)
- ユーザーから受けた重要なフィードバック・方針指示:
  user が明示した原則・方針・フィードバックを棚卸しする。
  codify 済みの場合でも、フィードバックの文脈 (何がきっかけで、どういう意図で) を
  handover に残す
- 開発環境・ツーリングの状態変更:
  MCP サーバー設定、hooks、agent model 選定、IDE 設定等のツーリング状態を棚卸しする。
  これらは `.claude/` の rules/skills とは別の関心事で、次セッションの初動に影響する

Task 情報は必ず TaskList から取得する。memory や推測では書かない。

### 3. HANDOVER-{slug}.md の生成

`${CLAUDE_SKILL_DIR}/references/handover-template.md` を読み込み、
`{...}` プレースホルダをセッション状態で埋める。
セッションの性質に応じて section を足し引きしてよい。

- `0.1 このセッション固有の注意事項`: 次セッションが最初に把握すべき
  固有の留意事項を書く (background process の扱い、触ってはいけないファイル、
  lint 無効化中のディレクトリなど)。ないなら「特になし」と明記する
- `8. 再開手順`: 実際の step 数に応じて `### Step N` を増減させる

### 4. 書き出し

埋めた内容を project root の `HANDOVER-{slug}.md` として書く。commit はしない。

### 5. 完了報告

以下を user に伝える。

- 書き出したファイル名 (例: `HANDOVER-refactor-auth-middleware.md`)
- 次セッション開始時に以下の prompt を貼れば再開できる想定:

  ```
  前の続きから始めたい。./HANDOVER-{slug}.md を読んで。
  ```

## 注意事項

- Task 情報は TaskList から取得する。memory や推測では書かない
- user が明示した原則・方針・feedback は必ず保持する。漏れると次セッションで再説明が要る
- ファイル path / commit hash / ブランチ名などの具体識別子は省略しない。次セッションが着手する起点になる
- commit しない。user / main session が任意に扱う
- handover 自体に持続的な知見を溜めない。次セッションで読み込み後に削除する前提で、知見は rule / plan / doc に分散させる
