# cc-marketplace

個人用 Claude Code plugin marketplace (`cc-tools`)。1 marketplace / multi plugin 構成。

## プラグイン

### Utility

| plugin | version | 概要 |
| --- | --- | --- |
| version-check | 0.10.0 | Claude Code のバージョン追跡。hooks でバージョンをキャプチャし、更新検知・changelog 表示 |
| plugin-update | 0.4.0 | SessionStart 時にプラグインの更新を検知・通知 |
| cache-keepalive | 0.7.3 | prompt cache (extended cache, TTL 1h) の expire 前に keepalive を自動発火 |
| cc-transcript | 0.7.0 | 現在セッションの直近やり取りを jq で整形して vim で開く |

### dotclaude

| plugin | version | 概要 |
| --- | --- | --- |
| dotclaude | 0.14.0 | `.claude/` を参考リポジトリと原則に基づいて診断・合成・相互レビュー。doctor / cross-review / registry の 3 skill |

### session

| plugin | version | 概要 |
| --- | --- | --- |
| session | 2.3.1 | セッションのライフサイクル管理。start (コンテキスト復元) / debrief (棚卸し) / retrospective (学びの codify) / handover (引き継ぎ資料) / end (オーケストレーター) + handover-reviewer agent |

### impl-spec

| plugin | version | 概要 |
| --- | --- | --- |
| impl-spec | 0.5.4 | 実装のための仕様策定。requirements / design / test-plan の 3 skill + spec-reviewer agent |

### Authoring / tooling

| plugin | version | 概要 |
| --- | --- | --- |
| markdownlint | 0.3.2 | Write/Edit 後に markdownlint-cli2 を実行し lint エラーをフィードバック |
| mkdocs-setup | 0.2.0 | mkdocs-material のセットアップ手順とテンプレート |
| security-guards | 0.2.0 | credentials 保護。.netrc への Write/Edit/Read をブロック |
| dotclaude-writer | 0.4.0 | `.claude/` protected directory への書き込みワークアラウンド |
| japanese-text-writing | 0.1.2 | 日本語テキストの執筆規範。共通原則 + 種類別（参照・判断・論文・解説・読み物）の規範 skill |

## インストール

```bash
# marketplace を追加
claude plugins marketplace add https://github.com/ryosukee/cc-marketplace.git

# plugin をインストール (必要なもののみ)
claude plugins install version-check@cc-tools
claude plugins install plugin-update@cc-tools
claude plugins install cache-keepalive@cc-tools
claude plugins install cc-transcript@cc-tools
claude plugins install dotclaude@cc-tools
claude plugins install session@cc-tools
claude plugins install impl-spec@cc-tools
claude plugins install markdownlint@cc-tools
claude plugins install mkdocs-setup@cc-tools
claude plugins install security-guards@cc-tools
claude plugins install dotclaude-writer@cc-tools
claude plugins install japanese-text-writing@cc-tools

# rules の symlink
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

## アップデート

```bash
# marketplace を更新 (git pull)
claude plugins marketplace update cc-tools

# plugin を再インストール (新バージョンの cache を作成)
claude plugins install version-check@cc-tools
```

状態データ (version-check のバージョン記録など) は各 plugin の resolve スクリプトが旧キャッシュから自動引き継ぎするため、手動マイグレーション不要。
