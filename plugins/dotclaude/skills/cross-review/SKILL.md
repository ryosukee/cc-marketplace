---
name: cross-review
description: registry に登録された参考リポジトリを相互に比較し、owned なリポジトリに対する改善提案を出す。
---

# リポジトリ横断レビュー

`${CLAUDE_PLUGIN_DATA}/registry.json` に登録された全参考リポジトリを fetch し、相互に比較して、`owned: true` のリポジトリに対する改善提案を出す。

## 意図

doctor は「今いるプロジェクト」を対象にするが、cross-review は「registry 全体の相互学習」を担う。複数リポジトリでワークフローを育てていると、A repo で発展した手順が B repo にまだない、同じような agent/skill/rule が微妙にズレたまま各 repo に散らばる、といった状態が生じる。

cross-review の目的は単純な「A から B へコピー」ではない。同じ役割を担うファイル群を全 repo から寄せ集めて差分を取り、各 repo の良いところを統合した「まだどの repo にも存在しない最新版」を合成し、それを所属する全 repo (および展開候補 repo) に一括反映する。

個性として残すべき差分 (tech stack 固有、運用実態に根ざしたもの) はマージせず各 repo に残す。判断に迷う場合はユーザーに相談する。

他人のリポジトリに対しては書き込まない。owned=true のリポジトリに対してのみ反映する。

## 前提

- registry: `${CLAUDE_PLUGIN_DATA}/registry.json`
- 加えて、ユーザーグローバル dotclaude root (`$HOME/.claude`) を **暗黙エントリ** として常に対象に含める。registry.json への登録は不要で、どの環境にも存在する前提
- 暗黙エントリは `owned: true` 扱い。改善提案の出力先にもなる
- 比較成立条件: registry エントリ + 暗黙エントリの合計が 2 件以上 (1 件だけなら比較対象がない)
- `owned: true` のエントリが 1 件以上必要 (暗黙エントリが常に満たすので実質常に成立する)

### 暗黙エントリ (`$HOME/.claude`) の扱い

registry の通常エントリと同列に扱うが、以下の点だけ異なる:

| 項目 | 値 |
|---|---|
| name | `user-global` |
| github | なし (ローカル専用) |
| role | `primary` |
| owned | `true` |
| note | ユーザーグローバルの dotclaude root。全プロジェクト共通のルール・skill・agent が置かれる |
| base dir | `$HOME/.claude` (subpath 解決なし) |

有効性チェック (`.claude/agents/` または `.claude/skills/` に 1 ファイル以上) は通常エントリと同じ。`$HOME/.claude` 自体が `.claude` 相当なので、`$HOME/.claude/agents/` と `$HOME/.claude/skills/` を直接見る。無効なら比較対象から外す。

## ワークフロー

### ステップ 1: 前提チェック

1. `${CLAUDE_PLUGIN_DATA}/registry.json` を読む
2. 暗黙エントリ (`$HOME/.claude`) の有効性を確認し、有効ならリストに追加する
3. registry + 暗黙エントリの合計が 2 件未満 → 「比較には 2 件以上の参考リポジトリが必要です」と表示して終了
4. `owned: true` のエントリが 0 件 → 「改善提案の出力先となる自分のリポジトリがありません」と表示して終了 (暗黙エントリが有効なら通常この分岐には来ない)

### ステップ 2: 参考リポジトリの fetch

registry の各エントリに加え、暗黙エントリ (`$HOME/.claude`) を常にリストに含めて処理する。暗黙エントリは `github` フィールドがなく、base dir は `$HOME/.claude` 固定、subpath 解決・ghq 検索・gh api fetch をスキップして直接読む。

各エントリについて以下を試みる:

1. registry から `note` も合わせて読む (ヒントとして使う)
2. `github` フィールドをパース: 最初の 2 セグメントを `{owner}/{repo}`、残りを `{subpath}` として扱う
3. `ghq list --full-path` で `{owner}/{repo}` を探し、あれば `{local}/{subpath}` を base dir として使う (subpath なしならクローン root)
4. 見つかればそこから `.claude/` を読む
5. 見つからなければ `gh api repos/{owner}/{repo}/contents/{subpath}/.claude` (subpath なしなら `/.claude`) で取得
6. 失敗したらスキップし、理由を記録する

#### 有効性チェック

`.claude/agents/` または `.claude/skills/` に 1 ファイル以上あれば有効。どちらも空ならスキップ。

### ステップ 3: 横断分析 (役割クラスタリング + マージ合成)

main thread では全 repo の `.claude/` 本文を直接読まない。重い走査と差分分析は subagent に委譲し、main thread は結果の集約とユーザー確認だけを担う。これは context 消費を抑え、クラスタ間の分析を並列化するための設計。

#### 3-1: クラスタマップの取得 (dotclaude-claude-scanner)

Agent ツールで `dotclaude-claude-scanner` を 1 回起動する。

- subagent_type: `dotclaude-claude-scanner`
- 入力 prompt に渡す内容:
    - `mode: cross-review`
    - `targets`: ステップ 2 で base_dir が解決できた全 repo (暗黙エントリ含む)
        - 各要素に `name`, `base_dir` (絶対パス), `role`, `owned`, `note` を含める
- 出力: クラスタマップ (確定クラスタ / 要確認クラスタ / ユニーク役割 / note 不一致)

返ってきたレポートをそのまま main thread のワークメモリに保持する。ファイル本文は含まれない軽量サマリのみ返ってくる。

#### 3-2: 要確認クラスタの解決

scanner が「要確認クラスタ」を返してきた場合、AskUserQuestion で「同一クラスタに寄せるか、別クラスタとして扱うか」をユーザーに確認する。判断材料として scanner の要約と理由をそのまま提示する。

#### 3-3: クラスタ内マージ分析 (dotclaude-cluster-merger 並列起動)

確定クラスタのうち所属ファイルが 2 個以上のもの、およびユニーク役割で展開候補 repo が存在するものについて、`dotclaude-cluster-merger` を**並列起動**する (独立したクラスタ間に依存はないので同一メッセージに複数の Agent tool_use を入れる)。

各起動の入力:

- subagent_type: `dotclaude-cluster-merger`
- 入力 prompt:
    - `cluster_name`
    - `files`: 所属ファイルの `{repo, abs_path, kind, tech_stack_hint, note, owned}` 配列
    - `deployment_candidates`: そのクラスタを持たない owned repo のうち展開候補となり得るもの (note で除外されていない、tech stack が合う等)

出力: 差分分類 / 合成版ドラフト / 反映戦略 (full_merge | essence_injection | user_decision_required) / 配置先リスト

#### 3-4: 並列実行の注意

- 1 メッセージで起動する cluster-merger の数は概ね 5 個までに抑える (過剰な並列はトークン消費が増える)
- クラスタ数が多い場合はバッチに分けて順次起動する
- cluster-merger は read-only なのでファイル競合の心配はない

#### note の考慮

scanner に note を渡してあるので、「この部分は参考にしない」領域は scanner 側で `note_excluded: true` マーク済み。main thread は note 不一致レポートを受け取り、ステップ 4 のレポートに反映する。

### ステップ 4: レポート生成

scanner と cluster-merger の出力を集約し、以下の形式で一括レポートを出力する。クラスタ単位で提案をまとめる。cluster-merger が返した合成版ドラフトと反映戦略はそのまま提示する (main thread で再生成しない)。

```markdown
# Cross Review Report

## サマリ

- 検出クラスタ数: N
- マージ合成対象: M クラスタ
- ユニーク役割展開候補: K 件
- note 不一致: J 件

## クラスタ別提案

### クラスタ 1: {役割名} (例: meta-review)

所属ファイル:
- {repo A}: {path} (最新候補)
- {repo B}: {path}
- {repo C}: 未所持

差分分析:
- マージ可能: {要約}
- 個性として残す: {要約}
- 競合/要判断: {あれば}

合成版の配置先: 全所属 repo の上書き + {repo C} への新規配置 (該当する場合)

合成版プレビュー:
{diff or 全文の要約}

### クラスタ 2: ...

## ユニーク役割展開候補

### {役割名} ({保持 repo} → {展開先 repo})
- 現状: {保持 repo} にのみ存在
- 展開先の特性マッチ: {説明}
- 提案: そのまま移植 / 微調整して移植 / スキップ

## note の不一致 (あれば)
- {repo}: note には「X」と書かれているが、実際には {Y} が存在する
```

### ステップ 5: 提案の確認と反映

レポート全体を一度ユーザーに見せた後、提案件数に応じて以下のように確認を取る:

- 件数が少なければ一括承認
- 件数が多ければ 1 クラスタずつ AskUserQuestion で選ばせる (従来通り)

各クラスタ提案への選択肢:

- 反映する (合成版を全所属 repo に上書き + 必要に応じて新規展開)
- 合成版を編集してから反映 (ユーザーと対話で調整)
- ユニーク役割の場合: そのまま移植 / 微調整移植 / スキップ
- スキップ (今回は反映しない)
- 却下 (対象 repo の note に除外コメントを追記し、以後提案しない)

反映時の原則:

- owned=true の repo のみ書き込む。owned=false には一切書き込まない
- ローカルクローンに直接書き込む。コミット・プッシュはユーザー判断
- 複数 repo への書き込みは順番に行い、各 repo の変更差分をユーザーに表示する

### ステップ 6: note の更新 (任意)

ステップ 4 で note と現実の不一致を報告した repo について、ユーザーに note を更新するか確認する。

1. 不一致があった repo を列挙
2. 各 repo について「更新する / そのまま」を選ばせる
3. 「更新する」を選ばれた場合、更新案を提示して confirm 後に `${CLAUDE_PLUGIN_DATA}/registry.json` を更新する

## 注意

- owned=false の repo には一切書き込まない (PR を出せない前提)
- owned=true の repo への書き込みは必ずユーザー承認後に行う。勝手にコミット・プッシュしない
- この skill は registry の中身を双方向に使う。自分自身を除外する必要はない (cwd の概念がないため)
- tech stack 固有の記述 (ビルドコマンド等) は提案から除外する。汎用的な改善のみ対象
