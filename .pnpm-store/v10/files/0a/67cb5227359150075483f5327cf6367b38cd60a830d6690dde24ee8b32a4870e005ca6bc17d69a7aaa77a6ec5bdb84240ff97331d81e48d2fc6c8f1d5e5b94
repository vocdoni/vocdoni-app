export { execHookOnRenderClient };
export type { PageContextBeforeRenderClient };
import type { PageFile, PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import type { GlobalContextClientInternalShared } from './getGlobalContextClientInternalShared.js';
import type { PageContextCreatedClient } from '../runtime-client-routing/createPageContextClient.js';
import type { PageContextCreatedClient_ServerRouting } from '../runtime-server-routing/createPageContextClient.js';
import '../assertEnvClient.js';
type PageContextCreatedClientShared = PageContextCreatedClient | PageContextCreatedClient_ServerRouting;
type PageContextBeforeRenderClient = {
    _pageFilesLoaded: PageFile[];
    urlOriginal?: string;
    urlPathname?: string;
    pageId: string;
    _globalContext: GlobalContextClientInternalShared;
} & PageContextCreatedClientShared & PageContextConfig;
declare function execHookOnRenderClient<PageContext extends PageContextBeforeRenderClient>(pageContext: PageContext, getPageContextPublic: (pageContext: PageContext) => PageContext): Promise<void>;
