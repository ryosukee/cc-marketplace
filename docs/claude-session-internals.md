# Claude Code セッションの内部構造

調査日: 2026-03-15

## セッションの実体

- セッション = `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` の 1 ファイル
- jsonl は各行が `parentUuid` を持つ append-only のツリー構造
- クライアントは最終行から `parentUuid` を辿って「現在の枝」を構築・表示する
- 明示的な HEAD ポインタは不要。最終行 = HEAD

### encoded-cwd の例

```
/Users/ryosuke/ghq_root/github.com/ryosukee/kanban-agent-orchestration
→ -Users-ryosuke-ghq-root-github-com-ryosukee-kanban-agent-orchestration
```

### 真のフル ID

```
<encoded-cwd> + <session-uuid>
= ~/.claude/projects/<encoded-cwd>/<session-uuid>.jsonl
```

## ツリー構造

```
jsonl:
L1: Root
L2: A (parent: Root)
L3: B (parent: A)
L4: C (parent: B)      ← rewind で捨てられた枝
L5: D (parent: C)      ← rewind で捨てられた枝
L6: F (parent: B)      ← rewind 後、B から分岐
L7: G (parent: F)      ← 最終行 = HEAD。F→B→A→Root を辿る
```

L4, L5 はファイルに残っているが、最終行 G から辿ると到達しない。表示されない。

## rewind の仕組み

- jsonl から何も削除しない（append-only、非破壊）
- 過去のノードを parent にして新しい会話を追記
- 最終行が変わることで HEAD が新しい枝に移る
- 古い枝はファイルに残っているがクライアントは辿らない
- git でいうと: 過去のコミットから新ブランチを切って checkout する
- セッション ID は変わらない（同じファイル内の操作）

## fork の仕組み

- jsonl ファイルを新しい UUID でコピー = ツリーごとコピー
- 2 つの独立したセッション（独立したファイル）になる
- rewind と違い、両方を独立して並行操作・resume 可能
- セッション ID が新たに発行される（別ファイルが必要だから）
- `/fork` 実行後、現ターミナルは新ファイル（fork 先）に切り替わり、元セッションの resume コマンドが出力される

## rewind と fork の比較

| | rewind | fork |
|---|---|---|
| 操作 | 同じファイル内で枝を切る | ファイルをコピーして新 UUID を振る |
| セッション ID | 変わらない | 新しい ID が発行される |
| 並行操作 | 不可（1 ファイル = 1 セッション） | 可（独立した 2 セッション） |
| 古い枝 | ファイルに残る（非破壊） | コピー元にそのまま残る |
| git 相当 | 過去コミットから新ブランチ | リポジトリを clone |

## 実験結果

### rewind

- rewind 前: 1345 行
- rewind で数往復分を巻き戻し
- rewind 後: 1379 行（増えた。削除されない）
- 巻き戻された会話の `parentUuid` を確認し、rewind 先のノードから分岐していることを確認

### fork

```bash
# 手動 fork（公式 /fork と同等）
NEW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
cp <current-session>.jsonl <project-dir>/${NEW_ID}.jsonl
claude -r $NEW_ID  # 動く
```

## fork-to-pane skill 設計メモ

- skill から `/fork`（ビルトイン CLI コマンド）は呼び出せない
- 代わりに jsonl コピー + tmux 操作で同等のことが可能

```bash
PROJECT_DIR=~/.claude/projects/<encoded-cwd>
CURRENT_SESSION=$(ls -t "$PROJECT_DIR"/*.jsonl | head -1)
NEW_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
cp "$CURRENT_SESSION" "$PROJECT_DIR/${NEW_ID}.jsonl"
tmux split-pane "claude -r $NEW_ID"   # fork-to-pane
tmux new-window "claude -r $NEW_ID"   # fork-to-window
```
