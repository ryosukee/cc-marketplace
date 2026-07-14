# 調査は一次情報から始める

技術調査・設計判断の裏取りは、Web 検索より先に手元の一次情報を当たる。

## 探索順序

1. 手元の repo (ghq_root 配下): 対象そのものの実装・docs・git 履歴
2. registry・台帳類: dotclaude registry (`~/.claude/plugins/data/dotclaude-cc-tools/registry.json`) 等の参照 repo リスト
3. 過去セッションの成果物: handover、設計ドキュメント、transcript
4. ここまでで足りないものだけ Web 検索・公式ドキュメントで調べる

git 履歴も一次情報に含める。過去にどう判断してなぜ変えたかの記録は、
現 HEAD に無いドキュメントでも `git show <rev>:<path>` で読める。

## why

idea-hub 設計セッション（2026-07）で、手元にあった一次情報の見落としが 2 度起きた:

- feedmarks が htmx から React に実移行済みであることを見落とし、Web 調査ベースの推測で議論を進めた。
  移行理由まで書かれた記録 (`docs/frontend-strategy.md`) が git 履歴で読める状態だった
- dotclaude registry に参照 repo の台帳が既にあることを 2 度見落とし、台帳の再発明を検討した

いずれも Web 検索では得られない情報で、かつ手元の探索の方が速い。
