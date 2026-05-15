import type { InterfaceWithParent, interfaceWithParent, PrefillAndIframeAttrsConfig } from "./embed-iframe";
import { SdkActionManager } from "./sdk-action-manager";
import type { EventData, EventDataMap } from "./sdk-action-manager";
import type { UiConfig } from "./types";
export type { PrefillAndIframeAttrsConfig } from "./embed-iframe";
export type { EmbedEvent } from "./sdk-action-manager";
type Rest<T extends any[] | undefined> = T extends [any, ...infer U] ? U : never;
export type Message = {
    originator: string;
    method: keyof InterfaceWithParent;
    arg: InterfaceWithParent[keyof InterfaceWithParent];
};
declare module "*.css";
type Namespace = string;
type InitConfig = {
    calOrigin: string;
    debug?: boolean;
    uiDebug?: boolean;
};
type InitArgConfig = Partial<InitConfig> & {
    origin?: string;
};
type DoInIframeArg = {
    [K in keyof typeof interfaceWithParent]: {
        method: K;
        arg?: Parameters<(typeof interfaceWithParent)[K]>[0];
    };
}[keyof typeof interfaceWithParent];
type allPossibleCallbacksAndActions = {
    [K in keyof EventDataMap]: {
        action: K;
        callback: (arg0: CustomEvent<EventData<K>>) => void;
    };
}[keyof EventDataMap];
type SingleInstructionMap = {
    on: ["on", allPossibleCallbacksAndActions];
    off: ["off", allPossibleCallbacksAndActions];
} & {
    [K in Exclude<keyof CalApi, "on" | "off">]: CalApi[K] extends (...args: never[]) => void ? [K, ...Parameters<CalApi[K]>] : never;
};
type SingleInstruction = SingleInstructionMap[keyof SingleInstructionMap];
export type Instruction = SingleInstruction | SingleInstruction[];
export type InstructionQueue = Instruction[];
type PrefillAndIframeAttrsConfigWithGuest = PrefillAndIframeAttrsConfig & {
    guest?: string | string[];
};
type PrefillAndIframeAttrsConfigWithGuestAndColorScheme = PrefillAndIframeAttrsConfigWithGuest & {
    "ui.color-scheme"?: string | null;
};
export declare class Cal {
    iframe?: HTMLIFrameElement;
    __config: InitConfig;
    modalBox?: Element;
    inlineEl?: Element;
    namespace: string;
    actionManager: SdkActionManager;
    iframeReady: boolean;
    iframeDoQueue: DoInIframeArg[];
    api: CalApi;
    isPerendering?: boolean;
    static actionsManagers: Record<Namespace, SdkActionManager>;
    static ensureGuestKey(config: PrefillAndIframeAttrsConfig): PrefillAndIframeAttrsConfigWithGuest;
    processInstruction(instructionAsArgs: IArguments | Instruction): SingleInstruction[] | undefined;
    processQueue(queue: Queue): void;
    /**
     * Iframe is added invisible and shown only after color-scheme is set by the embedded calLink to avoid flash of non-transparent(white/black) background
     */
    createIframe({ calLink, config, calOrigin, }: {
        calLink: string;
        config?: PrefillAndIframeAttrsConfigWithGuestAndColorScheme;
        calOrigin: string | null;
    }): HTMLIFrameElement;
    getInitConfig(): InitConfig;
    doInIframe(doInIframeArg: DoInIframeArg): void;
    constructor(namespace: string, q: Queue);
    private filterParams;
    private getQueryParamsFromPage;
    private buildFilteredQueryParams;
}
declare class CalApi {
    cal: Cal;
    static initializedNamespaces: string[];
    modalUid?: string;
    preloadedModalUid?: string;
    constructor(cal: Cal);
    /**
     * If namespaceOrConfig is a string, config is available in config argument
     * If namespaceOrConfig is an object, namespace is assumed to be default and config isn't provided
     */
    init(namespaceOrConfig?: string | InitArgConfig, config?: InitArgConfig): void;
    /**
     * Used when a non-default namespace is to be initialized
     * It allows default queue to take care of instantiation of the non-default namespace queue
     */
    initNamespace(namespace: string): void;
    /**
     * It is an instruction that adds embed iframe inline as last child of the element
     */
    inline({ calLink, elementOrSelector, config, }: {
        calLink: string;
        elementOrSelector: string | HTMLElement;
        config?: PrefillAndIframeAttrsConfig;
    }): void;
    floatingButton({ calLink, buttonText, hideButtonIcon, attributes, buttonPosition, buttonColor, buttonTextColor, calOrigin, config, }: {
        calLink: string;
        buttonText?: string;
        attributes?: Record<"id", string> & Record<string | "id", string>;
        hideButtonIcon?: boolean;
        buttonPosition?: "bottom-left" | "bottom-right";
        buttonColor?: string;
        buttonTextColor?: string;
        calOrigin?: string;
        config?: PrefillAndIframeAttrsConfig;
    }): void;
    modal({ calLink, config, calOrigin, __prerender, }: {
        calLink: string;
        config?: PrefillAndIframeAttrsConfig;
        calOrigin?: string;
        __prerender?: boolean;
    }): void;
    private handleClose;
    on<T extends keyof EventDataMap>({ action, callback, }: {
        action: T;
        callback: (arg0: CustomEvent<EventData<T>>) => void;
    }): void;
    off<T extends keyof EventDataMap>({ action, callback, }: {
        action: T;
        callback: (arg0: CustomEvent<EventData<T>>) => void;
    }): void;
    /**
     *
     * type is provided and prerenderIframe not set. We would assume prerenderIframe to be true
     * type is provided and prerenderIframe set to false. We would ignore the type and preload assets only
     * type is not provided and prerenderIframe set to true. We would throw error as we don't know what to prerender
     * type is not provided and prerenderIframe set to false. We would preload assets only
     */
    preload({ calLink, type, options, }: {
        calLink: string;
        type?: "modal" | "floatingButton";
        options?: {
            prerenderIframe?: boolean;
        };
    }): void;
    prerender({ calLink, type }: {
        calLink: string;
        type: "modal" | "floatingButton";
    }): void;
    ui(uiConfig: UiConfig): void;
}
export type Queue = any[];
type GlobalConfig = {
    forwardQueryParams?: boolean;
};
type KeyOfSingleInstructionMap = keyof SingleInstructionMap;
export interface GlobalCalWithoutNs {
    <T extends KeyOfSingleInstructionMap>(methodName: T, ...arg: Rest<SingleInstructionMap[T]>): void;
    /** Marks that the embed.js is loaded. Avoids re-downloading it. */
    loaded?: boolean;
    /** Maintains a queue till the time embed.js isn't loaded */
    q: Queue;
    /** If user registers multiple namespaces, those are available here */
    instance?: Cal;
    __css?: string;
    fingerprint?: string;
    version?: string;
    __logQueue?: unknown[];
    config?: GlobalConfig;
}
type GlobalCalWithNs = GlobalCalWithoutNs & {
    ns: Record<string, GlobalCalWithoutNs>;
};
export type GlobalCal = GlobalCalWithNs;
declare global {
    interface Window {
        Cal: GlobalCal;
    }
}
export interface CalWindow extends Window {
    Cal: GlobalCal;
}
//# sourceMappingURL=embed.d.ts.map