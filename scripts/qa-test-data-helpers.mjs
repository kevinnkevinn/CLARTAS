export function tc(id, scenarioId, reqId, module, priority, type, title, prerequisites, input, steps, expected, postConditions = "") {
  return { id, scenarioId, reqId, module, priority, type, title, prerequisites, input, steps, expected, postConditions };
}
