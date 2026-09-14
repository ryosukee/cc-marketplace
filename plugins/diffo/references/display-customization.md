# Diffo の表示調整

`diffo-patch` は Markdown プレビューを GitHub 風にし、改行 1 つで不要な `<br>` を作らない。
解決済みスレッドは初期状態で隠し、表示を切り替えられるようにする。
コメントと返信の下書きも、同じブラウザタブ内で復元する。

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
