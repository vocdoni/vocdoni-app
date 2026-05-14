export { execHookOnBeforeRoute };
import { assertPageContextProvidedByUser } from '../assertPageContextProvidedByUser.js';
import { assertUsage, assertWarning, assert } from '../../utils/assert.js';
import { assertUsageUrlAbsolute } from '../../utils/parseUrl.js';
import { hasProp } from '../../utils/hasProp.js';
import { isObjectWithKeys } from '../../utils/isObjectWithKeys.js';
import { joinEnglish } from '../../utils/joinEnglish.js';
import { objectAssign } from '../../utils/objectAssign.js';
import { assertRouteParams, assertSyncRouting } from './resolveRouteFunction.js';
import pc from '@brillout/picocolors';
import { execHookSingleSync } from '../hooks/execHook.js';
import { getPageContextPublicShared } from '../getPageContextPublicShared.js';
async function execHookOnBeforeRoute(pageContext) {
    const pageContextFromOnBeforeRouteHook = {};
    if (!pageContext._globalContext._onBeforeRouteHook)
        return null;
    const pageContextFromHook = await getPageContextFromHook(pageContext._globalContext._onBeforeRouteHook, pageContext);
    if (pageContextFromHook) {
        objectAssign(pageContextFromOnBeforeRouteHook, pageContextFromHook);
        if (hasProp(pageContextFromOnBeforeRouteHook, 'pageId', 'string') ||
            hasProp(pageContextFromOnBeforeRouteHook, 'pageId', 'null')) {
            // We bypass Vike's routing
            if (!hasProp(pageContextFromOnBeforeRouteHook, 'routeParams')) {
                objectAssign(pageContextFromOnBeforeRouteHook, { routeParams: {} });
            }
            else {
                assert(hasProp(pageContextFromOnBeforeRouteHook, 'routeParams', 'object'));
            }
            objectAssign(pageContextFromOnBeforeRouteHook, {
                _routingProvidedByOnBeforeRouteHook: true,
            });
            return pageContextFromOnBeforeRouteHook;
        }
    }
    objectAssign(pageContextFromOnBeforeRouteHook, {
        _routingProvidedByOnBeforeRouteHook: false,
    });
    return pageContextFromOnBeforeRouteHook;
}
async function getPageContextFromHook(onBeforeRouteHook, pageContext) {
    let { hookReturn } = execHookSingleSync(onBeforeRouteHook, pageContext._globalContext, pageContext, getPageContextPublicShared);
    assertSyncRouting(hookReturn, `The onBeforeRoute() hook ${onBeforeRouteHook.hookFilePath}`);
    // TO-DO/next-major-release: make execHookOnBeforeRoute() and route() sync
    hookReturn = await hookReturn;
    const errPrefix = `The onBeforeRoute() hook defined by ${onBeforeRouteHook.hookFilePath}`;
    assertUsage(hookReturn === null ||
        hookReturn === undefined ||
        (isObjectWithKeys(hookReturn, ['pageContext']) && hasProp(hookReturn, 'pageContext')), `${errPrefix} should return ${pc.cyan('null')}, ${pc.cyan('undefined')}, or a plain JavaScript object ${pc.cyan('{ pageContext: { /* ... */ } }')}`);
    if (hookReturn === null || hookReturn === undefined) {
        return null;
    }
    assertUsage(hasProp(hookReturn, 'pageContext', 'object'), `${errPrefix} returned ${pc.cyan('{ pageContext }')} but pageContext should be a plain JavaScript object.`);
    if (hasProp(hookReturn.pageContext, 'pageId') && !hasProp(hookReturn.pageContext, 'pageId', 'null')) {
        const errPrefix2 = `${errPrefix} returned ${pc.cyan('{ pageContext: { pageId } }')} but ${pc.cyan('pageId')} should be`;
        assertUsage(hasProp(hookReturn.pageContext, 'pageId', 'string'), `${errPrefix2} a string or null`);
        assertUsage(pageContext._globalContext._allPageIds.includes(hookReturn.pageContext.pageId), `${errPrefix2} ${joinEnglish(pageContext._globalContext._allPageIds.map((s) => pc.cyan(s)), 'or')}`);
    }
    if (hasProp(hookReturn.pageContext, 'routeParams')) {
        assertRouteParams(hookReturn.pageContext, `${errPrefix} returned ${pc.cyan('{ pageContext: { routeParams } }')} but routeParams should`);
    }
    const deprecatedReturn = (prop) => `${errPrefix} returned ${pc.cyan(`{ pageContext: { ${prop} } }`)} which is deprecated. Return ${pc.cyan('{ pageContext: { urlLogical } }')} instead.`;
    if (hasProp(hookReturn.pageContext, 'url')) {
        assertWarning(false, deprecatedReturn('url'), { onlyOnce: true });
        hookReturn.pageContext.urlLogical = hookReturn.pageContext.url;
        delete hookReturn.pageContext.url;
    }
    if (hasProp(hookReturn.pageContext, 'urlOriginal')) {
        assertWarning(false, deprecatedReturn('urlOriginal'), { onlyOnce: true });
        hookReturn.pageContext.urlLogical = hookReturn.pageContext.urlOriginal;
        delete hookReturn.pageContext.urlOriginal;
    }
    if (hasProp(hookReturn.pageContext, 'urlLogical')) {
        assertUsageUrlAbsolute(
        // We type-cast instead of assertUsage() validation in order to save client-side KBs
        hookReturn.pageContext.urlLogical, `${errPrefix} returned ${pc.cyan('{ pageContext: { urlLogical } }')} and ${pc.cyan('urlLogical')}`);
    }
    assertPageContextProvidedByUser(hookReturn.pageContext, {
        hookFilePath: onBeforeRouteHook.hookFilePath,
        hookName: 'onBeforeRoute',
    });
    const pageContextAddendumHook = {};
    objectAssign(pageContextAddendumHook, hookReturn.pageContext);
    return pageContextAddendumHook;
}
