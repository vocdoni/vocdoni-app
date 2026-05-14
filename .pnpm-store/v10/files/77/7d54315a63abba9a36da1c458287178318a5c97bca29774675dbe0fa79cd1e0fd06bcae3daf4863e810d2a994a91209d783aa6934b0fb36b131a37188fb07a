import * as _zag_js_anatomy from '@zag-js/anatomy';
import { DirectionProperty, CommonProperties, Size, Orientation, PropTypes, Point, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Service, EventObject, Machine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "viewport" | "content" | "scrollbar" | "thumb" | "corner">;

declare class Timeout {
    currentId: any;
    start(delay: number, fn: Function): void;
    isStarted(): boolean;
    clear: () => void;
    disposeEffect: () => () => void;
}

type ScrollToEdge = "top" | "right" | "bottom" | "left";
type ScrollRecord<T> = Record<ScrollToEdge, T>;
type ElementIds = Partial<{
    root: string;
    viewport: string;
    content: string;
    scrollbar: string;
    thumb: string;
}>;
interface ScrollAreaProps extends DirectionProperty, CommonProperties {
    /**
     * The ids of the scroll area elements
     */
    ids?: ElementIds;
}
interface ScrollbarProps {
    orientation?: Orientation;
}
interface ThumbProps {
    orientation?: Orientation;
}
interface ScrollbarHiddenState {
    scrollbarYHidden: boolean;
    scrollbarXHidden: boolean;
    cornerHidden: boolean;
}
interface ScrollAreaContext {
    cornerSize: Size;
    thumbSize: Size;
    scrollingX: boolean;
    scrollingY: boolean;
    hiddenState: ScrollbarHiddenState;
    hovering: boolean;
    touchModality: boolean;
    atSides: ScrollRecord<boolean>;
}
interface ScrollAreaRefs {
    orientation: Orientation | null;
    scrollPosition: {
        x: number;
        y: number;
    };
    scrollYTimeout: Timeout;
    scrollXTimeout: Timeout;
    scrollEndTimeout: Timeout;
    startX: number;
    startY: number;
    startScrollTop: number;
    startScrollLeft: number;
    programmaticScroll: boolean;
}
interface ScrollAreaSchema {
    state: "idle" | "dragging";
    props: ScrollAreaProps;
    context: ScrollAreaContext;
    event: EventObject;
    action: string;
    guard: string;
    effect: string;
    refs: ScrollAreaRefs;
}
type ScrollAreaService = Service<ScrollAreaSchema>;
type ScrollAreaMachine = Machine<ScrollAreaSchema>;
interface ScrollbarState {
    hovering: boolean;
    scrolling: boolean;
    hidden: boolean;
}
type ScrollEasingFunction = (t: number) => number;
interface ScrollbarEasing {
    easing?: ScrollEasingFunction | undefined;
    duration?: number | undefined;
}
interface ScrollToDetails extends ScrollbarEasing {
    top?: number | undefined;
    left?: number | undefined;
    behavior?: ScrollBehavior | undefined;
}
interface ScrollToEdgeDetails extends ScrollbarEasing {
    edge: ScrollToEdge;
    behavior?: ScrollBehavior | undefined;
}
interface ScrollAreaApi<T extends PropTypes> {
    /**
     * Whether the scroll area is at the top
     */
    isAtTop: boolean;
    /**
     * Whether the scroll area is at the bottom
     */
    isAtBottom: boolean;
    /**
     * Whether the scroll area is at the left
     */
    isAtLeft: boolean;
    /**
     * Whether the scroll area is at the right
     */
    isAtRight: boolean;
    /**
     * Whether the scroll area has horizontal overflow
     */
    hasOverflowX: boolean;
    /**
     * Whether the scroll area has vertical overflow
     */
    hasOverflowY: boolean;
    /**
     * Get the scroll progress as values between 0 and 1
     */
    getScrollProgress: () => Point;
    /**
     * Scroll to the edge of the scroll area
     */
    scrollToEdge: (details: ScrollToEdgeDetails) => void;
    /**
     * Scroll to specific coordinates
     */
    scrollTo: (details: ScrollToDetails) => void;
    /**
     * Returns the state of the scrollbar
     */
    getScrollbarState: (props: ScrollbarProps) => ScrollbarState;
    getRootProps: () => T["element"];
    getViewportProps: () => T["element"];
    getContentProps: () => T["element"];
    getScrollbarProps: (props?: ScrollbarProps) => T["element"];
    getThumbProps: (props?: ThumbProps) => T["element"];
    getCornerProps: () => T["element"];
}

declare function connect<T extends PropTypes>(service: ScrollAreaService, normalize: NormalizeProps<T>): ScrollAreaApi<T>;

declare const machine: _zag_js_core.Machine<ScrollAreaSchema>;

declare const props: (keyof ScrollAreaProps)[];
declare const splitProps: <Props extends Partial<ScrollAreaProps>>(props: Props) => [Partial<ScrollAreaProps>, Omit<Props, keyof ScrollAreaProps>];

export { type ScrollAreaApi as Api, type ElementIds, type ScrollAreaMachine as Machine, type ScrollAreaProps as Props, type ScrollEasingFunction, type ScrollRecord, type ScrollToDetails, type ScrollToEdge, type ScrollToEdgeDetails, type ScrollbarEasing, type ScrollbarHiddenState, type ScrollbarProps, type ScrollbarState, type ScrollAreaService as Service, type ThumbProps, anatomy, connect, machine, props, splitProps };
