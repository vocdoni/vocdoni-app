import * as _webroute_route from '@webroute/route';
import { RequestCtx } from '@webroute/route';
import * as elysia from 'elysia';
import { Context as Context$1 } from 'elysia';
import { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'node:http';
import * as _cloudflare_workers_types from '@cloudflare/workers-types';
import { EventContext } from '@cloudflare/workers-types';
import * as _hattip_core from '@hattip/core';
import { AdapterRequestContext } from '@hattip/core';
import { Server } from 'bun';
import * as express from 'express';
import { Request as Request$1, Response as Response$1 } from 'express';
import * as fastify from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as h3 from 'h3';
import { H3Event } from 'h3';
import * as hono from 'hono';
import { Context } from 'hono';
import { ServerRequest } from 'srvx';
import * as http from 'http';
import { RouterContext } from 'rou3';

declare const universalSymbol: unique symbol;
declare const contextSymbol: unique symbol;
declare const pathSymbol: unique symbol;
declare const methodSymbol: unique symbol;
declare const orderSymbol: unique symbol;
declare const nameSymbol: unique symbol;
declare const urlSymbol: unique symbol;
/**
 * @internal
 */
declare const optionsToSymbols: {
    readonly name: typeof nameSymbol;
    readonly method: typeof methodSymbol;
    readonly path: typeof pathSymbol;
    readonly order: typeof orderSymbol;
    readonly context: typeof contextSymbol;
};
/**
 * @alpha
 */
declare enum MiddlewareOrder {
    RATE_LIMITING = -1000,// Rate limiting middleware: Prevents excessive requests from a client.
    AUTHENTICATION = -900,// Authentication middleware: Verifies user credentials or tokens.
    AUTHORIZATION = -800,// Authorization middleware: Ensures the user has permissions for the route.
    INPUT_VALIDATION = -700,// Input validation middleware: Validates the request payload or query parameters.
    CORS = -600,// CORS middleware: Handles Cross-Origin Resource Sharing settings.
    PARSING = -500,// Parsing middleware: Parses body payloads (e.g., JSON, URL-encoded, multipart).
    CUSTOM_PRE_PROCESSING = -400,// Custom pre-processing middleware: Any custom logic before the main handler.
    HANDLER = 0,// Main handler that generates the response.
    RESPONSE_TRANSFORM = 100,// Response transformation middleware: Modifies the response payload.
    HEADER_MANAGEMENT = 200,// Header management middleware: Adds or modifies HTTP headers (e.g., caching, content type).
    RESPONSE_COMPRESSION = 300,// Response compression middleware: Compresses the response payload (e.g., gzip, brotli).
    RESPONSE_CACHING = 400,// Response caching middleware: Implements caching strategies (e.g., ETag, cache-control).
    LOGGING = 500,// Logging middleware: Logs request and response information.
    ERROR_HANDLING = 600,// Error handling middleware: Processes errors and returns user-friendly responses.
    CUSTOM_POST_PROCESSING = 700
}

type Awaitable<T> = T | Promise<T>;
type AnyFn = (...args: any[]) => any;
type SetThis<F extends AnyFn, This> = (this: This, ...args: Parameters<OmitThisParameter<F>>) => ReturnType<F>;
type UniversalFn<U extends UniversalHandler<any> | UniversalMiddleware<any, any>, F extends AnyFn> = F & {
    [universalSymbol]: U;
};
type SetThisHandler<F extends AnyFn, U extends UniversalHandler<any> = UniversalHandler> = SetThis<UniversalFn<U, F>, {
    [universalSymbol]: U;
}>;
type SetThisMiddleware<F extends AnyFn, U extends UniversalMiddleware<any, any> = UniversalMiddleware> = SetThis<UniversalFn<U, F>, {
    [universalSymbol]: U;
}>;
interface CloudflareWorkerdRuntime<Env extends Record<string, any> = Record<string, unknown>> {
    runtime: "workerd";
    /**
     * @see {@link https://developers.cloudflare.com/workers/runtime-apis/bindings/}
     */
    env?: Env;
    /**
     * @see {@link https://developers.cloudflare.com/workers/runtime-apis/context/}
     */
    ctx?: {
        /**
         * @see {@link https://developers.cloudflare.com/workers/runtime-apis/context/#waituntil}
         */
        waitUntil?: (promise: Promise<any>) => void;
        /**
         * @see {@link https://developers.cloudflare.com/workers/runtime-apis/context/#passthroughonexception}
         */
        passThroughOnException?: () => void;
    };
}
interface DenoRuntime {
    runtime: "deno";
}
interface NodeRuntime {
    runtime: "node";
}
interface BunRuntime {
    runtime: "bun";
    server: Server<any>;
}
interface VercelEdgeRuntime {
    runtime: "edge-light";
}
interface FastlyRuntime {
    runtime: "fastly";
}
interface OtherRuntime {
    runtime: "other";
}
/**
 * Inspired by Runtime Keys proposal
 * @see {@link https://runtime-keys.proposal.wintercg.org/}
 */
type Runtime = CloudflareWorkerdRuntime | DenoRuntime | NodeRuntime | BunRuntime | VercelEdgeRuntime | FastlyRuntime | OtherRuntime;
interface ExpressAdapter {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: Request$1;
    res: Response$1;
    express: {
        req: Request$1;
        res: Response$1;
    };
}
interface FastifyAdapter {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: IncomingMessage;
    res: ServerResponse;
    fastify: {
        request: FastifyRequest;
        reply: FastifyReply;
    };
}
interface HonoAdapter {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: IncomingMessage;
    res?: ServerResponse;
    hono: Context;
}
interface HattipAdapter {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: IncomingMessage;
    res?: ServerResponse;
    hattip: AdapterRequestContext;
}
interface H3Adapter {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: IncomingMessage;
    res?: ServerResponse;
    h3: H3Event;
}
interface SrvxAdapter {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: IncomingMessage;
    res?: ServerResponse;
    srvx: ServerRequest;
}
interface CloudflarePagesAdapter {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
}
interface CloudflareWorkerAdapter {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
}
interface VercelEdgeAdapter {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
}
interface VercelNodeAdapter {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: IncomingMessage;
        res: ServerResponse;
    };
}
interface ElysiaAdapter {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: Context$1;
}
interface WebrouteAdapter {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: RequestCtx;
}
interface OtherAdapter {
    adapter: "other";
    params: undefined;
}
type Adapter = ExpressAdapter | FastifyAdapter | HonoAdapter | HattipAdapter | H3Adapter | SrvxAdapter | CloudflarePagesAdapter | CloudflareWorkerAdapter | VercelEdgeAdapter | VercelNodeAdapter | ElysiaAdapter | WebrouteAdapter | OtherAdapter;
type RuntimeAdapter = Runtime & Adapter;
type RuntimeAdapterTarget<T> = T extends string ? Runtime & Extract<Adapter, {
    adapter: T;
}> : RuntimeAdapter;
type Adapters = Adapter["adapter"];
type Runtimes = Runtime["runtime"];
type UniversalMiddleware<InContext extends Universal.Context = Universal.Context, OutContext extends Universal.Context = Universal.Context, Target = unknown> = (request: Request, context: InContext, runtime: RuntimeAdapterTarget<Target>) => Awaitable<Response | OutContext | ((response: Response) => Awaitable<Response | undefined>) | void | undefined>;
type UniversalHandler<InContext extends Universal.Context = Universal.Context, Target = unknown> = (request: Request, context: InContext, runtime: RuntimeAdapterTarget<Target>) => Awaitable<Response>;
type Get<T extends unknown[], U> = (...args: T) => U;
interface UniversalSymbols {
    [nameSymbol]: string;
    [methodSymbol]: HttpMethod | HttpMethod[];
    [pathSymbol]: string;
    [orderSymbol]: MiddlewareOrder | number;
    [contextSymbol]?: Universal.Context | undefined;
}
type OptionsToSymbols = typeof optionsToSymbols;
type UniversalOptions = {
    [K in keyof OptionsToSymbols]: UniversalSymbols[OptionsToSymbols[K]];
};
interface UniversalOptionsArg extends Partial<UniversalOptions> {
    /**
     * @default true
     */
    immutable?: boolean;
}
type WithUniversalSymbols<T extends UniversalOptionsArg> = Pick<UniversalSymbols, OptionsToSymbols[keyof T & keyof OptionsToSymbols]>;
type HttpMethod = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH";
type Enhance<T> = T & Partial<UniversalSymbols>;
type EnhancedMiddleware<InContext extends Universal.Context = Universal.Context, OutContext extends Universal.Context = Universal.Context, Target = unknown> = Enhance<UniversalMiddleware<InContext, OutContext, Target>> | {
    [universalSymbol]: Enhance<UniversalMiddleware<InContext, OutContext, Target>>;
} | (Enhance<AnyFn> & {
    [universalSymbol]: UniversalMiddleware<InContext, OutContext, Target>;
});
interface UniversalRouterInterface<T extends "sync" | "async" = "sync"> {
    use(middleware: EnhancedMiddleware): T extends "async" ? this | Promise<this> : this;
    route(handler: EnhancedMiddleware): T extends "async" ? this | Promise<this> : this;
    applyCatchAll(): T extends "async" ? this | Promise<this> : this;
}

declare function getAdapterRuntime<K extends Adapter["adapter"]>(adapter: K, adapterArgs: Omit<Extract<Adapter, {
    adapter: K;
}>, "adapter">, runtimeArgs?: Omit<Runtime, "runtime">, request?: ServerRequest): {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "other";
    params: undefined;
    runtime: "workerd";
    env?: Record<string, unknown> | undefined;
    ctx?: {
        waitUntil?: (promise: Promise<any>) => void;
        passThroughOnException?: () => void;
    };
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "deno";
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "deno";
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "deno";
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "deno";
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "deno";
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "deno";
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "deno";
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "deno";
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "deno";
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "deno";
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "deno";
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "deno";
} | {
    adapter: "other";
    params: undefined;
    runtime: "deno";
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "node";
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "node";
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "node";
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "node";
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "node";
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "node";
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "node";
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "node";
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "node";
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "node";
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "node";
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "node";
} | {
    adapter: "other";
    params: undefined;
    runtime: "node";
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "other";
    params: undefined;
    runtime: "bun";
    server: Bun.Server<any>;
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "edge-light";
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "edge-light";
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "edge-light";
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "edge-light";
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "edge-light";
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "edge-light";
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "edge-light";
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "edge-light";
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "edge-light";
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "edge-light";
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "edge-light";
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "edge-light";
} | {
    adapter: "other";
    params: undefined;
    runtime: "edge-light";
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "fastly";
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "fastly";
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "fastly";
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "fastly";
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "fastly";
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "fastly";
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "fastly";
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "fastly";
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "fastly";
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "fastly";
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "fastly";
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "fastly";
} | {
    adapter: "other";
    params: undefined;
    runtime: "fastly";
} | {
    adapter: "express";
    params: Record<string, string> | undefined;
    req: express.Request;
    res: express.Response;
    express: {
        req: express.Request;
        res: express.Response;
    };
    runtime: "other";
} | {
    adapter: "fastify";
    params: Record<string, string> | undefined;
    req: http.IncomingMessage;
    res: http.ServerResponse;
    fastify: {
        request: fastify.FastifyRequest;
        reply: fastify.FastifyReply;
    };
    runtime: "other";
} | {
    adapter: "hono";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hono: hono.Context;
    runtime: "other";
} | {
    adapter: "hattip";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    hattip: _hattip_core.AdapterRequestContext;
    runtime: "other";
} | {
    adapter: "h3";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    h3: h3.H3Event;
    runtime: "other";
} | {
    adapter: "srvx";
    params: Record<string, string> | undefined;
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
    srvx: ServerRequest;
    runtime: "other";
} | {
    adapter: "cloudflare-pages";
    params: Record<string, string> | undefined;
    "cloudflare-pages": _cloudflare_workers_types.EventContext<Record<string | number | symbol, unknown>, any, Record<string, unknown>>;
    runtime: "other";
} | {
    adapter: "cloudflare-worker";
    params: undefined;
    "cloudflare-worker": Omit<CloudflareWorkerdRuntime, "runtime">;
    runtime: "other";
} | {
    adapter: "vercel-edge";
    params: Record<string, string> | undefined;
    runtime: "other";
} | {
    adapter: "vercel-node";
    params: Record<string, string> | undefined;
    "vercel-node": {
        req: http.IncomingMessage;
        res: http.ServerResponse;
    };
    runtime: "other";
} | {
    adapter: "elysia";
    params: Record<string, string> | undefined;
    elysia: elysia.Context;
    runtime: "other";
} | {
    adapter: "webroute";
    params: Record<string, string> | undefined;
    webroute?: _webroute_route.RequestCtx;
    runtime: "other";
} | {
    adapter: "other";
    params: undefined;
    runtime: "other";
};

/**
 * @experimental
 */
declare function compileEnhance(middleware: string, options: Omit<UniversalOptionsArg, "immutable">): string;

declare function env<T extends Record<string, unknown>>(runtime: RuntimeAdapter): T;

type _Out<T> = T extends UniversalMiddleware<any, infer C> ? C : never;
type Out<T> = T extends UniversalFn<infer X, infer _> ? _Out<X> : _Out<T>;
type _In<T> = T extends UniversalHandler<infer C> ? C : T extends UniversalMiddleware<infer C, any> ? C : never;
type In<T> = T extends UniversalFn<infer X, infer _> ? _In<X> : _In<T>;
type First<T extends any[]> = T extends [infer X, ...any[]] ? X : never;
type Last<T extends any[]> = T extends [...any[], infer X] ? X : never;
type AnyMiddleware<In extends Universal.Context = any, Out extends Universal.Context = any, Fn extends AnyFn = AnyFn> = UniversalHandler<In> | UniversalMiddleware<In, Out> | UniversalFn<UniversalHandler<In>, Fn> | UniversalFn<UniversalMiddleware<In, Out>, Fn>;
type ExtractUF<T> = T extends UniversalFn<infer _, infer Fn> ? Fn : never;
type ComposeReturnType<T extends AnyMiddleware[]> = Last<T> extends never ? T[number] : Last<T> extends UniversalHandler<any> ? UniversalHandler<In<First<T>>> : Last<T> extends UniversalMiddleware<any, any> ? UniversalMiddleware<In<First<T>>, In<Last<T>>> : Last<T> extends UniversalFn<UniversalHandler<any>, infer _> ? UniversalFn<UniversalHandler<In<First<T>>>, ExtractUF<Last<T>>> : Last<T> extends UniversalFn<UniversalMiddleware<any, any>, infer _> ? UniversalFn<UniversalMiddleware<In<First<T>>, In<Last<T>>>, ExtractUF<Last<T>>> : never;
type Cast<T extends AnyMiddleware, NewIn extends Universal.Context, NewOut extends Universal.Context> = T extends UniversalMiddleware<any, any> ? UniversalMiddleware<NewIn, NewOut> : T extends UniversalFn<UniversalHandler<any>, infer Fn> ? UniversalFn<UniversalHandler<NewIn>, Fn> : T extends UniversalFn<UniversalMiddleware<any, any>, infer Fn> ? UniversalFn<UniversalMiddleware<NewIn, NewOut>, Fn> : never;
type Pipe<F extends AnyMiddleware[]> = F extends [] ? F : F extends [AnyMiddleware] ? F : F extends [infer F1 extends AnyMiddleware, infer F2 extends AnyMiddleware] ? [Cast<F1, In<F1>, Out<F1>>, Cast<F2, Out<F1>, Out<F2>>] : F extends [...infer X extends AnyMiddleware[], infer Y extends AnyMiddleware, infer L extends AnyMiddleware] ? [...Pipe<[...X, Y]>, Cast<L, Out<Y>, Out<L>>] : never;
/**
 * Composes a sequence of middlewares into a single middleware.
 * The `pipe` function takes an array of middleware functions and returns a new middleware function that
 * applies the input middleware functions in sequence to a given request and context.
 *
 * @example piping a universal middleware into a universal handler
 * ```js
 * const m = pipe(
 *   (request, context, runtime) => return { status: "OK" },
 *   (request, context, runtime) => new Response(context.status),
 * );
 *
 * const response = await m(request, context, runtime);
 *
 * console.log(await response.text()); // "OK"
 * ```
 *
 * The `pipe` function can also be applied to any combination of universal middlewares and adapter-specific middlewares.
 *
 * @example piping an express middleware into a universal handler
 * ```js
 * // Express middleware created thanks to universal-middleware
 * // It returns a { status: "OK" } Context.
 * import someExpressMiddleware from "my-lib/express";
 *
 * const m = pipe(
 *   someExpressMiddleware,
 *   (request, context, runtime) => new Response(context.status),
 * );
 *
 * const response = await m(request, context, runtime);
 *
 * console.log(await response.text()); // "OK"
 * ```
 *
 * @example piping a universal middleware into an express handler
 * ```js
 * // Express handler created thanks to universal-middleware
 * // It returns new Response(context.status).
 * import someExpressHandler from "my-lib/express";
 *
 * const m = pipe(
 *   (request, context, runtime) => return { status: "OK" },
 *   someExpressHandler,
 * );
 *
 * // The function signature always corresponds to the last middleware or handler given to the `pipe` function.
 * m(nodeRequest, nodeResponse);
 *
 * // Usage with an express `app`
 * app.use(m);
 * ```
 *
 * @see {@link https://universal-middleware.dev/helpers/pipe}
 * @returns A new middleware function that applies the input middleware functions in sequence.
 */
declare function pipe<F extends AnyMiddleware[]>(this: {
    noCast?: boolean;
} | void, ...a: Pipe<F> extends F ? F : Pipe<F>): ComposeReturnType<F>;

/**
 * Retrieve path parameters from URL patterns.
 * For servers supporting URL patterns like '/user/:name', the parameters will be available under runtime.params.
 * For other adapters, the `path` argument must be present. Then parameters are extracted thanks to `regexparam`.
 *
 * If you are writing a Universal Handler or Middleware and need access to path parameters, we suggest to follow
 * this next example.
 *
 * @example
 * import { params, type Get, type UniversalHandler } from "@universal-middleware/core";
 *
 * interface Options {
 *   route?: string;
 * }
 *
 * const myMiddleware = ((options?: Options) => (request, ctx, runtime) => {
 *   const myParams = params(request, runtime, options?.route);
 *
 *   if (myParams === null) {
 *     // Provide a useful Error message to the user
 *     throw new Error("A path parameter named `:name` is required. " +
 *                     "You can set your server route as `/user/:name`, or use the `route` option of this middleware " +
 *                     "to achieve the same purpose.");
 *   }
 *
 *   // ...
 * }) satisfies Get<[Options | undefined], UniversalHandler>;
 *
 * export default myMiddleware;
 */
declare function params(request: Request, runtime: RuntimeAdapter, path: string | undefined): null | Record<string, string>;

declare class UniversalRouter implements UniversalRouterInterface {
    #private;
    router: RouterContext<Enhance<UniversalHandler>>;
    constructor(pipeMiddlewaresInUniversalRoute?: boolean, handle404?: boolean);
    use(middleware: EnhancedMiddleware): this;
    route(handler: EnhancedMiddleware): this;
    applyCatchAll(): this;
    get [universalSymbol](): UniversalMiddleware;
}
declare function apply(router: UniversalRouterInterface, middlewares: EnhancedMiddleware[], defer?: boolean): void;
declare function applyAsync(router: UniversalRouterInterface<"async">, middlewares: EnhancedMiddleware[], defer?: boolean): Promise<void>;
/**
 * @beta
 */
declare function pipeRoute(middlewares: EnhancedMiddleware[], { pipeMiddlewaresInUniversalRoute, handle404 }?: {
    pipeMiddlewaresInUniversalRoute?: boolean | undefined;
    handle404?: boolean | undefined;
}): UniversalMiddleware;

declare const getRuntimeKey: () => Runtime["runtime"];

declare function isBodyInit(value: unknown): value is BodyInit;
declare function mergeHeadersInto(first: Headers, ...sources: Headers[]): Headers;
declare function nodeHeadersToWeb(nodeHeaders: OutgoingHttpHeaders): Headers;
declare function url(request: {
    url: string;
    [urlSymbol]?: URL;
}): URL;
declare function cloneRequest(request: Request, fields?: RequestInit & {
    url?: string;
}): Request;
declare function getUniversal<T extends object>(subject: T | {
    [universalSymbol]: T;
}): T;
declare function getUniversalProp<T extends object, K extends keyof UniversalSymbols>(subject: T | {
    [universalSymbol]: T;
}, prop: K): UniversalSymbols[K] | undefined;
declare function getUniversalProp<T extends object, K extends keyof UniversalSymbols>(subject: T | {
    [universalSymbol]: T;
}, prop: K, defaultValue: UniversalSymbols[K]): UniversalSymbols[K];
/**
 * The enhance helper provides a way to attach metadata to Middlewares and Handlers.
 * This metadata can include routing information like path and method, as well as order for automatic middleware sequencing.
 * @see {@link https://universal-middleware.dev/helpers/enhance}
 */
declare function enhance<F extends AnyFn, O extends UniversalOptionsArg>(middleware: F, options: O): F & WithUniversalSymbols<O>;
/**
 * @internal
 */
declare function bindUniversal<U extends UniversalHandler<any> | UniversalMiddleware<any, any>, F extends UniversalFn<U, AnyFn>>(universal: U, fn: SetThis<F, {
    [universalSymbol]: U;
}>, wrapper?: AnyFn): F;
/**
 * @internal
 */
declare function attachUniversal<U extends UniversalHandler<any> | UniversalMiddleware<any, any>, T extends {}>(universal: U, subject: T): T & {
    [universalSymbol]: U;
};

declare global {
    namespace Universal {
        interface Context extends Record<string | number | symbol, unknown> {
        }
    }
}

export { type Adapter, type Adapters, type AnyFn, type Awaitable, type BunRuntime, type CloudflarePagesAdapter, type CloudflareWorkerAdapter, type CloudflareWorkerdRuntime, type DenoRuntime, type ElysiaAdapter, type Enhance, type EnhancedMiddleware, type ExpressAdapter, type FastifyAdapter, type FastlyRuntime, type Get, type H3Adapter, type HattipAdapter, type HonoAdapter, type HttpMethod, MiddlewareOrder, type NodeRuntime, type OtherAdapter, type OtherRuntime, type Runtime, type RuntimeAdapter, type RuntimeAdapterTarget, type Runtimes, type SetThis, type SetThisHandler, type SetThisMiddleware, type SrvxAdapter, type UniversalFn, type UniversalHandler, type UniversalMiddleware, type UniversalOptions, type UniversalOptionsArg, UniversalRouter, type UniversalRouterInterface, type UniversalSymbols, type VercelEdgeAdapter, type VercelEdgeRuntime, type VercelNodeAdapter, type WebrouteAdapter, type WithUniversalSymbols, apply, applyAsync, attachUniversal, bindUniversal, cloneRequest, compileEnhance, contextSymbol, enhance, env, getAdapterRuntime, getRuntimeKey, getUniversal, getUniversalProp, isBodyInit, mergeHeadersInto, methodSymbol, nameSymbol, nodeHeadersToWeb, orderSymbol, params, pathSymbol, pipe, pipeRoute, universalSymbol, url };
