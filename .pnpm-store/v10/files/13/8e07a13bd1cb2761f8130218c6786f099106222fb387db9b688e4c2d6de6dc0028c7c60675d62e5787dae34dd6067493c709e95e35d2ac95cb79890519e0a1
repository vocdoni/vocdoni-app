export { assert };
export { assertUsage };
export { assertWarning };
export { assertInfo };
export { getProjectError };
export { isVikeBug };
export { setAssertOnBeforeLog };
export { setAssertOnBeforeErr };
export { setAssertAlwaysShowStackTrace };
export { setAssertAddAssertTagsDev };
import { assertSingleInstance_onAssertModuleLoad } from './assertSingleInstance.js';
import { createErrorWithCleanStackTrace } from './createErrorWithCleanStackTrace.js';
import { getGlobalObject } from './getGlobalObject.js';
import { PROJECT_VERSION } from './PROJECT_VERSION.js';
import { colorVike, colorWarning, colorError } from './colorsClient.js';
import pc from '@brillout/picocolors';
const globalObject = getGlobalObject('utils/assert.ts', {
    alreadyLogged: new Set(),
});
assertSingleInstance_onAssertModuleLoad();
const tagVike = `[vike]`;
const tagVikeWithVersion = `[vike@${PROJECT_VERSION}]`;
const tagTypeBug = 'Bug';
function assert(condition, debugInfo) {
    if (condition)
        return;
    const debugStr = (() => {
        if (!debugInfo) {
            return null;
        }
        const debugInfoSerialized = typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo);
        return pc.dim(`Debug for maintainers (you can ignore this): ${debugInfoSerialized}`);
    })();
    const link = pc.underline('https://github.com/vikejs/vike/issues/new?template=bug.yml');
    let errMsg = [
        `You stumbled upon a Vike bug. Go to ${link} and copy-paste this error. A maintainer will fix the bug (usually within 24 hours).`,
        debugStr,
    ]
        .filter(Boolean)
        .join(' ');
    errMsg = addTags(errMsg, tagTypeBug, true);
    const internalError = createError(errMsg);
    globalObject.onBeforeLog?.();
    globalObject.onBeforeErr?.(internalError);
    throw internalError;
}
function assertUsage(condition, errMsg, { showStackTrace, exitOnError } = {}) {
    if (condition)
        return;
    showStackTrace = showStackTrace || globalObject.alwaysShowStackTrace;
    errMsg = addTags(errMsg, 'Wrong Usage');
    const usageError = createError(errMsg);
    globalObject.onBeforeLog?.();
    globalObject.onBeforeErr?.(usageError);
    if (!exitOnError) {
        throw usageError;
    }
    else {
        console.error(showStackTrace ? usageError : errMsg);
        process.exit(1);
    }
}
function getProjectError(errMsg) {
    errMsg = addTags(errMsg, 'Error');
    const projectError = createError(errMsg);
    return projectError;
}
function assertWarning(condition, msg, { onlyOnce, showStackTrace }) {
    if (condition)
        return;
    showStackTrace = showStackTrace || globalObject.alwaysShowStackTrace;
    if (onlyOnce) {
        const { alreadyLogged } = globalObject;
        const key = onlyOnce === true ? msg : onlyOnce;
        if (alreadyLogged.has(key))
            return;
        alreadyLogged.add(key);
    }
    const msgWithTags = addTags(msg, 'Warning');
    globalObject.onBeforeLog?.();
    if (showStackTrace) {
        const err = createError(msgWithTags);
        globalObject.onBeforeErr?.(err);
        console.warn(err);
    }
    else {
        console.warn(msgWithTags);
    }
}
function assertInfo(condition, msg, { onlyOnce }) {
    if (condition) {
        return;
    }
    msg = addTags(msg, null);
    if (onlyOnce) {
        const { alreadyLogged } = globalObject;
        const key = msg;
        if (alreadyLogged.has(key)) {
            return;
        }
        else {
            alreadyLogged.add(key);
        }
    }
    globalObject.onBeforeLog?.();
    console.log(msg);
}
function setAssertOnBeforeLog(onBeforeAssertLog) {
    globalObject.onBeforeLog = onBeforeAssertLog;
}
function setAssertOnBeforeErr(onBeforeAssertErr) {
    globalObject.onBeforeErr = onBeforeAssertErr;
}
function setAssertAddAssertTagsDev(addAssertTagsDev) {
    globalObject.addAssertTagsDev = addAssertTagsDev;
}
function addTags(msg, tagType, showProjectVersion = false) {
    const tagVike = getTagVike(showProjectVersion);
    const tagTypeOuter = getTagType(tagType);
    const whitespace = getTagWhitespace(msg);
    if (globalObject.addAssertTagsDev) {
        const tagsDev = globalObject.addAssertTagsDev(tagVike, tagTypeOuter);
        return `${tagsDev}${whitespace}${msg}`;
    }
    else {
        const tags = `${tagVike}${tagTypeOuter}`;
        return `${tags}${whitespace}${msg}`;
    }
}
function getTagWhitespace(msg) {
    if (msg.startsWith('[')) {
        return '';
    }
    else {
        return ' ';
    }
}
function getTagType(tagType) {
    if (!tagType)
        return '';
    let tag = `[${tagType}]`;
    if (tagType === 'Warning') {
        tag = colorWarning(tag);
    }
    else {
        tag = colorError(tag);
    }
    return tag;
}
function getTagVike(showProjectVersion = false) {
    const tag = showProjectVersion ? tagVikeWithVersion : tagVike;
    return colorVike(tag);
}
function isVikeBug(err) {
    return String(err).includes(`[${tagTypeBug}]`);
}
// Called upon `DEBUG=vike:error`
function setAssertAlwaysShowStackTrace() {
    globalObject.alwaysShowStackTrace = true;
}
function createError(errMsg) {
    const err = createErrorWithCleanStackTrace(errMsg, 3);
    if (globalObject.addAssertTagsDev)
        err.stack = err.stack?.replace(/^Error:\s*/, '');
    return err;
}
