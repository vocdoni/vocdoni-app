//#region src/parseFrameRate.ts
/**
* Parses a DASH framerate string into a number.
*
* @param frameRate - The frame rate string to parse.
* @returns The frame rate as a number.
*
* @beta
*
* @example
* {@includeCode ../test/parseFrameRate.test.ts#example}
*/
function parseFrameRate(frameRate) {
	const [numerator, denominator] = frameRate.split("/").map((value) => parseInt(value, 10));
	if (denominator === void 0) return numerator;
	if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return NaN;
	return numerator / denominator;
}

//#endregion
//#region src/processUriTemplate.ts
const TOKENS = /\$(RepresentationID|Number|SubNumber|Bandwidth|Time)?(?:%0([0-9]+)([diouxX]))?\$/g;
/**
* Process a URI template used in `SegmentTemplate` nodes.
*
* @param uriTemplate - URI template to process.
* @param representationId - Representation ID.
* @param number - Number.
* @param subNumber - Sub-number.
* @param bandwidth - Bandwidth.
* @param time - Time. Should be passed as a number unless the value is larger than `MAX_SAFE_INTEGER`, then it should be provided as a string. If the value is a string all format tags will be ignored.
*
* @returns Processed URI template.
*
* @beta
*
* @example
* {@includeCode ../test/processUriTemplate.test.ts#example}
*/
function processUriTemplate(uriTemplate, representationId, number, subNumber, bandwidth, time) {
	return uriTemplate.replace(TOKENS, (match, name, widthStr, format) => {
		let value;
		switch (name) {
			case void 0: return "$";
			case "RepresentationID":
				value = representationId;
				break;
			case "Number":
				value = number;
				break;
			case "SubNumber":
				value = subNumber;
				break;
			case "Bandwidth":
				value = bandwidth;
				break;
			case "Time":
				if (typeof time === "string") return time;
				value = time ? Math.round(time) : time;
				break;
			default: value = null;
		}
		if (value == null) return match;
		let valueString;
		switch (format) {
			case void 0:
			case "d":
			case "i":
			case "u":
				valueString = value.toString();
				break;
			case "o":
				valueString = value.toString(8);
				break;
			case "x":
				valueString = value.toString(16);
				break;
			case "X":
				valueString = value.toString(16).toUpperCase();
				break;
			default:
				valueString = value.toString();
				break;
		}
		const width = parseInt(widthStr, 10) || 1;
		return valueString.padStart(width, "0");
	});
}

//#endregion
//#region src/THUMBNAIL_TILE_SCHEME_ID_URI.ts
/**
* The scheme ID URI for thumbnail tiles in DASH.
*
*
* @beta
*/
const THUMBNAIL_TILE_SCHEME_ID_URI = "http://dashif.org/guidelines/thumbnail_tile";

//#endregion
export { THUMBNAIL_TILE_SCHEME_ID_URI, parseFrameRate, processUriTemplate };
//# sourceMappingURL=index.js.map