"use strict";
import { format } from 'prettier';

function pretty(value, options = {}) {
  return format(value, {
    parser: "typescript",
    bracketSpacing: true,
    jsxSingleQuote: false,
    printWidth: 160,
    proseWrap: "always",
    semi: false,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "all",
    ...options
  });
}

export { pretty };
