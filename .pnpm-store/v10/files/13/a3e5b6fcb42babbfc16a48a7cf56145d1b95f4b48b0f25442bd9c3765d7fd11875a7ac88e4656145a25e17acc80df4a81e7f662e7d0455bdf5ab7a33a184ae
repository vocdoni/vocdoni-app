export { parse };
export { parseTransform };
export type { Reviver };
type Reviver = (key: undefined | string, value: string, parser: (str: string) => unknown) => {
    replacement: unknown;
    resolved?: boolean;
} | undefined;
type Options = {
    reviver?: Reviver;
};
declare function parse(str: string, options?: Options): unknown;
declare function parseTransform(value: unknown, options?: Options): unknown;
