---
paths:
  - "never-match-reference-only"
note: |
  モデル情報と公開ベンチマークの確認日: 2026-10-08。
  作業への割り当ては公開情報からの運用上の判断であり、この repo の作業で実測した結果ではない。
---

# 委譲モデルの選択根拠

モデル選択を見直すときに、公開ベンチマークの測定対象と条件、価格を確かめるための資料。
数値は測定者が公表した結果であり、手元の CodingAgent での完了率や所要時間を保証しない。

## ベンチマークを作業の選択に使う

- 抽出・分類・要約と、長時間の実装・研究を別の作業として評価する。
  coding の点数だけで文章の意味の判定や規範の欠落を探す能力を推定しない
- モデルの版、ベンチマークの版、effort、ツール、ハーネス、試行回数を確かめる。
  条件が不明な値は、その限界を添えて使う。別の発表や測定者の値を混ぜて厳密な順位を作らない
- 同じ入力と受け入れ条件で手元の代表的な作業を比較し、満たした候補の中から使用量と所要時間で選ぶ。
  公開ベンチマークで僅差の候補は、点数だけで置き換えない

why: ベンチマークは特定の問題と実行環境を測る。
依頼したい作業や条件が違う場合、その点数は委譲の成功を直接測ったものではない。

## Claude の coding と知識作業

Haiku 5.5 の発表に載った、Anthropic の公表値を使う。
Terminal-Bench 4.0 はコマンドライン環境で複雑な多段の作業を完了する能力、
GDPval-AA v2.1 は職業上の成果物を作る能力を評価する。

| 評価 | Haiku 5.5 | GPT-6 Luna | Sonnet 5.5（参考値） |
| --- | --- | --- | --- |
| Terminal-Bench 4.0 | 39.2% | 16.4% | 70.6% |
| GDPval-AA v2.1 | 1620 | 1437 | 1840 |

※ 表 1 Haiku 5.5 発表内の公表値。GDPval-AA は Elo、Terminal-Bench は成功率

> 情報源: Claude Haiku 5.5<br>
> [Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)の Performance と Further updates。
> Sonnet は参考値として掲載され、表の全項目で effort・ハーネス・試行回数が同じかは本文だけでは確認できない。
> Anthropic は複雑な agentic coding に Sonnet・Opus、範囲の狭い要約・compaction・subagent 作業に Haiku を勧めている。

Opus 5.5 の発表では、Anthropic が次の値を公表している。

| 評価 | Opus 5.5 | Fable 5.1 |
| --- | --- | --- |
| Terminal-Bench 4.0 | 66.4% | 55.8% |
| FrontierCode v1.1 (Main) | 54.4% | 50.3% |
| GDPval-AA v2.1 | 1846 | 1735 |

※ 表 2 Opus 5.5 発表内の公表値。GDPval-AA は Elo、他は成功率

> 情報源: Claude Opus 5.5<br>
> [Claude Opus 5.5](https://www.anthropic.com/claude-opus-5-5)の Performance and cost-effectiveness と注記。
> Opus は原則 max effort、Terminal-Bench では xhigh。Terminal-Bench の標準誤差は Opus が ±2.6 ポイント、他の Claude が ±1.6〜2 ポイント。
> 評価には制限対象の問題で旧モデルへ fallback した結果が含まれる。
> Anthropic は点数の差が実務上の差を捉えにくくなっていると述べている。

この 2 つの表を合わせて Claude の能力順を決めない。
Haiku は検算可能な作業、Sonnet は範囲の明確な実装、Opus は継続的な判断を伴う作業の開始候補にする。
Fable は Opus の高 effort でも残る品質不足を補う候補にする。
これはベンチマークと公式の用途説明を踏まえた運用上の判断である。

## Codex の複雑な実装

Vals AI のモデル別ページに載った現在の測定値を使う。
各ページの既定の評価設定は max effort、最大出力 128,000 tokens。
ページには、個々のベンチマークで provider やパラメータが異なる場合があると記載されている。

| 評価 | GPT-6 Luna | GPT-6.1 Sol | GPT-6 Astra |
| --- | --- | --- | --- |
| Terminal-Bench 4.0 | 13.64% ±1.51 | 55.05% ±1.82 | 59.60% ±4.40 |
| Code Migration | 42.55% ±4.42 | 65.12% ±4.36 | 67.74% ±4.22 |

※ 表 3 Vals AI の公表値。± は掲載された誤差幅

> 情報源: Vals AI のモデル別評価<br>
> [GPT-6 Luna](https://www.vals.ai/models/openai_gpt-6-luna)、[GPT-6.1 Sol](https://www.vals.ai/models/openai_gpt-6.1-sol)、[GPT-6 Astra](https://www.vals.ai/models/openai_gpt-6-astra)の Benchmarks Accuracy Rankings と Hyperparameter Settings。
> 同じベンチマーク名でも、全モデルの実行条件が同一だとは断定しない。
> Anthropic の発表値とも別の測定であり、相互に混ぜない。

> 情報源: Vals AI の Terminal-Bench 4.0 測定条件<br>
> [Terminal-Bench 4.0](https://www.vals.ai/benchmarks/terminal-bench-4)の Methodology。
> mini-swe-agent と bash ツールを使い、各 task に 8 時間の上限を設ける。
> 3 回の pass@1 を平均する avg@3 で、誤差は 3 回の標準誤差。最終成果物を verifier で検査し、部分点は与えない。
> [Code Migration](https://www.vals.ai/benchmarks/code-migration)は別言語でプログラムを再実装する評価であり、通常の局所修正とは作業が異なる。

Luna の最大 effort の値を、単純な抽出で low effort を使ったときの性能の根拠にしない。
複雑な実装には Sol を開始候補とし、Sol で不足した要件を Astra で検証する。
表の差だけから全作業を Astra に切り替えない。

## 検索を伴う調査

Parallel の Search Capability Leaderboard は、DSQA・HLE・WISER 各 100 問を、検索あり・なしで測る。
コード実行を無効にし、検索と抽出のツール予算を固定する。
推論設定と token 上限はモデルによって異なりうる。

| 評価 | GPT-6 Luna | GPT-6.1 Sol | GPT-6 Astra |
| --- | --- | --- | --- |
| Search Intelligence Score | 61.9 | 70.4 | 70.8 |
| 費用 / 1,000 tasks | $33.1 | $130 | $401 |
| 時間 / task | 391 秒 | 353 秒 | 83.7 秒 |

※ 表 4 Parallel の公表値。2026-10-05 更新

> 情報源: Parallel の検索評価<br>
> [GPT-6 Astra · Search Capability Leaderboard](https://parallel.ai/leaderboard/gpt-6-astra)の比較と、[Search Capability Leaderboard](https://parallel.ai/leaderboard)の Methodology。
> score は 3 評価の等重み平均。費用は推論・検索・抽出を含み、採点を含まない。
> 費用の記録には回復の再試行が欠ける場合がある。時間は質問から最終回答までの平均で、token 生成速度ではない。

この測定では Sol と Astra の score が近く、費用と完了時間の差は大きい。
調査は Sol を開始候補とし、必要な品質または時間の条件を満たさない場合に Astra を比較する。
時間を理由に選ぶ場合は、委譲する作業と同じ種類の作業で早く完了するかを確かめる。
Luna を選べば常に早く完了するとは扱わない。

## 価格と文脈の長さ

標準 API の入力・出力価格を比較する。cache、Batch、Fast mode、推論量や再試行による総費用の違いは、この表に含めない。

| 入力 / 出力（USD / 100 万 tokens） | Haiku 5.5 | Sonnet 5.5 | Opus 5.5 | Fable 5.1 |
| --- | --- | --- | --- | --- |
| 入力 100,000 tokens 以下 | 0.10 / 0.50 | 2 / 10 | 4 / 20 | 10 / 50 |
| 入力 100,000 tokens 超 | 0.50 / 2.50 | 2 / 10 | 4 / 20 | 10 / 50 |

※ 表 5 Claude API の標準単価

> 情報源: Claude のモデル仕様<br>
> [Models overview](https://platform.claude.com/docs/en/models/overview)と[Claude Haiku 5.5](https://platform.claude.com/docs/en/models/haiku-5-5/overview)の Pricing。

| 入力 / 出力（USD / 100 万 tokens） | GPT-6 Luna | GPT-6.1 Sol | GPT-6 Astra |
| --- | --- | --- | --- |
| 入力 272,000 tokens 以下 | 0.10 / 0.50 | 2 / 10 | 10 / 50 |
| 入力 272,000 tokens 超 | 0.20 / 0.75 | 4 / 15 | 20 / 75 |

※ 表 6 OpenAI API の標準単価

> 情報源: OpenAI のモデル仕様<br>
> [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)、[GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)、[GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra)の Pricing。

長い会話を fork する場合は、引き継ぐ入力も含めて費用を比較する。
API 単価と契約枠の消費は別に確認し、表の単価から契約枠の残りを計算しない。
同じ effort 名でもモデルごとに推論量が異なるため、単価比だけで作業の費用比を推定しない。
