// textlint custom rule: detect abstract-noun chains linked by の (nominalization).
// Fires when a chain of >=minNouns nouns joined by 連体化「の」 contains
// >=minSahen サ変接続 nouns (verbs turned into nouns).
const { getTokenizer } = require("kuromojin");

module.exports = function (context, options = {}) {
  const { Syntax, RuleError, report, getSource } = context;
  const minNouns = options.minNouns || 3;
  const minSahen = options.minSahen || 2;
  return {
    [Syntax.Str](node) {
      const text = getSource(node);
      return getTokenizer().then((tokenizer) => {
        const t = tokenizer.tokenize(text);
        for (let i = 0; i < t.length; i++) {
          if (t[i].pos !== "名詞") continue;
          const chain = [t[i]];
          let j = i + 1;
          while (
            j + 1 < t.length &&
            t[j].pos === "助詞" && t[j].pos_detail_1 === "連体化" &&
            t[j + 1].pos === "名詞"
          ) {
            let k = j + 1;
            while (k + 1 < t.length && t[k + 1].pos === "名詞") k++;
            chain.push(t[k]);
            j = k + 1;
          }
          if (chain.length >= minNouns) {
            const sahen = chain.filter((x) => x.pos_detail_1 === "サ変接続").length;
            if (sahen >= minSahen) {
              const phrase = chain.map((x) => x.surface_form).join("の");
              report(node, new RuleError(
                `「${phrase}」は名詞構文です。動作主と動詞で書き直してください。`,
                { index: t[i].word_position - 1 }
              ));
            }
          }
          i = j - 1;
        }
        // signal B: sentence whose predicate is ある/なる, has no を-object,
        // and stacks >=2 bare sahen nouns => agentless, verbless sentence.
        const bare = t.filter((x, idx) =>
          x.pos === "名詞" && x.pos_detail_1 === "サ変接続" &&
          /^[一-鿿]+$/.test(x.surface_form) &&
          !(t[idx + 1] && ((t[idx + 1].pos === "動詞" && ["する", "できる", "なる"].includes(t[idx + 1].basic_form)) ||
            (t[idx + 1].pos === "名詞" && t[idx + 1].pos_detail_1 === "サ変接続"))));
        const verbs = t.filter((x) => x.pos === "動詞" && x.pos_detail_1 === "自立");
        const last = verbs.length ? verbs[verbs.length - 1].basic_form : null;
        const hasWo = t.some((x) => x.pos === "助詞" && x.surface_form === "を");
        if (["ある", "なる", "いる"].includes(last) && !hasWo && bare.length >= 4) {
          report(node, new RuleError(
            `動作主のない述語「${last}」に名詞（${bare.map((x) => x.surface_form).join("、")}）が積まれています。動詞で書き直してください。`,
            { index: 0 }
          ));
        }
      });
    },
  };
};
