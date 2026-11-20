# ja-writing-ambiguity

日本語を書く前に、読み手が意味を決められなくなる書き方を確認する参照知識 plugin。
指すものが決まらない語、主語と述語が実物と対応しない文、修飾の係り受けが決まらない文を扱う。

## 対応 CodingAgent

Claude Code only。

## 構成

| 要素 | 役割 |
| --- | --- |
| ref-ja-writing-ambiguity skill | 日本語の曖昧さを 3 分類 8 型に分け、用例と判定基準を参照する。日本語を 1 文でも書く前に発動する |

agent は含まない。

## 依存

追加の外部 CLI、環境変数、設定は不要。
参照知識 skill だけで構成され、セットアップの確認処理は持たない。

## 使い方

ファイル、ターミナル返答、HTML ページ、PR 本文、レビューへの返信、commit message で
日本語を書く前に自動発動する。`user-invocable: false` のため、ユーザーが直接呼ぶコマンドはない。

## データの置き場

状態ファイルは保存しない。

## 更新方法と削除方法

marketplace と plugin を順に更新し、新しいセッションで確認する。

```bash
claude plugins marketplace update cc-tools
claude plugins update ja-writing-ambiguity@cc-tools
```

削除する場合は次を実行する。

```bash
claude plugins uninstall ja-writing-ambiguity@cc-tools
```
