import { SegmentMapper } from "./utils/mapper.js";
import { ConvertRouteError } from "./utils/error.js";

//#region src/adapters/urlpattern.ts
/**
* Determine if a URLPattern component is the default or wildcard value.
*
* @param s - The string value (or `undefined`) to test
* @returns `true` if `s` is `undefined` or equal to `"*"`, `false` otherwise
*/
function isDefault(s) {
	return !s || s === "*";
}
const unsupportedKeys = [
	"protocol",
	"hostname",
	"port",
	"username",
	"password",
	"search",
	"hash"
];
const urlPatternMapper = new SegmentMapper().match(/^:(\w+)\+$/, (match) => ({
	catchAll: {
		name: match[1],
		greedy: true
	},
	optional: false
})).match(/^:(\w+)\*$/, (match) => ({
	catchAll: {
		name: match[1],
		greedy: true
	},
	optional: true
})).match(/^:(\w+)\?$/, (match) => ({
	catchAll: {
		name: match[1],
		greedy: false
	},
	optional: true
})).match(/^:(\w+)$/, (match) => ({
	catchAll: {
		name: match[1],
		greedy: false
	},
	optional: false
})).match(/^\*$/, () => ({
	catchAll: { greedy: true },
	optional: true
})).match(/.*\*.*/, () => {
	throw new ConvertRouteError("[urlpattern] Wildcard is not supported as part of a pattern");
}).match(/^.*$/, () => ({ optional: false }));
/**
* Converts a URLPattern (or URLPattern-like input string/object) into a RouteIR.
*
* @param pattern - A URLPattern instance or a URLPatternInit object, or a string pattern accepted by the URLPattern constructor.
* @returns A RouteIR with its `pathname` parsed from the provided pattern.
* @throws ConvertRouteError - If the pattern includes unsupported URLPattern components (protocol, hostname, port, username, password, search, hash) or if RegExp groups are present.
*/
function fromURLPattern(pattern) {
	let obj;
	if (typeof pattern === "string") obj = new (getConstructor())(pattern);
	else obj = pattern;
	for (const prop of unsupportedKeys) if (!isDefault(obj[prop])) throw new ConvertRouteError(`'${prop}' is not yet supported`);
	if ("hasRegExpGroups" in obj && obj.hasRegExpGroups) throw new ConvertRouteError(`RegExp groups are not yet supported`);
	let pathname = obj.pathname ?? "*";
	pathname = pathname.replace(/\{\/\}\?$/, "");
	return { pathname: urlPatternMapper.exec(pathname) };
}
/**
* Convert a RouteIR into a browser-compatible URLPattern instance.
*
* @param route - The route intermediate representation to convert into a URLPattern
* @param options - Conversion options. `trailingSlash` (default `true`) controls whether the resulting pattern accepts an optional trailing slash.
* @returns The constructed `URLPattern` representing `route`
* @throws Error if the environment does not provide a URLPattern constructor
*/
function toURLPattern(route, options) {
	return new (getConstructor())(toURLPatternInput(route, options));
}
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
function toURLPatternInput(route, options) {
	const { trailingSlash = true } = options ?? {};
	let i = 0;
	if (route.pathname.length === 0) return { pathname: trailingSlash ? "/{/}?" : "/" };
	const pathname = route.pathname.map((r) => {
		if (r.catchAll?.greedy) {
			const name = r.catchAll.name || `_${++i}`;
			return r.optional ? `/:${name}*` : `/:${name}+`;
		}
		if (r.catchAll && !r.catchAll.greedy) {
			const name = r.catchAll.name || `_${++i}`;
			return r.optional ? `/:${name}?` : `/:${name}`;
		}
		return `/${r.value}`;
	}).join("");
	const finalPathname = pathname === "" || pathname === "*" ? "/*" : pathname;
	return { pathname: trailingSlash ? `${finalPathname}{/}?` : finalPathname };
}
/**
* Obtains the global URLPattern constructor, throwing if the environment does not provide it.
*
* @returns The global `URLPattern` constructor.
* @throws Error if `URLPattern` is not supported in the current environment.
*/
function getConstructor() {
	const URLPatternConstructor = globalThis.URLPattern;
	if (!URLPatternConstructor) throw new Error(`URLPattern is not supported`);
	return URLPatternConstructor;
}

//#endregion
export { fromURLPattern, toURLPattern, toURLPatternInput };