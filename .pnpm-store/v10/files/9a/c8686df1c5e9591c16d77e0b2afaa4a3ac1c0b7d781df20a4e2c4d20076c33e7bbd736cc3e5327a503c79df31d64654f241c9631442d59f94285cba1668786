//#region src/arrayBufferToHex.ts
/**
* Encodes an ArrayBuffer as a hexadecimal string.
*
* @param buffer - The ArrayBuffer to encode.
* @returns The hexadecimal string representation.
*
*
* @beta
*
* @example
* {@includeCode ../test/arrayBufferToHex.test.ts#example}
*/
function arrayBufferToHex(buffer) {
	return new Uint8Array(buffer).reduce((result, byte) => result + byte.toString(16).padStart(2, "0"), "");
}

//#endregion
//#region src/arrayBufferToUuid.ts
/**
* Converts an ArrayBuffer to a UUID string.
*
* @param buffer - The ArrayBuffer to convert.
* @returns The UUID string representation.
*
*
* @beta
*
* @example
* {@includeCode ../test/arrayBufferToUuid.test.ts#example}
*/
function arrayBufferToUuid(buffer) {
	return arrayBufferToHex(buffer).replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
}

//#endregion
//#region src/decodeBase64.ts
/**
* Decodes a base64 encoded string into binary data
*
* @param str - The base64 encoded string to decode
* @returns The decoded binary data
*
*
* @beta
*/
function decodeBase64(str) {
	return new Uint8Array([...atob(str)].map((a) => a.charCodeAt(0)));
}

//#endregion
//#region src/base64decode.ts
/**
* Decodes a base64 encoded string into binary data
*
* @param str - The base64 encoded string to decode
* @returns The decoded binary data
*
*
* @beta
*
* @deprecated Use {@link decodeBase64} instead.
*
* @see {@link decodeBase64}
*/
const base64decode = decodeBase64;

//#endregion
//#region src/encodeBase64.ts
/**
* Encodes binary data to base64
*
* @param binary - The binary data to encode
* @returns The base64 encoded string
*
*
* @beta
*/
function encodeBase64(binary) {
	return btoa(String.fromCharCode(...binary));
}

//#endregion
//#region src/base64encode.ts
/**
* Encodes binary data to base64
*
* @param binary - The binary data to encode
* @returns The base64 encoded string
*
*
* @beta
*
* @deprecated Use {@link encodeBase64} instead.
*
* @see {@link encodeBase64}
*/
const base64encode = encodeBase64;

//#endregion
//#region src/convertUint8ToUint16.ts
/**
* Converts a Uint8Array to a Uint16Array by aligning its buffer.
*
* @param input - The Uint8Array to convert
* @returns A properly aligned Uint16Array
*
* @beta
*/
function convertUint8ToUint16(input) {
	if (input.length % 2 !== 0) {
		const padded = new Uint8Array(input.length + 1);
		padded.set(input);
		return new Uint16Array(padded.buffer);
	}
	return new Uint16Array(input.buffer);
}

//#endregion
//#region src/UTF_16.ts
/**
* UTF-16 Encoding.
*
*
* @beta
*/
const UTF_16 = "utf-16";

//#endregion
//#region src/UTF_16_BE.ts
/**
* UTF-16 Big Endian Encoding.
*
*
* @beta
*/
const UTF_16_BE = "utf-16be";

//#endregion
//#region src/UTF_16_LE.ts
/**
* UTF-16 Little Endian Encoding.
*
*
* @beta
*/
const UTF_16_LE = "utf-16le";

//#endregion
//#region src/UTF_8.ts
/**
* UTF-8 Encoding.
*
*
* @beta
*/
const UTF_8 = "utf-8";

//#endregion
//#region src/decodeText.ts
/**
* Converts an ArrayBuffer or ArrayBufferView to a string. Similar to `TextDecoder.decode`
* but with a fallback for environments that don't support `TextDecoder`.
*
* @param data - The data to decode.
* @param options - The options for the decoding.
* @returns The string representation of the ArrayBuffer.
*
*
* @beta
*
* @example
* {@includeCode ../test/decodeText.test.ts#example}
*/
function decodeText(data, options = {}) {
	let view;
	if (data instanceof ArrayBuffer) view = new DataView(data);
	else view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	let byteOffset = 0;
	let { encoding } = options;
	if (!encoding) {
		const first = view.getUint8(0);
		const second = view.getUint8(1);
		if (first == 239 && second == 187 && view.getUint8(2) == 191) {
			encoding = UTF_8;
			byteOffset = 3;
		} else if (first == 254 && second == 255) {
			encoding = UTF_16_BE;
			byteOffset = 2;
		} else if (first == 255 && second == 254) {
			encoding = UTF_16_LE;
			byteOffset = 2;
		} else encoding = UTF_8;
	}
	if (typeof TextDecoder !== "undefined") return new TextDecoder(encoding).decode(view);
	const { byteLength } = view;
	const endian = encoding !== UTF_16_BE;
	let str = "";
	let char;
	while (byteOffset < byteLength) {
		switch (encoding) {
			case UTF_8:
				char = view.getUint8(byteOffset);
				if (char < 128) byteOffset++;
				else if (char >= 194 && char <= 223) if (byteOffset + 1 < byteLength) {
					const byte2 = view.getUint8(byteOffset + 1);
					if (byte2 >= 128 && byte2 <= 191) {
						char = (char & 31) << 6 | byte2 & 63;
						byteOffset += 2;
					} else byteOffset++;
				} else byteOffset++;
				else if (char >= 224 && char <= 239) if (byteOffset + 2 <= byteLength - 1) {
					const byte2 = view.getUint8(byteOffset + 1);
					const byte3 = view.getUint8(byteOffset + 2);
					if (byte2 >= 128 && byte2 <= 191 && byte3 >= 128 && byte3 <= 191) {
						char = (char & 15) << 12 | (byte2 & 63) << 6 | byte3 & 63;
						byteOffset += 3;
					} else byteOffset++;
				} else byteOffset++;
				else if (char >= 240 && char <= 244) if (byteOffset + 3 <= byteLength - 1) {
					const byte2 = view.getUint8(byteOffset + 1);
					const byte3 = view.getUint8(byteOffset + 2);
					const byte4 = view.getUint8(byteOffset + 3);
					if (byte2 >= 128 && byte2 <= 191 && byte3 >= 128 && byte3 <= 191 && byte4 >= 128 && byte4 <= 191) {
						char = (char & 7) << 18 | (byte2 & 63) << 12 | (byte3 & 63) << 6 | byte4 & 63;
						byteOffset += 4;
					} else byteOffset++;
				} else byteOffset++;
				else byteOffset++;
				break;
			case UTF_16_BE:
			case UTF_16:
			case UTF_16_LE:
				char = view.getUint16(byteOffset, endian);
				byteOffset += 2;
				break;
		}
		str += String.fromCodePoint(char);
	}
	return str;
}

//#endregion
//#region src/Encoding.ts
/**
* Text encoding types.
*
*
* @beta
*/
const Encoding = {
	UTF8: UTF_8,
	UTF16: UTF_16,
	UTF16BE: UTF_16_BE,
	UTF16LE: UTF_16_LE
};

//#endregion
//#region src/getBandwidthBps.ts
/**
* Converts a ResourceTiming sample to bandwidth in bits per second (bps).
*
* @param sample - A ResourceTiming sample
* @returns
*
*
* @beta
*/
function getBandwidthBps(sample) {
	const durationSeconds = sample.duration / 1e3;
	return sample.encodedBodySize * 8 / durationSeconds;
}

//#endregion
//#region src/hexToArrayBuffer.ts
/**
* Decodes a hexadecimal string into an ArrayBuffer.
*
* @param hex - The hexadecimal string to decode.
* @returns The decoded ArrayBuffer.
*
*
* @beta
*
* @example
* {@includeCode ../test/hexToArrayBuffer.test.ts#example}
*/
function hexToArrayBuffer(hex) {
	const buffer = /* @__PURE__ */ new ArrayBuffer(hex.length / 2);
	const view = new Uint8Array(buffer);
	for (let i = 0; i < hex.length; i += 2) view[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	return buffer;
}

//#endregion
//#region src/RequestType.ts
/**
* The content type of the request.
*
*
* @enum
*
* @beta
*/
const RequestType = {
	TEXT: "text",
	JSON: "json",
	BLOB: "blob",
	ARRAY_BUFFER: "arrayBuffer",
	DOCUMENT: "document"
};

//#endregion
//#region src/roundToEven.ts
/**
* This implements the rounding procedure described in step 2 of the "Serializing a Decimal" specification.
* This rounding style is known as "even rounding", "banker's rounding", or "commercial rounding".
*
* @param value - The value to round
* @param precision - The number of decimal places to round to
* @returns The rounded value
*
*
* @beta
*/
function roundToEven(value, precision) {
	if (value < 0) return -roundToEven(-value, precision);
	const decimalShift = Math.pow(10, precision);
	if (Math.abs(value * decimalShift % 1 - .5) < Number.EPSILON) {
		const flooredValue = Math.floor(value * decimalShift);
		return (flooredValue % 2 === 0 ? flooredValue : flooredValue + 1) / decimalShift;
	} else return Math.round(value * decimalShift) / decimalShift;
}

//#endregion
//#region src/stringToUint16.ts
/**
* Converts a string to a Uint16Array.
*
* @param str - The string to convert
* @returns A Uint16Array representation of the string
*
*
* @beta
*
* @example
* {@includeCode ../test/stringToUint16.test.ts#example}
*/
function stringToUint16(str) {
	const buffer = /* @__PURE__ */ new ArrayBuffer(str.length * 2);
	const view = new DataView(buffer);
	for (let i = 0; i < str.length; i++) view.setUint16(i * 2, str.charCodeAt(i), true);
	return new Uint16Array(buffer);
}

//#endregion
//#region src/unescapeHtml.ts
const escapedHtml = /&(?:amp|lt|gt|quot|apos|nbsp|lrm|rlm|#[xX]?[0-9a-fA-F]+);/g;
/**
* Unescapes HTML entities
*
* @param text - The text to unescape
* @returns The unescaped text
*
*
* @beta
*
* @example
* {@includeCode ../test/unescapeHtml.test.ts#example}
*/
function unescapeHtml(text) {
	if (text.indexOf("&") === -1) return text;
	return text.replace(escapedHtml, (match) => {
		switch (match) {
			case "&amp;": return "&";
			case "&lt;": return "<";
			case "&gt;": return ">";
			case "&quot;": return "\"";
			case "&apos;": return "'";
			case "&nbsp;": return "\xA0";
			case "&lrm;": return "‎";
			case "&rlm;": return "‏";
			default:
				if (match[1] === "#") {
					const code = match[2] === "x" || match[2] === "X" ? parseInt(match.slice(3), 16) : parseInt(match.slice(2), 10);
					return String.fromCodePoint(code);
				}
				return match;
		}
	});
}

//#endregion
//#region src/urlToRelativePath.ts
/**
* Constructs a relative path from a URL.
*
* @param url - The destination URL
* @param base - The base URL
* @returns The relative path
*
*
* @beta
*/
function urlToRelativePath(url, base) {
	const to = new URL(url);
	const from = new URL(base);
	if (to.origin !== from.origin) return url;
	const toPath = to.pathname.split("/").slice(1);
	const fromPath = from.pathname.split("/").slice(1, -1);
	const length = Math.min(toPath.length, fromPath.length);
	for (let i = 0; i < length; i++) {
		if (toPath[i] !== fromPath[i]) break;
		toPath.shift();
		fromPath.shift();
	}
	while (fromPath.length) {
		fromPath.shift();
		toPath.unshift("..");
	}
	return toPath.join("/") + to.search + to.hash;
}

//#endregion
//#region src/uuid.ts
/**
* Generate a random v4 UUID
*
* @returns A random v4 UUID
*
*
* @beta
*/
function uuid() {
	try {
		return crypto.randomUUID();
	} catch (error) {
		try {
			const url = URL.createObjectURL(new Blob());
			const uuid$1 = url.toString();
			URL.revokeObjectURL(url);
			return uuid$1.slice(uuid$1.lastIndexOf("/") + 1);
		} catch (error$1) {
			let dt = (/* @__PURE__ */ new Date()).getTime();
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
				const r = (dt + Math.random() * 16) % 16 | 0;
				dt = Math.floor(dt / 16);
				return (c == "x" ? r : r & 3 | 8).toString(16);
			});
		}
	}
}

//#endregion
//#region src/uuidToArrayBuffer.ts
/**
* Converts a UUID string to an ArrayBuffer.
*
* @param uuid - The UUID string to convert.
* @returns The ArrayBuffer representation.
*
*
* @beta
*
* @example
* {@includeCode ../test/uuidToArrayBuffer.test.ts#example}
*/
function uuidToArrayBuffer(uuid$1) {
	return hexToArrayBuffer(uuid$1.replace(/-/g, ""));
}

//#endregion
export { Encoding, RequestType, UTF_16, UTF_16_BE, UTF_16_LE, UTF_8, arrayBufferToHex, arrayBufferToUuid, base64decode, base64encode, convertUint8ToUint16, decodeBase64, decodeText, encodeBase64, getBandwidthBps, hexToArrayBuffer, roundToEven, stringToUint16, unescapeHtml, urlToRelativePath, uuid, uuidToArrayBuffer };
//# sourceMappingURL=index.js.map