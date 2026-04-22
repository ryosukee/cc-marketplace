# Architecture

この repo の管理設計をまとめたドキュメント。plugin 構成の判断基準、rules 配布の仕組み、hook 宣言方式、命名規則を扱う。個別 plugin の使い方は README.md と各 plugin の plugin.json を参照。

## Plugin 責務ポリシー

### 自己完結

plugin は skills / hooks / agents で自己完結する。rule の存在を暗黙前提にしない。前提となる振る舞いは SKILL.md や hook のドキュメント内に組み込む。

理由。

- rule は user global で、plugin を install したユーザー全員が同じ rule を持つとは限らない
- rule に依存する plugin は、rule を変更したときに skill の挙動が予期せず変わる
- rule と plugin でソースオブトゥルースが分散する

### 単機能 plugin を優先

plugin 粒度の原則。

- 1 つの目的に対して 1 plugin
- 関連する skills / hooks は同一 plugin 内で束ねる
    - 例: version-check plugin は hook でバージョンをキャプチャし、skill で update 情報を表示する。両者を同一 plugin に置くことで internal state を共有できる
- domain が異なるなら分ける
    - 例: markdownlint と security-guards は lint と security で domain が違うので別 plugin

### kernel パターン

hooks で状態を永続化する plugin は以下の構造を使う。

```text
my-plugin/
├── hooks/                    # イベントキャプチャ
├── internal/                 # 永続化された状態 (外部参照禁止)
├── scripts/api/              # skills や CLI がデータにアクセスする公開 I/F
└── scripts/lib/              # plugin 内共通ライブラリ
```

hooks は `${CLAUDE_PLUGIN_ROOT}/internal/` にデータを書き込む。skill や CLI は `${CLAUDE_PLUGIN_ROOT}/scripts/api/` 経由でアクセスし、internal/ を直接読まない。

## Rules 配布機構

### 配置方針

rule は plugin の外で管理する。plugin loader は plugin 内の `rules/` ディレクトリを読まないため、plugin に rule を同梱しても `~/.claude/rules/` に届かない。

cc-marketplace では repo 直下に `rules/` を置き、そこから `~/.claude/rules/cc-marketplace/` に symlink する。

### ディレクトリ構成

```text
cc-marketplace/
└── rules/
    ├── author-defaults/
    │   ├── ask-with-choices.md
    │   └── background-task.md
    └── markdown/
        ├── authoring.md
        └── anti-ai-authoring.md
```

subdir は Claude Code が再帰的に読み込むため、ディレクトリ単位でグループ化して整理できる。subdir 名で文脈が示せるなら、rule ファイル名から prefix を削る。例: `markdown/markdown-authoring.md` ではなく `markdown/authoring.md`。

### セットアップ手順

ghq 管理の clone 先から `~/.claude/rules/cc-marketplace` に dir symlink を 1 本張る。

```bash
ln -s ~/ghq_root/github.com/ryosukee/cc-marketplace/rules ~/.claude/rules/cc-marketplace
```

### 更新の流れ

- user 編集: `~/.claude/rules/cc-marketplace/...` を開いて編集する。symlink 経由で ghq clone の実体が更新される。`git commit / push` で repo に反映できる
- 他端末で追従: `git pull` を叩けば最新 rule が手元に降りる
- `plugin marketplace update cc-tools` とは独立した経路。plugin 機構の cache には触らない

### 複数 source との共存

`~/.claude/rules/` 直下には複数の source を subdir として並べられる。例。

```text
~/.claude/rules/
├── cc-marketplace/     # cc-marketplace repo からの symlink
└── dotfiles/           # dotfiles repo からの symlink (将来)
```

subdir で名前空間が分かれるため、source 間でファイル名が衝突しない。新しい source を追加したいときは repo を clone して `ln -s` を追加するだけ。

## Hook 宣言方式

plugin に属する hook は plugin.json (実体は `hooks/hooks.json`) で宣言する。`~/.claude/settings.json` に直接書かない。

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

`${CLAUDE_PLUGIN_ROOT}` は hook 実行時に現在有効な plugin version dir を動的解決する。`claude plugin update` で version が切り替わると、hooks.json と scripts/hooks/ の両方が新 version のものに atomic に追従する。

settings.json に hook を直書きしない理由。

- plugin update で自動追従しない。user が手動で path を書き換える必要が出る
- plugin 未インストール時は script の実体が存在しないのに宣言だけ残る
- plugin で管理すべき hook が user global 設定に漏れ出す

## Markdownlint 設定の継承

markdownlint plugin は hook 実行時に以下の順で config を探索する。

1. 対象ファイルから上方向に `.markdownlint*` / `.markdownlint-cli2*` を探す (repo-local)
1. なければ `~/.markdownlint.jsonc` を使う (user global)
1. それもなければ plugin 同梱の `${CLAUDE_PLUGIN_ROOT}/config/.markdownlint.jsonc` を使う

markdownlint-cli2 自体は対象ファイルから上方向にしか探索しない。plugin 同梱 default へのフォールバックは hook script の bash ロジックで実装している。

plugin 同梱 default は「どの repo にも `.markdownlint*` がなく、user の home にも `~/.markdownlint.jsonc` がない」ケースに備える安全側のデフォルト。MD013 (line-length) など過度に厳しいルールは無効化してある。

## 命名規則

### Plugin 名

- kebab-case
- 単機能なら 1 語: `markdownlint`
- 複合なら `{domain}-{action}`: `version-check`、`plugin-update`、`session-closing`、`mkdocs-setup`
- 複数形で「受け入れ枠」を示すこともある: `security-guards` (credentials 保護系を広く受け入れる)

### Rule ファイル名

- kebab-case、名詞句
- subdir で文脈が示せるなら prefix を削る
    - 例: `markdown/authoring.md` (subdir: markdown)、`author-defaults/ask-with-choices.md` (subdir: author-defaults)

### Script ファイル名

- kebab-case
- API スクリプト: `{verb}-{noun}.sh` (例: `get-current-session-id.sh`)
- hook script: `{event}.sh` or `{action}-{target}.sh` (例: `session-start.sh`、`deny-netrc-write.sh`、`markdownlint-post.sh`)

### Rules subdir (target)

`~/.claude/rules/` 配下の subdir 名は source repo 名を使う。例: cc-marketplace repo の rule は `~/.claude/rules/cc-marketplace/`。複数 source を共存させるときも一貫して repo 名で分ける。
