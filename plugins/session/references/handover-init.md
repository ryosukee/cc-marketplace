# .handover/ ディレクトリの初期化

skill が `.handover/` を使う前に実行する共通ワークフロー。

## 存在確認

以下の順で `.handover/` を探す。見つかった時点で探索終了。

1. CWD (primary working directory) 直下 (例: `ls .handover/`)
2. git root 直下 (CWD と異なる場合のみ。非 git プロジェクトではスキップ)

CWD は Claude Code 起動時の作業ディレクトリで、git root とは異なる場合がある。

見つかった `.handover/` の絶対パスを以降すべての操作で使う。
skill 側の `.handover/` への言及はすべてこの絶対パスに読み替える。

## 作成

どちらにも存在しない場合:

1. CWD と git root が異なる (かつ git root が存在する) なら、どちらに `.handover/` を作成するかユーザーに確認する。同じ場合や非 git プロジェクトの場合は CWD に作成する
2. `.gitignore` に `.handover/` を追加するかも合わせて確認する
3. 承認後、以下のサブディレクトリを含めて作成する:
    - `draft/`: 進行中セッションの記録 (最大 1 ファイル)
    - `todo/`: 確定済み・次セッションで未消化
    - `archive/`: 消化済み (全件保持)

## draft の特定

存在確認で特定された `.handover/` の `draft/` 内のファイルを対象とする。
複数ファイルがある場合は最新 (mtime) を使用する。
