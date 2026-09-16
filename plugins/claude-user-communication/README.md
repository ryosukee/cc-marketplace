# claude-user-communication

対応 CodingAgent: Claude Code + Codex。

調査報告・比較・確認を HTML ページで提示し、回答を記録する plugin。
`html-communication` skill と、提示前レビューの判定資料を両方で共有する。
Claude Code では同梱の名前付き agent、Codex では子 agent が判定資料を使う。

- html-communication: 入り組んだ説明・報告・確認を self-contained な HTML ページ（claude-html-communication）で提示する運用一式。
  本文は生成元 JSON（配信ディレクトリの `src/`）に書き、閲覧用 HTML は `assemble-page.mjs` だけが生成する
  （読み取り専用。書式は `references/page-format.md`）。回答は `record-answer.mjs` が JSON に記録し、
  ページ・index・archive を揃える。index 管理・閲覧先の提示・下書きプロトコル・PWA アセットの再生成
  （`templates/` に雛形を同梱）・HTML フォームの設問の作りと回答の受け取り
- 文のレビュー: form と report の両方で、意味の取れない文と未定義の呼び名を挙げる。生成元 JSON（と図の markup）だけを読む
- 内容のレビュー: form で一次情報、推奨・選択肢、設問の構成を確認する

## Requirements

- Node.js と `npx`: ページの生成・検査・回答記録に使う
- `jq`: 検査結果の集約に使う
- 提示前レビューを実行できる子 agent: Codex で使う場合に必要。利用できないときは、skill が未実施を伝えて続行の可否を確認する

## 必要な環境変数

html-communication skill は配置先と、配信する場合の URL を環境変数から解決する。
既存ページと共用するため、変数名と既定の保存先は Claude Code と Codex で同じにする。

| 変数 | 必須 | 内容 |
| --- | --- | --- |
| `HTML_COMMUNICATION_DIR` | 任意 | claude-html-communication の配置先。未設定なら `~/.local/share/claude-html-communication` |
| `HTML_COMMUNICATION_BASE_URL` | 任意 | 配信する場合のベース URL（例: `https://<host>.<tailnet>.ts.net`）。未設定ならローカルの HTML ファイルパスを提示する |

Claude Code では `settings.json` の `env` に値を設定する。

```json
{
  "env": {
    "HTML_COMMUNICATION_BASE_URL": "https://<host>.<tailnet>.ts.net"
  }
}
```

Codex では `~/.codex/config.toml` の `shell_environment_policy.set` に値を設定する。

```toml
[shell_environment_policy.set]
HTML_COMMUNICATION_BASE_URL = "https://<host>.<tailnet>.ts.net"
```

設定後に新しいセッションを開始する。
値のセットアップと配信側の構築は環境側の文書の管轄で、この plugin には含まれない。
配信は任意。ローカルファイルをそのままブラウザで開くか、Tailscale Serve 等で配信する。
Node.js または `npx` が使えなければ生成・検査は実行できない。
