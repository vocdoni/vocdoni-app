export { handleErrorWithoutErrorPage };
import { assert, assertWarning } from '../../../utils/assert.js';
import { objectAssign } from '../../../utils/objectAssign.js';
import { createHttpResponseErrorFallback, createHttpResponseErrorFallbackJson } from './createHttpResponse.js';
import pc from '@brillout/picocolors';
import '../../assertEnvServer.js';
// When the user hasn't defined _error.page.js
function handleErrorWithoutErrorPage(pageContext) {
    assert(pageContext.pageId === null);
    assert(pageContext.errorWhileRendering || pageContext.is404);
    {
        const isV1 = pageContext._globalContext._pageConfigs.length > 0;
        warnMissingErrorPage(isV1, pageContext._globalContext._isProduction);
    }
    if (!pageContext.isClientSideNavigation) {
        const httpResponse = createHttpResponseErrorFallback(pageContext);
        objectAssign(pageContext, { httpResponse });
        return pageContext;
    }
    else {
        const __getPageAssets = async () => [];
        objectAssign(pageContext, { __getPageAssets });
        const httpResponse = createHttpResponseErrorFallbackJson();
        objectAssign(pageContext, { httpResponse });
        return pageContext;
    }
}
function warnMissingErrorPage(isV1, isProduction) {
    if (!isProduction) {
        const msg = [
            `No ${isV1 ? 'error page' : pc.cyan('_error.page.js')} found,`,
            'we recommend defining one',
            'https://vike.dev/error-page',
        ].join(' ');
        assertWarning(false, msg, { onlyOnce: true });
    }
}
