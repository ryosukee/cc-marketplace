---
name: review
description: Claude Code の既知バグ一覧を突合し、ワークアラウンドを解除できるかを判定する。更新検知の通知 ([known-issues] で始まる通知) を受けたとき、"既知バグ 突合"、"known-issues review"、"一覧チェック" 等で発動。引数 full で全件突合。
---

# 既知バグ一覧の突合

判定は known-issues-reviewer agent が行い、この skill は起動と反映を担う。

## 実行モード

- 引数なし: 差分突合。前回突合した版から現在までの changelog に、一覧のエントリを解決する変更があるかを見る。
  Claude Code の更新を SessionStart hook が検知するたびに通知される通常の経路
- `full`: 全件突合。changelog ではなく、一覧の全エントリの `how_to_verify` を実行して、
  期待結果と違うものを解除候補にする。手動で実行する

## ワークフロー

### ステップ 1: 状態と一覧の解決

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; resolve_ledger; resolve_state; \
    echo "LEDGER=$LEDGER_PATH"; echo "STATE=$STATE_PATH"; cat "$STATE_PATH"'
```

状態を見るだけなら `cat "$STATE_PATH"`、現在の版は `claude --version`、未解決の件数は
`grep -c '^  - id:' "$LEDGER_PATH"`。

### ステップ 2: agent の起動

`known-issues-reviewer` agent を **background で** 起動する。プロンプトに渡すもの:

- `LEDGER`: ステップ 1 で解決した一覧のパス
- `FROM`: `reviewed_version`（`full` では不要）
- `TO`: `pending_version` があればその値、なければ現在の版
- `MODE`: `diff` または `full`

agent は一覧と state を編集しない。`how_to_verify` の実行でプローブファイルを作ることはあり、
自分で消す。

### ステップ 3: 結果の反映

1. 各エントリの `log` に、agent の追記案の 1 行を加える
2. 解除候補があれば、エントリの `dependents` をユーザーに提示し、解除してよいか確認する。
   承認されたら dependents の各場所を直し、エントリに `resolved_at`（日付）と
   `resolved_version` を足して `known-issues.resolved.yml` へ移す。
   最後に `grep -c resolved_at known-issues.yml` が 0 であることを確かめる（移し忘れの検知）
3. プローブの残存を確かめる: `find ~/.claude "$PWD" -name '.known-issues-probe-*'` が空でなければ消し、
   log に書く
4. state を更新する。差分では `reviewed_version` を TO に、`pending_version` を null に。
   全件では `last_full_review_at` を更新し、`reviewed_version` は進めない

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; \
    state_set "reviewed_version=<TO>" "pending_version=null" \
      "last_review_at=<ISO8601>" "last_result=<no_match|matched|error>"'
```

agent が `error` を報告した場合は `reviewed_version` を進めない。次回の起動で再試行される。

## 全件突合を回す時期

- 導入直後（state の `last_full_review_at` が null のあいだ、SessionStart hook が通知する）
- 前回の全件突合から 180 日を超えたとき（同じく hook が通知する）
- 差分突合の判定を誤った可能性を疑うとき
