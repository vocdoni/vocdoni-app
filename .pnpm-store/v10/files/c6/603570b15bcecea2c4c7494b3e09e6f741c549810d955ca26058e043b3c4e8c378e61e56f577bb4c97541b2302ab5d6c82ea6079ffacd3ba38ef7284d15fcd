import { DismissableElementHandlers } from '@zag-js/dismissable';
export { FocusOutsideEvent, InteractOutsideEvent, PointerDownOutsideEvent } from '@zag-js/dismissable';
import * as _zag_js_anatomy from '@zag-js/anatomy';
import { Point, RequiredBy, DirectionProperty, CommonProperties, MaybeElement, PropTypes, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Service, EventObject, Machine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"content" | "title" | "trigger" | "backdrop" | "grabber" | "grabberIndicator" | "closeTrigger">;

declare class DragManager {
    private pointerStart;
    private dragOffset;
    private lastPoint;
    private lastTimestamp;
    private velocity;
    setPointerStart(point: Point): void;
    clearPointerStart(): void;
    getPointerStart(): Point | null;
    setDragOffset(point: Point, resolvedActiveSnapPointOffset: number): void;
    getDragOffset(): number | null;
    clearDragOffset(): void;
    getVelocity(): number | null;
    clearVelocityTracking(): void;
    clear(): void;
    shouldStartDragging(point: Point, target: HTMLElement, container: HTMLElement | null, preventDragOnScroll: boolean): boolean;
    findClosestSnapPoint(snapPoints: ResolvedSnapPoint[]): number | string;
    shouldDismiss(contentHeight: number | null, snapPoints: ResolvedSnapPoint[], swipeVelocityThreshold: number, closeThreshold: number): boolean;
}

interface OpenChangeDetails {
    open: boolean;
}
interface ResolvedSnapPoint {
    value: number | string;
    offset: number;
}
interface SnapPointChangeDetails {
    snapPoint: number | string;
}
type ElementIds = Partial<{
    backdrop: string;
    content: string;
    trigger: string;
    grabber: string;
    grabberIndicator: string;
    closeTrigger: string;
}>;
interface BottomSheetProps extends DirectionProperty, CommonProperties, DismissableElementHandlers {
    /**
     * The ids of the elements in the bottom sheet. Useful for composition.
     */
    ids?: ElementIds;
    /**
     * Whether to trap focus inside the sheet when it's opened.
     * @default true
     */
    trapFocus?: boolean | undefined;
    /**
     * Whether to prevent scrolling behind the sheet when it's opened
     * @default true
     */
    preventScroll?: boolean | undefined;
    /**
     * Whether to prevent pointer interaction outside the element and hide all content below it.
     * @default true
     */
    modal?: boolean | undefined;
    /**
     * Element to receive focus when the sheet is opened.
     */
    initialFocusEl?: (() => MaybeElement) | undefined;
    /**
     * Element to receive focus when the sheet is closed.
     */
    finalFocusEl?: (() => MaybeElement) | undefined;
    /**
     * Whether to restore focus to the element that had focus before the sheet was opened.
     * @default true
     */
    restoreFocus?: boolean | undefined;
    /**
     * The sheet's role
     * @default "dialog"
     */
    role?: "dialog" | "alertdialog" | undefined;
    /**
     * Whether the bottom sheet is open.
     */
    open?: boolean | undefined;
    /**
     * The initial open state of the bottom sheet.
     */
    defaultOpen?: boolean | undefined;
    /**
     * Function called when the open state changes.
     */
    onOpenChange?: ((details: OpenChangeDetails) => void) | undefined;
    /**
     * Whether to close the bottom sheet when the outside is clicked.
     * @default true
     */
    closeOnInteractOutside?: boolean | undefined;
    /**
     * Whether to close the bottom sheet when the escape key is pressed.
     * @default true
     */
    closeOnEscape?: boolean | undefined;
    /**
     * The snap points of the bottom sheet.
     * Array of numbers or strings representing the snap points.
     * @default [1]
     */
    snapPoints?: (number | string)[] | undefined;
    /**
     * The threshold velocity (in pixels/s) for closing the bottom sheet.
     * @default 700
     */
    swipeVelocityThreshold?: number;
    /**
     * The threshold distance for dismissing the bottom sheet.
     * @default 0.25
     */
    closeThreshold?: number;
    /**
     * Whether to prevent dragging on scrollable elements.
     * When enabled, the sheet will not start dragging if the user is interacting with a scrollable element.
     * @default true
     */
    preventDragOnScroll?: boolean;
    /**
     * The currently active snap point.
     */
    activeSnapPoint?: number | string | undefined;
    /**
     * The default active snap point of the bottom sheet.
     * @default 1
     */
    defaultActiveSnapPoint?: number | string | undefined;
    /**
     * Callback fired when the active snap point changes.
     */
    onActiveSnapPointChange?: ((details: SnapPointChangeDetails) => void) | undefined;
}
type PropsWithDefault = "closeOnInteractOutside" | "closeOnEscape" | "modal" | "trapFocus" | "restoreFocus" | "preventScroll" | "initialFocusEl" | "snapPoints" | "swipeVelocityThreshold" | "closeThreshold" | "preventDragOnScroll" | "defaultActiveSnapPoint";
interface BottomSheetSchema {
    props: RequiredBy<BottomSheetProps, PropsWithDefault>;
    state: "open" | "closed" | "closing";
    tag: "open" | "closed";
    context: {
        dragOffset: number | null;
        activeSnapPoint: number | string;
        resolvedActiveSnapPoint: ResolvedSnapPoint | null;
        contentHeight: number | null;
    };
    refs: {
        dragManager: DragManager;
    };
    computed: {
        resolvedSnapPoints: ResolvedSnapPoint[];
    };
    event: EventObject;
    action: string;
    guard: string;
    effect: string;
}
type BottomSheetService = Service<BottomSheetSchema>;
type BottomSheetMachine = Machine<BottomSheetSchema>;
interface ContentProps {
    /**
     * Whether the bottom sheet content is draggable.
     * If false, the bottom sheet can only be dragged by the grabber.
     * @default true
     */
    draggable?: boolean | undefined;
}
interface BottomSheetApi<T extends PropTypes = PropTypes> {
    /**
     * Whether the bottom sheet is open.
     */
    open: boolean;
    /**
     * Whether the bottom sheet is currently being dragged.
     */
    dragging: boolean;
    /**
     * Function to open or close the menu.
     */
    setOpen: (open: boolean) => void;
    /**
     * The snap points of the bottom sheet.
     */
    snapPoints: (number | string)[];
    /**
     * The currently active snap point.
     */
    activeSnapPoint: number | string;
    /**
     * Function to set the active snap point.
     */
    setActiveSnapPoint: (snapPoint: number | string) => void;
    /**
     * Get the current open percentage of the bottom sheet.
     * @returns A value between 0-1 where:
     * - 0 = fully closed
     * - 1 = fully open at current snap point
     */
    getOpenPercentage: () => number;
    /**
     * Get the index of the currently active snap point.
     * @returns The index in the snapPoints array, or -1 if not found
     */
    getActiveSnapIndex: () => number;
    /**
     * Get the current height of the bottom sheet content.
     * @returns Height in pixels, or null if not measured yet
     */
    getContentHeight: () => number | null;
    getContentProps: (props?: ContentProps) => T["element"];
    getTitleProps: () => T["element"];
    getTriggerProps: () => T["element"];
    getBackdropProps: () => T["element"];
    getGrabberProps: () => T["element"];
    getGrabberIndicatorProps: () => T["element"];
    getCloseTriggerProps: () => T["element"];
}

declare function connect<T extends PropTypes>(service: BottomSheetService, normalize: NormalizeProps<T>): BottomSheetApi<T>;

declare const machine: _zag_js_core.Machine<BottomSheetSchema>;

declare const props: (keyof BottomSheetProps)[];
declare const splitProps: <Props extends Partial<BottomSheetProps>>(props: Props) => [Partial<BottomSheetProps>, Omit<Props, keyof BottomSheetProps>];

export { type BottomSheetApi as Api, type ContentProps, type ElementIds, type BottomSheetMachine as Machine, type OpenChangeDetails, type BottomSheetProps as Props, type ResolvedSnapPoint, type BottomSheetService as Service, type SnapPointChangeDetails, anatomy, connect, machine, props, splitProps };
