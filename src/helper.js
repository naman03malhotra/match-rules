// @flow

import { NO_RULES_PRESENT, messageMap } from "./constants";

export function debugTrace(value, trace, rule, sourceToCompare, typeOfMatch) {
  // assign value and trace message only to leaf nodes
  if (!Object.keys(trace).length) {
    trace.value = value;
    // call the corresponding message function for trace with source and rule
    trace.message = messageMap[typeOfMatch]
      ? messageMap[typeOfMatch](sourceToCompare, rule)
      : NO_RULES_PRESENT;
  }
}

export function handleResult(result, trace, debug) {
  // if debug mode is on, then return result and log trace
  if (debug) {
    console.log("Trace object from matchRules:", trace);
  }

  return result;
}
