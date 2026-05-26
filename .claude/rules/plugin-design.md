# Plugin 設計原則

## Plugin 自己完結

plugin は skills / hooks / agents で自己完結する。rule の存在を暗黙前提にしない。
前提となる振る舞いは SKILL.md や hook のドキュメント内に組み込む。

- rule は user global で、install したユーザー全員が同じ rule を持つとは限らない
- rule に依存する plugin は、rule を変更したときに skill の挙動が予期せず変わる
- rule と plugin で source of truth が分散する

## 単機能 plugin

- 1 つの目的に対して 1 plugin
- 関連する skills / hooks は同一 plugin 内で束ねる (internal state を共有できる)
- domain が異なるなら分ける

## Internal 隔離 (kernel パターン)

hooks で状態を永続化する plugin は以下の構造を使う。

```text
my-plugin/
├── hooks/                    # イベントキャプチャ
├── internal/                 # 永続化された状態 (外部参照禁止)
├── scripts/api/              # skills や CLI がデータにアクセスする公開 I/F
└── scripts/lib/              # plugin 内共通ライブラリ
```

hooks は `${CLAUDE_PLUGIN_ROOT}/internal/` にデータを書き込む。
skill や CLI は `${CLAUDE_PLUGIN_ROOT}/scripts/api/` 経由でアクセスし、internal/ を直接読まない。

## Hook 宣言方式

plugin に属する hook は plugin.json (実体は `hooks/hooks.json`) で宣言する。
`~/.claude/settings.json` に直接書かない。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/my-hook.sh"
          }
        ]
      }
    ]
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` は hook 実行時に現在有効な plugin version dir を動的解決する。
settings.json に hook を直書きしない理由:

- plugin update で自動追従しない
- plugin 未インストール時に script の実体がないのに宣言だけ残る
- plugin で管理すべき hook が user global 設定に漏れ出す

## Rules 配布

rule は plugin の外で管理する。plugin loader は plugin 内の `rules/` を読まないため、
repo 直下の `rules/` に置き、`~/.claude/rules/cc-marketplace` への dir symlink で配布する。

## CLI は plugin の外

CLI は marketplace ルートの `bin/` に置き、plugin システムとは別ライフサイクルで管理する。
`cc-tools <plugin> <command> [args...]` の形式で、`installed_plugins.json` から
plugin のキャッシュパスを解決し `scripts/api/` に delegate する。
