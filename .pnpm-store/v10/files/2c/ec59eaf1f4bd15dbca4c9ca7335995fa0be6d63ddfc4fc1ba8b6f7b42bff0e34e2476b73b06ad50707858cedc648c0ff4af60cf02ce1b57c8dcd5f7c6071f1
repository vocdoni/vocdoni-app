interface CollectionSearchState {
    keysSoFar: string;
    timer: number;
}
interface CollectionSearchOptions {
    state: CollectionSearchState;
    currentValue: string | null;
    timeout?: number | undefined;
}
type CollectionItem = any;
interface CollectionMethods<T extends CollectionItem = CollectionItem> {
    /**
     * The value of the item
     */
    itemToValue: (item: T) => string;
    /**
     * The label of the item
     */
    itemToString: (item: T) => string;
    /**
     * Whether the item is disabled
     */
    isItemDisabled: (item: T) => boolean;
}
interface CollectionOptions<T extends CollectionItem = CollectionItem> extends Partial<CollectionMethods<T>> {
    /**
     * The options of the select
     */
    items: Iterable<T> | Readonly<Iterable<T>>;
    /**
     * Function to group items
     */
    groupBy?: ((item: T, index: number) => string) | undefined;
    /**
     * Function to sort items
     */
    groupSort?: ((a: string, b: string) => number) | string[] | "asc" | "desc" | undefined;
}
type IndexPath = number[];
type ValuePath = string[];
interface TreeCollectionMethods<T> {
    isNodeDisabled: (node: T) => boolean;
    nodeToValue: (node: T) => string;
    nodeToString: (node: T) => string;
    nodeToChildren: (node: T) => any[];
    nodeToChildrenCount: (node: T) => number | undefined;
}
interface TreeCollectionOptions<T> extends Partial<TreeCollectionMethods<T>> {
    rootNode: T;
}
type TreeNode = any;
type FilePathTreeNode<T = TreeNode> = T & {
    children?: FilePathTreeNode<T>[] | undefined;
};
interface FlatTreeNodeMeta {
    _children: number[] | undefined;
    _parent: number | undefined;
    _index: number;
}
type FlatTreeNode<T = TreeNode> = T & FlatTreeNodeMeta;
interface TreeSkipFnArgs<T> {
    value: string;
    node: T;
    indexPath: number[];
}
type TreeSkipFn<T> = (args: TreeSkipFnArgs<T>) => boolean | void;
interface TreeSkipOptions<T> {
    skip?: TreeSkipFn<T> | undefined;
}
interface DescendantOptions {
    withBranch?: boolean;
}

declare class ListCollection<T extends CollectionItem = CollectionItem> {
    private options;
    /**
     * The items in the collection
     */
    items: T[];
    private indexMap;
    constructor(options: CollectionOptions<T>);
    /**
     * Copy the collection
     */
    copy: (items?: T[]) => ListCollection<T>;
    /**
     * Check if the collection is equal to another collection
     */
    isEqual: (other: ListCollection<T>) => boolean;
    /**
     * Function to update the collection items
     */
    setItems: (items: T[]) => ListCollection<T>;
    /**
     * Returns all the values in the collection
     */
    getValues: (items?: T[]) => string[];
    /**
     * Get the item based on its value
     */
    find: (value: string | null | undefined) => T | null;
    /**
     * Get the items based on its values
     */
    findMany: (values: string[]) => T[];
    /**
     * Get the item based on its index
     */
    at: (index: number) => T | null;
    private sortFn;
    /**
     * Sort the values based on their index
     */
    sort: (values: string[]) => string[];
    /**
     * Convert an item to a value
     */
    getItemValue: (item: T | null | undefined) => string | null;
    /**
     * Whether an item is disabled
     */
    getItemDisabled: (item: T | null) => boolean;
    /**
     * Convert an item to a string
     */
    stringifyItem: (item: T | null) => string | null;
    /**
     * Convert a value to a string
     */
    stringify: (value: string | null) => string | null;
    /**
     * Convert an array of items to a string
     */
    stringifyItems: (items: T[], separator?: string) => string;
    /**
     * Convert an array of items to a string
     */
    stringifyMany: (value: string[], separator?: string) => string;
    /**
     * Whether the collection has a value
     */
    has: (value: string | null) => boolean;
    /**
     * Whether the collection has an item
     */
    hasItem: (item: T | null) => boolean;
    /**
     * Returns the number of items in the collection
     */
    get size(): number;
    /**
     * Group items by the groupBy function provided in options
     * Returns an array of [groupKey, items] tuples
     */
    group: () => [string, T[]][];
    /**
     * Returns the first value in the collection
     */
    get firstValue(): string | null;
    /**
     * Returns the last value in the collection
     */
    get lastValue(): string | null;
    /**
     * Returns the next value in the collection
     */
    getNextValue: (value: string, step?: number, clamp?: boolean) => string | null;
    /**
     * Returns the previous value in the collection
     */
    getPreviousValue: (value: string, step?: number, clamp?: boolean) => string | null;
    /**
     * Get the index of an item based on its key
     */
    indexOf: (value: string | null) => number;
    private getByText;
    /**
     * Search for a value based on a query
     */
    search: (queryString: string, options: CollectionSearchOptions) => string | null;
    [Symbol.iterator](): Generator<T, void, unknown>;
    /**
     * Update an item in the collection
     */
    update: (value: string, item: T) => ListCollection<T>;
    /**
     * Update an item in the collection if it exists, otherwise append it
     */
    upsert: (value: string, item: T, mode?: "append" | "prepend") => ListCollection<T>;
    /**
     * Insert items at a specific index
     */
    insert: (index: number, ...items: T[]) => ListCollection<T>;
    /**
     * Insert items before a specific value
     */
    insertBefore: (value: string, ...items: T[]) => ListCollection<T>;
    /**
     * Insert items after a specific value
     */
    insertAfter: (value: string, ...items: T[]) => ListCollection<T>;
    /**
     * Prepend items to the collection
     */
    prepend: (...items: T[]) => ListCollection<T>;
    /**
     * Append items to the collection
     */
    append: (...items: T[]) => ListCollection<T>;
    /**
     * Filter the collection
     */
    filter: (fn: (itemString: string, index: number, item: T) => boolean) => ListCollection<T>;
    /**
     * Remove items from the collection
     */
    remove: (...itemsOrValues: Array<T | string>) => ListCollection<T>;
    /**
     * Move an item to a specific index
     */
    move: (value: string, toIndex: number) => ListCollection<T>;
    /**
     * Move items before a specific value
     */
    moveBefore: (value: string, ...values: string[]) => ListCollection<T>;
    /**
     * Move items after a specific value
     */
    moveAfter: (value: string, ...values: string[]) => ListCollection<T>;
    /**
     * Reorder items
     */
    reorder: (fromIndex: number, toIndex: number) => ListCollection<T>;
    /**
     * Compare two values
     */
    compareValue: (a: string, b: string) => 0 | 1 | -1;
    /**
     * Get the range of values between two values
     */
    private range;
    /**
     * Get the range of values between two values
     */
    getValueRange: (from: string | null, to: string | null) => string[];
    /**
     * Convert the collection to a string
     */
    toString: () => string;
    /**
     * Convert the collection to a JSON object
     */
    toJSON: () => {
        size: number;
        first: string | null;
        last: string | null;
    };
}
declare function isListCollection(v: unknown): v is ListCollection<any>;

interface GridCollectionOptions<T> extends CollectionOptions<T> {
    columnCount: number;
}
declare class GridCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T> {
    columnCount: number;
    private rows;
    constructor(options: GridCollectionOptions<T>);
    /**
     * Returns the row data in the grid
     */
    getRows: () => T[][];
    /**
     * Returns the number of rows in the grid
     */
    getRowCount: () => number;
    /**
     * Returns the index of the specified row and column in the grid
     */
    getCellIndex: (row: number, column: number) => number;
    /**
     * Returns the item at the specified row and column in the grid
     */
    getCell: (row: number, column: number) => T | null;
    /**
     * Returns the row and column index for a given value
     */
    getValueCell: (value: string) => {
        row: number;
        column: number;
    } | null;
    /**
     * Returns the value of the last enabled column in a row
     */
    getLastEnabledColumnIndex: (row: number) => number | null;
    /**
     * Returns the index of the first enabled column in a row
     */
    getFirstEnabledColumnIndex: (row: number) => number | null;
    /**
     * Returns the value of the previous row in the grid, based on the current value
     */
    getPreviousRowValue: (value: string, loop?: boolean) => string | null;
    /**
     * Returns the value of the next row in the grid, based on the current value
     */
    getNextRowValue: (value: string, loop?: boolean) => string | null;
}
declare function isGridCollection(v: any): v is GridCollection<any>;

/**
 * The mode of the selection.
 *
 * - `none`: A user can't select items.
 * - `single`: A user can select a single item.
 * - `multiple`: The user can select multiple items without using modifier keys.
 * - `extended`: The user can select multiple items by using modifier keys.
 */
type SelectionMode = "single" | "multiple" | "none" | "extended";
declare class Selection extends Set<string> {
    selectionMode: SelectionMode;
    deselectable: boolean;
    constructor(values?: Iterable<string>);
    copy: () => Selection;
    private sync;
    isEmpty: () => boolean;
    isSelected: (value: string | null) => boolean;
    canSelect: (collection: ListCollection, value: string) => boolean;
    firstSelectedValue: (collection: ListCollection) => string | null;
    lastSelectedValue: (collection: ListCollection) => string | null;
    extendSelection: (collection: ListCollection, anchorValue: string, targetValue: string) => Selection;
    toggleSelection: (collection: ListCollection, value: string) => Selection;
    replaceSelection: (collection: ListCollection, value: string | null) => Selection;
    setSelection: (values: Iterable<string>) => Selection;
    clearSelection: () => Selection;
    select: (collection: ListCollection, value: string, forceToggle?: boolean) => Selection;
    deselect: (value: string) => Selection;
    isEqual: (other: Selection) => boolean;
}

interface BaseOptions<T> {
    getChildren: (node: T, indexPath: IndexPath) => T[];
    reuseIndexPath?: boolean | undefined;
}
type TreeVisitEnterReturnValue = void | "skip" | "stop";
type TreeVisitLeaveReturnValue = void | "stop";
interface TreeVisitOptions<T> extends BaseOptions<T> {
    onEnter?(node: T, indexPath: IndexPath): TreeVisitEnterReturnValue;
    onLeave?(node: T, indexPath: IndexPath): TreeVisitLeaveReturnValue;
}

declare class TreeCollection<T = TreeNode> {
    private options;
    rootNode: T;
    constructor(options: TreeCollectionOptions<T>);
    isEqual: (other: TreeCollection<T>) => boolean;
    getNodeChildren: (node: T) => T[];
    private resolveIndexPath;
    private resolveNode;
    getNodeChildrenCount: (node: T) => number | undefined;
    getNodeValue: (node: T) => string;
    getNodeDisabled: (node: T) => boolean;
    stringify: (value: string) => string | null;
    stringifyNode: (node: T) => string;
    getFirstNode: (rootNode?: T) => T | undefined;
    getLastNode: (rootNode?: T, opts?: TreeSkipOptions<T>) => T | undefined;
    at: (indexPath: IndexPath) => T | undefined;
    findNode: (value: string, rootNode?: T) => T | undefined;
    findNodes: (values: string[], rootNode?: T) => T[];
    sort: (values: string[]) => string[];
    getIndexPath: (value: string) => IndexPath | undefined;
    getValue: (indexPath: IndexPath) => string | undefined;
    getValuePath: (indexPath: IndexPath | undefined) => string[];
    getDepth: (value: string) => number;
    isSameNode: (node: T, other: T) => boolean;
    isRootNode: (node: T) => boolean;
    contains: (parentIndexPath: IndexPath, valueIndexPath: IndexPath) => boolean;
    getNextNode: (value: string, opts?: TreeSkipOptions<T>) => T | undefined;
    getPreviousNode: (value: string, opts?: TreeSkipOptions<T>) => T | undefined;
    getParentNodes: (valueOrIndexPath: string | IndexPath) => T[];
    getDescendantNodes: (valueOrIndexPath: string | IndexPath, options?: DescendantOptions) => T[];
    getDescendantValues: (valueOrIndexPath: string | IndexPath, options?: DescendantOptions) => string[];
    private getParentIndexPath;
    getParentNode: (valueOrIndexPath: string | IndexPath) => T | undefined;
    visit: (opts: Omit<TreeVisitOptions<T>, "getChildren"> & TreeSkipOptions<T>) => void;
    getPreviousSibling: (indexPath: IndexPath) => T | undefined;
    getNextSibling: (indexPath: IndexPath) => T | undefined;
    getSiblingNodes: (indexPath: IndexPath) => T[];
    getValues: (rootNode?: T) => string[];
    private isValidDepth;
    isBranchNode: (node: T) => boolean;
    getBranchValues: (rootNode?: T, opts?: TreeSkipOptions<T> & {
        depth?: number | ((nodeDepth: number) => boolean) | undefined;
    }) => string[];
    flatten: (rootNode?: T) => Array<FlatTreeNode<T>>;
    private _create;
    private _insert;
    copy: (rootNode: T) => TreeCollection<T>;
    private _replace;
    private _move;
    private _remove;
    replace: (indexPath: IndexPath, node: T) => TreeCollection<T>;
    remove: (indexPaths: IndexPath[]) => TreeCollection<T>;
    insertBefore: (indexPath: IndexPath, nodes: T[]) => TreeCollection<T> | undefined;
    insertAfter: (indexPath: IndexPath, nodes: T[]) => TreeCollection<T> | undefined;
    move: (fromIndexPaths: IndexPath[], toIndexPath: IndexPath) => TreeCollection<T>;
    filter: (predicate: (node: T, indexPath: IndexPath) => boolean) => TreeCollection<T>;
    toJSON: () => string[];
}
declare function flattenedToTree<T>(nodes: Array<FlatTreeNode<T>>, options?: TreeCollectionMethods<T>): TreeCollection<T>;
declare function filePathToTree(paths: string[]): TreeCollection<FilePathTreeNode>;

export { type CollectionItem, type CollectionMethods, type CollectionOptions, type CollectionSearchOptions, type CollectionSearchState, type FilePathTreeNode, type FlatTreeNode, type FlatTreeNodeMeta, GridCollection, type GridCollectionOptions, type IndexPath, ListCollection, Selection, type SelectionMode, TreeCollection, type TreeCollectionMethods, type TreeCollectionOptions, type TreeNode, type TreeSkipFn, type ValuePath, filePathToTree, flattenedToTree, isGridCollection, isListCollection };
