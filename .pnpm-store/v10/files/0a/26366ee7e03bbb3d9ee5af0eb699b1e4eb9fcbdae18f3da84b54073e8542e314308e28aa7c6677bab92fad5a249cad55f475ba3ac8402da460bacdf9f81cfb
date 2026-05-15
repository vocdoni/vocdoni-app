import { Awaitable, UniversalFn, UniversalHandler, UniversalMiddleware, Get, RuntimeAdapterTarget, UniversalRouter, UniversalRouterInterface, EnhancedMiddleware } from '@universal-middleware/core';
import { ServerResponse, IncomingMessage, OutgoingHttpHeaders } from 'node:http';
import { DecoratedRequest, NodeRequestAdapterOptions } from '@universal-middleware/node';
export { DecoratedRequest, createRequestAdapter, sendResponse } from '@universal-middleware/node';
import { Readable } from 'node:stream';
import { Express as Express$2 } from 'express';
import { Express as Express$1 } from 'express4';

declare const pendingMiddlewaresSymbol: unique symbol;
declare const wrappedResponseSymbol: unique symbol;

interface DecoratedServerResponse extends ServerResponse {
    [pendingMiddlewaresSymbol]?: ((response: Response) => Awaitable<Response | undefined>)[];
    [wrappedResponseSymbol]?: boolean;
}
/** Connect/Express style request listener/middleware */
type NodeMiddleware<In extends Universal.Context, Out extends Universal.Context> = UniversalFn<UniversalMiddleware<In, Out>, <R>(req: DecoratedRequest<In>, res: DecoratedServerResponse, next?: (err?: unknown) => void) => R>;
type NodeHandler<In extends Universal.Context> = UniversalFn<UniversalHandler<In>, <R>(req: DecoratedRequest<In>, res: DecoratedServerResponse, next?: (err?: unknown) => void) => R>;
/** Adapter options */
interface NodeAdapterHandlerOptions extends NodeRequestAdapterOptions {
}
interface NodeAdapterMiddlewareOptions extends NodeRequestAdapterOptions {
}

/**
 * Creates a request handler to be passed to http.createServer() or used as a
 * middleware in Connect-style frameworks like Express.
 */
declare function createHandler<T extends unknown[], InContext extends Universal.Context>(handlerFactory: Get<T, UniversalHandler<InContext>>, options?: NodeAdapterHandlerOptions): Get<T, NodeHandler<InContext>>;
/**
 * Creates a middleware to be passed to Connect-style frameworks like Express
 */
declare function createMiddleware<T extends unknown[], InContext extends Universal.Context, OutContext extends Universal.Context>(middlewareFactory: Get<T, UniversalMiddleware<InContext, OutContext>>, options?: NodeAdapterMiddlewareOptions): Get<T, NodeMiddleware<InContext, OutContext>>;
declare function getContext<InContext extends Universal.Context = Universal.Context>(req: DecoratedRequest): InContext;

type Express = Express$1 | Express$2;
type ConnectMiddleware = (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void) => void | Promise<void>;
type ConnectMiddlewareBoolean = (req: IncomingMessage, res: ServerResponse, next?: (err?: unknown) => void) => boolean | Promise<boolean>;
type WebHandler<InContext extends Universal.Context = Universal.Context, Target = unknown> = (request: Request, context?: InContext, runtime?: RuntimeAdapterTarget<Target>) => Response | undefined | Promise<Response | undefined>;
/**
 * Converts a Connect-style middleware to a web-compatible request handler.
 * @beta
 */
declare function connectToWeb(handler: ConnectMiddleware | ConnectMiddlewareBoolean): WebHandler;
/**
 * Creates an IncomingMessage object from a web Request.
 * @beta
 */
declare function createIncomingMessage(request: Request): IncomingMessage;
/**
 * Creates a custom ServerResponse object that allows for intercepting and streaming the response.
 *
 * @beta
 * @returns
 * An object containing:
 *   - res: The custom ServerResponse object.
 *   - onReadable: A function that takes a callback. The callback is invoked when the response is readable,
 *     providing an object with the readable stream, headers, and status code.
 */
declare function createServerResponse(incomingMessage: IncomingMessage): {
    res: ServerResponse<IncomingMessage>;
    onReadable: (cb: (result: {
        readable: Readable;
        headers: OutgoingHttpHeaders;
        statusCode: number;
    }) => void) => void;
};

type App = Express;
type EnhancedMiddlewareExpress = EnhancedMiddleware | EnhancedMiddleware<Universal.Context, Universal.Context, "express">;
declare class UniversalExpressRouter<T extends App> extends UniversalRouter implements UniversalRouterInterface {
    #private;
    constructor(app: T);
    use(middleware: EnhancedMiddlewareExpress): this;
    applyCatchAll(): this;
}
declare function apply(app: Express, middlewares: EnhancedMiddlewareExpress[]): void;

export { type App, type ConnectMiddleware, type ConnectMiddlewareBoolean, type DecoratedServerResponse, type NodeHandler, type NodeMiddleware, UniversalExpressRouter, type WebHandler, apply, connectToWeb, createHandler, createIncomingMessage, createMiddleware, createServerResponse, getContext };
