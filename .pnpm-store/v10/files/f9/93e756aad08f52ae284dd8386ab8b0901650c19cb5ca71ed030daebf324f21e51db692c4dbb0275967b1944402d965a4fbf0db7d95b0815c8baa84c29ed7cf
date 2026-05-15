'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const jsonTreeUtils = require('@zag-js/json-tree-utils');
const react = require('react');
const treeViewBranch = require('../tree-view/tree-view-branch.cjs');
const treeViewBranchContent = require('../tree-view/tree-view-branch-content.cjs');
const treeViewBranchControl = require('../tree-view/tree-view-branch-control.cjs');
const treeViewBranchIndentGuide = require('../tree-view/tree-view-branch-indent-guide.cjs');
const treeViewBranchIndicator = require('../tree-view/tree-view-branch-indicator.cjs');
const treeViewBranchText = require('../tree-view/tree-view-branch-text.cjs');
const treeViewItem = require('../tree-view/tree-view-item.cjs');
const treeViewItemText = require('../tree-view/tree-view-item-text.cjs');
const treeViewNodeProvider = require('../tree-view/tree-view-node-provider.cjs');
const useTreeViewContext = require('../tree-view/use-tree-view-context.cjs');
const jsonTreeViewKeyNode = require('./json-tree-view-key-node.cjs');
const jsonTreeViewPropsContext = require('./json-tree-view-props-context.cjs');
const jsonTreeViewValueNode = require('./json-tree-view-value-node.cjs');

const scopeProps = {
  "data-scope": "json-tree-view"
};
function JsonTreeViewNode(props) {
  const { node, indexPath, arrow, indentGuide, renderValue } = props;
  const options = jsonTreeViewPropsContext.useJsonTreeViewPropsContext();
  const tree = useTreeViewContext.useTreeViewContext();
  const nodeState = tree.getNodeState({ node, indexPath });
  const key = jsonTreeUtils.keyPathToKey(node.keyPath, { excludeRoot: true });
  const valueNode = react.useMemo(() => jsonTreeUtils.jsonNodeToElement(node, options), [node, options]);
  const nodeProps = react.useMemo(() => {
    const desc = jsonTreeUtils.getAccessibleDescription(node);
    const line = indexPath.reduce((acc, curr) => acc + curr, 1);
    const lineLength = indexPath.length - 1;
    return {
      ...scopeProps,
      "aria-label": desc,
      "data-line": line,
      style: { ["--line-length"]: lineLength }
    };
  }, [indexPath, node]);
  return /* @__PURE__ */ jsxRuntime.jsx(treeViewNodeProvider.TreeViewNodeProvider, { node, indexPath, children: nodeState.isBranch ? /* @__PURE__ */ jsxRuntime.jsxs(treeViewBranch.TreeViewBranch, { ...scopeProps, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(treeViewBranchControl.TreeViewBranchControl, { ...nodeProps, children: [
      arrow && /* @__PURE__ */ jsxRuntime.jsx(treeViewBranchIndicator.TreeViewBranchIndicator, { ...scopeProps, children: arrow }),
      /* @__PURE__ */ jsxRuntime.jsxs(treeViewBranchText.TreeViewBranchText, { ...scopeProps, children: [
        key && /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewKeyNode.JsonTreeViewKeyNode, { node, showQuotes: options.quotesOnKeys }),
        /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewValueNode.JsonTreeViewValueNode, { node: valueNode, renderValue })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(treeViewBranchContent.TreeViewBranchContent, { ...scopeProps, children: [
      typeof indentGuide === "boolean" ? /* @__PURE__ */ jsxRuntime.jsx(treeViewBranchIndentGuide.TreeViewBranchIndentGuide, {}) : indentGuide,
      node.children?.map((child, index) => /* @__PURE__ */ jsxRuntime.jsx(JsonTreeViewNode, { ...props, node: child, indexPath: [...indexPath, index] }, index))
    ] })
  ] }) : /* @__PURE__ */ jsxRuntime.jsx(treeViewItem.TreeViewItem, { ...nodeProps, children: /* @__PURE__ */ jsxRuntime.jsxs(treeViewItemText.TreeViewItemText, { ...scopeProps, children: [
    key && /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewKeyNode.JsonTreeViewKeyNode, { node, showQuotes: options.quotesOnKeys }),
    /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewValueNode.JsonTreeViewValueNode, { node: valueNode, renderValue })
  ] }) }) });
}

exports.JsonTreeViewNode = JsonTreeViewNode;
