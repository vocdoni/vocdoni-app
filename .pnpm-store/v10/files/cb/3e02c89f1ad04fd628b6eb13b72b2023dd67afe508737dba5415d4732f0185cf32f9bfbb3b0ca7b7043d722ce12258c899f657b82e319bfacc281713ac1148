export { getPageContextPublicShared };
export { assertPropertyGetters };
export type { PageContextPublicMinimum };
import type { PageContextCreated } from './createPageContextShared.js';
type PageContextPublicMinimum = PageContextCreated;
declare function getPageContextPublicShared<PageContext extends PageContextPublicMinimum>(pageContext: PageContext): PageContext & {
    _isProxyObject: true;
    _originalObject: PageContext;
} & {
    dangerouslyUseInternals: import("./getPublicProxy.js").DangerouslyUseInternals<PageContext>;
};
declare function assertPropertyGetters(pageContext: Record<string, unknown>): void;
