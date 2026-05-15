"use strict";
import { mapEntries } from '../utils/entries.js';
import { memo } from '../utils/memo.js';

const SPECIAL_KEY_REGEX = /^@|&|&$/;
const createConditions = (options) => {
  const { breakpoints, conditions: conds = {} } = options;
  const conditions = mapEntries(conds, (key, value) => [`_${key}`, value]);
  const values = Object.assign({}, conditions, breakpoints.conditions);
  function keys() {
    return Object.keys(values);
  }
  function has(key) {
    return keys().includes(key) || SPECIAL_KEY_REGEX.test(key) || key.startsWith("_");
  }
  const sort = memo((paths) => {
    return paths.filter((v) => v !== "base").sort((a, b) => {
      const aa = has(a);
      const bb = has(b);
      if (aa && !bb) return 1;
      if (!aa && bb) return -1;
      return 0;
    });
  });
  function expandAtRule(key) {
    if (!key.startsWith("@breakpoint")) return key;
    return breakpoints.getCondition(key.replace("@breakpoint ", ""));
  }
  function resolve(key) {
    return Reflect.get(values, key) || key;
  }
  return {
    keys,
    sort,
    has,
    resolve,
    breakpoints: breakpoints.keys(),
    expandAtRule
  };
};

export { createConditions };
