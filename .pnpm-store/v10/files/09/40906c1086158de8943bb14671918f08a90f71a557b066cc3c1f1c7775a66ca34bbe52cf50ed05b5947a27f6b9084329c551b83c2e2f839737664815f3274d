"use strict";
"use client";
import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import { TreeView, useTreeViewContext } from '@ark-ui/react';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';

const {
  withProvider,
  withContext,
  useStyles: useTreeViewStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "treeView" });
const TreeViewRootProvider = withProvider(TreeView.RootProvider, "root", { forwardAsChild: true });
const TreeViewRoot = withProvider(
  TreeView.Root,
  "root",
  { forwardAsChild: true }
);
const TreeViewPropsProvider = PropsProvider;
const TreeViewBranch = withContext(
  TreeView.Branch,
  "branch",
  { forwardAsChild: true }
);
const TreeViewBranchContent = withContext(TreeView.BranchContent, "branchContent", { forwardAsChild: true });
const TreeViewBranchControl = withContext(TreeView.BranchControl, "branchControl", { forwardAsChild: true });
const TreeViewBranchTrigger = withContext(TreeView.BranchTrigger, "branchTrigger", { forwardAsChild: true });
const TreeViewBranchIndicator = withContext(TreeView.BranchIndicator, "branchIndicator", { forwardAsChild: true });
const TreeViewBranchText = withContext(TreeView.BranchText, "branchText", { forwardAsChild: true });
const TreeViewBranchIndentGuide = withContext(TreeView.BranchIndentGuide, "branchIndentGuide", { forwardAsChild: true });
const TreeViewItem = withContext(
  TreeView.Item,
  "item",
  { forwardAsChild: true }
);
const TreeViewItemIndicator = withContext(TreeView.ItemIndicator, "itemIndicator", { forwardAsChild: true });
const TreeViewItemText = withContext(TreeView.ItemText, "itemText", { forwardAsChild: true });
const TreeViewLabel = withContext(
  TreeView.Label,
  "label",
  { forwardAsChild: true }
);
const TreeViewTree = withContext(
  TreeView.Tree,
  "tree",
  { forwardAsChild: true }
);
const TreeViewNodeCheckbox = withContext(TreeView.NodeCheckbox, "nodeCheckbox", { forwardAsChild: true });
function TreeViewNode(props) {
  const { render, indentGuide, branchProps, branchContentProps } = props;
  const tree = useTreeViewContext();
  const renderNode = (node, indexPath) => /* @__PURE__ */ jsx(
    TreeView.NodeProvider,
    {
      node,
      indexPath,
      children: /* @__PURE__ */ jsx(TreeView.NodeContext, { children: (nodeState) => {
        if (nodeState.isBranch) {
          return /* @__PURE__ */ jsxs(TreeViewBranch, { ...branchProps, children: [
            render({ node, indexPath, nodeState }),
            /* @__PURE__ */ jsxs(TreeViewBranchContent, { ...branchContentProps, children: [
              indentGuide,
              tree.collection.getNodeChildren(node).map(
                (child, index) => renderNode(child, [...indexPath, index])
              )
            ] })
          ] });
        } else {
          return render({ node, indexPath, nodeState });
        }
      } })
    },
    indexPath.join(".")
  );
  return /* @__PURE__ */ jsx(Fragment, { children: tree.collection.getNodeChildren(tree.collection.rootNode).map((node, index) => renderNode(node, [index])) });
}

export { TreeViewBranch, TreeViewBranchContent, TreeViewBranchControl, TreeViewBranchIndentGuide, TreeViewBranchIndicator, TreeViewBranchText, TreeViewBranchTrigger, TreeViewItem, TreeViewItemIndicator, TreeViewItemText, TreeViewLabel, TreeViewNode, TreeViewNodeCheckbox, TreeViewPropsProvider, TreeViewRoot, TreeViewRootProvider, TreeViewTree, useTreeViewStyles };
