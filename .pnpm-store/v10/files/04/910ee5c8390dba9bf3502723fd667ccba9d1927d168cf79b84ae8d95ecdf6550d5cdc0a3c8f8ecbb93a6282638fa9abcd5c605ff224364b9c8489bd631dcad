export { assert };
export { assertUsage };
export { assertWarning };
export { assertInfo };
export { getProjectError };
declare function assert(condition: unknown, debugInfo?: unknown): asserts condition;
declare function assertUsage(condition: unknown, errorMessage: string): asserts condition;
declare function getProjectError(errorMessage: string): Error;
declare function assertWarning(condition: unknown, errorMessage: string, { onlyOnce, showStackTrace }: {
    onlyOnce: boolean | string;
    showStackTrace?: true;
}): void;
declare function assertInfo(condition: unknown, errorMessage: string, { onlyOnce }: {
    onlyOnce: boolean;
}): void;
