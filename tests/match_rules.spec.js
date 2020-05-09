import { matchRule, NO_SOURCE_PASSED_ERR, NO_ARRAY_ERROR } from "./match_rule";

describe("Test matchRule", () => {
  const sandbox = sinon.createSandbox();
  const consoleLogStub = sandbox.stub(console, "log");

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

  afterEach(() => {
    sandbox.reset();
  });

  afterAll(() => {
    sandbox.restore();
  });

  it("should throw error with proper message when either source or rules are missing", () => {
    expect(matchRule).to.throw(Error, NO_SOURCE_PASSED_ERR);
  });

  it("should throw an error with proper message when an array is passed in the rules", () => {
    const matchRuleWithArray = () => matchRule(mainSource, RULE_WITH_ARRAY);
    expect(matchRuleWithArray).to.throw(Error, NO_ARRAY_ERROR);
  });

  it("should return true when all the conditions of a rule is met", () => {
    expect(matchRule(mainSource, MAIN_RULE)).to.equal(true);
  });

  it("should return false when atmost one of the condition is not met", () => {
    expect(matchRule(mainSource, MAIN_RULE_MOD)).to.equals(false);
  });

  it("should return true when all the conditions are met while passing multiple rules", () => {
    // default 'and' operator is used to concatinate the results
    expect(matchRule(mainSource, [MAIN_RULE, MAIN_RULE_TWO])).to.equals(true);
  });
  it("should return false when atmost one of the condition is not met while passing multiple rules", () => {
    expect(matchRule(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO])).to.equals(
      false
    );
  });

  it('should return true when atleast one RULE returns true while passing multuple rules compared with "or" operator', () => {
    expect(
      matchRule(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO], { operator: "or" })
    ).to.equals(true);
  });

  it('should return false when all the RULEs returns false while passing multuple rules compared with "or" operator', () => {
    expect(
      matchRule(mainSource, [MAIN_RULE_MOD, MAIN_RULE_TWO_MOD], {
        operator: "or",
      })
    ).to.equals(false);
  });

  it("should return false when the value of the rule is missing/undefined in the source object (graceful exit)", () => {
    const modSource = {
      ...mainSource,
      some_feature: {},
    };

    expect(matchRule(modSource, MAIN_RULE_TWO)).to.equals(false);
  });

  it("should execute function when encountered in the rule and pass the corresponding key of that level from the source object", () => {
    expect(matchRule(mainSource, RULE_WITH_FUNCTION)).to.equals(true);
  });

  it("should do string matching when the rule has a string value", () => {
    const RULE_WITH_STRING = {
      user_profile: {
        name: "Cool Name",
      },
    };

    expect(matchRule(mainSource, RULE_WITH_STRING)).to.equals(true);
  });

  it("should log the trace object when debug is true", () => {
    matchRule(mainSource, [MAIN_RULE, MAIN_RULE_TWO, RULE_WITH_FUNCTION], {
      debug: true,
    });

    expect(consoleLogStub.calledOnce).to.equals(true);
    jestExpect(consoleLogStub.getCall(0).args).toMatchSnapshot();
  });

  it("should log the trace object with no rule message when no key is passed in rule object and debug is true", () => {
    matchRule(mainSource, {}, { debug: true });

    expect(consoleLogStub.calledOnce).to.equals(true);
    jestExpect(consoleLogStub.getCall(0).args).toMatchSnapshot();
  });
});
