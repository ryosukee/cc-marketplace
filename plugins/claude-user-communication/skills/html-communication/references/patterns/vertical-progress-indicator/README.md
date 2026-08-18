---
group: 進行と状態
---

# vertical progress indicator

縦に並んだ複数の工程を、左端の縦線と各工程の円形マーカーで繋ぎ、
前の工程が終わらないと次に行けない直列の進行を表す。

## 名前

単一の公式名は存在しない。IBM Carbon が progress indicator と呼び、縦方向を推奨している。
Material Design 2 は steppers と呼び、縦形を vertical stepper、直列を linear stepper とする。
Material Design 3、Shopify Polaris、GitHub Primer に該当コンポーネントは無い。
Atlassian の progress tracker は横方向のみ。

Carbon の呼称に方向を足した `vertical progress indicator` を使う。横に並べる形は作らない。
読みの方向が流れと一致する場合しか利点が無く、縦のほうが読みやすい。

## 使ってよい条件

- 3 つ以上の工程に分割できる直列のプロセスを示すとき
- 工程ごとに完了・現在・未着手の状態があるとき
- 状態を持たない処理の段を示すとき（`.phase-list.plain` の変種を使う）

## 使ってはいけない条件

Carbon と USWDS が明文で一致している 3 つ。

- 工程が 3 つ未満のとき
- 任意の順序で完了できるプロセスのとき
- 条件分岐で工程の数が変わりうるとき

加えて Material Design 2 が、入れ子と 1 ページ複数配置を禁じている。

## 近縁パターンとの区別

- timeline は既に起きた出来事を時系列で並べる。完了・現在・未着手の状態を持たない。
  これから進むタスクなら progress indicator、起きた出来事なら timeline
- USWDS の process list は手順の解説。見た目は最も近いが、現在地の概念を持たない
- progress bar は進行の主体がシステム（ダウンロード、保存）のとき。
  ユーザーの操作で進むなら progress indicator

## アクセシビリティ

- 現在地は完了とも未着手とも区別する。現在だけを塗って他をすべて輪郭にすると、
  完了と未着手が同じ見た目になる（USWDS の明文）
- 完了した段は全体を薄くして後ろへ下げる。読み手が見るのは現在地とこれから先
- 順序付きリストを土台にする。専用の role は無く、WAI-ARIA APG にもパターンが無い
- 現在の工程に `aria-current` を付ける。WAI-ARIA 1.2 が値 `step` を定義しているが、
  USWDS の実装は `true` を使う。仕様が許す範囲での差
- 色だけに頼らない。状態を語（完了・現在・未着手）でも示す

> 情報源: 各デザインシステムの公式ドキュメント（2026-08-18 調査）<br>
> 呼称は [Progress indicator](https://carbondesignsystem.com/components/progress-indicator/usage/)（Carbon）と
> [Steppers](https://m1.material.io/components/steppers.html)（Material Design 1 / 2）。
> 使ってはいけない条件は Carbon の同ページと
> [Step indicator](https://designsystem.digital.gov/components/step-indicator/)（USWDS）が一致。
> 現在地の表現とアクセシビリティは USWDS の同ページ。
> 近縁パターンの区別は [Progress bar](https://carbondesignsystem.com/components/progress-bar/usage/)（Carbon）、
> [Steps](https://ant.design/components/steps) と [Timeline](https://ant.design/components/timeline)（Ant Design）、
> [Process list](https://designsystem.digital.gov/components/process-list/)（USWDS）。
