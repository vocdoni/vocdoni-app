export { execHookGuard };
import { getHookFromPageContext, getHookTimeoutDefault } from '../hooks/getHook.js';
import { assert, assertUsage } from '../../utils/assert.js';
import { isCallable } from '../../utils/isCallable.js';
import { execHookSingle } from '../hooks/execHook.js';
const errIntro = 'The guard() hook defined by';
async function execHookGuard(pageContext, getPageContextPublic) {
    let hook;
    if (pageContext._globalContext._pageFilesAll.length > 0) {
        // TO-DO/next-major-release: remove
        // V0.4 design
        assert(pageContext._globalContext._pageConfigs.length === 0);
        hook = findPageGuard(pageContext.pageId, pageContext._globalContext._pageFilesAll);
    }
    else {
        // V1 design
        hook = getHookFromPageContext(pageContext, 'guard');
    }
    if (!hook)
        return;
    await execHookSingle(hook, pageContext, getPageContextPublic);
}
function findPageGuard(pageId, pageFilesAll) {
    const pageRouteFile = pageFilesAll.find((p) => p.pageId === pageId && p.fileType === '.page.route');
    if (!pageRouteFile)
        return null;
    const { filePath, fileExports } = pageRouteFile;
    assert(fileExports); // loadPageRoutes() should already have been called
    const hookFn = fileExports.guard;
    if (!hookFn)
        return null;
    const hookFilePath = filePath;
    const hookTimeout = getHookTimeoutDefault('guard');
    assertUsage(isCallable(hookFn), `${errIntro} ${hookFilePath} should be a function`);
    return { hookFn, hookName: 'guard', hookFilePath, hookTimeout };
}
