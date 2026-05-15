export { debugLogsRuntimeBegin };
export { debugLogsRuntimeEnd };
import { getCwdSafe } from '../shared/utils.js';
import { isDebug, logDebug } from '../shared/debug.js';
function debugLogsRuntimeBegin(autoImporter) {
    if (!isDebug)
        return;
    logDebug('DEBUG_LOGS_RUNTIME [BEGIN]');
    try {
        logDebug('process.platform', JSON.stringify(process.platform));
    }
    catch {
        logDebug('process.platform', 'undefined');
    }
    // https://stackoverflow.com/questions/4224606/how-to-check-whether-a-script-is-running-under-node-js/35813135#35813135
    try {
        logDebug('process.release', JSON.stringify(process.release));
    }
    catch {
        logDebug('process.release', 'undefined');
    }
    // https://github.com/cloudflare/workers-sdk/issues/1481 - Feature Request: Detect whether code is being run in Cloudflare Workers (or Node.js)
    try {
        logDebug('navigator', JSON.stringify(navigator));
    }
    catch {
        logDebug('navigator', 'undefined');
    }
    logDebug('cwd', getCwdSafe());
    logDebug('importer.status', autoImporter.status);
    if (autoImporter.status === 'SET') {
        logDebug('importer.pluginVersion', autoImporter.pluginVersion);
        logDebug('importer.paths.autoImporterFilePathOriginal', autoImporter.paths.autoImporterFilePathOriginal);
        logDebug('importer.paths.autoImporterFilePathActual', autoImporter.paths.autoImporterFilePathActual);
        logDebug('importer.paths.serverEntryFilePathRelative', autoImporter.paths.serverEntryFilePathRelative);
    }
}
function debugLogsRuntimeEnd(info) {
    if (!isDebug)
        return;
    for (var key in info)
        logDebug(key, info[key]);
    logDebug('DEBUG_LOGS_RUNTIME [END]');
}
