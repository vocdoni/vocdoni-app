export { redirect };
export { render };
export { RenderErrorPage };
export { isAbortError };
export { isAbortPageContext };
export { logAbort };
export { getPageContextAddendumAbort };
export { addNewPageContextAborted };
export { AbortRender };
import { isUserHookError } from '../hooks/execHook.js';
import { assert, assertInfo, assertUsage, assertWarning } from '../../utils/assert.js';
import { assertUsageUrlPathAbsolute, assertUsageUrlRedirectTarget } from '../../utils/parseUrl.js';
import { checkType } from '../../utils/checkType.js';
import { hasProp } from '../../utils/hasProp.js';
import { isBrowser } from '../../utils/isBrowser.js';
import { joinEnglish } from '../../utils/joinEnglish.js';
import { objectAssign } from '../../utils/objectAssign.js';
import { truncateString } from '../../utils/truncateString.js';
import { unique } from '../../utils/unique.js';
import pc from '@brillout/picocolors';
/**
 * Abort the rendering of the current page, and redirect the user to another URL instead.
 *
 * https://vike.dev/redirect
 *
 * @param url The URL to redirect to.
 * @param statusCode By default the temporary redirection status code (`302`) is sent. For permanent redirections (`301`), use `+redirects` (https://vike.dev/redirects) or set this `statusCode` argument to `301`.
 */
function redirect(url, statusCode) {
    const abortCaller = 'throw redirect()';
    assertUsageUrlRedirectTarget(url, getErrPrefix(abortCaller));
    const args = [JSON.stringify(url)];
    if (!statusCode) {
        statusCode = 302;
    }
    else {
        if (
        // Tree-shaking to save client-side KBs
        !globalThis.__VIKE__IS_CLIENT ||
            globalThis.__VIKE__IS_DEV ||
            globalThis.__VIKE__IS_DEBUG) {
            assertStatusCode(statusCode, [301, 302], 'redirect');
        }
        args.push(String(statusCode));
    }
    const pageContextAbort = {};
    objectAssign(pageContextAbort, {
        _abortCaller: abortCaller,
        _abortCall: `redirect(${args.join(', ')})`,
        _urlRedirect: {
            url,
            statusCode,
        },
    });
    return AbortRender(pageContextAbort);
}
function render(urlOrStatusCode, abortReason) {
    const args = [typeof urlOrStatusCode === 'number' ? String(urlOrStatusCode) : JSON.stringify(urlOrStatusCode)];
    if (abortReason !== undefined)
        args.push(truncateString(JSON.stringify(abortReason), 30));
    const abortCaller = 'throw render()';
    const abortCall = `render(${args.join(', ')})`;
    return render_(urlOrStatusCode, abortReason, abortCall, abortCaller);
}
function render_(urlOrStatusCode, abortReason, abortCall, abortCaller, pageContextAddendum) {
    const pageContextAbort = {
        abortReason,
        _abortCaller: abortCaller,
        _abortCall: abortCall,
    };
    if (pageContextAddendum) {
        assert(pageContextAddendum._isLegacyRenderErrorPage === true);
        objectAssign(pageContextAbort, pageContextAddendum);
    }
    if (typeof urlOrStatusCode === 'string') {
        const url = urlOrStatusCode;
        assertUsageUrlPathAbsolute(url, getErrPrefix(abortCaller));
        objectAssign(pageContextAbort, {
            _urlRewrite: url,
        });
        return AbortRender(pageContextAbort);
    }
    else {
        if (
        // Tree-shaking to save client-side KBs
        !globalThis.__VIKE__IS_CLIENT ||
            globalThis.__VIKE__IS_DEV ||
            globalThis.__VIKE__IS_DEBUG) {
            assertStatusCode(urlOrStatusCode, [401, 403, 404, 410, 429, 500, 503], 'render');
        }
        const abortStatusCode = urlOrStatusCode;
        objectAssign(pageContextAbort, {
            abortStatusCode,
            is404: abortStatusCode === 404,
        });
        return AbortRender(pageContextAbort);
    }
}
function AbortRender(pageContextAbort) {
    const err = new Error('AbortRender');
    objectAssign(err, { _pageContextAbort: pageContextAbort, [stamp]: true });
    checkType(err);
    return err;
}
// TO-DO/next-major-release: remove
/**
 * @deprecated Use `throw render()` or `throw redirect()` instead, see https://vike.dev/render'
 */
function RenderErrorPage({ pageContext = {} } = {}) {
    assertWarning(false, `${pc.cyan('throw RenderErrorPage()')} is deprecated and will be removed in the next major release. Use ${pc.cyan('throw render()')} or ${pc.cyan('throw redirect()')} instead, see https://vike.dev/render`, { onlyOnce: false });
    let abortStatusCode = 404;
    let abortReason = 'Page Not Found';
    if (pageContext.is404 === false || pageContext.pageProps?.is404 === false) {
        abortStatusCode = 500;
        abortReason = 'Something went wrong';
    }
    objectAssign(pageContext, { _isLegacyRenderErrorPage: true });
    return render_(abortStatusCode, abortReason, 'RenderErrorPage()', 'throw RenderErrorPage()', pageContext);
}
const stamp = '_isAbortError';
function isAbortError(thing) {
    return typeof thing === 'object' && thing !== null && stamp in thing;
}
function isAbortPageContext(pageContext) {
    if (!(pageContext._urlRewrite || pageContext._urlRedirect || pageContext.abortStatusCode)) {
        return false;
    }
    assert(hasProp(pageContext, '_abortCall', 'string'));
    /* Isn't needed and is missing on the client-side
    assert(hasProp(pageContext, '_abortCaller', 'string'))
    */
    checkType(pageContext);
    return true;
}
function logAbort(err, isProduction, pageContext) {
    if (isProduction)
        return;
    const urlCurrent = pageContext._urlRewrite ?? pageContext.urlOriginal;
    assert(urlCurrent);
    const abortCall = err._pageContextAbort._abortCall;
    assert(abortCall);
    const hookLoc = isUserHookError(err);
    let thrownBy = '';
    if (hookLoc) {
        thrownBy = ` by ${pc.cyan(`${hookLoc.hookName}()`)} hook defined at ${hookLoc.hookFilePath}`;
    }
    else {
        // hookLoc is missing when serializing abort errors from server to client
    }
    assertInfo(false, `${pc.cyan(abortCall)} thrown${thrownBy} while rendering ${pc.cyan(urlCurrent)}`, {
        onlyOnce: false,
    });
}
function assertStatusCode(statusCode, expected, caller) {
    assert(!globalThis.__VIKE__IS_CLIENT || globalThis.__VIKE__IS_DEV || globalThis.__VIKE__IS_DEBUG); // assert tree-shaking
    // double check vike:pluginReplaceConstantsGlobalThis
    if (globalThis.__VIKE__IS_CLIENT) {
        assert(isBrowser());
        assert(typeof globalThis.__VIKE__IS_DEV === 'boolean');
        assert(typeof globalThis.__VIKE__IS_CLIENT === 'boolean');
        assert(import.meta.env.SSR === false);
        assert(import.meta.env.DEV === globalThis.__VIKE__IS_DEV);
    }
    else {
        assert(!isBrowser());
        if (globalThis.__VIKE__NO_EXTERNAL) {
            assert(typeof globalThis.__VIKE__IS_DEV === 'boolean');
            assert(typeof globalThis.__VIKE__IS_CLIENT === 'boolean');
            assert(import.meta.env.SSR === true);
            assert(import.meta.env.DEV === globalThis.__VIKE__IS_DEV);
        }
    }
    const expectedEnglish = joinEnglish(expected.map((s) => pc.bold(String(s))), 'or');
    const statusCodeWithColor = pc.bold(String(statusCode));
    if (statusCode === 400) {
        assert(!expected.includes(statusCode));
        assertWarning(false, `We recommend against using the status code ${statusCodeWithColor} passed to ${caller}() — we recommend using ${pc.bold('404')} instead, see https://github.com/vikejs/vike/issues/1008#issuecomment-3270894445`, { onlyOnce: true, showStackTrace: true });
    }
    else {
        assertWarning(expected.includes(statusCode), `Unexpected status code ${statusCodeWithColor} passed to ${caller}() — we recommend using ${expectedEnglish} instead. (Or reach out at https://github.com/vikejs/vike/issues/1008 if you believe ${statusCodeWithColor} should be added.)`, { onlyOnce: true, showStackTrace: true });
    }
}
function getPageContextAddendumAbort(pageContextsAborted) {
    const pageContextAbortedLast = pageContextsAborted.at(-1);
    if (!pageContextAbortedLast)
        return null;
    const pageContextAbort = pageContextAbortedLast._pageContextAbort;
    assert(pageContextAbort);
    // Sets pageContext._urlRewrite from pageContextAbort._urlRewrite
    return pageContextAbort;
}
function addNewPageContextAborted(pageContextsAborted, pageContext, pageContextAbort) {
    objectAssign(pageContext, { _pageContextAbort: pageContextAbort });
    pageContextsAborted.push(pageContext);
    assertNoInfiniteAbortLoop(pageContextsAborted);
}
// There doesn't seem to be a way to count the number of HTTP redirects (Vike doesn't have access to the HTTP request headers/cookies)
// https://stackoverflow.com/questions/9683007/detect-infinite-http-redirect-loop-on-server-side
function assertNoInfiniteAbortLoop(pageContextsAborted) {
    if (pageContextsAborted.length < 10)
        return;
    const loop = pageContextsAborted.map((pageContext) => {
        return pageContext._pageContextAbort._abortCall;
    });
    // Unique array => no redundant call => no infinite loop
    if (unique(loop).length === loop.length)
        return;
    assertUsage(false, `Infinite loop: ${loop.join(' => ')}`);
}
function getErrPrefix(abortCaller) {
    return `URL passed to ${pc.code(abortCaller)}`;
}
