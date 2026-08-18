# 構成図・概念図の表現: 調査の結論（2026-08-18）

html-communication の見せ方のパターン集に構成図・概念図を入れるための調査。
コミュニティ実践 / HTML・CSS・SVG の作図技法 / 図型の選択理論 / アクセシビリティ /
実プロダクトの実装例の 5 本を並列で走らせた結論を、出典付きで残す。

責務境界（responsibility boundary）単体の調査として始まり、ユーザー指示で
構成図全般へ広げた。責務境界は数ある用途の 1 つに格下げしている。

## 判断の順序（この調査で最も効いた結論）

図に関する判断は 4 段階の順で行う。

1. 図にするか（散文・表・箇条書きで足りないか）
2. 図型を選ぶ
3. 関係を何でエンコードするか（囲い / 入れ子 / 近接 / 線 / 色 / 位置）
4. 残った属性にチャネルを割り当てる

チャネル有効性順位（Bertin の網膜変数、Cleveland &amp; McGill、Munzner）が使えるのは
4 段目だけで、構造そのものの表現に転用できる実証的根拠は無い。
Mackinlay（ACM TOG 5(2), 1986, Fig 15）だけが connection・containment を順位表に載せるが、
本人が p.124 で「この拡張は経験的に検証されていない」と書いている。

前回セッションが「色役割をどうするか」から入っていたのは、この順序が 3 段ずれていた。

## 実務者が規範化しているのは図型ではなく 4 制約

抽象度を混ぜない / 1 図 1 目的 / 要素数の上限 / 意味を凡例と表で固定する。
図型そのものの選び方を明文で規定した公開標準は
[Microsoft Azure WAF, Create architecture design diagrams](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/design-diagrams)
の 1 件だけだった。他はすべて「描く対象を減らせ・分割せよ・凡例を付けろ」を言う。

## 数値のある結論

| 事項 | 値 | 出典 |
| --- | --- | --- |
| ノードリンク図と隣接行列の分かれ目 | 20 頂点超で行列が大半の課題で優る。経路探索のみノードリンクが一貫して有利 | Ghoniem, Fekete &amp; Castagliola, *Information Visualization* 4(2), 2005（N=36、7 課題） |
| 同上（疎な実網では逆） | 疎なスケールフリー網ではノードリンクが 10 課題中 5 勝 3 敗 | Okoe, Jianu &amp; Kobourov, TVCG 2019（864 名） |
| 静的な図の要素数 | 約 12。動的な図は 20 | Gernot Starke（arc42 共著者）の[個人ブログの経験則](https://www.innoq.com/de/blog/2022/09/better-architecture-diagrams/) |
| 等輝度色の識別上限 | 7 色（誤り 3.3%）、9 色で 8.1% | Healey, IEEE Vis 1996（38 名） |
| カテゴリ色数と誤り率 | 3 色 12.0% / 5 色 18.0% / 8 色 28.8% | Colorgorical（Gramazio ら, TVCG 23(1), 2017） |
| 囲いの読み取り精度 | Bubble Sets 54.5% / LineSets 84.3% / KelpFusion 86.5% | Meulemans ら, TVCG 19(11), 2013（N=13） |
| 同上（群が一塊にできる場合は逆） | ノードリンク図に群を重ねる形では BubbleSets が群課題で一度も負けず、ノードの着色が最下位 | Jianu ら, TVCG 20(11), 2014（850 ノード 26 群、MTurk 788 名） |
| 矢印の有無が変える読み | 矢印ありは機能的記述が増え(2.24 対 1.26)、なしは構造的記述が増える(1.65 対 0.52) | Heiser &amp; Tversky, *Cognitive Science* 30(3), 2006 |
| 空間近接原則の効果量 | 22/22 の実験で支持、効果量中央値 d=1.10 | Mayer &amp; Fiorella, *Cambridge Handbook of Multimedia Learning* 2nd ed., ch.12 |

## 実測（このセッションで測った値。再測できる）

Chrome 151.0.7922.138 / macOS。

- 雛形の線トークンのコントラスト比（ライト地 #fff / ダーク地 #16181d）
    - `--rule` 1.61 / 1.68 — **WCAG 1.4.11 の 3:1 を満たさない。装飾専用**
    - `--control-border` 3.87 / 4.27 — 満たす
    - `--rule-strong` 8.14 / 6.82 — 満たす
- CSS Anchor Positioning は `anchor-name` / `anchor()` / `anchor-size()` / `position-anchor` /
  `anchor-scope` すべて対応。ただし `width: anchor(--a right)` と
  `rotate: calc(1deg * anchor(--a top))` は**非対応**。
  `anchor()` は inset プロパティでしか通らないため、**斜線は原理的に引けない**（演繹ではなく実測）
- `transform: rotate(atan2(10px,10px))` は通るが、アンカー座標を渡す構文が無いので線は回せない
- `shape-inside` は非対応（SVG テキストの図形内流し込みは不可）
- Chrome headless は macOS でウィンドウ幅を 500px 未満にできない。
  320px の測定は iframe に埋めて行う

## 覆った前提

- **図は横スクロールしてよい**。WCAG 1.4.10 Reflow の Note 2 が例外に "diagrams" を名指ししている。
  ただし例外は図そのものに限られ、図の外の説明文・凡例・キャプションは 320px でリフローが要る
  （[SC 1.4.10](https://www.w3.org/TR/WCAG22/#reflow)）
- **ただし実務は横スクロールさせていない**。実プロダクト 18 例のうち横スクロール 0 件で、
  すべて縮小（`max-width:100%` / `clamp()` / `srcset`）で処理していた
- **インライン SVG の内部を支援技術に読ませる設計はブラウザ間で成立しない**。
  `role="img"` を付ければ仕様上子要素が消え（[WAI-ARIA 1.2 §5.2.9](https://www.w3.org/TR/wai-aria-1.2/#childrenArePresentational)）、
  付けなくても暗黙ロールが Chrome=image / Firefox=graphics-document /
  Safari=名前があるときだけ generic と割れている
  （[W3C public-svg-issues, 2026-02](https://lists.w3.org/Archives/Public/public-svg-issues/2026Feb/0080.html)）。
  既定の作りは「図は装飾扱い + 等価な構造化テキストを本文に可視で置く」
- **重なり合う境界（1 ノードが 2 境界に同時所属）は主要ツールがいずれも非対応**。
  [D2 FAQ](https://d2lang.com/tour/faq/)（"Not currently and not in the near future"）、
  Structurizr は `GroupableElement.java` が単一フィールドで構造的に不可能、
  [Graphviz DOT](https://graphviz.org/doc/info/lang.html)（"clusters form a strict hierarchy"）、
  Mermaid は[要望 #2567](https://github.com/mermaid-js/mermaid/issues/2567) が open のまま。
  HTML の DOM が木構造ゆえに表せない制約は、作図ツール一般と同じ制約であって HTML 固有の弱点ではない

## 実装手段の判定

| 図の種類 | CSS だけで組めるか |
| --- | --- |
| 入れ子の囲い・レイヤ・マトリクス・比率 | 組める。SVG 不要 |
| 依存グラフ（任意 2 点） | 直交のみ可。斜線・交差は SVG 必須 |
| フロー・分岐 | 直線的な流れと 1 段分岐は可。合流・交差があれば SVG 必須 |
| 状態遷移 | 不可（自己ループ・双方向曲線） |

JS 無しの自動レイアウトは存在しない。実用解は座標決め打ち / セル局所コネクタ /
Anchor Positioning（直交のみ）の 3 つ。
SVG の `<text>` は折り返さず `shape-inside` は全ブラウザ未実装なので、
可変長テキストの唯一の安定解は**線 = SVG、文字 = HTML の二層構成**。

## 実プロダクト 18 例に共通していた作法

- 彩度の高い色は 1 色に絞ってアクセントにする。残りは淡い塗り + 濃い文字で、色は分類にだけ使う
- 破線は「例外的な関係」の予約語として温存する（任意の依存 / 非同期 / 応答 / 別経路）。
  全線を破線にしている Prometheus では破線が情報を持たなくなっていた
- ノードのラベルは 1〜3 語に切り詰め、長い説明は図の外へ出す。
  出し先は 3 通り（図中の凡例列 / 図の脇の注釈カード列 / 帯の左の説明文）
- フォントサイズは 2〜4 段。6 段まで増えるのは作図ツール由来のもの
- 狭幅は全例が縮小で処理。横スクロールは 0 件
- ダーク対応を 1 ファイルで完結できているのは、図をコードで生成している側だけ
  （D2 は SVG 内 `@media` で `.fill-N1`〜 のトークン級クラスの値だけ差し替える）

## 引用してはいけないもの（裏が取れなかった通説）

- Tufte の「表は間抜けな円グラフより常にましだ」— [本人のサイトの pie charts ノート](https://www.edwardtufte.com/notebook/pie-charts/)に存在しない
- Shape Up が Gantt チャートを名指しで否定している — 本文に "Gantt" が 0 ヒット
- Moody の Graphic Economy が記号数を 6 に制限している — 原論文が有料で確認できず。二次情報が帰しているのは 7±2
- 「図の箱は 7±2 まで」— Miller 1956 は一次元刺激の絶対判断とスパンを測ったもので、
  Miller 自身が「6 次元にすれば識別可能なカテゴリは約 150 に増える」と書いている。
  グラフ図のレビュー 152 件（Yoghourdjian 2018）も「人間側の認知的スケーラビリティは研究不足」と明言
- Excalidraw の「手書き風 = ドラフトの signal」— 公式の一次表明が無い（tldraw 側にはある）

## 未確認のまま残したもの

- 構成・責務・順序の伝達については統制実験が無く、実務者の経験則しかない。
  測定値があるのは探索課題（経路探索・リンク判定・量の比較）に限られる
- ゲシュタルト cue の強弱順位は実証されていない。定量化されているのは近接だけ
- スイムレーンの有効性に関する実証研究
- 図と表の split-attention effect のアーキテクチャ図での再現実験
- コミュニティ調査は WebSearch 予算 200 件を使い切ったため、後半は既知 URL への直接取得のみ。
  「見つからなかった」は「当たった一次ドメインの範囲内に無かった」の意味

## 採否の決定（2026-08-18、出典 ccm-f026）

- **構成図の実装に Tailwind を使う。ただし図の中だけ。** 外部 CDN は使えないので、生成のたびに
  CLI を回して使ったクラスだけの CSS を出し、`<style data-scope="figures">` へ貼り込む。
  preflight は読み込まない。決め手は、図が無いページでコストが増えないこと
- **図の中では色役割の 3 つ固定とフォントの 4 段を適用しない。** 条件は凡例・色以外の手掛かりの併記・
  図の外へ持ち出さないの 3 つ。機械検査も `data-scope="figures"` の style を対象から外した
- **パターン `zone-bands` を登録した。** 所有・信頼の範囲を横帯で積む形。
  骨格（帯・アイコン・名前と副題の 2 段・タグ列・帯の間の矢印）を正典とし、
  **色と余白の詰め方は暫定**（ユーザー評価「今回のサンプルはあんまり合わなかった」2026-08-18）
- **見送った案**: 手書き CSS の 10 案（枠とエッジ、角のブラケット、左肩のバー、見出しの帯、段差、
  桁揃え、種別のバッジ、縦の軸線、SVG で描く形、横向きのパイプライン）。
  Tailwind を採る判断に伴い作り直しになるため。実体は削除済みで git 履歴にも無い

### 残っている調整

- Tailwind で図を作るときの色合いとデザインパターン。今回は 3 層構成図の作例から取ったが、
  この repo の見た目としては決着していない
