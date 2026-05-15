export { execHookServer };
export type { PageContextExecHookServer };
import { PageContextExecHook } from '../../../shared-server-client/hooks/execHook.js';
import type { PageContextConfig } from '../../../shared-server-client/getPageFiles.js';
import type { HookName } from '../../../types/Config.js';
import '../../assertEnvServer.js';
type PageContextExecHookServer = PageContextConfig & PageContextExecHook & {
    isClientSideNavigation: boolean;
};
declare function execHookServer(hookName: HookName, pageContext: PageContextExecHookServer): Promise<(import("../../../shared-server-client/hooks/getHook.js").HookLoc & {
    hookFn: (arg: import("../../../shared-server-client/createPageContextShared.js").PageContextCreated, ...rest: unknown[]) => unknown;
    hookTimeout: import("../../../shared-server-client/hooks/getHook.js").HookTimeout;
} & {
    hookReturn: unknown;
})[]>;
