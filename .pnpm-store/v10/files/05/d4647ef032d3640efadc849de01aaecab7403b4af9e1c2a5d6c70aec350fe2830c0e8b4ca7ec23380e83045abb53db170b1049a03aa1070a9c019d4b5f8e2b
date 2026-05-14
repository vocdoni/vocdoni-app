import { JSX } from 'react';
import { Assign } from '../../types';
import { RenderStrategyProps } from '../../utils/render-strategy';
import { TreeNode } from '../collection';
import { HTMLProps, PolymorphicProps } from '../factory';
import { UseTreeViewProps } from './use-tree-view';
export interface TreeViewRootBaseProps<T extends TreeNode> extends UseTreeViewProps<T>, RenderStrategyProps, PolymorphicProps {
}
export interface TreeViewRootProps<T extends TreeNode> extends HTMLProps<'div'>, TreeViewRootBaseProps<T> {
}
export type TreeViewRootComponentProps<T extends TreeNode = TreeNode, P = {}> = Assign<TreeViewRootProps<T>, P> & React.RefAttributes<HTMLDivElement>;
export type TreeViewRootComponent<P = {}> = <T extends TreeNode>(props: TreeViewRootComponentProps<T, P>) => JSX.Element;
export declare const TreeViewRoot: TreeViewRootComponent;
