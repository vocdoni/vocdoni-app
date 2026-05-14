import * as _zag_js_anatomy from '@zag-js/anatomy';
import { TreeCollectionOptions, TreeCollection, FilePathTreeNode, TreeNode, IndexPath, ValuePath } from '@zag-js/collection';
export { TreeNode } from '@zag-js/collection';
import { RequiredBy, DirectionProperty, CommonProperties, PropTypes, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Service, Machine } from '@zag-js/core';
import { TypeaheadState } from '@zag-js/dom-query';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"branch" | "branchContent" | "branchControl" | "branchIndentGuide" | "branchIndicator" | "branchText" | "branchTrigger" | "item" | "itemIndicator" | "itemText" | "label" | "nodeCheckbox" | "nodeRenameInput" | "root" | "tree">;

declare const collection: {
    <T>(options: TreeCollectionOptions<T>): TreeCollection<T>;
    empty(): TreeCollection;
};
declare function filePathCollection(paths: string[]): TreeCollection<FilePathTreeNode>;

interface FocusChangeDetails<T extends TreeNode = TreeNode> {
    focusedValue: string | null;
    focusedNode: T | null;
}
interface ExpandedChangeDetails<T extends TreeNode = TreeNode> {
    focusedValue: string | null;
    expandedValue: string[];
    expandedNodes: T[];
}
interface SelectionChangeDetails<T extends TreeNode = TreeNode> {
    focusedValue: string | null;
    selectedValue: string[];
    selectedNodes: T[];
}
interface CheckedChangeDetails {
    checkedValue: string[];
}
interface RenameStartDetails<T extends TreeNode = TreeNode> {
    /**
     * The value (id) of the node being renamed
     */
    value: string;
    /**
     * The node being renamed
     */
    node: T;
    /**
     * The index path of the node
     */
    indexPath: IndexPath;
}
interface RenameCompleteDetails {
    /**
     * The value (id) of the node being renamed
     */
    value: string;
    /**
     * The new label for the node
     */
    label: string;
    /**
     * The index path of the node
     */
    indexPath: IndexPath;
}
interface LoadChildrenDetails<T extends TreeNode = TreeNode> {
    /**
     * The value path of the node whose children are being loaded
     */
    valuePath: ValuePath;
    /**
     * The index path of the node whose children are being loaded
     */
    indexPath: IndexPath;
    /**
     * The node whose children are being loaded
     */
    node: T;
    /**
     * AbortSignal to cancel the loading operation
     */
    signal: AbortSignal;
}
interface LoadChildrenCompleteDetails<T extends TreeNode = TreeNode> {
    /**
     * The updated tree collection with the loaded children
     */
    collection: TreeCollection<T>;
}
interface NodeWithError<T extends TreeNode = TreeNode> {
    node: T;
    error: Error;
    indexPath: IndexPath;
    valuePath: ValuePath;
}
interface LoadChildrenErrorDetails<T extends TreeNode = TreeNode> {
    /**
     * Array of nodes that failed to load children
     */
    nodes: NodeWithError<T>[];
}
interface ScrollToIndexDetails<T extends TreeNode = TreeNode> {
    /**
     * The index of the node in the visible nodes array
     */
    index: number;
    /**
     * The node being scrolled to
     */
    node: T;
    /**
     * The index path of the node
     */
    indexPath: IndexPath;
    /**
     * Function to get the DOM element for the node
     */
    getElement: () => HTMLElement | null;
}
interface VisibleNode<T extends TreeNode = TreeNode> {
    /**
     * The tree node
     */
    node: T;
    /**
     * The index path of the node
     */
    indexPath: IndexPath;
}
type ElementIds = Partial<{
    root: string;
    tree: string;
    label: string;
    node: (value: string) => string;
}>;
interface TreeViewProps<T extends TreeNode = TreeNode> extends DirectionProperty, CommonProperties {
    /**
     * The tree collection data
     */
    collection?: TreeCollection<T> | undefined;
    /**
     * The ids of the tree elements. Useful for composition.
     */
    ids?: ElementIds | undefined;
    /**
     * The controlled expanded node ids
     */
    expandedValue?: string[] | undefined;
    /**
     * The initial expanded node ids when rendered.
     * Use when you don't need to control the expanded node value.
     */
    defaultExpandedValue?: string[] | undefined;
    /**
     * The controlled selected node value
     */
    selectedValue?: string[] | undefined;
    /**
     * The initial selected node value when rendered.
     * Use when you don't need to control the selected node value.
     */
    defaultSelectedValue?: string[] | undefined;
    /**
     * The initial checked node value when rendered.
     * Use when you don't need to control the checked node value.
     */
    defaultCheckedValue?: string[] | undefined;
    /**
     * The controlled checked node value
     */
    checkedValue?: string[] | undefined;
    /**
     * The initial focused node value when rendered.
     * Use when you don't need to control the focused node value.
     */
    defaultFocusedValue?: string | null | undefined;
    /**
     * The value of the focused node
     */
    focusedValue?: string | null | undefined;
    /**
     * Whether the tree supports multiple selection
     * - "single": only one node can be selected
     * - "multiple": multiple nodes can be selected
     *
     * @default "single"
     */
    selectionMode?: "single" | "multiple" | undefined;
    /**
     * Called when the tree is opened or closed
     */
    onExpandedChange?: ((details: ExpandedChangeDetails<T>) => void) | undefined;
    /**
     * Called when the selection changes
     */
    onSelectionChange?: ((details: SelectionChangeDetails<T>) => void) | undefined;
    /**
     * Called when the focused node changes
     */
    onFocusChange?: ((details: FocusChangeDetails<T>) => void) | undefined;
    /**
     * Called when the checked value changes
     */
    onCheckedChange?: ((details: CheckedChangeDetails) => void) | undefined;
    /**
     * Function to determine if a node can be renamed
     */
    canRename?: ((node: T, indexPath: IndexPath) => boolean) | undefined;
    /**
     * Called when a node starts being renamed
     */
    onRenameStart?: ((details: RenameStartDetails<T>) => void) | undefined;
    /**
     * Called before a rename is completed. Return false to prevent the rename.
     */
    onBeforeRename?: ((details: RenameCompleteDetails) => boolean) | undefined;
    /**
     * Called when a node label rename is completed
     */
    onRenameComplete?: ((details: RenameCompleteDetails) => void) | undefined;
    /**
     * Called when a node finishes loading children
     */
    onLoadChildrenComplete?: ((details: LoadChildrenCompleteDetails<T>) => void) | undefined;
    /**
     * Called when loading children fails for one or more nodes
     */
    onLoadChildrenError?: ((details: LoadChildrenErrorDetails<T>) => void) | undefined;
    /**
     * Whether clicking on a branch should open it or not
     * @default true
     */
    expandOnClick?: boolean | undefined;
    /**
     * Whether the tree supports typeahead search
     * @default true
     */
    typeahead?: boolean | undefined;
    /**
     * Function to load children for a node asynchronously.
     * When provided, branches will wait for this promise to resolve before expanding.
     */
    loadChildren?: ((details: LoadChildrenDetails<T>) => Promise<T[]>) | undefined;
    /**
     * Function to scroll to a specific index.
     * Useful for virtualized tree views.
     */
    scrollToIndexFn?: ((details: ScrollToIndexDetails<T>) => void) | undefined;
}
type PropsWithDefault = "collection" | "selectionMode" | "expandOnClick" | "typeahead" | "defaultExpandedValue" | "defaultSelectedValue";
type TreeLoadingStatus = "loading" | "loaded";
type TreeLoadingStatusMap = Record<string, TreeLoadingStatus>;
interface TreeViewSchema<T extends TreeNode = TreeNode> {
    state: "idle" | "renaming";
    props: RequiredBy<TreeViewProps<T>, PropsWithDefault>;
    context: {
        expandedValue: string[];
        selectedValue: string[];
        checkedValue: string[];
        focusedValue: string | null;
        loadingStatus: TreeLoadingStatusMap;
        renamingValue: string | null;
    };
    refs: {
        typeaheadState: TypeaheadState;
        pendingAborts: Map<string, AbortController>;
    };
    computed: {
        isTypingAhead: boolean;
        isMultipleSelection: boolean;
        visibleNodes: {
            node: T;
            indexPath: number[];
        }[];
    };
    action: string;
    effect: string;
    guard: string;
}
type TreeViewService<T extends TreeNode = TreeNode> = Service<TreeViewSchema<T>>;
type TreeViewMachine<T extends TreeNode = TreeNode> = Machine<TreeViewSchema<T>>;
interface NodeProps {
    /**
     * The tree node
     */
    node: TreeNode;
    /**
     * The index path of the tree node
     */
    indexPath: number[];
}
type CheckedState = boolean | "indeterminate";
interface NodeState {
    /**
     * The id of the tree item
     */
    id: string;
    /**
     * The value of the tree item
     */
    value: string;
    /**
     * The index path of the tree item
     */
    indexPath: IndexPath;
    /**
     * The value path of the tree item
     */
    valuePath: ValuePath;
    /**
     * Whether the tree item is disabled
     */
    disabled: boolean;
    /**
     * Whether the tree item is selected
     */
    selected: boolean;
    /**
     * Whether the tree item is focused
     */
    focused: boolean;
    /**
     * The depth of the tree item
     */
    depth: number;
    /**
     * Whether the tree branch is expanded
     */
    expanded: boolean;
    /**
     * Whether the tree item is a branch
     */
    isBranch: boolean;
    /**
     * Whether the tree item is currently loading children
     */
    loading: boolean;
    /**
     * Whether the tree item is checked
     */
    checked: CheckedState;
    /**
     * Whether the tree item is currently being renamed
     */
    renaming: boolean;
}
type CheckedValueMap = Map<string, {
    type: "leaf" | "branch";
    checked: CheckedState;
}>;
interface TreeViewApi<T extends PropTypes = PropTypes, V extends TreeNode = TreeNode> {
    /**
     * The tree collection data
     */
    collection: TreeCollection<V>;
    /**
     * The value of the expanded nodes.
     */
    expandedValue: string[];
    /**
     * Sets the expanded value
     */
    setExpandedValue: (value: string[]) => void;
    /**
     * The value of the selected nodes.
     */
    selectedValue: string[];
    /**
     * Sets the selected value
     */
    setSelectedValue: (value: string[]) => void;
    /**
     * The value of the checked nodes
     */
    checkedValue: string[];
    /**
     * Toggles the checked value of a node
     */
    toggleChecked: (value: string, isBranch: boolean) => void;
    /**
     * Sets the checked value of a node
     */
    setChecked: (value: string[]) => void;
    /**
     * Clears the checked value of a node
     */
    clearChecked: VoidFunction;
    /**
     * Returns the checked details of branch and leaf nodes
     */
    getCheckedMap: () => CheckedValueMap;
    /**
     * Returns the visible nodes as a flat array of nodes and their index path.
     * Useful for rendering virtualized tree views.
     */
    getVisibleNodes: () => VisibleNode<V>[];
    /**
     * Function to expand nodes.
     * If no value is provided, all nodes will be expanded
     */
    expand: (value?: string[]) => void;
    /**
     * Function to collapse nodes
     * If no value is provided, all nodes will be collapsed
     */
    collapse: (value?: string[]) => void;
    /**
     * Function to select nodes
     * If no value is provided, all nodes will be selected
     */
    select: (value?: string[]) => void;
    /**
     * Function to deselect nodes
     * If no value is provided, all nodes will be deselected
     */
    deselect: (value?: string[]) => void;
    /**
     * Function to focus a node by value
     */
    focus: (value: string) => void;
    /**
     * Function to select the parent node of the focused node
     */
    selectParent: (value: string) => void;
    /**
     * Function to expand the parent node of the focused node
     */
    expandParent: (value: string) => void;
    /**
     * Function to start renaming a node by value
     */
    startRenaming: (value: string) => void;
    /**
     * Function to submit the rename and update the node label
     */
    submitRenaming: (value: string, label: string) => void;
    /**
     * Function to cancel renaming without changes
     */
    cancelRenaming: () => void;
    getRootProps: () => T["element"];
    getLabelProps: () => T["element"];
    getTreeProps: () => T["element"];
    getNodeState: (props: NodeProps) => NodeState;
    getItemProps: (props: NodeProps) => T["element"];
    getNodeCheckboxProps: (props: NodeProps) => T["element"];
    getItemIndicatorProps: (props: NodeProps) => T["element"];
    getItemTextProps: (props: NodeProps) => T["element"];
    getBranchProps: (props: NodeProps) => T["element"];
    getBranchIndicatorProps: (props: NodeProps) => T["element"];
    getBranchTriggerProps: (props: NodeProps) => T["element"];
    getBranchControlProps: (props: NodeProps) => T["element"];
    getBranchContentProps: (props: NodeProps) => T["element"];
    getBranchTextProps: (props: NodeProps) => T["element"];
    getBranchIndentGuideProps: (props: NodeProps) => T["element"];
    getNodeRenameInputProps: (props: NodeProps) => T["input"];
}

declare function connect<T extends PropTypes, V extends TreeNode = TreeNode>(service: TreeViewService<V>, normalize: NormalizeProps<T>): TreeViewApi<T, V>;

declare const machine: _zag_js_core.Machine<TreeViewSchema<any>>;

declare const props: (keyof TreeViewProps<any>)[];
declare const splitProps: <Props extends Partial<TreeViewProps<any>>>(props: Props) => [Partial<TreeViewProps<any>>, Omit<Props, keyof TreeViewProps<any>>];
declare const itemProps: (keyof NodeProps)[];
declare const splitItemProps: <Props extends NodeProps>(props: Props) => [NodeProps, Omit<Props, keyof NodeProps>];

export { type TreeViewApi as Api, type CheckedChangeDetails, type CheckedState, type CheckedValueMap, type ElementIds, type ExpandedChangeDetails, type FocusChangeDetails, type LoadChildrenCompleteDetails, type LoadChildrenDetails, type LoadChildrenErrorDetails, type TreeViewMachine as Machine, type NodeProps, type NodeState, type NodeWithError, type TreeViewProps as Props, type RenameCompleteDetails, type RenameStartDetails, type ScrollToIndexDetails, type SelectionChangeDetails, type TreeViewService as Service, type TreeLoadingStatus, type TreeLoadingStatusMap, type VisibleNode, anatomy, collection, connect, filePathCollection, itemProps, machine, props, splitItemProps, splitProps };
