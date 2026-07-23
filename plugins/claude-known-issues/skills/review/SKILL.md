---
name: review
description: Claude Code の既知バグ台帳と changelog を突合し、ワークアラウンドを解除できるかを判定する。更新検知の通知 ([known-issues] で始まる通知) を受けたとき、"既知バグ 突合"、"known-issues review"、"台帳チェック" 等で発動。引数 full で全件再突合、status で状態表示。
---

# 既知バグ台帳の突合

Claude Code の更新に、台帳の open エントリを解決する修正が含まれているかを判定する。
判定は known-issues-reviewer agent が行い、この skill は起動と反映を担う。

## 実行モード

引数で分岐する。

- 引数なし: 差分突合。前回突合済みバージョンから現在までの changelog を見る（通常の経路）
- `full`: 全件再突合。突合済みの記録を無視し、open エントリ全件を現在のバージョンに対して調べ直す
- `status`: 状態表示。突合の生存確認だけを行い、agent を起動しない

## ワークフロー

### ステップ 1: 状態と台帳の解決

Bash で以下を実行し、台帳と状態のパスを解決する（台帳が無ければテンプレートから初期化される）。

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; resolve_ledger; resolve_state; \
    echo "LEDGER=$LEDGER_PATH"; echo "STATE=$STATE_PATH"; cat "$STATE_PATH"'
```

### ステップ 2: status モードの場合

以下を表示して終了する。agent は起動しない。

- 最後に突合した日時（`last_review_at`）と、そのときの結果（`last_result`）
- 突合済みバージョン（`reviewed_version`）と、現在のバージョン（`claude --version`）
- 未完了の突合が残っているか（`pending_version` が null でないか）
- 依存コマンドの有無: `command -v gh` と `command -v jq`
- 台帳の open エントリ数

`last_result` が `error` のまま、または `last_review_at` が古いまま更新されていない場合は、
沈黙が「該当なし」ではなく故障による可能性を明示する。

### ステップ 3: agent の起動

`known-issues-reviewer` agent を **background で** 起動する。
プロンプトには次を渡す。

- `LEDGER`: ステップ 1 で解決した台帳のパス
- `FROM`: `reviewed_version`（`full` モードでは不要）
- `TO`: `pending_version` があればその値、なければ現在のバージョン
- `MODE`: `diff` または `full`

agent は read-only で、判定結果と更新案だけを返す。

### ステップ 4: 結果の反映

agent の報告を受けて、次を行う。

1. **台帳の log に追記する**: 各 open エントリの `log` に、agent の追記案の 1 行を加える
2. **状態ファイルを更新する**: `reviewed_version` を突合した TO に、`pending_version` を null に、
   `last_review_at` と `last_result` を更新する。
   `full` モードでは `reviewed_version` を進めない（差分の起点を変えないため）

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; \
    state_set "reviewed_version=<TO>" "pending_version=null" \
      "last_review_at=<ISO8601>" "last_result=<no_match|matched|error>"'
```

**該当ありの場合**は、エントリの `release_steps` をユーザーに提示し、解除作業を実行してよいか確認する。
承認されたら手順を実行し、完了後にエントリの `status` を `resolved` に変更する。

agent が `error` を報告した場合は `reviewed_version` を進めない。次回の起動で再試行される。

## 見逃しからの回復

差分突合は、一度「該当なし」と判定した版を二度と読み返さない。
判定を誤った可能性を疑うとき、または半年に一度程度の定期点検として `full` モードを実行する。
`full` は changelog ではなく issue の現在の状態を直接確認するため、
changelog の記述漏れによる見逃しも拾える。
