# 規範インベントリ: 日本語・出力規範の全数抽出 (2026-07-30 実施)

読むだけの参照台帳。
セッション 1（規範の配置と強制）の subagent が抽出した 321 件の規範の分類と重複マップ。
正典の中身の設計と、実装セッションの重複削除作業の対象リストとして使う。

抽出単位は「1 つの指示・規範」（見出しやセクションではなく指示の実体）。
分類は 10 種: 取捨選択 / 目的・読者の確定 / 構成・順序 / 文レベル / 表記・記法 /
形式・媒体判定 / 文書種別の構造 / 確認・質問の作り方 / 検知・レビュー手順 / その他。

## ファイル凡例

| 略号 | 絶対パス（repo 相対） |
|---|---|
| JR | rules/japanese-text-writing.md |
| UC | rules/user-communication-format.md |
| MF | rules/markdown-formatting.md |
| SK | plugins/japanese-text-writing/skills/japanese-text-writing/SKILL.md |
| RD | 同 references/reference-docs.md |
| DD | 同 references/decision-docs.md |
| AW | 同 references/academic-writing.md |
| EW | 同 references/explanatory-writing.md |
| NW | 同 references/narrative-writing.md |
| HC | plugins/claude-user-communication/skills/html-communication/SKILL.md |
| FN | 同 references/review-norms.md |
| AQ | plugins/claude-user-communication/skills/ask-with-choices/SKILL.md |
| GP | plugins/github-pr/skills/...（行内で個別ファイル明記） |
| IS | plugins/impl-spec/...（同上） |
| SS | plugins/session/...（同上） |

## 集計 1: 分類ごとの件数（全 321 件）

| 分類 | 件数 |
|---|---|
| 文レベル（文体・冗長・事実表現・用語含む） | 67 |
| 構成・順序 | 43 |
| その他（運用・報告形式・メタ） | 38 |
| 表記・記法（markdown・和欧混植・表・引用含む） | 37 |
| 文書種別の構造（テンプレ・必須セクション） | 37 |
| 確認・質問の作り方 | 37 |
| 取捨選択 | 26 |
| 検知・レビュー手順 | 22 |
| 形式・媒体判定 | 10 |
| 目的・読者の確定 | 4 |

ファイル別の件数: JR 11 / UC 4 / MF 15 / SK 27 / RD 13 / DD 13 / AW 13 / EW 9 / NW 21 /
HC 54 / FN 27 / AQ 17 / GP 54 / IS 29 / SS 14。

## 集計 2: 重複グループ（同趣旨 2 箇所以上、47 グループ）

| DG | 趣旨 | 所在 |
|---|---|---|
| DG1 | 結論先行・重点先行 | JR1 / SK5 / DD1 / GP9, GP10 / HC27 / UC4 /（boilerplate S1〜S4） |
| DG2 | 冒頭の地図 | SK5 / RD1 / DD2 / HC28, HC32 /（S1） |
| DG3 | 報告・概要は最重要の一文から | DD10 / GP8, GP31 |
| DG4 | 冗長排除・一つの主張は一度 | JR3 / SK8 / GP11, GP32 / HC33 / SS14 |
| DG5 | 文章自身を語る文を削る | JR4 / SK9 / NW15 |
| DG6 | 省略の禁止（重要情報を落とさない） | JR5 / SK13 / SS3, SS4 / FN14 |
| DG7 | 関心事の分離 | JR6 / SK12 / RD10 / SS11 |
| DG8 | 事実と意見・実測/推定の峻別 | JR7 / SK16, SK17 / DD6, DD7 / FN13, FN25 / GP20 |
| DG9 | 未確認の明示・断定の規律 | SK18 / DD8 / RD8 / AW4 / IS25 |
| DG10 | 因果に機構を添える | SK19 / AW7 |
| DG11 | 用語 1 概念 1 語・新語禁止 | JR8 / SK21 / AW10 / EW3 / FN27 / IS1 |
| DG12 | 初出定義 | SK22 / HC39 / GP21 / FN26 |
| DG13 | 固有名の扱い | SK23 / SS12（同旨）↔ SS4（逆方向: handover は省略禁止。文書目的の差） |
| DG14 | 修飾語の位置・「」 | JR9 / SK24 |
| DG15 | 一文短く・段落分割 | SK25 / GP5, GP6, GP7 |
| DG16 | AI 口調・空虚な予告・装飾の禁止 | JR10 / SK27 / MF2, MF5 / NW12, NW13 |
| DG17 | 曖昧表現禁止・未確定ゼロ・検証可能性 | SK15 / IS12, IS13, IS22, IS26 |
| DG18 | 文書種別で規範を切り替える判定 | JR2, JR11 / SK4, SK6 |
| DG19 | 形式・媒体判定（テキスト/選択肢/HTML） | UC1, UC3 / HC1, HC2 / AQ1, AQ7 |
| DG20 | 1 節・1 議題・1 設問 1 トピック | SK7 / RD3 / HC34 / FN7 /（S5） |
| DG21 | 見出しは具体的な句 | RD2 / EW8 |
| DG22 | 表 vs 箇条書きの使い分け | RD4 / GP23 |
| DG23 | 表セルは短い判定値 | RD5 / HC36 /（T1, T2） |
| DG24 | 比較表: 列=選択肢・行=観点・決め手名指し | DD3 / HC37, HC48 /（T11〜13） |
| DG26 | 推奨に根拠併記 + 覆し可能性 | DD4 / HC44 / FN8, FN10 / IS20 /（F12） |
| DG27 | 詳細・参考資料の隔離 | DD12 / HC31, HC33, HC42 /（S14） |
| DG28 | 出典リンク・引用元の事前検証 | DD7 / AW13 / GP25, GP26, GP27 / MF12 |
| DG29 | 引用 verbatim・中略明示 | MF13 / AW12 / FN16 |
| DG30 | 「あなた」禁止・対話残留排除 | RD13 / NW17 / FN15 |
| DG31 | 概念は困りごと→命名の順 | EW1 / NW11 |
| DG32 | 列挙の着地 | EW4 / NW10 |
| DG33 | 問いの回収 | AW9 / NW4 |
| DG34 | 態度のない議題表の禁止 | EW5 / NW3 |
| DG35 | 太字は論理の要所 1〜2 箇所 | MF1 / NW19 |
| DG36 | 選択肢形式 + Other 欄 | AQ2, AQ3 / HC47, HC49 / IS7 |
| DG37 | 4 問まで・5 問以上は分割 + 全体計画 | AQ5, AQ6 / IS8, IS9 |
| DG38 | 上流決定の先出し・修正前の方針確認 | AQ8 / IS5 / GP53 |
| DG39 | 選択肢の詳細・トレードオフの先出し | AQ10〜12 / IS21 / HC48 |
| DG40 | 回答後のフロー（解釈まとめ→確認） | AQ14 / HC54 |
| DG41 | レビューループ（指摘ゼロ/approve まで反復） | HC52 / FN1 / IS16 / SS8 |
| DG42 | 文脈を知らない読者による検証 | FN4 / SS10 /（C11） |
| DG43 | 全件列挙・「同様」省略禁止 | IS19 / FN22 / SK15 |
| DG45 | 文書種別テンプレの分散定義 | IS11, IS23, IS24 / SS1 / GP30, GP42 / HC29, HC34 |
| DG46 | **矛盾**: AskUserQuestion 運用 | AQ1（時限禁止）↔ IS7, IS28（使用必須）↔ SS13（不使用指定） |
| DG47 | How to check 省略基準の再掲 | GP14 / GP29 |
| DG48 | 自明なことは書かない | GP15 / GP43 |
| DG49 | 本文と行指定コメントの役割分離 | GP39 / GP43 |

DG 番号は抽出時の連番で DG25・DG44 は欠番。

## 集計 3: product-boilerplate norms との重複領域

`~/ghq_root/github.com/ryosukee/product-boilerplate/docs/norms/` の構成（README 実測）:
document-structure.md (S1〜S21) / table-design.md (T1〜T34) / form-design.md (F1〜F18) /
visual-readability.md (V1〜V12) / clarity-communication.md (C1〜C15)。

- S 系 ↔ SK5 / RD1 / DD1-2 / HC27-28 / HC32（地図・結論先行）、SK7 / RD3 / HC34、DD12 / HC42
- T 系 ↔ RD5 / HC36、DD3 / HC37、HC16、HC35
- F 系 ↔ HC44〜49、FN8 / FN10、AQ の選択肢設計全般
- C 系 ↔ SK21-22 / FN26-27（FN27 は C12〜13 を明示参照）、IS13、GP22、FN4 / SS10
- V 系 ↔ HC12 / HC26（弱い重複）。MF は独立で重複なし
- **HC30 が boilerplate を正典宣言しつつ、HC31〜42 が S/T/F 系の内容を skill 本文に転記しており二重化**

## 主な所見（抽出時の事実）

- 汎用規範（DG1〜17 系）が github-pr / impl-spec / session に再実装されている。
  例: GP5「一文は短く」= SK25、GP9「結論から」= JR1/SK5、IS13 曖昧表現禁止 = SK15
- DG46 は重複ではなく現行の矛盾（AskUserQuestion 恒久禁止の実装時に impl-spec 3 skill から除去が必要）
- SS4（handover は固有識別子を省略しない）と SK23（参照不要な固有名を本文に出さない）は方向が逆。
  文書目的の差であり、正典側に「例外の根拠」として整理する候補
- 全 321 行の明細（ID・節・分類・要旨・汎用/固有・重複相手）は抽出 subagent の結果に含まれる。
  この台帳には集計と重複マップのみ転記した。明細が必要になったら同じ手順で再抽出できる
  （対象ファイル一覧は凡例のとおり、抽出単位と分類は冒頭のとおり）
