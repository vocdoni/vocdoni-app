export { assert };
export { assertUsage };
export { assertWarning };
export { assertInfo };
export { getProjectError };
export { isVikeBug };
export { setAssertOnBeforeLog };
export { setAssertOnBeforeErr };
export { setAssertAlwaysShowStackTrace };
export { setAssertAddAssertTagsDev };
import type { AddAssertTagsDev } from '../node/vite/shared/loggerDev.js';
declare function assert(condition: unknown, debugInfo?: unknown): asserts condition;
declare function assertUsage(condition: unknown, errMsg: string, { showStackTrace, exitOnError }?: {
    showStackTrace?: true;
    exitOnError?: boolean;
}): asserts condition;
declare function getProjectError(errMsg: string): Error;
declare function assertWarning(condition: unknown, msg: string, { onlyOnce, showStackTrace }: {
    onlyOnce: boolean | string;
    showStackTrace?: true;
}): void;
declare function assertInfo(condition: unknown, msg: string, { onlyOnce }: {
    onlyOnce: boolean;
}): void;
declare function setAssertOnBeforeLog(onBeforeAssertLog: () => void): void;
declare function setAssertOnBeforeErr(onBeforeAssertErr: (err: unknown) => void): void;
declare function setAssertAddAssertTagsDev(addAssertTagsDev: AddAssertTagsDev): void;
declare function isVikeBug(err: unknown): boolean;
declare function setAssertAlwaysShowStackTrace(): void;
