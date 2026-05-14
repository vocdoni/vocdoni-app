export { getPageAssets };
export type { PageAsset };
export type { GetPageAssets };
import { type MediaType } from './inferMediaType.js';
import type { ClientDependency } from '../../../shared-server-client/getPageFiles/analyzePageClientSide/ClientDependency.js';
import type { GlobalContextServerInternal } from '../globalContext.js';
import '../../assertEnvServer.js';
type PageAsset = {
    src: string;
    assetType: null | NonNullable<MediaType>['assetType'];
    mediaType: null | NonNullable<MediaType>['mediaType'];
    isEntry: boolean;
};
type GetPageAssets = () => Promise<PageAsset[]>;
declare function getPageAssets(pageContext: {
    _baseServer: string;
    _baseAssets: string | null;
    _globalContext: GlobalContextServerInternal;
}, clientDependencies: ClientDependency[], clientEntries: string[]): Promise<PageAsset[]>;
