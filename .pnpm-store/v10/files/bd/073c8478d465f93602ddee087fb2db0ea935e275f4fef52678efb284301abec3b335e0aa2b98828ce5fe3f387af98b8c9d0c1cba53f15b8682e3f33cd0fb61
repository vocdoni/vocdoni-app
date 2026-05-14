export { redirect };
export { render };
export { RenderErrorPage };
export { isAbortError };
export { isAbortPageContext };
export { logAbort };
export { getPageContextAddendumAbort };
export { addNewPageContextAborted };
export { AbortRender };
export type { RedirectStatusCode };
export type { AbortStatusCode };
export type { ErrorAbort };
export type { PageContextAborted };
export type { UrlRedirect };
export type { PageContextAbort };
type RedirectStatusCode = number & Parameters<typeof redirect>[1];
type AbortStatusCode = number & Parameters<InferTwoOverloads<typeof render>[0]>[0];
type UrlRedirect = {
    url: string;
    statusCode: RedirectStatusCode;
};
type AbortRedirect = Error;
type AbortReason = Required<({
    abortReason?: unknown;
} & Vike.PageContext)['abortReason']>;
/**
 * Abort the rendering of the current page, and redirect the user to another URL instead.
 *
 * https://vike.dev/redirect
 *
 * @param url The URL to redirect to.
 * @param statusCode By default the temporary redirection status code (`302`) is sent. For permanent redirections (`301`), use `+redirects` (https://vike.dev/redirects) or set this `statusCode` argument to `301`.
 */
declare function redirect(url: string, statusCode?: 301 | 302): AbortRedirect;
/**
 * Abort the rendering of the current page, and render the error page instead.
 *
 * https://vike.dev/render
 *
 *
 * **Recommended** status codes:
 *   `401` — Unauthorized (user isn't logged in)
 *   `403` — Forbidden (user is logged in but isn't allowed)
 *   `404` — Not Found
 *   `410` — Gone (use this instead of `404` if the page existed in the past, see https://github.com/vikejs/vike/issues/1097#issuecomment-1695260887)
 *   `429` — Too Many Requests (rate limiting)
 *   `500` — Internal Server Error (your client or server has a bug)
 *   `503` — Service Unavailable (server is overloaded, or a third-party API isn't responding)
 *
 * **Not recommended** status codes:
 *   `400` — See https://github.com/vikejs/vike/issues/1008#issuecomment-3270894445
 *   Other status codes — See https://github.com/vikejs/vike/issues/1008
 *
 * @param abortStatusCode - One of the recommended status codes listed above.
 *
 * @param abortReason - Sets `pageContext.abortReason` which is usually used by the error page to show a message to the user, see https://vike.dev/error-page
 */
declare function render(abortStatusCode: 401 | 403 | 404 | 410 | 429 | 500 | 503, abortReason?: AbortReason): Error;
/**
 * Abort the rendering of the current page, and render another page instead.
 *
 * https://vike.dev/render
 *
 * @param url The URL to render.
 * @param abortReason Sets `pageContext.abortReason` which is used by the error page to show a message to the user, see https://vike.dev/error-page
 */
declare function render(url: `/${string}`, abortReason?: AbortReason): Error;
type AbortCall = `redirect(${string})` | `render(${string})` | `RenderErrorPage()`;
type AbortCaller = `throw redirect()` | `throw render()` | `throw RenderErrorPage()`;
type PageContextAbort = {
    _abortCall: AbortCall;
    _abortCaller: AbortCaller;
} & (({
    _abortCall: `redirect(${string})`;
    _abortCaller: 'throw redirect()';
    _urlRedirect: UrlRedirect;
} & Omit<AbortUndefined, '_urlRedirect'>) | ({
    _abortCall: `render(${string})` | `RenderErrorPage()`;
    _abortCaller: 'throw render()' | 'throw RenderErrorPage()';
    abortReason: undefined | unknown;
    _urlRewrite: string;
} & Omit<AbortUndefined, '_urlRewrite'>) | ({
    _abortCall: `render(${string})` | `RenderErrorPage()`;
    _abortCaller: 'throw render()' | 'throw RenderErrorPage()';
    abortReason: undefined | unknown;
    abortStatusCode: AbortStatusCode;
} & Omit<AbortUndefined, 'abortStatusCode'>));
type AbortUndefined = {
    _urlRedirect?: undefined;
    _urlRewrite?: undefined;
    abortStatusCode?: undefined;
};
declare function AbortRender(pageContextAbort: PageContextAbort): Error;
/**
 * @deprecated Use `throw render()` or `throw redirect()` instead, see https://vike.dev/render'
 */
declare function RenderErrorPage({ pageContext }?: {
    pageContext?: Record<string, unknown>;
}): Error;
type ErrorAbort = {
    _pageContextAbort: PageContextAbort;
};
declare function isAbortError(thing: unknown): thing is ErrorAbort;
declare function isAbortPageContext(pageContext: Record<string, unknown>): pageContext is PageContextAbort;
declare function logAbort(err: ErrorAbort, isProduction: boolean, pageContext: {
    urlOriginal: string;
    _urlRewrite?: string;
}): void;
type PageContextMin = {
    urlOriginal: string;
};
type PageContextAborted = {
    _pageContextAbort: PageContextAbort;
} & PageContextMin;
declare function getPageContextAddendumAbort(pageContextsAborted: PageContextAborted[]): PageContextAbort | null;
declare function addNewPageContextAborted(pageContextsAborted: PageContextAborted[], pageContext: PageContextMin, pageContextAbort: PageContextAbort): void;
type InferTwoOverloads<F extends Function> = F extends {
    (...a1: infer A1): infer R1;
    (...a0: infer A0): infer R0;
} ? [(...a1: A1) => R1, (...a0: A0) => R0] : never;
