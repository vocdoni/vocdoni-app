export { serverProductionEntryPlugin };
export { serverEntryVirtualId };
export type { PluginConfigProvidedByUser as VitePluginServerEntryOptions };
declare const serverEntryVirtualId = "virtual:@brillout/vite-plugin-server-entry:serverEntry";
type PluginConfigProvidedByLibrary = {
    getServerProductionEntry: () => string;
    libraryName: string;
};
type PluginConfigProvidedByUser = {
    inject?: boolean;
    disableAutoImport?: boolean;
    disableServerEntryEmit?: boolean;
};
/**
 * This plugin does two things:
 *  - Generates a "server entry" file at `dist/server/entry.js`.
 *  - Generates a "auto importer" file at `node_modules/@brillout/vite-plugin-server-entry/dist/runtime/autoImporter.js`.
 *
 * See https://github.com/brillout/vite-plugin-server-entry#what-it-does for more information.
 */
declare function serverProductionEntryPlugin(pluginConfigProvidedByLibrary: PluginConfigProvidedByLibrary): Plugin_[];
type Plugin_ = any;
