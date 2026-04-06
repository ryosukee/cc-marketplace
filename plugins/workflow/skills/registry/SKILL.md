---
name: registry
description: 参照元リポジトリの登録・一覧・削除を行う。sync skill の対象リポジトリを管理する。
---

# レジストリ管理

workflow plugin の参照元リポジトリ (registry.json) を管理する。

## 意図

sync skill がテンプレートと比較する対象のリポジトリを管理する。新しいプロジェクトでワークフローをセットアップしたら、そのリポジトリを registry に追加しておくことで、以降の sync で改善が双方向に伝播する。

## 前提

- registry: `${CLAUDE_SKILL_DIR}/../../registry.json`

## 引数

`/workflow:registry {command} [args]`

| command | 説明 | 例 |
|---|---|---|
| (なし) | 登録リポジトリの一覧表示 | `/workflow:registry` |
| `add {owner/repo}` | リポジトリを追加 | `/workflow:registry add life-ops-kit/feedmarks` |
| `remove {name}` | リポジトリを削除 | `/workflow:registry remove feedmarks` |

## ワークフロー

### 一覧表示 (引数なし)

registry.json を読み、登録リポジトリを表形式で表示する:

```
| 名前 | GitHub | role | 説明 |
|---|---|---|---|
| feedmarks | life-ops-kit/feedmarks | primary | Go JSON API + React SPA |
```

### add

1. `owner/repo` 形式の引数を受け取る
2. 既に登録済みかチェック（重複防止）
3. リポジトリの存在確認:
   - `ghq list --full-path` でローカルを探す
   - なければ `gh api repos/{owner}/{repo}` で GitHub 上の存在を確認
   - どちらも見つからなければ警告し、それでも追加するか確認
4. ワークフロー構成の確認:
   - `.claude/agents/` と `.claude/skills/` の有無をチェック
   - なければ「ワークフロー構成がまだないリポジトリです。`/workflow:setup` でセットアップした後に追加することを推奨します」と案内
   - それでも追加するか確認
5. AskUserQuestion で以下を確認:
   - role: primary (双方向同期) / reference (テンプレートへの取り込みのみ)
   - description: リポジトリの説明（自由入力）
   - note: 補足情報（任意）
6. registry.json に追加して保存

### remove

1. name を受け取る
2. registry.json から該当エントリを検索
3. 見つからなければエラー表示
4. 確認後、registry.json から削除して保存
