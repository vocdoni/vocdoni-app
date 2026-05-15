export { isStreamFromReactStreamingPackage };
export { streamFromReactStreamingPackageToString };
export { getStreamOfReactStreamingPackage };
export type { StreamFromReactStreamingPackage };
export type { StreamFromReactStreamingPackagePublic };
import type { renderToStream } from 'react-streaming/server';
import { StreamReadableWeb, StreamWritableNode } from '../stream.js';
import '../../../../assertEnvServer.js';
type StreamFromReactStreamingPackagePublic = {
    injectToStream: Function;
};
type StreamFromReactStreamingPackage = Awaited<ReturnType<typeof renderToStream>>;
declare function streamFromReactStreamingPackageToString(stream: StreamFromReactStreamingPackage): Promise<string>;
declare function isStreamFromReactStreamingPackage(thing: unknown): thing is StreamFromReactStreamingPackage;
type Pipe = {
    __streamPipeNode: (writable: StreamWritableNode) => void;
};
type Readable = StreamReadableWeb;
declare function getStreamOfReactStreamingPackage(stream: StreamFromReactStreamingPackage): Pipe | Readable;
