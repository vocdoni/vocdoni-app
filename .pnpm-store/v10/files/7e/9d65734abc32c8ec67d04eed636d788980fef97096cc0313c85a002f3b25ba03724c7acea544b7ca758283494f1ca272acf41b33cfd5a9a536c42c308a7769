export { useSuspense };
export type { Suspenses };
export type { Suspense };
type Suspenses = Record<string, // `suspenseId`
Suspense>;
type Suspense = {
    state: 'done';
    value: unknown;
} | {
    state: 'pending';
    promise: Promise<void>;
} | {
    state: 'error';
    err: unknown;
};
declare function useSuspense<T>({ key, elementId, suspenses, resolver, resolverSync, needsWorkaround, asyncFnName, }: {
    key: string;
    elementId: string;
    suspenses: Suspenses;
    resolver: () => T;
    resolverSync?: () => null | {
        value: Awaited<T>;
    };
    needsWorkaround?: true;
    asyncFnName: string;
}): Awaited<T>;
