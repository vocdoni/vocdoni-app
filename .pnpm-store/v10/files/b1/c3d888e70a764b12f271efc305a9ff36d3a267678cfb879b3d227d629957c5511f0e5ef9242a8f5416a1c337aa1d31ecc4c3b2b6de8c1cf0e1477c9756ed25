'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const renderStrategy = require('../../utils/render-strategy.cjs');
const collapsibleRoot = require('../collapsible/collapsible-root.cjs');
const useTreeViewContext = require('./use-tree-view-context.cjs');
const useTreeViewNodeContext = require('./use-tree-view-node-context.cjs');
const useTreeViewNodePropsContext = require('./use-tree-view-node-props-context.cjs');

const TreeViewBranch = react.forwardRef((props, ref) => {
  const treeView = useTreeViewContext.useTreeViewContext();
  const nodeProps = useTreeViewNodePropsContext.useTreeViewNodePropsContext();
  const nodeState = useTreeViewNodeContext.useTreeViewNodeContext();
  const renderStrategyProps = renderStrategy.useRenderStrategyPropsContext();
  const mergedProps = react$1.mergeProps(treeView.getBranchProps(nodeProps), props);
  const branchContentProps = treeView.getBranchContentProps(nodeProps);
  return /* @__PURE__ */ jsxRuntime.jsx(
    collapsibleRoot.CollapsibleRoot,
    {
      ref,
      open: nodeState.expanded,
      ids: { content: branchContentProps.id },
      ...renderStrategyProps,
      ...mergedProps
    }
  );
});
TreeViewBranch.displayName = "TreeViewBranch";

exports.TreeViewBranch = TreeViewBranch;
