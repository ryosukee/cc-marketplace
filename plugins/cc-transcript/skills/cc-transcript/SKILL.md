---
name: cc-transcript
description: >-
  現在セッションの直近 N 件のやり取りを jq で整形して vim で開く。
  NO FLICKER モードで過去会話を読み返したい時に使う。
  "過去ログ見る" "transcript" "振り返り" 等で発動。
disable-model-invocation: true
allowed-tools: Bash(bash *), AskUserQuestion
argument-hint: "[N] [MODE] [SCOPE]"
---

# cc-transcript

引数:

- `$1` = N (抽出レコード数, default 20)
- `$2` = MODE (`window` | `popup` | `print`)
- `$3` = SCOPE (`dialogue` | `full`, default `dialogue`)

## 1. transcript 生成

以下を実行して md を生成する。stdout に書き出し先パスが 1 行だけ出るので保持しておく。

!`bash ${CLAUDE_SKILL_DIR}/scripts/extract.sh ${CLAUDE_SESSION_ID} ${1:-20} ${3:-dialogue}`

エラーが出た場合 (JSONL が見つからない等) はここで停止しユーザーに報告する。

SCOPE について:

- `dialogue` (default): user / assistant のプレーンテキストのみ。thinking / tool_use / tool_result は除外
- `full`: 全部含む。tool 呼び出しはサマリ付き fold にまとまる

## 2. MODE の決定

`$2` が `window` / `popup` / `print` のいずれかであればそれを採用する。未指定なら AskUserQuestion で選ばせる。

選択肢と推奨は tmux 環境で変える。tmux 判定は Bash ツールで `[ -n "$TMUX" ] && echo yes || echo no` を実行して判定する:

- tmux 内 (`$TMUX` set):
    - window (Recommended): tmux の新規 window で vim を開く
    - popup: tmux display-popup でポップアップ表示
    - print: `/tmp` のパスだけ表示 (ユーザーが自分で開く)
- tmux 外 (`$TMUX` unset):
    - print (Recommended): パスだけ表示
    - popup / window: tmux 不在なので自動的に print にフォールバックされる旨を description に書いて選択肢は残す

## 3. 開く

Bash ツールで以下を実行する:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/open.sh <1 で取得したパス> <2 で決めた MODE>
```

`open.sh` は MODE によらず最初にパスを stdout に出力する。vim を閉じてから再度開きたい場合に備えたリマインダ。

- `popup` / `window`: パス表示後に tmux を介して vim が開く。Bash ツールは vim 終了までブロックする
- `print`: パス表示のみ
