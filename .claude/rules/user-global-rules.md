---
paths:
  - "rules/**/*.md"
  - ".claude/rules/**/*.md"
---

# 配布用 user global rule の運用

repo 直下の `rules/` で管理する user global rule の、配布の仕組みと構成を定める。

## ここに置くもの

- `rules/` に置くのは、どのプロジェクトのどのセッションでも効かせたい自分用の規範だけ。
  symlink 配布によって全セッションの user global rule になる
- このプロジェクトでだけ効かせる規範は `.claude/rules/` に置く

## 配布

- rule は repo 直下の `rules/` に置き、`~/.claude/rules/cc-marketplace` へ
  ディレクトリごと 1 本の symlink で配布する
    - repo 側で rule を追加・削除すると、張り直しなしでそのまま配布へ反映される
    - 配布をやめるときは、この symlink 1 本を消せば丸ごと外れる

## 構成

- `rules/` はフラット構成にする。配布先にはディレクトリごと丸ごと出るので、
  ファイル名だけで対象が分かるようにする
- 入口 rule と詳細規範の 2 層にできる。入口 rule は常時ロードで判定と誘導だけを持ち
  （約 20 行）、詳細規範は `rules/{入口名}/references/` 配下に置いて、
  ロード方式を参照専用にする
- 詳細規範は、入口 rule から分岐されたことも他に規範があることも知らない設計にする。
  読み手をどの文書へ辿らせるかは入口 rule だけが持つ。
  why: 内側が外側の構造を知ると、構成変更のたびに詳細規範側の修正が要る
- `paths` の相対パターンは、セッションを起動した repo のルートから解決される。
  配布先のどの repo でも、その repo の同じ相対パス（例: `notes/**`）で条件ロードが効く。
  この repo のパスに合わせて書くのではなく、効かせたい repo 側のパスで書く
- 参照専用の `paths`（一致しない値）と、相対パターンの起動 repo ルートからの解決は、どちらも非公開仕様。
  claude-known-issues plugin の一覧のエントリ `rule-paths-exclusion-undocumented` が Claude Code の更新ごとに監視する

## rules/ のワークアラウンドと known-issues のエントリの対応

配布する rule には、Claude Code のバグ・制約へのワークアラウンドであっても、claude-known-issues plugin や
その一覧のエントリへの言及を置かない（配布先には plugin が無いこともあり、rule が他 plugin を知る形になる）。
対応はこの表が持ち、一覧のエントリ側は dependents にこのファイルを持つ。エントリを解除したら行ごと消す。

| rule | エントリ |
| --- | --- |
| `rules/subagent-delegation.md` | `agent-tool-gated-by-system-prompt` |
| `rules/decision-record/references/notes-format.md` と `rules/japanese-text-writing/references/*.md`（参照専用の paths）、`rules/notes-authoring.md` / `rules/markdown-formatting.md` / `rules/rule-authoring.md`（条件ロードの paths） | `rule-paths-exclusion-undocumented` |
