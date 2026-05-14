// TO-DO/next-major-release: remove
export { determineClientEntry };
export { getVikeClientEntry };
function determineClientEntry({ pageFilesClientSide, pageFilesServerSide, isHtmlOnly, isClientRouting, }) {
    let clientEntries = [];
    const pageFilesServerSideOnly = pageFilesServerSide.filter((p) => !pageFilesClientSide.includes(p));
    const clientDependencies = [];
    clientDependencies.push(...pageFilesClientSide.map((p) => ({ id: p.filePath, onlyAssets: false, eagerlyImported: false })));
    // CSS & assets
    clientDependencies.push(...pageFilesServerSideOnly.map((p) => ({ id: p.filePath, onlyAssets: true, eagerlyImported: false })));
    // Handle SPA & SSR pages.
    if (isHtmlOnly) {
        clientEntries = pageFilesClientSide.map((p) => p.filePath);
    }
    else {
        // Add the vike client entry
        const clientEntry = getVikeClientEntry(isClientRouting);
        clientDependencies.push({ id: clientEntry, onlyAssets: false, eagerlyImported: false });
        clientEntries = [clientEntry];
    }
    // console.log(pageFilesClientSide, pageFilesServerSide, clientDependencies, clientEntry)
    return { clientEntries, clientDependencies };
}
function getVikeClientEntry(isClientRouting) {
    return isClientRouting
        ? '@@vike/dist/client/runtime-client-routing/entry.js'
        : '@@vike/dist/client/runtime-server-routing/entry.js';
}
