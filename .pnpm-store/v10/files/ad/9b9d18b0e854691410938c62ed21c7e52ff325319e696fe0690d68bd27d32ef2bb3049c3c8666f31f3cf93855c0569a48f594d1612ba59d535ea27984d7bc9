export { renderToWebStream };
import React from 'react';
import type { renderToReadableStream as renderToReadableStream__ } from 'react-dom/server';
import type { ClearTimeouts, SetAbortFn, StreamOptions } from '../renderToStream.js';
import type { DoNotClosePromise } from './orchestrateChunks.js';
declare function renderToWebStream(element: React.ReactNode, disable: boolean, options: {
    onBoundaryError?: (err: unknown) => void;
    streamOptions?: StreamOptions;
    renderToReadableStream?: typeof renderToReadableStream__;
}, doNotClosePromise: DoNotClosePromise, setAbortFn: SetAbortFn, clearTimeouts: ClearTimeouts): Promise<{
    readable: ReadableStream<any>;
    pipe: null;
    abort: (reason?: any) => void;
    streamEnd: Promise<boolean>;
    injectToStream: import("./orchestrateChunks.js").InjectToStream;
    hasStreamEnded: () => boolean;
}>;
