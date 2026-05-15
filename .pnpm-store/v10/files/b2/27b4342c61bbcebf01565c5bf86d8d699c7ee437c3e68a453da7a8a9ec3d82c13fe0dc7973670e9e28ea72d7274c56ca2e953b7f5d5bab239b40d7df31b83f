import { SegmentMapper } from "./utils/mapper.js";

//#region src/adapters/path-to-regexp-v8.ts
function isOptional(segment, separator) {
	return segment.endsWith("}") && separator === "{/";
}
function stripValue(segment, separator) {
	return isOptional(segment, separator) ? segment.slice(0, -1) : segment;
}
const mapper = new SegmentMapper(/({\/|\/)/).match(/^\*(.+)$/, (match, segment, separator) => ({
	optional: isOptional(segment, separator),
	catchAll: {
		name: stripValue(match[1], separator),
		greedy: true
	}
})).match(/^:(.+)$/, (match, segment, separator) => ({
	optional: isOptional(segment, separator),
	catchAll: {
		name: stripValue(match[1], separator),
		greedy: false
	}
})).match(/^.*$/, (_match, segment, separator) => ({
	optional: isOptional(segment, separator),
	value: stripValue(segment, separator)
}));
/**
* Parse a route path string into a RouteIR pathname representation.
*
* Parses the provided route path into an array of segment descriptors assigned to the `pathname` property,
* supporting optional segments and both greedy (`*`) and non-greedy (`:`) catch-all syntax.
*
* @param path - The route path string to parse (for example `/users/:id`, `/files/*path`, or `/{/optional}`)
* @returns A RouteIR whose `pathname` is the parsed array of segment descriptors
*/
function fromPathToRegexpV8(path) {
	return { pathname: mapper.exec(path) };
}
/**
* Convert a RouteIR's pathname into a path string formatted for path-to-regexp v8.
*
* @param route - Route intermediate representation whose `pathname` is an array of segments to serialize.
* @returns The serialized path string ("/" if `pathname` is empty). Optional segments are wrapped in `{}`; greedy catch-all segments use `/*name` (or `{/*name}` when optional); non-greedy catch-all segments use `/:name` (or `{/:name}` when optional); ordinary segments are prefixed with `/` (or `{/value}` when optional).
*/
function toPathToRegexpV8(route) {
	let i = 0;
	if (route.pathname.length === 0) return "/";
	return route.pathname.map((r) => {
		if (r.catchAll?.greedy) {
			const name = r.catchAll.name || `_${++i}`;
			return r.optional ? `{/*${name}}` : `/*${name}`;
		}
		if (r.catchAll && !r.catchAll.greedy) {
			const name = r.catchAll.name || `_${++i}`;
			return r.optional ? `{/:${name}}` : `/:${name}`;
		}
		return r.optional ? `{/${r.value}}` : `/${r.value}`;
	}).join("");
}

//#endregion
export { fromPathToRegexpV8, toPathToRegexpV8 };