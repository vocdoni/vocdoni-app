export { getPageContextPublicClient };
export type { PageContextPublicClient };
import type { PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import type { PageContextInternalClient_ServerRouting } from '../../types/PageContext.js';
import type { PageContextPublicMinimum } from '../../shared-server-client/getPageContextPublicShared.js';
import '../assertEnvClient.js';
type PageContextPublicClient = PageContextPublicMinimum & PageContextInternalClient_ServerRouting & PageContextConfig;
declare function getPageContextPublicClient<PageContext extends PageContextPublicClient>(pageContext: PageContext): PageContext & {
    Page: unknown;
};
