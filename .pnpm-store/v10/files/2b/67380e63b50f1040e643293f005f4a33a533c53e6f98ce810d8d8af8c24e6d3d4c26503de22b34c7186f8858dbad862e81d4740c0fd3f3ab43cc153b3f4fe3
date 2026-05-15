export { setScrollPosition };
export { autoSaveScrollPosition };
export { scrollToHashOrTop };
export { isScrollPosition };
export type { ScrollTarget };
import { type ScrollPosition } from './history.js';
import '../assertEnvClient.js';
type ScrollTarget = undefined | {
    preserveScroll: boolean;
    y?: undefined;
} | ScrollPosition;
declare function setScrollPosition(scrollTarget: ScrollTarget, url?: string): void;
declare function scrollToHashOrTop(hash: null | string): void;
declare function isScrollPosition(scrollTarget: ScrollTarget | undefined): scrollTarget is ScrollPosition;
declare function autoSaveScrollPosition(): void;
