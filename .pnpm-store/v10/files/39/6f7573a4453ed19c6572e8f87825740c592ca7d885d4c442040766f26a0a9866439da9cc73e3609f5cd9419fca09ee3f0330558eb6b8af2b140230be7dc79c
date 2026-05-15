export { resolveRouteString };
export { getUrlFromRouteString };
export { isStaticRouteString };
export { analyzeRouteString };
export { assertRouteString };
export { getRouteStringParameterList };
declare function assertRouteString(routeString: string, errPrefix?: `${string}Invalid` | `${string}invalid`): void;
declare function resolveRouteString(routeString: string, urlPathname: string): null | {
    routeParams: Record<string, string>;
};
declare function getRouteStringParameterList(routeString: string): string[];
declare function getUrlFromRouteString(routeString: string): null | string;
declare function analyzeRouteString(routeString: string): {
    numberOfStaticPartsBeginning: number;
    numberOfStaticParts: number;
    numberOfParams: number;
    numberOfGlobs: number;
};
declare function isStaticRouteString(routeString: string): boolean;
