---
name: plane-kanban-setup
user-invocable: true
description: plane-kanban を使うための初期設定を、人と一緒に 1 段ずつ進める。「plane-kanban のセットアップ」「kanban の初期設定」「この repo を Plane に登録して」と言われたとき、plane-kanban のスクリプトが前提条件の不足（exit 2）や、repo に workspace と project が設定されていないと返したときに使う。
---

# plane-kanban のセットアップを人と進める

`{SKILL_DIR}` は、この `SKILL.md` があるディレクトリの絶対パスを表す。
以下のコマンドを実行するときは、この値を実際のパスに置き換える。
コマンドは、セットアップする repo の作業ツリーの中で実行する。

1 段ずつ進める。人が作業する段では、終わったと言われるまで次の段へ進まない。

## 1. 足りないものを確かめる

`{SKILL_DIR}/scripts/check-setup.sh` を実行する。
出力の JSON で `false` か `null` の項目を、次の段から順に埋める。`ready` が `true` なら 6 へ進む。
人が作業を終えるたびに、このスクリプトを実行し直して確かめる。

## 2. macOS とコマンド

`macos` が `false` なら、この plugin は使えないと伝えて止まる（API key を macOS の Keychain から読むため）。
`curl` か `jq` が `false` なら、入れ方を案内する（例: `brew install jq`）。入れる作業は人が行う。

## 3. API key

`api_key` が `false` なら、次を人に頼む。

- Plane の Profile Settings → Personal Access Tokens で token を発行する
- ターミナルで `security add-generic-password -s plane-kanban-api-key -a "$USER" -w '<token>'` を実行する

token を受け取らない。Keychain から API key を読み出さない。

## 4. workspace

`git_worktree` が `false` なら、セットアップする repo の作業ツリーへ移って始め直すよう伝える。

`workspace` が `null` なら、kanban 用の workspace の slug（`https://app.plane.so/{slug}/` の部分）を人に聞く。
workspace がまだ無ければ、Plane の画面で作ってもらう。
kanban 用の workspace は 1 つに決め、すべての repo で同じものを使う。

## 5. project

`{SKILL_DIR}/scripts/init-project.sh --workspace <slug>` を実行する。

- workspace に repo と同じ name の project があれば、それを repo に設定して終わる
- 無ければ exit 2 で止まる。work item の番号の接頭辞（例: `CCM`）を人に聞き、`--identifier <接頭辞>` を足して実行し直す
- project の name を repo のディレクトリ名から変えたいと言われたら、`--name <name>` を足す

## 6. 結果を示す

`{SKILL_DIR}/scripts/resolve-project.sh` を実行し、repo に設定された workspace と project の name・identifier を人に示して終える。
