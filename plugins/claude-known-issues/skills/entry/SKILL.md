---
name: entry
description: Claude Code の既知バグ・制約を台帳に追記する。新しいバグ・制約に当たってワークアラウンドを作ったとき、既存エントリのログを更新するとき、"既知バグ 追記"、"known-issues entry"、"台帳に追加" 等で発動。
---

# 既知バグ台帳への追記

Claude Code のバグ・制約に対してワークアラウンドを作ったら、この台帳に記録する。
記録しないと、修正されたときに解除する手がかりが失われる。

## 台帳の場所

実体は `${CLAUDE_PLUGIN_DATA}/known-issues.yml`。
無ければ `${CLAUDE_PLUGIN_ROOT}/config/known-issues.template.yml` から初期化される。

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; resolve_ledger; echo "$LEDGER_PATH"'
```

## エントリの型

```yaml
- id: kebab-case-の識別子
  title: 一行のタイトル
  kind: バグ | 仕様
  status: open | resolved | permanent
  summary: |
    何が起きるか。再現条件があれば含める
  affected: 影響するバージョン範囲と、最後に未修正を確認した版
  refs:
    - https://github.com/anthropics/claude-code/issues/NNNNN
  keywords:
    - changelog 側の英語表現
  workarounds:
    - どの plugin のどの skill・rule が担っているか（設置場所が分かる粒度で）
  release_criteria: |
    何が確認できたら解除してよいか
  release_steps: |
    1. 解除時に消す・戻す箇所を、ファイルと節の粒度で列挙する
  log:
    - YYYY-MM-DD: 確認したことと結果
```

## 各フィールドの注意

- `status`: `open` が突合の対象になる。`permanent` は仕様で解除見込みが無いもの（突合しても意味がないが、
  なぜワークアラウンドがあるかの記録として残す）
- `keywords`: **changelog 側の英語表現で書く**。公式 changelog は issue 番号をほとんど使わないため、
  番号での突合はできない。機能名や症状の英語表現を入れる
- `workarounds`: 台帳を単一の正とするための双方向ポインタの片側。
  ワークアラウンドを担う rule・skill の側にも「詳細はこの台帳」と書いておく
- `release_steps`: 解除時に回る場所の一覧になる。ここが薄いと、修正されても何を戻せばよいか分からなくなる
- `log`: 突合のたびに 1 行増える。「いつ確認して、まだ直っていなかった」の記録が時系列のキャッチアップになる

## 追記の手順

1. 台帳を Read し、既存の `id` と重複しないことを確認する
2. 上の型に沿ってエントリを作る。`status` は `open`（仕様なら `permanent`）
3. ワークアラウンドを担う rule・skill の側に、台帳エントリへのポインタを追記する
4. 台帳を編集して保存する

## ワークアラウンド側に書くこと

台帳とワークアラウンド側で書く内容を分ける。

- **rule・skill 側**: 制約があること、どう振る舞うか（能動的なワークアラウンド手順）、台帳エントリへのポインタ。
  台帳を読まないセッションでも振る舞いが再現できる状態にする
- **台帳側**: 解除条件、解除手順、時系列ログ、設置場所の一覧
