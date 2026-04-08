---
name: registry
description: 参考リポジトリの登録・一覧・削除を行う。doctor skill が参照するリポジトリリストを管理する。
---

# 参考リポジトリ管理

dotclaude plugin の参考リポジトリ一覧 (`${CLAUDE_PLUGIN_DATA}/registry.json`) を管理する。

## 意図

`/dotclaude:doctor` が参照する「手本となるリポジトリ」のリストを user-local で管理する。dotclaude plugin の repo には置かず、`${CLAUDE_PLUGIN_DATA}` に保持するため、plugin のアップデートやバージョン変更とは独立して永続化される。

## 前提

- 永続化先: `${CLAUDE_PLUGIN_DATA}/registry.json`
- ファイルが存在しない場合は、最初の操作時にディレクトリごと作成する (`mkdir -p` 後に書き込み)

## 引数

`/dotclaude:registry {command} [args]`

| command | 説明 | 例 |
|---|---|---|
| (なし) | 一覧表示 | `/dotclaude:registry` |
| `add {owner/repo}` | 追加 | `/dotclaude:registry add life-ops-kit/feedmarks` |
| `add {owner/repo/subpath}` | サブディレクトリ単位で追加 | `/dotclaude:registry add omnisinc/efso-document/to-be/idp` |
| `remove {name}` | 削除 | `/dotclaude:registry remove feedmarks` |

### サブパス指定

1 つの repo の中に独立したワークフロー構成 (`.claude/` が subdir にある等) が複数ある場合、`owner/repo/subpath` 形式で追加できる。

- `github` フィールドにはサブパスを含めて保存する (例: `omnisinc/efso-document/to-be/idp`)
- 存在確認・ワークフロー検出・description/note 生成は `ghq list --full-path` で得た repo root に subpath を join したディレクトリに対して実行する
- GitHub 上の存在確認は `owner/repo` 部分だけを `gh api repos/{owner}/{repo}` に渡す (subpath は `gh api repos/{owner}/{repo}/contents/{subpath}` で別途確認)
- doctor / cross-review 側も `github` から最初の 2 セグメントを repo、残りを subpath として解釈する

## ワークフロー

### 一覧表示 (引数なし)

1. `${CLAUDE_PLUGIN_DATA}/registry.json` を読む
2. ファイルがない、または空の場合は以下を表示:
   ```
   参考リポジトリは登録されていません。
   /dotclaude:registry add {owner/repo} で追加してください。
   ```
3. ある場合は表形式で表示:
   ```
   | 名前 | GitHub | role | owned | 説明 |
   |---|---|---|---|---|
   | feedmarks | life-ops-kit/feedmarks | primary | ✓ | ... |
   ```
   `owned` が `true` のリポジトリは `✓`、それ以外は空欄で表示する。

### add

1. `owner/repo` 形式の引数を受け取る (形式が不正ならエラー)
2. `${CLAUDE_PLUGIN_DATA}/registry.json` を読む (なければ空の構造で初期化)
3. 重複チェック (同じ `github` のエントリがないか)
4. リポジトリの存在確認:
   - `ghq list --full-path` でローカルクローンを探す
   - なければ `gh api repos/{owner}/{repo}` で GitHub 上の存在を確認
   - どちらも見つからなければ警告し、それでも追加するか AskUserQuestion で確認
5. ワークフロー構成の確認:
   - ローカル or GitHub API で `.claude/agents/` と `.claude/skills/` の有無をチェック
   - どちらも空の場合は「ワークフロー構成がまだないリポジトリです。参考リポジトリとして追加する意味は薄いかもしれません」と案内
   - それでも追加するか確認
6. description / note の候補を事前生成する:
   - ローカルクローンがあれば `README.md`, `CLAUDE.md`, `.claude/agents/`, `.claude/skills/`, `.claude/rules/` を読んで内容を把握する
   - ローカルがなければ `gh api repos/{owner}/{repo}/readme` 等で取得
   - 把握した内容から description 案 (技術スタック・目的を 1 行) と note 案 (ワークフロー構成の特徴・参考にすべきポイント) を 1 案ずつ生成する
7. AskUserQuestion で以下を確認:
   - **role**: `primary` (手本として主に参考にする) / `reference` (補助的に参考にする)
   - **owned**: あなたの持ち物ですか? (yes/no)。`/dotclaude:cross-review` で改善提案の出力先になるかどうかの判定に使う
   - **name**: 表示名 (デフォルトは repo 名)
   - **description**: 事前生成した案を第 1 選択肢として提示。「空のまま」も選択肢に入れる。ユーザーは Other で自由入力して修正できる
   - **note**: 事前生成した案を第 1 選択肢として提示。「空のまま」も選択肢に入れる。参考の仕方の補助コメント (例: 「パイプライン部分は runner 依存なので抽出不要」「個別 agents は成熟、rules は未整備」)。doctor/cross-review がこの note を合成時のヒントとして読む
8. `${CLAUDE_PLUGIN_DATA}` ディレクトリがなければ `mkdir -p` で作成
9. `registry.json` に追加して保存
10. 完了メッセージを表示

### remove

1. name を引数で受け取る
2. `${CLAUDE_PLUGIN_DATA}/registry.json` を読む (なければ「登録されていません」と表示して終了)
3. 該当エントリを検索
4. 見つからなければエラー表示 (近い名前のエントリがあれば候補として提示)
5. AskUserQuestion で削除確認
6. registry.json から削除して保存
7. 完了メッセージを表示

## registry.json の構造

```json
{
  "repositories": [
    {
      "name": "表示名",
      "github": "owner/repo",
      "description": "リポジトリの説明",
      "role": "primary | reference",
      "owned": true,
      "note": "参考の仕方のヒント"
    }
  ]
}
```

- `role: primary` — 主に参考にするリポジトリ
- `role: reference` — 補助的に参考にするリポジトリ
- `owned: true` — ユーザーが編集権限を持つ自分のリポジトリ。`/dotclaude:cross-review` で改善提案の出力先になる
- `owned: false` — 他人のリポジトリ。改善提案の出力先にはならず、参照元としてのみ使う
- `note` — doctor / cross-review が合成時にヒントとして読む自由テキスト

## 注意

- `${CLAUDE_PLUGIN_DATA}` は plugin のバージョンアップでも保持される。ユーザーが登録した内容は plugin update で失われない
- plugin を uninstall すると `${CLAUDE_PLUGIN_DATA}` も削除される (`--keep-data` フラグで保持可能)
- `registry.json` はユーザーが手で編集しても問題ない。skill は次回実行時にその内容を読み込む
