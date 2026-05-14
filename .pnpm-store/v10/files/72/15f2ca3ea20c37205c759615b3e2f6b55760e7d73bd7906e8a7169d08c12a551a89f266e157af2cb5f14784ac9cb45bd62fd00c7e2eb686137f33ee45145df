'use client';
import { jsx } from 'react/jsx-runtime';
import { createSplitProps } from '../../utils/create-split-props.js';
import { useTreeViewContext } from './use-tree-view-context.js';
import { TreeViewNodeStateProvider } from './use-tree-view-node-context.js';
import { TreeViewNodePropsProvider } from './use-tree-view-node-props-context.js';

const splitNodeProps = createSplitProps();
function TreeViewNodeProvider(props) {
  const [nodeProps, localProps] = splitNodeProps(props, ["indexPath", "node"]);
  const treeView = useTreeViewContext();
  const nodeState = treeView.getNodeState(nodeProps);
  return /* @__PURE__ */ jsx(TreeViewNodeStateProvider, { value: nodeState, children: /* @__PURE__ */ jsx(TreeViewNodePropsProvider, { value: nodeProps, children: localProps.children }) });
}

export { TreeViewNodeProvider };
