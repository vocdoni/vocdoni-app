import { JsonNode } from '@zag-js/json-tree-utils';
import { UseTreeViewProps, UseTreeViewReturn } from '../tree-view';
export interface UseJsonTreeViewProps extends Omit<UseTreeViewProps<JsonNode>, 'collection'> {
    data: unknown;
    defaultExpandedDepth?: number;
}
export interface UseJsonTreeViewReturn extends UseTreeViewReturn<JsonNode> {
}
export declare const useJsonTreeView: (props: UseJsonTreeViewProps) => UseTreeViewReturn<JsonNode<any>>;
