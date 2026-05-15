export { pluginViteRPC };
import { createViteRPC } from '../../../../utils/getViteRPC.js';
import { isDevCheck } from '../../../../utils/isDev.js';
import { retrievePageAssetsDev } from '../../../../server/runtime/renderPageServer/getPageAssets/retrievePageAssetsDev.js';
import { getViteConfigRuntime } from '../../shared/getViteConfigRuntime.js';
import '../../assertEnvVite.js';
function getViteRpcFunctions(viteDevServer) {
    return {
        async transformIndexHtmlRPC(html) {
            return await viteDevServer.transformIndexHtml('/', html);
        },
        async retrievePageAssetsDevRPC(clientDependencies, clientEntries) {
            return await retrievePageAssetsDev(viteDevServer, clientDependencies, clientEntries);
        },
        async getViteConfigRuntimeRPC() {
            return getViteConfigRuntime(viteDevServer.config);
        },
    };
}
function pluginViteRPC() {
    return [
        {
            name: 'vike:pluginViteRPC:1',
            apply: (_, configEnv) => isDevCheck(configEnv),
            configureServer: {
                handler(viteDevServer) {
                    createViteRPC(viteDevServer, getViteRpcFunctions);
                },
            },
        },
    ];
}
