export { execHookGuard };
import type { PageContextConfig } from '../getPageFiles.js';
import { type PageContextExecHook } from '../hooks/execHook.js';
import type { GlobalContextInternal } from '../createGlobalContextShared.js';
declare function execHookGuard<PageContext extends {
    pageId: string;
} & {
    _globalContext: GlobalContextInternal;
} & PageContextExecHook & PageContextConfig>(pageContext: PageContext, getPageContextPublic: (pageConfig: PageContext) => PageContext): Promise<void>;
