import { CmObjectType, CmStreamType, CmStreamingFormat, isTokenField, isValid } from "@svta/cml-cta";
import { SfItem, SfToken, decodeSfDict, decodeSfList, encodeSfDict, encodeSfList, symbolToStr } from "@svta/cml-structured-field-values";

//#region src/CMSD_DYNAMIC.ts
/**
* CMSD dynamic header name.
*
*
* @beta
*/
const CMSD_DYNAMIC = "CMSD-Dynamic";

//#endregion
//#region src/CMSD_STATIC.ts
/**
* CMSD static header name.
*
*
* @beta
*/
const CMSD_STATIC = "CMSD-Static";

//#endregion
//#region src/CMSD_V1.ts
/**
* CMSD Version 1
*
*
* @beta
*/
const CMSD_V1 = 1;

//#endregion
//#region src/CmsdHeaderField.ts
/**
* CMSD header fields.
*
*
* @enum
*
* @beta
*/
const CmsdHeaderField = {
	STATIC: CMSD_STATIC,
	DYNAMIC: CMSD_DYNAMIC
};

//#endregion
//#region src/CmsdObjectType.ts
/**
* Common Media Server Data Object Type
*
*
* @enum
*
* @beta
*/
const CmsdObjectType = CmObjectType;

//#endregion
//#region src/CmsdStreamingFormat.ts
/**
* Common Media Server Data Streaming Format
*
*
* @enum
*
* @beta
*/
const CmsdStreamingFormat = CmStreamingFormat;

//#endregion
//#region src/CmsdStreamType.ts
/**
* Common Media Server Data Stream Type
*
*
* @enum
*
* @beta
*/
const CmsdStreamType = CmStreamType;

//#endregion
//#region src/decodeCmsdDynamic.ts
/**
* Decode a CMSD dynamic string to an object.
*
* @param cmsd - The CMSD string to decode.
*
* @returns The decoded CMSD object.
*
*
* @beta
*/
function decodeCmsdDynamic(cmsd) {
	if (!cmsd) return [];
	return decodeSfList(cmsd);
}

//#endregion
//#region src/decodeCmsdStatic.ts
/**
* Decode a CMSD Static dict string to an object.
*
* @param cmsd - The CMSD string to decode.
*
* @returns The decoded CMSD object.
*
*
* @beta
*/
function decodeCmsdStatic(cmsd) {
	if (!cmsd) return {};
	return Object.entries(decodeSfDict(cmsd)).reduce((acc, [key, item]) => {
		const { value } = item;
		acc[key] = typeof value === "symbol" ? symbolToStr(value) : value;
		return acc;
	}, {});
}

//#endregion
//#region src/encodeCmsdDynamic.ts
function encodeCmsdDynamic(value, cmsd) {
	if (!value) return "";
	if (typeof value === "string") {
		if (!cmsd) return "";
		value = [new SfItem(value, cmsd)];
	}
	return encodeSfList(value, { whitespace: false });
}

//#endregion
//#region src/utils/processCmsd.ts
function processCmsd(obj, options) {
	const results = {};
	if (obj == null || typeof obj !== "object") return results;
	const keys = Object.keys(obj);
	const useSymbol = options?.useSymbol !== false;
	keys.forEach((key) => {
		let value = obj[key];
		if (key === "v" && value === 1) return;
		if (!isValid(value)) return;
		if (isTokenField(key) && typeof value === "string") value = useSymbol ? Symbol.for(value) : new SfToken(value);
		results[key] = value;
	});
	return results;
}

//#endregion
//#region src/encodeCmsdStatic.ts
/**
* Encode a CMSD Static object.
*
* @param cmsd - The CMSD object to encode.
* @param options - Encoding options
*
* @returns The encoded CMSD string.
*
*
* @beta
*/
function encodeCmsdStatic(cmsd, options) {
	if (!cmsd) return "";
	return encodeSfDict(processCmsd(cmsd, options), { whitespace: false });
}

//#endregion
export { CMSD_DYNAMIC, CMSD_STATIC, CMSD_V1, CmsdHeaderField, CmsdObjectType, CmsdStreamType, CmsdStreamingFormat, decodeCmsdDynamic, decodeCmsdStatic, encodeCmsdDynamic, encodeCmsdStatic };
//# sourceMappingURL=index.js.map