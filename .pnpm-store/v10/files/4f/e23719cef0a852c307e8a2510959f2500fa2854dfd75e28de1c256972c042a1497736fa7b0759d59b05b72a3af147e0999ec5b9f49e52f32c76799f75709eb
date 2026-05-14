export { getHttpResponseBody };
export { getHttpResponseBodyStreamHandlers };
export type { HttpResponseBody };
import { StreamPipeNode, StreamPipeWeb, StreamReadableNode, StreamReadableWeb, StreamWritableNode, StreamWritableWeb } from './html/stream.js';
import { type HtmlRender } from './html/renderHtml.js';
import type { RenderHook } from './execHookOnRenderHtml.js';
import '../../assertEnvServer.js';
type HttpResponseBody = {
    body: string;
    pipe: (writable: StreamWritableWeb | StreamWritableNode) => void;
    getReadableWebStream: () => StreamReadableWeb;
    getReadableNodeStream: () => Promise<StreamReadableNode>;
    getBody: () => Promise<string>;
    /** @deprecated */
    getNodeStream: () => Promise<StreamReadableNode>;
    /** @deprecated */
    getWebStream: () => StreamReadableWeb;
    /** @deprecated */
    pipeToNodeWritable: StreamPipeNode;
    /** @deprecated */
    pipeToWebWritable: StreamPipeWeb;
};
declare function getHttpResponseBody(htmlRender: HtmlRender, renderHook: null | RenderHook): string;
declare function getHttpResponseBodyStreamHandlers(htmlRender: HtmlRender, renderHook: null | RenderHook): {
    pipe(writable: StreamWritableNode | StreamWritableWeb): void;
    getReadableWebStream(): StreamReadableWeb;
    getReadableNodeStream(): Promise<import("stream").Readable>;
    getBody(): Promise<string>;
    getNodeStream(): Promise<import("stream").Readable>;
    getWebStream(): StreamReadableWeb;
    pipeToWebWritable(writable: StreamWritableWeb): void;
    pipeToNodeWritable(writable: StreamWritableNode): void;
};
