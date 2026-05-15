//#region src/utils/join.ts
function isValidSegment(segment) {
	return segment !== null && segment !== void 0 && segment !== "";
}
function generateCombinations(arrays) {
	if (arrays.length === 0) return [[]];
	if (arrays.length === 1) return arrays[0].map((item) => [item]);
	const [first, ...rest] = arrays;
	const restCombinations = generateCombinations(rest);
	const result = [];
	for (const item of first) for (const combination of restCombinations) {
		const filteredCombination = combination.filter(isValidSegment);
		const hasNull = filteredCombination.length < combination.length;
		if (isValidSegment(item)) {
			if (hasNull && filteredCombination.length > 0) result.push([item]);
			result.push([item, ...filteredCombination]);
		} else result.push([...filteredCombination]);
	}
	return result;
}
function join(segments) {
	return generateCombinations(segments.map((segment) => {
		if (Array.isArray(segment)) return segment;
		return [segment];
	}).filter((arr) => arr.length > 0)).map((combination) => `/${combination.join("/")}`);
}

//#endregion
export { join };