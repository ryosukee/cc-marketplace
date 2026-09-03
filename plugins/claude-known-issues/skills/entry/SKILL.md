---
name: entry
description: Claude Code の既知バグ・制約を一覧に追記する。新しいバグ・制約に当たってワークアラウンドを作ったとき、既存エントリの log を更新するとき、"既知バグ 追記"、"known-issues entry"、"一覧に追加" 等で発動。
---

# 既知バグ一覧への追記

Claude Code のバグ・制約に対してワークアラウンドを作ったら、この一覧に記録する。
記録しないと、修正されたときに解除する手がかりが失われる。

## 一覧の場所

未解決のエントリは `${CLAUDE_PLUGIN_DATA}/known-issues.yml`、解除したエントリは
同じディレクトリの `known-issues.resolved.yml`。エントリに status は無く、どちらのファイルにあるかが状態。
どちらも無ければ空（`entries: []`）で作られる。エントリの書き方の例は
`${CLAUDE_PLUGIN_ROOT}/config/known-issues.template.yml` と、同じディレクトリの
`known-issues.resolved.template.yml` にある。例の中身が一覧へ入ることはない。

```
CLAUDE_PLUGIN_DATA="${CLAUDE_PLUGIN_DATA}" CLAUDE_PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT}" \
  bash -c 'source "${CLAUDE_PLUGIN_ROOT}/scripts/lib/state.sh"; resolve_ledger; echo "$LEDGER_PATH"'
```

どちらのファイルも `.claude/` 配下だが、bypassPermissions では直接 Edit できる。
それ以外のモードでは確認プロンプトに答える。

## エントリの型

8 項目。増やさない。

```yaml
- id: kebab-case-の識別子
  title: 一行のタイトル
  summary: |
    何が起きるか。実測した事実だけを書き、文書の読み取りだけで書かない
  affected: 挙動が入った版〜変わった版（changelog で確認した範囲。不明なら「不明、v{現在} で実測」）
  refs:
    - https://github.com/anthropics/claude-code/issues/NNNNN
    - https://code.claude.com/docs/en/...
  dependents:
  - '{ワークアラウンドを担う場所（plugin / skill / rule とファイル・節）}: {解除時にそこをどうするか}'
  how_to_verify: |
    再現手順と期待結果。誰が実行しても同じ結果が出る形で書く。
    期待結果と違う結果が出たら解除候補
  log:
  - 'YYYY-MM-DD: 確認したことと結果'
```

`dependents` と `log` の各項目は単引用符で囲んだ 1 行にする。中の単引用符は `''` にする。
`場所: 内容` や `日付: 内容` を引用符なしで書くと、YAML では mapping として読まれ、
一覧全体が parse できなくなる。項目を複数行に折り返さない。

- `dependents`: このエントリに依存している場所の一覧。1 行に「場所: 解除時にどうするか」を書く。
  対応はこの一覧側だけが持つ。ワークアラウンドを担う rule・skill の側には、この plugin や
  一覧のエントリへの言及を置かない（配布先に plugin が無いこともあり、rule が他 plugin を知る形になる）
- `how_to_verify`: 全件突合（review skill の `full`）が実行する手順。プローブファイルを作るなら
  名前を `.known-issues-probe-{id}` にし、手順の最後に消す
- `log`: 突合のたびに 1 行増える。「いつ確認して、まだ直っていなかった」の記録

## 追記の手順

1. 一覧を Read し、既存の `id` と重複しないことを確認する（resolved 側も見る）
2. 挙動を実測する。summary に書くのは実測した事実だけ。公式ドキュメントの記述は refs に入れる
3. changelog を遡る。挙動が入った版が分かるならそこから、分からなければ 30 版前から現在まで:

   ```
   bash ${CLAUDE_PLUGIN_ROOT}/scripts/fetch-changelog.sh {FROM} {現在の版}
   ```

   関係する行があれば summary と affected に反映する。登録より前に挙動が変わっていることがある
4. how_to_verify を、手順 2 の実測をそのまま手順にして書く
5. dependents を書く。ワークアラウンドを担う rule・skill の側には一覧への言及を足さない
6. ワークアラウンドを担う rule・skill の frontmatter に `note` を書く（下記）
7. 一覧を編集して保存する

## ワークアラウンド側に書くこと

- rule・skill の本文: どう振る舞うか。制約の中身は why に機構として書き、
  バージョン番号・changelog の引用・一覧のエントリ id・plugin 名は書かない。
  一覧を読まないセッションでも振る舞いが再現できる状態にする
- rule・skill の frontmatter の `note`: この文書がワークアラウンドであること、
  対象の制約と根拠（挙動が入った版、changelog の引用、実測の所在）、解除の条件。
  frontmatter はセッションのコンテキストに載らないので、指示として読まれない情報はここに置く。
  `status` のような状態フィールドは付けない。読んで判断が変わる値が無い
- 一覧側: 再現手順、依存している場所、時系列ログ
