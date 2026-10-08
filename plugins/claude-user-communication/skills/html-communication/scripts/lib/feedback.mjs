// カードに結び付けた指示を受領する。本文中の自由記述や設問の回答とは分けて検査する。
import { richTargets } from "./rich-code.mjs";

export function feedbackFindings(records, src) {
  const errors = [];
  if (!Array.isArray(records)) return ["対象別提案は配列にする"];
  const targets = richTargets(src);
  const byKey = new Map(targets.map((t) => [JSON.stringify([t.tree, t.node]), t]));
  const seen = new Set();
  for (const record of records) {
    if (!record || typeof record !== "object" || Array.isArray(record)) { errors.push("対象別提案の項目はオブジェクト"); continue; }
    const keys = Object.keys(record);
    if (keys.some((k) => !["tree", "node", "action", "text", "affected"].includes(k))) errors.push("対象別提案に未知の欄がある");
    const key = JSON.stringify([record.tree, record.node]);
    const target = byKey.get(key);
    if (!target) { errors.push("対象別提案のカードが生成元にない"); continue; }
    if (seen.has(key)) errors.push("同じカードへの対象別提案が重複している");
    seen.add(key);
    if (typeof record.text !== "string") errors.push("対象別提案の text は文字列");
    if (record.action === "reject") {
      if (target.interaction !== "reject" || target.status === "existing") errors.push("このカードは棄却の対象ではない");
      if (record.affected != null) {
        const descendants = targets.filter((t) => {
          if (t.tree !== target.tree) return false;
          let parent = t.parent;
          while (parent) {
            if (parent === target.node) return true;
            parent = byKey.get(JSON.stringify([t.tree, parent]))?.parent;
          }
          return false;
        }).map((t) => t.node);
        if (!Array.isArray(record.affected) || record.affected.length !== descendants.length ||
            new Set(record.affected).size !== record.affected.length || record.affected.some((id) => !descendants.includes(id))) {
          errors.push("棄却の affected が生成元の配下と一致しない");
        }
      }
    } else {
      const action = target.status === "existing" ? "change" : "revise";
      if (target.interaction !== "propose" || record.action !== action) errors.push("対象別提案の action がカードの種類と一致しない");
      if (typeof record.text === "string" && !record.text.trim()) errors.push("修正提案と変更提案には指示を書く");
      if (record.affected != null) errors.push("自由記述の提案に affected は使わない");
    }
  }
  return errors;
}
