//#region src/arrayBufferToHex.d.ts
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
declare function arrayBufferToHex(buffer: ArrayBuffer): string;
//#endregion
//#region src/arrayBufferToUuid.d.ts
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
declare function arrayBufferToUuid(buffer: ArrayBuffer): string;
//#endregion
//#region src/decodeBase64.d.ts
/**
* Decodes a base64 encoded string into binary data
*
* @param str - The base64 encoded string to decode
* @returns The decoded binary data
*
*
* @beta
*/
declare function decodeBase64(str: string): Uint8Array;
//#endregion
//#region src/base64decode.d.ts
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
declare const base64decode: typeof decodeBase64;
//#endregion
//#region src/encodeBase64.d.ts
/**
* Encodes binary data to base64
*
* @param binary - The binary data to encode
* @returns The base64 encoded string
*
*
* @beta
*/
declare function encodeBase64(binary: Uint8Array): string;
//#endregion
//#region src/base64encode.d.ts
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
declare const base64encode: typeof encodeBase64;
//#endregion
//#region src/convertUint8ToUint16.d.ts
/**
* Converts a Uint8Array to a Uint16Array by aligning its buffer.
*
* @param input - The Uint8Array to convert
* @returns A properly aligned Uint16Array
*
* @beta
*/
declare function convertUint8ToUint16(input: Uint8Array): Uint16Array;
//#endregion
//#region src/UTF_16.d.ts
/**
* UTF-16 Encoding.
*
*
* @beta
*/
declare const UTF_16 = "utf-16";
//#endregion
//#region src/UTF_16_BE.d.ts
/**
* UTF-16 Big Endian Encoding.
*
*
* @beta
*/
declare const UTF_16_BE = "utf-16be";
//#endregion
//#region src/UTF_16_LE.d.ts
/**
* UTF-16 Little Endian Encoding.
*
*
* @beta
*/
declare const UTF_16_LE = "utf-16le";
//#endregion
//#region src/UTF_8.d.ts
/**
* UTF-8 Encoding.
*
*
* @beta
*/
declare const UTF_8 = "utf-8";
//#endregion
//#region src/ValueOf.d.ts
/**
* Utility type to get the value of a given object type.
*
*
* @beta
*/
type ValueOf<T> = T[keyof T];
//#endregion
//#region src/Encoding.d.ts
/**
* Text encoding types.
*
*
* @beta
*/
declare const Encoding: {
  readonly UTF8: typeof UTF_8;
  readonly UTF16: typeof UTF_16;
  readonly UTF16BE: typeof UTF_16_BE;
  readonly UTF16LE: typeof UTF_16_LE;
};
/**
* Text encoding types.
*
*
* @beta
*/
type Encoding = ValueOf<typeof Encoding>;
//#endregion
//#region src/DecodeTextOptions.d.ts
/**
* Options for the `decodeText` function.
*
*
* @beta
*/
type DecodeTextOptions = {
  /**
  *  The encoding to use. If not provided, the function will try to detect the encoding from the BOM.
  */
  encoding?: Encoding;
};
//#endregion
//#region src/decodeText.d.ts
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
declare function decodeText(data: ArrayBuffer | ArrayBufferView<ArrayBuffer>, options?: DecodeTextOptions): string;
//#endregion
//#region src/ResourceTiming.d.ts
/**
* Resource Timing.
*
*
* @beta
*/
type ResourceTiming = {
  startTime: number;
  encodedBodySize: number;
  responseStart?: number;
  duration: number;
};
//#endregion
//#region src/getBandwidthBps.d.ts
/**
* Converts a ResourceTiming sample to bandwidth in bits per second (bps).
*
* @param sample - A ResourceTiming sample
* @returns
*
*
* @beta
*/
declare function getBandwidthBps(sample: ResourceTiming): number;
//#endregion
//#region src/hexToArrayBuffer.d.ts
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
declare function hexToArrayBuffer(hex: string): ArrayBuffer;
//#endregion
//#region src/RequestType.d.ts
/**
* The content type of the request.
*
*
* @enum
*
* @beta
*/
declare const RequestType: {
  readonly TEXT: "text";
  readonly JSON: "json";
  readonly BLOB: "blob";
  readonly ARRAY_BUFFER: "arrayBuffer";
  readonly DOCUMENT: "document";
};
/**
* @beta
*/
type RequestType = ValueOf<typeof RequestType>;
//#endregion
//#region src/Request.d.ts
/**
* Generic request API.
*
*
* @beta
*/
type Request<D = any> = {
  /**
  * The URL of the request.
  */
  url: string;
  /**
  * The request's method (GET, POST, etc).
  */
  method?: string;
  /**
  * The body of the request.
  */
  body?: BodyInit;
  /**
  * The response type with which the response from the server shall be compatible.
  */
  responseType?: RequestType;
  /**
  * The headers object associated with the request.
  */
  headers?: Record<string, string>;
  /**
  * Indicates whether the user agent should send or receive cookies from the other domain in the case of cross-origin requests.
  */
  credentials?: RequestCredentials;
  /**
  * The mode of the request (e.g., cors, no-cors, same-origin, etc).
  */
  mode?: RequestMode;
  /**
  * The number of milliseconds the request can take before automatically being terminated.
  * If undefined or value is 0 then there is no timeout.
  */
  timeout?: number;
  /**
  * Any custom data.
  */
  customData?: D;
};
//#endregion
//#region src/roundToEven.d.ts
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
declare function roundToEven(value: number, precision: number): number;
//#endregion
//#region src/stringToUint16.d.ts
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
declare function stringToUint16(str: string): Uint16Array<ArrayBuffer>;
//#endregion
//#region src/TypedResult.d.ts
/**
* Utility type to create a typed result.
*
*
* @beta
*/
type TypedResult<T, D> = {
  type: T;
  data: D;
};
//#endregion
//#region src/unescapeHtml.d.ts
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
declare function unescapeHtml(text: string): string;
//#endregion
//#region src/urlToRelativePath.d.ts
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
declare function urlToRelativePath(url: string, base: string): string;
//#endregion
//#region src/uuid.d.ts
/**
* Generate a random v4 UUID
*
* @returns A random v4 UUID
*
*
* @beta
*/
declare function uuid(): string;
//#endregion
//#region src/uuidToArrayBuffer.d.ts
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
declare function uuidToArrayBuffer(uuid: string): ArrayBuffer;
//#endregion
//#region src/ValueOrArray.d.ts
/**
* A type that represents either a single value or an array of values.
*
*
* @beta
*/
type ValueOrArray<T> = T | T[];
//#endregion
export { DecodeTextOptions, Encoding, Request, RequestType, ResourceTiming, TypedResult, UTF_16, UTF_16_BE, UTF_16_LE, UTF_8, ValueOf, ValueOrArray, arrayBufferToHex, arrayBufferToUuid, base64decode, base64encode, convertUint8ToUint16, decodeBase64, decodeText, encodeBase64, getBandwidthBps, hexToArrayBuffer, roundToEven, stringToUint16, unescapeHtml, urlToRelativePath, uuid, uuidToArrayBuffer };
//# sourceMappingURL=index.d.ts.map