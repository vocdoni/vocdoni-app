export { getPageContext_withAsyncHook };
export { getRequestId_withAsyncHook };
export { getAsyncLocalStorage };
export type { AsyncStore };
import type { AsyncLocalStorage as AsyncLocalStorageType } from 'node:async_hooks';
import '../assertEnvServer.js';
type AsyncStore = null | {
    requestId: number;
    pageContext?: Record<string, unknown>;
};
declare function getAsyncLocalStorage(): Promise<AsyncLocalStorageType<AsyncStore> | null>;
declare function getRequestId_withAsyncHook(): number | null;
declare function getPageContext_withAsyncHook(): any;
