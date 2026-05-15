export { debugFlow };
export { assertReactImport };
export { wrapStreamEnd };
export { handleErrors };
declare const debugFlow: ((msg: string, info?: unknown) => void) & {
    options: (options: {
        serialization?: {
            emptyArray?: string | undefined;
        } | undefined;
    }) => (msg: string, info?: unknown) => void;
    isEnabled: boolean;
};
declare function assertReactImport(fn: unknown, fnName: 'renderToPipeableStream' | 'renderToReadableStream'): void;
declare function wrapStreamEnd(streamEnd: Promise<void>, didError: boolean): Promise<boolean>;
declare function handleErrors(options: {
    onBoundaryError?: (err: unknown) => void;
}, isPromiseResolved: () => boolean): {
    state: {
        didError: boolean;
        firstErr: unknown;
    };
    onShellError: (err: unknown, errorInfo?: ErrorInfo) => void;
    onBoundaryError: (err: unknown, errorInfo?: ErrorInfo) => void;
    onReactBug: (err: unknown) => void;
};
type ErrorInfo = {
    componentStack?: string;
};
