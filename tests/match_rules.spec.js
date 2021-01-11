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
      age: (value, sourceObject) =>
        (value > 18 && value < 50 && sourceObject.country === "USA") ||
        sourceObject.show_ads === true,
    },
  };

  const RULE_WITH_ARRAY = {
    data: ["a", "b"],
  };

  const RULE_WITH_STRING = {
    user_profile: {
      name: "Cool Name",
    },
  };

  // rule as a function || create dynamic rule on the fly.
  // Ex - can be used when you want to show the edit option for a post only to the creator among multiple posts.
  const RULE_AS_FUNCTION = function (mainSource) {
    return {
      user_id: mainSource.user_id,
      some_feature: {
        can_edit: true,
      },
    };
  };

  const mainSource = {
    user_id: 123,
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
    country: "USA",
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

  it("should return true when all the conditions of a rule is met and it should execute recursive function only when object has it own property", () => {
    // this part cover the for--in branch of coverage, for--in also iterators over the inherited property on an object, to avoid that I have added a if condition in the code.
    MAIN_RULE.__proto__ = { protoMod: 1 };

    expect(matchRules(mainSource, MAIN_RULE)).toBe(true);
  });

  it("should return false when at most one of the condition is not met", () => {
    expect(matchRules(mainSource, MAIN_RULE_MOD)).toBe(false);
  });

  it("should return true when all the conditions are met while passing multiple rules and it should execute recursive function only when object has it own property", () => {
    // default 'and' operator is used to concatenate the results
    const MULTI_RULES = [MAIN_RULE, MAIN_RULE_TWO];

    // this part cover the for--in branch of coverage, for--in also iterators over the inherited property on an object, to avoid that I have added a if condition in the code.
    MULTI_RULES.__proto__ = { protoMod: 1 };

    expect(matchRules(mainSource, MULTI_RULES)).toBe(false);
  });
  it("should return false when at most one of the condition is not met while passing multiple rules", () => {
    expect(matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO])).toBe(false);
  });

  it('should return true when at least one RULE returns true while passing multiple rules compared with "or" operator', () => {
    expect(
      matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO], { operator: "or" })
    ).toBe(true);
  });

  it('should return false when all the RULEs returns false while passing multiple rules compared with "or" operator', () => {
    expect(
      matchRules(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO_MOD], {
        operator: "or",
      })
    ).toBe(false);
  });

  it("should return false when the value of the rule is missing in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: {},
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return false when the value of the rule is undefined in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: undefined,
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return false when the value of the rule is null in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: null,
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return false when the value of the rule is Array in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: ["a"],
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return false when the value of the rule is String in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: "abc",
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return false when the value of the rule is Number in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: 0,
    };

    expect(matchRules(modSource, MAIN_RULE_TWO)).toBe(false);
  });

  it("should return true when the dynamic rule is matched to the source object", () => {
    expect(matchRules(mainSource, RULE_AS_FUNCTION(mainSource))).toBe(true);
  });

  it("should execute function when encountered in the rule and pass the corresponding key of that level from the source object", () => {
    expect(matchRules(mainSource, RULE_WITH_FUNCTION)).toBe(true);
  });

  it("should execute the function with two parameters first being the key's value and second being the original source object", () => {
    const spyFn = jest.spyOn(RULE_WITH_FUNCTION.user_profile, "age");

    const result = matchRules(mainSource, RULE_WITH_FUNCTION);
    expect(spyFn).toBeCalledTimes(1);
    expect(spyFn).toBeCalledWith(mainSource.user_profile.age, mainSource);
    expect(result).toBe(true);

    spyFn.mockRestore();
  });

  it("should do string matching when the rule has a string value", () => {
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
