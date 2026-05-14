"use strict";
'use strict';

var is = require('./is.cjs');

const cx = (...classNames) => {
  const classes = [];
  for (let i = 0; i < classNames.length; i++) {
    const className = classNames[i];
    if (!is.isString(className)) continue;
    const trimmed = className.trim();
    if (trimmed) classes.push(trimmed);
  }
  return classes.join(" ");
};

exports.cx = cx;
