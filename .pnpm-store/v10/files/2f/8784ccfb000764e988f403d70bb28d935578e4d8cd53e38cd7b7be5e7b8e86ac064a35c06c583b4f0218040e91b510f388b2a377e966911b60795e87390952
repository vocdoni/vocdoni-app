'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const jsonTreeUtils = require('@zag-js/json-tree-utils');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const treeCollection = require('../collection/tree-collection.cjs');
const treeViewRoot = require('../tree-view/tree-view-root.cjs');
const getBranchValue = require('./get-branch-value.cjs');
const jsonTreeViewPropsContext = require('./json-tree-view-props-context.cjs');

const splitJsonTreeViewProps = createSplitProps.createSplitProps();
const JsonTreeViewRoot = react.forwardRef((props, ref) => {
  const [jsonTreeProps, localProps] = splitJsonTreeViewProps(props, [
    "maxPreviewItems",
    "collapseStringsAfterLength",
    "quotesOnKeys",
    "groupArraysAfterLength",
    "showNonenumerable"
  ]);
  const { data, defaultExpandedDepth, ...restProps } = localProps;
  const collection = react.useMemo(() => {
    return treeCollection.createTreeCollection({
      nodeToValue: jsonTreeUtils.nodeToValue,
      nodeToString: jsonTreeUtils.nodeToString,
      rootNode: jsonTreeUtils.getRootNode(data)
    });
  }, [data]);
  const defaultExpandedValue = react.useMemo(() => {
    return defaultExpandedDepth != null ? getBranchValue.getBranchValues(collection, defaultExpandedDepth) : void 0;
  }, [collection, defaultExpandedDepth]);
  return /* @__PURE__ */ jsxRuntime.jsx(jsonTreeViewPropsContext.JsonTreeViewPropsProvider, { value: jsonTreeProps, children: /* @__PURE__ */ jsxRuntime.jsx(
    treeViewRoot.TreeViewRoot,
    {
      "data-scope": "json-tree-view",
      collection,
      defaultExpandedValue,
      ...restProps,
      ref
    }
  ) });
});
JsonTreeViewRoot.displayName = "JsonTreeViewRoot";

exports.JsonTreeViewRoot = JsonTreeViewRoot;
