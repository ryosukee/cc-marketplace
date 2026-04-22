# session-closing

セッション終盤の作業を束ねる plugin。2 つの skill を提供する。

## skill

| skill | 概要 | 出力 |
| --- | --- | --- |
| retrospective | セッションで得た学びを rules/skills/CLAUDE.md に codify し 1 コミットにまとめる。やり残しと次アクション提案も提示 | 既存 .md の更新 + commit |
| handover | context 逼迫時や明示要求時に次セッションへの引き継ぎ資料を生成 | project root の `HANDOVER-{slug}.md` (commit なし) |

## 使い分け

retrospective を実行した後に handover を呼ぶ運用も、handover だけ呼ぶ運用も可。
retrospective は codify（学びの永続化）、handover は状態引き継ぎ（次セッションの再開支援）と責務が異なる。
