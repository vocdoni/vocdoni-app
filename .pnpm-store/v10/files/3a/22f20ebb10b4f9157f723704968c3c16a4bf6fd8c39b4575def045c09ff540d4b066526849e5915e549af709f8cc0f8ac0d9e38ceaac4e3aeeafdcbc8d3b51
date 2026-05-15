export { debugFlow };
export { assertReactImport };
export { wrapStreamEnd };
export { handleErrors };
import { toPosixPath } from '../../utils/path.js';
import { assert, assertUsage, createDebugger, getBetterError, isObject } from '../utils.js';
const debugFlow = createDebugger('react-streaming:flow');
const isReactBug = '__@brillout/react-streaming__isReactBug';
function assertReactImport(fn, fnName) {
    assert(typeof fn === 'function');
    assertUsage(fn, `Couldn't import ${fnName}() from 'react-dom'`);
}
function wrapStreamEnd(streamEnd, didError) {
    return (streamEnd
        // Needed because of the `afterReactBugCatch()` hack above, otherwise `onBoundaryError` triggers after `streamEnd` resolved
        .then(() => new Promise((r) => setTimeout(r, 0)))
        .then(() => !didError));
}
function handleErrors(options, isPromiseResolved) {
    const state = {
        didError: false,
        firstErr: undefined,
    };
    let firstErrOriginal = undefined;
    return {
        state,
        onShellError,
        onBoundaryError,
        onReactBug,
    };
    function onShellError(err, errorInfo) {
        debugFlow('onShellError()');
        state.didError = true;
        const errBetter = getErrorWithComponentStack(err, errorInfo);
        if (state.firstErr === undefined) {
            state.firstErr = errBetter;
            firstErrOriginal = err;
        }
        logErr(err, errBetter);
    }
    // We intentionally swallow boundary errors, see https://github.com/brillout/react-streaming#error-handling
    function onBoundaryError(err, errorInfo) {
        debugFlow('onBoundaryError()');
        afterReactBugCatch(() => {
            if (err[isReactBug])
                return;
            const errBetter = getErrorWithComponentStack(err, errorInfo);
            options.onBoundaryError?.(errBetter);
        });
    }
    function onReactBug(err) {
        debugFlow('onReactBug()');
        state.didError = true;
        if (state.firstErr === undefined) {
            state.firstErr = err;
            firstErrOriginal = err;
        }
        ;
        err[isReactBug] = true;
        logErr(err);
    }
    function logErr(err, errBetter) {
        // Only log if it wasn't used as rejection value for `await renderToStream()`
        if (err !== firstErrOriginal || isPromiseResolved()) {
            console.error(errBetter ?? err);
        }
    }
}
// Needed for the hacky solution to workaround https://github.com/facebook/react/issues/24536
function afterReactBugCatch(fn) {
    setTimeout(() => {
        fn();
    }, 0);
}
function getErrorWithComponentStack(errorOriginal, errorInfo) {
    if (!errorInfo?.componentStack || !isObject(errorOriginal))
        return errorOriginal;
    const errorStackLines = String(errorOriginal.stack).split('\n');
    // Inject the component stack right before the React stack trace (potentially *after* some vike-react or react-streaming strack trace, e.g. if react-streaming's useAsync() throws an error).
    const cutoff = errorStackLines.findIndex((l) => {
        l = toPosixPath(l);
        return l.includes('node_modules/react-dom/') || l.includes('node_modules/react/');
    });
    if (cutoff === -1)
        return errorOriginal;
    const errorStackLinesBegin = errorStackLines.slice(0, cutoff);
    const errorStackLinesEnd = errorStackLines.slice(cutoff);
    const componentStackLines = errorInfo.componentStack.split('\n').filter(Boolean);
    if (componentStackLines[0] === errorStackLinesBegin.at(-1))
        componentStackLines.shift();
    const stackEnhanced = [
        //
        ...errorStackLinesBegin,
        ...componentStackLines,
        ...errorStackLinesEnd,
    ].join('\n');
    const errorBetter = getBetterError(errorOriginal, { stack: stackEnhanced });
    return errorBetter;
}
