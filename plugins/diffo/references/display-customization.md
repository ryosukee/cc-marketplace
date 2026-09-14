# Diffo の表示調整

Markdown プレビューとスレッド表示を調整するときに使う手順。

`diffo` を起動した後に、この plugin の `bin/diffo-patch` を実行する。
plugin root は、読み込んだ SKILL.md のパスから 2 階層上にある。

```bash
npx -y @diffohq/diffo --no-open
"<plugin root>/bin/diffo-patch"
```

> [!NOTE]
> diffo の起動後に適用する。npx が diffo を更新した後は再適用する。
> 適用後はブラウザをリロードする。変更が反映されなければハードリロードする。
> 表示切替が出ないときは、Diffo 側の class 名や `aria-label` の変更を確認する。

`diffo-patch` 適用後は、返信の段落間に空行を入れる。段落内で強制改行するときだけ
`<br>` を使い、改行のつもりで文字列 `\n` を渡さない。
