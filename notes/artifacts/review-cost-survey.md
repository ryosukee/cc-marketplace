# レビュー工程のコストとターン数の調査

norm-refit-v2 群 A3「review 工程のコスト対効果の見直し」の入力。
`todo.md` の「review でトークン使い過ぎ、何ターンもかかりすぎ問題がある / 何回やっても指摘が 0 にならない」を起点に、
2026-08-31 に調査した。対象は cc-marketplace の reviewer agent 4 本と機械検査、
efso-document `to-be/idp/` の op-review 運用、および両者の実測記録。

判断は含まない。事実と実測値だけを置く。

## 1. 実測値

### 1-1 page-reviewer（cc-marketplace、2026-08-25）

`notes/norm-refit-plan.md:588-592` が記録している 6 ページ 9 回の実測。

| ページ | 1 巡目 | 2 巡目 | 推奨を変えた指摘 |
| --- | --- | --- | --- |
| ccm-f044 | 152k | — | 0 |
| ccm-f045 | 163k | — | 0 |
| ccm-f046 | 127k | 60k | 1 |
| ccm-f047 | 117k | 48k | 3 |
| ccm-f049 | 93k | — | 0 |
| ccm-f050 | 92k | 121k | 0 |

合計 973k トークン、推奨を変えた指摘は 4 件。いずれも subagent の usage 表示の観測値。

### 1-2 handover-reviewer の最適化前（2026-08-18〜19）

`plugins/session/skills/handover/SKILL.md:113-124` と commit `10905bc` に記録。

- 5 ラウンド・指摘 6 件に subagent トークン 284.1k・ツール 107 回・1,738 秒を使って収束せず、R5 で打ち切り
- R2 で一度 approve を取ったあと、追記のたびに新しい指摘が出続けた
- 指摘 0 件だった R2 が、指摘を出した R1 より多くのトークンを使っている（54.7k 対 47.7k）
- ラウンドごとのコストは減らず、R5 が最大（74.3k）
- 指摘 6 件のうち次セッションの行動が変わるものは 2 件
- agent が「問題なし」として確認した項目はすべて機械判定できる形をしていた

### 1-3 page-reviewer の最適化前（2026-08-18、idea-hub の ih-f007）

`plugins/claude-user-communication/skills/html-communication/SKILL.md:524-543` と commit `05a3972` に記録。

- 4 facet 2 ラウンド 8 本で指摘 133 件・828k トークン・1 ラウンド約 14 分
- 内訳は設計妥当性 25 件 / 165k、内容整合 23 件 / 264k、情報デザイン 27 件 / 280k、clarity 58 件 / 118k
- 推奨や選択肢集合を変えた指摘は、設計妥当性と内容整合からしか出ていない
- 情報デザインと clarity は全体の 48% のトークンを使い、判断を変えた指摘が 0 件
- 統合後を同規模のページ（ccm-f026）で 1 本回して 84.8k トークン

### 1-4 台帳（notes）のレビュー 10 回（efso-document、2026-08-30）

`omnisinc/efso-document` の `to-be/idp/.handover/archive/f018-rebuild-and-notes-ledger.md` に記録。
対象は `to-be/idp/notes/adr0002-auth-method.md`。

L106-108:

> - 台帳を 10 回レビューして指摘を直した。
>   自分の作業ミスが 5 件あった（SVG が描画されない、抽出でメリット/デメリットが混入、
>   確定 9 の時系列を逆に書いた、リンク文字列 4 件を記憶で書いた、確定 12 の修飾語の残り）

L166-167:

> - 台帳のレビューを 10 回で打ち切った。残っていた指摘（確定 13 の図の帰属、rule の 3 件）は
>   次のセッションの行動を変えないと判断した。再提案しない

L162（codify 候補の 5 件目）:

> (5) レビューの打ち切り条件（台帳のレビューを 10 回回して 68 件直したが、後半は次セッションの行動を変えない指摘が増え、ユーザーに止められた。判定基準を持っていなかった）

10 ラウンドで 68 件を修正。うち 5 件は自分の作業ミス起因。打ち切り時の未対応が 4 件。
トークン量と所要時間の記録は無い。レビューに使った手段（op-review か汎用 agent か）も記録が無い。

### 1-5 ラウンドごとの指摘件数（efso-document、op-review）

`to-be/idp/.handover/archive/efs-1180-merged-and-stub-planning.md` L41。
本調査で見つかった唯一の per-round データ。

> - op-review agent + japanese-text-writing 規範でゼロベースレビューを 4 ラウンド。1 ラウンド目 7 件、2 ラウンド目 32 件、3 ラウンド目 22 件、4 ラウンド目 19 件を反映。

同ファイル L46 でさらに 2 周追加している。
別セッション（`efs-1044-completion-and-efs-1180-comments.md` L66）では
3 facet レビューを 10 ラウンド回して全 approve。

### 1-6 レビュー往復が増えた機序（efso-document）

`efs-1044-completion-and-efs-1180-comments.md` L125-126。

- L125: 内容整合 facet の指摘 S14 を「反映した」と報告したが、実際にはファイルが未編集で、次のラウンドでレビュアーに再検出された
- L126: レビュー agent・調査 agent がプレーンテキストで結果を返し main に届かない事象が 3 回発生し、そのつど催促のラウンドトリップが生じた

## 2. ページの内訳（実測、2026-08-31）

A3 が実測した 5 ページの文字数の内訳。`<style>` と `<script>` は雛形由来でどのページでも同一。

| ページ | 全体 | style | script | 本文テキスト | 本文率 | A3 実測 |
| --- | --- | --- | --- | --- | --- | --- |
| ccm-f045 | 54,618 | 17,287 | 7,804 | 14,680 | 27% | 163k |
| ccm-f046 | 47,768 | 17,287 | 7,797 | 11,757 | 25% | 127k |
| ccm-f047 | 48,768 | 17,287 | 7,803 | 12,055 | 25% | 117k |
| ccm-f049 | 40,158 | 17,287 | 7,674 | 6,013 | 15% | 93k |
| ccm-f050 | 41,323 | 17,287 | 7,725 | 7,214 | 17% | 92k |

本文テキストはタグを除去した後の文字数。`ccm-f044` は掃除で削除済みのため測れない。

`page-reviewer.md:96-107` の「扱わないこと」は、CSS が決めるもの（フォントの段、色のコントラスト、
Readability に削られる class、参照マーカーの器、表のセル長）を機械検査の担当として除外している。
除外された対象を構成する 25,000 字前後を、agent は毎回読み込んでいる。

`<script>` の中身は挙動と設問の短いラベル（`{ id: 'q1', label: '規範の置き場' }`）だけで、
設問の実文と選択肢は HTML 側にある（`ccm-f045.html` で確認）。

## 3. 終了条件の現状

| 機構 | 終了条件 | 出典 |
| --- | --- | --- |
| validate-page.sh | `total` が 0 になるまで反復 | html-communication SKILL.md:489 |
| check-handover.mjs | `total` が 0 になるまで反復 | handover SKILL.md:82 |
| page-reviewer | 指摘 0 件まで繰り返さない。推奨または選択肢集合を変える指摘が出たときだけもう 1 度だけ | html-communication SKILL.md:518-522 |
| handover-reviewer | 指摘 0 件まで繰り返さない。次セッションの行動が変わる指摘が出たときだけもう 1 度だけ | handover SKILL.md:107-111 |
| spec-reviewer（impl-spec 3 skill） | 指摘がゼロになるか、最大 5 回に達したら終了 | requirements SKILL.md:191 / design SKILL.md:214 / test-plan SKILL.md:291 |
| known-issues-reviewer | 1 回。再実行の指示なし | review SKILL.md:30-40 |
| PR 前のセルフレビュー | 記述なし | norm-refit-ops.md:42-43 |
| op-review（efso-document） | 指摘 0 件まで / 0 findings まで。SKILL.md には打ち切り条件の記述なし | efs-1056-followup L9、efs-1180-merged L16、e1-remaining L15 |

`norm-refit-ops.md:42-43` の「review agent」は agent 名の指定が無く、
「規範の欠落と実文の改変」を観点とする agent 定義は cc-marketplace に存在しない
（`plugins/*/agents/` の 7 本にも `.claude/agents/` にも無い。`.claude/agents/` 自体が無い）。

## 4. reviewer agent の構成

| agent | model | tools | 観点数 | 巡回上限 | 常に読む固定ファイル | 範囲無制限の探索 |
| --- | --- | --- | --- | --- | --- | --- |
| page-reviewer | sonnet | Read, Glob, Grep, Bash, WebFetch | 5 | 2 ラウンド × 1 本 | review-norms.md（60 行） | 手順 (a)(b) の出典突合（件数上限なし） |
| handover-reviewer | sonnet | Read, Glob, Grep, Bash | 4 | 2 ラウンド × 1 本 | なし | 手順 (d) の外部ファイル検算（`git show` 含む、上限なし） |
| spec-reviewer | 指定なし（親を継承） | Read, Grep, Glob | 13（doc_type ごと） | 5 回・指摘 0 件まで | なし | `.claude/rules/` 全体 + `CLAUDE.md` + `docs/` `plans/` `specs/` の自律探索（上限なし）+ 上流文書 Read + 既存テスト確認 |
| known-issues-reviewer | 指定なし（親を継承） | Read, Grep, Glob, Bash, WebFetch, Write | 手順 4 ステップ | 1 回（background） | LEDGER 1 本 | なし |

agent 本文の行数は 2026-08-18 の最適化時点からほぼ変わっていない
（page-reviewer 118 → 121 行、handover-reviewer 91 → 112 行）。

一方で agent が突合先として読む規範は増えている。

| 対象 | 2026-08-18（commit `05a3972`） | 2026-08-31 |
| --- | --- | --- |
| `rules/` のファイル数 | 11 | 23 |
| `rules/` の合計行数 | 455 | 1,515 |

## 5. レビューが捕まえたものの分布

### 5-1 文レベル指摘の事例集（39 件）

`notes/artifacts/sentence-level-review-cases.md` の出所別集計（2026-09-01 に全件を数えた）。5-10 を足した後の値。

| 出所 | 件数 |
| --- | --- |
| 人間のレビュー | 32 |
| Claude の横展開スイープ | 6 |
| Claude のスイープ（セルフレビューの review agent が指摘） | 1 |
| 合計 | 39 |

`.claude/rules/norm-refit-ops.md:46-50` は、PR 前のセルフレビュー（review agent）の指摘も
事例集へ追記するよう定めている。review agent 由来として記録されているのは 11-1 の 1 件だけで、
その 1 件も結論は現状維持（修正していない）。

### 5-2 レビューを通過した型

台帳 `notes/norm-refit.md:2273-2275`:

> 検出の所在: どちらも op-review の 4 facet を 2 巡（延べ 108 件の指摘）通過している。レビューでは捕まらず、ユーザーの差し戻しで初めて出た。条項化するなら、レビューの観点ではなく執筆時の規範として置く必要がある

同 2289-2290:

> 型 3・型 4 の検出の所在: 型 1・型 2 と同じく、生成時のレビュー（page-reviewer + 機械検査 13 種）を通過し、ユーザーの差し戻しで初めて出た

### 5-3 LLM レビューの限界（台帳の作業メモ 2477-2484）

> **LLM レビューの限界**: LLM judge の可読性評価は人間と相関しない（意味保存 r=0.77 に対し読みやすさ r=0.28、DETECT）。大きいモデルほど人間の読み時間から乖離する（TACL 2023、英語で厳密に単調）。人間の読解困難のうち「語を文脈へ統合するコスト」は言語モデルが構造的に予測できない（PNAS 2026、eye-tracking 368 名）。「並列に読めるから」という機序は直接検証され不完全（同時解析数を減らしても困難は再現せず）。対処の方向は、判定を尋ねず抽出を課す / 対象文だけ独立に見せる / 独立サンプルの解釈の分岐を見る / A/B 比較（参照付き評価で見逃しが 57%→26%）

## 6. 機械検査の現状

### 6-1 検査項目数の記載のずれ

`check-page.mjs` が実際に出す `check:` の値は 16 種。記載は 3 箇所とも違う。

| 場所 | 記載 |
| --- | --- |
| `check-page.mjs` のヘッダコメント | 12 種 |
| `validate-page.sh:6` | 12 種 |
| `CLAUDE.md` の plugin 一覧 | 15 種 |
| 実際 | 16 種 |

後から足した 3 種（`bulk-approval` / `question-heading` / `vessel-column`）は
`page-reviewer.md:100-104` の除外リストにも反映されていない。

### 6-2 impl-spec に機械検査が無い

spec-reviewer の共通観点 1（「TBD」「要検討」等の未確定項目）と 2（「適切に」「必要に応じて」等の曖昧表現）、
test-plan 固有 5（テスト ID の整合）は、他 2 系統では機械検査へ移された種類の判定と同型
（`deferred-wording` の語リスト方式、`question-count` の ID 突合方式）。
impl-spec ではこれを agent が担っている。

## 7. op-review の所在

台帳 `notes/norm-refit.md:177-182`（2026-08-13 の確定）が参照元を 2 箇所と定めている。

> KAO 側（`.claude/skills/op-review/`）と efso-document の `to-be/idp/` 配下（`agents/op-review.md` + `skills/op-review/`）の両方を読み、diff して新しい方を基準にする

efso-document 側の実測（2026-08-31）。

| パス | 行数 |
| --- | --- |
| `to-be/idp/.claude/agents/op-review.md` | 32 |
| `to-be/idp/.claude/skills/op-review/SKILL.md` | 162 |
| `to-be/idp/.claude/skills/op-review/references/facets.md` | 266 |

facets.md が定義する facet は 9 種（style / structure / cross-reference / evidence /
external-spec / vendor-practice / security-practice / verification-alignment / biz-constraints）。
notes / 台帳向けの facet は無い。SKILL.md に打ち切り条件・ラウンド上限の記述は無い。

cc-marketplace 側では `op-review` の語が
`html-communication/SKILL.md:482,551,554,555` と `check-page.mjs:19` に出るが、定義の実体は repo に無い。

KAO 側の所在と内容は本調査では未確認。

### 7-1 op-review の plugin 化の構想（efso-document）

`to-be/idp/TODO.md` L65-77。gitignore 対象のため repo だけを見る次セッションからは読めない。全文。

```markdown
# op-review skill, agent の plugin 化

- 起動経路が 2 つあるので両方を書く
    - 単発起動 (Agent ツール / Skill): schema オプションが無いため、出力の担保は agent 定義の出力契約で行う。契約は `.claude/agents/op-review.md` に記載済み
    - Workflow 経由: `agent()` に `agentType: 'op-review'` と `schema` を併用すると、op-review の定義を保ったまま構造化出力を強制できる (agentType と schema は compose する)。複数成果物を pipeline で回すときはこちら
- Workflow 化するなら、レビュー単体ではなくレビューサイクル全体を組み込む
    - いま手で回している「ゼロベースレビュー → 指摘の反映 → 反映チェック → 再レビュー」を 0 件になるまで繰り返す形は、loop-until-dry の pipeline にそのまま乗る
    - 役割ごとに agent を分ける。レビューは op-review (read-only)、反映は編集権を持つ agent、反映チェックは read-only の別 agent。反映と検証を同じ agent にやらせない
    - 再レビューはゼロベースで回す。「これを直した」と申告して再レビューさせると、レビュアーが申告を信じる分だけ甘くなる (2026-07 のセッションで実際に反映漏れを見逃した)
    - schema で判定を機械可読にすれば、ループの終了条件 (request changes が 0 件) をスクリプト側で判定できる
    - 判断が要る指摘は自動反映せず人に返す。指摘に `機械的 / 判断要` の別を持たせてあるのはこのため
```

### 7-2 台帳のレビュー観点（3 つ）

efso-document 側の原本 `to-be/idp/hoge.md` は untracked のまま失われており、
現存する唯一の写しは cc-marketplace の `todo.md` L30-42。

> 観点は 3 つ。
>
> - 台帳とコミット済みドキュメントだけで再構成できるか。次セッションは会話も HTML ページも
>   scratchpad も持たない。gitignore 対象のファイルも repo 外として扱う
> - 話の流れ / 解決したいこと / そのための過不足のない調査結果 / ここまでの判断 の 4 点を個別に判定する。
>   「過不足のない」は足りない側と混ざっている側の両方を見る
> - リンクはパスが解決するかだけでなく、指した先に主張どおりの内容があり、その内容が主張を
>   支えているかまで見る
>
> 適用条件は常時ではなく、複数セッションにまたがる長く重いタスクに限る。置き場（decision-record.md への
> 追記か、レビュー用の skill / agent を新設するか）は未決で、cc-marketplace 側で提案してもらう。

## 8. 計画上の位置づけ

レビューに関わる作業は計画に 3 つある。

- 段階 3 の PR 5「review agent の責務統一」（`notes/norm-refit-plan.md:412-425`）。
  段階 2 Q5 の決定（handover-reviewer と page-reviewer から「どう直すか」を落とす）と、
  ccm-f051 Q5（spec-reviewer と impl-spec 3 skill の終了条件を揃える）
- 段階 4 T4「レビュー機構のゼロベース再設計」（同 525-536）。
  op-review の 2 箇所を diff して新しい方を基準にし、専用 reviewer の廃止可否も検討する
- v2 群 A3「review 工程のコスト対効果の見直し」（同 588-592）。機械検査へ寄せる分と終了条件の絞り方

現在地は段階 3 で、残りは PR 5 と PR 7。A3 は v2 なので最後に位置している。
</content>
</invoke>
