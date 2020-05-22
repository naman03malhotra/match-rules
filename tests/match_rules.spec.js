import matchRules from "../src/match_rules";
import { NO_SOURCE_PASSED_ERR, NO_ARRAY_ERROR } from "../src/constants";

describe("Test matchRules", () => {
  const MAIN_RULE = {
    some_condition: true,
    some_feature: {
      can_edit: true,
    },
  };

  const MAIN_RULE_TWO = {
    some_feature: {
      can_send: true,
    },
  };

  const MAIN_RULE_MOD = {
    ...MAIN_RULE,
    some_condition: false,
  };

  const MAIN_RULE_TWO_MOD = {
    ...MAIN_RULE_TWO,
    some_feature: {
      ...MAIN_RULE_TWO.some_feature,
      can_send: false,
    },
  };

  const RULE_WITH_FUNCTION = {
    user_profile: {
      age: (value) => value > 18 && value < 50,
    },
  };

  const RULE_WITH_ARRAY = {
    data: ["a", "b"],
  };

  const mainSource = {
    user_profile: {
      age: 22,
      name: "Cool Name",
    },
    some_condition: true,
    some_feature: {
      can_edit: true,
      can_send: true,
      can_delete: false,
    },
  };

  beforeEach(() => {
    global.console = { log: jest.fn() };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should throw error with proper message when either source or rules are missing", () => {
    expect(matchRules).toThrow(Error, NO_SOURCE_PASSED_ERR);
  });

  it("should throw an error with proper message when an array is passed in the rules", () => {
    const matchRuleWithArray = () => matchRules(mainSource, RULE_WITH_ARRAY);
    expect(matchRuleWithArray).toThrow(Error, NO_ARRAY_ERROR);
  });

  it("should return true when all the conditions of a rule is met", () => {
    expect(matchRules(mainSource, MAIN_RULE)).toBe(true);
  });

  it("should return false when atmost one of the condition is not met", () => {
    expect(matchRules(mainSource, MAIN_RULE_MOD)).toBe(false);
  });

  it("should return true when all the conditions are met while passing multiple rules", () => {
    // default 'and' operator is used to concatinate the results
    expect(matchRules(mainSource, [MAIN_RULE, MAIN_RULE_TWO])).toBe(true);
  });
  it("should return false when atmost one of the condition is not met while passing multiple rules", () => {
    expect(matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO])).toBe(false);
  });

  it('should return true when atleast one RULE returns true while passing multuple rules compared with "or" operator', () => {
    expect(
      matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO], { operator: "or" })
    ).toBe(true);
  });

  it('should return false when all the RULEs returns false while passing multuple rules compared with "or" operator', () => {
    expect(
      matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO_MOD], {
        operator: "or",
      })
    ).toBe(false);
  });

  it("should return false when the value of the rule is missing/undefined in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: {},
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should execute function when encountered in the rule and pass the corresponding key of that level from the source object", () => {
    expect(matchRules(mainSource, RULE_WITH_FUNCTION)).toBe(true);
  });

  it("should do string matching when the rule has a string value", () => {
    const RULE_WITH_STRING = {
      user_profile: {
        name: "Cool Name",
      },
    };

    expect(matchRules(mainSource, RULE_WITH_STRING)).toBe(true);
  });

  it("should log the trace object when debug is true", () => {
    matchRules(mainSource, [MAIN_RULE, MAIN_RULE_TWO, RULE_WITH_FUNCTION], {
      debug: true,
    });

    expect(console.log).toBeCalled();
    expect(console.log.mock.calls[0]).toMatchSnapshot();
  });

  it("should log the trace object with no rule message when no key is passed in rule object and debug is true", () => {
    matchRules(mainSource, {}, { debug: true });

    expect(console.log).toBeCalled();
    expect(console.log.mock.calls[0]).toMatchSnapshot();
  });
});
