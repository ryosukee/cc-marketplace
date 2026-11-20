# mkdocs-setup

mkdocs-material を使ったドキュメントサイトの初期セットアップ手順とテンプレートを提供する skill。

## 動作

mkdocs.yml に MkDocs Material テーマの共通設定を注入する。
設定注入とテンプレート逆反映（プロジェクト固有設定の共通化検討）の 2 フェーズ構成。

## 依存

- `mkdocs`
- `mkdocs-material`
- `beautifulsoup4` (`bs4`): `source_lines.py` の HTML 処理
- `markdown_gfm_admonition`: テンプレートで指定する Markdown 拡張
- `mkdocs-monorepo-plugin`: monorepo 選択時のサイト統合
