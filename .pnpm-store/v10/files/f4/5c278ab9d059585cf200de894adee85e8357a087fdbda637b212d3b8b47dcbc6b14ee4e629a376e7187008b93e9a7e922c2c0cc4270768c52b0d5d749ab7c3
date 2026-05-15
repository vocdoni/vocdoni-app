export { getPageContext };
export { providePageContext };
import { getPageContext_withAsyncHook } from './asyncHook.js';
import { getPageContext_sync, providePageContext } from '../../shared-server-client/hooks/execHook.js';
import '../assertEnvServer.js';
/**
 * Access `pageContext` object inside Vike hooks, in order to create universal hooks.
 *
 * https://vike.dev/getPageContext
 */
function getPageContext({ asyncHook, } = {}) {
    {
        const pageContext = getPageContext_sync();
        if (pageContext)
            return pageContext;
    }
    if (asyncHook) {
        const pageContext = getPageContext_withAsyncHook();
        if (pageContext)
            return pageContext;
    }
    return null;
}
