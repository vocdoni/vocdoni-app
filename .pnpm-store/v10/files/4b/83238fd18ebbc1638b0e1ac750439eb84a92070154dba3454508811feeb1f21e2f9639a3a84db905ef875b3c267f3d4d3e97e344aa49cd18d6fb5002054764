"use strict";
'use strict';

const uniq = (...items) => {
  const set = items.reduce((acc, curr) => {
    if (curr != null) curr.forEach((item) => acc.add(item));
    return acc;
  }, /* @__PURE__ */ new Set([]));
  return Array.from(set);
};

exports.uniq = uniq;
