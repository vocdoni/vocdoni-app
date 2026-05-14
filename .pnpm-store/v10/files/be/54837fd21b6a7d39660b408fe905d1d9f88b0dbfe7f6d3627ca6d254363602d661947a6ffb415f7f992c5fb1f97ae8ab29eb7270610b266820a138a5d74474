export { parseVirtualFileId };
export { generateVirtualFileId };
export { virtualFileIdGlobalEntryServer };
export { virtualFileIdGlobalEntryClientSR };
export { virtualFileIdGlobalEntryClientCR };
declare const virtualFileIdGlobalEntryServer = "virtual:vike:global-entry:server";
declare const virtualFileIdGlobalEntryClientSR = "virtual:vike:global-entry:client:server-routing";
declare const virtualFileIdGlobalEntryClientCR = "virtual:vike:global-entry:client:client-routing";
type VirtualFileIdEntryParsed = {
    type: 'global-entry';
    isForClientSide: boolean;
    isClientRouting: boolean;
} | {
    type: 'page-entry';
    isForClientSide: boolean;
    pageId: string;
    isExtractAssets: boolean;
};
declare function parseVirtualFileId(id: string): false | VirtualFileIdEntryParsed;
declare function generateVirtualFileId(args: {
    type: 'global-entry';
    isForClientSide: boolean;
    isClientRouting: boolean;
} | {
    type: 'page-entry';
    pageId: string;
    isForClientSide: boolean;
}): string;
