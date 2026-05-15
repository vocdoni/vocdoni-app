import { RouteIR } from "./types.js";

//#region src/adapters/urlpattern.d.ts

/**
 * Converts a URLPattern (or URLPattern-like input string/object) into a RouteIR.
 *
 * @param pattern - A URLPattern instance or a URLPatternInit object, or a string pattern accepted by the URLPattern constructor.
 * @returns A RouteIR with its `pathname` parsed from the provided pattern.
 * @throws ConvertRouteError - If the pattern includes unsupported URLPattern components (protocol, hostname, port, username, password, search, hash) or if RegExp groups are present.
 */
declare function fromURLPattern<T extends URLPattern | URLPatternInput>(pattern: T): RouteIR;
interface URLPatternOptions {
  /**
   * Whether to add optional trailing slash support to the pattern.
   * When true (default), appends `{/}?` to make patterns match both with and without trailing slashes.
   * @default true
   */
  trailingSlash?: boolean;
}
/**
 * Convert a RouteIR into a browser-compatible URLPattern instance.
 *
 * @param route - The route intermediate representation to convert into a URLPattern
 * @param options - Conversion options. `trailingSlash` (default `true`) controls whether the resulting pattern accepts an optional trailing slash.
 * @returns The constructed `URLPattern` representing `route`
 * @throws Error if the environment does not provide a URLPattern constructor
 */
declare function toURLPattern(route: RouteIR, options?: URLPatternOptions): URLPattern;
/**
 * Builds a URLPattern-style pathname string from a RouteIR.
 *
 * Maps RouteIR pathname segments to URLPattern segment syntax:
 * - Greedy catch-all => `/:name+` (required) or `/:name*` (optional)
 * - Non-greedy single-segment catch-all => `/:name` (required) or `/:name?` (optional)
 * - Literal segments => `/value`
 * An empty route pathname becomes `/` (or `/{/}?` when trailing slash support is enabled). If the computed pathname is `""` or `"*"`, it is normalized to `"/*"`.
 *
 * @param route - The RouteIR to convert
 * @param options - Conversion options; `trailingSlash` (default `true`) controls appending `"{/}?"` to allow an optional trailing slash
 * @returns An object with the computed `pathname` suitable for constructing a URLPattern
 */
declare function toURLPatternInput(route: RouteIR, options?: URLPatternOptions): {
  pathname: string;
};
interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}
type URLPatternInput = string | URLPatternInit;
//#endregion
export { URLPatternInit, URLPatternInput, URLPatternOptions, fromURLPattern, toURLPattern, toURLPatternInput };