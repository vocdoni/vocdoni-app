export { assertKeys };
declare function assertKeys<Keys extends readonly string[]>(obj: Record<string, unknown>, keysExpected: Keys, errPrefix: string): asserts obj is {
    [key in Keys[number]]?: unknown;
};
