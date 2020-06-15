# match-rules

match-rules is javascript utility for conditional rendering (implementing business logic) of complex rules using rules and source object.

It can be used on feature flags, complex conditions, conditional rendering, etc.

### Install

[![Build Status](https://github.com/naman03malhotra/match-rules/workflows/CI/badge.svg?branch=master)](https://github.com/naman03malhotra/match-rules/actions)

[![Build Status](https://github.com/naman03malhotra/match-rules/workflows/CD/badge.svg?branch=master)](https://github.com/naman03malhotra/match-rules/actions)

[![Coverage Status](https://coveralls.io/repos/github/naman03malhotra/match-rules/badge.svg?branch=master)](https://coveralls.io/github/naman03malhotra/match-rules?branch=master)

Through npm
`npm install match-rules --save`

Through Yarn
`yarn add match-rules`

### Usage

ES6

```js
import matchRules from "match-rules";
```

ES5

```js
const matchRules = require("match-rules").default;
```

TypeScript

```js
import matchRules from "match-rules";
```

### API

```js
// returns a boolean value.
matchRules(
  sourceObject, // can be any object with data.
  RULES_OBJECT, // you can also pass multiple rules in an array [RULE_ONE, RULE_TWO],
  options, // (optional)
);

const options = {
  operator: 'and', // (optional, default: 'and') in case of multiple rules you can pass 'and' or 'or'. In case of 'or' your rules will be compared with 'or' operator. Default is 'and'
  debug: true, // (optional, default: false) when debug is true, it logs a trace object which will tell you which rule failed and with what values of source and rules object.
},

// NOTE: all the rules inside a single rule are concatinated by 'and' operator.
```

### Example (Usecase)

```js
// rules object
import matchRules from "match-rules";

const SHOW_JOB_RULE = {
  hasVisa: true,
  profile: {
    country: "US",
    yearsOfExperience: (exp, sourceObject) => exp > 3,
  },
};

// source object
const user = {
  username: "someName",
  hasVisa: true,
  profile: {
    country: "US",
    yearsOfExperience: 5,
    yearOfGraduation: 2011,
  },
};

// pass source and rules
if (matchRules(user, SHOW_JOB_RULE)) {
  //... do something conditionally.
}
```

### Features

- **Multiple rules support** - you can pass multiple rules dealing with a common source object.

- **Graceful exit** - returns false if the asked property in the rule doesn’t exist in the source object.

- **Debugging** - when enabled logs a trace object for all the keys in the rule with a meaningful message of what went wrong.

- **Function support** - you can pass custom functions in the rule for handling complex conditions.

- **Nested Rules** - you can pass a rule no matter how deep your data source is.

- **Multiple operator support** - you can pass or / and operators in case of multiple rules.
  Dillinger is a cloud-enabled, mobile-ready, offline-storage, AngularJS powered HTML5 Markdown editor.

### Function Support:

So far it is capable to handle any condition since you can write your own functions in the rule.

when it encounters a function it passes the value from the source and original source object to that function matching the corresponding key of that level.

For example:

```js
const SHOW_ADS_RULES = {
  profile: {
    age: (value, sourceObject) => value > 18 && value < 55,
  },
};

const source = {
  profile: {
    age: 20,
  },
};

// so value of 20 and whole source object will be passed to that function.
// NOTE: you should always return boolean value from the function you implement.
```

### Extending Rules (avoid redundancy)

```js
const SHOW_ADS_RULES = {
  onboarding: true,
  admin: false,
  profile: {
    country: "US",
    school: "MIT",
    age: (value) => value > 18 && value < 55,
  },
};

// show a different Ad if the country is India.
const SHOW_ADS_RULES_INDIA = {
  ...SHOW_ADS_RULES,
  profile: {
    ...SHOW_ADS_RULES.profile,
    country: "India",
  },
};
```

### More examples

**Ex 1. Feature Flags**

```js
import matchRules from "match-rules";

// this object can come from your app state
const sourceObject = {
  enable_unique_feature: true,
  when_user_is_admin: true,
  age_more_than_18: 25,
};

// Rule
const ENABLE_UNIQUE_FEATURE = {
  enable_unique_feature: true,
  when_user_is_admin: true,
  age_more_than_18: (value, sourceObject) => value > 18,
};

if (matchRules(sourceObject, ENABLE_UNIQUE_FEATURE)) {
  // render unique feature
}
```

**Ex 2. Multiple Rules and functions implementation**

```js
import matchRules from 'match-rules';

// this object can come from your app state
const sourceObject = {
    enable_unique_feature = true,
    profile: {
        age: 18,
    },
};

// Rules
const ENABLE_UNIQUE_FEATURE = {
    enable_unique_feature: true,
};

const ENABLE_UNIQUE_FEATURE_WITH_AGE_18YO = {
    profile: {
        age: (value, sourceObject) => value > 18,
    },
};

// by default multiple rules will be combined using AND operator
if(matchRules(sourceObject, [ENABLE_UNIQUE_FEATURE, ENABLE_UNIQUE_FEATURE_WITH_AGE_18YO])) {
    // render unique feature
}
```

**Ex 3. Multiple Rules using OR operator**

```js
import matchRules from 'match-rules';

// this object can come from your app state
const sourceObject = {
    enable_unique_feature = true,
    profile: {
        age: 18,
        country: 'US',
    },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US = {
    profile: {
        country: 'US',
    },
};

const ENABLE_UNIQUE_FEATURE_FOR_INDIA = {
    profile: {
        country: 'IN',
    },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if(matchRules(
    sourceObject,
    [ENABLE_UNIQUE_FEATURE_FOR_US, ENABLE_UNIQUE_FEATURE_FOR_INDIA],
    { operator: 'or'})) {
    // render unique feature
}

// you can pass as many rules you want
```

**Example 3 using functions**

```js
import matchRules from 'match-rules';

// this object can come from your app state
const sourceObject = {
    enable_unique_feature = true,
    profile: {
        age: 18,
        country: 'US',
    },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA = {
    profile: {
        country: (value, sourceObject) => value === 'US' || value === 'IN',
    },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if(matchRules(
    sourceObject,
    ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA)) {
    // render unique feature
}

// you can use functions to deal with complex scenarios
```

**Ex 4, Rule for deep source objects**

```js
import matchRules from 'match-rules';

// this object can come from your app state
const sourceObject = {
  enable_unique_feature = true,
  userData: {
    personalData: {
      profile: {
        age: 18,
        country: 'US',
      },
    },
  },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA = {
  userData: {
    personalData: {
      profile: {
        country: (value, sourceObject) => value === 'US' || value === 'IN',
      },
    },
  },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if(matchRules(
    sourceObject,
    ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA)) {
    // render unique feature
}

// you can use functions to deal with complex scenarios
```

## Debugging

when enabled logs a trace object for all the keys in the rule with a meaningful message of what went right and wrong.

```js
matchRules(sourceObject, RULES, { debug: true })

// sample trace object
{
  "0": {
    "company": {
      "enable_feature": {
        "enable_feature_for_user": {
          "value": true,
          "message": "Value equated for the given rule, Rule data: true (type: boolean), Source data: true (type: boolean)"
        }
      },
      "enable_people_management": {
        "value": true,
        "message": "Value equated for the given rule, Rule data: true (type: boolean), Source data: true (type: boolean)"
      }
    },
    "company_admin": {
      "value": true,
      "message": "Value equated for the given rule, Rule data: true (type: boolean), Source data: true (type: boolean)"
    },
    "enable_special_feature": {
      "value": true,
      "message": "Value equated for the given rule, Rule data: false (type: boolean), Source data: false (type: boolean)"
    },
    "temp": {
      "value": false,
      "message": "Function was executed for the given rule with value: 3 (type: number)"
    }
  }
}
```

## Development

For development, make the changes in the code and write appropriate unit test case.

### Live Example

[Live Example on Stackblitz](https://stackblitz.com/edit/match-rules)
