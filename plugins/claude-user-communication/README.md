# claude-user-communication

ユーザーへの確認・提示のコミュニケーション方法を定める plugin。1 つの skill と 2 つの agent を提供する。

- html-communication: 入り組んだ説明・報告・確認を self-contained な HTML ページ（claude-html-communication）で提示する運用一式。
  本文は生成元 JSON（共通ページディレクトリの `src/`）に書き、閲覧用 HTML は `assemble-page.mjs` だけが生成する
  （読み取り専用。書式は `references/page-format.md`）。回答は `record-answer.mjs` が JSON に記録し、
  ページ・index・archive を揃える。index 管理・serve URL 提示・下書きプロトコル・PWA アセットの再生成
  （`templates/` に雛形を同梱）・HTML フォームの設問の作りと回答の受け取り
- sentence-reviewer: 提示前に、意味の取れない文と、ページ内に定義の無い呼び名を挙げる agent。生成元 JSON（と図の markup ファイル）だけを読み、一次情報も議題の説明も受け取らない
- page-reviewer: 提示前に、一次情報との突合・推奨と選択肢集合の妥当性・構成と設問の自立性を見る agent。入力は生成元 JSON

## 必要な環境変数

html-communication skill は配置先と配信 URL を環境変数から解決する。

| 変数 | 必須 | 内容 |
| --- | --- | --- |
| `CLAUDE_HTML_COMMUNICATION_DIR` | 任意 | claude-html-communication の配置先。未設定なら `~/.local/share/claude-html-communication` |
| `CLAUDE_HTML_COMMUNICATION_BASE_URL` | 実質必須 | 配信のベース URL（例: `https://<host>.<tailnet>.ts.net`）。未設定だと提示のたびにユーザー確認が入る |

値のセットアップ（シェルへの設定・配信側の構築）は環境側の文書の管轄で、この plugin には含まれない。
配信は tailnet 内限定の HTTPS 配信（Tailscale Serve 等）を想定している。
