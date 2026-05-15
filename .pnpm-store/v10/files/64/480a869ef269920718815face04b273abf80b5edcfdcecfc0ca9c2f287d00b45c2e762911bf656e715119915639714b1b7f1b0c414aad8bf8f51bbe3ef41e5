//#region src/SfDecodeOptions.d.ts
/**
* Options for decoding Structured Field values
*
*
* @beta
*/
type SfDecodeOptions = {
  /**
  * Use JS Symbol to represent token values
  */
  useSymbol?: boolean;
};
//#endregion
//#region src/SfToken.d.ts
/**
* A class to represent structured field tokens when `Symbol` is not available.
*
*
* @beta
*/
declare class SfToken {
  description: string;
  constructor(description: string);
}
//#endregion
//#region src/SfBareItem.d.ts
/**
* A type to represent structured field bare items.
*
*
* @beta
*/
type SfBareItem = string | Uint8Array | boolean | number | symbol | Date | SfToken;
//#endregion
//#region src/SfParameters.d.ts
/**
* Structured Field Parameters
*
*
* @beta
*/
type SfParameters = Record<string, any>;
//#endregion
//#region src/SfItem.d.ts
/**
* Structured Field Item
*
*
* @beta
*/
declare class SfItem {
  value: SfBareItem;
  params?: SfParameters;
  constructor(value: any, params?: SfParameters);
}
//#endregion
//#region src/SfInnerList.d.ts
/**
* Structured Field Inner List
*
*
* @beta
*/
type SfInnerList = {
  value: SfItem[] | SfBareItem[];
  params: SfParameters;
};
//#endregion
//#region src/SfMember.d.ts
/**
* A member of a structured field.
*
*
* @beta
*/
type SfMember = SfItem | SfInnerList | SfBareItem;
//#endregion
//#region src/SfDictionary.d.ts
/**
* A dictionary of structured field members.
*
*
* @beta
*/
type SfDictionary = Record<string, SfMember> | Map<string, SfMember>;
//#endregion
//#region src/decodeSfDict.d.ts
/**
* Decode a structured field string into a structured field dictionary
*
* @param input - The structured field string to decode
* @returns The structured field dictionary
*
*
* @beta
*/
declare function decodeSfDict(input: string, options?: SfDecodeOptions): SfDictionary;
//#endregion
//#region src/decodeSfItem.d.ts
/**
* Decode a structured field string into a structured field item
*
* @param input - The structured field string to decode
* @returns The structured field item
*
*
* @beta
*/
declare function decodeSfItem(input: string, options?: SfDecodeOptions): SfItem;
//#endregion
//#region src/decodeSfList.d.ts
/**
* Decode a structured field string into a structured field list
*
* @param input - The structured field string to decode
* @returns The structured field list
*
*
* @beta
*/
declare function decodeSfList(input: string, options?: SfDecodeOptions): SfMember[];
//#endregion
//#region src/SfEncodeOptions.d.ts
/**
* Options for encoding a structured field.
*
*
* @beta
*/
type SfEncodeOptions = {
  /**
  * Include whitespace in the output.
  */
  whitespace?: boolean;
};
//#endregion
//#region src/encodeSfDict.d.ts
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
declare function encodeSfDict(value: Record<string, any> | Map<string, any>, options?: SfEncodeOptions): string;
//#endregion
//#region src/encodeSfItem.d.ts
/**
* Encode a structured field item to a string
*
* @param value - The structured field item to encode
*
* @returns The structured field string
*
*
* @beta
*/
declare function encodeSfItem(value: SfItem): string;
/**
* Encode a structured field value to a string with optional parameters.
*
* @param value - The structured field value to encode
* @param params - The structured field parameters
*
* @returns The structured field string
*
* @beta
*/
declare function encodeSfItem(value: SfBareItem, params?: SfParameters): string;
//#endregion
//#region src/encodeSfList.d.ts
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
declare function encodeSfList(value: SfMember[], options?: SfEncodeOptions): string;
//#endregion
//#region src/utils/symbolToStr.d.ts
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
declare function symbolToStr(symbol: symbol | SfToken): string;
//#endregion
//#region src/parse/ParsedValue.d.ts
/**
* @internal
*/
type ParsedValue<T> = {
  value: T;
  src: string;
};
//#endregion
//#region src/parse/parseBareItem.d.ts
/**
* @internal
*/
declare function parseBareItem(src: string, options?: SfDecodeOptions): ParsedValue<SfBareItem>;
//#endregion
//#region src/parse/parseBoolean.d.ts
/**
* @internal
*/
declare function parseBoolean(src: string): ParsedValue<boolean>;
//#endregion
//#region src/parse/parseByteSequence.d.ts
/**
* @internal
*/
declare function parseByteSequence(src: string): ParsedValue<Uint8Array>;
//#endregion
//#region src/parse/parseDate.d.ts
/**
* @internal
*/
declare function parseDate(src: string): ParsedValue<Date>;
//#endregion
//#region src/parse/parseDict.d.ts
/**
* @internal
*/
declare function parseDict(src: string, options?: SfDecodeOptions): ParsedValue<SfDictionary>;
//#endregion
//#region src/parse/parseError.d.ts
/**
* @internal
*/
declare function parseError(src: any, type: string, cause?: any): Error;
//#endregion
//#region src/parse/parseInnerList.d.ts
/**
* @internal
*/
declare function parseInnerList(src: string, options?: SfDecodeOptions): ParsedValue<SfInnerList>;
//#endregion
//#region src/parse/parseIntegerOrDecimal.d.ts
/**
* @internal
*/
declare function parseIntegerOrDecimal(src: string): ParsedValue<number>;
//#endregion
//#region src/parse/parseItem.d.ts
/**
* @internal
*/
declare function parseItem(src: string, options?: SfDecodeOptions): ParsedValue<SfItem>;
//#endregion
//#region src/parse/parseItemOrInnerList.d.ts
/**
* @internal
*/
declare function parseItemOrInnerList(src: string, options?: SfDecodeOptions): ParsedValue<SfItem | SfInnerList>;
//#endregion
//#region src/parse/parseKey.d.ts
/**
* @internal
*/
declare function parseKey(src: string): ParsedValue<string>;
//#endregion
//#region src/parse/parseList.d.ts
/**
* @internal
*/
declare function parseList(src: string, options?: SfDecodeOptions): ParsedValue<SfMember[]>;
//#endregion
//#region src/parse/parseParameters.d.ts
/**
* @internal
*/
declare function parseParameters(src: string, options?: SfDecodeOptions): ParsedValue<SfParameters | undefined>;
//#endregion
//#region src/parse/parseString.d.ts
/**
* @internal
*/
declare function parseString(src: string): ParsedValue<string>;
//#endregion
//#region src/parse/parseToken.d.ts
/**
* @internal
*/
declare function parseToken(src: string, options?: SfDecodeOptions): ParsedValue<symbol | SfToken>;
//#endregion
//#region src/serialize/serializeBareItem.d.ts
/**
* @internal
*/
declare function serializeBareItem(value: any): string;
//#endregion
//#region src/serialize/serializeBoolean.d.ts
/**
* @internal
*/
declare function serializeBoolean(value: boolean): string;
//#endregion
//#region src/serialize/serializeByteSequence.d.ts
/**
* @internal
*/
declare function serializeByteSequence(value: Uint8Array): string;
//#endregion
//#region src/serialize/serializeDate.d.ts
/**
* @internal
*/
declare function serializeDate(value: Date): string;
//#endregion
//#region src/serialize/serializeDecimal.d.ts
/**
* @internal
*/
declare function serializeDecimal(value: number): string;
//#endregion
//#region src/serialize/serializeDict.d.ts
/**
* @internal
*/
declare function serializeDict(dict: Record<string, any> | Map<string, any>, options?: SfEncodeOptions): string;
//#endregion
//#region src/serialize/serializeError.d.ts
/**
* @internal
*/
declare function serializeError(src: any, type: string, cause?: any): Error;
//#endregion
//#region src/serialize/serializeInnerList.d.ts
/**
* @internal
*/
declare function serializeInnerList(value: SfInnerList): string;
//#endregion
//#region src/serialize/serializeInteger.d.ts
/**
* @internal
*/
declare function serializeInteger(value: number): string;
//#endregion
//#region src/serialize/serializeItem.d.ts
/**
* @internal
*/
declare function serializeItem(value: SfItem | SfBareItem): string;
//#endregion
//#region src/serialize/serializeKey.d.ts
/**
* @internal
*/
declare function serializeKey(value: string): string;
//#endregion
//#region src/serialize/serializeList.d.ts
/**
* @internal
*/
declare function serializeList(list: SfMember[], options?: SfEncodeOptions): string;
//#endregion
//#region src/serialize/serializeParams.d.ts
/**
* @internal
*/
declare function serializeParams(params?: Record<string, any>): string;
//#endregion
//#region src/serialize/serializeString.d.ts
/**
* @internal
*/
declare function serializeString(value: string): string;
//#endregion
//#region src/serialize/serializeToken.d.ts
/**
* @internal
*/
declare function serializeToken(token: symbol | SfToken): string;
//#endregion
export { ParsedValue, SfBareItem, SfDecodeOptions, SfDictionary, SfEncodeOptions, SfInnerList, SfItem, SfMember, SfParameters, SfToken, decodeSfDict, decodeSfItem, decodeSfList, encodeSfDict, encodeSfItem, encodeSfList, parseBareItem, parseBoolean, parseByteSequence, parseDate, parseDict, parseError, parseInnerList, parseIntegerOrDecimal, parseItem, parseItemOrInnerList, parseKey, parseList, parseParameters, parseString, parseToken, serializeBareItem, serializeBoolean, serializeByteSequence, serializeDate, serializeDecimal, serializeDict, serializeError, serializeInnerList, serializeInteger, serializeItem, serializeKey, serializeList, serializeParams, serializeString, serializeToken, symbolToStr };
//# sourceMappingURL=index.d.ts.map