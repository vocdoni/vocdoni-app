//#region src/canParseId3.d.ts
/**
* Checks if the given data contains an ID3 tag.
*
* @param data - The data to check
* @param offset - The offset at which to start checking
*
* @returns `true` if an ID3 tag is found
*
*
* @beta
*/
declare function canParseId3(data: Uint8Array, offset: number): boolean;
//#endregion
//#region src/DecodedId3Frame.d.ts
/**
* Decoded ID3 frame.
*
*
* @beta
*/
type DecodedId3Frame<T> = {
  /**
  * The four letter frame ID.
  */
  key: string;
  /**
  * The data payload.
  */
  data: T;
  /**
  * A text description of the frame if provided.
  */
  info?: any;
};
//#endregion
//#region src/getId3Data.d.ts
/**
* Returns any adjacent ID3 tags found in data starting at offset, as one block of data
*
* @param data - The data to search in
* @param offset - The offset at which to start searching
*
* @returns The block of data containing any ID3 tags found
* or `undefined` if no header is found at the starting offset
*
* @internal
*
*/
declare function getId3Data(data: Uint8Array, offset: number): Uint8Array | undefined;
//#endregion
//#region src/Id3Frame.d.ts
/**
* ID3 frame.
*
*
* @beta
*/
type Id3Frame = DecodedId3Frame<ArrayBuffer | string | number>;
//#endregion
//#region src/getId3Frames.d.ts
/**
* Returns an array of ID3 frames found in all the ID3 tags in the id3Data
*
* @param id3Data - The ID3 data containing one or more ID3 tags
*
* @returns Array of ID3 frame objects
*
*
* @beta
*/
declare function getId3Frames(id3Data: Uint8Array<ArrayBuffer>): Id3Frame[];
//#endregion
//#region src/getId3Timestamp.d.ts
/**
* Searches for the Elementary Stream timestamp found in the ID3 data chunk
*
* @param data - Block of data containing one or more ID3 tags
*
* @returns The timestamp
*
*
* @beta
*/
declare function getId3Timestamp(data: Uint8Array<ArrayBuffer>): number | undefined;
//#endregion
//#region src/ID3_SCHEME_ID_URI.d.ts
/**
* The scheme ID URI for ID3 tags.
*
*
* @beta
*
* @see {@link https://aomediacodec.github.io/id3-emsg/ | Carriage of ID3 Timed Metadata in the Common Media Application Format (CMAF)}
* @see {@link https://developer.apple.com/documentation/http-live-streaming/about-the-common-media-application-format-with-http-live-streaming-hls#CMAF-Tracks-Segments-Headers-and-Fragments | CMAF Tracks, Segments, Headers, and Fragments}
*/
declare const ID3_SCHEME_ID_URI = "https://aomedia.org/emsg/ID3";
//#endregion
//#region src/isId3TimestampFrame.d.ts
/**
* Returns true if the ID3 frame is an Elementary Stream timestamp frame
*
* @param frame - the ID3 frame
*
* @returns `true` if the ID3 frame is an Elementary Stream timestamp frame
*
* @internal
*
*/
declare function isId3TimestampFrame(frame: Id3Frame): boolean;
//#endregion
//#region src/util/RawFrame.d.ts
/**
* Raw ID3 frame.
*
* @internal
*
*/
type RawId3Frame = {
  type: string;
  size: number;
  data: Uint8Array<ArrayBuffer>;
};
//#endregion
//#region src/util/decodeId3Frame.d.ts
/**
* Decode an ID3 frame.
*
* @param frame - the ID3 frame
*
* @returns The decoded ID3 frame
*
* @internal
*
*/
declare function decodeId3Frame(frame: RawId3Frame): Id3Frame | undefined;
//#endregion
//#region src/util/decodeId3TextFrame.d.ts
/**
* Decodes an ID3 text frame
*
* @param frame - the ID3 text frame
*
* @returns The decoded ID3 text frame
*
* @internal
*
*/
declare function decodeId3TextFrame(frame: RawId3Frame): DecodedId3Frame<string> | undefined;
//#endregion
//#region src/util/isId3Footer.d.ts
/**
* Returns true if an ID3 footer can be found at offset in data
*
* @param data - The data to search in
* @param offset - The offset at which to start searching
*
* @returns `true` if an ID3 footer is found
*
* @internal
*
*/
declare function isId3Footer(data: Uint8Array, offset: number): boolean;
//#endregion
//#region src/util/isId3Header.d.ts
/**
* Returns true if an ID3 header can be found at offset in data
*
* @param data - The data to search in
* @param offset - The offset at which to start searching
*
* @returns `true` if an ID3 header is found
*
* @internal
*
*/
declare function isId3Header(data: Uint8Array, offset: number): boolean;
//#endregion
//#region src/util/readId3Size.d.ts
/**
* Read ID3 size
*
* @param data - The data to read from
* @param offset - The offset at which to start reading
*
* @returns The size
*
* @internal
*
*/
declare function readId3Size(data: Uint8Array, offset: number): number;
//#endregion
//#region src/util/toArrayBuffer.d.ts
/**
* @internal
*/
type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | Uint8ClampedArray;
/**
* @internal
*/
declare function toArrayBuffer(view: ArrayBuffer | TypedArray): ArrayBuffer;
//#endregion
//#region src/util/utf8.d.ts
/**
* @internal
*/
declare function toUint8(data: BufferSource, offset?: number, length?: number): Uint8Array<ArrayBuffer>;
//#endregion
//#region src/util/utf8ArrayToStr.d.ts
/**
* Converts a UTF-8 array to a string.
*
* @param array - The UTF-8 array to convert
* @param exitOnNull - Whether to exit on the first null byte
*
* @returns The string
*
* @internal
*/
declare function utf8ArrayToStr(array: Uint8Array<ArrayBuffer>, exitOnNull?: boolean): string;
//#endregion
export { DecodedId3Frame, ID3_SCHEME_ID_URI, Id3Frame, TypedArray, canParseId3, decodeId3Frame, decodeId3TextFrame, getId3Data, getId3Frames, getId3Timestamp, isId3Footer, isId3Header, isId3TimestampFrame, readId3Size, toArrayBuffer, toUint8, utf8ArrayToStr };
//# sourceMappingURL=index.d.ts.map