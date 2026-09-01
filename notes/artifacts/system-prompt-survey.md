# システムプロンプトの実測

2026-09-01 に着手した調査の足場。全体像はまだ取れていない。
起点は「規範を引かない問題」の調査で、明細は [規範を引かない問題の調査](./norm-adherence-survey.md)。

次セッションが続きをやるための足場。**バイナリから grep できる。**

対象は `/Users/ryosuke/.local/share/claude/versions/2.1.252`（Mach-O 64-bit x86_64）。
`/usr/bin/strings -n 40` で 104,253 行が取れる。`grep` の振り替えを避けて `/usr/bin/grep` を使う。

## 分かったこと

システムプロンプトは 1 つの塊ではなく、**別々の文字列定数として離れた位置に置かれ、
実行時に組み立てられている。** 見つけた断片の位置と長さ。

| strings の行 | 断片 | 長さ |
| --- | --- | --- |
| 52062 | `Do not call the AgentTool unless the user requested it` | 55 文字 |
| 52077 | act, don't re-derive の本体 | 278 文字 |
| 76251 | `Do ordinary work as asked...`（Delivering work） | 962 文字 |
| 76252 | `If you find an uncertainty mid-task...` | 382 文字 |
| 76254 | `Avoid unnecessary or excessive self-correction...` | 896 文字 |

**行動に効く断片が feature flag でゲートされている。** 76250 行に次がある（逐語）。

```js
var CQn=ai(()=>{let e=a.CLAUDE_CODE_ACT_DONT_REDERIVE,t=e??L("tengu_cedar_lantern",!0);
if(t)n(`act_dont_rederive_arm_active source=${e!==void 0?"env":"growthbook"}`);return t})
```

環境変数 `CLAUDE_CODE_ACT_DONT_REDERIVE` があればそれを使い、無ければ GrowthBook の
`tengu_cedar_lantern`（既定 true）を使う。**規範を引き直すことと最も直接に競合する指示が、
環境変数で切り替えられる。** これは段階 V の実験にそのまま使える。

未確認: 環境変数の値の解釈。`a.CLAUDE_CODE_ACT_DONT_REDERIVE` が生の文字列なら `"0"` は
truthy になる。既知バグ一覧の `task-tools-unavailable` は別の環境変数について
「真値は "1" / "true" / "yes" / "on"（小文字化・trim して判定。パーサ Dn()）」と記録している。
同じパーサを通っているかを確かめる必要がある。

## コンテキスト内の配置

system role のシステムプロンプトが位置 0 にあり、user global rule と CLAUDE.md は
**その後**、最初の user ターンの中に system-reminder として入る。
つまり規範は会話の側にあり、ターンが進むほど末尾から遠ざかる。
システムプロンプトは system role なので位置が動かない。

## transcript には自動注入が残らない（2026-09-01 実測）

`~/.claude/projects/<slug>/<session>.jsonl` に残るのは user のテキスト・assistant のテキスト・
`tool_use`・`tool_result` だけ。**システムプロンプトと、rule / CLAUDE.md の system-reminder は
transcript に書かれない。**

実測は cc-marketplace のセッション `1532f031-dd76-4de9-a950-104b4cda5b91`。

- `.message.role == "system"` のレコードが 0 件
- `system-reminder` の文字列が 5 件出るが、全部このセッション自身が
  `grep` の対象として打った文字列で、注入されたものではない
- `japanese-text-writing` の 88 件も同じ

これが効くのは、条項がコンテキストに載っていたかを transcript から判定するとき。
判定できるのは `cat` / `Read` で明示的に読んだものだけになる。
常時ロードの rule は「frontmatter に `paths` が無いから毎ターン載る」という推論であって、
transcript の観測ではない。

## 常時ロードの規模（2026-09-01 実測、main の HEAD）

`paths` を持たない `.md` のバイト数を数えた。ブランチ `alias-detection` では
`japanese-text-writing.md` が 2 行増える。

| 区分 | 本数 | バイト |
| --- | ---: | ---: |
| user global（`~/.claude/rules/cc-marketplace/`） | 8 | 21,129 |
| プロジェクト固有（`.claude/rules/`） | 5 | 18,179 |
| CLAUDE.md | 1 | 5,369 |
| 合計 | 14 | 44,677 |

user global の内訳。`subagent-delegation.md` 4,758 / `decision-record.md` 4,159 /
`bash-state-mutation-isolation.md` 3,345 / `primary-sources-first.md` 3,161 /
`propose-before-implement.md` 2,325 / `background-task.md` 1,442 /
`japanese-text-writing.md` 1,156 / `skill-invocation.md` 783。

## 規範の遵守に競合しうる指示（逐語）

> When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue.

> Avoid unnecessary or excessive self-correction. Only correct an earlier statement in your user-facing text when the error would change the user's code, conclusions, or decisions.

> If you find an uncertainty mid-task, first do everything that doesn't depend on the answer

システムプロンプトには、user rule を参照せよという指示が**無い**。参照を促すのは user rule 自身。
ただし入口 rule は常時ロードなので、きっかけ自体は毎ターン載っている。

## 環境変数によるゲートの仕組み（2026-09-01 実測）

システムプロンプトの断片は `Sc(名前, ()=>本文)` の配列として組み立てられ、
いくつかの断片が feature flag と環境変数でゲートされている。
環境変数は生値ではなく zod のスキーマを通る。スキーマは 2 種類あり、挙動が違う。

### `triBool` は強制 ON と強制 OFF の両方ができる

`CLAUDE_CODE_ACT_DONT_REDERIVE` はこちら。連鎖をバイナリで辿った結果。

```js
CLAUDE_CODE_ACT_DONT_REDERIVE:()=>Kr
Kr=R.triBool()
triBool:()=>f
f=m(()=>E.preprocess(r,E.string().optional().transform((n)=>{if(Oe(n))return!0;if(So(n))return!1;return}
Oe: toLowerCase().trim();return["1","true","yes","on"].includes(n)
So: toLowerCase().trim();return["0","false","no","off"].includes(n)
```

3 通りに落ちる。`1` / `true` / `yes` / `on` は `true`、`0` / `false` / `no` / `off` は `false`、
未設定と認識外の文字列（例: `disable`）は `undefined`。

ゲートは `let e=a.CLAUDE_CODE_ACT_DONT_REDERIVE, t=e??L("tengu_cedar_lantern",!0)` の形。
`??` は `false` を左辺として採用するので、**`0` を入れると GrowthBook の既定 `true` へ落ちず、
その断片が注入されない。** 段階 V の条件 B（条項を載せない状態）を作る手段になる。

認識外の文字列は `undefined` になって既定へ落ちるので、無効化にならない。

### `bool` は強制 ON しかできない

`CLAUDE_CODE_BISON_CAIRN`（Delivering work）、`CLAUDE_CODE_LARCH_CISTERN`（Corrections）、
`CLAUDE_CODE_WILLOW_TERN`、`CLAUDE_CODE_GAULT_KESTREL`、`CLAUDE_CODE_AMBER_ASTROLABE` はこちら。

```js
bool:()=>u()
u=m(()=>E.preprocess(r,E.string().optional().transform((n)=>Oe(n))))
function l(e,o,r){return e||$Wt(r)||$l()?.[o]===!0||L(o,!1)}
```

`Oe` しか通らないので `undefined` にならず、`0` は `false` になる。
`l()` は or の連鎖なので、第 1 項が偽でも後続の 3 条件へ落ちる。
**この系統の環境変数は強制 ON にはできるが、強制 OFF にはできない。**

`$Wt(e)` はモデルが capability `opus_5_prompt_bundle` を持つかを見る。
持つのは `claude-opus-5` のみ。つまり Opus 5 のセッションでは、GrowthBook の既定が
`false` でもこれらの断片が入る。

一括の無効化は GrowthBook の `tengu_fennel_godwit`（既定 `false`）を true にすることだけで、
対応する環境変数は無い。

### `heron_brook` には環境変数が無い

システムプロンプトの次の 2 行は `Sc("heron_brook", ...)` で入る。全文。

```text
Do not call the AgentTool unless the user requested it
Do not use workflows or deep-research unless the user requested it
```

優先順位は clientData の `tengu_heron_brook` 文字列 → GrowthBook の同名 flag（既定 `""`）→
`$Wt(model)` が真なら組み込みの上記 2 行。**環境変数は 958 件の登録名を走査して 0 件。**
`opus_5_prompt_bundle` を持つモデルでは無条件に入る。

これは user global rule `subagent-delegation.md` が真っ向から打ち消している指示になる。
rule 側は「subagent の起動は依頼を待たずに行ってよい」を恒常的な許可として与えている。

## 組み立ての構造と総量（2026-09-01 実測）

システムプロンプトは `DH()` が組み立てる。静的なブロック群と、
`Sc(名前, () => 生成関数)` の配列で表される動的セクションに分かれ、名前が feature flag のキーになる。
実測できた動的セクション名は 25 個。

`communication` / `pronouns` / `action_caution` / `task_continuity` / `fable_identity` /
`tool_param_json` / `session_guidance` / `memory` / `env_info_simple` / `language` /
`output_style` / `bg-session` / `scratchpad` / `context_management` / `brief` / `focus_mode` /
`act_dont_rederive` / `delivering_work_max` / `overcorrection` / `subagent_steer_delegation` /
`heron_brook` / `brook_heron` / `willow_tern` / `autonomy_append` / `endconv_deferred_hint`

`td(model)` が真（lean モデル）のときは長い静的ブロック群が 520 文字の圧縮版に置き換わり、
代わりに `action_caution`（647 文字）が有効になる。標準モデルではこの逆。

### 総量

標準的な対話セッション（Opus 5、既定の output style、TTY、focus / brief / bg いずれも無効）で
**約 19,800 文字、約 5,000 トークン相当**。

足したのは主セッションを構成する 20 断片の合計。足していないもの。

- ツール定義（`description` と `input_schema`）。別枠で送られ、量は本文より 1 桁大きい
- CLAUDE.md・`rules/`・memory の中身。system-reminder 付きの user メッセージとして入るので、
  システムプロンプトの定数ではない
- 条件付きブロック群。全部が同時に有効になることはなく、上限まで積んでも + 7,300 文字程度

トークン換算は英文 4 文字 = 1 トークンの概算で、実測ではない。
`brook_heron` は GrowthBook から配信される文字列で、バイナリに本文が無いため長さも内容も不明。

### 主な断片の量

| 断片 | 文字数 |
| --- | ---: |
| `# Executing actions with care` | 3,580 |
| `# Doing tasks` | 3,050 |
| `# Communicating with the user` | 2,578 |
| `# Delivering work` | 2,015 |
| `# Writing for the user` | 1,791 |
| `# Text output` | 1,335 |
| `# Corrections` | 1,244 |
| `# System` | 1,057 |
| `# Reporting outcomes` | 906 |
| `# Tone and style` | 532 |
| `IMPORTANT: Assist with authorized security testing...` | 459 |
| `pronouns` | 357 |
| `# Context management` | 280 |
| `act_dont_rederive` | 278 |

## subagent への委譲は 2 系統あり、環境変数で切り替わる

`Sc("subagent_steer_delegation", () => U.has(_t) && eI()==="counter_steer" ? knr : null)`

`eI()` が返す値は `default` / `no_nudges` / `counter_steer` の 3 つ。
決めるのは `Ix(e)` の中の `ki(a.CLAUDE_CODE_THISTLE_GREBE)` で、この 3 値だけを受け付ける。

`counter_steer` のとき、`knr`（1,430 文字）が入る。全文の書き出し。

> ## Delegating to subagents
>
> Subagents multiply cost and time: each one re-establishes context, re-explores, and reports back,
> and you then re-read its report. Delegate only when the payoff clearly exceeds that overhead.

`default` のときは `subagent_steer_delegation` の節には何も入らないが、
別の位置に穏やかな版（約 440 文字）が入る。実文の書き出し。

> Use the ${_t} tool with specialized agents when the task at hand matches the agent's description.
> Subagents are valuable for parallelizing independent queries or for protecting the main context
> window from excessive results, but they should not be used excessively when not needed.

前後の文字列（並列ツール呼び出しの指示、作業の計画と追跡の指示）から、
これはツールの description ではなくシステムプロンプト側に入る。

`counter_steer` の版は user global rule `subagent-delegation.md` と正面から衝突する。
rule 側は「subagent の起動は依頼を待たずに行ってよい」を恒常的な許可として与えている。
既定は `default` なので、いまのセッションでは入っていない。

## 規範の遵守・態度・行動に効く断片（逐語）

### `# Delivering work`（2,015 文字）

> Do ordinary work as asked, acting on the actual request rather than on speculation about what lies behind it. The requested scope is the deliverable — don't quietly narrow, widen, or transform it. Interpret ambiguity the way a careful colleague would: make routine judgment calls yourself, and check in only when different readings would lead to materially different work.
>
> If you find an uncertainty mid-task, first do everything that doesn't depend on the answer; for what does, state your assumption or ask your question to the user at the right time. Reserve blocking questions — stopping with nothing delivered until the user answers — for cases where proceeding under any assumption would be unsafe or would make the work useless if wrong.
>
> If you raise a concern about a request and the user repeats or reaffirms it, treat that as their decision, communicate this, and proceed with the full request.

### `# Corrections`（1,244 文字）

> Avoid unnecessary or excessive self-correction. Only correct an earlier statement in your user-facing text when the error would change the user's code, conclusions, or decisions. State corrections plainly and concisely, and continue the task; combine multiple corrections rather than enumerating them all.
>
> A follow-up question about your earlier work is not, by itself, a signal that you got something wrong — answer what was asked. A statement that was accurate needs no correction: don't re-audit how you phrased it, how you verified it, or limits you already stated.

### `act_dont_rederive`（278 文字。末尾に句点が無いのは定数の原文どおり）

> When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue. If you are weighing a choice, give a recommendation, not an exhaustive survey

### `# Reporting outcomes`（906 文字）

> Report what actually happened, not what you intended. When you say something is done, sent, saved, fixed, or verified, that claim must rest on a result you observed in this session — tool output, the file as it now reads, the page as it now loads — not on what the step should have produced. If you did not check, say you did not check.

### `# Doing tasks` のうち態度に効く 2 項目

> - For exploratory questions ("what could we do about X?", "how should we approach this?", "what do you think?"), respond in 2-3 sentences with a recommendation and the main tradeoff. Present it as something the user can redirect, not a decided plan. Don't implement until the user agrees.
> - Don't add features, refactor, or introduce abstractions beyond what the task requires.

flag `tengu_verified_vs_assumed`（既定 `false`）が真のときだけ、次の 1 項目が加わる。

> - When reporting results, be accurate about what you verified vs. what you assumed. Distinguish between what you confirmed (ran a command, read a file) and what you believe but did not check. Do not assert assumptions as facts.

## まだ見ていないもの

- `brook_heron` セクションの本文。GrowthBook から配信される文字列で、バイナリに実体が無い
- `IMPORTANT: Assist with authorized security testing...`（459 文字）の注入経路。
  定数の定義は見つかるが、同じモジュール内に参照が無い。
  実セッションのシステムプロンプトには出ているので、別経路で入っている
- `memory` セクションの正確な文字数。生成関数の分岐が多い
- 総量 19,800 文字は「標準的な対話セッション」という置いた設定の下での合計で、
  実セッションでどの条件付きブロックが有効かは GrowthBook の配信に依存する

## バイアスの向きは 4 つで、3 対 1 に偏っている

行動・態度・自己修正に関わる断片を向きで分けると、3 つが「引き直さない・確認しない・委譲しない」を
指し、1 つだけが逆を向く。引き戻す側の強化版は既定で無効になっている。

| 向き | 断片 | いま入るか |
| --- | --- | --- |
| 引き直さない | `act_dont_rederive` | 入る |
| 確認しない | `# Delivering work` | 入る |
| 確認しない | `task_continuity` | 常に無効（ゲートが `return!1`） |
| 訂正しない | `# Corrections` | 入る |
| 委譲しない | `heron_brook` | 入る |
| 委譲しない | `subagent_steer_delegation` | 穏やかな版が入る |
| 正確に報告する | `# Reporting outcomes` | 入る |
| 正確に報告する | `tengu_verified_vs_assumed` の 1 項目 | 既定で無効 |

この分類はバイナリから読めるものではなく、断片の内容からの解釈になる。

段階 V が測る対象としてこの表が使える。同じ課題文を「引き直さない側を外した状態」と
「そのままの状態」で走らせられるのは `act_dont_rederive` だけで、
`# Delivering work` と `# Corrections` は強制 OFF ができない。
3 つを分離して測ることはできず、測れるのは `act_dont_rederive` の寄与に限られる。

## 規範との衝突（実測から整理）

user global rule と、システムプロンプトの断片が同時に満たせない組。

| 手元の rule の条項 | 衝突するシステムプロンプトの断片 | いま入っているか |
| --- | --- | --- |
| `subagent-delegation.md`「subagent の起動は依頼を待たずに行ってよい」 | `heron_brook`「Do not call the AgentTool unless the user requested it」 | 入っている（環境変数なし） |
| 同上 | `subagent_steer_delegation` の `counter_steer` 版 | 入っていない（既定は `default`） |
| `primary-sources-first.md`「そのつど原文を開き直す」 | `act_dont_rederive`「Do not re-derive facts already established」 | 入っている（`CLAUDE_CODE_ACT_DONT_REDERIVE=0` で外せる） |
| `propose-before-implement.md`「案を提示して承認を得てから実装する」 | `# Delivering work`「check in only when different readings would lead to materially different work」 | 入っている（強制 OFF 不可） |
| `japanese-text-writing.md`「失敗・未完了を成功と紛れる書き方にしない」 | `# Corrections`「Avoid unnecessary or excessive self-correction」 | 入っている（強制 OFF 不可） |

`heron_brook` の 1 行目は `subagent-delegation.md` の存在理由そのものになっている。
rule の why には「許可が無いと skill が手順として定めた起動も省かれる」と書かれており、
その「許可が無い」状態を作っているのがこの断片になる。
