export { pluginCommon };
import { type InlineConfig, type Plugin } from 'vite';
import type { VitePluginServerEntryOptions } from '@brillout/vite-plugin-server-entry/plugin';
import '../assertEnvVite.js';
declare module 'vite' {
    interface UserConfig {
        vitePluginServerEntry?: VitePluginServerEntryOptions;
        _isDev?: boolean;
        _rootResolvedEarly?: string;
        _baseViteOriginal?: string;
        _viteConfigFromUserResolved?: InlineConfig;
        _viteVersionResolved?: string;
    }
}
declare global {
    var __VIKE__IS_PROCESS_SHARED_WITH_VITE: undefined | true;
}
declare function pluginCommon(vikeVitePluginOptions: unknown): Plugin[];
