export { assert };
export { assertUsage };
export { logLabel };
import { createErrorWithCleanStackTrace } from './createErrorWithCleanStackTrace.js';
import { projectInfo } from './projectInfo.js';
const logLabel = `[${projectInfo.npmPackageName}@${projectInfo.projectVersion}]`;
const internalErrorPrefix = `${logLabel}[Bug]`;
const usageErrorPrefix = `${logLabel}[Wrong Usage]`;
const numberOfStackTraceLinesToRemove = 2;
function assert(condition, debugInfo) {
    if (condition) {
        return;
    }
    const debugStr = (() => {
        if (!debugInfo) {
            return null;
        }
        const debugInfoSerialized = typeof debugInfo === 'string' ? debugInfo : '`' + JSON.stringify(debugInfo) + '`';
        return `Debug info (this is for the ${projectInfo.projectName} maintainers; you can ignore this): ${debugInfoSerialized}`;
    })();
    const internalError = createErrorWithCleanStackTrace([
        `${internalErrorPrefix} You stumbled upon a bug in the source code of ${projectInfo.projectName}.`,
        `Reach out at ${projectInfo.githubRepository}/issues/new and include this error stack (the error stack is usually enough to fix the problem).`,
        'A maintainer will fix the bug (usually under 24 hours).',
        `Don't hesitate to reach out as it makes ${projectInfo.projectName} more robust.`,
        debugStr,
    ]
        .filter(Boolean)
        .join(' '), numberOfStackTraceLinesToRemove);
    throw internalError;
}
function assertUsage(condition, errorMessage) {
    if (condition) {
        return;
    }
    const errMsg = `${usageErrorPrefix} ${errorMessage}`;
    const usageError = createErrorWithCleanStackTrace(errMsg, numberOfStackTraceLinesToRemove);
    throw usageError;
}
/*
export { assertWarning }
const warningPrefix = `${logLabel}[Warning]` as const
function assertWarning(condition: unknown, errorMessage: string): void {
  if (condition) {
    return
  }
  const msg = `${warningPrefix} ${errorMessage}`
  console.warn(msg)
}
*/
