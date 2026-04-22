# gitdiff

diffview.nvim を使った diff レビュー skill。

`/gitdiff` で直前の Edit/Write ツールで変更したファイルの差分を tmux 別ウィンドウの nvim diffview で表示する。

## 動作

1. 直前の Edit/Write で変更されたファイルを特定
2. 差分有無をチェック
3. tmux 内なら別ウィンドウで `nvim -c DiffviewOpen` を起動
4. tmux 外ならユーザーに選択肢を提示

## 依存

- `nvim` + diffview.nvim plugin
- `tmux`
- `git`
