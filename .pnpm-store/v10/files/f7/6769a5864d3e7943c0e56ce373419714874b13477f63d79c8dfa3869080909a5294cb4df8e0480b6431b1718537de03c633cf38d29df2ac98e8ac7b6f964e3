export { pluginViteRPC };
import type { Plugin, ViteDevServer } from 'vite';
import type { ClientDependency } from '../../../../shared-server-client/getPageFiles/analyzePageClientSide/ClientDependency.js';
import '../../assertEnvVite.js';
export type ViteRPC = ReturnType<typeof getViteRpcFunctions>;
declare function getViteRpcFunctions(viteDevServer: ViteDevServer): {
    transformIndexHtmlRPC(html: string): Promise<string>;
    retrievePageAssetsDevRPC(clientDependencies: ClientDependency[], clientEntries: string[]): Promise<{
        clientEntriesSrc: string[];
        assetUrls: string[];
    }>;
    getViteConfigRuntimeRPC(): Promise<{
        root: string;
        build: {
            outDir: string;
        };
        _baseViteOriginal: string;
        vitePluginServerEntry: {
            inject: boolean | undefined;
        };
    }>;
};
declare function pluginViteRPC(): Plugin[];
