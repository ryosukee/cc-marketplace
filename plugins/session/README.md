# session

対応 CodingAgent: `Claude Code + Codex`

作業セッションの開始、棚卸し、振り返り、次セッションへの引き継ぎを管理する plugin。
Claude Code と Codex は同じ `.handover/` の資料を読み書きする。
セッション中の作業タスクは draft に記録し、終了時に次回へ残す作業を選ぶ。

## 提供する skill

| skill | 役割 |
| --- | --- |
| start | 前回の引き継ぎ資料を読み、再開する作業をユーザーに提案する |
| debrief | 作業状態と未完了事項を棚卸しし、draft に記録する |
| retrospective | 学びの明文化を提案し、承認された内容を反映する |
| handover | draft を確定し、機械検査と意味のレビューを行う |
| end | debrief → retrospective → handover を順に実行する |

Claude Code 用 skill は `claude-skills/`、Codex 用 skill は `codex-skills/` に分ける。
両方の SKILL.md は同じ `references/{skill名}.md` の手順を読み、
呼び出し方法だけを CodingAgent ごとに定める。作業タスク・テンプレート・レビュー観点と
`scripts/check-handover.mjs` の機械検査も共用する。

Claude Code の `handover` は同梱の `handover-reviewer` agent を呼ぶ。
Codex の `handover` は利用可能な子 agent に編集を禁止し、共通レビュー観点を渡す。
子 agent が使えないときは、独立レビューを省略したことを報告する。

## 必要な環境

- Node.js
    - `check-handover.mjs` の実行に使う。`node --version` で確認する
- Git
    - 作業状態と handover の識別子の検査に使う。`git --version` で確認する

不足するコマンドは利用する OS の手順で導入する。`node` が実行できなければ
handover の機械検査を完了できない。`git` が実行できなければ作業状態を検証できない。
どちらも検証済みとして扱わず、ユーザーへ不足項目を伝える。

## 引き継ぎ資料

`.handover/` は作業ディレクトリまたは Git root に置く。探索と初回作成の手順は
[handover-init.md](./references/handover-init.md) にまとめている。

```text
.handover/
├── draft/    # 進行中セッションの記録
├── todo/     # 次セッションで読む確定済み資料
└── archive/  # 読み終えた資料
```

引き継ぎ資料を commit せず、作業リポジトリの working tree に残す。
