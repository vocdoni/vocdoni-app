export { isViteServerSide };
export { isViteServerSide_viteEnvOptional };
export { isViteServerSide_onlySsrEnv };
export { isViteServerSide_extraSafe };
export { isViteServerSide_applyToEnvironment };
export { isViteServerSide_configEnvironment };
export type { ViteEnv };
import type { Environment, EnvironmentOptions, ResolvedConfig, UserConfig, Plugin } from 'vite';
import '../assertEnvVite.js';
type ViteEnv = {
    name?: string;
    config: EnvironmentOptions | Environment['config'];
};
declare function isViteServerSide(configGlobal: ResolvedConfig | UserConfig, viteEnv: ViteEnv): boolean;
declare function isViteServerSide_viteEnvOptional(configGlobal: ResolvedConfig | UserConfig, viteEnv?: ViteEnv | undefined): boolean;
declare function isViteServerSide_onlySsrEnv(configGlobal: ResolvedConfig, viteEnv: ViteEnv): boolean;
declare function isViteServerSide_extraSafe(config: ResolvedConfig, viteEnv: ViteEnv, options: {
    ssr?: boolean;
} | undefined): boolean;
type PartialEnvironment = Parameters<NonNullable<Plugin['applyToEnvironment']>>[0];
declare function isViteServerSide_applyToEnvironment(env: PartialEnvironment): boolean;
declare function isViteServerSide_configEnvironment(name: string, config: EnvironmentOptions): boolean;
