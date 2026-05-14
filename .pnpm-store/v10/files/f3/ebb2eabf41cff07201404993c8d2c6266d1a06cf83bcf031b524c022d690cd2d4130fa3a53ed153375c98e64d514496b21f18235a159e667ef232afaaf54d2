'use client';
import { getRootNode, nodeToString, nodeToValue } from '@zag-js/json-tree-utils';
import { useMemo } from 'react';
import { createTreeCollection } from '../collection/tree-collection.js';
import { useTreeView } from '../tree-view/use-tree-view.js';
import { getBranchValues } from './get-branch-value.js';

const useJsonTreeView = (props) => {
  const { data, defaultExpandedDepth = 1, ...restProps } = props;
  const collection = useMemo(() => {
    return createTreeCollection({
      nodeToValue,
      nodeToString,
      rootNode: getRootNode(data)
    });
  }, [data]);
  const defaultExpandedValue = useMemo(() => {
    return defaultExpandedDepth != null ? getBranchValues(collection, defaultExpandedDepth) : void 0;
  }, [collection, defaultExpandedDepth]);
  return useTreeView({
    defaultExpandedValue,
    ...restProps,
    collection,
    typeahead: false
  });
};

export { useJsonTreeView };
