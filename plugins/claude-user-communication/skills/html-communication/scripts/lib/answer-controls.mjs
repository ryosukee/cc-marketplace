// 順位・数値の宣言、回答 payload、説明の条件参照を検査する。
export function numberGridIndex(value, spec) {
  if (typeof value !== "number" || !Number.isFinite(value) || !spec) return null;
  if (value < spec.min || value > spec.max) return null;
  const steps = (value - spec.min) / spec.step;
  if (!Number.isFinite(steps)) return null;
  const index = Math.round(steps);
  // 減算と除算の丸め誤差を、刻み数と原点の大きさに応じて許容する。
  // 刻み数が大きくても許容差を 1/8 刻みまでに制限し、半刻みを有効にしない。
  const scale = Math.max(1, Math.abs(steps), Math.abs(value / spec.step), Math.abs(spec.min / spec.step));
  const tolerance = Math.min(0.125, 4 * Number.EPSILON * scale);
  return Math.abs(steps - index) <= tolerance ? index : null;
}

export const validNumber = (value, spec) => numberGridIndex(value, spec) !== null;

export function validOrder(order, values) {
  return Array.isArray(order) && order.length === values.length
    && new Set(order).size === values.length && order.every((v) => typeof v === "string" && values.includes(v));
}

export function validateAnswerQuestion(q, where, { add, strings }) {
  if (q.type != null && !["rank", "number"].includes(q.type)) add(where, "type は rank か number。通常の選択では省く");
  if (q.type === "rank" || q.type === "number") {
    for (const key of ["multiple", "items"]) if (Object.hasOwn(q, key)) add(where, `${q.type} に ${key} は置かない`);
  }
  if (q.type === "rank") {
    if (!Array.isArray(q.options) || q.options.length < 2) add(where, "順位の options は二つ以上にする");
    if (q.options?.some?.((o) => o?.recommended != null)) add(where, "順位の選択肢に recommended は置かない");
  }
  if (q.type !== "number") {
    if (Object.hasOwn(q, "number")) add(where, "number は type: number にだけ書く");
    return;
  }
  if (Object.hasOwn(q, "options")) add(where, "数値の設問に options は置かない");
  const n = q.number;
  if (!n || typeof n !== "object" || Array.isArray(n)) { add(where, "number は { min, max, step, initial, unit? }"); return; }
  for (const key of Object.keys(n)) if (!["min", "max", "step", "initial", "unit"].includes(key)) add(where, `number に ${key} は使えない`);
  for (const key of ["min", "max", "step", "initial"]) if (typeof n[key] !== "number" || !Number.isFinite(n[key])) add(where, `${key} は有限の数値`);
  if (!(n.min < n.max)) add(where, "min は max より小さくする");
  if (!(n.step > 0) || !Number.isFinite((n.max - n.min) / n.step)) add(where, "step は正の有限数で、範囲内の刻み数も有限にする");
  if (!validNumber(n.max, n)) add(where, "max は min を起点に step で到達する値にする");
  if (!validNumber(n.initial, n)) add(where, "initial は範囲内で step に合う値にする");
  if (n.unit != null) {
    if (typeof n.unit !== "string" || !n.unit.trim()) add(where, "unit は空でない文字列");
    else {
      strings.push({ where: `${where}.number.unit`, text: n.unit });
      if (/\[\^|\[[^\]]+\]\(/.test(n.unit)) add(where, "unit にリンクや脚注参照は置けない。出典は判断材料に置く");
    }
  }
}

export function validateConditions(src, add, optionValue) {
  const questions = (Array.isArray(src.sections) ? src.sections : []).filter((s) => s?.kind === "question");
  const check = (w, where) => {
    if (src.type !== "form") add(where, "when は form の説明だけに書く");
    if (!w || typeof w !== "object" || Array.isArray(w)) { add(where, "when は { question, equals, item? }"); return; }
    for (const key of Object.keys(w)) if (!["question", "equals", "item"].includes(key)) add(where, `when に ${key} は使えない`);
    const match = typeof w.question === "string" && /^q([1-9][0-9]*)$/.exec(w.question);
    const q = match && questions[Number(match[1]) - 1]?.question;
    if (!q) { add(where, "question が設問の番号 q1 / q2 / … に一致しない"); return; }
    if (q.type === "rank") { add(where, "順位の設問は when の参照先に使えない"); return; }
    if (q.type === "number") {
      if (!validNumber(w.equals, q.number)) add(where, "equals は参照する数値の範囲と step に合う数値");
    } else if (typeof w.equals !== "string" || !q.options?.some?.((o) => o && optionValue(o) === w.equals)) add(where, "equals が参照する選択肢の値に一致しない");
    if (Array.isArray(q.items)) {
      if (!q.items.some((it) => it?.id === w.item)) add(where, "item が参照する設問の項目 ID に一致しない");
    } else if (Object.hasOwn(w, "item")) add(where, "item は項目別選択の参照にだけ書く");
  };
  const walk = (value, where) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach((v, i) => walk(v, `${where}[${i}]`)); return; }
    for (const [key, v] of Object.entries(value)) {
      if (key === "conditional" && v && typeof v === "object") check(v.when, `${where}.conditional.when`);
      if (key === "when" && !where.endsWith(".conditional") && !(value.kind === "explain" && /^sections\[\d+\]$/.test(where))) add(`${where}.when`, "when は説明節か conditional の中にだけ書く");
      walk(v, `${where}.${key}`);
    }
  };
  (Array.isArray(src.sections) ? src.sections : []).forEach((sec, i) => {
    if (!sec || !Object.hasOwn(sec, "when")) return;
    const where = `sections[${i}].when`;
    if (sec.kind !== "explain") add(where, "節の when は説明節にだけ書く。設問の省略には使わない");
    check(sec.when, where);
  });
  // answers の raw/notes へ条件構文を探しに行かない。
  for (const key of ["sections", "formIntro", "reference", "generation", "summary"]) walk(src[key], key);
}

export function validAnswerPayload(data, q, values) {
  if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length !== 1) return false;
  return q.type === "rank" ? Object.hasOwn(data, "order") && validOrder(data.order, values)
    : Object.hasOwn(data, "value") && validNumber(data.value, q.number);
}
