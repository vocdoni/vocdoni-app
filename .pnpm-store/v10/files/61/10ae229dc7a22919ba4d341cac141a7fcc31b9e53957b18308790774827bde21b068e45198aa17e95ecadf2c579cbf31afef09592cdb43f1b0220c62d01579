"use strict";
'use strict';

var clone = require('../utils/clone.cjs');
var merge = require('../utils/merge.cjs');
var walkObject = require('../utils/walk-object.cjs');

const tokenKeys = ["value", "type", "description"];
const isValidToken = (token) => {
  return token && typeof token === "object" && !Array.isArray(token);
};
const mergeConfigs = (...configs) => {
  const merged = merge.mergeWith({}, ...configs.map(clone.clone));
  if (merged.theme?.tokens) {
    walkObject.walkObject(
      merged.theme.tokens,
      (value) => {
        const keys = Object.keys(value);
        const nestedKeys = keys.filter((k) => !tokenKeys.includes(k));
        const hasNested = nestedKeys.length > 0;
        const hasTokenProps = tokenKeys.some((k) => value[k] != null);
        if (hasNested && hasTokenProps) {
          value.DEFAULT || (value.DEFAULT = {});
          tokenKeys.forEach((key) => {
            var _a;
            if (value[key] == null) return;
            (_a = value.DEFAULT)[key] || (_a[key] = value[key]);
            delete value[key];
          });
        }
        return value;
      },
      {
        stop(value) {
          return isValidToken(value) && Object.keys(value).some(
            (k) => tokenKeys.includes(k) || k !== k.toLowerCase() && k !== k.toUpperCase()
          );
        }
      }
    );
  }
  return merged;
};

exports.mergeConfigs = mergeConfigs;
