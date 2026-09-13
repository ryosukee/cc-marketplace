# Claude Code と Codex の共通化方針

cc-marketplace は、複数の作業リポジトリで使う Claude Code と Codex の拡張機能を管理する。
本書では、この二つをまとめて CodingAgent と呼ぶ。製品名は `Claude Code` と表記する。
次のものを管理対象とする。

- skill
- 名前付き agent
- hook
- skill、名前付き agent、hook が呼び出すスクリプト
- 既定設定
- requirements と setup 手順

ユーザー環境に配置する設定ファイル、導入する CLI の一覧、symlink は dotfiles で管理する。
業務知識、ビルドコマンド、ディレクトリ固有の執筆規約は各作業リポジトリで管理する。

## 対応 CodingAgent の分類

各 plugin は、README に動作を確認した CodingAgent を次のいずれかで明記する。

| 分類 | 意味 |
| --- | --- |
| Claude Code + Codex | Claude Code と Codex の両方で動作を確認した |
| Claude Code only | Claude Code でのみ動作を確認した |
| Codex only | Codex でのみ動作を確認した |

未検証の CodingAgent は分類に含めない。共有方式は機能ごとに選ぶ。

## CLAUDE.md と path rules を両エージェントで共有する

Claude Code と Codex に共通する作業リポジトリの指示は、`CLAUDE.md` に置く。
Codex はユーザー設定の`project_doc_fallback_filenames = ["CLAUDE.md"]`で同じファイルを読む。
Codex 専用の追加指示が無ければ `AGENTS.md` は作らない。

Claude Code の `.claude/rules/*.md` と `paths` を、path rules の正の所在とする。
Codex が同じ rule を読むためのスクリプトと hook は、ユーザー環境の設定として dotfiles で管理する。
cc-marketplace には重複する rule 読み込み plugin を置かない。

## Skill を利用範囲に応じて配置する

複数のリポジトリで使う skill は plugin で配布する。
特定の作業リポジトリだけで使う skill は、その作業リポジトリに置く。
ユーザー共通の skill は `.claude/skills` を原本とし、`.agents/skills` から symlink する。
この symlink の作成は dotfiles のセットアップで扱う。

名前付き agent の内部処理だけに使う文書は、`skills/` に置かない。
`skills/` に置くと、親 agent が直接選択できる機能として一覧に表示されるためである。

## Skill の入口を選ぶ

skill ごとに次の A または B を選ぶ。hook を併用するかどうかは、この選択とは別に決める。

### A. 共通の SKILL.md

対象は、両 CodingAgent で発動条件と実行手順が同じ skill。
一つの `skills/{name}/SKILL.md` を共有し、両方で動作を検証する。
入口まで分けると、同じ手順の改訂箇所が増える。

### B. CodingAgent 別の SKILL.md と共通 reference

対象は、poll の起動方法など CodingAgent ごとの手順が異なる一方、判断規範を共有する skill。
各 CodingAgent の SKILL.md を別の入口とし、共通規範は `references/` に一度だけ置く。
`diffo` の `claude-skills/ref-diffo/` と `codex-skills/ref-diffo/` がこの方式を使う。
SKILL.md は共通 reference を読むよう指示する。入口の違いは入出力変換ではないので、
この SKILL.md を adapter と呼ばない。

## Hook を使う場合は実装方式を選ぶ

hook を使う場合は次の A または B を選ぶ。この選択は skill の入口の選択から独立し、
hook だけを持つ plugin にも適用する。

### A. CodingAgent 別の hook 実装

対象は、CodingAgent ごとに処理そのものが異なり、共通の判定処理を取り出せない hook。
各 CodingAgent の hook 定義と処理を別々に持ち、それぞれで動作を検証する。

### B. 共通 script と CodingAgent 別 adapter

対象は、hook のイベント名や入出力形式が異なり、判定処理は決定論的に共有できる機能。
adapter は各 CodingAgent の入力を共通 script の入力契約へ変換し、script の結果を
各 CodingAgent の応答形式へ戻す。判定は共通 script に置き、固有の環境変数や JSON 形式を
渡さない。adapter はこの入出力の境界を指し、skill の分割や agent 定義の生成物には使わない。

## 名前付き agent の配布方式は未決定

Claude Code と Codex は名前付き agent の定義形式が異なる。
共通原本から生成する案は、共通の指示本文を二つの定義へ手作業で複写せず、
形式の違いを生成時に吸収するために挙げた。しかし、形式が異なるだけで生成が必要とは限らない。
両対応の実装例と方式間の検証がないため、次の候補からまだ選ばない。
名前付き agent を含む plugin を両対応にする時に候補を再検討し、配布方式を決める。
それまでは生成スクリプトや配置先を規約化しない。

### 候補 A: CodingAgent 別の入口と共通 reference

Claude Code 用と Codex 用の定義を別々に置き、共通の指示本文を参照する。
両方の agent が実行時に参照先を確実に読めるなら、生成せずに共通部分を一元管理できる。
定義ごとのメタデータや権限設定は別々に維持・検証する。実行時参照の可否は未検証。

### 候補 B: 共通原本から各定義を生成

共通の指示本文が多く、各 CodingAgent の定義を単独で完結させる必要がある場合の候補。
共通原本から Claude Code 用と Codex 用の形式を生成する。
生成スクリプト、差分確認、再生成と両方での動作検証が必要になる。

選択時は、実行時参照の可否、共通部分の量、固有メタデータの差、生成物の保守負担を比べる。
どちらを選んでも、agent 内部専用の資料を公開 `skills/` に置かない。
Codex 側で登録が必要な定義は明示的な setup で配置し、plugin cache の
version 付きパスを永続設定へ直接書かない。

plugin 外で定義している名前付き agent のうち、`op-review` と `meta-improvement` の共通化は保留する。

## Hook の移行対象

hook の実装方式にかかわらず、両方で動作を検証していなければ、
`Claude Code + Codex` と表示しない。

各 plugin の対応方針は次のとおり。

- `Claude Code only`: `claude-known-issues`、`plugin-update`、`version-check`
- `Claude Code + Codex` 化候補: `markdownlint`、`security-guards`

plugin 外で設定されている hook は現時点では移動しない。`Claude Code + Codex` 版を作るときに、
同じ処理を行う既存 hook を置き換えるか確認する。

## Requirements と setup を plugin ごとに管理する

requirements と setup の正の所在は各 plugin の README とし、独自の requirements manifest は設けない。
必要な項目と未 setup 時の扱いは [Plugin 設計原則](../.claude/rules/plugin-design.md) に記載する。

## 導入順序

1. Claude Code と Codex で共用する skill だけを持つ plugin で、Codex からの読み込みを検証する
2. dotfiles 管理の Codex hook で Claude Code の rule を読み込む
3. `markdownlint`、`security-guards` の順に hook を共通化する
4. 名前付き agent の配布方式を選び、対象 plugin の Codex 対応を検証する

既存の Claude Code 環境は一括で移行しない。plugin 単位で対応 CodingAgent と検証結果を更新する。
