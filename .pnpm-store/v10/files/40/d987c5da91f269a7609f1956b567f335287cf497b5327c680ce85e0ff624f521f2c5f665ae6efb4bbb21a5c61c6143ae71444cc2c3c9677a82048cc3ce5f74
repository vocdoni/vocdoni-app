'use client';
import { jsx, jsxs } from 'react/jsx-runtime';
import { keyPathToKey, jsonNodeToElement, getAccessibleDescription } from '@zag-js/json-tree-utils';
import { useMemo } from 'react';
import { TreeViewBranch } from '../tree-view/tree-view-branch.js';
import { TreeViewBranchContent } from '../tree-view/tree-view-branch-content.js';
import { TreeViewBranchControl } from '../tree-view/tree-view-branch-control.js';
import { TreeViewBranchIndentGuide } from '../tree-view/tree-view-branch-indent-guide.js';
import { TreeViewBranchIndicator } from '../tree-view/tree-view-branch-indicator.js';
import { TreeViewBranchText } from '../tree-view/tree-view-branch-text.js';
import { TreeViewItem } from '../tree-view/tree-view-item.js';
import { TreeViewItemText } from '../tree-view/tree-view-item-text.js';
import { TreeViewNodeProvider } from '../tree-view/tree-view-node-provider.js';
import { useTreeViewContext } from '../tree-view/use-tree-view-context.js';
import { JsonTreeViewKeyNode } from './json-tree-view-key-node.js';
import { useJsonTreeViewPropsContext } from './json-tree-view-props-context.js';
import { JsonTreeViewValueNode } from './json-tree-view-value-node.js';

const scopeProps = {
  "data-scope": "json-tree-view"
};
function JsonTreeViewNode(props) {
  const { node, indexPath, arrow, indentGuide, renderValue } = props;
  const options = useJsonTreeViewPropsContext();
  const tree = useTreeViewContext();
  const nodeState = tree.getNodeState({ node, indexPath });
  const key = keyPathToKey(node.keyPath, { excludeRoot: true });
  const valueNode = useMemo(() => jsonNodeToElement(node, options), [node, options]);
  const nodeProps = useMemo(() => {
    const desc = getAccessibleDescription(node);
    const line = indexPath.reduce((acc, curr) => acc + curr, 1);
    const lineLength = indexPath.length - 1;
    return {
      ...scopeProps,
      "aria-label": desc,
      "data-line": line,
      style: { ["--line-length"]: lineLength }
    };
  }, [indexPath, node]);
  return /* @__PURE__ */ jsx(TreeViewNodeProvider, { node, indexPath, children: nodeState.isBranch ? /* @__PURE__ */ jsxs(TreeViewBranch, { ...scopeProps, children: [
    /* @__PURE__ */ jsxs(TreeViewBranchControl, { ...nodeProps, children: [
      arrow && /* @__PURE__ */ jsx(TreeViewBranchIndicator, { ...scopeProps, children: arrow }),
      /* @__PURE__ */ jsxs(TreeViewBranchText, { ...scopeProps, children: [
        key && /* @__PURE__ */ jsx(JsonTreeViewKeyNode, { node, showQuotes: options.quotesOnKeys }),
        /* @__PURE__ */ jsx(JsonTreeViewValueNode, { node: valueNode, renderValue })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(TreeViewBranchContent, { ...scopeProps, children: [
      typeof indentGuide === "boolean" ? /* @__PURE__ */ jsx(TreeViewBranchIndentGuide, {}) : indentGuide,
      node.children?.map((child, index) => /* @__PURE__ */ jsx(JsonTreeViewNode, { ...props, node: child, indexPath: [...indexPath, index] }, index))
    ] })
  ] }) : /* @__PURE__ */ jsx(TreeViewItem, { ...nodeProps, children: /* @__PURE__ */ jsxs(TreeViewItemText, { ...scopeProps, children: [
    key && /* @__PURE__ */ jsx(JsonTreeViewKeyNode, { node, showQuotes: options.quotesOnKeys }),
    /* @__PURE__ */ jsx(JsonTreeViewValueNode, { node: valueNode, renderValue })
  ] }) }) });
}

export { JsonTreeViewNode };
