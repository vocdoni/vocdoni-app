export { getPageContextPublicClientShared };
export { getPageContextPublicClientMinimal };
import type { PageContextConfig } from '../../shared-server-client/getPageFiles.js';
import { type PageContextPublicMinimum } from '../../shared-server-client/getPageContextPublicShared.js';
import type { PageContextInternalClient } from '../../types/PageContext.js';
import '../assertEnvClient.js';
type PageContextPublicClientShared = PageContextPublicMinimum & PageContextInternalClient & PageContextConfig;
declare function getPageContextPublicClientShared<PageContext extends PageContextPublicClientShared>(pageContext: PageContext): PageContext & {
    Page: unknown;
};
declare function getPageContextPublicClientMinimal<PageContext extends PageContextPublicMinimum>(pageContext: PageContext): PageContext & {
    _isProxyObject: true;
    _originalObject: PageContext;
} & {
    dangerouslyUseInternals: import("../../shared-server-client/getPublicProxy.js").DangerouslyUseInternals<PageContext>;
};
