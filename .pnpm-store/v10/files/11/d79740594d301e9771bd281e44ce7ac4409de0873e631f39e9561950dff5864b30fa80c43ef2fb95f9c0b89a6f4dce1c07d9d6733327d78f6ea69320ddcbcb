export { createReadableWrapper };
import { type DoNotClosePromise } from './orchestrateChunks.js';
import type { ClearTimeouts } from '../renderToStream.js';
declare function createReadableWrapper(readableFromReact: ReadableStream, clearTimeouts: ClearTimeouts, doNotClosePromise: DoNotClosePromise): {
    readableForUser: ReadableStream<any>;
    streamEnd: Promise<void>;
    injectToStream: import("./orchestrateChunks.js").InjectToStream;
    hasStreamEnded: () => boolean;
};
