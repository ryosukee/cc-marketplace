# session-closing

セッション終盤の作業を束ねる plugin。3 つの skill を提供する。

## 設計方針

- ファイルとして残るのは `HANDOVER-{slug}.md` だけ (使い捨て前提)
- 永続化すべき知識は retrospective で rules/skills/CLAUDE.md に codify する
- やり残し (完了予定だったが未完了) と拾い残し (言及されたが未着手) の 2 分類で整理する。
専用ファイル (TODO.md, ideas.md 等) は作らない。陳腐化しやすく振り返られなくなるため
- セッション開始は「HANDOVER を読んで」だけでよい。
専用の session-open skill は不要
- 並行セッションの合流も複数の HANDOVER を読ませるだけでよい。
専用の session-append skill は不要

## skill

| skill | 概要 | 出力 |
| --- | --- | --- |
| retrospective | セッションの学びを rules/skills/CLAUDE.md に codify し 1 commit にまとめる。skill/rule の妥当性検証、やり残し・拾い残しの洗い出しも行う | 既存 .md の更新 + commit |
| handover | context 逼迫時や明示要求時に次セッションへの引き継ぎ資料を生成。やり残し・拾い残し・残タスクも含む | project root の `HANDOVER-{slug}.md` (commit なし) |
| session-close | retrospective → handover を順に実行するオーケストレーター | 両 skill の出力の合算 |

## 使い分け

- session-close を呼べば retrospective + handover が順に走る
- retrospective だけ、handover だけの単独実行も可
- retrospective = 学びの永続化 (知識層)、handover = 実行状態の引き継ぎ (運用層) で責務が異なる

## セッションライフサイクル

```text
(前セッション) handover → HANDOVER-{slug}.md
                                │
(次セッション) 「HANDOVER を読んで」で再開
                                │
                             [作業]
                                │
                          session-close
                           ├─ retrospective (学びを codify → commit)
                           └─ handover (状態を HANDOVER-*.md に書き出し)
```
