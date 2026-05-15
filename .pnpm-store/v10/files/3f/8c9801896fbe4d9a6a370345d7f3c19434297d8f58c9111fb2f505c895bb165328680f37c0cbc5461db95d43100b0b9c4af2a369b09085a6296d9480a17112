//#region src/utils/mapper.ts
function* iterateWithSeparator(segments) {
	for (let i = 0; i < segments.length; i += 2) yield [segments[i], segments[i + 1]];
}
var SegmentMapper = class {
	mapping = [];
	constructor(separator = /(\/)/) {
		this.separator = separator;
	}
	match(pattern, fn) {
		this.mapping.push([pattern, fn]);
		return this;
	}
	exec(path) {
		let match = null;
		let sliced = path.split(this.separator);
		if (sliced[0] === "") sliced = sliced.slice(1);
		if (sliced[sliced.length - 1] === "") sliced = sliced.slice(0, -1);
		sliced = sliced.filter(Boolean);
		if (sliced.length === 1) return [];
		return Array.from(iterateWithSeparator(sliced)).flatMap(([separator, segment], index, array) => {
			for (const [pattern, getParam] of this.mapping) if ((match = segment.match(pattern)) !== null) {
				const _params = getParam(match, segment, separator, index, array);
				return (Array.isArray(_params) ? _params : [_params]).map((param) => {
					if (!param.value && !param.catchAll) return {
						...param,
						value: segment
					};
					return param;
				});
			}
			return {
				value: segment,
				optional: false
			};
		});
	}
};

//#endregion
export { SegmentMapper };