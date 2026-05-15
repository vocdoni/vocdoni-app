export { createDevMiddleware };
import type { ResolvedConfig, Connect, ViteDevServer } from 'vite';
import type { ApiOptions } from './api/types.js';
declare function createDevMiddleware(options?: {
    root?: string;
} & ApiOptions): Promise<{
    devMiddleware: Connect.Server;
    viteServer: ViteDevServer;
    viteConfig: ResolvedConfig;
}>;
