# 見せ方のパターン集

雛形が持たない一点物の見せ方を、名前を付けて貯める場所。
議題ごとに作った表現のうち、次に使えるものだけを残す。

雛形（`templates/page.html`）と [この skill の SKILL.md](../SKILL.md) との役割の違いは次のとおり。

| 置き場 | 役割 |
| --- | --- |
| SKILL.md | 守るべき規定。色の役割、フォントの段、表の作り、設問の置き方 |
| 雛形 | 実装の正。CSS と HTML の実体 |
| このファイル | 規定されていない見せ方の選択肢。名前・使う条件・使わない条件 |

CSS と HTML は雛形に置き、ここには写さない。値の正が 1 箇所に保たれ、
パターンの追加も削除も 1 セクションの出し入れで済む。

## 書き方

パターン 1 つを `##` 1 つにする。載せるのは次の 5 つだけ。

- **名前**: 公式のデザインシステムに同じ形があればその呼称に揃える。
  無ければ説明的な名前を付け、公式に無い旨を書く
- **何を表すか**: 1 文
- **使ってよい条件**
- **使ってはいけない条件**
- **実装**: 雛形のどの class を使うか

判定基準: 次にこの形を使いたくなったとき、条件だけ読んで採否を決められるか。
決められないなら条件の書き方が悪い。

## vertical progress indicator（縦の直列ステップ）

縦に並んだ複数の工程を、左端の縦線と各工程の円形マーカーで繋いで表す。
前の工程が終わらないと次に行けない直列の進行を示す。

単一の公式名は無い。IBM Carbon が progress indicator と呼び、縦方向を推奨している。
Material Design 2 は steppers と呼び、縦形を vertical stepper、直列を linear stepper とする。
Material Design 3、Shopify Polaris、GitHub Primer に該当コンポーネントは無い。
Atlassian の progress tracker は横方向のみ。

### 使ってよい条件

- 3 つ以上の工程に分割できる直列のプロセスを示すとき
- 工程ごとに完了・現在・未着手の状態があるとき
- 進捗の把握が読者の判断を助けるとき

### 使ってはいけない条件

Carbon と USWDS が明文で一致している 3 つ。

- 工程が 3 つ未満のとき
- 任意の順序で完了できるプロセスのとき
- 条件分岐で工程の数が変わりうるとき

加えて Material Design 2 が、入れ子と 1 ページ複数配置を禁じている。

### 近縁パターンとの区別

- **timeline**: 既に起きた出来事を時系列で並べる。完了・現在・未着手の状態を持たない。
  これから進むタスクなら progress indicator、起きた出来事なら timeline
- **process list**（USWDS）: 手順の解説。見た目は最も近いが、現在地の概念を持たない
- **progress bar**: 進行の主体がシステム（ダウンロード、保存）のとき。
  ユーザーの操作で進むなら progress indicator

### アクセシビリティ

- 現在地は完了とも未着手とも区別する。現在だけを塗って他をすべて輪郭にすると、
  完了と未着手が同じ見た目になる（USWDS の明文）
- 順序付きリストを土台にする。専用の role は無く、WAI-ARIA APG にもパターンが無い
- 現在の工程に `aria-current` を付ける。WAI-ARIA 1.2 が値 `step` を定義しているが、
  USWDS の実装は `true` を使う。仕様が許す範囲での差
- 色だけに頼らない。完了状態を視覚的に隠したテキストでも示す

### 実装

雛形の `.phase`。状態は 3 つで、`.done`（完了）、`.now`（現在）、無指定（未着手）。
工程の切れ目に到達点を置くなら `.milestone` を挟む。

> 情報源: 各デザインシステムの公式ドキュメント（2026-08-18 調査）<br>
> 呼称は [Progress indicator](https://carbondesignsystem.com/components/progress-indicator/usage/)（Carbon）と
> [Steppers](https://m1.material.io/components/steppers.html)（Material Design 1 / 2）。
> 使ってはいけない条件は Carbon の同ページと [Step indicator](https://designsystem.digital.gov/components/step-indicator/)（USWDS）が一致。
> 現在地の表現とアクセシビリティは USWDS の同ページ。
> 近縁パターンの区別は [Progress bar](https://carbondesignsystem.com/components/progress-bar/usage/)（Carbon）と
> [Steps](https://ant.design/components/steps) / [Timeline](https://ant.design/components/timeline)（Ant Design）、
> [Process list](https://designsystem.digital.gov/components/process-list/)（USWDS）。
