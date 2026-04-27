# impl-spec plugin フィードバック: async-progress 案件

feedmarks の「非同期処理の改善」要件定義書・設計書を impl-spec plugin (最新版) で
生成し、既存コードベースの実態と突き合わせて review した結果のフィードバック。

## 評価対象

- 要件定義書: `plans/requirements/req-async-progress.md`
- 設計書: `plans/design-async-progress.md`
- 入力: `nexttask.md` の該当セクション (4 行) のみ

## 総合評価

旧版 (v0.1.0 で生成) の 6 件の致命的指摘が新版では全て解決されており、大幅な改善。
ただし実コードとの乖離が複数箇所で発生しており、plugin がコードベースを十分に検証
していないことが原因と見られる。

## 要件定義書の指摘

### 1. コードベースの実態との乖離 (3 件)

要件書がコードベースの現状を正しく把握できていない。

| # | 内容 | 実態 |
|---|---|---|
| R1 | 「frontend に SSE クライアントは存在しない」 | `Sidebar.tsx` に `fetch` + `ReadableStream` で SSE 受信するコードが 30 行ある |
| R2 | スコープテーブルのタグレコメンド「button disabled のみ」 | 実際は "Recommending..." テキスト変化も実装済み。機能要件本文とも矛盾 |
| R3 | Import を「同期 (200)」として 1 行でまとめている | OPML Import は `context.WithoutCancel` 付きで非同期寄り。ReadLater import は完全同期。2 つは異なるパターン |

修正案:

- R1: コードベース検索 (grep / LSP) で SSE 関連コードを探索する step を requirements skill に追加
- R2: 現状把握時に UI コンポーネントの disabled 以外の状態表示 (テキスト変化、spinner 等) も確認する checklist を追加
- R3: 同一カテゴリにまとめる前に、handler の実装パターンを個別に確認する step を追加

### 2. 設計判断に委ねすぎ (4 件)

「設計判断に委ねる」として先送りされた項目が、要件レベルで決めるべき内容を含んでいる。

| # | 内容 | 問題 |
|---|---|---|
| R4 | エラー dismiss 後の backend 連携方法 | dismiss が frontend のみなのか backend に通知するのかで受入基準 8 (リロード後の再表示) と矛盾する可能性 |
| R5 | AI 系処理の並行実行上限 | claude CLI が N 個同時に走る。要件で上限を決めないと設計段階で判断材料がない |
| R6 | job 保持期間の具体的下限値 | 「リロード後に再取得可能な時間」は循環定義 |
| R7 | `useSummaryStatusStore` の廃止/存続 | 既存 store との関係を要件で決めないと設計段階で手戻り |

修正案:

- requirements skill のインタビューで「既存の類似機能 / store との関係」を質問する step を追加
- 「設計判断に委ねる」と書く前に、受入基準との整合性チェックを実行する guardrail を追加
- 保持期間等の具体値は「設計書で決定し要件書にバックポートする」フローを定義

### 3. テスト影響分析の欠如

要件書にテスト影響分析がない (旧版から未解決)。SSE endpoint 廃止、非同期化で
既存テストが壊れることが確実だが、影響範囲が要件に明記されていない。

修正案:

- requirements skill の最終 step に「影響を受ける既存テストの列挙」を追加

## 設計書の指摘

### 4. アーキテクチャルール違反 (1 件)

| # | 内容 |
|---|---|
| D1 | handler 内で `go func()` を起動する擬似コード — `go-architecture.md` の「goroutine は service に委譲する」に違反 |

修正案:

- design skill がコードベースのアーキテクチャルール (`.claude/rules/`) を読み、
  擬似コードがルールに違反していないか self-check する step を追加

### 5. コードベースの実態との乖離 (3 件)

| # | 内容 | 実態 |
|---|---|---|
| D2 | `importJSON()` handler への変更を記載 | `importJSON` は存在しない。`importOPML()` 内で Content-Type 分岐 |
| D3 | Feed refresh ボタンの場所を `SidebarFeeds.tsx` と記載 | 実際は `Sidebar.tsx` の footer |
| D4 | `fetchOGP` handler の `FetchAllMissingOGP` パスの job 登録方針が未定義 | handler は手動トリガーでも `FetchAllMissingOGP` に流すことがある |

修正案: R1 と同じ — コードベース検索を設計フェーズでも必須化

### 6. 型・インターフェースの未定義 (2 件)

| # | 内容 |
|---|---|
| D5 | `useJob` hook の TypeScript シグネチャと戻り値型が未定義 |
| D6 | `ProgressReporter` の `Success()` 呼び出しで `Current` が自動インクリメントされるか未定義 |

修正案:

- design skill で interface / hook を定義する際、シグネチャと戻り値型を必ず明記する guardrail を追加

### 7. 状態遷移のエッジケース (2 件)

| # | 内容 |
|---|---|
| D7 | `Finish` の state machine で success=0 かつ failure=0 のケースが未定義 |
| D8 | ErrorPanel の dismiss が in-memory zustand のみ → リロードで消失 → 5 分以内に再表示。旧設計の SQLite 永続化の方が堅牢だった点の退行 |

修正案:

- design skill で状態遷移を定義する際、全ての state × event の組み合わせを
  matrix で列挙する checklist を追加
- 旧設計との比較で退行ポイントがないか検証する step を追加

### 8. 既存コンポーネントとの整合 (2 件)

| # | 内容 |
|---|---|
| D9 | `useSummaryStatusStore` の feeds 種別の移行パスが不明確。feeds entry の要約と readlater item の要約を同じ `ai-summary` kind で区別できるか |
| D10 | `shared/jobs/` という新ディレクトリの配置根拠が不明。react-architecture.md に存在しない subdir |

修正案:

- design skill で新規ディレクトリ・ファイル配置を提案する際、既存の architecture rule と
  照合する step を追加

## 共通の根本原因

指摘の大半は「plugin がコードベースの実態を十分に確認していない」に帰着する。

1. **handler / service の実装詳細を確認していない**: 関数名・パス・分岐ロジックが
   推測ベースで書かれている
2. **アーキテクチャルールを参照していない**: `.claude/rules/` にある設計原則と
   擬似コードの整合性チェックがない
3. **既存 store / component との関係を調査していない**: 新規追加分の設計はあるが、
   置き換え対象の既存コードとの移行パスが不完全

## plugin 改善の方向性

| 改善テーマ | 対象 skill | 内容 |
|---|---|---|
| コードベース検索の必須化 | requirements, design | Serena MCP / grep で現状のコードを確認する step を各 phase に追加 |
| アーキテクチャルール照合 | design | `.claude/rules/` を読み、擬似コードとの整合をチェック |
| 受入基準 ↔ 要件の整合チェック | requirements | 「設計に委ねる」前に受入基準との矛盾がないか検証 |
| 既存 store / component の調査 | design | 新規追加分だけでなく、置き換え対象の移行パスも設計 |
| 状態遷移の exhaustive check | design | state × event matrix の全パターン列挙 |
| 旧設計との退行比較 | design | 旧設計で解決していた問題が新設計で退行していないか |
| テスト影響分析 | requirements | 影響を受ける既存テストの列挙を最終 step に追加 |
