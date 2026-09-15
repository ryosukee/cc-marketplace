---
paths:
  - "never-match-reference-only"
---

# Claude Code 固有の plugin 設計

## Hook の state

`${CLAUDE_PLUGIN_ROOT}/internal/` に書く形は deprecated で、version-check だけが使う。
新しい hook の state は
[両対応の設計方針](../../../../docs/cross-client-architecture.md#環境変数と-state-の置き場)に従う。

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

## 監視機構の選択

plugin が「何かをきっかけに動く」宣言的機構には hook と monitor があり、前提が違う。
用途で選ぶ。

- 1 回きりの検知 (セッション開始時のバージョン確認、Write/Edit の前後処理) は hook。
  hook は起動 → 実行 → exit する one-shot が前提で、stdout の JSON がその場でモデルや
  ユーザーに渡る (`additionalContext` / `systemMessage`)
- 継続的な監視 (ログの tail、ファイル変更の追跡) は monitor。
  monitor は Claude Code が persistent Monitor task として arm する常駐ストリームが前提で、
  stdout の 1 行ごとがイベントになる

monitor に one-shot スクリプトを置いてはいけない。即 exit したストリームを Claude Code が
「stream ended」として検知し、毎回無意味な終了通知が出る。その時点で task は reap 済みのため、
`TaskOutput` も `.output` も読めず調査もできない。逆に、常駐監視を hook で書くと timeout で殺される。

判断基準: 通知が要るのが「起動時に 1 回」なら hook、「起きるたびに何度でも」なら monitor。

> 情報源: Claude Code v2.1.218 バイナリの plugin manifest スキーマ<br>
> "Background watch scripts the host arms as persistent Monitor tasks ... monitors/monitors.json
> at the plugin root is loaded if present." monitor が persistent 前提であることの一次情報。

## 宣言ファイルに渡る変数

`${CLAUDE_PLUGIN_ROOT}` は hook では env と文字列置換の両方で受け取るが、
monitor では文字列置換のみ。別の宣言機構でも同じ渡し方だと仮定しない。

## 環境固有の値は settings.json の env に置く

plugin の skill / hook が環境固有の値 (ホスト名込みの URL、マシン固有のパス) を
必要とするとき、その値はシェルの設定ファイルではなく Claude Code の
`settings.json` の `env` に置く。SKILL.md に置き場を書くときもこれを指定する。

- `settings.json` の `env` は起動元シェルに依存せず全セッションに適用される。
  シェル側に置くと、値を追加する前から起動していたセッションには入らない
- 値は展開されずそのまま渡る。`~` や `$HOME` は使えないため絶対パスで書く
- 既定値で足りる値は設定しない。skill 側に既定値を書き、環境ごとに違う値だけを env に置く
