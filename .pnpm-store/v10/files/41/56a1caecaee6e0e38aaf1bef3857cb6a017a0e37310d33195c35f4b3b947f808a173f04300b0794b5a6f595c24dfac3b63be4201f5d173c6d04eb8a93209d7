import { RouteIR } from "./types.js";

//#region src/adapters/path-to-regexp-v6.d.ts

/**
 * Convert a path-to-regexp v6 pattern string into a RouteIR pathname representation.
 *
 * @param path - The path-to-regexp v6 pattern to convert (e.g., "/users/:id", "/(.*)").
 * @returns A RouteIR object whose `pathname` is the parsed array of route segments
 */
declare function fromPathToRegexpV6(path: string): RouteIR;
/**
 * Reconstructs a path-to-regexp v6-style path string from a RouteIR's pathname.
 *
 * Converts each pathname segment and its catchAll/optional metadata back into the corresponding
 * path-to-regexp token (e.g., named params with `?`, `*`, or `+`) and returns the joined path string.
 *
 * @param route - The RouteIR containing a `pathname` array of segments to convert
 * @returns The reconstructed path-to-regexp v6 path string
 */
declare function toPathToRegexpV6(route: RouteIR): string;
//#endregion
export { fromPathToRegexpV6, toPathToRegexpV6 };