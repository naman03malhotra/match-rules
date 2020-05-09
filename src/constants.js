//@flow

export const NO_SOURCE_PASSED_ERR =
  "Please pass source and rules data: matchRules(source, rules)";
const FUNCTION_EXECUTED = (sourceToCompare) =>
  `Function was executed for the given rule with value: ${sourceToCompare} (type: ${typeof sourceToCompare})`;
const VALUE_EQUATED = (sourceToCompare, rule) =>
  `Value equated for the given rule, Rule data: ${rule} (type: ${typeof rule}), Source data: ${sourceToCompare} (type: ${typeof sourceToCompare})`;
export const NO_ARRAY_ERROR =
  "Rules should have an array, if your source contains array, please write a corresponding function in the rules";
export const NO_RULE_PRESENT = "No rule is present in the passed rule object";

// message map for different rule types
export const messageMap = {
  function: FUNCTION_EXECUTED,
  primitive: VALUE_EQUATED,
};
