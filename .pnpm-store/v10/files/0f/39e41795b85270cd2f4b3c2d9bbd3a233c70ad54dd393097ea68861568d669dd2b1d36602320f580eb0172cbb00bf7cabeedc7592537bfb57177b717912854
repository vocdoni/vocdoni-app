export { getVikeConfigError };
export { getVikeConfigErrorBuild };
export { setVikeConfigError };
export { debugFileChange };
declare const debugFileChange: ((...msgs: unknown[]) => void) & {
    options: (optionsLocal: {
        serialization?: {
            emptyArray?: string;
        };
    }) => (...msgs: unknown[]) => void;
    isActivated: boolean;
};
type VikeConfigHasError = false | {
    err: unknown;
};
declare function setVikeConfigError(val: {
    errorRuntime: VikeConfigHasError;
} | {
    errorBuild: VikeConfigHasError;
}): void;
declare function getVikeConfigError(): VikeConfigHasError;
declare function getVikeConfigErrorBuild(): VikeConfigHasError;
