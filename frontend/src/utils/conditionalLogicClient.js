export function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true;
  const { logic = "AND", conditions = [] } = rules;
  if (!conditions || conditions.length === 0) return true;
  const evalCond = (cond) => {
    const v = answersSoFar?.[cond.questionKey];
    const op = cond.operator;
    const target = cond.value;
    if (v === undefined || v === null) {
      if (op === "notEquals") return v !== target;
      return false;
    }
    if (op === "equals") return v === target;
    if (op === "notEquals") return v !== target;
    if (op === "contains") {
      if (Array.isArray(v)) return v.includes(target);
      if (typeof v === "string") return v.indexOf(target) !== -1;
      return false;
    }
    return false;
  };
  const results = conditions.map(evalCond);
  return logic === "AND" ? results.every(Boolean) : results.some(Boolean);
}
