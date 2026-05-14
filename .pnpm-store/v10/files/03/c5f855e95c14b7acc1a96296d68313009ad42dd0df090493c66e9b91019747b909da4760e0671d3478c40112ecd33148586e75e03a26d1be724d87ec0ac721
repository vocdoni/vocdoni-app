"use strict";
import { transformFromAstSync } from '@babel/core';
import { parse } from '@babel/parser';
import transformTypescript from '@babel/plugin-transform-typescript';
import * as recast from 'recast';
import { pretty } from './pretty.js';

const PARSE_OPTIONS = {
  sourceType: "module",
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  startLine: 1,
  tokens: true,
  plugins: [
    "asyncGenerators",
    "bigInt",
    "classPrivateMethods",
    "classPrivateProperties",
    "classProperties",
    "classStaticBlock",
    "decimal",
    "decorators-legacy",
    "doExpressions",
    "dynamicImport",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    "functionBind",
    "functionSent",
    "importAssertions",
    "importMeta",
    "nullishCoalescingOperator",
    "numericSeparator",
    "objectRestSpread",
    "optionalCatchBinding",
    "optionalChaining",
    ["pipelineOperator", { proposal: "minimal" }],
    ["recordAndTuple", { syntaxType: "hash" }],
    "throwExpressions",
    "topLevelAwait",
    "v8intrinsic",
    "typescript",
    "jsx"
  ]
};
async function convertTsxToJsx(code) {
  const ast = recast.parse(code, {
    parser: {
      parse: (code2) => {
        return parse(code2, PARSE_OPTIONS);
      }
    }
  });
  const result = transformFromAstSync(ast, code, {
    cloneInputAst: false,
    plugins: [transformTypescript],
    retainLines: true
  });
  if (!result?.code) {
    throw new Error("Failed to transform code");
  }
  return await pretty(result.code, {
    parser: "babel",
    jsxSingleQuote: true,
    singleQuote: true,
    printWidth: 80
  });
}

export { convertTsxToJsx };
