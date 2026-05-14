import { TreeView as ArkTreeView, type Assign, type TreeNode } from "@ark-ui/react";
import type React from "react";
import { type HTMLChakraProps, type SlotRecipeProps, type UnstyledProp } from "../../styled-system";
declare const useTreeViewStyles: () => Record<string, import("../..").SystemStyleObject>;
export { useTreeViewStyles };
export interface TreeViewRootProviderBaseProps extends Assign<ArkTreeView.RootProviderBaseProps<TreeNode>, SlotRecipeProps<"treeView">>, UnstyledProp {
}
export interface TreeViewRootProviderProps extends HTMLChakraProps<"div", TreeViewRootProviderBaseProps> {
}
export declare const TreeViewRootProvider: React.ForwardRefExoticComponent<TreeViewRootProviderProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewRootBaseProps extends Assign<ArkTreeView.RootBaseProps<TreeNode>, SlotRecipeProps<"treeView">>, UnstyledProp {
}
export interface TreeViewRootProps extends HTMLChakraProps<"div", TreeViewRootBaseProps> {
}
export declare const TreeViewRoot: React.ForwardRefExoticComponent<TreeViewRootProps & React.RefAttributes<HTMLDivElement>>;
export declare const TreeViewPropsProvider: React.Provider<ArkTreeView.RootBaseProps<TreeNode>>;
export interface TreeViewBranchProps extends HTMLChakraProps<"div", ArkTreeView.BranchBaseProps>, UnstyledProp {
}
export declare const TreeViewBranch: React.ForwardRefExoticComponent<TreeViewBranchProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewBranchContentProps extends HTMLChakraProps<"div", ArkTreeView.BranchContentBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchContent: React.ForwardRefExoticComponent<TreeViewBranchContentProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewBranchControlProps extends HTMLChakraProps<"div", ArkTreeView.BranchControlBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchControl: React.ForwardRefExoticComponent<TreeViewBranchControlProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewBranchTriggerProps extends HTMLChakraProps<"button", ArkTreeView.BranchTriggerBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchTrigger: React.ForwardRefExoticComponent<TreeViewBranchTriggerProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewBranchIndicatorProps extends HTMLChakraProps<"div", ArkTreeView.BranchIndicatorBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchIndicator: React.ForwardRefExoticComponent<TreeViewBranchIndicatorProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewBranchTextProps extends HTMLChakraProps<"span", ArkTreeView.BranchTextBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchText: React.ForwardRefExoticComponent<TreeViewBranchTextProps & React.RefAttributes<HTMLSpanElement>>;
export interface TreeViewBranchIndentGuideProps extends HTMLChakraProps<"div", ArkTreeView.BranchIndentGuideBaseProps>, UnstyledProp {
}
export declare const TreeViewBranchIndentGuide: React.ForwardRefExoticComponent<TreeViewBranchIndentGuideProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewItemProps extends HTMLChakraProps<"div", ArkTreeView.ItemBaseProps>, UnstyledProp {
}
export declare const TreeViewItem: React.ForwardRefExoticComponent<TreeViewItemProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewItemIndicatorProps extends HTMLChakraProps<"div", ArkTreeView.ItemIndicatorBaseProps>, UnstyledProp {
}
export declare const TreeViewItemIndicator: React.ForwardRefExoticComponent<TreeViewItemIndicatorProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewItemTextProps extends HTMLChakraProps<"span", ArkTreeView.ItemTextBaseProps>, UnstyledProp {
}
export declare const TreeViewItemText: React.ForwardRefExoticComponent<TreeViewItemTextProps & React.RefAttributes<HTMLSpanElement>>;
export interface TreeViewLabelProps extends HTMLChakraProps<"label", ArkTreeView.LabelBaseProps>, UnstyledProp {
}
export declare const TreeViewLabel: React.ForwardRefExoticComponent<TreeViewLabelProps & React.RefAttributes<HTMLLabelElement>>;
export interface TreeViewTreeProps extends HTMLChakraProps<"div", ArkTreeView.TreeBaseProps>, UnstyledProp {
}
export declare const TreeViewTree: React.ForwardRefExoticComponent<TreeViewTreeProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewNodeCheckboxProps extends HTMLChakraProps<"div", ArkTreeView.NodeCheckboxBaseProps>, UnstyledProp {
}
export declare const TreeViewNodeCheckbox: React.ForwardRefExoticComponent<TreeViewNodeCheckboxProps & React.RefAttributes<HTMLDivElement>>;
export interface TreeViewNodeRenderProps<T = TreeNode> {
    node: T;
    indexPath: number[];
    nodeState: ArkTreeView.NodeState;
}
export interface TreeViewNodeProps<T = TreeNode> {
    indentGuide?: React.ReactElement;
    render: (props: TreeViewNodeRenderProps<T>) => React.ReactNode;
    renderBranch?: (props: TreeViewNodeRenderProps<T>) => React.ReactNode;
    branchProps?: TreeViewBranchProps;
    branchContentProps?: TreeViewBranchContentProps;
}
export declare function TreeViewNode<T extends TreeNode = TreeNode>(props: TreeViewNodeProps<T>): React.ReactNode;
