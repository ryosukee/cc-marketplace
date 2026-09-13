# Claude Code と Codex の共通化方針

cc-marketplace は、複数の作業リポジトリで使う Claude Code と Codex の拡張機能を管理する。
次のものを管理対象とする。

- skill
- 名前付き agent
- hook
- skill、名前付き agent、hook が呼び出すスクリプト
- 既定設定
- requirements と setup 手順

ユーザー環境に配置する設定ファイル、導入する CLI の一覧、symlink は dotfiles で管理する。
業務知識、ビルドコマンド、ディレクトリ固有の執筆規約は各作業リポジトリで管理する。

## 対応コーディングエージェントの分類

各 plugin は、README に動作を確認したコーディングエージェントを次のいずれかで明記する。

| 分類 | 意味 |
| --- | --- |
| Claude Code + Codex | Claude Code と Codex の両方で動作を確認した |
| Claude Code only | Claude Code でのみ動作を確認した |
| Codex only | Codex でのみ動作を確認した |

未検証のエージェントは分類に含めない。エージェント固有の入出力は adapter で扱い、
共有できる判定処理は共通のスクリプトへ置く。

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

## 名前付き agent の定義を共有する

名前付き agent は、共通の定義原本からエージェント別の定義を生成する。
Codex 側で登録が必要な定義は、明示的な setup で配置する。
ファイル配置と制作時の規則は [Plugin 設計原則](../.claude/rules/plugin-design.md) に記載する。

plugin 外で定義している名前付き agent のうち、`op-review` と `meta-improvement` の共通化は保留する。

## Hook の共通処理とエージェント別 adapter を分離する

エージェント固有のイベント名、入力 JSON、応答 JSON は adapter に閉じ込める。
判定処理を共有できても、いずれかのエージェントで動作を検証していなければ、
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
4. plugin が配布する名前付き agent に Codex adapter を追加する

既存の Claude Code 環境は一括で移行しない。plugin 単位で対応コーディングエージェントと検証結果を更新する。
