export { renderToNodeStream };
import React from 'react';
import type { renderToPipeableStream as renderToPipeableStream__ } from 'react-dom/server';
import type { ClearTimeouts, SetAbortFn, StreamOptions } from '../renderToStream.js';
import type { DoNotClosePromise } from './orchestrateChunks.js';
declare function renderToNodeStream(element: React.ReactNode, disable: boolean, options: {
    onBoundaryError?: (err: unknown) => void;
    streamOptions?: StreamOptions;
    renderToPipeableStream?: typeof renderToPipeableStream__;
}, doNotClosePromise: DoNotClosePromise, setAbortFn: SetAbortFn, clearTimeouts: ClearTimeouts): Promise<{
    pipe: import("./createPipeWrapper.js").Pipe;
    abort: (reason?: unknown) => void;
    readable: null;
    streamEnd: Promise<boolean>;
    injectToStream: import("./orchestrateChunks.js").InjectToStream;
    hasStreamEnded: () => boolean;
}>;
