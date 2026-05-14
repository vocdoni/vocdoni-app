'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const treeViewTree = require('../tree-view/tree-view-tree.cjs');
const useTreeViewContext = require('../tree-view/use-tree-view-context.cjs');
const jsonTreeViewNode = require('./json-tree-view-node.cjs');

const splitTreeNodeProps = createSplitProps.createSplitProps();
const JsonTreeViewTree = react.forwardRef((props, ref) => {
  const [nodeProps, treeProps] = splitTreeNodeProps(props, ["arrow", "indentGuide", "renderValue"]);
  const tree = useTreeViewContext.useTreeViewContext();
  const children = tree.collection.getNodeChildren(tree.collection.rootNode);
  return /* @__PURE__ */ jsxRuntime.jsx(treeViewTree.TreeViewTree, { "data-scope": "json-tree-view", ...treeProps, ref, children: children.map((child, index) => /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewNode.JsonTreeViewNode, { node: child, indexPath: [index], ...nodeProps }, index)) });
});
JsonTreeViewTree.displayName = "JsonTreeViewTree";

exports.JsonTreeViewTree = JsonTreeViewTree;
