export { determineClientEntry };
export { getVikeClientEntry };
import type { ClientDependency } from './ClientDependency.js';
import type { PageFile } from '../../getPageFiles.js';
declare function determineClientEntry({ pageFilesClientSide, pageFilesServerSide, isHtmlOnly, isClientRouting, }: {
    pageFilesClientSide: PageFile[];
    pageFilesServerSide: PageFile[];
    isHtmlOnly: boolean;
    isClientRouting: boolean;
}): {
    clientEntries: string[];
    clientDependencies: ClientDependency[];
};
declare function getVikeClientEntry(isClientRouting: boolean): "@@vike/dist/client/runtime-client-routing/entry.js" | "@@vike/dist/client/runtime-server-routing/entry.js";
