# session plugin

セッションのライフサイクルを管理する。コンテキスト復元、棚卸し、学びの codify、引き継ぎ資料の生成までを一貫して行う。

## skills

| skill | 発動例 | 概要 |
| --- | --- | --- |
| start | 「続きから」「今日の作業」 | 前回 handover の読み込み、タスク復元、方向提案 |
| end | 「セッション終了」「今日はここまで」 | debrief → retrospective → handover のオーケストレーター |
| debrief | 「棚卸し」「状態確認」 | 物理状態、タスク管理、完了事項、未完了の洗い出し → draft に記録 |
| retrospective | 「振り返り」「codify」 | 学びの codify (rules/skills/CLAUDE.md 更新 → commit) |
| handover | 「引き継ぎ」 | draft の最終化、タスク分類、todo/ への移動、reviewer による検証 |

## agents

| agent | 概要 |
| --- | --- |
| handover-reviewer | handover の妥当性を 3 観点 (背景/進捗/手順) で検証する read-only agent |

## .handover/ ディレクトリ

各プロジェクトの root に作成される。初回 start 時にユーザーに確認して作成する。

```
.handover/
├── draft/        # 進行中セッションの記録 (最大 1 ファイル)
├── todo/         # 確定済み・次セッションで未消化
└── archive/      # start で読み込み済み (全件保持)
```

ファイル名は slug 方式 (例: `refactor-auth.md`)。

## フロー

```
session:start
  .handover/todo/ を全件 Read → ユーザーに提示・判断委譲
  → TaskCreate 対象を復元 → todo/ を archive/ に移動
  → .handover/draft/{slug}.md 作成 (★ draft 生成)
  → 方向提案

(作業中: draft は start で作成されたまま待機)

session:end
  → session:debrief
      会話コンテキストから抽出 → draft に追記 (★ draft なければ新規作成)
  ↓ ユーザー確認 (スキップ可)
  → session:retrospective
      学びの codify → commit
  ↓ ユーザー確認 (スキップ可)
  → session:handover
      draft を最終化 → draft/ から todo/ に移動 (★ draft → todo)
  → handover-reviewer (妥当性検証)
```
