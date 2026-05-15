export default plugin;
export { plugin };
export { plugin as ssr };
export { getVikeConfig } from './shared/resolveVikeConfigInternal.js';
export { PROJECT_VERSION as version } from '../../utils/PROJECT_VERSION.js';
export type { VikeVitePluginOptions as UserConfig };
export type { VikeVitePluginOptions };
import './assertEnvVite.js';
type PluginInterop = Record<string, unknown> & {
    name: string;
};
declare function plugin(vikeVitePluginOptions?: VikeVitePluginOptions): Promise<PluginInterop[]>;
/** @deprecated Define Vike settings in +config.js instead of vite.config.js */
type VikeVitePluginOptions = {
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    prerender?: boolean | {
        /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
        noExtraDir?: boolean;
        /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
        parallel?: boolean | number;
        /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
        partial?: boolean;
        /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
        disableAutoRun?: boolean;
    };
    /** @deprecated See https://vike.dev/disableAutoFullBuild */
    disableAutoFullBuild?: boolean | 'prerender';
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    baseServer?: string;
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    baseAssets?: string;
    /** @deprecated It's now `true` by default. You can remove this option. */
    includeAssetsImportedByServer?: boolean;
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    redirects?: Record<string, string>;
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    trailingSlash?: boolean;
    /** @deprecated Define Vike settings in +config.js instead of vite.config.js */
    disableUrlNormalization?: boolean;
};
