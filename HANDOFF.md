# セッション引き継ぎメモ

このファイルは claude-skill-kernels プロジェクトでの議論結果を新セッションに引き継ぐためのもの。
初回セッションで内容を確認したら、memory に保存して本ファイルは削除してよい。

## 前セッションの経緯

### claude-skill-kernels での議論（凍結済み）

1. 「複数 skill/plugin が共有する hooks・API を kernel として一元管理する」構想を検討
2. Claude Code の plugin エコシステムを調査した結果、kernel が提供しようとした価値の大部分は plugin でカバーできることが判明:
   - agents/skills の共有 → plugin のネームスペースで管理可能
   - hooks データ共有 → 同じ plugin 内で自己完結可能
   - 共有可変状態 → plugin 内に閉じ込め可能
3. 唯一 kernel が勝てるケース（cross-plugin 依存）は #9444 の実装待ち
4. kernel パターン自体は plugin 内部の設計として有効という知見を得た

詳細: https://github.com/ryosukee/claude-skill-kernels

### このプロジェクトの方針

- 既存のグローバル skills/hooks を plugin 化して、グローバル配置ではなく plugin インストールに移行
- 1 marketplace / multi plugin 構成
- utility 系（session, version-check）は確定、workflow 系（code-plan 等）は plugin 分離を検討中

### 設計上の検討事項

1. **Plugin 内部の kernel パターン**: hooks → internal/ に永続化 → scripts/api/ 経由で skills がアクセス
2. **dependency 管理**: internal/{resource}/dependency.md に書くか、skill 側に書いて aggregate するか未決定
3. **rules の制約**: plugin から .claude/rules/ にファイルを配置する仕組みがない。workflow 系 skill は rules に依存している部分がある
4. **既存グローバル skills の棚卸し**: ~/.claude/skills/ に 21 skill がフラットに配置されている。どれを plugin 化するか要判断

### 関連する Claude Code の課題

- [#9444](https://github.com/anthropics/claude-code/issues/9444) — plugin 間リソース共有（37 thumbs up）
- [#26489](https://github.com/anthropics/claude-code/issues/26489) — skills/agents が親ディレクトリを遡らない（16 thumbs up）
- [#18517](https://github.com/anthropics/claude-code/issues/18517) — plugin 更新時の hooks パス不整合

### ユーザーの好み・方針

- 日本語で作業
- 常体（だ/である）ベース、硬い文語表現は避ける
- PR/commit は明示的な承認を得てから
- 確認は選択肢形式（AskUserQuestion）で
