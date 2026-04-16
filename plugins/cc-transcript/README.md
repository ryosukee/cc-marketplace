# cc-transcript

現在セッションの直近 N 件のやり取りを JSONL から抽出し、markdown に整形して vim で開く skill。

`CLAUDE_CODE_NO_FLICKER=1` (fullscreen / alt-screen モード) では tmux copy-mode や端末の scrollback から過去の会話が取れない。組み込みの `Ctrl+O` Transcript は折りたたみができず vim 検索も効かない。この skill は JSONL 生データから必要部分だけを抽出し、vim の fold marker 付きで保存して `foldmethod=marker` 前提でローカル vim に開く。

## 使い方

```text
/cc-transcript                         # 直近 20 件、dialogue のみ、開き方は対話的に選択
/cc-transcript 30                      # 直近 30 件
/cc-transcript 30 window               # 直近 30 件を tmux 新規 window で開く
/cc-transcript 30 window full          # tool 呼び出し・thinking も含める
/cc-transcript 30 print                # パスだけ表示
```

### 引数

- `$1` = N: 抽出する user/assistant レコード数 (default 20)
- `$2` = MODE: 開き方
- `$3` = SCOPE: 含める範囲 (default `dialogue`)

### MODE

| MODE | 挙動 |
| --- | --- |
| `window` | `tmux new-window -n cc-transcript vim <file>` で別 window に開く |
| `popup` | `tmux display-popup -E -w 90% -h 90% vim <file>` でポップアップ表示 |
| `print` | 生成した md のパスだけ stdout に出力 |

`$2` を省略した場合、skill は AskUserQuestion で選択を促す。推奨は tmux 内なら `window`、tmux 外なら `print`。

tmux 外 (`$TMUX` unset) で `window` / `popup` が指定された場合、自動的に `print` にフォールバックする (stderr に通知あり)。

どのモードでも `open.sh` は最初にパスを stdout に表示する。vim を閉じた後にパスを控えておいて再度開きたい用途に対応する。

### SCOPE

| SCOPE | 含めるブロック |
| --- | --- |
| `dialogue` (default) | user/assistant のプレーンテキストのみ |
| `full` | dialogue に加えて thinking / tool_use / tool_result も含める。tool 呼び出しはサマリ付き fold にまとまる |

`dialogue` は読み返し用途に最適。`full` は Claude が内部で何をしていたか詳細に追う時に使う。

## 出力ファイル

`/tmp/cc-transcript-<session_id>.md` に毎回上書き保存する。永続化はしない。

## fold 操作 (SCOPE=full 時)

出力ファイルの末尾に modeline が入るので、開いた瞬間から `foldmethod=marker` / `foldlevel=0` が有効になり、tool 呼び出しブロックは折りたたまれた状態になる。

| キー | 操作 |
| --- | --- |
| `za` | カーソル位置の fold を開閉 |
| `zo` / `zc` | fold を開く / 閉じる |
| `zC` | ネストした fold を閉じる |
| `zR` | 全 fold を開く |
| `zM` | 全 fold を閉じる |
| `/pattern` | 通常の vim 検索 |
| `y` / `Y` | 通常の vim yank |

## 出力フォーマット

### SCOPE=dialogue

```markdown
## user

(プレーンなユーザー入力)

## assistant

(assistant のテキスト返答)
```

### SCOPE=full

````markdown
## user

(プレーンなユーザー入力)

## assistant

(assistant のテキスト返答)

<!-- Bash x2, Read x1 {{{ -->

#### Bash: Test extract.sh

```json
{"command":"..."}
```

→

```
(stdout)
```

#### Read: /path/to/file

```json
{"file_path":"/path/to/file"}
```

→

```
(content)
```

<!-- }}} -->

## assistant

(次の assistant テキスト)
````

連続する thinking / tool_use / tool_result は 1 つの fold にまとめ、タイトルに `<Tool> x<count>` の集計を表示する。`#### <Name>: <summary>` のサマリは Tool ごとに異なる (Read/Write/Edit は file_path、Bash は description、Grep/Glob は pattern、など)。

`{{{` / `}}}` は vim の fold marker。HTML コメントで囲んでいるので markdown レンダラーにも無害。content 内に `{{{` / `}}}` が含まれる場合は `{{ {` / `} }}` にサニタイズして構造 fold と衝突しないようにする。

## 構成

```text
plugins/cc-transcript/
├── .claude-plugin/plugin.json
├── README.md
└── skills/cc-transcript/
    ├── SKILL.md
    └── scripts/
        ├── extract.sh   # JSONL から md を生成しパスを stdout に出す (vim は起動しない)
        └── open.sh      # パスと MODE を受け取って開く (or パス表示)
```

transcript 処理と vim 起動を 2 スクリプトに分離してあるので、`extract.sh` 単体をパイプラインや別エディタから利用することもできる。

## 依存

- `jq` (1.6+ 推奨)
- `vim` (`popup` / `window` モード)
- `tmux` (`popup` / `window` モード)

## 動作原理

1. SKILL.md で `${CLAUDE_SESSION_ID}` と `${CLAUDE_SKILL_DIR}` が文字列置換される
2. `!` プレフィックスで `bash ${CLAUDE_SKILL_DIR}/scripts/extract.sh <session_id> <N> <SCOPE>` が skill load 時に実行され、md パスが stdout に出る
3. MODE が未指定なら AskUserQuestion でユーザーに確認
4. `bash ${CLAUDE_SKILL_DIR}/scripts/open.sh <path> <mode>` を Bash ツールで実行 (パスを先頭に echo → モードに応じて vim 起動または何もしない)

`~/.claude/projects/*/<session_id>.jsonl` を glob で特定する (resume で cwd が変わっても見つかるよう cwd エンコード部はワイルドカード)。

## 参考

- [Claude Code skills docs](https://code.claude.com/docs/en/skills)
- Issue #25642 (session_id 環境変数化の feature request)
