export { getPageContextUrlComputed };
export type { PageContextUrlInternal };
export type { PageContextUrlClient };
export type { PageContextUrlServer };
export type { PageContextUrlSource };
import type { UrlPublic } from '../utils/parseUrl.js';
import type { PageContextCreated } from './createPageContextShared.js';
import type { PageContextExecHook } from './hooks/execHook.js';
type PageContextUrlComputed = {
    /** Parsed information about the current URL */
    urlParsed: UrlPublic;
    /** The URL pathname, e.g. `/product/42` of `https://example.com/product/42?details=yes#reviews` */
    urlPathname: string;
    /** @deprecated */
    url: string;
};
type PageContextUrl = {
    /** The URL of the HTTP request */
    urlOriginal: string;
} & PageContextUrlComputed;
type PageContextUrlInternal = PageContextUrl & PageContextCreated & PageContextExecHook & {
    _urlRewrite?: string;
};
type PageContextUrlClient = PageContextUrl;
type PageContextUrlServer = PageContextUrl & {
    urlParsed: Omit<PageContextUrl['urlParsed'], HashProps> & {
        /** Only available on the client-side */
        hash: '';
        /** Only available on the client-side */
        hashString: null;
        /** @deprecated */
        hashOriginal: null;
    };
};
type HashProps = 'hash' | 'hashString' | 'hashOriginal';
declare function getPageContextUrlComputed(pageContext: PageContextUrlSource): PageContextUrlComputed;
type PageContextUrlSource = {
    urlOriginal: string;
    urlLogical?: string;
    _urlRewrite?: string;
    _baseServer: string;
    _urlHandler: null | ((url: string) => string);
};
