export { getPageContextPublicServer };
export type { PageContextPublicServer };
import { type PageContextPublicMinimum } from '../../../shared-server-client/getPageContextPublicShared.js';
import '../../assertEnvServer.js';
type PageContextPublicServer = ReturnType<typeof getPageContextPublicServer>;
declare function getPageContextPublicServer<PageContext extends PageContextPublicMinimum>(pageContext: PageContext): PageContext & {
    _isProxyObject: true;
    _originalObject: PageContext;
} & {
    dangerouslyUseInternals: import("../../../shared-server-client/getPublicProxy.js").DangerouslyUseInternals<PageContext>;
};
