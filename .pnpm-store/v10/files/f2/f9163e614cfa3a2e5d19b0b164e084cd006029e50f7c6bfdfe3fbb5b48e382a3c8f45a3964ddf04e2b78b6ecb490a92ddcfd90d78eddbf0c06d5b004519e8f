'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const createSplitProps = require('../../utils/create-split-props.cjs');
const useTreeViewContext = require('./use-tree-view-context.cjs');
const useTreeViewNodeContext = require('./use-tree-view-node-context.cjs');
const useTreeViewNodePropsContext = require('./use-tree-view-node-props-context.cjs');

const splitNodeProps = createSplitProps.createSplitProps();
function TreeViewNodeProvider(props) {
  const [nodeProps, localProps] = splitNodeProps(props, ["indexPath", "node"]);
  const treeView = useTreeViewContext.useTreeViewContext();
  const nodeState = treeView.getNodeState(nodeProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useTreeViewNodeContext.TreeViewNodeStateProvider, { value: nodeState, children: /* @__PURE__ */ jsxRuntime.jsx(useTreeViewNodePropsContext.TreeViewNodePropsProvider, { value: nodeProps, children: localProps.children }) });
}

exports.TreeViewNodeProvider = TreeViewNodeProvider;
