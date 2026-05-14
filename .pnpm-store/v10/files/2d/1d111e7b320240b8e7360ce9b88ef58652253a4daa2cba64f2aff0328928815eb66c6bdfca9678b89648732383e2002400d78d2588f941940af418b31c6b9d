export { orchestrateChunks };
export type { InjectToStream };
export type { StreamOperations };
export type { Chunk };
export type { DoNotClosePromise };
type InjectToStreamOptions = {
    flush?: boolean;
};
type Chunk = string | Promise<string>;
type InjectToStream = (chunk: Chunk, options?: InjectToStreamOptions) => void;
type StreamOperations = {
    operations: null | {
        writeChunk: (chunk: unknown) => void;
        flush: null | (() => void);
    };
};
type DoNotClosePromise = {
    promise: null | Promise<void>;
};
declare function orchestrateChunks(streamOperations: StreamOperations, doNotClosePromise: DoNotClosePromise): {
    injectToStream: InjectToStream;
    onReactWrite: (chunk: unknown) => void;
    onBeforeEnd: () => Promise<void>;
    hasStreamEnded: () => boolean;
};
