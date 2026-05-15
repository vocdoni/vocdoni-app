import { SegmentMapper } from "./utils/mapper.js";
import { join } from "./utils/join.js";

//#region src/adapters/vike.ts
const mapper = new SegmentMapper().match(/^@(.+)$/, (match) => ({
	optional: false,
	catchAll: {
		greedy: false,
		name: match[1]
	}
})).match(/^\*$/, () => ({
	optional: false,
	catchAll: { greedy: true }
})).match(/(.+)\*$/, (match) => {
	return [{
		value: match[1],
		optional: false
	}, {
		optional: true,
		catchAll: { greedy: true }
	}];
});
/**
* Parse a Vike-style path string into a RouteIR containing a pathname representation.
*
* @param path - The path string in Vike's format. See {@link https://vike.dev/route-string}
* @returns A RouteIR whose `pathname` is the parsed array of segment descriptors representing the route.
*/
function fromVike(path) {
	return { pathname: mapper.exec(path) };
}
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
function toVike(route) {
	let i = 0;
	const segments = [];
	let j = 0;
	while (j < route.pathname.length) {
		const r = route.pathname[j];
		const next = j + 1 < route.pathname.length ? route.pathname[j + 1] : void 0;
		if (r.value && !r.optional && next?.optional && next.catchAll?.greedy) {
			segments.push(`${r.value}*`);
			j += 2;
			continue;
		}
		if (r.catchAll?.greedy) segments.push(r.optional ? [null, "*"] : "*");
		else if (r.catchAll) {
			const name = r.catchAll.name || `_${++i}`;
			segments.push(r.optional ? [null, `@${name}`] : `@${name}`);
		} else if (r.value) segments.push(r.value);
		j++;
	}
	return join(segments);
}

//#endregion
export { fromVike, toVike };