export { genPromise };
declare function genPromise<T = void>({ timeout, }?: {
    timeout?: number | null | undefined;
}): {
    promise: Promise<T>;
    resolve: (val: T) => void;
    reject: (err: unknown) => void;
};
