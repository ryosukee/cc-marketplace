# claude-user-communication

ユーザーへの確認・提示のコミュニケーション方法を定める plugin。1 つの skill を提供する。

- html-communication: 入り組んだ説明・報告・確認を self-contained な HTML ページ（claude-html-communication）で提示する運用一式。
  index 管理・serve URL 提示・下書きプロトコル・PWA アセットの再生成（`templates/` に雛形を同梱）・
  HTML フォームの設問の作りと回答の受け取り

## 必要な環境変数

html-communication skill は配置先と配信 URL を環境変数から解決する。

| 変数 | 必須 | 内容 |
| --- | --- | --- |
| `CLAUDE_HTML_COMMUNICATION_DIR` | 任意 | claude-html-communication の配置先。未設定なら `~/.local/share/claude-html-communication` |
| `CLAUDE_HTML_COMMUNICATION_BASE_URL` | 実質必須 | 配信のベース URL（例: `https://<host>.<tailnet>.ts.net`）。未設定だと提示のたびにユーザー確認が入る |

値のセットアップ（シェルへの設定・配信側の構築）は環境側の文書の管轄で、この plugin には含まれない。
配信は tailnet 内限定の HTTPS 配信（Tailscale Serve 等）を想定している。
