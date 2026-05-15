export { parseUrl };
export { assertUsageUrlAbsolute };
export { assertUsageUrlPathAbsolute };
export { assertUsageUrlRedirectTarget };
export { isUrl };
export { isUri };
export { isUrlRedirectTarget };
export { isUrlRelative };
export { isUrlExternal };
export { isBaseServer };
export { assertUrlComponents };
export { createUrlFromComponents };
export type { UrlPublic };
type UrlPublic = {
    /** The full URL. */
    href: string;
    /** The URL protocol, e.g. `https://` in `https://example.com` */
    protocol: null | string;
    /** The URL hostname, e.g. `example.com` in `https://example.com/product` and `localhost` in `http://localhost:3000/product` */
    hostname: null | string;
    /** The URL host port, e.g. `3000` in `http://localhost:3000/product` */
    port: null | number;
    /** The URL origin, e.g. `https://example.com` in `https://example.com/product/42` */
    origin: null | string;
    /** The URL pathname, e.g. `/product/42` in `https://example.com/product/42?details=yes#reviews` */
    pathname: string;
    /** URL pathname including the Base URL, e.g. `/some-base-url/product/42` in `https://example.com/some-base-url/product/42` (whereas `pageContext.urlParsed.pathname` is `/product/42`) */
    pathnameOriginal: string;
    /** The URL search parameters, e.g. `{ details: 'yes' }` for `https://example.com/product/42?details=yes#reviews` */
    search: Record<string, string>;
    /** The URL search parameters array, e.g. `{ fruit: ['apple', 'orange'] }` for `https://example.com?fruit=apple&fruit=orange` **/
    searchAll: Record<string, string[]>;
    /** The URL search parameterer string, e.g. `?details=yes` in `https://example.com/product/42?details=yes#reviews` */
    searchOriginal: null | `?${string}`;
    /** The URL hash, e.g. `reviews` in `https://example.com/product/42?details=yes#reviews` */
    hash: string;
    /** The URL hash string, e.g. `#reviews` in `https://example.com/product/42?details=yes#reviews` */
    hashOriginal: null | `#${string}`;
    /** @deprecated */
    hashString: null | string;
    /** @deprecated */
    searchString: null | string;
};
type UrlInternal = Omit<UrlPublic, 'hashString' | 'searchString'> & {
    isBaseMissing: boolean;
};
declare function parseUrl(url: string, baseServer: string): UrlInternal;
declare function isBaseServer(baseServer: string): boolean;
declare function assertUrlComponents(url: string, origin: string | null, pathnameOriginal: string, searchOriginal: string | null, hashOriginal: string | null): void;
declare function createUrlFromComponents(origin: string | null, pathname: string, search: string | null, hash: string | null): string;
declare function isUrl(url: string): boolean;
declare function isUrlRedirectTarget(url: string): boolean;
declare function isUrlRelative(url: string): boolean;
declare function isUrlExternal(url: string): boolean;
declare function isUri(uri: string): boolean;
declare function assertUsageUrlAbsolute(url: string, errPrefix: string): void;
declare function assertUsageUrlPathAbsolute(url: string, errPrefix: string): void;
declare function assertUsageUrlRedirectTarget(url: string, errPrefix: string, isUnresolved?: true): void;
