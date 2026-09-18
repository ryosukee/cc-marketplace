# Diffo の表示調整

この plugin は、Diffo のブラウザ画面の表示を変更するスクリプト `bin/diffo-patch` を同梱する。
適用すると、次の 4 つの機能が追加・変更される。

- 解決済みスレッドを非表示にできる。表示・非表示を切り替えられ、初期状態は非表示。
  切り替えた状態はブラウザに保存され、スレッドの解決状態は変わらない。
- Markdown プレビューを GitHub 風に表示する。1 行の改行から余分な `<br>` を生成しない。
- 新規コメントと返信の下書きを、再描画後も同じブラウザタブ内で復元する。
- Finish review に LGTM ボタンを追加する。締めコメント欄の内容とともに、レビュー完了、
  `diffo end` と polling の終了、返信不要を伝える固定文を送信する。

Diffo 公式 skill の手順で `npx -y @diffohq/diffo --no-open` を起動した後に、
この plugin の `bin/diffo-patch` を実行する。
plugin root は、読み込んだ SKILL.md のパスから 2 階層上にある。

```bash
"<plugin root>/bin/diffo-patch"
```

> [!NOTE]
> diffo の起動後に適用する。npx が diffo を更新した後は再適用する。
> 適用後はブラウザをリロードする。変更が反映されなければハードリロードする。
> 表示切替が出ないときは、Diffo 側の class 名や `aria-label` の変更を確認する。

`diffo-patch` 適用後は、返信の段落間に空行を入れる。段落内で強制改行するときだけ
`<br>` を使い、改行のつもりで文字列 `\n` を渡さない。
