'use client';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { keyPathToKey } from '@zag-js/json-tree-utils';

const JsonTreeViewKeyNode = (props) => {
  const { node, showQuotes } = props;
  const key = keyPathToKey(node.keyPath);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { "data-kind": "key", suppressHydrationWarning: true, "data-non-enumerable": node.isNonEnumerable ? "" : void 0, children: showQuotes ? `"${key}"` : key }),
    /* @__PURE__ */ jsx("span", { "data-kind": "colon", children: ": " })
  ] });
};

export { JsonTreeViewKeyNode };
