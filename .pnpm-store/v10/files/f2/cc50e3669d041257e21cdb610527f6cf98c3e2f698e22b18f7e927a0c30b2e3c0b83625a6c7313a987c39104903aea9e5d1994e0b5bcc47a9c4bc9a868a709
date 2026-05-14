export { getBetterError };
declare function getBetterError(err: unknown, modifications: {
    message?: string | {
        prepend?: string;
        append?: string;
    };
    stack?: string;
    hideStack?: true;
}): {
    message: string;
    stack: string;
    hideStack?: true;
} & {
    getOriginalError: () => any;
};
