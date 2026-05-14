export { getHookFromPageContext };
export { getHooksFromPageContextNew };
export { getHookFromPageConfig };
export { getHookFromPageConfigGlobal };
export { getHooksFromPageConfigGlobalCumulative };
export { getHook_setIsPrerenderering };
// TO-DO/next-major-release: remove
// We export for old V0.4 design which doesn't support config.hooksTimeout
export { getHookTimeoutDefault };
import { getGlobalObject } from '../../utils/getGlobalObject.js';
import { getHookFilePathToShowToUser } from '../page-configs/helpers.js';
import { getConfigValueRuntime } from '../page-configs/getConfigValueRuntime.js';
import { assert, assertUsage } from '../../utils/assert.js';
import { checkType } from '../../utils/checkType.js';
import { isArray } from '../../utils/isArray.js';
import { isCallable } from '../../utils/isCallable.js';
import { isObject } from '../../utils/isObject.js';
import pc from '@brillout/picocolors';
const globalObject = getGlobalObject('hooks/getHook.ts', {});
function getHookFromPageContext(pageContext, hookName) {
    if (!(hookName in pageContext.exports)) {
        return null;
    }
    const { hooksTimeout } = pageContext.config;
    const hookTimeout = getHookTimeout(hooksTimeout, hookName);
    const hookFn = pageContext.exports[hookName];
    if (hookFn === null)
        return null;
    // TO-DO/eventually: use pageContext.configEntries in favor of pageContext.exportsAll once V0.4 is removed
    const file = pageContext.exportsAll[hookName][0];
    assert(file.exportValue === hookFn);
    const hookFilePath = file.filePath;
    assert(hookFilePath);
    return getHook(hookFn, hookName, hookFilePath, hookTimeout);
}
// TO-DO/eventually: remove getHookFromPageContext() in favor of getHooksFromPageContextNew()
function getHooksFromPageContextNew(hookName, pageContext) {
    const { hooksTimeout } = pageContext.config;
    const hookTimeout = getHookTimeout(hooksTimeout, hookName);
    const hooks = [];
    /* TO-DO/eventually: use pageContext.configEntries in favor of pageContext.exportsAll once V0.4 is removed
    pageContext.configEntries[hookName]?.forEach((val) => {
      const hookFn = val.configValue
      if (hookFn === null) return
      const hookFilePath = val.configDefinedByFile
    */
    pageContext.exportsAll[hookName]?.forEach((val) => {
        const hookFn = val.exportValue;
        if (hookFn === null)
            return;
        const hookFilePath = val.filePath;
        assert(hookFilePath);
        hooks.push(getHook(hookFn, hookName, hookFilePath, hookTimeout));
    });
    return hooks;
}
function getHookFromPageConfig(pageConfig, hookName) {
    const configValue = getConfigValueRuntime(pageConfig, hookName);
    if (!configValue?.value)
        return null;
    const { hookFn, hookFilePath } = getHookFromConfigValue(configValue);
    const hooksTimeout = getConfigValueRuntime(pageConfig, 'hooksTimeout')?.value;
    const hookTimeout = getHookTimeout(hooksTimeout, hookName);
    return getHook(hookFn, hookName, hookFilePath, hookTimeout);
}
function getHookFromPageConfigGlobal(pageConfigGlobal, hookName) {
    const configValue = pageConfigGlobal.configValues[hookName];
    if (!configValue?.value)
        return null;
    const { hookFn, hookFilePath } = getHookFromConfigValue(configValue);
    const hookTimeout = getHookTimeoutGlobal(hookName);
    return getHook(hookFn, hookName, hookFilePath, hookTimeout);
}
function getHooksFromPageConfigGlobalCumulative(pageConfigGlobal, hookName) {
    const configValue = pageConfigGlobal.configValues[hookName];
    if (!configValue?.value)
        return [];
    const val = configValue.value;
    assert(isArray(val));
    return val.map((v, i) => {
        const hookFn = v;
        const hookTimeout = getHookTimeoutGlobal(hookName);
        assert(isArray(configValue.definedAtData));
        const hookFilePath = getHookFilePathToShowToUser(configValue.definedAtData[i]);
        return getHook(hookFn, hookName, hookFilePath, hookTimeout);
    });
}
function getHookTimeoutGlobal(hookName) {
    // TO-DO/perfection: we could use the global value of configooksTimeout but it requires some non-trivial refactoring
    const hookTimeout = getHookTimeoutDefault(hookName);
    return hookTimeout;
}
function getHook(hookFn, hookName, hookFilePath, hookTimeout) {
    assert(hookFilePath);
    assertHookFn(hookFn, { hookName, hookFilePath });
    const hook = { hookFn, hookName, hookFilePath, hookTimeout };
    return hook;
}
function getHookFromConfigValue(configValue) {
    const hookFn = configValue.value;
    assert(hookFn);
    const hookFilePath = getHookFilePathToShowToUser(configValue.definedAtData);
    return { hookFn, hookFilePath };
}
function assertHookFn(hookFn, { hookName, hookFilePath }) {
    assert(hookName && hookFilePath);
    assert(!hookName.endsWith(')'));
    assert(!hookFilePath.endsWith(' '));
    assertUsage(isCallable(hookFn), `Hook ${hookName}() defined by ${hookFilePath} should be a function`);
    checkType(hookFn);
}
function getHookTimeout(hooksTimeoutProvidedByUser, hookName) {
    const hooksTimeoutProvidedbyUserNormalized = getHooksTimeoutProvidedByUserNormalized(hooksTimeoutProvidedByUser);
    if (hooksTimeoutProvidedbyUserNormalized === false)
        return { error: false, warning: false };
    const providedbyUser = hooksTimeoutProvidedbyUserNormalized[hookName];
    const hookTimeout = getHookTimeoutDefault(hookName);
    if (providedbyUser?.error !== undefined)
        hookTimeout.error = providedbyUser.error;
    if (providedbyUser?.warning !== undefined)
        hookTimeout.warning = providedbyUser.warning;
    return hookTimeout;
}
// Ideally this should be called only once and at build-time (to avoid bloating the client-side bundle), but we didn't implement any mechanism to valid config values at build-time yet
function getHooksTimeoutProvidedByUserNormalized(hooksTimeoutProvidedByUser) {
    if (hooksTimeoutProvidedByUser === undefined)
        return {};
    if (hooksTimeoutProvidedByUser === false)
        return false;
    assertUsage(isObject(hooksTimeoutProvidedByUser), `Setting ${pc.cyan('hooksTimeout')} should be ${pc.cyan('false')} or an object`);
    const hooksTimeoutProvidedByUserNormalized = {};
    Object.entries(hooksTimeoutProvidedByUser).forEach(([hookName, hookTimeoutProvidedbyUser]) => {
        if (hookTimeoutProvidedbyUser === false) {
            hooksTimeoutProvidedByUserNormalized[hookName] = { error: false, warning: false };
            return;
        }
        assertUsage(isObject(hookTimeoutProvidedbyUser), `Setting ${pc.cyan(`hooksTimeout.${hookName}`)} should be ${pc.cyan('false')} or an object`);
        const [error, warning] = ['error', 'warning'].map((timeoutName) => {
            const timeoutVal = hookTimeoutProvidedbyUser[timeoutName];
            if (timeoutVal === undefined || timeoutVal === false)
                return timeoutVal;
            const errPrefix = `Setting ${pc.cyan(`hooksTimeout.${hookName}.${timeoutName}`)} should be`;
            assertUsage(typeof timeoutVal === 'number', `${errPrefix} ${pc.cyan('false')} or a number`);
            assertUsage(timeoutVal > 0, `${errPrefix} a positive number`);
            return timeoutVal;
        });
        hooksTimeoutProvidedByUserNormalized[hookName] = { error, warning };
    });
    return hooksTimeoutProvidedByUserNormalized;
}
function getHookTimeoutDefault(hookName) {
    if (hookName === 'onBeforeRoute') {
        return {
            error: 5 * 1000,
            warning: 1 * 1000,
        };
    }
    if (globalObject.isPrerendering) {
        return {
            error: 2 * 60 * 1000,
            warning: 30 * 1000,
        };
    }
    else {
        assert(!hookName.toLowerCase().includes('prerender'));
    }
    return {
        error: 30 * 1000,
        warning: 4 * 1000,
    };
}
function getHook_setIsPrerenderering() {
    globalObject.isPrerendering = true;
}
