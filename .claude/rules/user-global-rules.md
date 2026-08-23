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
- plugin として配る振る舞いは rule にせず skills / hooks にする（plugin は rule を配布できない）

## 配布

- rule は repo 直下の `rules/` に置き、`~/.claude/rules/cc-marketplace` への
  dir symlink で配布する
- `~/.claude/rules/` 側は、配布元 repo ごとに 1 段のディレクトリを挟む受け入れ方にする。
  直下に個々のファイルを張らず、`~/.claude/rules/{配布元}/` に repo の `rules/` を丸ごと向ける。
  いまの配布元はこの repo 1 つで、増えたときも同じ形で受け入れる
    - どの rule がどの repo 由来かがパスだけで分かる。配布元が増えても混ざらない
    - repo 側で rule を追加・削除すると自動で反映される。ファイル単位の symlink だと
      張り直しが要る
    - 配布をやめるときは symlink 1 本を消せば丸ごと外れる。個別に張ると消し残りが出る

## 構成

- `rules/` はフラット構成にする。配布先には `~/.claude/rules/{配布元}/` の 1 段ネストへ
  丸ごと出るので、ファイル名だけで対象が分かるようにする
- 入口 rule と詳細規範の 2 層にできる。入口 rule は常時ロードで判定と誘導だけを持ち
  （約 20 行）、詳細規範は `rules/{入口名}/references/` 配下に置いて、
  ロード方式を参照専用にする
- 詳細規範は、入口 rule から分岐されたことも他に規範があることも知らない設計にする。
  読み手をどの文書へ辿らせるかは入口 rule だけが持つ。
  why: 内側が外側の構造を知ると、構成変更のたびに詳細規範側の修正が要る
