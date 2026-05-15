import type { EmbedThemeConfig, AllPossibleLayouts, EmbedPageType } from "./types";
type ShadowRootWithStyle = ShadowRoot & {
    host: HTMLElement & {
        style: CSSStyleDeclaration;
    };
};
export declare class EmbedElement extends HTMLElement {
    theme: EmbedThemeConfig | null;
    isModal: boolean;
    skeletonContainerHeightTimer: number | null;
    themeClass: string;
    layout: AllPossibleLayouts;
    getSkeletonData: (_args: {
        layout: AllPossibleLayouts;
        pageType: EmbedPageType | null;
    }) => {
        skeletonContent: string;
        skeletonContainerStyle: string;
        skeletonStyle: string;
    };
    private boundResizeHandler;
    private boundPrefersDarkThemeChangedHandler;
    private isSkeletonSupportedPageType;
    assertHasShadowRoot(): asserts this is HTMLElement & {
        shadowRoot: ShadowRootWithStyle;
    };
    getPageType(): EmbedPageType;
    getLayout(): AllPossibleLayouts;
    getSkeletonContainerElement(): HTMLElement;
    getSkeletonElement(): HTMLElement;
    private ensureContainerTakesSkeletonHeightWhenVisible;
    getLoaderElement(): HTMLElement;
    toggleLoader(show: boolean): void;
    constructor(data: {
        isModal: boolean;
        getSkeletonData: (_args: {
            layout: AllPossibleLayouts;
            pageType: EmbedPageType | null;
        }) => {
            skeletonContent: string;
            skeletonContainerStyle: string;
            skeletonStyle: string;
        };
    });
    resizeHandler(): void;
    prefersDarkThemeChangedHandler(e: MediaQueryListEvent): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export {};
//# sourceMappingURL=EmbedElement.d.ts.map