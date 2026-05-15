'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');

const JsonTreeViewValueNode = (props) => {
  const { node, renderValue } = props;
  if (node.type === "text") {
    return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: renderValue?.(node) ?? node.value });
  }
  const Element = node.tagName;
  return /* @__PURE__ */ jsxRuntime.jsx(
    Element,
    {
      "data-root": node.properties.root ? "" : void 0,
      "data-type": node.properties.nodeType,
      "data-kind": node.properties.kind,
      suppressHydrationWarning: true,
      children: node.children.map((child, index) => /* @__PURE__ */ jsxRuntime.jsx(JsonTreeViewValueNode, { node: child, renderValue }, index))
    }
  );
};

exports.JsonTreeViewValueNode = JsonTreeViewValueNode;
