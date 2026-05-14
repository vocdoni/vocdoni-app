import { RouteIR } from "./types.js";

//#region src/adapters/regexp.d.ts

/**
 * Convert a RouteIR into a RegExp that matches the route's pathname.
 *
 * @param route - RouteIR whose `pathname` array describes ordered path segments. Catch-all segments produce capture groups (named if `catchAll.name` is present); segments marked `optional` are allowed to be absent.
 * @returns A RegExp anchored to the start and end that matches the route path described by `route.pathname`, permitting an optional trailing slash.
 */
declare function toRegexp(route: RouteIR): RegExp;
//#endregion
export { toRegexp };