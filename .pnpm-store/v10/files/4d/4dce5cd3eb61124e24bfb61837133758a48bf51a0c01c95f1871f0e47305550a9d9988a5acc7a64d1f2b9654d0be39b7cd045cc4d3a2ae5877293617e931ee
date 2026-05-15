"use strict";
import { isString } from './is.js';

const cx = (...classNames) => {
  const classes = [];
  for (let i = 0; i < classNames.length; i++) {
    const className = classNames[i];
    if (!isString(className)) continue;
    const trimmed = className.trim();
    if (trimmed) classes.push(trimmed);
  }
  return classes.join(" ");
};

export { cx };
