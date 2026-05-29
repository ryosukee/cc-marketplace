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

状態を永続化する plugin は `internal/` に state を置き、その state に触れるスクリプトを
plugin 内に閉じ込める。他 plugin や外部から `internal/` を参照させない。

スクリプトは役割で 3 つに分ける。「外部公開 API」層は作らない。
plugin の外から呼ばれる消費者 (外部 CLI・他 plugin) は存在しないため、
`scripts/api/` のような公開 I/F の名前付けはしない。

```text
my-plugin/
├── internal/            # 永続化された状態。plugin の外から参照しない
├── scripts/
│   ├── hooks/           # hook 実装 (hooks.json から起動)
│   ├── lib/             # source 用の共通ヘルパ (状態解決・移行など)
│   └── *.sh             # skill / hook が invoke する plugin 内エントリスクリプト
└── skills/{skill}/
    └── scripts/         # その skill だけが使うスクリプト
```

- hooks は `${CLAUDE_PLUGIN_ROOT}/internal/` に state を書く
- skill / hook は `scripts/` 配下のスクリプト経由で state に触れ、
  `internal/` のファイル形式を SKILL.md (markdown) に直書きしない
- 複数 skill / hook が共有するスクリプトは `scripts/`、
  単一 skill 専用は `skills/{skill}/scripts/` に置く

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
