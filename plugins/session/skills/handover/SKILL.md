---
name: handover
description: >-
  次セッションへの引き継ぎ資料を確定する。
  draft を最終化し、タスク分類を行い、todo/ に移動する。
  "引き継ぎ"、"handover"、"session handover" 等で発動。
---

# handover

draft のセッション記録を最終化し、次セッションが迷わず再開できる引き継ぎ資料を確定する。

## ワークフロー

### ステップ 1: draft の確認

`${CLAUDE_PLUGIN_ROOT}/references/handover-init.md` を Read し、記載された手順に従って `.handover/` の存在確認と初期化を行う。

対象 draft は `handover-init.md` の「draft の特定」に従う。

draft が存在しない場合:

- セッションの会話コンテキストから引き継ぎに必要な情報を収集する
- `${CLAUDE_SKILL_DIR}/references/handover-template.md` をもとに新規作成する

### ステップ 2: 内容の補完

draft の各セクションを確認し、不足があれば補完する。
テンプレートの全セクションが埋まっている必要はないが、
最低限以下が含まれていることを確認する:

- 背景 (何をしていたか)
- ゴール・原則 (ユーザーが明示した方針)
- 現在地 (どこまで進んだか)
- 再開手順 (次セッションが最初にやること)

### ステップ 3: タスクの分類

draft に記載された未完了タスク + TaskList を以下に分類する:

- **TaskCreate 対象**: 次セッションで TaskCreate で復元すべき具体的タスク。
  handover 内に `## 復元タスク` セクションとして記載する
- **箇条書き参考**: タスクとして追跡するほどではないが、次セッションが知っておくべき情報。
  「やり残し・拾い残し」セクションに記載する
- **破棄**: 不要になったもの。handover に含めない

分類はユーザーに確認する。

### ステップ 4: slug の確定

draft のファイル名 (slug) がセッション内容を適切に表しているか確認する。
draft のファイル名 (slug) がセッション内容を適切に表していなければ変更する。

### ステップ 5: draft → todo への移動

draft を `.handover/todo/` に移動する。

### ステップ 6: handover-reviewer による検証

handover-reviewer agent を起動し、確定した handover の妥当性を検証する。
指摘があればユーザーに提示し、修正するかどうか確認する。

### ステップ 7: 完了報告

以下をユーザーに伝える:

- handover のファイルパス
- 次セッション開始方法: `/session:start`

## 注意事項

- ユーザーが明示した原則・方針・feedback は必ず保持する
- ファイル path / commit hash / ブランチ名などの具体識別子は省略しない
- commit しない。working tree に残す
