'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useTreeViewContext } from './use-tree-view-context.js';
import { useTreeViewNodePropsContext } from './use-tree-view-node-props-context.js';

const TreeViewNodeRenameInput = forwardRef((props, ref) => {
  const treeView = useTreeViewContext();
  const nodeProps = useTreeViewNodePropsContext();
  const mergedProps = mergeProps(treeView.getNodeRenameInputProps(nodeProps), props);
  return /* @__PURE__ */ jsx(ark.input, { ...mergedProps, ref });
});
TreeViewNodeRenameInput.displayName = "TreeViewNodeRenameInput";

export { TreeViewNodeRenameInput };
