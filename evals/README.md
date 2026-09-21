# Plugin eval ハーネス

skill の発動測定を組み込みの `claude plugin eval` で行う。early access のため
環境変数 `CLAUDE_CODE_WALNUT_SPIRE=1` でゲートを解除する。

## 置き場

ケースは plugin の下に置く。`claude plugin eval` がケースを探す既定の場所で、結果も同じ下に出る。

```text
plugins/{plugin}/evals/
├── env.sh              # その plugin だけに要る環境を整える（あれば run.sh が経由する）
├── lib/                # ケースから source する共通の前準備（あれば）
├── description/{case}/ # 発動を測るケース。1 ケース 1 ディレクトリ
├── behavior/{case}/    # 規則どおり動くかを測るケース
│   ├── case.yaml       # ケースの全体（prompt・graders・context）
│   └── scaffold.sh     # fixture の生成（case.yaml の context.scaffold_script が指す）
└── results/            # 実行の結果。git 管理しない
```

- ケースのディレクトリ名がケース名になり、`--case` の glob と結果の表示に使われる
- `case.yaml` に `plugins:` は書かない。対象の plugin は `claude plugin eval` に渡すパスで決まる
- 結果は `results/` に出て、`.gitignore` で除外する。全ケース実行のあとは
  `results/latest/` に最新の 1 件だけが残り、timestamp 付きの生出力は run.sh が消す

## 実行方法

`evals/run.sh` に plugin 名を渡す。追加引数はそのまま `claude plugin eval` へ渡る。

```sh
evals/run.sh {plugin} [--case "<glob>"] [--runs N] [--json <path>]
```

- run.sh は規定オプション（early access ゲート解除・`--ablation none`・`--no-publish`・
  `--scaffold`・`--allow-tools Bash Write Edit`）を固定する。素の `claude plugin eval` を
  直接叩かない
- plugin に実行可能な `evals/env.sh` があれば、run.sh はそれに `claude plugin eval` を渡して実行する。
  stub のコマンドを PATH に入れるような plugin 固有の準備は env.sh が持ち、run.sh は plugin を知らない
- `--scaffold` は各ケースの scaffold.sh（fixture 生成）の実行に必要。
  scaffold は子セッションの sandbox の外で実行者の権限で動くので、自作のケースにしか使わない
- `--allow-tools Bash Write Edit` は正例の実測に必要。これが無いと子セッションで
  Write/Edit/Bash が denied になり、操作手段が Skill しか残らず発動率が構造的に底上げされる
- ケースの書式（scaffold の有無・grader・allowed_tools）を変えたら、全体を回す前に
  `--case` で 1 ケース `--runs 1` のスモークを回して load と grader の動作を確認する。
  書式の仕様は推測で埋めず、[公式ドキュメント](https://code.claude.com/docs/en/plugin-evals)と
  `claude plugin eval --help` で確かめる
- `--no-publish` を必ず付ける。
  HTML レポートは既定で claude.ai へ Artifact として発行される。発行先は private だが、
  Artifact は CLI から削除できず実行のたびに増えるためローカル出力のみとする
- モデルはアカウント既定（opus）を使い、`--model` は指定しない
- 消費はサブスクのレート枠（OAuth 経由）。実測 1 実行あたり $0.13〜0.38
  （2026-09-18、plane-kanban の診断と 1 ケースのスモーク）。実行は直列で、`-j` で最大 8 並列にできる
- 実行は隔離 temp dir で行われ `~/.claude/projects/` を汚さない
- `--threshold` の既定は 1.0 で、1 ケースでも点数が下回ると eval は exit 1 になる。
  run.sh は 0 以外で終わっても結果の反映と片付けを行う

## 子セッションの環境

`claude plugin eval` はケースごとに Claude Code のセッションを起動する。実測（2026-09-18、claude 2.1.274）で
分かっている制約は次のとおり。外部サービスを呼ぶ skill のケースを書くときに効く。

- 外部への通信は sandbox に遮断される。api.plane.so への接続は `deny network-outbound` になった
- `HOME` は一時ディレクトリに差し替わり、作業ディレクトリはその下にできる
- 実行者の home ディレクトリは読み取り拒否。例外は plugin のディレクトリと、
  `claude plugin eval` を起動したシェルの PATH に入っている home 配下のディレクトリ
- eval のディレクトリ（`plugins/{plugin}/evals/`）は読み取り拒否。
  子セッションに実行させたい stub をこの下に置かない。コマンドの中にこのパスを書くと
  Bash の実行そのものが拒否される
- ケースの `env` に書けるのは `EVAL_` で始まる環境変数だけで、PATH は渡せない。
  scaffold の中で変えた PATH も子セッションには届かない
- `/usr/bin/security` の実行は拒否する設定が入る

## 結果の確認

結果は `plugins/{plugin}/evals/results/latest/` に最新の全ケース実行分だけを保持する
（`aggregate-result.json` + `report.html`）。HTML で確認するときはブラウザで開く。

- `results/` は git 管理しない（公式ドキュメントの推奨。plugin の配布物にも入らない）
- `--case` の部分実行は latest を更新しない（latest は常に全ケース実行の結果）

## 2 つの評価を分ける

eval は 2 つの別のことを測る。同じケースに混ぜない。混ぜると、落ちたときにどちらが原因かがスコアから読めない。

- **description の評価**: 依頼文を入力にして、発動してほしい skill が発動するか。
  依頼文に skill 名もトリガー語も出さない。grader は発動の有無だけ
- **動作の評価**: 発動した後に、SKILL.md に書いた規則どおりに動くか。
  依頼文で skill を名指しして、発動を前提にする。ここでは skill 名を出すのが正しい。
  grader は skill が呼ぶコマンドの記録と最終返答を見て、1 ケース 1 規則にする

動作の評価が無いと、SKILL.md の本文がいまの実装と合っているかを判定できない。
description の評価だけでは、発動した後に何をしたかを一切見ていない。

## ケースの一覧を先に書く

eval を作る最初の手順は、`plugins/{plugin}/evals/README.md` にケースの一覧を書くこと。
ケースのファイルを書き始める前に、次を決めて一覧にする。

- description の評価と動作の評価に分けて、どのケースで何を測るか
- 動作の評価では、SKILL.md のどの規則を測るか。規則は SKILL.md から起こし、1 ケース 1 規則にする
- 各ケースの合格の条件と、前準備で用意する fixture

一覧を先に書くと、測る価値の無いケース（発動して当たり前の依頼、遠すぎる負例、
落ちようがない grader）が実装の前に見つかる。

## ケースの書き方

- 発動測定は `tool_used` grader（`tool: Skill`、`input_match: '"skill"\s*:\s*"(?:[\w-]+:)?{skill 名}"'`）。
  正例は `min: 1` を明示し、負例（発動しないべきケース）は `min: 0, max: 0` を付ける。
  skill 名の後ろの `"` まで含めると、名前が前方一致する別の skill に当たらない
- 対象ファイルが実在する前提の依頼（編集・リネーム・削除）には `context.scaffold_script` で
  fixture を作る。対象が無いと「存在確認 → 無いので終了」という正当な非発動経路ができ、
  測定にならない
- `scaffold_script` の値は**スクリプトファイルへのパス**（ケースディレクトリ相対。
  例: `scaffold.sh`）。インラインの bash 文字列はパスとして解決されて実行前エラーになる
- 発動した後の振る舞いを測るときは、skill が呼ぶコマンドを stub に差し替え、stub が残した
  呼び出しの記録を `regex` grader（`target: { source: file, path: ... }`）で読む。
  外部サービスを呼ぶ plugin では、この stub を env.sh が PATH に入れる
- `allowed_tools` は書き込みを伴う依頼なら正例・負例とも
  `[Read, Glob, Grep, Skill, Bash, Write, Edit]` を標準にする
  （直接操作という実運用の失敗モードを選べる状態で測る。ツール枯渇は
  「唯一の行動手段 = Skill」という現実に無い圧力を作る）
- 初期規模の目安は skill ごとに正例 5 + 負例 5、`runs` は 3
- 名前は `pos-NN-<内容>` / `neg-NN-<内容>`。境界事例には `boundary` タグを付ける

## grader とスコア

`tool_used` のほかに 5 種の grader がある。発動率だけを測るなら `tool_used` で足りる。
発動した後に規範が守られたかを同じケースで測るときは `regex` と `llm` を使う。

- `tool_used`: ツール名 + `input_match`（引数 JSON への正規表現）+ `min` / `max`
- `regex`: `pattern` / `flags` / `match`（`contains` / `not_contains` / `count:N`）+
  `target`（`last_message` / `trace` / `files` / `{ source: file, path: ... }`）
- `tool_order`: 呼び出しの前後関係
- `file_exists`: 実行中に作られたファイル（scaffold が作ったファイルは数えない）
- `llm`: `criteria` を judge が判定（既定 haiku、`--judge-model` で変更）
- `baseline`: `baseline_file` との比較を judge が判定

スコアは実行ごとに grader の重み付き合格率を出し、ケースのスコアはその平均になる。
`tool: Skill` の `tool_used` grader は、ablation 時に自動で with-only（スコア外・報告のみ）になる。

## ケース設計の規範

- プロンプトに skill 名を書かない。トリガー語の丸写しも避ける（リーク）。
  リークしたケースはカタログ照合の測定にならず、常に発動して満点になる
- 正例は難度を混ぜる。トリガー条件を明示する依頼だけでなく、
  対象を間接的に指す依頼（パスや対象名を言わず目的だけ言う）を含める
- 負例は「トリガー条件に隣接するが発動しないべき」依頼を最優先で作り、`boundary` タグを付ける。
  無関係な依頼だけで固めない
- 同じ plugin に skill が 2 つ以上あるときは、一方の正例を他方の負例にする。
  どちらが発動すべきかの弁別を測れる
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
- fixture が依頼の前提を満たしているか（対象のファイル・カード・設定が揃っているか）
