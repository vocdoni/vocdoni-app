import { RouteIR } from "./types.js";

//#region src/adapters/rou3.d.ts

/**
 * Parse a rou3-style path string into a RouteIR containing a pathname representation.
 *
 * @param path - The path string in rou3 format (e.g., segments like "*", "**", ":name", "**:name", optional markers).
 * @returns A RouteIR whose `pathname` is the parsed array of segment descriptors representing the route.
 */
declare function fromRou3(path: string): RouteIR;
/**
 * Serialize a RouteIR pathname into rou3-style path segments.
 *
 * @param route - The RouteIR whose `pathname` array of segments will be serialized. Each segment may include `value`, `optional`, and `catchAll` (with `name` and `greedy`) properties that influence the output.
 * @returns An array of strings representing the route in rou3 syntax. Greedy named catch-alls become `"**:name"` (or `"**"` if optional), non-greedy named catch-alls become `":name"` (or, for an optional non-greedy last-segment, a two-part representation `[null, "*"]`), and literal segments are emitted as-is.
 */
declare function toRou3(route: RouteIR): string[];
//#endregion
export { fromRou3, toRou3 };