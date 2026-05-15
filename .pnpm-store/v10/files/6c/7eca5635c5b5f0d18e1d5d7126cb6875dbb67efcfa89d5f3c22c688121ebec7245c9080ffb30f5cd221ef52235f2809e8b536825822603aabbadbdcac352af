export { pushHistoryState };
export { replaceHistoryStateOriginal };
export { onPopStateBegin };
export { saveScrollPosition };
export { initHistory };
export type { HistoryInfo };
export type { ScrollPosition };
import '../assertEnvClient.js';
type StateEnhanced = {
    vike: {
        timestamp: number;
        scrollPosition: null | ScrollPosition;
        triggeredBy: 'user' | 'vike' | 'browser';
    };
};
type ScrollPosition = {
    x: number;
    y: number;
};
declare function saveScrollPosition(scrollPosition?: ScrollPosition): void;
declare function pushHistoryState(url: string, overwriteLastHistoryEntry: boolean): void;
declare function replaceHistoryStateOriginal(state: unknown, url?: Parameters<typeof window.history.replaceState>[2]): void;
type HistoryInfo = {
    url: `/${string}`;
    state: StateEnhanced;
};
declare function onPopStateBegin(): {
    skip: true;
    previous?: undefined;
    current?: undefined;
} | {
    previous: HistoryInfo;
    current: HistoryInfo;
    skip?: undefined;
};
declare function initHistory(): void;
