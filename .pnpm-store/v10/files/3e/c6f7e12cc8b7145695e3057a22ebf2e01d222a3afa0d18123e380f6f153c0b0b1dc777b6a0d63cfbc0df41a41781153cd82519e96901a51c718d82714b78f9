/// <reference types="react" />
import { useRouter } from "next/navigation";
import type { EmbedThemeConfig, UiConfig, EmbedNonStylesConfig, EmbedStyles, KnownConfig } from "./types";
type SetStyles = React.Dispatch<React.SetStateAction<EmbedStyles>>;
type setNonStylesConfig = React.Dispatch<React.SetStateAction<EmbedNonStylesConfig>>;
declare const enum EMBED_IFRAME_STATE {
    NOT_INITIALIZED = 0,
    INITIALIZED = 1
}
/**
 * All types of config that are critical to be processed as soon as possible are provided as query params to the iframe
 */
export type PrefillAndIframeAttrsConfig = Record<string, string | string[] | Record<string, string>> & {
    iframeAttrs?: Record<string, string> & {
        id?: string;
    };
} & KnownConfig;
declare global {
    interface Window {
        CalEmbed: {
            __logQueue?: unknown[];
            embedStore: typeof embedStore;
            applyCssVars: (cssVarsPerTheme: UiConfig["cssVarsPerTheme"]) => void;
        };
        _embedBookerState?: "initializing" | "done";
    }
}
/**
 * This is in-memory persistence needed so that when user browses through the embed, the configurations from the instructions aren't lost.
 */
declare const embedStore: {
    router: {
        setNextRouter(nextRouter: ReturnType<typeof useRouter>): void;
        nextRouter: import("next/dist/shared/lib/app-router-context.shared-runtime").AppRouterInstance | null;
        queue: string[];
        goto(url: string): void;
    };
    state: EMBED_IFRAME_STATE;
    styles: EmbedStyles | undefined;
    nonStyles: EmbedNonStylesConfig | undefined;
    namespace: string | null;
    embedType: string | null | undefined;
    reactStylesStateSetters: Record<keyof EmbedStyles, SetStyles>;
    reactNonStylesStateSetters: Record<keyof EmbedNonStylesConfig, setNonStylesConfig>;
    parentInformedAboutContentHeight: boolean;
    windowLoadEventFired: boolean;
    setTheme: ((arg0: EmbedThemeConfig) => void) | undefined;
    theme: EmbedThemeConfig | null | undefined;
    uiConfig: Omit<UiConfig, "theme" | "styles"> | undefined;
    /**
     * We maintain a list of all setUiConfig setters that are in use at the moment so that we can update all those components.
     */
    setUiConfig: ((arg0: UiConfig) => void)[];
};
export declare const useEmbedTheme: () => "dark" | "light" | "auto" | null | undefined;
/**
 * It serves following purposes
 * - Gives consistent values for ui config even after Soft Navigation. When a new React component mounts, it would ensure that the component gets the correct value of ui config
 * - Ensures that all the components using useEmbedUiConfig are updated when ui config changes. It is done by maintaining a list of all non-stale setters.
 */
export declare const useEmbedUiConfig: () => Omit<UiConfig, "theme" | "styles">;
export declare const useEmbedStyles: (elementName: keyof EmbedStyles) => Pick<import("react").CSSProperties, "background">;
export declare const useEmbedNonStylesConfig: (elementName: keyof EmbedNonStylesConfig) => "left" | {
    brandColor?: string | undefined;
};
export declare const useIsBackgroundTransparent: () => boolean;
export declare const useBrandColors: () => {
    brandColor?: string | undefined;
};
export declare const useIsEmbed: (embedSsr?: boolean) => boolean | undefined;
export declare const useEmbedType: () => string | null | undefined;
declare const methods: {
    ui: (uiConfig: UiConfig) => void;
    parentKnowsIframeReady: (_unused: unknown) => void;
    connect: (queryObject: PrefillAndIframeAttrsConfig) => void;
};
export type InterfaceWithParent = {
    [key in keyof typeof methods]: (firstAndOnlyArg: Parameters<(typeof methods)[key]>[number]) => void;
};
export declare const interfaceWithParent: InterfaceWithParent;
export {};
//# sourceMappingURL=embed-iframe.d.ts.map