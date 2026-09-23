# 実行記録の下調べ（2026-09-24）

本体: [コーディングエージェントの実行記録サービス](../agent-run-records-service.md)

Claude Code 2.1.280・codex-cli 0.156.1 の手元の記録と、feedmarks の仕組みを調べた結果。調査は subagent（opus）が行い、メインのセッションが要件と突き合わせて受け取った。

## 依頼の記録の所在

「feedmarks の仕組みを全てのセッションへ」という依頼は、2026-09-24 より前のファイルには無い。
近い発言は `~/.claude/history.jsonl` の 2026-04-24 の 3 件（kanban-agent-orchestrator のプロジェクト。
「feedmarks でやってるような meta-review 系を取り入れたい」と、workflow の実行記録を使って meta-review 系を並列で回す案）。
kanban-agent-orchestrator の `docs/meta-dev/log/resume-prompt/0022.md` の 44 行と `0023.md` の 22〜24 行にも残るが、全セッションへ広げる話ではない。

## feedmarks の実行記録の仕組み

- 記録: 実装パイプライン team-implement を `claude -p --output-format stream-json --verbose` で起動し、出力を実行ごとの jsonl に tee で保存する。
  Claude 版の起動スクリプトは git 履歴 `ad18364:.claude/skills/team-implement/scripts/run-team-implement.sh` にある。
  `.claude/audit-logs/{date}_{plan}/` に `plan.md` の写しと `team-implement.jsonl`、実行ごとに `run-history.jsonl` へ 1 行。
  置き場は worktree ではなく main repo 側（worktree を消すと記録も消えた問題への対策、aedbaa8）
- 量: 108 実行分、155M、2026-04-14〜05-25。git 管理の外
- 前処理: `.claude/scripts/split-jsonl.py` が `parent_tool_use_id` で agent 別に分け、ツール別の回数や出力の文字数を `summary.json` にまとめる
- 分析 agent（opus、書き込み先は proposals だけ）:
    - `.claude/agents/meta-process-review.md`: 試行錯誤、責務の逸脱、インフラの欠け
    - `.claude/agents/token-efficiency-review.md`: 出力の出しすぎ、ツールの選び違い、重複した呼び出し、model の選び方。削れるトークン数も見積もる
    - `.claude/agents/meta-review.md`: rule・agent・spec とコードの食い違い。実行記録は読まず、コードベースを見る
- 運用: `.claude/scripts/append-proposal.sh` が `.claude/proposals/{agent}.md` へ追記し、`.claude/skills/review-cycle/SKILL.md` の 39〜76 行が
  3 agent を並列で回す。直近の jsonl を渡すのは meta-process-review と token-efficiency-review の 2 つだけ（48〜54 行）。
  結果を H→M→L の順に 1 件ずつユーザーに承認・却下・後回しを問う
- 記録の対象は team-implement の実行だけで、対話セッションは記録しない。実装が Codex へ移った後は、Codex 版が手書きの `run.md` を残すだけ
- 同じ仕組みが coin-game にもある（`CLAUDE.md` の 51・67 行）

## Claude Code と Codex のセッション記録

| | Claude Code | Codex |
| --- | --- | --- |
| 置き場 | `~/.claude/projects/<encoded-cwd>/<session>.jsonl`。subagent は `<session>/subagents/agent-*.jsonl` と `.meta.json` | `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` |
| 量（2026-09-24） | 58 project、本体 182、subagent 1,192、1.7G | 415 本（本体 168、subagent 247）、817M |
| 最古 | 2026-08-24（更新日時） | 2025-09-01 |
| 保持期間 | `cleanupPeriodDays` 未設定。既定 30 日で、期限を過ぎた transcript・subagents・tool-results・file-history・plans・debug・paste-cache・tasks などを消す（消す時点と起点は公式に記述が無く未確認） | 保持期間の公式の記述は見つからない（未確認）。実測では 1 年以上前の記録が残る |
| トークン | 各 `assistant` 行の `message.usage`（input・output・cache_creation・cache_read） | `event_msg` の `payload.type == "token_count"` の `info.total_token_usage`・`last_token_usage`・`model_context_window` |
| subagent | 別ファイル。assistant 行に `isSidechain: true` と `agentId`。`.meta.json` に agentType・description・toolUseId・spawnDepth・model | 別の rollout。`session_meta.payload.source.subagent.thread_spawn.parent_thread_id` と `depth` で親をたどれる |
| システムプロンプト | `attachment.type == "prompt_snapshot"` の `systemPrompt`（2.1.261 から）。rule・CLAUDE.md は `instructions`、環境は `environment`・`session_context` | `session_meta.payload.base_instructions` |

※ 表 1 Claude Code と Codex のセッション記録の比較

Claude Code の保持期間の出典: [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory) の「The default is 30 days and the minimum is 1; setting `0` fails with a validation error.」。
Codex の出典: [config reference](https://learn.chatgpt.com/docs/config-file/config-reference) にあるのは `history.persistence` と `history.max_bytes` だけ。

その他の記録: `~/.claude/history.jsonl`（入力したプロンプトの履歴。削除の対象外）、`~/.codex/history.jsonl`、
`~/.codex/thread_history_1.sqlite` と `logs_2.sqlite`（中身は未確認）。

## 実行記録を読む既存の取り組み

transcript のファイルを継続的に読んで改善につなげているのは、feedmarks と coin-game の review-cycle だけ。

- session plugin の retrospective: いまの会話だけを材料にし、transcript は読まない
- cc-transcript plugin: 現セッションの jsonl の直近 N 件を markdown にして開く閲覧用。永続化しない
- 事例集 2 本: レビュー指摘を手で集めている
- claude-known-issues: changelog と再現手順の突合で、transcript は読まない
- html-communication: 確認フォームの回答を JSON に逐語で残す
