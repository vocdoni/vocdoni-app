export { retrievePageAssetsProd };
export { resolveIncludeAssetsImportedByServer };
import type { ViteManifest } from '../../../../types/ViteManifest.js';
import type { ClientDependency } from '../../../../shared-server-client/getPageFiles/analyzePageClientSide/ClientDependency.js';
import type { ConfigResolved } from '../../../../types/index.js';
import '../../../assertEnvServer.js';
declare function retrievePageAssetsProd(assetsManifest: ViteManifest, clientDependencies: ClientDependency[], clientEntries: string[], config: ConfigResolved): {
    clientEntriesSrc: string[];
    assetUrls: string[];
};
declare function resolveIncludeAssetsImportedByServer(config: ConfigResolved): boolean;
