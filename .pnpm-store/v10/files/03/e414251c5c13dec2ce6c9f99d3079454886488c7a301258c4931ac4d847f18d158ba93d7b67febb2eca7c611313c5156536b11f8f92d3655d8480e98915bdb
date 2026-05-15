import { decodeBase64, encodeBase64, roundToEven } from "@svta/cml-utils";

//#region src/SfItem.ts
/**
* Structured Field Item
*
*
* @beta
*/
var SfItem = class SfItem {
	constructor(value, params) {
		if (Array.isArray(value)) value = value.map((v) => v instanceof SfItem ? v : new SfItem(v));
		this.value = value;
		this.params = params;
	}
};

//#endregion
//#region src/utils/DICT.ts
const DICT = "Dict";

//#endregion
//#region src/parse/ParsedValue.ts
/**
* @internal
*/
function parsedValue(value, src) {
	return {
		value,
		src
	};
}

//#endregion
//#region src/utils/throwError.ts
function format(value) {
	if (Array.isArray(value)) return JSON.stringify(value);
	if (value instanceof Map) return "Map{}";
	if (value instanceof Set) return "Set{}";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}
function throwError(action, src, type, cause) {
	return new Error(`failed to ${action} "${format(src)}" as ${type}`, { cause });
}

//#endregion
//#region src/parse/parseError.ts
/**
* @internal
*/
function parseError(src, type, cause) {
	return throwError("parse", src, type, cause);
}

//#endregion
//#region src/utils/INNER.ts
const INNER = "Inner List";

//#endregion
//#region src/utils/BARE_ITEM.ts
const BARE_ITEM = "Bare Item";

//#endregion
//#region src/utils/BOOLEAN.ts
const BOOLEAN = "Boolean";

//#endregion
//#region src/parse/parseBoolean.ts
/**
* @internal
*/
function parseBoolean(src) {
	let i = 0;
	if (src[i] !== "?") throw parseError(src, BOOLEAN);
	i++;
	if (src[i] === "1") return parsedValue(true, src.substring(++i));
	if (src[i] === "0") return parsedValue(false, src.substring(++i));
	throw parseError(src, BOOLEAN);
}

//#endregion
//#region src/utils/BYTES.ts
const BYTES = "Byte Sequence";

//#endregion
//#region src/parse/parseByteSequence.ts
/**
* @internal
*/
function parseByteSequence(src) {
	if (src[0] !== ":") throw parseError(src, BYTES);
	src = src.substring(1);
	if (src.includes(":") === false) throw parseError(src, BYTES);
	const re = /(^.*?)(:)/g;
	const b64_content = re.exec(src)[1];
	src = src.substring(re.lastIndex);
	return parsedValue(decodeBase64(b64_content), src);
}

//#endregion
//#region src/utils/DATE.ts
const DATE = "Date";

//#endregion
//#region src/utils/DECIMAL.ts
const DECIMAL = "Decimal";

//#endregion
//#region src/utils/INTEGER.ts
const INTEGER = "Integer";

//#endregion
//#region src/utils/INTEGER_DECIMAL.ts
const INTEGER_DECIMAL = `${INTEGER} or ${DECIMAL}`;

//#endregion
//#region src/utils/isInvalidInt.ts
function isInvalidInt(value) {
	return value < -999999999999999 || 999999999999999 < value;
}

//#endregion
//#region src/parse/parseIntegerOrDecimal.ts
/**
* @internal
*/
function parseIntegerOrDecimal(src) {
	const orig = src;
	let sign = 1;
	let num = "";
	let value;
	const i = 0;
	const error = parseError(orig, INTEGER_DECIMAL);
	if (src[i] === "-") {
		sign = -1;
		src = src.substring(1);
	}
	if (src.length <= 0) throw error;
	const re_integer = /^(\d+)?/g;
	const result_integer = re_integer.exec(src);
	if (result_integer[0].length === 0) throw error;
	num += result_integer[1];
	src = src.substring(re_integer.lastIndex);
	if (src[0] === ".") {
		if (num.length > 12) throw error;
		const re_decimal = /^(\.\d+)?/g;
		const result_decimal = re_decimal.exec(src);
		src = src.substring(re_decimal.lastIndex);
		if (result_decimal[0].length === 0 || result_decimal[1].length > 4) throw error;
		num += result_decimal[1];
		if (num.length > 16) throw error;
		value = parseFloat(num) * sign;
	} else {
		if (num.length > 15) throw error;
		value = parseInt(num) * sign;
		if (isInvalidInt(value)) throw parseError(num, INTEGER_DECIMAL);
	}
	return parsedValue(value, src);
}

//#endregion
//#region src/parse/parseDate.ts
/**
* @internal
*/
function parseDate(src) {
	let i = 0;
	if (src[i] !== "@") throw parseError(src, DATE);
	i++;
	const date = parseIntegerOrDecimal(src.substring(i));
	if (Number.isInteger(date.value) === false) throw parseError(src, DATE);
	return parsedValue(/* @__PURE__ */ new Date(date.value * 1e3), date.src);
}

//#endregion
//#region src/utils/STRING.ts
const STRING = "String";

//#endregion
//#region src/utils/STRING_REGEX.ts
const STRING_REGEX = /[\x00-\x1f\x7f]+/;

//#endregion
//#region src/parse/parseString.ts
/**
* @internal
*/
function parseString(src) {
	let output = "";
	let i = 0;
	if (src[i] !== `"`) throw parseError(src, STRING);
	i++;
	while (src.length > i) {
		if (src[i] === `\\`) {
			if (src.length <= i + 1) throw parseError(src, STRING);
			i++;
			if (src[i] !== `"` && src[i] !== `\\`) throw parseError(src, STRING);
			output += src[i];
		} else if (src[i] === `"`) return parsedValue(output, src.substring(++i));
		else if (STRING_REGEX.test(src[i])) throw parseError(src, STRING);
		else output += src[i];
		i++;
	}
	throw parseError(src, STRING);
}

//#endregion
//#region src/SfToken.ts
/**
* A class to represent structured field tokens when `Symbol` is not available.
*
*
* @beta
*/
var SfToken = class {
	constructor(description) {
		this.description = description;
	}
};

//#endregion
//#region src/utils/TOKEN.ts
const TOKEN = "Token";

//#endregion
//#region src/parse/parseToken.ts
/**
* @internal
*/
function parseToken(src, options) {
	if (/^[a-zA-Z*]$/.test(src[0]) === false) throw parseError(src, TOKEN);
	const re = /^([!#$%&'*+\-.^_`|~\w:/]+)/g;
	const value = re.exec(src)[1];
	src = src.substring(re.lastIndex);
	return parsedValue(options?.useSymbol === false ? new SfToken(value) : Symbol.for(value), src);
}

//#endregion
//#region src/parse/parseBareItem.ts
/**
* @internal
*/
function parseBareItem(src, options) {
	const first = src[0];
	if (first === `"`) return parseString(src);
	if (/^[-0-9]/.test(first)) return parseIntegerOrDecimal(src);
	if (first === `?`) return parseBoolean(src);
	if (first === `:`) return parseByteSequence(src);
	if (/^[a-zA-Z*]/.test(first)) return parseToken(src, options);
	if (first === `@`) return parseDate(src);
	throw parseError(src, BARE_ITEM);
}

//#endregion
//#region src/utils/KEY.ts
const KEY = "Key";

//#endregion
//#region src/parse/parseKey.ts
/**
* @internal
*/
function parseKey(src) {
	let i = 0;
	if (/^[a-z*]$/.test(src[i]) === false) throw parseError(src, KEY);
	let value = "";
	while (src.length > i) {
		if (/^[a-z0-9_\-.*]$/.test(src[i]) === false) return parsedValue(value, src.substring(i));
		value += src[i];
		i++;
	}
	return parsedValue(value, src.substring(i));
}

//#endregion
//#region src/parse/parseParameters.ts
/**
* @internal
*/
function parseParameters(src, options) {
	let parameters = void 0;
	while (src.length > 0) {
		if (src[0] !== ";") break;
		src = src.substring(1).trim();
		const parsedKey = parseKey(src);
		const key = parsedKey.value;
		let value = true;
		src = parsedKey.src;
		if (src[0] === "=") {
			src = src.substring(1);
			const parsedBareItem = parseBareItem(src, options);
			value = parsedBareItem.value;
			src = parsedBareItem.src;
		}
		if (parameters == null) parameters = {};
		parameters[key] = value;
	}
	return parsedValue(parameters, src);
}

//#endregion
//#region src/parse/parseItem.ts
/**
* @internal
*/
function parseItem(src, options) {
	const parsedBareItem = parseBareItem(src, options);
	src = parsedBareItem.src;
	const parsedParameters = parseParameters(src, options);
	src = parsedParameters.src;
	return parsedValue(new SfItem(parsedBareItem.value, parsedParameters.value), src);
}

//#endregion
//#region src/parse/parseInnerList.ts
/**
* @internal
*/
function parseInnerList(src, options) {
	if (src[0] !== "(") throw parseError(src, INNER);
	src = src.substring(1);
	const innerList = [];
	while (src.length > 0) {
		src = src.trim();
		if (src[0] === ")") {
			src = src.substring(1);
			const parsedParameters = parseParameters(src, options);
			return parsedValue(new SfItem(innerList, parsedParameters.value), parsedParameters.src);
		}
		const parsedItem = parseItem(src, options);
		innerList.push(parsedItem.value);
		src = parsedItem.src;
		if (src[0] !== " " && src[0] !== ")") throw parseError(src, INNER);
	}
	throw parseError(src, INNER);
}

//#endregion
//#region src/parse/parseItemOrInnerList.ts
/**
* @internal
*/
function parseItemOrInnerList(src, options) {
	if (src[0] === "(") return parseInnerList(src, options);
	return parseItem(src, options);
}

//#endregion
//#region src/parse/parseDict.ts
/**
* @internal
*/
function parseDict(src, options) {
	const value = {};
	while (src.length > 0) {
		let member;
		const parsedKey = parseKey(src);
		const key = parsedKey.value;
		src = parsedKey.src;
		if (src[0] === "=") {
			const parsedItemOrInnerList = parseItemOrInnerList(src.substring(1), options);
			member = parsedItemOrInnerList.value;
			src = parsedItemOrInnerList.src;
		} else {
			const parsedParameters = parseParameters(src, options);
			member = new SfItem(true, parsedParameters.value);
			src = parsedParameters.src;
		}
		value[key] = member;
		src = src.trim();
		if (src.length === 0) return parsedValue(value, src);
		if (src[0] !== ",") throw parseError(src, DICT);
		src = src.substring(1).trim();
		if (src.length === 0 || src[0] === ",") throw parseError(src, DICT);
	}
	return parsedValue(value, src);
}

//#endregion
//#region src/decodeSfDict.ts
/**
* Decode a structured field string into a structured field dictionary
*
* @param input - The structured field string to decode
* @returns The structured field dictionary
*
*
* @beta
*/
function decodeSfDict(input, options) {
	try {
		const { src, value } = parseDict(input.trim(), options);
		if (src !== "") throw parseError(src, DICT);
		return value;
	} catch (cause) {
		throw parseError(input, DICT, cause);
	}
}

//#endregion
//#region src/utils/ITEM.ts
const ITEM = "Item";

//#endregion
//#region src/decodeSfItem.ts
/**
* Decode a structured field string into a structured field item
*
* @param input - The structured field string to decode
* @returns The structured field item
*
*
* @beta
*/
function decodeSfItem(input, options) {
	try {
		const { src, value } = parseItem(input.trim(), options);
		if (src !== "") throw parseError(src, ITEM);
		return value;
	} catch (cause) {
		throw parseError(input, ITEM, cause);
	}
}

//#endregion
//#region src/utils/LIST.ts
const LIST = "List";

//#endregion
//#region src/parse/parseList.ts
/**
* @internal
*/
function parseList(src, options) {
	const value = [];
	while (src.length > 0) {
		const parsedItemOrInnerList = parseItemOrInnerList(src, options);
		value.push(parsedItemOrInnerList.value);
		src = parsedItemOrInnerList.src.trim();
		if (src.length === 0) return parsedValue(value, src);
		if (src[0] !== ",") throw parseError(src, LIST);
		src = src.substring(1).trim();
		if (src.length === 0 || src[0] === ",") throw parseError(src, LIST);
	}
	return parsedValue(value, src);
}

//#endregion
//#region src/decodeSfList.ts
/**
* Decode a structured field string into a structured field list
*
* @param input - The structured field string to decode
* @returns The structured field list
*
*
* @beta
*/
function decodeSfList(input, options) {
	try {
		const { src, value } = parseList(input.trim(), options);
		if (src !== "") throw parseError(src, LIST);
		return value;
	} catch (cause) {
		throw parseError(input, LIST, cause);
	}
}

//#endregion
//#region src/serialize/serializeError.ts
/**
* @internal
*/
function serializeError(src, type, cause) {
	return throwError("serialize", src, type, cause);
}

//#endregion
//#region src/serialize/serializeBoolean.ts
/**
* @internal
*/
function serializeBoolean(value) {
	if (typeof value !== "boolean") throw serializeError(value, BOOLEAN);
	return value ? "?1" : "?0";
}

//#endregion
//#region src/serialize/serializeByteSequence.ts
/**
* @internal
*/
function serializeByteSequence(value) {
	if (ArrayBuffer.isView(value) === false) throw serializeError(value, BYTES);
	return `:${encodeBase64(value)}:`;
}

//#endregion
//#region src/serialize/serializeInteger.ts
/**
* @internal
*/
function serializeInteger(value) {
	if (isInvalidInt(value)) throw serializeError(value, INTEGER);
	return value.toString();
}

//#endregion
//#region src/serialize/serializeDate.ts
/**
* @internal
*/
function serializeDate(value) {
	return `@${serializeInteger(value.getTime() / 1e3)}`;
}

//#endregion
//#region src/serialize/serializeDecimal.ts
/**
* @internal
*/
function serializeDecimal(value) {
	const roundedValue = roundToEven(value, 3);
	if (Math.floor(Math.abs(roundedValue)).toString().length > 12) throw serializeError(value, DECIMAL);
	const stringValue = roundedValue.toString();
	return stringValue.includes(".") ? stringValue : `${stringValue}.0`;
}

//#endregion
//#region src/serialize/serializeString.ts
/**
* @internal
*/
function serializeString(value) {
	if (STRING_REGEX.test(value)) throw serializeError(value, STRING);
	return `"${value.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"`;
}

//#endregion
//#region src/utils/symbolToStr.ts
/**
* Converts a symbol to a string.
*
* @param symbol - The symbol to convert.
*
* @returns The string representation of the symbol.
*
*
* @beta
*/
function symbolToStr(symbol) {
	return symbol.description || symbol.toString().slice(7, -1);
}

//#endregion
//#region src/serialize/serializeToken.ts
/**
* @internal
*/
function serializeToken(token) {
	const value = symbolToStr(token);
	if (/^([a-zA-Z*])([!#$%&'*+\-.^_`|~\w:/]*)$/.test(value) === false) throw serializeError(value, TOKEN);
	return value;
}

//#endregion
//#region src/serialize/serializeBareItem.ts
/**
* @internal
*/
function serializeBareItem(value) {
	switch (typeof value) {
		case "number":
			if (!Number.isFinite(value)) throw serializeError(value, BARE_ITEM);
			if (Number.isInteger(value)) return serializeInteger(value);
			return serializeDecimal(value);
		case "string": return serializeString(value);
		case "symbol": return serializeToken(value);
		case "boolean": return serializeBoolean(value);
		case "object":
			if (value instanceof Date) return serializeDate(value);
			if (value instanceof Uint8Array) return serializeByteSequence(value);
			if (value instanceof SfToken) return serializeToken(value);
		default: throw serializeError(value, BARE_ITEM);
	}
}

//#endregion
//#region src/serialize/serializeKey.ts
/**
* @internal
*/
function serializeKey(value) {
	if (/^[a-z*][a-z0-9\-_.*]*$/.test(value) === false) throw serializeError(value, KEY);
	return value;
}

//#endregion
//#region src/serialize/serializeParams.ts
/**
* @internal
*/
function serializeParams(params) {
	if (params == null) return "";
	return Object.entries(params).map(([key, value]) => {
		if (value === true) return `;${serializeKey(key)}`;
		return `;${serializeKey(key)}=${serializeBareItem(value)}`;
	}).join("");
}

//#endregion
//#region src/serialize/serializeItem.ts
/**
* @internal
*/
function serializeItem(value) {
	if (value instanceof SfItem) return `${serializeBareItem(value.value)}${serializeParams(value.params)}`;
	else return serializeBareItem(value);
}

//#endregion
//#region src/serialize/serializeInnerList.ts
/**
* @internal
*/
function serializeInnerList(value) {
	return `(${value.value.map(serializeItem).join(" ")})${serializeParams(value.params)}`;
}

//#endregion
//#region src/serialize/serializeDict.ts
/**
* @internal
*/
function serializeDict(dict, options = { whitespace: true }) {
	if (typeof dict !== "object" || dict == null) throw serializeError(dict, DICT);
	const entries = dict instanceof Map ? dict.entries() : Object.entries(dict);
	const optionalWhiteSpace = options?.whitespace ? " " : "";
	return Array.from(entries).map(([key, item]) => {
		if (item instanceof SfItem === false) item = new SfItem(item);
		let output = serializeKey(key);
		if (item.value === true) output += serializeParams(item.params);
		else {
			output += "=";
			if (Array.isArray(item.value)) output += serializeInnerList(item);
			else output += serializeItem(item);
		}
		return output;
	}).join(`,${optionalWhiteSpace}`);
}

//#endregion
//#region src/encodeSfDict.ts
/**
* Encode an object into a structured field dictionary
*
* @param value - The structured field dictionary to encode
* @param options - Encoding options
*
* @returns The structured field string
*
*
* @beta
*/
function encodeSfDict(value, options) {
	return serializeDict(value, options);
}

//#endregion
//#region src/encodeSfItem.ts
function encodeSfItem(value, params) {
	if (!(value instanceof SfItem)) value = new SfItem(value, params);
	return serializeItem(value);
}

//#endregion
//#region src/serialize/serializeList.ts
/**
* @internal
*/
function serializeList(list, options = { whitespace: true }) {
	if (Array.isArray(list) === false) throw serializeError(list, LIST);
	const optionalWhiteSpace = options?.whitespace ? " " : "";
	return list.map((item) => {
		if (item instanceof SfItem === false) item = new SfItem(item);
		const i = item;
		if (Array.isArray(i.value)) return serializeInnerList(i);
		return serializeItem(i);
	}).join(`,${optionalWhiteSpace}`);
}

//#endregion
//#region src/encodeSfList.ts
/**
* Encode a list into a structured field dictionary
*
* @param value - The structured field list to encode
* @param options - Encoding options
*
* @returns The structured field string
*
*
* @beta
*/
function encodeSfList(value, options) {
	return serializeList(value, options);
}

//#endregion
export { SfItem, SfToken, decodeSfDict, decodeSfItem, decodeSfList, encodeSfDict, encodeSfItem, encodeSfList, parseBareItem, parseBoolean, parseByteSequence, parseDate, parseDict, parseError, parseInnerList, parseIntegerOrDecimal, parseItem, parseItemOrInnerList, parseKey, parseList, parseParameters, parseString, parseToken, serializeBareItem, serializeBoolean, serializeByteSequence, serializeDate, serializeDecimal, serializeDict, serializeError, serializeInnerList, serializeInteger, serializeItem, serializeKey, serializeList, serializeParams, serializeString, serializeToken, symbolToStr };
//# sourceMappingURL=index.js.map