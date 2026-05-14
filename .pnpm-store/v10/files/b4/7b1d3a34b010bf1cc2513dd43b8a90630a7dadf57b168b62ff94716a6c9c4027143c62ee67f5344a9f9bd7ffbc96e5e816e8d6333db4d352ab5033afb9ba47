export { dev };
export { startupLog };
import { type ResolvedConfig, type ViteDevServer } from 'vite';
import type { ApiOptions } from './types.js';
import './assertEnvApiDev.js';
/**
 * Programmatically trigger `$ vike dev`
 *
 * https://vike.dev/api#dev
 */
declare function dev(options?: ApiOptions & {
    startupLog?: boolean;
}): Promise<{
    viteServer: ViteDevServer;
    viteConfig: ResolvedConfig;
    viteVersion: string;
}>;
declare function startupLog(resolvedUrls: ResolvedServerUrls, viteServer: ViteDevServer): Promise<void>;
interface ResolvedServerUrls {
    local: string[];
    network: string[];
}
