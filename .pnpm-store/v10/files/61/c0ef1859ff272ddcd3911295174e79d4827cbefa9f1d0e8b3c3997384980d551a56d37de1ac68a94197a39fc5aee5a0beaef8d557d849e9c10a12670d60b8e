import { SfItem, SfToken, decodeSfDict, encodeSfDict, symbolToStr } from "@svta/cml-structured-field-values";
import { CmObjectType, CmStreamType, CmStreamingFormat, isTokenField, isValid } from "@svta/cml-cta";
import { urlToRelativePath } from "@svta/cml-utils";

//#region src/CMCD_OBJECT.ts
/**
* CMCD object header name.
*
*
* @beta
*/
const CMCD_OBJECT = "CMCD-Object";

//#endregion
//#region src/CMCD_REQUEST.ts
/**
* CMCD request header name.
*
*
* @beta
*/
const CMCD_REQUEST = "CMCD-Request";

//#endregion
//#region src/CMCD_SESSION.ts
/**
* CMCD session header name.
*
*
* @beta
*/
const CMCD_SESSION = "CMCD-Session";

//#endregion
//#region src/CMCD_STATUS.ts
/**
* CMCD status header name.
*
*
* @beta
*/
const CMCD_STATUS = "CMCD-Status";

//#endregion
//#region src/CMCD_HEADER_MAP.ts
/**
* The map of CMCD keys to their appropriate header shard.
*
*
* @internal
*/
const CMCD_HEADER_MAP = {
	br: CMCD_OBJECT,
	ab: CMCD_OBJECT,
	d: CMCD_OBJECT,
	ot: CMCD_OBJECT,
	tb: CMCD_OBJECT,
	tpb: CMCD_OBJECT,
	lb: CMCD_OBJECT,
	tab: CMCD_OBJECT,
	lab: CMCD_OBJECT,
	url: CMCD_OBJECT,
	pb: CMCD_REQUEST,
	bl: CMCD_REQUEST,
	tbl: CMCD_REQUEST,
	dl: CMCD_REQUEST,
	ltc: CMCD_REQUEST,
	mtp: CMCD_REQUEST,
	nor: CMCD_REQUEST,
	nrr: CMCD_REQUEST,
	rc: CMCD_REQUEST,
	sn: CMCD_REQUEST,
	sta: CMCD_REQUEST,
	su: CMCD_REQUEST,
	ttfb: CMCD_REQUEST,
	ttfbb: CMCD_REQUEST,
	ttlb: CMCD_REQUEST,
	cmsdd: CMCD_REQUEST,
	cmsds: CMCD_REQUEST,
	smrt: CMCD_REQUEST,
	df: CMCD_REQUEST,
	cs: CMCD_REQUEST,
	ts: CMCD_REQUEST,
	cid: CMCD_SESSION,
	pr: CMCD_SESSION,
	sf: CMCD_SESSION,
	sid: CMCD_SESSION,
	st: CMCD_SESSION,
	v: CMCD_SESSION,
	msd: CMCD_SESSION,
	bs: CMCD_STATUS,
	bsd: CMCD_STATUS,
	cdn: CMCD_STATUS,
	rtp: CMCD_STATUS,
	bg: CMCD_STATUS,
	pt: CMCD_STATUS,
	ec: CMCD_STATUS,
	e: CMCD_STATUS
};

//#endregion
//#region src/CmcdHeaderField.ts
/**
* CMCD header fields.
*
*
* @enum
*
* @beta
*/
const CmcdHeaderField = {
	OBJECT: CMCD_OBJECT,
	REQUEST: CMCD_REQUEST,
	SESSION: CMCD_SESSION,
	STATUS: CMCD_STATUS
};

//#endregion
//#region src/groupCmcdHeaders.ts
function createHeaderMap(headerMap) {
	return Object.keys(headerMap).reduce((acc, field) => {
		headerMap[field]?.forEach((key) => acc[key] = field);
		return acc;
	}, {});
}
/**
* Group a CMCD data object into header shards
*
* @param cmcd - The CMCD data object to convert.
* @param customHeaderMap - A map of CMCD header fields to custom CMCD keys.
*
* @returns The CMCD header shards.
*
*
* @beta
*/
function groupCmcdHeaders(cmcd, customHeaderMap) {
	const result = {};
	if (!cmcd) return result;
	const keys$1 = Object.keys(cmcd);
	const custom = customHeaderMap ? createHeaderMap(customHeaderMap) : {};
	return keys$1.reduce((acc, key) => {
		const field = CMCD_HEADER_MAP[key] || custom[key] || CmcdHeaderField.REQUEST;
		const data = acc[field] ??= {};
		data[key] = cmcd[key];
		return acc;
	}, result);
}

//#endregion
//#region src/CMCD_EVENT_MODE.ts
/**
* CMCD event mode variable name.
*
*
* @beta
*/
const CMCD_EVENT_MODE = "event";

//#endregion
//#region src/CMCD_FORMATTER_MAP.ts
const toRounded = (value) => Math.round(value);
const toUrlSafe = (value, options) => {
	if (Array.isArray(value)) return value.map((item) => toUrlSafe(item, options));
	if (value instanceof SfItem && typeof value.value === "string") return new SfItem(toUrlSafe(value.value, options), value.params);
	else {
		if (options.baseUrl) value = urlToRelativePath(value, options.baseUrl);
		return options.version === 1 ? encodeURIComponent(value) : value;
	}
};
const toHundred = (value) => toRounded(value / 100) * 100;
const nor = (value, options) => {
	let norValue = value;
	if (options.version >= 2) {
		if (value instanceof SfItem && typeof value.value === "string") norValue = new SfItem([value]);
		else if (typeof value === "string") norValue = [value];
	}
	return toUrlSafe(norValue, options);
};
/**
* The default formatters for CMCD values.
*
*
* @beta
*/
const CMCD_FORMATTER_MAP = {
	br: toRounded,
	d: toRounded,
	bl: toHundred,
	dl: toHundred,
	mtp: toHundred,
	nor,
	rtp: toHundred,
	tb: toRounded
};

//#endregion
//#region src/CMCD_REQUEST_MODE.ts
/**
* CMCD request mode variable name.
*
*
* @beta
*/
const CMCD_REQUEST_MODE = "request";

//#endregion
//#region src/CMCD_COMMON_KEYS.ts
/**
* Defines the common keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
const CMCD_COMMON_KEYS = [
	"ab",
	"bg",
	"bl",
	"br",
	"bs",
	"bsd",
	"cdn",
	"cid",
	"cs",
	"df",
	"ec",
	"lab",
	"lb",
	"ltc",
	"msd",
	"mtp",
	"pb",
	"pr",
	"pt",
	"sf",
	"sid",
	"sn",
	"st",
	"sta",
	"tab",
	"tb",
	"tbl",
	"tpb",
	"ts",
	"v"
];

//#endregion
//#region src/CMCD_EVENT_KEYS.ts
/**
* Defines the event-specific keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
const CMCD_EVENT_KEYS = ["e"];

//#endregion
//#region src/CMCD_RESPONSE_KEYS.ts
/**
* CMCD v2 - Response-only and timing keys.
*
*
* @beta
*/
const CMCD_RESPONSE_KEYS = [
	"cmsdd",
	"cmsds",
	"rc",
	"smrt",
	"ttfb",
	"ttfbb",
	"ttlb",
	"url"
];

//#endregion
//#region src/isCmcdCustomKey.ts
const CUSTOM_KEY_REGEX = /^[a-zA-Z0-9-.]+-[a-zA-Z0-9-.]+$/;
/**
* Check if a key is a custom key.
*
* @param key - The key to check.
*
* @returns `true` if the key is a custom key, `false` otherwise.
*
*
* @beta
*/
function isCmcdCustomKey(key) {
	return CUSTOM_KEY_REGEX.test(key);
}

//#endregion
//#region src/isCmcdEventKey.ts
/**
* Check if a key is a valid CMCD event key.
*
* @param key - The key to check.
*
* @returns `true` if the key is a valid CMCD event key, `false` otherwise.
*
*
* @beta
*
* @example
* {@includeCode ../test/isCmcdEventKey.test.ts#example}
*/
function isCmcdEventKey(key) {
	return CMCD_COMMON_KEYS.includes(key) || CMCD_EVENT_KEYS.includes(key) || CMCD_RESPONSE_KEYS.includes(key) || isCmcdCustomKey(key);
}

//#endregion
//#region src/CMCD_REQUEST_KEYS.ts
/**
* Defines the request-specific keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
const CMCD_REQUEST_KEYS = [
	"d",
	"dl",
	"nor",
	"ot",
	"rtp",
	"su"
];

//#endregion
//#region src/isCmcdRequestKey.ts
/**
* Check if a key is a valid CMCD request key.
*
* @param key - The key to check.
*
* @returns `true` if the key is a valid CMCD request key, `false` otherwise.
*
*
* @beta
*
* @example
* {@includeCode ../test/isCmcdRequestKey.test.ts#example}
*/
function isCmcdRequestKey(key) {
	return CMCD_COMMON_KEYS.includes(key) || CMCD_REQUEST_KEYS.includes(key) || isCmcdCustomKey(key);
}

//#endregion
//#region src/isCmcdResponseReceivedKey.ts
/**
* Check if a key is a valid CMCD response key.
*
* @param key - The key to check.
*
* @returns `true` if the key is a valid CMCD request key, `false` otherwise.
*
* @group CMCD
*
* @beta
*
* @example
* {@includeCode ../../test/cmcd/isCmcdResponseReceivedKey.test.ts#example}
*/
function isCmcdResponseReceivedKey(key) {
	return CMCD_RESPONSE_KEYS.includes(key);
}

//#endregion
//#region src/CMCD_V1_KEYS.ts
/**
* Defines the keys for CMCD (Common Media Client Data) version 1.
*
*
* @beta
*/
const CMCD_V1_KEYS = [
	"bl",
	"br",
	"bs",
	"cid",
	"d",
	"dl",
	"mtp",
	"nor",
	"nrr",
	"ot",
	"pr",
	"rtp",
	"sf",
	"sid",
	"st",
	"su",
	"tb",
	"v"
];

//#endregion
//#region src/isCmcdV1Key.ts
/**
* Filter function for CMCD v1 keys.
*
* @param key - The CMCD key to filter.
*
* @returns `true` if the key should be included, `false` otherwise.
*
*
* @beta
*
* @example
* {@includeCode ../test/isCmcdV1Key.test.ts#example}
*/
function isCmcdV1Key(key) {
	return CMCD_V1_KEYS.includes(key) || isCmcdCustomKey(key);
}

//#endregion
//#region src/prepareCmcdData.ts
const filterMap = {
	[CMCD_EVENT_MODE]: isCmcdEventKey,
	[CMCD_REQUEST_MODE]: isCmcdRequestKey
};
/**
* Convert a generic object to CMCD data.
*
* @param obj - The CMCD object to process.
* @param options - Options for encoding.
*
*
* @beta
*/
function prepareCmcdData(obj, options = {}) {
	const results = {};
	if (obj == null || typeof obj !== "object") return results;
	const version = options.version || obj["v"] || 1;
	const reportingMode = options.reportingMode || CMCD_REQUEST_MODE;
	const keyFilter = version === 1 ? isCmcdV1Key : filterMap[reportingMode];
	let keys$1 = Object.keys(obj).filter(keyFilter);
	if (obj["e"] && obj["e"] !== "rr") keys$1 = keys$1.filter((key) => !isCmcdResponseReceivedKey(key));
	const filter = options.filter;
	if (typeof filter === "function") keys$1 = keys$1.filter(filter);
	const needsTimestamp = reportingMode === CMCD_EVENT_MODE;
	if (needsTimestamp && !keys$1.includes("ts")) keys$1.push("ts");
	if (version > 1 && !keys$1.includes("v")) keys$1.push("v");
	const formatters = Object.assign({}, CMCD_FORMATTER_MAP, options.formatters);
	const formatterOptions = {
		version,
		reportingMode,
		baseUrl: options.baseUrl
	};
	keys$1.sort().forEach((key) => {
		let value = obj[key];
		const formatter = formatters[key];
		if (typeof formatter === "function") value = formatter(value, formatterOptions);
		if (key === "v") if (version === 1) return;
		else value = version;
		if (key == "pr" && value === 1) return;
		if (needsTimestamp && key === "ts" && !Number.isFinite(value)) value = Date.now();
		if (!isValid(value)) return;
		if (isTokenField(key) && typeof value === "string") value = new SfToken(value);
		results[key] = value;
	});
	return results;
}

//#endregion
//#region src/toCmcdHeaders.ts
/**
* Convert a CMCD data object to request headers
*
* @param cmcd - The CMCD data object to convert.
* @param options - Options for encoding the CMCD object.
*
* @returns The CMCD header shards.
*
*
* @beta
*
* @example
* {@includeCode ../test/toCmcdHeaders.test.ts#example}
*/
function toCmcdHeaders(cmcd, options = {}) {
	const result = {};
	if (!cmcd) return result;
	const shards = groupCmcdHeaders(prepareCmcdData(cmcd, options), options?.customHeaderMap);
	return Object.entries(shards).reduce((acc, [field, value]) => {
		const shard = encodeSfDict(value, { whitespace: false });
		if (shard) acc[field] = shard;
		return acc;
	}, result);
}

//#endregion
//#region src/appendCmcdHeaders.ts
/**
* Append CMCD query args to a header object.
*
* @param headers - The headers to append to.
* @param cmcd - The CMCD object to append.
* @param options - Encode options.
*
* @returns The headers with the CMCD header shards appended.
*
*
* @beta
*
* @example
* {@includeCode ../test/appendCmcdHeaders.test.ts#example}
*/
function appendCmcdHeaders(headers, cmcd, options) {
	return Object.assign(headers, toCmcdHeaders(cmcd, options));
}

//#endregion
//#region src/CMCD_PARAM.ts
/**
* CMCD parameter name.
*
*
* @beta
*/
const CMCD_PARAM = "CMCD";

//#endregion
//#region src/encodeCmcd.ts
/**
* Encode a CMCD object to a string.
*
* @param cmcd - The CMCD object to encode.
* @param options - Options for encoding.
*
* @returns The encoded CMCD string.
*
*
* @beta
*
* @example
* {@includeCode ../test/encodeCmcd.test.ts#example}
*/
function encodeCmcd(cmcd, options = {}) {
	if (!cmcd) return "";
	return encodeSfDict(prepareCmcdData(cmcd, options), { whitespace: false });
}

//#endregion
//#region src/toCmcdUrl.ts
/**
* Convert a CMCD data object to a URL encoded string.
*
* @param cmcd - The CMCD object to convert.
* @param options - Options for encoding the CMCD object.
*
* @returns The URL encoded CMCD data.
*
*
* @beta
*/
function toCmcdUrl(cmcd, options = {}) {
	if (!cmcd) return "";
	const params = encodeCmcd(cmcd, options);
	return encodeURIComponent(params);
}

//#endregion
//#region src/toCmcdQuery.ts
/**
* Convert a CMCD data object to a query arg.
*
* @param cmcd - The CMCD object to convert.
* @param options - Options for encoding the CMCD object.
*
* @returns The CMCD query arg.
*
*
* @beta
*
* @example
* {@includeCode ../test/toCmcdQuery.test.ts#example}
*/
function toCmcdQuery(cmcd, options = {}) {
	if (!cmcd) return "";
	return `${CMCD_PARAM}=${toCmcdUrl(cmcd, options)}`;
}

//#endregion
//#region src/appendCmcdQuery.ts
const REGEX = /CMCD=[^&#]+/;
/**
* Append CMCD query args to a URL.
*
* @param url - The URL to append to.
* @param cmcd - The CMCD object to append.
* @param options - Options for encoding the CMCD object.
*
* @returns The URL with the CMCD query args appended.
*
*
* @beta
*
* @example
* {@includeCode ../test/appendCmcdQuery.test.ts#example}
*/
function appendCmcdQuery(url, cmcd, options) {
	const query = toCmcdQuery(cmcd, options);
	if (!query) return url;
	if (REGEX.test(url)) return url.replace(REGEX, query);
	return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

//#endregion
//#region src/CMCD_DEFAULT_TIME_INTERVAL.ts
/**
* The default time interval in secondswhen using using event mode
*
*
* @beta
*/
const CMCD_DEFAULT_TIME_INTERVAL = 30;

//#endregion
//#region src/CMCD_HEADERS.ts
/**
* CMCD `headers` transmission mode.
*
*
* @beta
*/
const CMCD_HEADERS = "headers";

//#endregion
//#region src/CMCD_JSON.ts
/**
* CMCD `json` transmission mode.
*
*
* @beta
*
* @deprecated JSON transmission mode is deprecated and will be removed in future versions.
*/
const CMCD_JSON = "json";

//#endregion
//#region src/CMCD_KEYS.ts
const keySet = new Set([
	...CMCD_V1_KEYS,
	...CMCD_COMMON_KEYS,
	...CMCD_REQUEST_KEYS,
	...CMCD_RESPONSE_KEYS,
	...CMCD_EVENT_KEYS
]);
/**
* A list of all CMCD keys.
*
*
* @beta
*/
const CMCD_KEYS = Array.from(keySet);

//#endregion
//#region src/CMCD_QUERY.ts
/**
* CMCD `query` transmission mode.
*
*
* @beta
*/
const CMCD_QUERY = "query";

//#endregion
//#region src/CMCD_RESPONSE_MODE.ts
/**
* CMCD response mode variable name.
*
*
* @beta
*/
const CMCD_RESPONSE_MODE = "response";

//#endregion
//#region src/CMCD_V1.ts
/**
* CMCD Version 1
*
*
* @beta
*/
const CMCD_V1 = 1;

//#endregion
//#region src/CMCD_V2.ts
/**
* CMCD Version 2
*
*
* @beta
*/
const CMCD_V2 = 2;

//#endregion
//#region src/CmcdTransmissionMode.ts
/**
* CMCD transmission modes.
*
*
* @enum
*
* @beta
*/
const CmcdTransmissionMode = {
	JSON: CMCD_JSON,
	QUERY: CMCD_QUERY,
	HEADERS: CMCD_HEADERS
};

//#endregion
//#region src/CmcdEncoding.ts
/**
* CMCD encoding types.
*
*
* @enum
*
* @beta
*
* @deprecated Use {@link CmcdTransmissionMode} instead.
*
* @see {@link CmcdTransmissionMode}
*/
const CmcdEncoding = CmcdTransmissionMode;

//#endregion
//#region src/CmcdEventType.ts
/**
* CMCD event types for the 'e' key (event mode).
*
*
* @enum
*
* @beta
*/
const CmcdEventType = {
	PLAY_STATE: "ps",
	ERROR: "e",
	TIME_INTERVAL: "t",
	CONTENT_ID: "c",
	BACKGROUNDED_MODE: "b",
	MUTE: "m",
	UNMUTE: "um",
	PLAYER_EXPAND: "pe",
	PLAYER_COLLAPSE: "pc",
	RESPONSE_RECEIVED: "rr"
};

//#endregion
//#region src/CmcdFormatters.ts
/**
* The default formatters for CMCD values.
*
*
* @beta
*
* @deprecated Use `CMCD_FORMATTER_MAP` instead.
*/
const CmcdFormatters = CMCD_FORMATTER_MAP;

//#endregion
//#region src/CmcdObjectType.ts
/**
* Common Media Client Data Object Type
*
*
* @beta
*
* @enum
*/
const CmcdObjectType = CmObjectType;

//#endregion
//#region src/CmcdPlayerState.ts
/**
* CMCD v2 player states for the 'sta' key.
*
*
* @enum
*
* @beta
*/
const CmcdPlayerState = {
	STARTING: "s",
	PLAYING: "p",
	SEEKING: "k",
	REBUFFERING: "r",
	PAUSED: "a",
	WAITING: "w",
	ENDED: "e",
	FATAL_ERROR: "f",
	QUIT: "q",
	PRELOADING: "d"
};

//#endregion
//#region src/CmcdReportingMode.ts
/**
* CMCD reporting mode types.
*
*
* @enum
*
* @beta
*/
const CmcdReportingMode = {
	REQUEST: CMCD_REQUEST_MODE,
	EVENT: CMCD_EVENT_MODE
};

//#endregion
//#region src/CmcdStreamingFormat.ts
/**
* Common Media Client Data Streaming Format
*
*
* @enum
*
* @beta
*/
const CmcdStreamingFormat = CmStreamingFormat;

//#endregion
//#region src/CmcdStreamType.ts
/**
* Common Media Client Data Stream Type
*
*
* @enum
*
* @beta
*/
const CmcdStreamType = CmStreamType;

//#endregion
//#region src/decodeCmcd.ts
function reduceValue(value) {
	if (Array.isArray(value)) return value.map(reduceValue);
	if (typeof value === "symbol") return symbolToStr(value);
	if (value instanceof SfItem && !value.params) return reduceValue(value.value);
	if (typeof value === "string") return decodeURIComponent(value);
	return value;
}
/**
* Decode a CMCD string to an object.
*
* @param cmcd - The CMCD string to decode.
*
* @returns The decoded CMCD object.
*
*
* @beta
*
* @example
* {@includeCode ../test/decodeCmcd.test.ts#example}
*/
function decodeCmcd(cmcd) {
	if (!cmcd) return {};
	const sfDict = decodeSfDict(cmcd);
	return Object.entries(sfDict).reduce((acc, [key, item]) => {
		acc[key] = reduceValue(item.value);
		return acc;
	}, {});
}

//#endregion
//#region src/fromCmcdHeaders.ts
const keys = [
	CMCD_OBJECT,
	CMCD_REQUEST,
	CMCD_SESSION,
	CMCD_STATUS
];
/**
* Decode CMCD data from request headers.
*
* @param headers - The request headers to decode.
*
* @returns The decoded CMCD data.
*
*
* @beta
*
* @example
* {@includeCode ../test/fromCmcdHeaders.test.ts#example}
*/
function fromCmcdHeaders(headers) {
	if (!(headers instanceof Headers)) headers = new Headers(headers);
	return keys.reduce((acc, key) => {
		const value = headers.get(key);
		return Object.assign(acc, decodeCmcd(value));
	}, {});
}

//#endregion
//#region src/fromCmcdQuery.ts
/**
* Decode CMCD data from a query string.
*
* @param query - The query string to decode.
*
* @returns The decoded CMCD data.
*
*
* @beta
*
* @example
* {@includeCode ../test/fromCmcdQuery.test.ts#example}
*/
function fromCmcdQuery(query) {
	if (typeof query === "string") query = new URLSearchParams(query);
	return decodeCmcd(query.get(CMCD_PARAM));
}

//#endregion
//#region src/fromCmcdUrl.ts
/**
* Decode CMCD data from a url encoded string.
*
* @param url - The url encoded string to decode.
*
* @returns The decoded CMCD data.
*
*
* @beta
*
* @example
* {@includeCode ../test/fromCmcdUrl.test.ts#example}
*/
function fromCmcdUrl(url) {
	return decodeCmcd(decodeURIComponent(url.replace(/^CMCD=/, "")));
}

//#endregion
//#region src/toCmcdJson.ts
/**
* Convert a CMCD data object to JSON.
*
* @param cmcd - The CMCD object to convert.
* @param options - Options for encoding the CMCD object.
*
* @returns The CMCD JSON.
*
*
* @beta
*
* @deprecated Sending CMCD as JSON objects is deprecated. Use `toCmcdUrl` to create an array of url strings instead.
*/
function toCmcdJson(cmcd, options) {
	const data = prepareCmcdData(cmcd, options);
	return JSON.stringify(data, (_, value) => typeof value === "symbol" || value instanceof SfToken ? symbolToStr(value) : value);
}

//#endregion
//#region src/toCmcdReport.ts
/**
* Converts CMCD data into a report format.
*
* @param data - The CMCD data to be transformed into a report
* @param target - The target configuration for the CMCD report
*
* @return A CMCD report object
*
*
* @beta
*
* @example
* {@includeCode ../test/toCmcdReport.test.ts#example}
*/
function toCmcdReport(data, target) {
	if (!target || !target.url) return null;
	const url = new URL(target.url);
	const method = target.method || "GET";
	const headers = {};
	const transimissionMode = target.transmissionMode || CMCD_QUERY;
	const options = {
		version: target.version,
		reportingMode: target.reportingMode
	};
	const { enabledKeys } = target;
	if (enabledKeys) options.filter = (key) => enabledKeys.includes(key);
	switch (transimissionMode) {
		case CMCD_QUERY:
			const param = encodeCmcd(data, options);
			if (param) url.searchParams.set(CMCD_PARAM, param);
			break;
		case CMCD_HEADERS:
			Object.assign(headers, toCmcdHeaders(data, options));
			break;
	}
	return {
		url: url.toString(),
		method,
		headers
	};
}

//#endregion
export { CMCD_COMMON_KEYS, CMCD_DEFAULT_TIME_INTERVAL, CMCD_EVENT_KEYS, CMCD_EVENT_MODE, CMCD_FORMATTER_MAP, CMCD_HEADERS, CMCD_JSON, CMCD_KEYS, CMCD_OBJECT, CMCD_PARAM, CMCD_QUERY, CMCD_REQUEST, CMCD_REQUEST_KEYS, CMCD_REQUEST_MODE, CMCD_RESPONSE_KEYS, CMCD_RESPONSE_MODE, CMCD_SESSION, CMCD_STATUS, CMCD_V1, CMCD_V1_KEYS, CMCD_V2, CmcdEncoding, CmcdEventType, CmcdFormatters, CmcdHeaderField, CmcdObjectType, CmcdPlayerState, CmcdReportingMode, CmcdStreamType, CmcdStreamingFormat, CmcdTransmissionMode, appendCmcdHeaders, appendCmcdQuery, decodeCmcd, encodeCmcd, fromCmcdHeaders, fromCmcdQuery, fromCmcdUrl, groupCmcdHeaders, isCmcdCustomKey, isCmcdEventKey, isCmcdRequestKey, isCmcdResponseReceivedKey, isCmcdV1Key, prepareCmcdData, toCmcdHeaders, toCmcdJson, toCmcdQuery, toCmcdReport, toCmcdUrl };
//# sourceMappingURL=index.js.map