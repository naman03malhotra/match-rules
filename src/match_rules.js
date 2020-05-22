//@flow

import { debugTrace, handleResult } from "./helper";

import { NO_SOURCE_PASSED_ERR, NO_ARRAY_ERROR } from "./constants";

function recursiveRuleUtil(
  sourceToCompare,
  rule,
  trace,
  originalSource,
  debug
) {
  // initializing result with true as rules inside a single object are always compared with AND
  let result = true;
  // type of match for debugging
  let typeOfMatch;

  const isPrimitiveType =
    Object.prototype.toString.call(rule) !== "[object Object]";

  if (typeof rule === "function") {
    result = rule(sourceToCompare, originalSource);
    typeOfMatch = "function";
  } else if (Array.isArray(rule)) {
    throw new Error(NO_ARRAY_ERROR);
  } else if (isPrimitiveType) {
    result = rule === sourceToCompare;
    typeOfMatch = "primitive";
  } else {
    for (const currentDeepKey in rule) {
      if (rule.hasOwnProperty(currentDeepKey)) {
        trace[currentDeepKey] = {};
        result = recursiveRuleUtil(
          sourceToCompare[currentDeepKey],
          rule[currentDeepKey],
          trace[currentDeepKey],
          originalSource,
          debug
        );

        if (!result) break;
      }
    }
  }

  debug && debugTrace(result, trace, rule, sourceToCompare, typeOfMatch);
  return result;
}

function matchRules(source, rules, options = {}) {
  const trace = {};
  const { operator = "and", debug = false } = options;

  if (!source || !rules) {
    throw new Error(NO_SOURCE_PASSED_ERR);
  }

  // initial value for result to concatinate outputs from other rules
  let result = operator === "and" ? true : false;

  // condition to handle if a single role is passed
  rules = Array.isArray(rules) ? rules : [rules];

  // outer loop to iterate multiple rules
  for (const rule in rules) {
    if (rules.hasOwnProperty(rule)) {
      // initializing empty trace object with key of first rule
      trace[rule] = {};

      // update and compare with true if the operator is AND, with false if the operator is OR
      result =
        operator === "and"
          ? result &&
            recursiveRuleUtil(source, rules[rule], trace[rule], source, debug)
          : result ||
            recursiveRuleUtil(source, rules[rule], trace[rule], source, debug);

      /**
       * return result if the first negative case is encountered in case of AND
       * return result if the first positive case is encountered in case of OR
       */
      if (operator === "and" ? !result : result) {
        break;
      }
    }
  }

  // this condition will hit when all the rules will be matched in case of AND, and no rules being matched in case of OR
  return handleResult(result, trace, debug);
}

export default matchRules;
