export { orchestrateChunks };
import { assert, assertUsage, createDebugger, isPromise } from '../utils.js';
const debug = createDebugger('react-streaming:chunks');
function orchestrateChunks(streamOperations, doNotClosePromise) {
    let hasEnded = false;
    let lastWritePromise = null;
    // See Rule 2: https://github.com/brillout/react-streaming/tree/main/src#rule-2
    let firstReactWritePromise_resolve;
    let firstReactWritePromise = new Promise((resolve) => {
        firstReactWritePromise_resolve = () => {
            if (firstReactWritePromise === null)
                return;
            firstReactWritePromise = null;
            resolve();
        };
    });
    let isFirstReactWrite = true;
    return { injectToStream, onReactWrite, onBeforeEnd, hasStreamEnded: () => hasEnded };
    function injectToStream(chunk, options) {
        if (debug.isEnabled)
            debug('injectToStream()', getChunkAsString(chunk));
        if (hasEnded) {
            assertUsage(false, `Cannot inject the following chunk because the stream has already ended. Consider using the doNotClose() and hasStreamEnded() utilities. The chunk:\n${getChunkAsString(chunk)}`);
        }
        writeChunkInSequence(chunk, options?.flush);
    }
    // Except of the first React chunk, all chunks are guaranteed to be written in the
    // order of the injectToStream() and onReactWrite() calls.
    function writeChunkInSequence(chunk, flush) {
        const lastWritePromisePrevious = lastWritePromise;
        lastWritePromise = (async () => {
            if (firstReactWritePromise)
                await firstReactWritePromise;
            if (lastWritePromisePrevious)
                await lastWritePromisePrevious;
            if (isPromise(chunk))
                chunk = await chunk;
            writeChunkNow(chunk, flush);
        })();
    }
    function writeChunkNow(chunk, flush) {
        assert(!hasEnded);
        assert(streamOperations.operations);
        // Write
        streamOperations.operations.writeChunk(chunk);
        if (debug.isEnabled)
            debug('>>> WRITE', getChunkAsString(chunk));
        // Flush
        if (flush && streamOperations.operations.flush !== null) {
            streamOperations.operations.flush();
            debug('>>> FLUSH');
        }
    }
    function onReactWrite(chunk) {
        if (debug.isEnabled)
            debug('onReactWrite()', getChunkAsString(chunk));
        assert(!hasEnded); // all onReactWrite() calls happen before onBeforeEnd()
        const flush = true;
        if (isFirstReactWrite) {
            debug('>>> START');
            // The first React chunk should always be the very first written chunk.
            // See Rule 2: https://github.com/brillout/react-streaming/tree/main/src#rule-2
            writeChunkNow(chunk, flush);
            // Because of Rule 1, all subsequent synchronous React write after the first one also need to be injected first.
            // See Rule 1: https://github.com/brillout/react-streaming/tree/main/src#rule-1
            setTimeout(() => {
                isFirstReactWrite = false;
                firstReactWritePromise_resolve();
            }, 0);
        }
        else {
            writeChunkInSequence(chunk, flush);
        }
    }
    async function onBeforeEnd() {
        // In case React didn't write anything
        firstReactWritePromise_resolve();
        // Ensure user is able to use doNotClose() because, otherwise, stream may already have ended after `const { doNotClose } = await renderToStream()`
        await new Promise((r) => setTimeout(r, 0));
        await doNotClosePromise.promise;
        await lastWritePromise;
        hasEnded = true;
        debug('>>> END');
    }
}
function getChunkAsString(chunk) {
    try {
        return new TextDecoder().decode(chunk);
    }
    catch (err) {
        return String(chunk);
    }
}
