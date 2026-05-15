export { renderToStream };
export { disable };
export { renderToNodeStream_set };
export { renderToWebStream_set };
export type { StreamReturnUtils };
export type { SetAbortFn };
export type { ClearTimeouts };
export type { RenderToStreamOptions };
import React from 'react';
import type { renderToPipeableStream as RenderToPipeableStream, RenderToPipeableStreamOptions, renderToReadableStream as RenderToReadableStream, RenderToReadableStreamOptions } from 'react-dom/server';
import type { Pipe } from './renderToStream/createPipeWrapper.js';
import { SeoStrategy } from './renderToStream/resolveSeoStrategy.js';
import type { renderToNodeStream as renderToNodeStream_ } from './renderToStream/renderToNodeStream.js';
import type { renderToWebStream as renderToWebStream_ } from './renderToStream/renderToWebStream.js';
import type { InjectToStream } from './index.node-and-web.js';
export type StreamOptions = Omit<RenderToPipeableStreamOptions, 'onShellReady' | 'onShellError' | 'onError' | 'onAllReady'> | Omit<RenderToReadableStreamOptions, 'onError' | 'signal'>;
type RenderToStreamOptions = {
    webStream?: boolean;
    disable?: boolean;
    seoStrategy?: SeoStrategy;
    userAgent?: string;
    onBoundaryError?: (err: unknown) => void;
    streamOptions?: StreamOptions;
    timeout?: number | null;
    onTimeout?: () => void;
    renderToReadableStream?: typeof RenderToReadableStream;
    renderToPipeableStream?: typeof RenderToPipeableStream;
};
type StreamReturnMain = {
    pipe: Pipe;
    readable: null;
} | {
    pipe: null;
    readable: ReadableStream;
};
type StreamReturnUtils = {
    injectToStream: InjectToStream;
    hasStreamEnded: () => boolean;
    streamEnd: Promise<boolean>;
    doNotClose: () => () => void;
};
type StreamReturn = StreamReturnMain & StreamReturnUtils & {
    disabled: boolean;
    abort: () => void;
};
type AbortFn = () => void;
type SetAbortFn = (abortFn: AbortFn) => void;
type ClearTimeouts = () => void;
declare function disable(): void;
declare function renderToStream(element: React.ReactNode, options?: RenderToStreamOptions): Promise<StreamReturn>;
declare function renderToNodeStream_set(renderToNodeStream: typeof renderToNodeStream_): void;
declare function renderToWebStream_set(renderToWebStream: typeof renderToWebStream_): void;
