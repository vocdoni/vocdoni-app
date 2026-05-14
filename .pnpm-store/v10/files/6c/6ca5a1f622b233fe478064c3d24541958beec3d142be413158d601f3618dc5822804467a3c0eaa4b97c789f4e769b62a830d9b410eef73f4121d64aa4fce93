export { getGlobalContextPublicShared };
export type { GlobalContextPublicMinimum };
import type { PageConfigGlobalRuntime } from '../types/PageConfig.js';
type GlobalContextPublicMinimum = {
    _isOriginalObject: true;
    isGlobalContext: true;
    _pageConfigGlobal: PageConfigGlobalRuntime;
};
declare function getGlobalContextPublicShared<GlobalContext extends GlobalContextPublicMinimum>(globalContext: GlobalContext): GlobalContext & {
    _isProxyObject: true;
    _originalObject: GlobalContext;
} & {
    dangerouslyUseInternals: import("./getPublicProxy.js").DangerouslyUseInternals<GlobalContext>;
};
