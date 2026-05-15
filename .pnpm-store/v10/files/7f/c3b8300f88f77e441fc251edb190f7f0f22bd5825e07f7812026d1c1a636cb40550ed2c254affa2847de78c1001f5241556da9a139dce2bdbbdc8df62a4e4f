export { renderToNodeStream };
import { renderToPipeableStream as renderToPipeableStream_ } from 'react-dom/server.node';
import { createPipeWrapper } from './createPipeWrapper.js';
import { assertReactImport, debugFlow, wrapStreamEnd, handleErrors } from './common.js';
async function renderToNodeStream(element, disable, options, doNotClosePromise, setAbortFn, clearTimeouts) {
    debugFlow('creating Node.js Stream Pipe');
    let onAllReady;
    const allReady = new Promise((r) => {
        onAllReady = () => r();
    });
    let onShellReady;
    const shellReady = new Promise((r) => {
        onShellReady = () => r();
    });
    const { state, onShellError, onBoundaryError, onReactBug } = handleErrors(options, () => promiseResolved);
    const renderToPipeableStream = options.renderToPipeableStream ?? renderToPipeableStream_;
    if (!options.renderToPipeableStream) {
        assertReactImport(renderToPipeableStream, 'renderToPipeableStream');
    }
    const { pipe: pipeOriginal, abort } = renderToPipeableStream(element, {
        ...options.streamOptions,
        onShellReady() {
            debugFlow('[react] onShellReady()');
            onShellReady();
        },
        // @ts-expect-error Taking a leap of faith that `errorInfo` will eventually be passed to onShellError()
        // https://github.com/facebook/react/issues/35349
        onShellError(err, errorInfo) {
            onShellError(err, errorInfo);
            onShellReady();
        },
        onAllReady() {
            debugFlow('[react] onAllReady()');
            onShellReady();
            onAllReady();
        },
        onError: onBoundaryError,
    });
    setAbortFn(() => {
        abort();
    });
    let promiseResolved = false;
    const { pipeForUser, injectToStream, streamEnd, hasStreamEnded } = await createPipeWrapper(pipeOriginal, onReactBug, clearTimeouts, doNotClosePromise);
    await shellReady;
    if (state.didError)
        throw state.firstErr;
    if (disable)
        await allReady;
    if (state.didError)
        throw state.firstErr;
    promiseResolved = true;
    return {
        pipe: pipeForUser,
        abort,
        readable: null,
        streamEnd: wrapStreamEnd(streamEnd, state.didError),
        injectToStream,
        hasStreamEnded,
    };
}
