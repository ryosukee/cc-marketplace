# Plugin eval ハーネス

skill の発動検証を組み込みの `claude plugin eval` で行う。early access のため
環境変数 `CLAUDE_CODE_WALNUT_SPIRE=1` でゲートを解除する。

## 実行方法

`evals/run.sh` で実行する。追加引数はそのまま `claude plugin eval` へ渡る。

```sh
evals/run.sh [--case "<glob>"] [--runs N] [--json <path>]
```

- run.sh は repo root への cd と規定オプション（early access ゲート解除・`--no-publish`・
  `--scaffold`・`--allow-tools Bash Write Edit`）を固定する。素の `claude plugin eval` を
  直接叩かない。cwd がずれると discovery root（= target 無指定時は cwd）が変わり、
  ケースの `plugins:` 参照が root 外と判定されて全ケースが load 失敗する
- `--scaffold` は各ケースの scaffold.sh（対象ファイルの fixture 生成）の実行に必要。
  自作ケースにしか使わないこと
- `--allow-tools Bash Write Edit` は正例の実測に必要。これが無いと子セッションで
  Write/Edit/Bash が denied になり、操作手段が Skill しか残らず発動率が構造的に底上げされる
- ケースの書式（scaffold の有無・grader・allowed_tools）を変えたら、全体を回す前に
  `--case` で 1 ケース `--runs 1` のスモークを回して load と grader の動作を確認する。
  書式の仕様は推測で埋めず、スモークの実測で閉じてから展開する

- `--no-publish` を必ず付ける。
  HTML レポートは既定で claude.ai へ Artifact として発行される。発行先は private だが、
  Artifact は CLI から削除できず実行のたびに増えるためローカル出力のみとする
- モデルはアカウント既定（opus）を使い、`--model` は指定しない
- 消費はサブスクのレート枠（OAuth 経由）。実測 1 実行あたり平均 $0.21・約 27 秒
  （30 実行の平均。skill 発動 + 手順実行まで含む場合）。実行は直列
- 実行は隔離 temp dir で行われ `~/.claude/projects/` を汚さない

## 結果の確認

結果は `evals/results/latest/` に最新の全ケース実行分だけを保持する
（`aggregate-result.json` + `report.html`）。HTML で確認するときは
`evals/results/latest/report.html` をブラウザで開く。

- `latest/` はケースとペアで git 管理する。ケースを追加・変更したら全体を回し、
  latest の更新をケースの変更と同じコミットに含める
- `--case` の部分実行は latest を更新しない（latest は常に全ケース実行の結果）
- timestamp 付きの生出力ディレクトリは保持しない。run.sh が latest への反映後に削除する

## ケースの書き方

配置は `evals/{plugin}/{case-name}/case.yaml`。

- `plugins:` のパスは**ケースファイル相対**で解決される（repo root 相対ではない）。
  例: `../../../plugins/{plugin}`
- 発動測定は `tool_used` grader（`tool: Skill`、`input_match: <skill 名の正規表現>`）。
  正例は `min: 1` を明示し、負例（発動しないべきケース）は `min: 0, max: 0` を付ける
- 対象ファイルが実在する前提の依頼（編集・リネーム・削除）には `context.scaffold_script` で
  fixture を作る。対象が無いと「存在確認 → 無いので終了」という正当な非発動経路ができ、
  測定にならない
- `scaffold_script` の値は**スクリプトファイルへのパス**（ケースディレクトリ相対。
  例: `scaffold.sh`）。インラインの bash 文字列はパスとして解決されて実行前エラーになる。
  スクリプトは各ケースディレクトリに `scaffold.sh` として置く
- 正例には逸脱検出 grader を併設する: `tool: Write` / `tool: Edit` に
  `input_match: '"file_path"\s*:\s*"[^"]*\.claude/'`・`min: 0, max: 0` で、
  skill を経由しない直接書き込みを fail にする。file_path フィールドへアンカーするのは、
  input_match が引数 JSON 全体に掛かるため（本文中に .claude/ が現れた場合の偽陽性を防ぐ）
- 既知の死角（意図的 gap）: Bash 経由の直接書き込み（`echo > .claude/...` 等）は
  逸脱 grader で検出できない。`tool: Bash` に `\.claude/` を張ると skill の正規手順
  （plugin cache のスクリプトパスが `~/.claude/plugins/` 配下）を誤検出するため張らない。
  実質の防波堤は harness 側の protected directory ブロック
- `allowed_tools` は書き込みを伴う依頼なら正例・負例とも
  `[Read, Glob, Grep, Skill, Bash, Write, Edit]` を標準にする
  （直接操作という実運用の失敗モードを選べる状態で測る。ツール枯渇は
  「唯一の行動手段 = Skill」という現実に無い圧力を作る）。読み取り専用の依頼は
  `[Read, Glob, Grep, Skill]` でよい
- 初期規模の目安は正例 5 + 負例 5 × runs 3 = 30 実行
  （2026-08-25 に廃止した dotclaude-writer のスイートは 15 ケース × 3 = 45 実行だった）
- 名前は `pos-NN-<内容>` / `neg-NN-<内容>`。境界事例には `boundary` タグを付ける

## grader とスコア

`tool_used` のほかに 5 種の grader がある。発動率だけを測るなら `tool_used` で足りる。
発動した後に規範が守られたかを同じケースで測るときは `llm` と `regex` を使う。

- `tool_used`: ツール名 + `input_match`（引数 JSON への正規表現）+ `min` / `max`
- `regex`: `target` が trace / last_message / files。誤発動した skill 名は trace で拾える
- `tool_order`: 呼び出しの前後関係
- `file_exists`: 作業ディレクトリに生成されたファイル
- `llm`: `criteria` を judge が 3 票投票して多数決（既定 haiku、`--judge-model` で変更）
- `baseline`: `baseline_file` との比較を judge が判定

スコアは実行ごとに grader の重み付き合格率を出し、ケースのスコアはその平均になる。
`tool: Skill` の `tool_used` grader は、ablation 時に自動で with-only（スコア外・報告のみ）になる。

この 2 つは v2.1.220 のバイナリを読んで確かめた（2026-07-30）。フィールド名と既定値は版で変わるので、
ケースを書く前に `claude plugin eval --help` で取り直す。

## ケース設計の規範

- プロンプトに skill 名を書かない。トリガー語の丸写しも避ける（リーク）。
  リークしたケースはカタログ照合の測定にならず、常に発動して満点になる
- 正例は難度を混ぜる。トリガー条件を明示する依頼だけでなく、
  対象を間接的に指す依頼（パスや対象名を言わず目的だけ言う）を含める
- 負例は「トリガー条件に隣接するが発動しないべき」依頼を最優先で作り、`boundary` タグを付ける。
  無関係な依頼だけで固めない
- 全ケース満点が続くスイートは弁別力不足を疑う。回帰検知としては維持してよいが、
  description の弱点探しには間接正例と強い負例の追加が要る

## レビュー工程

初回作成時とケース追加・変更時に、文脈を知らない subagent のレビューを回してから実行する。
指摘ゼロになるまで修正と再レビューを繰り返す。

レビュー観点:

- プロンプトが skill のトリガー条件を代表しているか（実ユーザーの依頼として自然か）
- skill 名・トリガー語のリークが無いか
- grader の正誤（input_match の正規表現が対象 skill だけに一致するか、負例に min/max があるか）
- 負例の強度（境界事例が含まれるか、無関係な依頼だけになっていないか）
- 正例の難度分布（明示依頼だけに偏っていないか）
