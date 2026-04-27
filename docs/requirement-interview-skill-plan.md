# requirement-interview skill 計画

## 背景

feedmarks プロジェクトで impl-plan を作成する際、実装の現状を十分に調べず・ユーザーへの質問が不十分なまま plan を書いてしまう問題が繰り返し発生した。

- plan に既に対応済みのファイルを列挙 → impl が正しくスキップ → meta-review が「漏れ」と誤検出
- keybind の hook mount 場所を調べずに plan を書き、impl が plan と実態の乖離で自己判断
- ユーザーが「勝手に決めるな、全部質問して明確化してから plan を作れ」とフィードバック

## 目的

plan 作成前にユーザーへの質問を徹底させる skill を plugin として作る。
feedmarks の impl-plan skill の前段として、または独立した skill として使う。

## 参考: 既存の実装パターン

### 最小版 (Interview Gist by Thariq)

```
description: Interview me about the plan
argument-hint: plan
model: opus

Read this plan file $1 and interview me in detail using the 
AskUserQuestionTool about literally anything: technical 
implementation, UI & UX, concerns, tradeoffs, etc. but make 
sure the questions are not obvious.

Be very in-depth and continue interviewing me continually 
until it's complete, then write the spec to the file.
```

source: [Interview Gist](https://gist.github.com/robzolkos/40b70ed2dd045603149c6b3eed4649ad)

### Doc Co-Authoring (Anthropic 公式)

3 段階:

1. Context Gathering: メタ質問 + 5-10 の clarifying questions
2. Section Refinement: セクションごとに質問→ブレスト→キュレーション→ドラフト
3. Reader Testing: 新しいインスタンスで理解度テスト

source: [Anthropic Skills](https://github.com/anthropics/skills)

### 関連記事

- [AskUserQuestion の multi-round interview](https://neonwatty.com/posts/interview-skills-claude-code/)
- [Before You Vibe Code, Let Claude Code Interview You](https://medium.com/coding-nexus/before-you-vibe-code-let-claude-code-interview-you-7f157bdc5da4)

## feedmarks での要件

feedmarks の impl-plan workflow に合わせた要件:

### 入力

- 実装したい機能の概要 (自然言語)
- または既存の plan ファイルパス

### やること

1. **実装の現状調査**: Serena MCP で対象コードの構造・依存関係を調査。ユーザーに質問する前に自分で調べられることは調べる
2. **質問フェーズ**: AskUserQuestion で以下を明確化するまで質問し続ける:
    - 仕様の曖昧さ (動作、エッジケース、エラーハンドリング)
    - 設計選択肢のトレードオフ (複数案がある場合の判断)
    - UI/UX の詳細 (配置、操作方法、表示条件)
    - 既存機能との整合性 (影響範囲、breaking change)
    - ユーザーの意図の確認 (「こういうことですか？」)
3. **明確化完了の判定**: 全ての質問に回答が得られ、実装方針に曖昧さがないことを確認
4. **出力**: 明確化された要件をまとめた仕様書 or plan のドラフト

### やらないこと

- 勝手に判断して進めること。「大体これでいいでしょう」は禁止
- 質問せずに推測で埋めること
- コードの変更 (これは impl-plan → team-implement の責務)

### 質問の品質基準

- 自明な質問をしない (コードを読めばわかることは聞かない)
- AskUserQuestion の選択肢形式を活用する (自由記述より選択肢の方が回答しやすい)
- 独立した質問は複数まとめて聞く (AskUserQuestion は 4 問まで対応)
- 上流の判断を先に確認してから下流の詳細を聞く

### feedmarks 固有の統合

- impl-plan skill の「要件の理解」ステップ (Step 1) をこの skill に置き換える or 強化する
- `ref-feature-addition` / `ref-design-principles` 等の reference skill は引き続き impl-plan 側が参照
- この skill の出力を impl-plan の入力にする

## plugin 構成案

```
plugins/requirement-interview/
  plugin.toml
  skills/
    requirement-interview/
      SKILL.md
```

## 設計判断ポイント

1. **独立 skill vs impl-plan 統合**: 独立 skill として `/interview` で呼べるようにするか、impl-plan の内部ステップにするか
2. **質問の終了条件**: 「もう質問はありません」をどう判定するか。回数制限 vs 自律判定
3. **AskUserQuestion の活用**: 選択肢形式 + 複数質問バッチをどこまで活用するか
4. **model**: opus (質問の質が重要なため)

## 参考: feedmarks の既存ルール

- `ask-with-choices.md` (ryosukee/cc-marketplace/rules/): AskUserQuestion の選択肢形式、複数質問バッチ、上流決定の先行提示、バッファ行等のルール。この skill はこれらのルールを前提として使う
- `meta-authoring.md`: 具体事例の抽象原則への昇華。skill の指示も抽象的に書く
