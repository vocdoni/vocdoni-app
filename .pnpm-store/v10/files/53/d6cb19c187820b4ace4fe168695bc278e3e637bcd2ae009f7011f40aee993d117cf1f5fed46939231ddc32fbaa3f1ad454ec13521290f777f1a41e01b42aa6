export { debugLogsBuildBegin };
export { debugLogsBuildEnd };
export { debugLogsBuildDisabled };
import { isDebug, logDebug } from '../shared/debug.js';
function debugLogsBuildDisabled() {
    if (!isDebug)
        return;
    logDebug('disabled: true');
}
function debugLogsBuildBegin(paths) {
    if (!isDebug)
        return;
    logDebug('DEBUG_LOGS_BUILD_TIME [BEGIN]');
    Object.entries(paths).forEach(([key, val]) => {
        logDebug(key, val);
    });
}
function debugLogsBuildEnd(autoImporterFileContent) {
    if (!isDebug)
        return;
    logDebug('autoImporter.js', autoImporterFileContent.trim());
    logDebug('DEBUG_LOGS_BUILD_TIME [END]');
}
