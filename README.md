# match-rules

A tiny (1kB GZipped) zero dependency JavaScript utility that lets you write your conditional business logic in a declarative way (React like).

It can be used with feature flags, complex conditions, conditional rendering, and the rest is your imagination.

_**I wrote a [detailed blog post](https://dev.to/naman03malhotra/declaring-your-business-logic-like-react-9d9), please do read it to understand the thought process in depth (5 mins tops).**_

### Install

[![Build Status](https://github.com/naman03malhotra/match-rules/workflows/CI/badge.svg?branch=master)](https://github.com/naman03malhotra/match-rules/actions)
[![Build Status](https://github.com/naman03malhotra/match-rules/workflows/CD/badge.svg?branch=v1.3.8)](https://github.com/naman03malhotra/match-rules/actions)
[![Coverage Status](https://coveralls.io/repos/github/naman03malhotra/match-rules/badge.svg?branch=master&kill_cache=1)](https://coveralls.io/github/naman03malhotra/match-rules?branch=master&kill_cache=1)
[![npm](https://img.shields.io/npm/dm/match-rules)](https://www.npmjs.com/package/match-rules)
![npm](https://img.shields.io/npm/dt/match-rules)
![NPM](https://img.shields.io/npm/l/match-rules)
[![npm](https://img.shields.io/npm/v/match-rules)](https://www.npmjs.com/package/match-rules)
[![DeepScan grade](https://deepscan.io/api/teams/11791/projects/14725/branches/280135/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=11791&pid=14725&bid=280135)

[![npm bundle size](https://img.shields.io/bundlephobia/minzip/match-rules?label=GZipped&style=for-the-badge)](https://bundlephobia.com/result?p=match-rules)

Through Yarn
`yarn add match-rules`

Through npm
`npm install match-rules --save`

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
  options // (optional)
);

const options = {
  operator: "and", // (optional, default: 'and') in case of multiple rules you can pass 'and' or 'or'. In case of 'or' your rules will be compared with 'or' operator. Default is 'and'
  debug: true, // (optional, default: false) when debug is true, it logs a trace object which will tell you which rule failed and with what values of source and rules object.
};

// NOTE: all the rules inside a single rule are concatenated by 'and' operator.
```

### Live Playground

[Live Example on Stackblitz](https://stackblitz.com/edit/match-rules)

### Server Side

This module can be used with Node as well.

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

### Why would you want to use it in your projects.

- Reduces cognitive complexity.

- Easy to maintain, declarative in nature.

- Code is more readable, you can separate conditional logic in a `rules.js` file.

- You do not have to write unit tests for those conditions individually, just take a snapshot at max.

- Reduce code redundancy (you can compose and extend rules).

- You do not have to traverse nested objects, just write your rules with the same structure.

- Any conditional (complex) case can be handled using a function.

- Easily manage your AB testing logic.

### Function Support:

#### So far it is capable to handle any condition since you can write your own functions in the rule.

when it encounters a function it passes the value (as the first parameter) and original source object (as the second parameter) from the source to that function matching the corresponding key of that level.

Using a combination of key's value and original source object you can handle complex conditions.

For example:

```js
const SHOW_ADS_RULES = {
  profile: {
    age: (value, sourceObject) =>
      value > 18 && value < 55 && sourceObject.admin === true,
  },
};

const source = {
  profile: {
    age: 20,
  },
  admin: true,
};

// so value of 20 (First param) and complete source object (Second Param) will be passed to that function.
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
import matchRules from "match-rules";

// this object can come from your app state
const sourceObject = {
  enable_unique_feature: true,
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
if (
  matchRules(sourceObject, [
    ENABLE_UNIQUE_FEATURE,
    ENABLE_UNIQUE_FEATURE_WITH_AGE_18YO,
  ])
) {
  // render unique feature
}
```

**Ex 3. Multiple Rules using OR operator**

```js
import matchRules from "match-rules";

// this object can come from your app state
const sourceObject = {
  enable_unique_feature: true,
  profile: {
    age: 18,
    country: "US",
  },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US = {
  profile: {
    country: "US",
  },
};

const ENABLE_UNIQUE_FEATURE_FOR_INDIA = {
  profile: {
    country: "IN",
  },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if (
  matchRules(
    sourceObject,
    [ENABLE_UNIQUE_FEATURE_FOR_US, ENABLE_UNIQUE_FEATURE_FOR_INDIA],
    { operator: "or" }
  )
) {
  // render unique feature
}

// you can pass as many rules you want
```

**Ex 4. using functions**

```js
import matchRules from "match-rules";

// this object can come from your app state
const sourceObject = {
  enable_unique_feature: true,
  profile: {
    age: 18,
    country: "US",
  },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA = {
  profile: {
    country: (value, sourceObject) => value === "US" || value === "IN",
  },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if (matchRules(sourceObject, ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA)) {
  // render unique feature
}

// you can use functions to deal with complex scenarios
```

**Ex 5. Rule for deep source objects**

```js
import matchRules from "match-rules";

// this object can come from your app state
const sourceObject = {
  enable_unique_feature: true,
  userData: {
    personalData: {
      profile: {
        age: 18,
        country: "US",
      },
    },
  },
};

// Rules
const ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA = {
  userData: {
    personalData: {
      profile: {
        country: (value, sourceObject) => value === "US" || value === "IN",
      },
    },
  },
};

// to combine rules using OR, (display feature if user is from US or INDIA)
if (matchRules(sourceObject, ENABLE_UNIQUE_FEATURE_FOR_US_OR_INDIA)) {
  // render unique feature
}
// you can use functions to deal with complex scenarios
```

**Ex 6. Dynamic Rules | RULES as functions**

```js
// example where you have to match the dynamically generated rule
const dataFromServer = {
  user_id: 123, // created by user
  item_id: '87df83b',
  item_type: 'Post'
}

const userSource = {
  id: 123,
}

const DYNAMIC_USER_RULE = (itemCreatedByUserParam) => {
  return {
    id: itemCreatedByUserParam.user_id,
  }
}

if(matchRules(userSource, DYNAMIC_USER_RULE(dataFromServer)) {
 // show edit option to creator of this post
}
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

For development, please make the changes in the code and write appropriate unit test case.
Feel free to send across a Pull Request if it doesn't fit your use-case.

## Zero dependency library

`match-rules` does not have any dependency, it is just 1kB (GZipped) in size.
