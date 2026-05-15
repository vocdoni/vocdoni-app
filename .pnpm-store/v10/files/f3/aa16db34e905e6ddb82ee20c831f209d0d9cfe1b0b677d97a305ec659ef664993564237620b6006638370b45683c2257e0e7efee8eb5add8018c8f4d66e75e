"use strict";
import { clone } from '../utils/clone.js';
import { mergeWith } from '../utils/merge.js';
import { walkObject } from '../utils/walk-object.js';

const tokenKeys = ["value", "type", "description"];
const isValidToken = (token) => {
  return token && typeof token === "object" && !Array.isArray(token);
};
const mergeConfigs = (...configs) => {
  const merged = mergeWith({}, ...configs.map(clone));
  if (merged.theme?.tokens) {
    walkObject(
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

export { mergeConfigs };
