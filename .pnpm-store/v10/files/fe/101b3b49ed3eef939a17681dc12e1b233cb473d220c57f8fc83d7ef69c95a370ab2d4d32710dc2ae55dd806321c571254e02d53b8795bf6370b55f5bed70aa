'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import { useTreeViewNodeContext } from './use-tree-view-node-context.js';

const TreeViewNodeCheckboxIndicator = (props) => {
  const { children, indeterminate, fallback } = props;
  const nodeState = useTreeViewNodeContext();
  const checkedState = nodeState.checked;
  if (checkedState === "indeterminate" && indeterminate) {
    return /* @__PURE__ */ jsx(Fragment, { children: indeterminate });
  }
  if (checkedState === true && children) {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  return /* @__PURE__ */ jsx(Fragment, { children: fallback });
};
TreeViewNodeCheckboxIndicator.displayName = "TreeViewNodeCheckboxIndicator";

export { TreeViewNodeCheckboxIndicator };
