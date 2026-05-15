import { ServerResponse } from 'node:http';

/**
 * Send a fetch API Response into a Node.js HTTP response stream.
 */
declare function sendResponse(fetchResponse: Response, nodeResponse: ServerResponse): Promise<void>;
declare function responseAdapter(nodeResponse: ServerResponse, bodyInit?: BodyInit | null): Response;
declare function setResponseHeaders(fetchResponse: Response, nodeResponse: ServerResponse, mirror?: boolean): void;

export { responseAdapter, sendResponse, setResponseHeaders };
