export { route };
export type { PageContextBeforeRoute };
export type { PageContextAfterRoute };
export type { PageRoutes };
export type { RouteMatches };
import type { PageContextUrlInternal, PageContextUrlSource } from '../getPageContextUrlComputed.js';
import type { PageRoutes, RouteType } from './loadPageRoutes.js';
import type { GlobalContextInternal } from '../createGlobalContextShared.js';
type PageContextBeforeRoute = PageContextUrlInternal & {
    _globalContext: GlobalContextInternal;
} & PageContextUrlSource;
type PageContextAfterRoute = {
    pageId: string | null;
    routeParams: Record<string, string>;
    _routingProvidedByOnBeforeRouteHook?: boolean;
};
type RouteMatch = {
    pageId: string;
    routeString?: string;
    precedence?: number | null;
    routeType: RouteType;
    routeParams: Record<string, string>;
};
type RouteMatches = 'CUSTOM_ROUTING' | RouteMatch[];
declare function route(pageContext: PageContextBeforeRoute, skipOnBeforeRouteHook?: true): Promise<PageContextAfterRoute>;
