'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { TreeViewTree } from '../tree-view/tree-view-tree.js';
import { useTreeViewContext } from '../tree-view/use-tree-view-context.js';
import { JsonTreeViewNode } from './json-tree-view-node.js';

const splitTreeNodeProps = createSplitProps();
const JsonTreeViewTree = forwardRef((props, ref) => {
  const [nodeProps, treeProps] = splitTreeNodeProps(props, ["arrow", "indentGuide", "renderValue"]);
  const tree = useTreeViewContext();
  const children = tree.collection.getNodeChildren(tree.collection.rootNode);
  return /* @__PURE__ */ jsx(TreeViewTree, { "data-scope": "json-tree-view", ...treeProps, ref, children: children.map((child, index) => /* @__PURE__ */ jsx(JsonTreeViewNode, { node: child, indexPath: [index], ...nodeProps }, index)) });
});
JsonTreeViewTree.displayName = "JsonTreeViewTree";

export { JsonTreeViewTree };
