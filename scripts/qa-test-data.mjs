import { requirements, scenarios, testCasesPart1 } from "./qa-test-data-part1.mjs";
import { testCasesPart2 } from "./qa-test-data-part2.mjs";
import { testCasesPart3 } from "./qa-test-data-part3.mjs";

export { requirements, scenarios };

export const testCases = [...testCasesPart1, ...testCasesPart2, ...testCasesPart3];

const reqMap = Object.fromEntries(requirements.map((r) => [r.id, r.name]));

export const traceability = testCases.map((tc) => ({
  reqId: tc.reqId,
  reqName: reqMap[tc.reqId] ?? tc.reqId,
  scenarioId: tc.scenarioId,
  testCaseId: tc.id,
  priority: tc.priority,
}));
