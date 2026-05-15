"use strict";
'use strict';

var is = require('../utils/is.cjs');
var walkObject = require('../utils/walk-object.cjs');

function createSerializeFn(options) {
  const { conditions, isValidProperty } = options;
  return function serialize(styles) {
    return walkObject.walkObject(styles, (value) => value, {
      getKey: (prop, value) => {
        if (!is.isObject(value)) return prop;
        if (!conditions.has(prop) && !isValidProperty(prop)) {
          return parseSelectors(prop).map((s) => {
            const selector = s.startsWith("&") ? s.slice(1) : s;
            return isTopLevelSelector(selector) ? `${selector} &` : `&${selector}`;
          }).join(", ");
        }
        return prop;
      }
    });
  };
}
function isTopLevelSelector(s) {
  const lower = s.toLowerCase();
  return lower.startsWith(":host-context") || lower.startsWith(":host") || lower.startsWith("::slotted");
}
function parseSelectors(selector) {
  const result = [];
  let parenCount = 0;
  let currentSelector = "";
  let inEscape = false;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "\\" && !inEscape) {
      inEscape = true;
      currentSelector += char;
      continue;
    }
    if (inEscape) {
      inEscape = false;
      currentSelector += char;
      continue;
    }
    if (char === "(") {
      parenCount++;
    } else if (char === ")") {
      parenCount--;
    }
    if (char === "," && parenCount === 0) {
      result.push(currentSelector.trim());
      currentSelector = "";
    } else {
      currentSelector += char;
    }
  }
  if (currentSelector) {
    result.push(currentSelector.trim());
  }
  return result;
}

exports.createSerializeFn = createSerializeFn;
