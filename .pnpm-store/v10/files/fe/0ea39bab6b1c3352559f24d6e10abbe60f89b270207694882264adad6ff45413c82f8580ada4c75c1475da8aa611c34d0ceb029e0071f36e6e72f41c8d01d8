// Logger used for the production server.
// Any other environment (dev, preview, build, and pre-rendering) uses loggerDev.ts instead.
export { loggRuntimeErrorProd };
import { logErrorServer } from '../logErrorServer.js';
import { assertPageContext_logRuntime } from '../loggerRuntime.js';
import '../../assertEnvServer.js';
function loggRuntimeErrorProd(err, pageContext) {
    assertPageContext_logRuntime(pageContext);
    logErrorServer(err, pageContext);
}
