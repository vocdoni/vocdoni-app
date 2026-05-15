export { resolveRouteFunction };
export { assertRouteParams };
export { assertSyncRouting };
export { warnDeprecatedAllowKey };
import type { PageContextUrlInternal } from '../getPageContextUrlComputed.js';
declare function resolveRouteFunction(routeFunction: (arg: unknown) => unknown, pageContext: PageContextUrlInternal, routeFunctionFilePath: string): Promise<null | {
    precedence: number | null;
    routeParams: Record<string, string>;
}>;
declare function assertSyncRouting(res: unknown, errPrefix: string): void;
declare function warnDeprecatedAllowKey(): void;
declare function assertRouteParams<T>(result: T, errPrefix: `${string} should`): asserts result is T & {
    routeParams?: Record<string, string>;
};
