export { loadPageRoutes };
export { loadPageRoutesSync };
import { isErrorPageId } from '../error-page.js';
import { assert, assertUsage } from '../../utils/assert.js';
import { hasProp } from '../../utils/hasProp.js';
import { isArray } from '../../utils/isArray.js';
import { isCallable } from '../../utils/isCallable.js';
import { slice } from '../../utils/slice.js';
import { deduceRouteStringFromFilesystemPath } from './deduceRouteStringFromFilesystemPath.js';
import { getConfigValueRuntime } from '../page-configs/getConfigValueRuntime.js';
import { getDefinedAtString } from '../page-configs/getConfigDefinedAt.js';
import { warnDeprecatedAllowKey } from './resolveRouteFunction.js';
import { getHookFromPageConfigGlobal, getHookTimeoutDefault } from '../hooks/getHook.js';
async function loadPageRoutes(
// Remove all arguments and use GlobalContextServerInternal instead?
pageFilesAll, pageConfigs, pageConfigGlobal, allPageIds) {
    // TO-DO/next-major-release: remove this line, remove this function, rename loadPageRoutesSync() to loadPageRoutes()
    await Promise.all(pageFilesAll.filter((p) => p.fileType === '.page.route').map((p) => p.loadFile?.()));
    return loadPageRoutesSync(pageFilesAll, pageConfigs, pageConfigGlobal, allPageIds);
}
function loadPageRoutesSync(
// Remove all arguments and use GlobalContextServerInternal instead?
pageFilesAll, pageConfigs, pageConfigGlobal, allPageIds) {
    const { onBeforeRouteHook, filesystemRoots } = getGlobalHooks(pageFilesAll, pageConfigs, pageConfigGlobal);
    const pageRoutes = getPageRoutes(filesystemRoots, pageFilesAll, pageConfigs, allPageIds);
    return { pageRoutes, onBeforeRouteHook };
}
function getPageRoutes(filesystemRoots, pageFilesAll, pageConfigs, allPageIds) {
    const pageRoutes = [];
    // V1 Design
    if (pageConfigs.length > 0) {
        assert(filesystemRoots === null);
        const comesFromV1PageConfig = true;
        pageConfigs
            .filter((p) => !p.isErrorPage)
            .forEach((pageConfig) => {
            const pageId = pageConfig.pageId;
            let pageRoute = null;
            {
                const configName = 'route';
                const configValue = getConfigValueRuntime(pageConfig, configName);
                if (configValue) {
                    const route = configValue.value;
                    assert(configValue.definedAtData);
                    const definedAtString = getDefinedAtString(configValue.definedAtData, configName);
                    if (typeof route === 'string') {
                        pageRoute = {
                            pageId,
                            comesFromV1PageConfig,
                            routeString: route,
                            routeDefinedAtString: definedAtString,
                            routeType: 'STRING',
                        };
                    }
                    else {
                        const { definedAtData } = configValue;
                        assert(!isArray(definedAtData) && !definedAtData.definedBy);
                        const { filePathToShowToUser } = definedAtData;
                        assert(filePathToShowToUser);
                        assert(isCallable(route));
                        // TO-DO/next-major-release: remove
                        if (getConfigValueRuntime(pageConfig, 'iKnowThePerformanceRisksOfAsyncRouteFunctions', 'boolean'))
                            warnDeprecatedAllowKey();
                        pageRoute = {
                            pageId,
                            comesFromV1PageConfig,
                            routeFunction: route,
                            routeFunctionFilePath: filePathToShowToUser,
                            routeDefinedAtString: definedAtString,
                            routeType: 'FUNCTION',
                        };
                    }
                }
            }
            if (!pageRoute) {
                const { routeFilesystem } = pageConfig;
                assert(routeFilesystem);
                const { routeString, definedAtLocation } = routeFilesystem;
                assert(routeFilesystem.routeString.startsWith('/'));
                pageRoute = {
                    pageId,
                    routeFilesystemDefinedBy: definedAtLocation,
                    comesFromV1PageConfig,
                    routeString,
                    routeDefinedAtString: null,
                    routeType: 'FILESYSTEM',
                };
            }
            assert(pageRoute);
            pageRoutes.push(pageRoute);
        });
    }
    // Old design
    // TO-DO/next-major-release: remove
    if (pageConfigs.length === 0) {
        assert(filesystemRoots);
        const comesFromV1PageConfig = false;
        allPageIds
            .filter((pageId) => !isErrorPageId(pageId, false))
            .forEach((pageId) => {
            const pageRouteFile = pageFilesAll.find((p) => p.pageId === pageId && p.fileType === '.page.route');
            if (!pageRouteFile || !('default' in pageRouteFile.fileExports)) {
                const routeString = deduceRouteStringFromFilesystemPath(pageId, filesystemRoots);
                assert(routeString.startsWith('/'));
                assert(!routeString.endsWith('/') || routeString === '/');
                pageRoutes.push({
                    pageId,
                    comesFromV1PageConfig,
                    routeString,
                    routeDefinedAtString: null,
                    routeFilesystemDefinedBy: `${pageId}.page.*`,
                    routeType: 'FILESYSTEM',
                });
            }
            else {
                const { filePath, fileExports } = pageRouteFile;
                assert(fileExports.default);
                if (hasProp(fileExports, 'default', 'string')) {
                    const routeString = fileExports.default;
                    assertUsage(routeString.startsWith('/'), `A Route String should start with a leading slash '/' but ${filePath} has \`export default '${routeString}'\`. Make sure to \`export default '/${routeString}'\` instead.`);
                    pageRoutes.push({
                        pageId,
                        comesFromV1PageConfig,
                        routeString,
                        routeDefinedAtString: filePath,
                        routeType: 'STRING',
                    });
                    return;
                }
                if (hasProp(fileExports, 'default', 'function')) {
                    const routeFunction = fileExports.default;
                    {
                        const allowKey = 'iKnowThePerformanceRisksOfAsyncRouteFunctions';
                        if (allowKey in fileExports) {
                            warnDeprecatedAllowKey();
                        }
                    }
                    pageRoutes.push({
                        pageId,
                        comesFromV1PageConfig,
                        routeFunction,
                        routeFunctionFilePath: filePath,
                        routeDefinedAtString: filePath,
                        routeType: 'FUNCTION',
                    });
                    return;
                }
                assertUsage(false, `The default export of ${filePath} should be a string or a function.`);
            }
        });
    }
    return pageRoutes;
}
function getGlobalHooks(pageFilesAll, pageConfigs, pageConfigGlobal) {
    // V1 Design
    if (pageConfigs.length > 0) {
        const hook = getHookFromPageConfigGlobal(pageConfigGlobal, 'onBeforeRoute');
        return { onBeforeRouteHook: hook, filesystemRoots: null };
    }
    // Old design
    // TO-DO/next-major-release: remove
    let onBeforeRouteHook = null;
    const filesystemRoots = [];
    pageFilesAll
        .filter((p) => p.fileType === '.page.route' && p.isDefaultPageFile)
        .forEach(({ filePath, fileExports }) => {
        assert(fileExports);
        if ('onBeforeRoute' in fileExports) {
            assertUsage(hasProp(fileExports, 'onBeforeRoute', 'function'), `\`export { onBeforeRoute }\` of ${filePath} should be a function.`);
            const { onBeforeRoute } = fileExports;
            const hookName = 'onBeforeRoute';
            onBeforeRouteHook = {
                hookFilePath: filePath,
                hookFn: onBeforeRoute,
                hookName,
                hookTimeout: getHookTimeoutDefault(hookName),
            };
        }
        if ('filesystemRoutingRoot' in fileExports) {
            assertUsage(hasProp(fileExports, 'filesystemRoutingRoot', 'string'), `\`export { filesystemRoutingRoot }\` of ${filePath} should be a string.`);
            assertUsage(hasProp(fileExports, 'filesystemRoutingRoot', 'string'), `\`export { filesystemRoutingRoot }\` of ${filePath} is \`'${fileExports.filesystemRoutingRoot}'\` but it should start with a leading slash \`/\`.`);
            filesystemRoots.push({
                filesystemRoot: dirname(filePath),
                urlRoot: fileExports.filesystemRoutingRoot,
            });
        }
    });
    return { onBeforeRouteHook, filesystemRoots };
}
function dirname(filePath) {
    assert(filePath.startsWith('/'));
    assert(!filePath.endsWith('/'));
    const paths = filePath.split('/');
    const dirPath = slice(paths, 0, -1).join('/') || '/';
    assert(dirPath.startsWith('/'));
    assert(!dirPath.endsWith('/') || dirPath === '/');
    return dirPath;
}
