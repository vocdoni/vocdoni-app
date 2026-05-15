export { prefetch };
export { getPageContextPrefetched };
export { initLinkPrefetchHandlers };
export { populatePageContextPrefetchCache };
export { addLinkPrefetchHandlers };
export { addLinkPrefetchHandlers_watch };
export { addLinkPrefetchHandlers_unwatch };
import { type PageContextCreatedClient } from './createPageContextClient.js';
import { type PageContextFromHooksServer, getPageContextFromHooksServer } from './getPageContextFromHooks.js';
import type { PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import '../assertEnvClient.js';
type ResultPageContextFromServer = Awaited<ReturnType<typeof getPageContextFromHooksServer>>;
type PageContextForPrefetch = PageContextCreatedClient & {
    pageId: string;
};
declare function getPageContextPrefetched(pageContext: {
    urlPathname: string;
} & PageContextConfig): null | PageContextFromHooksServer;
declare function populatePageContextPrefetchCache(pageContext: PageContextForPrefetch, result: ResultPageContextFromServer): void;
/**
 * Programmatically prefetch client assets.
 *
 * https://vike.dev/prefetch
 *
 * @param url - The URL of the page you want to prefetch.
 */
declare function prefetch(url: string, options_?: {
    pageContext?: boolean;
}): Promise<void>;
declare function addLinkPrefetchHandlers(): void;
declare function initLinkPrefetchHandlers(): void;
declare function addLinkPrefetchHandlers_watch(): void;
declare function addLinkPrefetchHandlers_unwatch(): void;
