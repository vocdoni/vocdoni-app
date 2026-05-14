export { execHookServer };
import { execHookList } from '../../../shared-server-client/hooks/execHook.js';
import { getPageContextPublicServer } from './getPageContextPublicServer.js';
import { getHooksFromPageContextNew } from '../../../shared-server-client/hooks/getHook.js';
import { getFileSuffixes } from '../../../shared-server-node/getFileSuffixes.js';
import '../../assertEnvServer.js';
async function execHookServer(hookName, pageContext) {
    const allHooks = getHooksFromPageContextNew(hookName, pageContext);
    const hooks = !pageContext.isClientSideNavigation
        ? allHooks
        : // Don't execute `.ssr.js` hooks upon client-side navigation
            allHooks.filter((hook) => !getFileSuffixes(hook.hookFilePath).includes('ssr'));
    return await execHookList(hooks, pageContext, getPageContextPublicServer);
}
