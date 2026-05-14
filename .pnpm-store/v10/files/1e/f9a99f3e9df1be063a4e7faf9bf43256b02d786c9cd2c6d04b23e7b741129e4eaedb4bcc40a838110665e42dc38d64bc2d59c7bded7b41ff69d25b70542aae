export { addPathToReplacer };
export type { Iterable };
export type { Path };
type Path = (string | number)[];
type Iterable = Record<string, unknown>;
type Replacer = (this: Iterable, key: string, valueAfterNativeJsonStringify: unknown, path: Path) => unknown;
/**
 * The `replacer()` callback of `JSON.stringify()` doesn't provide the path of the object property that is being stringified.
 *
 * `addPathToReplacer(replacer)` adds the property path to the `replacer()` callback as last parameter.
 */
declare function addPathToReplacer(replacer: Replacer): (this: Iterable, key: string, valueAfterNativeJsonStringify: unknown) => unknown;
