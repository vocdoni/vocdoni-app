import { IncomingMessage } from 'node:http';
import { Socket } from 'node:net';
import { contextSymbol } from '@universal-middleware/core';

declare const requestSymbol: unique symbol;
declare const env: Record<string, string | undefined>;

interface PossiblyEncryptedSocket extends Socket {
    encrypted?: boolean;
}
/**
 * `IncomingMessage` possibly augmented by Express-specific
 * `ip` and `protocol` properties.
 */
interface DecoratedRequest<C extends Universal.Context = Universal.Context> extends Omit<IncomingMessage, "socket"> {
    ip?: string;
    protocol?: string;
    socket?: PossiblyEncryptedSocket;
    rawBody?: any;
    originalUrl?: string;
    params?: Record<string, string>;
    [contextSymbol]?: C;
    [requestSymbol]?: Request;
}
/** Adapter options */
interface NodeRequestAdapterOptions {
    /**
     * Set the origin part of the URL to a constant value.
     * It defaults to `process.env.ORIGIN`. If neither is set,
     * the origin is computed from the protocol and hostname.
     * To determine the protocol, `req.protocol` is tried first.
     * If `trustProxy` is set, `X-Forwarded-Proto` header is used.
     * Otherwise, `req.socket.encrypted` is used.
     * To determine the hostname, `X-Forwarded-Host`
     * (if `trustProxy` is set) or `Host` header is used.
     */
    origin?: string;
    /**
     * Whether to trust `X-Forwarded-*` headers. `X-Forwarded-Proto`
     * and `X-Forwarded-Host` are used to determine the origin when
     * `origin` and `process.env.ORIGIN` are not set. `X-Forwarded-For`
     * is used to determine the IP address. The leftmost values are used
     * if multiple values are set. Defaults to true if `process.env.TRUST_PROXY`
     * is set to `1`, otherwise false.
     */
    trustProxy?: boolean;
}
/** Create a function that converts a Node HTTP request into a fetch API `Request` object */
declare function createRequestAdapter(options?: NodeRequestAdapterOptions): (req: DecoratedRequest) => Request;

export { type DecoratedRequest, type NodeRequestAdapterOptions, type PossiblyEncryptedSocket, createRequestAdapter, env, requestSymbol };
