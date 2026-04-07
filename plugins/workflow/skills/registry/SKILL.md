---
name: registry
description: 参考リポジトリの登録・一覧・削除を行う。doctor skill が参照するリポジトリリストを管理する。
---

# 参考リポジトリ管理

workflow plugin の参考リポジトリ一覧 (`${CLAUDE_PLUGIN_DATA}/registry.json`) を管理する。

## 意図

`/workflow:doctor` が参照する「手本となるリポジトリ」のリストを user-local で管理する。workflow plugin の repo には置かず、`${CLAUDE_PLUGIN_DATA}` に保持するため、plugin のアップデートやバージョン変更とは独立して永続化される。

## 前提

- 永続化先: `${CLAUDE_PLUGIN_DATA}/registry.json`
- ファイルが存在しない場合は、最初の操作時にディレクトリごと作成する (`mkdir -p` 後に書き込み)

## 引数

`/workflow:registry {command} [args]`

| command | 説明 | 例 |
|---|---|---|
| (なし) | 一覧表示 | `/workflow:registry` |
| `add {owner/repo}` | 追加 | `/workflow:registry add life-ops-kit/feedmarks` |
| `remove {name}` | 削除 | `/workflow:registry remove feedmarks` |

## ワークフロー

### 一覧表示 (引数なし)

1. `${CLAUDE_PLUGIN_DATA}/registry.json` を読む
2. ファイルがない、または空の場合は以下を表示:
   ```
   参考リポジトリは登録されていません。
   /workflow:registry add {owner/repo} で追加してください。
   ```
3. ある場合は表形式で表示:
   ```
   | 名前 | GitHub | role | 説明 |
   |---|---|---|---|
   | feedmarks | life-ops-kit/feedmarks | primary | ... |
   ```

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
6. AskUserQuestion で以下を確認:
   - **role**: `primary` (手本として主に参考にする) / `reference` (補助的に参考にする)
   - **name**: 表示名 (デフォルトは repo 名)
   - **description**: リポジトリの説明 (任意・自由入力)
   - **note**: 補足情報 (任意・自由入力)
7. `${CLAUDE_PLUGIN_DATA}` ディレクトリがなければ `mkdir -p` で作成
8. `registry.json` に追加して保存
9. 完了メッセージを表示

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
      "note": "補足情報"
    }
  ]
}
```

- `role: primary` — 主に参考にするリポジトリ
- `role: reference` — 補助的に参考にするリポジトリ

## 注意

- `${CLAUDE_PLUGIN_DATA}` は plugin のバージョンアップでも保持される。ユーザーが登録した内容は plugin update で失われない
- plugin を uninstall すると `${CLAUDE_PLUGIN_DATA}` も削除される (`--keep-data` フラグで保持可能)
- `registry.json` はユーザーが手で編集しても問題ない。skill は次回実行時にその内容を読み込む
