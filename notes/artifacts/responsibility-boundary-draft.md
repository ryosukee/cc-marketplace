# responsibility boundary の下書き（2026-08-18）

html-communication の見せ方のパターン集に入れる候補として作り、gallery で見たあとに
「もう少し練りたい」として切り出したもの。この下書きは commit を経ずに作業ツリーだけに
存在していたため、git 履歴から復元できない。ここに保存する。

採否と最終形は未決。次に着手するときの出発点として使う。

## 調査の結論（2026-08-18）

「破線 = 責務の境界」は普遍的な作法ではない。線種の割り当ては記法ごとに逆になっている。

| 記法 | 責務・所有の囲い | 線種 |
| --- | --- | --- |
| C4 / Structurizr | スコープ境界 | 実線・中身と同じ色 |
| C4 / Structurizr | 組織的まとまり | 破線・グレー |
| UML 2.5.1 | package / node / subject / partition | すべて実線。破線は依存関係に割り当て済み |
| ArchiMate 3.1 / 3.2 | Grouping | 破線 |
| AWS | 20 種の group | 大半が実線。破線は Region / AZ / Auto Scaling group / Generic の 4 種。区別の主軸は色 |
| Microsoft 脅威モデリング・OWASP | trust boundary | 赤の点線。ただし責務ではなく信頼レベルの変わり目 |

記法をまたいで共通しているのは線種ではなく次の 3 点。

- 囲いには必ずラベルを付ける
- 線種・色に意味を持たせたなら凡例で明示する
- 囲いは塗りなし。中身が見える前提の器として扱う

Azure は境界の線種・色・ラベル位置を定めておらず、「border や line に意味を持たせるなら
簡潔な凡例を添えろ」とだけ書く。Google Cloud は作図ガイドライン自体を公開していない。

## 旧版の欠陥

初版は実線の箱（構成要素）と破線の囲み（責務の範囲）の入れ子だった。
線種を「要素か境界か」の区別に使い切っているので、境界が 2 種類以上出た時点で打ち手を失う。
C4 は要素と境界を大きさ・ラベル位置で区別し、線種は境界の種類の区別に空けている。

## HTML と CSS での再現可否

境界（軸に平行な矩形の囲い）は完全に再現できる。関係線（矢印）は再現できない。
任意の 2 点を結ぶ斜線・折れ線・矢頭は border や背景では引けないため、
要素間の関係は矢印ではなく行の並び・表・テキストで表すことになる。

重なり合う境界（AWS の Auto Scaling group が 2 つの AZ をまたぐ形、ArchiMate の
overlapping groups）も再現できない。HTML の入れ子は厳密な木構造で、DOM 上 2 つの親に
同時に属せない。`position: absolute` で見た目だけ重ねると DOM 順と意味が乖離する。

## アクセシビリティ

- `role="img"` を付けない。Children Presentational: True なので箱の中のテキストが全部消える
- `fieldset` は暗黙 role が `group` で、最初の `legend` が accessible name になる。
  可視ラベルをそのまま名前にできるので ARIA 属性を足さずに済む
- `role="region"` は使わない。ARIA 1.2 が region を「ページの要約や目次に含まれるもの」と
  定義しており、図の内部構造をランドマーク一覧に載せるのは不適
- 図全体は `figure` で包み、`figcaption` に id を振って `aria-labelledby` で明示参照する。
  `figcaption` は明示参照しない限り accessible name の計算に参加しない
- 所属関係を表で併記する。検証基準は「図を消しても同じ情報が残るか」
- 境界の種別を色だけで区別しない。線種の併用は WCAG の G111 が十分技法として挙げているが、
  線種だけでも不十分で、ラベルのテキストで種別を書くのが確実
- DOM 順を読み順として成立させる。`order` や `grid-area` で見た目だけ組み替えない

## 下書きの実体

C4 の 2 層構えへ寄せた版。色で所有者を分ける C4 の実装は、当時の「色役割は 3 つに固定」の
制約と衝突するため採らず、線種とラベルで区別している。
**この制約はその後に緩めた**（既定の 3 つは全ページで通しつつ、色に定着した意味がある場合に
限りパターン固有の色を許す）ので、C4 の実装に寄せる余地がある。これが残る判断。

### style.css

```css
/* 囲みを 2 種類に分ける。線種を「要素か境界か」ではなく「境界の種類」に使う。
   所有の境界は実線の太め、補助のまとまりは破線。
   fieldset と legend を使うと、囲みの名前がそのまま accessible name になる */
.bnd { border: 2px solid var(--rule-strong); border-radius: 8px;
       padding: 10px 12px; margin: 6px 0; min-inline-size: 0; background: transparent; }
.bnd.group { border-style: dashed; border-color: var(--rule); }
.bnd > legend { padding: 0 6px; font-size: 0.875em; font-weight: 700; color: var(--fg); }
.bnd > legend .btype { font-weight: 400; color: var(--sub); }
/* レイアウトは fieldset 直下ではなく内側に置く。fieldset への flex は実装差がある */
.bnd > .bndin { display: grid; gap: 8px; }
.bnd .bnd { margin: 4px; }
.node { border: 1px solid var(--rule); border-radius: 6px; padding: 7px 10px; font-size: 0.875em; }
.node .k { color: var(--sub); display: block; }
.flowline { font-size: 0.875em; color: var(--sub); text-align: center; margin: 4px 0; }
/* 線種に意味を持たせたら凡例を出す */
.bndkey { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.875em; color: var(--sub);
          margin: 10px 0 0; }
.bndkey span::before { content: ""; display: inline-block; width: 18px; height: 0;
                       border-top: 2px solid var(--rule-strong); margin-right: 6px;
                       transform: translateY(-3px); }
.bndkey .kgroup::before { border-top-style: dashed; border-top-color: var(--rule); }
```

### example.html

```html
<fieldset class="bnd">
<legend>IdP チーム <span class="btype">[所有の境界]</span></legend>
<div class="bndin">
<div class="node">署名鍵と発行ロジック<span class="k">この境界の内側で完結する</span></div>

<fieldset class="bnd group">
<legend>Shopify Customer BFF <span class="btype">[共有のまとまり]</span></legend>
<div class="bndin">
<div class="node">トークンの組み立て<span class="k">Core・フロントと共有</span></div>
</div>
</fieldset>
</div>
</fieldset>

<p class="flowline">BFF から Core API へ、内部トークンを添えて呼ぶ</p>

<div class="node">Core API<span class="k">境界の外。信頼する発行元 = BFF の数だけ</span></div>

<p class="bndkey"><span>実線 = 所有の境界</span><span class="kgroup">破線 = 補助のまとまり</span></p>
```

## 初版（参考）

commit `1994b51` に `.lane` / `.node` / `.own` / `.own-h` / `.flowline` の形で入っている。
`git show 1994b51:plugins/claude-user-communication/skills/html-communication/references/patterns/responsibility-boundary/style.css` で読める。

> 情報源: 各記法の公式ドキュメント（2026-08-18 調査）<br>
> [Notation](https://c4model.com/diagrams/notation) と
> [Groups](https://docs.structurizr.com/dsl/cookbook/groups/)（C4 / Structurizr）、
> [UML 2.5.1](https://www.omg.org/spec/UML/2.5.1/)、
> [ArchiMate Reference Cards](https://www.opengroup.org/sites/default/files/docs/downloads/n221p.pdf)、
> [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) の配布 PPTX、
> [Design diagrams](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/design-diagrams)（Azure）、
> [Threat Modeling Tool](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-getting-started)（Microsoft）。
> アクセシビリティは [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)、
> [HTML-AAM](https://www.w3.org/TR/html-aam-1.0/)、
> [Complex Images](https://www.w3.org/WAI/tutorials/images/complex/)（W3C WAI）。
