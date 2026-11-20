# impl-spec

実装前に要件定義書・設計書・テスト計画書を作り、仕様の曖昧さを解消する plugin。
コードベースの調査、ユーザーへのインタビュー、成果物のレビューを行う。

## 対応 CodingAgent

Claude Code only。

## 構成

| 要素 | 役割 |
| --- | --- |
| requirements skill | 概要テキストまたは計画を入力に、何を作るかを明確にして要件定義書を出力する |
| design skill | 要件定義書を入力に、設計判断を確定させて設計書を出力する |
| test-plan skill | 要件定義書と設計書から、受入基準とテストを対応付けたテスト計画書を出力する |
| spec-reviewer agent | 各成果物のドラフトと関連文書を読み、構造・形式・整合性をレビューする。成果物は編集しない |

## 依存

- Claude Code の Read / Grep / Glob / Agent による調査とレビューを使う。追加の外部 CLI や環境変数の指定はない
- Serena MCP や LSP は任意。利用できる場合に優先し、無ければ Read / Grep / Glob / Agent で調査する
- 4 問を超える確認では HTML フォームを使う手順になっている。利用する環境に HTML フォームを扱う手段があるかを確認する。未設定時の代替手順は定めていない

## 使い方

- `/impl-spec:requirements <計画ファイルのパスまたは概要テキスト>`
- `/impl-spec:design <要件定義書のパス>`
- `/impl-spec:test-plan <設計書のパス>`

入力が足りない場合はファイルパスや概要を問い合わせる。
成果物の書き出し前に spec-reviewer でレビューし、指摘を反映する。

## データの置き場

成果物は利用先プロジェクトの規約に従って保存する。

- 要件定義書: 仕様書用ディレクトリ、既存の仕様書の隣、`docs/` の順に選ぶ
- 設計書: 設計書・plan 用ディレクトリ、要件定義書と同じディレクトリ、`docs/` の順に選ぶ
- テスト計画書: テスト計画・仕様書用ディレクトリ、設計書と同じディレクトリ、`docs/` の順に選ぶ

plugin 独自の状態ファイルは持たない。

## 更新方法と削除方法

marketplace と plugin を順に更新し、新しいセッションで確認する。

```bash
claude plugins marketplace update cc-tools
claude plugins update impl-spec@cc-tools
```

削除する場合は次を実行する。利用先プロジェクトに出力した文書は別に管理する。

```bash
claude plugins uninstall impl-spec@cc-tools
```
