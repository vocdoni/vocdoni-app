export { getPrefetchSettings };
export { PAGE_CONTEXT_MAX_AGE_DEFAULT };
export type { PrefetchSettingResolved };
import type { PageContextConfig } from '../../../shared-server-client/getPageFiles.js';
import '../../assertEnvClient.js';
declare const PAGE_CONTEXT_MAX_AGE_DEFAULT = 5000;
type PrefetchSettingResolved = {
    staticAssets: false | 'hover' | 'viewport';
    pageContext: false | number;
};
declare function getPrefetchSettings(pageContext: PageContextConfig, linkTag: null | HTMLElement): PrefetchSettingResolved;
