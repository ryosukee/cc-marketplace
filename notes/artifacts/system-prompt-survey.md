# システムプロンプトの実測

2026-09-01 に着手した調査の足場。全体像はまだ取れていない。
起点は「規範を引かない問題」の調査で、明細は [規範を引かない問題の調査](./norm-adherence-survey.md)。

次セッションが続きをやるための足場。**バイナリから grep できる。**

対象は `/Users/ryosuke/.local/share/claude/versions/2.1.252`（Mach-O 64-bit x86_64）。
`/usr/bin/strings -n 40` で 104,253 行が取れる。`grep` の振り替えを避けて `/usr/bin/grep` を使う。

### 分かったこと

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

### コンテキスト内の配置

system role のシステムプロンプトが位置 0 にあり、user global rule と CLAUDE.md は
**その後**、最初の user ターンの中に system-reminder として入る。
つまり規範は会話の側にあり、ターンが進むほど末尾から遠ざかる。
システムプロンプトは system role なので位置が動かない。

### 規範の遵守に競合しうる指示（逐語）

> When you have enough information to act, act. Do not re-derive facts already established in the conversation, re-litigate a decision the user has already made, or narrate options you will not pursue.

> Avoid unnecessary or excessive self-correction. Only correct an earlier statement in your user-facing text when the error would change the user's code, conclusions, or decisions.

> If you find an uncertainty mid-task, first do everything that doesn't depend on the answer

システムプロンプトには、user rule を参照せよという指示が**無い**。参照を促すのは user rule 自身。
ただし入口 rule は常時ロードなので、きっかけ自体は毎ターン載っている。

### まだ見ていないもの

- システムプロンプト全体の量。断片 5 つしか位置を特定していない
- ほかに feature flag でゲートされた断片があるか。76200〜76300 行の flag は
  streaming と output token の制御が大半で、プロンプトのゲートは未探索
- `tengu_heron_brook_applied` の位置と役割。既知バグ一覧の
  `agent-tool-gated-by-system-prompt` が参考値として `heron_brook 9` を追っている

