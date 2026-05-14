'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const jsonTreeUtils = require('@zag-js/json-tree-utils');

const JsonTreeViewKeyNode = (props) => {
  const { node, showQuotes } = props;
  const key = jsonTreeUtils.keyPathToKey(node.keyPath);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { "data-kind": "key", suppressHydrationWarning: true, "data-non-enumerable": node.isNonEnumerable ? "" : void 0, children: showQuotes ? `"${key}"` : key }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { "data-kind": "colon", children: ": " })
  ] });
};

exports.JsonTreeViewKeyNode = JsonTreeViewKeyNode;
