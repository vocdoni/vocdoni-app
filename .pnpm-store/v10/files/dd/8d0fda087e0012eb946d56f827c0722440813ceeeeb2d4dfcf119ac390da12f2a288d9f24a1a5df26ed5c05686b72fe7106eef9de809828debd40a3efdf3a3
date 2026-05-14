export declare let logRuntimeError: LogRuntimeError;
export declare let logRuntimeInfo: LogRuntimeInfo | null | LogRuntimeInfo;
export { setLogRuntimeDev };
export { assertPageContext_logRuntime };
export type { PageContext_logRuntime };
import type { LogType } from '../../node/vite/shared/loggerDev.js';
import type { PageContextCreatedServer, PageContextCreatedServerWithoutGlobalContext } from './renderPageServer/createPageContextServer.js';
import '../assertEnvServer.js';
type LogRuntimeInfo = (msg: string, pageContext: PageContext_logRuntime, logType: LogType) => void;
type LogRuntimeError = (err: unknown, pageContext: PageContext_logRuntime) => void;
type PageContext_logRuntime = null | ((PageContextCreatedServer | PageContextCreatedServerWithoutGlobalContext) & {
    _requestId: number;
});
declare function setLogRuntimeDev(logRuntimeErrorDev: LogRuntimeError, logRuntimeInfoDev: LogRuntimeInfo): void;
declare function assertPageContext_logRuntime(pageContext: PageContext_logRuntime): void;
