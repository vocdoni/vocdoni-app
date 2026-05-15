import { type RuntimeAdapterTarget } from '@universal-middleware/core';
import '../assertEnvServer.js';
declare function universalVikeHandler<T extends string>(request: Request, context: Universal.Context, runtime: RuntimeAdapterTarget<T>): Promise<Response>;
declare const universalVikeHandlerEnhanced: typeof universalVikeHandler & import("@universal-middleware/core").WithUniversalSymbols<{
    name: string;
    method: ("GET" | "HEAD" | "POST" | "PUT" | "OPTIONS" | "PATCH")[];
    path: string;
    immutable: true;
}>;
export default universalVikeHandlerEnhanced;
