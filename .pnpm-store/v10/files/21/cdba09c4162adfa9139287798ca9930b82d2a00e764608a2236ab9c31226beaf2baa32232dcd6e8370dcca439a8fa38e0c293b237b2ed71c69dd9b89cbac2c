import { RouteIR } from "./types.js";

//#region src/adapters/path-to-regexp-v8.d.ts

/**
 * Parse a route path string into a RouteIR pathname representation.
 *
 * Parses the provided route path into an array of segment descriptors assigned to the `pathname` property,
 * supporting optional segments and both greedy (`*`) and non-greedy (`:`) catch-all syntax.
 *
 * @param path - The route path string to parse (for example `/users/:id`, `/files/*path`, or `/{/optional}`)
 * @returns A RouteIR whose `pathname` is the parsed array of segment descriptors
 */
declare function fromPathToRegexpV8(path: string): RouteIR;
/**
 * Convert a RouteIR's pathname into a path string formatted for path-to-regexp v8.
 *
 * @param route - Route intermediate representation whose `pathname` is an array of segments to serialize.
 * @returns The serialized path string ("/" if `pathname` is empty). Optional segments are wrapped in `{}`; greedy catch-all segments use `/*name` (or `{/*name}` when optional); non-greedy catch-all segments use `/:name` (or `{/:name}` when optional); ordinary segments are prefixed with `/` (or `{/value}` when optional).
 */
declare function toPathToRegexpV8(route: RouteIR): string;
//#endregion
export { fromPathToRegexpV8, toPathToRegexpV8 };