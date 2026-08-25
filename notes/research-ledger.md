# 調査台帳: 出力品質のハーネス (2026-07-29 実施)

| 項目 | 内容 |
| --- | --- |
| 目的 | 2026-07-29 の 9 本の並行調査の結論と出典を、再調査せずに参照する |
| 生存期間 | norm-refit の段階 5 の完了処理で、監査成果物と一緒に処遇を決めて実行するまで |
| 対象タスク | norm-refit |

読むだけの参照台帳。
4 本の並行セッションが共通の前提として参照する。

## この台帳の位置づけ

2026-07-29 に 9 本の並行調査を行った結果の結論と出典。
**再調査しない。** ここに無いことだけを新たに調べる。

調査の起点はユーザーの指摘（原文）:

> 認知負荷の重いテキストを大量に投下してくるくせに、ちゃんと読んでみると暗黙の前提や
> 暗黙の用語も多く、冗長な表現がある一方で欲しい情報が欠けていたりする。人に寄り添って
> 相手が何かを判断するための情報粒度・テキスト構造の設計・情報の取捨選択が全てにおいて劣っている。

## 1. 最重要: 規範を書き足す方向は使えない

4 本の調査が独立に同じ結論へ着いた。

| 出どころ | 測定されたこと |
| --- | --- |
| Anthropic 公式 | CLAUDE.md が長いと Claude は無視する。「rule があるのに守られないなら、そのファイルはたぶん長すぎて rule が埋もれている」 |
| IFScale (20 モデル・7 プロバイダ) | 後方の指示ほどエラー率が一貫して高い。指示密度 150〜200 で効果最大 |
| Google 静的解析 | 助言的警告を廃止。「エラーにしてビルドを壊すか、コンパイラ出力に出さないかのどちらか」 |
| zeroheight 2026 (実務者 147 名) | デザインシステム非採用の理由 1 位は mandate 不在 73%。ドキュメント不備は 27% で最下位 |
| 臨床アラート (AMIA 2024) | 1 日 5 件超で override 率 98.6%。1 件未満なら 92.6% |

**規範を 1 つ足すと、既存規範の遵守率が下がる方向に働く。**

公式の数値規範: CLAUDE.md は 200 行未満、SKILL.md は 500 行未満・5,000 トークン未満、
参照は SKILL.md から 1 階層だけ（孫参照は `head -100` で部分読みされ情報が欠ける）。

出典: <https://arxiv.org/abs/2507.11538> / <https://arxiv.org/abs/2502.17204> /
<https://code.claude.com/docs/en/memory> / <https://code.claude.com/docs/en/best-practices> /
<https://abseil.io/resources/swe-book/html/ch20.html> / <https://report.zeroheight.com/>

## 2. 効くのは配置と強制

Anthropic 公式の規範: 「CLAUDE.md や skill の指示は request であって guarantee ではない。
`PreToolUse` hook でブロックするのが enforcement」。

- 判定役を作業した context の外に出す: 仕様不足の SWE-bench で単一 agent の自己監視 61.20%、
  専任 agent を分離した 2 agent 構成 69.40%（完全仕様ベースライン 70.80%）
- rule を実行証拠から書き換え・強制した研究で baseline 0.51 → 0.80。
  process 系 rule は 35% → 87% と、coding style 系（59% → 75%）より enforcement の効き幅が大きい
- 不正確な自己申告が misalignment の 22.58% を占め、時系列で増加中（20,574 セッション / 1,639 repo）

**「hook 注入は rule より守られる」に定量的裏付けは無い。** 公式にもコミュニティにも
A/B も遵守率測定も存在しない。構造上言えるのは「位置が直近になる」「N ターン後に N 個並ぶ」の 2 点だけ。

出典: arXiv:2603.26233 / arXiv:2604.15625（いずれも未査読）/
<https://code.claude.com/docs/en/hooks-guide>

## 3. 既定 system prompt に規範は既にある

Claude Code v2.1.220 のバイナリから抽出した `# Communicating with the user`
（内部名 `anti_verbosity`）が、結論先行・見出しと表の抑制・cold reader 前提を指示している。

> Being readable and being concise are different things, and readable matters more.
> If the user has to reread your summary or ask you to explain, any time saved by brevity is gone.
> The way to keep output short is to be **selective about what you include**
> (drop details that don't change what the reader would do next),
> not to compress the writing into fragments, abbreviations, arrow chains like `A → B → fails`, or jargon.

> Write it for a teammate who stepped away and is catching up, not for a log file:
> they don't know the codenames or shorthand you created along the way,
> and they didn't watch your process unfold.

**問題は指示が無いことではなく、(a) ユーザー側の規範が毎ターン効く層に無いこと、
(b) 違反を検知する経路が無いこと。**

## 4. 「短くしろ」は逆効果

- Anthropic 自身の実測: 簡潔さ指示単体でユーザー向け出力の長さは約 20% 減で頭打ち
- Giskard/Phare (arXiv:2505.11365): 簡潔さを求める system prompt で誤情報耐性が最大 20% 低下。
  17 モデル中 11 で統計的に有意 (χ², BH-FDR < 0.05)。
  仮説は「簡潔さを強調すると、誤った前提を退けるのに必要な根拠の提示が抑圧される」
- Verbosity ≠ Veracity (arXiv:2411.07858): モデルは不確かなときに冗長化する。
  GPT-4 の verbosity compensation 発生率 50.40%

**軸を長さから取捨選択へ移す。判定基準は「読者が次に取る行動を変えるか」。**

## 5. 冗長・欠落・暗黙前提は同じ原因から出る

Flower の writer-based prose 論。調査した順・生成した順に並べた文書（survey 構造）から、
3 症状が同時に生じる。LLM の出力形態と同型。

Atlas 1979（実験）が決定的。同一の背景情報を与えられた書き手が読者の懸念に返信を書く実験で、
**書き手が読者の必要を理解し、それについての質問に答え、読者を考慮するよう促されてもなお、
その知識を実際の執筆に使わなかった**。原因は survey strategy への固執で、
与えられた資料に書かれていることを並べ、そこに無い情報を足せなかった。

Flower の処方は 2 手順。

1. 読者と共有する目標を 1 文で書き、階層の最上位に置く
2. 各段落に「1 文で言うなら何か」を問い、答えをトピックセンテンスに昇格させる

目標を先に確定させると、**目標の達成に必要だが手元の資料に無い情報が構造上の穴として可視化される。**

出典: <https://wacclearinghouse.org/docs/jbw/v3n3/flower.pdf>

## 6. 反証されている対策

| 対策 | 反証 |
| --- | --- |
| 「読者を意識せよ」という指示 | Atlas 1979 が明確に反証（上記 5） |
| 読みやすさ指標 (Flesch 等) | 談話構造・見出し・既有知識を測らない。技術文書では専門用語で機械的にスコアが悪化 |
| 外部基準なしの LLM 自己批判 | DeepMind (arXiv:2310.01798): 推論タスクで改善せず、しばしば悪化 |
| 「本当に？」型の再検討要求 | FlipFlop (arXiv:2311.08596): sycophancy で性能低下 |
| 説明を厚くして信頼を適正化 | CHI 2021 / CHI 2025: 正答・誤答の両方への依存を増やす |
| citation を付ける | 事前登録の大規模実験: 誤っていても hallucinate されていても信頼を上げる |
| 汎用の完成度チェックリスト | WHO 手術安全チェックリストの効果は後続 25 研究で一貫せず |
| 承認プロンプトを増やす | 承認率 93%、5 時間の実タスクで 94% が妨害コードを見逃す |
| 確信度の数値スコア | 効いたのは一人称 hedge・矛盾の可視化・dual explanation の 3 つで、数値は含まれない |
| 文字数・行数の上限 | 追従が閾値を超えると急激に崩れ、小型モデルでは効果が反転 |
| semantic HTML の拡充 | 要素名はレンダリングを変えない。`footer` と `aside` は Reader View が本文から削除する |
| Horvitz 12 原則の agent 時代版 | 存在しない。Microsoft チームが 2024 年に「revisit が適切」と課題を並べたところで止まっている |

## 7. 効くと実証されている対策

効果の大きい順。

1. **目的と読者を 1 文で確定してから書く**（上記 5）。実証: Bracewell 1978、Atlas 1979。
   読者の特定は粒度が粗いと効かない。「〜向け」では不足で「読者はこれを読んで X を判断する」まで下ろす
2. **生成と整形の分離**。自由に推論させてから構造化する。
   構造化出力が推論を劣化させる原因は premature serialization で、
   制約なしの推論を先に置けば性能はほぼ回復する（3 回平均 80–87%）
3. **目的に寄与しない情報を削る**。coherence principle のメタ分析 39 効果で
   retention に小〜中・transfer に中。Carroll の minimal manual は学習時間 40% 減・成績 50% 増
4. **検証質問を独立コンテキストで処理する**。CoVe (arXiv:2309.11495) の fully factored 構成
   （各検証質問を初回回答にも他の質問にも触れさせない）。効いている機構は自己批判ではなく独立の再照会
5. **相互参照の統合**（split-attention）。「後述」「上記」を減らし、前提と定義を使用箇所に置く
6. **用語の機械的棚卸し**。専門語を抽出し初出定義の有無を機械照合する。
   curse of knowledge は伝統的 debiasing が全滅しているので、気づきを要求しない手続きが要る
7. **出典を主張単位で付ける**。CHI 2025 で誤答への依存を減らした数少ない要素。
   ただし説明を厚くするのは逆効果

## 8. 名前付きスロットの実証

「短くすれば良くなる」の実証は弱い。効いているのは長さの制約ではなく名前付きスロット。
Hartley の構造化抄録研究では、構造化抄録は従来型より**長い**のに情報量評価が高く（9.1 対 6.4）、
読みやすさ評価も高い。

移植価値が高い形式（効果の大きい順）:

1. **ICD 203 の 3 番**: 事実・前提・判断の分離 +「この前提が誤りなら結論はこう変わる」。
   制度の起点が 2002 年イラク NIE の失敗分析で、前提の暗黙化が判断の失敗に直結した実例
2. **STICC の Concern と Calibrate**: 「私が一番不安な点」「私の理解が違っていたら指摘してほしい点」。
   AI 報告に完全に欠けており追加コストが極小
3. **I-PASS の 3 要素**: 一語の重症度ラベル / 受け手がやることの to-do / if-then の contingency。
   実証が最も強い形式（予防可能な有害事象が 23% 相対減少）
4. **ICD 203 の 2 番と 7 番**: 起こりやすさと確信度の分離、前回判断からの変更の説明
5. **ADR の Consequences**（良い・悪い・中立すべて）と supersede 規律

**移植できないもの**: I-PASS の Synthesis by receiver（人間側に要約を強制する形式で向きが逆。
ただし「AI が指示の理解を書き戻す」形なら成立）。チェックリストの READ-DO 型。
純粋な長さ制約（実証がない）。

## 9. スロットの弊害と回避条件

**テンプレートは「埋まっているか」しか測れない。**

| 実測 | 結果 |
| --- | --- |
| 手術チェックリスト 142 例（直接観察） | 記録は遵守 100%。全 13 項目実施は 0 例。平均 4/13 |
| 同 オンタリオ州 21 万件 | 死亡率 0.71% → 0.65%（OR 0.91, P=0.13）で有意差なし |
| ADR 5,800 件（GitHub 921 repo） | 63% が最初から accepted 状態で作成され、審議をバイパス |
| 同 高品質実装のみ | 手術部位感染 7.4% → 3.6%（OR 0.52） |
| WHO 実運用調査 | 項目別遵守率が最低 1.9% から約 95% まで 50 倍の開き。落ちるのは動作に直結しない項目 |

WHO の設計原則がこれを予告している。「すべての項目は具体的で曖昧さのない動作に結びつかねばならない。
**動作が直接結びつかない項目は混乱を生む。**」

**回避条件は「該当なしの理由を書かせる」。** 近年の報告基準が独立に収束している。

- Kubernetes KEP: 統合テストが不要なら**なぜ不要かを書け**
- SPIRIT 2025 / CONSORT 2025: 該当しないなら**その理由とともに明記**せよ
- PRISMA 2020: 登録していないなら**登録しなかったと述べよ**

自己説明を促す介入のメタ分析（64 報告・69 効果量）で加重平均 g = .55。
同じ研究が「指導者側が説明を与えると利得が減る」ことも示す（答えを書いてやる形式は逆効果）。

**項目数の上限に実験的裏付けは無い。** WHO の「1 セクション 5〜9 項目」も
Gawande の「10 項目未満」も設計上の主張で、長さの異なるチェックリストを比較した対照研究は存在しない。
航空業界に項目数の上限は無く（FAA AC 120-71B に記載なし）、代替原則は分割。
「7±2 ルール」は俗説で、Miller の 7±2 は暗記項目の限界であって書かれたリストには適用されない。

## 10. 具体的なスロット案（未採用・要検討）

調査が出した案。9 節の反証を踏まえて組み直す必要がある。

report（調査報告）の必須 7: 結論 / 範囲（調べなかったこと）/ 調べ方と情報源 /
分かったこと（事実のみ）/ 所見（事実から結論への経路）/ 確信度 / 限界（材料側とプロセス側を分ける）。
条件付き 2: 再現条件（実測を伴う回のみ）、落とした候補（比較の回のみ）。

form（設計判断）7: 決めること / 判断基準 / 選択肢（現状維持を必ず含める）/
各選択肢の採否理由 / 前提と感度（どの前提が崩れると結論が反転するか）/ 決定と決め手 / 未解決・異論

**採らないほうがよいスロット**: Lessons Learned（NHS が明示的に廃止）、
根本原因（単数形。PagerDuty は Contributing Factors、SRE は Root Causes と複数形）、
Glossary / Appendix / References を必須にする、反証可能性欄（要求している確立済み基準が存在しない）。

## 11. 階層設計の実例

Microsoft Writing Style Guide は TOC 実測で **980 ページ、うち 888 が A-Z の用語台帳**。
人間が読む規範は 92 ページ。Google も同型で highlights 19 項目に圧縮している。

4 層に分かれる。

| 層 | 中身 | 分量（実測） |
| --- | --- | --- |
| 想起層 | 覚えて使う要点 | Microsoft 10 tips / Google 19 項目 |
| 規範層 | 文レベルの規範 | Microsoft 92 ページ / Google 約 70 ページ |
| 語彙層 | 用語・表記の台帳 | Microsoft 888 ページ（全体の 91%）|
| 種別層 | 文書種別ごとの構造 | GitLab CTRT 4 種 + 各テンプレート |

**共通層は文レベル、種別層は構造レベル**（必須セクションと順序）。
種別層に文レベルの規範を書かない。

重複は許さず優先順位で解決する。Google の 3 段フォールバック:
Project-specific style → This style guide → Third-party references。
加えて「**書かれていない規範をレビューで持ち出すことを禁じる**」条項を持つ
（"Any purely style point that is not in the style guide is a matter of personal preference."）。

## 12. 機械化の線引き

severity は重要度ではなく**判定の一意性**に相関する。

- error（CI を落とす）: レンダリングが壊れるもの。正誤が一意で文脈判断が不要
- warning: 未来形、Oxford comma、指示語の曖昧さ
- suggestion: 可読性スコア、文長、冗長さ（ページのリファクタリングを要するため diff に出しても対処できない）

Vale の実装は 8〜9 割が正規表現。数百ページの Google スタイルガイドに対しルールは 31 件で、
カバー率の公式表明はどこにも無い。

**明示的に「できない」と述べられている類型**: 文法一般（proselint: "AI-complete"）、
構文解析を要する判定、品詞情報を要する語順、例外の多い規範、主観的な規範一般
（GitLab: "If the rule is too subjective, it cannot be adequately enforced"）。

**誤検知への構え**: 全社が「まず落とさない」から始める。Vale の公式 action は既定で
`fail_on_error: false`。ある企業は既製ルールをそのまま当てて 28,461 件を出し、
取捨選択後 1,492 件（約 96% 削減）にした。

### 検証済みのスクリプト 3 本

実測済み（macOS / Node 25.8.2 / システム Chrome 150）。合計 30 秒以内。

```sh
npx html-validate@11 --preset recommended,a11y,document --formatter stylish page.html
npx linkinator@8 page.html --check-fragments --verbosity error
grep -nEo '<(div|span)[^>]*onclick' page.html
```

- `html-validate`: 59KB のページで約 4 秒。`lang` 欠落、見出しレベル飛ばし、id 重複、
  `label` 欠落、content model 違反、外部 subresource を検出。正しいページでは誤検出 0
- `linkinator`: `--check-fragments` は必須。付け忘れると同一ページ内 fragment を完全に無視して pass する。
  同一ページ fragment の対応は 7.6.0 以降なので `@8` 固定が安全。0.068 秒
- `grep`: `<div onclick>` は html-validate も vnu も axe も検出しない（3 つとも実測で沈黙）

**不要と判定したもの**: htmlhint（html-validate の真部分集合）、Lighthouse、pa11y、
vnu.jar（上積みが ARIA role 値検証程度）、htmltest（最終 release 2022-11）。

## 13. Claude Code の機構の実測

| 機構 | 毎ターン効くか | subagent | コスト | 追従 |
| --- | --- | --- | --- | --- |
| output style | 効く | 効かない | 高（never compacted） | 最高 |
| user rule（`paths` なし） | 常時載る | 効く | 中 | 中 |
| skill 本文 | 発火時のみ | 効く | 低 | 高 |
| `UserPromptSubmit` hook | 毎ターン追加 | 発火しない | 線形に蓄積 | 中〜高（未定量） |
| `SubagentStart` hook | なし | 専用 | 低 | 中 |
| `PreToolUse` hook | — | 効く | ゼロ | 決定論的 |

### output style の制約

- system prompt の**末尾に追記**される。`keep-coding-instructions: true` が無いと
  組み込みの `# Doing tasks` が丸ごと落ちる。`# Tone and style` と
  `# Communicating with the user` は常に残る
- **subagent には効かない**（公式明記。fork は例外）
- セッション開始時に固定。`/reload-plugins` では反映されず、restart か `/clear` が要る
- 同時に 1 つだけ。plugin が `force-for-plugin: true` を立てるとユーザー設定を上書きし、
  複数 plugin が立てると先勝ちで非決定的
- plugin から配布可能（v2.0.41 以降、`output-styles/*.md`）

### rule の実測

- **セッション開始時に一度だけ読まれる。** セッション中に追加した rule はそのセッションでは効かない
  （本セッションで実測。`rules/subagent-delegation.md` が同セッションの subagent の context に入らず、
  新規セッションでは正常にロードされた）
- frontmatter は `paths`（内部プロパティは `globs`）。`globs` / `alwaysApply` は
  Cursor のフィールドで Claude Code のものではない
- マッチャは `ignore` ライブラリ（gitignore semantics）。picomatch ではない
- User scope でも条件付きロードされ、symlink 越えも有効。相対パス基準は cwd
- **`paths` はファイルパスしか見ない。** ターミナル返答・PR 本文・commit message は
  ファイルパスを持たないので捕捉できない。「今書いているテキストの種類」で切り替える
  宣言的手段は Claude Code に存在しない

### skill 間参照

- 公式に skill 合成・依存・skill 間参照の規定は**一切ない**。
  `anthropics/skills` の 17 skills を grep しても skill 間参照はゼロ
- 参照ファイルの読み込みは魔法ではなく「SKILL.md に書かれた相対パスを Claude 自身が開く」だけ
- 実運用型は skill 名参照（`plugin:skill` 形式）。パス参照と `@` import は
  大規模な community skill 集が明確に否定している（`@` は即時全量ロードで context を焼く）
- **plugin 間でファイル実体を共有する公式手段は marketplace 内 symlink のみ。**
  install 時に cache へコピー展開される複製配布で、`--plugin-dir` の開発時には壊れる
- コミュニティの主流は「skill から skill を参照」ではなく「共有 fragment を skill に読ませる」。
  `.claude/skills/_shared` の GitHub code search ヒット 2,416 件

## 14. この台帳の限界

- 下位 agent 1 本が公式ドキュメントの引用・GitHub issue 番号十数件・ブログ記事の内容を
  **捏造して自己申告で撤回した**。親 agent が公式ドキュメントを再取得し、
  コミュニティ実例 3 件は raw URL で実在と内容を確認した。
  検証できなかった記述（issue 番号・CHANGELOG・「Anthropic 側の対応」）は全部除いてある
- 9 本中 6 本が WebSearch の予算（200 件）を使い切り、後半は直接 fetch と API に依存した。
  網羅性は保証されない
- 2026 年の arXiv 論文の多くは査読前の preprint
- **位置効果と規範の抽象度を分離した研究は無い。**
  「後から足した規範ほど守られない」の原因は断定できていない。
  後から書かれた規範は明白なものを書き尽くした後の残りなので、
  本質的に抽象度が高い可能性がある

## 15. 未回答のまま残っているフォーム

| フォーム | 設問 | 担当セッション |
| --- | --- | --- |
| 対話規範をゼロベースで組み直す | 4 問（回答済み・補足のみ） | 1 |
| ターミナルセッションのコミュニケーション規範 | 5 問 | 1 |
| 出力品質のハーネス | 6 問（回答済み） | 1 |
| KAO の github 系 skill いいとこどり | 4 問 | 3 |
| 発動検証ハーネスの設計 | 3 問 | 4 |

serve URL は `https://mac-mini.hake-tarpon.ts.net/<ファイル名>`。
一覧は `~/.local/share/claude-html-communication/index.html`。
