'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const useTreeViewNodeContext = require('./use-tree-view-node-context.cjs');

const TreeViewNodeCheckboxIndicator = (props) => {
  const { children, indeterminate, fallback } = props;
  const nodeState = useTreeViewNodeContext.useTreeViewNodeContext();
  const checkedState = nodeState.checked;
  if (checkedState === "indeterminate" && indeterminate) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: indeterminate });
  }
  if (checkedState === true && children) {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: fallback });
};
TreeViewNodeCheckboxIndicator.displayName = "TreeViewNodeCheckboxIndicator";

exports.TreeViewNodeCheckboxIndicator = TreeViewNodeCheckboxIndicator;
