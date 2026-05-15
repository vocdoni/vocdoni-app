//#region src/adapters/regexp.ts
function escapeStringRegexp(string) {
	return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
/**
* Convert a RouteIR into a RegExp that matches the route's pathname.
*
* @param route - RouteIR whose `pathname` array describes ordered path segments. Catch-all segments produce capture groups (named if `catchAll.name` is present); segments marked `optional` are allowed to be absent.
* @returns A RegExp anchored to the start and end that matches the route path described by `route.pathname`, permitting an optional trailing slash.
*/
function toRegexp(route) {
	const segments = [];
	for (const segment of route.pathname) if (segment.catchAll) {
		const name = segment.catchAll.name ? `?<${segment.catchAll.name}>` : "";
		const optional = segment.optional ? "*" : "+";
		const greedy = segment.catchAll.greedy ? "." : "[^/]";
		segments.push(`${segment.optional ? "?" : ""}(${name}${greedy}${optional})`);
	} else if (segment.optional) segments.push(`?(?:${escapeStringRegexp(segment.value)})?`);
	else segments.push(`${escapeStringRegexp(segment.value)}`);
	return /* @__PURE__ */ new RegExp(`^/${segments.join("/")}/?$`);
}

//#endregion
export { toRegexp };