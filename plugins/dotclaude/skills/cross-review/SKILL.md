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

#### hooks / lint 設定の収集

有効な repo に対して、以下のファイルも存在すれば収集対象に含める (scanner に渡す):

- hooks 設定: `.claude/settings.json` の `hooks` キー、または `hooks/hooks.json`
- lint 設定: `.markdownlint.yaml`, `.markdownlint-cli2.yaml`, `.markdownlint.json` 等

hooks/lint 設定は「決定論的にできる部分を切り出した強い rule」に相当し、rule や skill と同等の cross-review 対象になる。ただし、明らかにプロジェクト固有のものはマージ対象外とする (この判断は他の rule/skill と同じ)。

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

cluster-merger への追加指示として、以下のアンチパターンを合成版に含めないよう明記する:

- 他の rule/skill/agent への補足的な相互参照 (「詳細は xxx を参照」)。参照がなくても成立する rule にする
- 外部ツールの具体的な設定名・ルール名 (markdownlint の `no-bare-md-references` 等)。rule としての禁止事項だけ書く
- プロジェクト固有の運用慣習を汎用 rule に混入する (特定 repo でしか成り立たない記述)

#### 3-4: 並列実行の注意

- 1 メッセージで起動する cluster-merger の数は概ね 5 個までに抑える (過剰な並列はトークン消費が増える)
- クラスタ数が多い場合はバッチに分けて順次起動する
- cluster-merger は read-only なのでファイル競合の心配はない

#### note の考慮

scanner に note を渡してあるので、「この部分は参考にしない」領域は scanner 側で `note_excluded: true` マーク済み。main thread は note 不一致レポートを受け取り、ステップ 4 のレポートに反映する。

### ステップ 4: レポート生成

scanner と cluster-merger の出力を集約する。cluster-merger が返した合成版ドラフトと反映戦略はそのまま使い、main thread で再生成しない。

#### 4-1: サマリ出力

クラスタ全体のサマリを短く出す:

```markdown
# Cross Review Report

## サマリ
- 対象 repo: N
- 検出クラスタ: M (マージ合成: X / クラスタ分割提案: Y)
- note 不一致: J 件
```

#### 4-2: repo 単位のレポートに転置

クラスタ単位の分析結果を **repo 単位** に転置して提示する。ユーザーが判断するのは「この repo の何がどう変わるか」であり、クラスタ単位だとその全体像が見えない。

```markdown
## {repo 名}

| ファイル | 種別 | 要約 |
|---|---|---|
| {path} | upgrade / NEW / inject / no-op | {変更内容の 1 行要約} |
| ... | ... | ... |
```

各 repo テーブルの後に、upgrade / inject の主な理由 (「xxx repo の発展的記述を吸収」「公式仕様に準拠」等) を簡潔に添える。

#### 4-3: クラスタ分割提案

scanner または cluster-merger が「既存クラスタ内に異なる関心事が混在している」と判定した場合、分割提案を出す。例: markdown-authoring から design-doc 向けの引用ブロック規約を分離する、など。

```markdown
## クラスタ分割提案

### {元クラスタ名} → {分割先 A} + {分割先 B}
理由: {なぜ分割が望ましいか}
影響 repo: {どの repo に新ファイルが必要か}
```

#### 4-4: note 不一致

```markdown
## note の不一致 (あれば)
- {repo}: note「X」→ 実態「Y」
```

### ステップ 4.5: タスク作成

repo 単位レポートを出した後、反映フェーズに入る前に TaskCreate で全体の作業計画をユーザーに見せる。

作成するタスク:

1. **repo ごとに 1 タスク**: 「{repo 名} の N 件を staging → 確認 → 反映」(ステップ 5 の各 repo に対応)
2. **note 更新タスク**: note 不一致があれば 1 タスク (ステップ 6)
3. **後続タスク**: plugin 化提案、registry 更新など (該当する場合)

タスクを作成した後、ユーザーに処理順序を選ばせてから着手する。各タスクは着手時に `in_progress`、完了時に `completed` に更新する。

### ステップ 5: 提案の確認と反映

repo 単位で順番に処理する。処理順序はユーザーに選ばせる。

#### 5-1: staging (repo 単位)

各 repo の合成版を `/tmp/cc-cross-review/{repo-name}/` に書き出す。合成版の本文は inline で提示せず、staging ディレクトリのパスを渡してエディタで確認してもらう。

変更箇所の近くに review マーカーを付ける。マーカーはコメント (変更理由) を囲むだけで、変更後の内容はマーカーの外に普通に書く:

```
<<<<<<< REVIEW
変更: {何をどう変えたか}
理由: {なぜこの変更をしたか}
>>>>>>>
{変更後の内容}
```

ユーザーはエディタで確認し、OK ならマーカーごと削除する。質問や修正指示は `@claude` でマーカー内にコメントを書いて返す。マーカー内の `@claude` コメントを受け取ったら、staging 上で対応して再確認を求める。

#### 5-2: 承認

各 repo の staging に対する選択肢:

- 反映する (staging から最終パスに `mv`)
- 修正指示を出す (staging 上で Edit してから反映)
- スキップ (今回は反映しない)
- 却下 (note に除外コメントを追記)

#### 5-3: plugin 化提案

反映フェーズ全体を通じて、skills + agents + hooks の組み合わせが「1 つの plugin としてパッケージ化した方が配布・管理しやすい」と判断できる場合、plugin 化を提案する。

**rules が絡むものは plugin 化に向かない**。plugin から rules は自動発動しないため、rules を含む組み合わせは plugin にしても中途半端になる。rules は dotfiles (`~/.claude/rules/`) で管理する。

判断基準:
- skills/agents/hooks だけで完結する関心事のまとまりがある
- 複数 repo で共通に使われている、または使われるべきもの
- 独立したバージョンライフサイクルで管理する価値がある

#### 5-4: dotfiles コミットの促進

user-global (`$HOME/.claude`) に変更を反映した場合、dotfiles リポジトリへのコミットを促す。`~/.claude/` が git 管理されていれば、そこが rules/skills/agents の正本となる。

#### 反映時の原則

- owned=true の repo のみ書き込む。owned=false には一切書き込まない
- ローカルクローンに直接書き込む。コミット・プッシュはユーザー判断
- staging を経由することで、意図しない書き込みを防ぐ
- 反映完了後に staging ディレクトリをクリーンアップする

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
