"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('@ark-ui/react');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');

const {
  withProvider,
  withContext,
  useStyles: useTreeViewStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "treeView" });
const TreeViewRootProvider = withProvider(react.TreeView.RootProvider, "root", { forwardAsChild: true });
const TreeViewRoot = withProvider(
  react.TreeView.Root,
  "root",
  { forwardAsChild: true }
);
const TreeViewPropsProvider = PropsProvider;
const TreeViewBranch = withContext(
  react.TreeView.Branch,
  "branch",
  { forwardAsChild: true }
);
const TreeViewBranchContent = withContext(react.TreeView.BranchContent, "branchContent", { forwardAsChild: true });
const TreeViewBranchControl = withContext(react.TreeView.BranchControl, "branchControl", { forwardAsChild: true });
const TreeViewBranchTrigger = withContext(react.TreeView.BranchTrigger, "branchTrigger", { forwardAsChild: true });
const TreeViewBranchIndicator = withContext(react.TreeView.BranchIndicator, "branchIndicator", { forwardAsChild: true });
const TreeViewBranchText = withContext(react.TreeView.BranchText, "branchText", { forwardAsChild: true });
const TreeViewBranchIndentGuide = withContext(react.TreeView.BranchIndentGuide, "branchIndentGuide", { forwardAsChild: true });
const TreeViewItem = withContext(
  react.TreeView.Item,
  "item",
  { forwardAsChild: true }
);
const TreeViewItemIndicator = withContext(react.TreeView.ItemIndicator, "itemIndicator", { forwardAsChild: true });
const TreeViewItemText = withContext(react.TreeView.ItemText, "itemText", { forwardAsChild: true });
const TreeViewLabel = withContext(
  react.TreeView.Label,
  "label",
  { forwardAsChild: true }
);
const TreeViewTree = withContext(
  react.TreeView.Tree,
  "tree",
  { forwardAsChild: true }
);
const TreeViewNodeCheckbox = withContext(react.TreeView.NodeCheckbox, "nodeCheckbox", { forwardAsChild: true });
function TreeViewNode(props) {
  const { render, indentGuide, branchProps, branchContentProps } = props;
  const tree = react.useTreeViewContext();
  const renderNode = (node, indexPath) => /* @__PURE__ */ jsxRuntime.jsx(
    react.TreeView.NodeProvider,
    {
      node,
      indexPath,
      children: /* @__PURE__ */ jsxRuntime.jsx(react.TreeView.NodeContext, { children: (nodeState) => {
        if (nodeState.isBranch) {
          return /* @__PURE__ */ jsxRuntime.jsxs(TreeViewBranch, { ...branchProps, children: [
            render({ node, indexPath, nodeState }),
            /* @__PURE__ */ jsxRuntime.jsxs(TreeViewBranchContent, { ...branchContentProps, children: [
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
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: tree.collection.getNodeChildren(tree.collection.rootNode).map((node, index) => renderNode(node, [index])) });
}

exports.TreeViewBranch = TreeViewBranch;
exports.TreeViewBranchContent = TreeViewBranchContent;
exports.TreeViewBranchControl = TreeViewBranchControl;
exports.TreeViewBranchIndentGuide = TreeViewBranchIndentGuide;
exports.TreeViewBranchIndicator = TreeViewBranchIndicator;
exports.TreeViewBranchText = TreeViewBranchText;
exports.TreeViewBranchTrigger = TreeViewBranchTrigger;
exports.TreeViewItem = TreeViewItem;
exports.TreeViewItemIndicator = TreeViewItemIndicator;
exports.TreeViewItemText = TreeViewItemText;
exports.TreeViewLabel = TreeViewLabel;
exports.TreeViewNode = TreeViewNode;
exports.TreeViewNodeCheckbox = TreeViewNodeCheckbox;
exports.TreeViewPropsProvider = TreeViewPropsProvider;
exports.TreeViewRoot = TreeViewRoot;
exports.TreeViewRootProvider = TreeViewRootProvider;
exports.TreeViewTree = TreeViewTree;
exports.useTreeViewStyles = useTreeViewStyles;
