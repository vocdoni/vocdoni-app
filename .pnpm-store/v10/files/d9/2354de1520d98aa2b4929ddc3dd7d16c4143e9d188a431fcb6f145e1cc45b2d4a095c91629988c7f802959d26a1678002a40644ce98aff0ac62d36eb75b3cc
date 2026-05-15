import * as _zag_js_anatomy from '@zag-js/anatomy';
import { RequiredBy, DirectionProperty, CommonProperties, OrientationProperty, Size, Point, Rect, PropTypes, Orientation, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Service, EventObject, Machine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "viewportPositioner" | "viewport" | "trigger" | "content" | "list" | "item" | "link" | "indicator" | "itemIndicator" | "arrow">;

interface ValueChangeDetails {
    value: string;
}
type ElementIds = Partial<{
    root: string;
    list: string;
    item: string;
    trigger: (value: string) => string;
    content: (value: string) => string;
    viewport: string;
}>;
interface NavigationMenuProps extends DirectionProperty, CommonProperties, OrientationProperty {
    /**
     * The ids of the elements in the machine.
     */
    ids?: ElementIds | undefined;
    /**
     * The controlled value of the navigation menu
     */
    value?: string | undefined;
    /**
     * The default value of the navigation menu.
     * Use when you don't want to control the value of the menu.
     */
    defaultValue?: string | undefined;
    /**
     * Function called when the value of the menu changes
     */
    onValueChange?: ((details: ValueChangeDetails) => void) | undefined;
    /**
     * The delay before the menu opens
     * @default 200
     */
    openDelay?: number | undefined;
    /**
     * The delay before the menu closes
     * @default 300
     */
    closeDelay?: number | undefined;
    /**
     * Whether to disable the click trigger
     */
    disableClickTrigger?: boolean | undefined;
    /**
     * Whether to disable the hover trigger
     */
    disableHoverTrigger?: boolean | undefined;
    /**
     * Whether to disable the pointer leave close
     */
    disablePointerLeaveClose?: boolean | undefined;
}
type PropsWithDefault = "openDelay" | "closeDelay" | "dir" | "id" | "orientation";
interface NavigationMenuSchema {
    props: RequiredBy<NavigationMenuProps, PropsWithDefault>;
    state: "idle";
    computed: {
        open: boolean;
    };
    refs: {
        restoreContentTabOrder: VoidFunction | undefined;
        contentResizeObserverCleanup: VoidFunction | undefined;
        contentDismissableCleanup: VoidFunction | undefined;
        triggerResizeObserverCleanup: VoidFunction | undefined;
        contentExitCompleteCleanup: VoidFunction | undefined;
        closeTimeoutId: number | null;
        openTimeoutIds: Record<string, number>;
    };
    context: {
        value: string;
        previousValue: string;
        viewportSize: Size | null;
        viewportPosition: Point | null;
        isViewportRendered: boolean;
        contentNode: HTMLElement | null;
        triggerRect: Rect | null;
        triggerNode: HTMLElement | null;
    };
    action: string;
    effect: string;
    guard: string;
    event: EventObject;
}
type NavigationMenuMachine = Machine<NavigationMenuSchema>;
type NavigationMenuService = Service<NavigationMenuSchema>;
interface ItemProps {
    /**
     * The value of the item
     */
    value: string;
    /**
     * Whether the item is disabled
     */
    disabled?: boolean | undefined;
}
interface ItemState {
    /**
     * The id of the item element
     */
    itemId: string;
    /**
     * The id of the trigger element
     */
    triggerId: string;
    /**
     * The id of the trigger proxy element
     */
    triggerProxyId: string;
    /**
     * The id of the content element
     */
    contentId: string;
    /**
     * Whether the item is currently selected
     */
    selected: boolean;
    /**
     * Whether the item was previously selected (for animation)
     */
    wasSelected: boolean;
    /**
     * Whether the item's content is open
     */
    open: boolean;
    /**
     * Whether the item is disabled
     */
    disabled: boolean;
}
interface ArrowProps {
    /**
     * The value of the item
     */
    value: string;
}
interface ContentProps {
    /**
     * The value of the item this content belongs to
     */
    value: string;
}
interface LinkProps {
    /**
     * The value of the item this link belongs to
     */
    value: string;
    /**
     * Whether the link is the current link
     */
    current?: boolean | undefined;
    /**
     * Function called when the link is selected
     */
    onSelect?: ((event: CustomEvent) => void) | undefined;
    /**
     * Whether to close the navigation menu when the link is clicked.
     * @default true
     */
    closeOnClick?: boolean | undefined;
}
interface ViewportProps {
    /**
     * Placement of the viewport for css variables `(--viewport-x, --viewport-y)`.
     * @defaultValue 'center'
     */
    align?: "start" | "center" | "end";
}
interface NavigationMenuApi<T extends PropTypes = PropTypes> {
    /**
     * The current value of the menu
     */
    value: string | null;
    /**
     * Sets the value of the menu
     */
    setValue: (value: string) => void;
    /**
     * Whether the menu is open
     */
    open: boolean;
    /**
     * Whether the viewport is rendered
     */
    isViewportRendered: boolean;
    /**
     * Gets the viewport node element
     */
    getViewportNode: () => HTMLElement | null;
    /**
     * The orientation of the menu
     */
    orientation: Orientation;
    /**
     * Function to reposition the viewport
     */
    reposition: VoidFunction;
    getRootProps: () => T["element"];
    getListProps: () => T["element"];
    getItemProps: (props: ItemProps) => T["element"];
    getIndicatorProps: () => T["element"];
    getItemIndicatorProps: (props: ItemProps) => T["element"];
    getArrowProps: (props?: ArrowProps) => T["element"];
    getTriggerProps: (props: ItemProps) => T["button"];
    getTriggerProxyProps: (props: ItemProps) => T["element"];
    getViewportProxyProps: (props: ItemProps) => T["element"];
    getLinkProps: (props: LinkProps) => T["element"];
    getContentProps: (props: ContentProps) => T["element"];
    getViewportPositionerProps: (props?: ViewportProps) => T["element"];
    getViewportProps: (props?: ViewportProps) => T["element"];
    getItemState: (props: ItemProps) => ItemState;
}

declare function connect<T extends PropTypes>(service: NavigationMenuService, normalize: NormalizeProps<T>): NavigationMenuApi<T>;

declare const machine: _zag_js_core.Machine<NavigationMenuSchema>;

declare const props: (keyof NavigationMenuProps)[];
declare const splitProps: <Props extends Partial<NavigationMenuProps>>(props: Props) => [Partial<NavigationMenuProps>, Omit<Props, keyof NavigationMenuProps>];

export { type NavigationMenuApi as Api, type ArrowProps, type ContentProps, type ElementIds, type ItemProps, type ItemState, type LinkProps, type NavigationMenuMachine as Machine, type NavigationMenuProps as Props, type NavigationMenuService as Service, type ValueChangeDetails, type ViewportProps, anatomy, connect, machine, props, splitProps };
