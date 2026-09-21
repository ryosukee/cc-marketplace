# Marketplace plugin の両対応設計

本書は、cc-marketplace の plugin を Claude Code と Codex の両方へ配布する際の設計方針を定める。
この二つをまとめて CodingAgent と呼ぶ。plugin で扱う対象は次のとおり。

- skill
- 名前付き agent
- hook
- skill、名前付き agent、hook が呼び出すスクリプト

ユーザー環境の設定ファイルや symlink は dotfiles、作業リポジトリ固有の指示は
各作業リポジトリで管理する。これらの共有設定は本書の対象にしない。

## 対応 CodingAgent の分類

各 plugin は、README に動作を確認した CodingAgent を次のいずれかで明記する。

| 分類 | 意味 |
| --- | --- |
| Claude Code + Codex | Claude Code と Codex の両方で動作を確認した |
| Claude Code only | Claude Code でのみ動作を確認した |
| Codex only | Codex でのみ動作を確認した |

未検証の CodingAgent は分類に含めない。共有方式は機能ごとに選ぶ。

## Plugin で配布する skill

複数のリポジトリで使う skill は plugin で配布する。

名前付き agent の内部処理だけに使う文書は、`skills/` に置かない。
`skills/` に置くと、親 agent が直接選択できる機能として一覧に表示されるためである。

## Skill の入口を選ぶ

skill ごとに次の A または B を選ぶ。hook を併用するかどうかは、この選択とは別に決める。

### A. 共通の SKILL.md

対象は、両 CodingAgent で発動条件と実行手順が同じ skill。
一つの `skills/{name}/SKILL.md` を共有し、両方で動作を検証する。
入口まで分けると、同じ手順の改訂箇所が増える。

### B. CodingAgent 別の SKILL.md と共通 reference

対象は、poll の起動方法など CodingAgent ごとの手順が異なる一方、判断規範を共有する skill。
各 CodingAgent の SKILL.md を別の入口とし、共通規範は `references/` に一度だけ置く。
SKILL.md は共通 reference を読むよう指示する。
例: `diffo` は `claude-skills/ref-diffo/` と `codex-skills/ref-diffo/` に入口を分けている。

## Hook を使う場合は実装方式を選ぶ

hook を使う場合は次の A または B を選ぶ。この選択は skill の入口の選択から独立し、
hook だけを持つ plugin にも適用する。

### A. CodingAgent 別の hook 実装

対象は、CodingAgent ごとに処理そのものが異なり、共通の判定処理を取り出せない hook。
各 CodingAgent の hook 定義と処理を別々に持ち、それぞれで動作を検証する。

### B. 共通 script と CodingAgent 別 adapter

対象は、hook のイベント名や入出力形式が異なり、判定処理は決定論的に共有できる機能。
adapter は各 CodingAgent の入力を共通 script の入力契約へ変換し、script の結果を
各 CodingAgent の応答形式へ戻す。判定は共通 script に置き、固有の環境変数や JSON 形式を
渡さない。adapter はこの入出力の境界を指し、skill の分割や agent 定義の生成物には使わない。

## 環境変数と state の置き場

plugin が使う値の受け取り方を、CodingAgent が定義する変数と plugin で定義する環境変数に分けて定める。
この節で使う語は次のとおり。

- plugin root: plugin のファイルが置かれたディレクトリ
- plugin data: CodingAgent が plugin ごとに用意するデータ用のディレクトリ
- state: スクリプトが実行をまたいで残すファイル

### CodingAgent が定義する変数の仕様

変数ごとに、文字列が実際の値に置き換わる場所と、環境変数として値が渡るコマンドを示す。
hook の行は、使い捨ての plugin の SessionStart の hook を発火させて確かめた。

#### Claude Code

| 変数 | 置き換わる場所 | 環境変数として渡るコマンド |
| --- | --- | --- |
| `${CLAUDE_PLUGIN_ROOT}` | SKILL.md の本文、MCP の設定 | hook |
| `${CLAUDE_PLUGIN_DATA}` | SKILL.md の本文、MCP の設定 | hook |
| `${CLAUDE_SKILL_DIR}` | SKILL.md の本文 | なし |
| `${CLAUDE_SESSION_ID}` | SKILL.md の本文 | なし |
| `CLAUDE_CODE_SESSION_ID` | なし | Bash ツール、hook、stdio の MCP server |

2.1.274 で、hook のコマンドの単一引用符の中の `${CLAUDE_PLUGIN_ROOT}` は置き換わらず、値は環境変数として渡った。
Bash ツールで実行したコマンドに `CLAUDE_PLUGIN_ROOT` と `CLAUDE_PLUGIN_DATA` が無いことも、実行して確かめた。

#### Codex

| 変数 | 置き換わる場所 | 環境変数として渡るコマンド |
| --- | --- | --- |
| `${PLUGIN_ROOT}`、`${CLAUDE_PLUGIN_ROOT}` | hook のコマンド | hook |
| `${PLUGIN_DATA}`、`${CLAUDE_PLUGIN_DATA}` | hook のコマンド | hook |
| `CODEX_THREAD_ID` | なし | shell tool |

0.154.0 で、hook のコマンドの 4 つの名前は単一引用符の中でも置き換わり、環境変数としても渡った。
SKILL.md の本文で変数を置き換える処理は、ドキュメントにもソースにも見つかっていない。

### CodingAgent が定義する変数の使い方

#### Claude Code 専用の SKILL.md

Claude Code 専用の plugin と、Claude Code 専用の入口の skill（`claude-skills/`）では、
plugin のファイルを `${CLAUDE_PLUGIN_ROOT}` か `${CLAUDE_SKILL_DIR}` で指す。

why: Claude Code が実際のパスに置き換えるので、モデルがパスを推論せずに済む。

#### 両方の CodingAgent が読む SKILL.md

`${CLAUDE_PLUGIN_ROOT}` など Claude Code の変数を使わない。

why: Codex は SKILL.md の本文で変数を置き換えない。

skill 専用のスクリプトは `skills/{name}/scripts/` に置き、「この SKILL.md の二階層上」のような plugin root からの位置で指さない。
skill 専用のスクリプトとは、ある skill の SKILL.md に書いた手順からだけ実行し、ほかの skill や hook からは実行しないスクリプトを指す。
ほかの skill や hook と共有するスクリプトは、ここでは扱わない。

why: Codex は SKILL.md の相対パスを SKILL.md のディレクトリから解決するので、plugin root からの位置で指すとパスを解決しにくくなる。

SKILL.md では、`{SKILL_DIR}` を「この `SKILL.md` があるディレクトリの絶対パス」と定義する。
スクリプトは `{SKILL_DIR}/scripts/<スクリプト名>` の形で書く。

why: `{SKILL_DIR}` の定義が無いと、repo の作業ツリーで実行するときにスクリプトのパスを解決しにくくなる。

#### hook のコマンド

plugin root と plugin data は `"${CLAUDE_PLUGIN_ROOT}"` と `"${CLAUDE_PLUGIN_DATA}"` で指し、単一引用符で囲まない。

why: 両方の CodingAgent が hook にこの 2 つを環境変数として渡すが、Claude Code は単一引用符の中を置き換えない。

#### skill から実行するスクリプト

plugin root と plugin data を環境変数から読まない。
同じ skill の他のファイルの場所はスクリプト自身のパス（`$0`）から求め、state の置き場は「state の置き場」の節に従う。

why: どちらの CodingAgent も、skill から実行したコマンドに plugin root と plugin data を渡さない。

セッション id は、`CLAUDE_CODE_SESSION_ID` と `CODEX_THREAD_ID` の両方を読む。

why: 片方だけを読むと、もう一方の CodingAgent で実行したときにセッション id が空になる。

### plugin で定義する環境変数

#### 名前

plugin で定義する環境変数の名前を、`CLAUDE_` や `CODEX_` のような特定の CodingAgent を示す語で始めない
（例: 外部 API の base URL は `{サービス名}_API_BASE`）。

why: 特定の CodingAgent を示す名前だと、もう一方の CodingAgent に設定し忘れる。

#### 設定する場所

README には、その環境変数に値を設定する場所を CodingAgent ごとに記載する。

why: 環境変数を設定する場所が CodingAgent ごとに違う。

| CodingAgent | 環境変数を設定する場所 |
| --- | --- |
| Claude Code | `~/.claude/settings.json` の `env` |
| Codex | `~/.codex/config.toml` の `[shell_environment_policy]` の `set` |

Codex の置き場は、`codex exec -c` で `shell_environment_policy.set` を渡す形でだけ確かめた。`config.toml` に直接書く形は未確認。

### state の置き場

state の置き場は、次の順に決める。

1. plugin の作者が名前を決めた環境変数が空でなければ、その値
2. `XDG_DATA_HOME` が空でなければ、`${XDG_DATA_HOME}/{plugin}`
3. どちらも空なら、`~/.local/share/{plugin}`

why: どちらの CodingAgent も skill から実行したスクリプトに plugin data を渡さないので、置き場を plugin が決める。

## 名前付き agent を使う機能の両対応

名前付き agent を使う機能を両対応にする方式には、次の三案がある。

### A. CodingAgent 別の定義と共通 reference

Claude Code 用と Codex 用の定義を別々に置き、共通の指示本文を参照する。
両方の agent が実行時に参照先を確実に読めるなら、生成せずに共通部分を一元管理できる。
定義ごとのメタデータや権限設定は別々に維持・検証する。実行時参照の可否は未検証。

### B. 共通原本から各定義を生成

共通の指示本文が多く、各 CodingAgent の定義を単独で完結させる場合の案。
共通原本から Claude Code 用と Codex 用の形式を生成する。
生成スクリプト、差分確認、再生成と両方での動作検証が必要になる。

### C. Skill から子 agent に共通 reference を渡す

片方の CodingAgent には名前付き agent 定義を配布し、もう片方では skill から子 agent を起動する。
名前付き agent としての公開が不要で、skill の手順内だけで使う処理が対象。
両者に同じ判定規範を渡せるが、子 agent を利用できない環境ではその処理を実行できない。
例: `session` は Claude Code 用の `handover-reviewer` を維持し、
Codex の `handover` skill から子 agent に共通のレビュー規範を渡す。

現時点で採用したのは C のみ。A と B は検討段階にあり、
いずれかの方式に初めて着手するときは適用条件と実行方法を検証し、この文書を更新する。
いずれの方式でも、agent 内部専用の資料を公開 `skills/` に置かない。
