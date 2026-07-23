# textlint 導入計画（未着手）

日本語執筆規範の再設計（2026-07、japanese-text-writing plugin）で、機械化できる表記規則は
LLM 規範に持たせず textlint に委譲する方針にした。この文書はその背景と、導入するときの計画を残す。

## 背景

- 執筆規範は「判断を伴う文章術」（LLM 規範 = japanese-text-writing plugin）と
  「機械判定できる表記規則」（文長・記号・表記ゆれ）に分けられる
- 後者は textlint が高精度・低コストで検出できるため、LLM 規範側は数値基準を持たない
  （「一文を長くしすぎない」等の定性表現のみ）。数値での機械検出は textlint 導入時にまとめて委譲する

## 委譲候補

- textlint-rule-preset-ja-technical-writing（MIT）: 文長・読点数・二重否定・ら抜き・
  冗長表現・弱い表現・接続詞連続など 23 ルール
- textlint-rule-preset-ai-writing（MIT）: AI 文体の機械検出（強調箇条書き・誇張語・過剰太字・コロン構文）

## 想定構成

markdownlint plugin と同型の hook plugin を新設する（Write / Edit 後に textlint を実行して指摘を返す）。
node / npm 依存が入るため、導入時に実行環境と速度を確認する。

## 導入トリガー

- skill 運用で機械的な指摘（文長・記号・表記ゆれ）の漏れが繰り返し見つかったとき
- または表記ゆれの自動検出が欲しくなったとき
