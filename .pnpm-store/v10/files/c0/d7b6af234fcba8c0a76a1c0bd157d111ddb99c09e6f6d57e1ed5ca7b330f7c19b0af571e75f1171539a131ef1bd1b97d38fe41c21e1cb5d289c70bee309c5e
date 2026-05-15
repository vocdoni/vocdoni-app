/// <reference types="node" resolution-mode="require"/>
export { createPipeWrapper };
export type { Pipe };
import type { Writable as StreamNodeWritable } from 'stream';
import { type DoNotClosePromise } from './orchestrateChunks.js';
import type { ClearTimeouts } from '../renderToStream.js';
type Pipe = (writable: StreamNodeWritable) => void;
declare function createPipeWrapper(pipeFromReact: Pipe, onReactBug: (err: unknown) => void, clearTimeouts: ClearTimeouts, doNotClosePromise: DoNotClosePromise): Promise<{
    pipeForUser: Pipe;
    streamEnd: Promise<void>;
    injectToStream: import("./orchestrateChunks.js").InjectToStream;
    hasStreamEnded: () => boolean;
}>;
