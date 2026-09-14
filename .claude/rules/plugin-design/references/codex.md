---
paths:
  - "never-match-reference-only"
---

# Codex 固有の plugin 設計

Codex の名前付き agent 登録を扱うときに適用する。

## 名前付き agent の登録

Codex 側の agent 登録は明示的な setup で行う。
plugin cache の version 付きパスを永続設定へ直接書かない。
