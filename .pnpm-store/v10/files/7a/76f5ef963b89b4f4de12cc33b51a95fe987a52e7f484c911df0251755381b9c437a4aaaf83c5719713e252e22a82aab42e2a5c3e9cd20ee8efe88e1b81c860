export { resolveRedirects };
export { getStaticRedirectsForPrerender };
// For ./resolveRedirects.spec.ts
export { resolveRouteStringRedirect };
import { assert, assertUsage, assertWarning } from '../../../utils/assert.js';
import { isUrlRedirectTarget, assertUsageUrlRedirectTarget } from '../../../utils/parseUrl.js';
import { resolveUrlPathname } from '../../../shared-server-client/route/resolveUrlPathname.js';
import { assertRouteString, isStaticRouteString, resolveRouteString, } from '../../../shared-server-client/route/resolveRouteString.js';
import pc from '@brillout/picocolors';
import '../../assertEnvServer.js';
const redirectsErrPrefix = '[+redirects]';
function resolveRedirects(redirectsAll, urlPathname) {
    const redirects = merge(redirectsAll);
    for (const [urlSource, urlTarget] of Object.entries(redirects)) {
        const urlResolved = resolveRouteStringRedirect(urlSource, urlTarget, urlPathname);
        if (urlResolved)
            return urlResolved;
    }
    return null;
}
function getStaticRedirectsForPrerender(redirectsAll, showWarningUponDynamicRedirects) {
    const redirects = merge(redirectsAll);
    const redirectsStatic = {};
    for (const [urlSource, urlTarget] of Object.entries(redirects)) {
        assertRedirect(urlSource, urlTarget);
        if (isStaticRouteString(urlSource)) {
            redirectsStatic[urlSource] = urlTarget;
        }
        else if (showWarningUponDynamicRedirects) {
            assertWarning(false, `Dynamic redirect ${pc.cyan(urlSource)} -> ${pc.cyan(urlTarget)} cannot be pre-rendered. You can remove this warning by setting +prerender.partial to true (https://vike.dev/prerender#partial).`, { onlyOnce: true });
        }
    }
    return redirectsStatic;
}
function resolveRouteStringRedirect(urlSource, urlTarget, urlPathname) {
    assertRedirect(urlSource, urlTarget);
    const match = resolveRouteString(urlSource, urlPathname);
    if (!match)
        return null;
    const urlResolved = resolveUrlPathname(urlTarget, match.routeParams);
    if (urlResolved === urlPathname)
        return null;
    assert(isUrlRedirectTarget(urlResolved));
    return urlResolved;
}
function assertRedirect(urlSource, urlTarget) {
    assertRouteString(urlSource, `${redirectsErrPrefix} Invalid`);
    // Is allowing any protocol a safety issue? https://github.com/vikejs/vike/pull/1292#issuecomment-1828043917
    assertUsageUrlRedirectTarget(urlTarget, `${redirectsErrPrefix} The URL redirection target`, true);
    assertParams(urlSource, urlTarget);
}
function assertParams(urlSource, urlTarget) {
    const routeSegments = urlTarget.split('/');
    routeSegments.forEach((routeSegment) => {
        if (routeSegment.startsWith('@') || routeSegment.startsWith('*')) {
            const segments = urlSource.split('/');
            assertUsage(segments.includes(routeSegment), `${redirectsErrPrefix} The redirection source URL ${pc.string(urlSource)} is missing the URL parameter ${pc.string(routeSegment)} used by the redirection target URL ${pc.string(urlTarget)}`);
        }
    });
}
function merge(objs) {
    const obj = {};
    objs.forEach((e) => {
        Object.assign(obj, e);
    });
    return obj;
}
