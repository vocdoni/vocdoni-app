'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsonTreeUtils = require('@zag-js/json-tree-utils');
const react = require('react');
const treeCollection = require('../collection/tree-collection.cjs');
const useTreeView = require('../tree-view/use-tree-view.cjs');
const getBranchValue = require('./get-branch-value.cjs');

const useJsonTreeView = (props) => {
  const { data, defaultExpandedDepth = 1, ...restProps } = props;
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
  return useTreeView.useTreeView({
    defaultExpandedValue,
    ...restProps,
    collection,
    typeahead: false
  });
};

exports.useJsonTreeView = useJsonTreeView;
