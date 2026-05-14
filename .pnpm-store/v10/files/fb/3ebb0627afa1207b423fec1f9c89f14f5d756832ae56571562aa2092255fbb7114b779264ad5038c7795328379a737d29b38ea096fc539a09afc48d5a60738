//#region src/CmObjectType.ts
/**
* Common Media Object Type
*
* @internal
*/
const CmObjectType = {
	MANIFEST: "m",
	AUDIO: "a",
	VIDEO: "v",
	MUXED: "av",
	INIT: "i",
	CAPTION: "c",
	TIMED_TEXT: "tt",
	KEY: "k",
	OTHER: "o"
};

//#endregion
//#region src/CmStreamingFormat.ts
/**
* Common Media Streaming Format
*
* @internal
*/
const CmStreamingFormat = {
	DASH: "d",
	HLS: "h",
	SMOOTH: "s",
	OTHER: "o"
};

//#endregion
//#region src/CmStreamType.ts
/**
* Common Media Stream Type
*
* @internal
*/
const CmStreamType = {
	VOD: "v",
	LIVE: "l"
};

//#endregion
//#region src/isTokenField.ts
/**
* Checks if the given key is a token field.
*
* @param key - The key to check.
*
* @returns `true` if the key is a token field.
*
* @internal
*/
function isTokenField(key) {
	return [
		"ot",
		"sf",
		"st",
		"e",
		"sta"
	].includes(key);
}

//#endregion
//#region src/isValid.ts
/**
* Checks if the given value is valid
*
* @param value - The value to check.
*
* @returns `true` if the key is a value is valid.
*
* @internal
*/
function isValid(value) {
	if (typeof value === "number") return Number.isFinite(value);
	return value != null && value !== "" && value !== false;
}

//#endregion
export { CmObjectType, CmStreamType, CmStreamingFormat, isTokenField, isValid };
//# sourceMappingURL=index.js.map