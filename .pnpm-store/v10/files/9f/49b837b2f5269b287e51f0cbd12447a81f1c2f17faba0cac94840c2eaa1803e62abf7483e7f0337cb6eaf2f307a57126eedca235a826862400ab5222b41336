import { RouteIR } from "./types.js";

//#region src/adapters/vike.d.ts

/**
 * Parse a Vike-style path string into a RouteIR containing a pathname representation.
 *
 * @param path - The path string in Vike's format. See {@link https://vike.dev/route-string}
 * @returns A RouteIR whose `pathname` is the parsed array of segment descriptors representing the route.
 */
declare function fromVike(path: string): RouteIR;
/**
 * Serialize a RouteIR pathname into Vike-style path segments.
 *
 * @param route - The RouteIR whose `pathname` array of segments will be serialized.
 * @returns An array of strings representing the route in Vike's syntax:
 *   - Required non-greedy named catch-alls become `"@name"`.
 *   - Required greedy catch-alls become `"*"` (name is dropped, as Vike has no named greedy syntax).
 *   - Optional params produce two route variants via `join` (with and without the segment).
 *   - A literal value immediately followed by an **unnamed** optional greedy catch-all is
 *     collapsed into a single `"prefix*"` segment, preserving Vike's intra-segment wildcard syntax.
 *   - Literal segments are emitted as-is.
 */
declare function toVike(route: RouteIR): string[];
//#endregion
export { fromVike, toVike };