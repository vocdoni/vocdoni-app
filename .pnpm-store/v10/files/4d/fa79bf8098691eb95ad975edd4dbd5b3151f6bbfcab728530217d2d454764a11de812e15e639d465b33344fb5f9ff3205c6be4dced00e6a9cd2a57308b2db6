import { JSX } from 'react';
import { Assign } from '../../types';
import { RenderStrategyProps } from '../../utils/render-strategy';
import { TreeNode } from '../collection';
import { HTMLProps, PolymorphicProps } from '../factory';
import { UseTreeViewReturn } from './use-tree-view';
interface RootProviderProps<T extends TreeNode> {
    value: UseTreeViewReturn<T>;
}
export interface TreeViewRootProviderBaseProps<T extends TreeNode> extends RootProviderProps<T>, RenderStrategyProps, PolymorphicProps {
}
export interface TreeViewRootProviderProps<T extends TreeNode> extends HTMLProps<'div'>, TreeViewRootProviderBaseProps<T> {
}
export type TreeViewRootProviderComponent<P = {}> = <T extends TreeNode>(props: Assign<TreeViewRootProviderProps<T>, P> & React.RefAttributes<HTMLDivElement>) => JSX.Element;
export declare const TreeViewRootProvider: TreeViewRootProviderComponent;
export {};
