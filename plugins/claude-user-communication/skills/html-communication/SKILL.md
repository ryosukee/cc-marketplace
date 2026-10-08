---
name: html-communication
user-invocable: true
description: 調査報告・検証結果・比較表・設計判断の選択肢をユーザーに提示する前に必ず読む。ターミナルに長い報告を書き始める前が発動点で、書き終えてからでは遅い。該当するのは、調査・突合・検証の結果報告、複数案の比較、前提説明の長い説明、設問が多い確認（目安 4 問超）。ほかに「## HTML フォーム回答」を受け取ったとき、claude-html-communication の index・アセットを再生成するときにも使う。self-contained な HTML ページを共通ディレクトリ claude-html-communication に生成し、index 管理・閲覧先の提示までの運用一式を定める。
sources:
  - source: https://github.com/anthropics/claude-plugins-community/tree/f60f0454df3045f724c43c6346ec80bdcc3472b2/html-plan
    notes:
      - html-plan の公開 skill と runtime を比較資料として参照。
      - 常時表示する主操作と、補助操作を分ける UI を検討する材料。実装はこの skill の共通テンプレートで管理する。
      - 詳細表示と階層の展開も比較。配下の一括展開は採らず、本文で 1 段ずつ開く。
  - source: https://note.com/uchita_success/n/nf8711b1dba37
    notes:
      - 公開記事とプロンプトの、結論から根拠を開くパネルを参考にした。
      - スライド全体の構成や図の試算は今回の共通操作へ取り込んでいない。
  - source: https://x.com/CallofdutyFan32/status/2107194159526498517
    notes:
      - 公開動画の工程図から補足を開く表示を参考にした。原 HTML と作成 skill、発火操作は未確認。
      - ホバー・フォーカスで一時表示し、クリックで固定する方式は、利用者との試作で選んだ。
  - source: https://x.com/trq212/status/2107192901537329354
    notes:
      - html-plan の公開投稿と動画を比較の入口として参照。実装の根拠は上記の固定版コード。
---

# 入り組んだ説明・報告・確認は HTML で行う

`{SKILL_DIR}` は、この `SKILL.md` があるディレクトリの絶対パスを表す。
以下のコマンドを実行するときは、この値を実際のパスに置き換える。
Claude Code と Codex のどちらでも、同じ配信ディレクトリ・生成元 JSON・スクリプトを使う。

調査報告・設計判断の比較・設問の多い確認など、前提や構造が入り組んだ内容は、
ターミナルへのテキスト出力ではなく self-contained な HTML ページを生成して見せる。
構造化して順序立てて読める形に作り込むこと自体が目的なので、体裁は手を抜かない。

## 適用基準

- HTML にする: 前提説明が長い調査報告、複数の表・比較を含む設計判断、設問が概ね 4 問を超える確認、順序立てた説明が必要なもの
- テキストのまま: 短い報告、単発〜少数の質問（チャットのフリーテキストで質問する）

HTML にすると決めたら、ターミナル向けに書いた（書きかけた）長文をそのまま HTML へ移し替えない。
セクション分け、比較表、出典の分離によって、判断材料を順序立てて読める構造に組み直す。


## 作業に応じて読む参照

参照は、いま行う作業と作るページに必要なものだけ読む。形式を選んだ後に他の形式の本文を読まない。

- 新規作成・改稿では、[生成と一覧の運用](./references/common-workflow.md)、
  [本文の規範](./references/writing.md)、[生成元 JSON](./references/page-format.md) を読む。
  ページは生成元 JSON に書き、閲覧用 HTML は組み立てスクリプトだけが書く。
- 設問を含む `form` では [確認フォーム](./references/form.md) と
  [設問の JSON](./references/form-format.md) を読む。
  設問を含まない `report` では [報告](./references/report.md) を読む。
- 図・画像・独自 markup を使うときは [図の手順](./references/figures.md) と
  [図の JSON と markup](./references/figure-format.md) を読む。
  表現を選ぶときに [見せ方のパターン集](./references/patterns/README.md) を読む。
- 詳細パネル、階層の展開、図のそばの補足、脚注・用語の補足を使うときは
  [共通操作](./references/detail-operations.md) を読む。
  操作は共通テンプレートと JSON のブロックで指定し、ページごとに作り直さない。
- 提示前は [検査とレビュー](./references/verification.md) を読む。
  図があるときは図の手順にある明暗・幅別の描画確認も行う。
  提示するのはファイルパス・設定済みの URL・問いだけとし、本文の要約をターミナルへ重ねない。
- 「## HTML フォーム回答」を受け取ったときは、[回答の受領](./references/answer-receipt.md) を読み、
  回答全文の保存と `record-answer.mjs` の実行を、そのターンの最初の操作にする。
  報告の確認は報告の参照にある確認手順に従う。
- index・PWA・gallery の再生成だけを行うときは、生成と一覧の運用を読む。
  本文の作成手順や他形式の参照を追加で読まない。

## 表現見本と共通操作

ギャラリーは任意に選べる代表的な表現見本を集める。既存の見本を採用条件で選び、
本文の内容に合わせて使う。詳細の開閉や脚注プレビューなど、共通テンプレートが持つ固定操作の例を追加しない。
表現を選ぶための見本と、どのページでも揃える操作を分けることで、見本ごとに操作実装が分岐するのを防ぐ。

report は現在の共通 HTML 形式で生成する。スライド固有の生成手順・基盤はこの変更で実装しない。
通常の report を作るときはスライドの資料を読まずに完結する。
