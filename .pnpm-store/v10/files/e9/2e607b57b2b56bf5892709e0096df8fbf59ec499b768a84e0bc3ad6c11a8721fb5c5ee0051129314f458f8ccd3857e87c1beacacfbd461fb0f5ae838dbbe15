'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { useRenderStrategyPropsContext } from '../../utils/render-strategy.js';
import { CollapsibleRoot } from '../collapsible/collapsible-root.js';
import { useTreeViewContext } from './use-tree-view-context.js';
import { useTreeViewNodeContext } from './use-tree-view-node-context.js';
import { useTreeViewNodePropsContext } from './use-tree-view-node-props-context.js';

const TreeViewBranch = forwardRef((props, ref) => {
  const treeView = useTreeViewContext();
  const nodeProps = useTreeViewNodePropsContext();
  const nodeState = useTreeViewNodeContext();
  const renderStrategyProps = useRenderStrategyPropsContext();
  const mergedProps = mergeProps(treeView.getBranchProps(nodeProps), props);
  const branchContentProps = treeView.getBranchContentProps(nodeProps);
  return /* @__PURE__ */ jsx(
    CollapsibleRoot,
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

export { TreeViewBranch };
