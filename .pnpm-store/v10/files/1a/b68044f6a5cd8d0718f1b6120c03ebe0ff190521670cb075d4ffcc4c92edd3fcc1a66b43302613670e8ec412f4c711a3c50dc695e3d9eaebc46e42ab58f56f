// Logger used by the the server runtime. (Also during pre-rendering since it uses the sever runtime.)
export let logRuntimeError;
export let logRuntimeInfo = null; // is `null` in production
export { setLogRuntimeDev };
export { assertPageContext_logRuntime };
import { loggRuntimeErrorProd } from './renderPageServer/loggerProd.js';
import { assert } from '../../utils/assert.js';
import '../assertEnvServer.js';
// Set production logger (which is overwritten by loggerDev.ts in non-production environments such as development and during pre-rendering)
logRuntimeError =
    // @ts-expect-error
    logRuntimeError ??
        // Default
        loggRuntimeErrorProd;
function setLogRuntimeDev(logRuntimeErrorDev, logRuntimeInfoDev) {
    logRuntimeError = logRuntimeErrorDev;
    logRuntimeInfo = logRuntimeInfoDev;
}
function assertPageContext_logRuntime(pageContext) {
    assert(pageContext === null || typeof pageContext._requestId === 'number');
}
