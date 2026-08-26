# idea-hub への申し送りの下書き

| 項目 | 内容 |
| --- | --- |
| 目的 | idea-hub へ渡す伝達事項を、norm-refit の進行中に追記して貯める |
| 生存期間 | norm-refit の完了時に依頼文へ編み、ユーザー経由で idea-hub へ渡すまで |
| 対象タスク | idea-hub（norm-refit の全完了後に着手） |

idea-hub のセッションへ渡す伝達事項を、norm-refit の進行中に追記して貯める。
idea-hub 側は norm-refit の全完了後に作業を開始する予定なので、
完了時にこのファイルを依頼文へ編み、ユーザー経由で渡す
（他 repo の `.handover/` へ直接書かない）。

- 1 エントリ = 1 伝達事項。日付と出典を付ける
- 追記だけでなく、最新の事情に合わせて編集する。古くなった指示は消すか書き直し、
  渡す時点で全エントリが現状を正しく伝える状態を保つ
- エントリの内容を大きく変えた・消したときは、日付を付け直す

## 2026-08-23 rule-authoring.md を boilerplate から差分ありで取り込んだ

cc-marketplace が `rules/rule-authoring.md`（paths = `.claude/rules/**/*.md`,
`rules/**/*.md`）を新設し、symlink 配布で全 repo に効いている。
boilerplate の `bundles/core/rules/rule-authoring.md` と `authoring.md` から
最大公約数だけを抽出したもので、**原本との差分が 2 つある**。

- 「他の指示文書への markdown リンクを書かない」（`authoring.md`）は採用していない。
  代わりに「参照が冗長かで決める」3 条項（自動ロードで載る文書に言及しない /
  外側の構造に言及しない / 辿らせる責任がある文書は参照を書く）に置き換えた。
  一律禁止は cc-marketplace の `markdown-formatting.md`（必要になったら必ずリンク）と
  衝突するため
- 例外規定「冒頭の地図では記述名（リンクなし）で示す」も採用していない

idea-hub 側で boilerplate を bundle 配布するとき、rule-authoring 系はこの差分を前提に
統合を設計すること。出典: cc-marketplace `notes/norm-refit.md` の 2026-08-23 の
ccm-f041 エントリ、PR #5。

## 2026-08-23 primary-sources-first の移管待ちが続いている

`rules/primary-sources-first.md` は idea-hub への移管予定（依頼文はユーザー経由で
渡し済み）。idea-hub 側で受け入れが完了したら cc-marketplace 側のファイルを削除する。
それまでは cc-marketplace が暫定の単一正。出典: cc-marketplace `notes/norm-refit.md`
未解決課題。
2026-08-25 に節「測ったものと本当に測りたかったものが同じかを確かめる」が PR #7 で足された。
移管するときはこの版を渡す。

## 2026-08-23 impl-spec の条項は norm-refit で触っていない

`移設先` と判定された impl-spec の 200 件超と、内部重複 91 条項（原文完全一致 36 種）の
解消は idea-hub の実装計画 PR 8（product-workflow への統合）の管轄。判定の語彙と明細は
cc-marketplace `notes/artifacts/norm-audit-raw/verdict-schema.md` と
`norm-audit-verdict-*.md` にある。

## 2026-08-23 boilerplate の norms は norm-refit 完了まで編集凍結

product-boilerplate の `docs/norms/` 全体（100 本）と、norm-refit が統合する
汎用執筆分 52 本は、norm-refit 段階 5（facet 参照の切り替え）まで編集しない。
基準点は写し元 commit `6dfddfc31b326d86c47d496646321551f07e5206`。
idea-hub 側の作業開始が凍結解除より先になる場合は、cc-marketplace 側と調整が要る。

## 2026-08-25 確認・質問の規範 13 件は cc-marketplace 側で整理した。impl-spec の原文はそのまま

impl-spec 3 skill にある確認・質問の規範のうち汎用の 13 件（IS4 / IS34 / IS52 / IS15 / IS36 / IS37 /
IS57 / IS59 / IS61 / IS79 / IS94 / IS197 / IS234。名簿は cc-marketplace `notes/artifacts/norm-audit-roster.md`）を、
cc-marketplace が一般化した文で自分の規範側へ写した（norm-refit PR 3。明細は
`notes/artifacts/norm-refit-pr3-detail.md` の C 節）。impl-spec 側の原文は消していない。
impl-spec を product-workflow へ統合するとき、同じ 13 件をそちらの構成でも整理してほしい
（cc-marketplace 側の文をそのまま使ってもよいし、統合先の構成に合わせて書き直してもよい）。
出典: ccm-f051 Q1（2026-08-25）。
