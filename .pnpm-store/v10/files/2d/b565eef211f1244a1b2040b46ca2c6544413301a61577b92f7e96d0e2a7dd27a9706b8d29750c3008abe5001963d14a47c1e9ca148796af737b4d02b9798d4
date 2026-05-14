export { getVikeConfigError };
export { getVikeConfigErrorBuild };
export { setVikeConfigError };
export { debugFileChange };
import { createDebug } from '../utils/debug.js';
import { getGlobalObject } from '../utils/getGlobalObject.js';
const globalObject = getGlobalObject('server/shared/getVikeConfigError.ts', {
    errorRuntime: false,
    errorBuild: false,
});
const debugFileChange = createDebug('vike:file-change');
function setVikeConfigError(val) {
    debugFileChange('setVikeConfigError()', val);
    if ('errorRuntime' in val)
        globalObject.errorRuntime = val.errorRuntime;
    if ('errorBuild' in val)
        globalObject.errorBuild = val.errorBuild;
}
function getVikeConfigError() {
    return globalObject.errorBuild || globalObject.errorRuntime;
}
function getVikeConfigErrorBuild() {
    return globalObject.errorBuild;
}
