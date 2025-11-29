import assert from "assert";
import { shouldShowQuestion } from "../src/utils/conditionalLogic.js";
console.log("Running conditionalLogic tests...");

// 1) No rules => should show
assert.strictEqual(shouldShowQuestion(null, {}), true, "null rules should return true");

// 2) AND logic - both conditions true
const rulesAnd = {
  logic: "AND",
  conditions: [
    { questionKey: "role", operator: "equals", value: "Engineer" },
    { questionKey: "exp", operator: "contains", value: "React" }
  ]
};
assert.strictEqual(
  shouldShowQuestion(rulesAnd, { role: "Engineer", exp: "React, Node" }),
  true,
  "AND: both true should return true"
);

// 3) AND logic - one false
assert.strictEqual(
  shouldShowQuestion(rulesAnd, { role: "Engineer", exp: "Vue, Node" }),
  false,
  "AND: one false should return false"
);

// 4) OR logic - one true
const rulesOr = {
  logic: "OR",
  conditions: [
    { questionKey: "city", operator: "equals", value: "Pune" },
    { questionKey: "dept", operator: "equals", value: "Sales" }
  ]
};
assert.strictEqual(
  shouldShowQuestion(rulesOr, { city: "Pune", dept: "Engineering" }),
  true,
  "OR: one true should return true"
);

// 5) contains operator with array (multi_select)
const rulesContains = {
  logic: "AND",
  conditions: [
    { questionKey: "skills", operator: "contains", value: "React" }
  ]
};
assert.strictEqual(
  shouldShowQuestion(rulesContains, { skills: ["Node", "React"] }),
  true,
  "contains should work for arrays"
);

// 6) notEquals operator
const rulesNotEq = {
  logic: "AND",
  conditions: [
    { questionKey: "level", operator: "notEquals", value: "Junior" }
  ]
};
assert.strictEqual(
  shouldShowQuestion(rulesNotEq, { level: "Senior" }),
  true,
  "notEquals when different should return true"
);

// 7) missing answer handling
const rulesMissing = {
  logic: "AND",
  conditions: [
    { questionKey: "someQ", operator: "equals", value: "X" }
  ]
};
assert.strictEqual(
  shouldShowQuestion(rulesMissing, {}),
  false,
  "missing answer should evaluate to false for equals"
);

console.log("All conditionalLogic tests passed ✅");
