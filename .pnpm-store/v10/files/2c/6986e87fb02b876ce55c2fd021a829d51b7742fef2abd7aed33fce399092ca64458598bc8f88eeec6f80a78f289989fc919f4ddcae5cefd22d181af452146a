export { getViteRPC };
export { createViteRPC };
import type { ViteDevServer } from 'vite';
declare function getViteRPC<RpcFunctions>(): RpcFunctions;
type AsyncFunction = (...args: any[]) => Promise<unknown>;
declare function createViteRPC(viteDevServer: ViteDevServer, getRpcFunctions: (viteDevServer: ViteDevServer) => Record<string, AsyncFunction>): void;
