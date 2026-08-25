# 発動検証ハーネス（セッション 4 担当）

| 項目 | 内容 |
| --- | --- |
| 目的 | evals ハーネス（`claude plugins eval`）の調査・設計と実測の一次記録 |
| 生存期間 | rule の eval 化に着手し、内容を evals/README.md か設計文書へ移すまで |
| 対象タスク | rule の eval 化（norm-refit の外の後続タスク） |

> [!IMPORTANT]
> **セッション 1 に統合。単独では着手しない。**
> 2026-07-30 のセッション 4 が 1 節の任務（`claude plugins eval` の調査）と
> 追加スコープ（description が指示として効くかの測定）を完了した。
> 結果は末尾の「9. セッション 4 の調査・測定結果」にある。1 節・5 節・6 節はこの結果で置き換わる。

このセッションは**調査と設計だけ**を行う。`plugins/` を変更しない。
eval ケースを書いて動かすのはよいが scratchpad に置く。

## 1. 最初にやること

**`claude plugins eval` の調査。** 組み込みで eval 機構が存在することが分かっているが、
一度も実行していない。ヘルプの記載は次のとおり。

```text
eval [options] [target]  Run eval cases (evals/**/case.yaml or evals/**/prompt.md
                         + graders/*.md) against a plugin and report scored results.
                         Target is a path, a plugin name, or a `plugin@marketplace` id
                         — installed and skills-dir plugins both resolve
                         (and add a no-plugin baseline arm)
```

**前セッションが「自前で再実装する」と決めたのは、この存在を知らずに下した判断。**
前提を取り直すところから始める。

確認する観点:

- ケースの書式（`evals/**/case.yaml` と `evals/**/prompt.md` + `graders/*.md`）
- スコアの出し方。grader は何を見るのか
- no-plugin baseline arm が何をするのか。skill の有無を対照にできるのか
- skill の発動そのものを測れるのか。それとも skill 発動後の出力品質を測るものなのか
- 実行のコスト（トークン、時間）
- 汚れる場所（前セッションの実測では `~/.claude/projects/<cwd>/` に 1 実行 64KB）

## 2. 回答待ちのフォーム

<https://mac-mini.hake-tarpon.ts.net/2026-07-27-cc-marketplace-trigger-eval-harness-form.html>

設問 3 問（置き場・最初の規模・最初に測る対象）。

**前提が変わるなら、回答を待つ前にフォームを作り直す。**
`claude plugins eval` が使えるなら、置き場も規模も測る対象も設計が変わる。

## 3. 前セッションの実測（2026-07-27、v2.1.220）

再調査しない。

### skill の定義方法と発動

- 一覧に出る名前は定義方法で変わる。plugin（install / `--plugin-dir`）は `plugin:skill`、
  `.claude/skills/` は素の名前。サブディレクトリの `.claude/skills/` は
  cwd がその配下のときだけ載る
- 内部的には `.claude/skills/*` も plugin 扱い
  （`claude plugins list` に「Skills-directory plugins」の節がある）
- 同一 description なら配置が違っても発動した（各 n=1、強いトリガー語）。
  境界事例で prefix の有無が効くかは未測定
- skill の `description` はセッション開始時に全件コンテキストへ載る（実測）。
  ただし**指示として同じ強度で効くかは未検証**。description はカタログ面であって指示面ではない
- description の実測長: html-communication 333 字（UTF-8 769 バイト）/
  japanese-text-writing 250 字（674）/ ask-with-choices 197 字（521）。上限は未確認

### 隔離環境

- **`CLAUDE_CONFIG_DIR` による隔離は使えない。** `Not logged in` で起動しない。
  `oauthAccount` を一時 config へ移しても変わらない
- 代替: `--setting-sources project` + `--plugin-dir`。skill 44 件 → 13 件、
  OAuth 維持、汚染なし。残る 13 件は組み込みで、これ以上は減らせない
- `--bare` は OAuth と keychain を読まず `ANTHROPIC_API_KEY` が要る。従量課金になる

### 汚れとコスト

- `~/.claude/skills` `~/.claude/plugins` `~/.claude/settings.json` `~/.claude/history.jsonl`
  `/tmp/claude-status` は**汚れない**
- `~/.claude/projects/<cwd>/` に実行ごとの JSONL が残る。1 実行 64KB。
  cwd ごとにディレクトリが作られる
- トークンは 1 実行あたり cache_creation 13k + cache_read 15k、output 100〜350。
  ただし `--setting-sources` 未指定時の計測なので上限寄り

### 測れる指標

7 種入る: pass@k / pass^k / G-Pass@k / precision / recall / 混同行列 / ablation。

**MRR と recall@k は測れない。** モデルは候補を順位付けせず 1 つ選んで呼ぶだけで、
順位が出力に現れない。

## 4. 2026-07-29 の調査で追加された関連知見

[調査台帳](./2026-07-30-research-ledger.md) の 1 節・13 節が直接関係する。

- **IFScale**（20 モデル・7 プロバイダ）: 同時に課す指示数を 10 → 500 まで振り、
  後方の指示のエラー率が前方より一貫して高いことを測定。
  claude-3.7-sonnet の曲線は 100%（10）→ 99.6%（50）→ 約 95%（150）→ 72.9%（250）→ 52.7%（500）。
  高密度では omission（そもそも書かない）が支配的
- **Order Matters**（arXiv:2502.17204）: 制約の並び順で性能が変わり、
  hard-to-easy 順が最良。attention パターンとの相関まで確認
- 公式の数値規範: SKILL.md は 500 行未満・5,000 トークン未満、CLAUDE.md は 200 行未満

**発動検証と指示追従の検証は別物**だが、測る対象が重なる。
セッション 1 が「規範が守られるか」を扱うので、
このセッションが「skill が発動するか」を扱う切り分けにする。

## 5. 未決（フォーム 3 問の内容）

前セッションが立てた設問。前提が変わるなら作り直す。

- 置き場: eval のケースと結果をどこに置くか
- 最初の規模: 何件のケースから始めるか
- 最初に測る対象: どの skill の発動を最初に測るか

## 6. 成果物の要件

- `claude plugins eval` が使えるかどうかの結論と、その根拠（実行結果）
- 使えるなら、自前実装の案を破棄してよいかの判断
- 使えないなら、何が足りないかと自前実装の設計
- フォームを作り直したなら、その旨とファイル名

## 7. 参照すべき資料

| 対象 | 場所 |
| --- | --- |
| 調査台帳 | [research-ledger](./research-ledger.md) |
| 前セッションの引き継ぎ | `.handover/archive/2026-07-27-norms-eval-and-pr-skill.md` |
| 配信中フォーム一覧 | `~/.local/share/claude-html-communication/index.html` |

## 8. 注意

- `~/.local/share/claude-html-communication/index.html` は 4 セッションが共有する。
  書き換える直前に読み直し、自分のエントリだけ触る
- `plugins/` を変更しない。実装セッションの管轄
- eval の実行は `~/.claude/projects/` を汚す。cwd を固定して汚れる場所を予測可能にする
  （→ 9 節で反証。組み込み eval は汚さない）

## 9. セッション 4 の調査・測定結果（2026-07-30、v2.1.220）

情報源はバイナリ解析（`strings` で Zod スキーマとランナー実装を抽出）と実走 3 回（計 28 実行）。
実測値はすべて claude-opus-5（アカウント既定モデル）でのもの。

### 結論 3 点

1. **`claude plugins eval` は使える。自前再実装は破棄してよい。**
   skill 発動の測定・対照実験・隔離・集計・レポートまで組み込みで揃い、実走で全部動いた
2. **description は常時指示としては効かない。** 無関係なプロンプトでマーカー指示の遵守 0/19。
   発動してその skill に取り組む場面でだけ守られる（5/5）。
   セッション 1 の保守的前提（description はカタログ面）は実測に支持された。
   **「rule 層の指示を description へ移して削る」という簡素化は不成立**、が申し送り
3. skill 発動測定は成立する。ドメイン内プロンプトで with 7/7 発動・without 0/2、Δ=+1.00

### 使い方（実走済みの形）

early access ゲートがあり、env `CLAUDE_CODE_WALNUT_SPIRE=1` で解除する
（statsig フラグ `tengu_walnut_spire` でも開く。ゲート実装から特定）。

```sh
CLAUDE_CODE_WALNUT_SPIRE=1 claude plugin eval <対象> \
  --ablation with-without --runs 3 --json result.json --report report.html
```

対象は path / plugin 名 / `plugin@marketplace`。名前指定は installed と skills-dir の両方を解決する。
`claude plugin eval init --bare <name>` で雛形（prompt.md + graders/criteria.md）が出る。

ケースの書式（実走した最小形）:

```yaml
schema_version: "1.1"
name: trigger
execution:
  prompt: マルメロという果物の栄養と保存方法について教えて
  max_turns: 4
  allowed_tools: [Read, Glob, Grep, Skill]
runs: 3
graders:
  - type: tool_used
    name: skill-invoked
    tool: Skill
    input_match: quince   # Skill ツールの引数 JSON への正規表現
```

スキーマ全容（Zod 定義から抽出）:

- トップ: schema_version / name / description / tags / plugins（path 配列。discovery root 配下必須）/
  context / execution / runs（既定 3・最大 50）/ graders（最少 1）/ expected_outcome
- execution: prompt / max_turns（既定 10・最大 200）/ timeout_seconds（既定 300・最大 3600）/
  model / allowed_tools / append_system_prompt / env（`EVAL_*` キーのみ許可）
- context: scaffold_script（要 --scaffold）/ history_file（--resume 相当）/ add_dirs。
  prompt か history_file のどちらか必須
- YAML の代わりに prompt.md（frontmatter）+ graders/*.md の prose 形式でも書ける
- grader 6 種:
    - `tool_used`: tool 名 + input_match（引数 JSON への正規表現）+ min/max（既定 1..∞）。
      **発動測定はこれ。負例は min: 0, max: 0**
    - `regex`: target = trace | last_message | files | {source: file, path}。
      match = contains | not_contains | count:N。誤発動 skill 名の収集は trace 対象で拾える
    - `tool_order`: before/after の呼び出し順
    - `file_exists`: 作業 dir の生成ファイル
    - `llm`: criteria を judge が 3 票投票し多数決（既定 haiku、--judge-model で変更）
    - `baseline`: baseline_file との比較を judge が判定
- スコア: 実行 = grader の重み付き合格率 → ケース = 実行の平均。pass は score 1.0。
  `tool: Skill` の tool_used grader は ablation 時に自動で with-only（スコア外・報告のみ）になる
  特別処理があり、skill 発動測定は設計上の想定ユースケース

### 何が測れるか

- 発動率（正例）・過剰発動（負例 min:0/max:0）・with/without の Δ（--ablation with-without）
- pass@k / pass^k / precision / recall は --json の実行ごと grader 結果から後段集計できる
- MRR / recall@k が測れない制約は従来どおり（モデルは 1 つ選んで呼ぶだけ）。
  混同行列の材料（誤発動した skill 名）は regex grader (target: trace) か --keep-temp の trace
- 発動だけでなく「発動後に規範が守られたか」も llm / regex grader で同じケースに載る
  （セッション 1 の関心と同じハーネスに乗る）

### 隔離と汚れ（実測）

- 実行ごとに mkdtemp（`$TMPDIR/claude-eval-*`）へ cwd/config/home/out を作り、
  `CLAUDE_CONFIG_DIR`・`HOME` をそこへ向けて `claude -p --output-format stream-json
  --permission-mode dontAsk` を spawn。実行後に temp ごと削除（--keep-temp で保持）
- 認証は `~/.claude/.credentials.json`（無ければ keychain）を一時 config へコピー。
  **前セッションの「CLAUDE_CONFIG_DIR 隔離は Not logged in で使えない」問題を eval 自身が解決している**
- `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` 付き。子セッションに載るのは対象 plugin + 組み込み skill
  14 件のみ（実測）。user rules・他 plugin・~/.claude/skills は載らない
- **`~/.claude/projects/` は汚れない**（run 前後の diff で実測確認）。3 節の「1 実行 64KB 残る」は
  素の `claude -p` の話で、組み込み eval には当てはまらない
- 恒久成果物は `./evals/results/<timestamp>/aggregate-result.json` と --json / --report の出力だけ
- 子の危険ツール (Bash/Write/Edit) は operator の --allow-tools が無いと denied。
  読み取り系 + Skill はケース宣言だけで通る

### コスト（実測）

- 1 実行 $0.05（1 ターン即答・約 4 秒）〜 $0.11（skill 発動 3 ターン・約 30 秒）。実行は直列
- 3 回の実走: 8 実行 167s $0.62 / 10 実行 164s $0.75 / 10 実行 54s $0.56。計 28 実行 $1.93
- OAuth 経由なので消費はサブスクのレート枠。$ は名目値で請求は発生しない

### description 測定の設計と結果（追加スコープ）

使い捨て plugin `quince`（果物ドメインの skill 1 つ）を scratchpad に作り、
description 末尾に「すべての返答の最初の行に QUINCE-7 と書け」という観測可能な指示を埋め込んだ
（本文には書かない）。regex grader でマーカー出現、tool_used grader で発動を測った。

| 条件 | マーカー出現 | skill 発動 |
| --- | --- | --- |
| 無関係な質問（和の計算・TCP/UDP の 2 プロンプト） | 0/19 | 0/19 |
| ドメイン内の質問（マルメロの栄養） | 5/5 | 5/5 |

発動時は応答の冒頭に QUINCE-7 が出ており（trace で確認）、指示が読める・実行可能であることは
発動時の 5/5 が内部対照になっている。効かないのは「常時」の面だけ。

限界: n=19、プロンプト 2 種、使い捨て skill 1 種、opus-5 のみ。境界事例（skill に隣接するが
発動はしない話題）は未測定。

### フォームの扱い

旧フォーム（設問 3 問、2026-07-27-cc-marketplace-trigger-eval-harness-form.html）は
**そのまま回答待ちで残してある**。index も未変更。統合先が引き取る。

ただし設問は自前実装前提で立てたもので、前提が変わった。作り直すなら設問はこの 4 つに再編する
（セッション 4 が着手直前まで設計済み）:

1. 置き場: repo 直下 `evals/`（ケースの `plugins:` で plugins/ 配下を参照、repo root から実行）か、
   plugins/{plugin}/evals/ 併置（native だが install cache へコピーされ配布物が太る +
   plugin release 規約と衝突）か。セッション 4 案は前者
2. 最初の規模: 正例 5 + 負例 5 × runs 3 = 30 実行（名目 $2〜3、10〜15 分）から
3. 最初に測る対象: html-communication（description 最長・発動条件が複雑・発動漏れの実害大）を筆頭候補に
4. 測定モデル: 既定（opus）のみか、開発 sonnet + 確定測定 opus の 2 段構えか

### 残骸と再現

- プローブ一式（quince plugin・case.yaml×3・run1〜3 の JSON/HTML レポート）は
  セッション 4 の scratchpad にあり、セッション終了で消える。ケース書式は本節に転記済みで再現可能
- リスク: early access ゲートは statsig 制御なので、gate 名や書式が今後の版で変わりうる。
  schema_version は "1.1"。実装セッションは使う前に `claude plugin eval --help` で差分を確認する
