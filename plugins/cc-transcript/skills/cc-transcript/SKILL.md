---
name: cc-transcript
description: >-
  現在セッションの直近 N 件のやり取りを jq で整形して vim で開く。
  NO FLICKER モードで過去会話を読み返したい時に使う。
  "過去ログ見る" "transcript" "振り返り" 等で発動。
disable-model-invocation: true
allowed-tools: Bash(bash *)
argument-hint: "[N] [MODE] [SCOPE]"
---

# cc-transcript

## 引数

positional 3 つ。空欄スキップは後ろから省略のみ (前を空欄にはできない)。

| 位置 | 名前 | 値 | default |
| --- | --- | --- | --- |
| 1 | N | 正の整数 | 20 |
| 2 | MODE | `window` / `popup` / `print` | tmux 内なら `window`、tmux 外なら `print` |
| 3 | SCOPE | `dialogue` / `full` | `dialogue` |

## 1. transcript 生成

以下を実行。stdout に出力パスが 1 行出る。

!`bash ${CLAUDE_SKILL_DIR}/scripts/extract.sh ${CLAUDE_SESSION_ID} ${1:-20} ${3:-dialogue}`

エラー (JSONL が見つからない等) ならここで停止してユーザーに報告。

SCOPE:

- `dialogue` (default): user / assistant のプレーンテキストのみ。thinking / tool_use / tool_result は除外
- `full`: 全部含む。tool 呼び出しはサマリ付き fold にまとまる

## 2. MODE の決定

`<command-args>` を見て 2 番目の引数を確認する。

- `window` / `popup` / `print` のいずれか → それを使う
- それ以外 (未指定 or 無効な値) → Bash で `[ -n "$TMUX" ] && echo yes || echo no` で tmux 判定
    - tmux 内 → `window`
    - tmux 外 → `print`

ユーザーに問い合わせはしない。自動で決める。

## 3. 開く

Bash ツールで以下を実行する。`<path>` は 1 で取得したパス、`<mode>` は 2 で決めたもの:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/open.sh <path> <mode>
```

`open.sh` は MODE によらず最初にパスを stdout に出す。vim を閉じた後に再度開きたい時のリマインダ。

- `popup` / `window`: パス表示後に tmux を介して vim が開く。Bash ツールは vim 終了までブロックする
- `print`: パス表示のみ
