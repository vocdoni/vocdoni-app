export { createDevMiddleware };
import { createServer } from 'vite';
import { prepareViteApiCall } from './api/prepareViteApiCall.js';
/*
 * Create server middleware for development with HMR and lazy-transpiling.
 *
 * https://vike.dev/createDevMiddleware
 */
async function createDevMiddleware(options = {}) {
    const optionsMod = {
        ...options,
        viteConfig: {
            ...options.viteConfig,
            root: options.root ?? options.viteConfig?.root,
            server: {
                ...options.viteConfig?.server,
                middlewareMode: options.viteConfig?.server?.middlewareMode ?? true,
            },
        },
    };
    const { viteConfigFromUserResolved } = await prepareViteApiCall(optionsMod, 'dev');
    const server = await createServer(viteConfigFromUserResolved);
    const devMiddleware = server.middlewares;
    return { devMiddleware, viteServer: server, viteConfig: server.config };
}
