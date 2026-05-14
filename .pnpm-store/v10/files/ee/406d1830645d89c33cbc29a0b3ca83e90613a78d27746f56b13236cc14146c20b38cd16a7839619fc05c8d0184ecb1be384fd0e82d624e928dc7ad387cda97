import { UTF_8, decodeText } from "@svta/cml-utils";

//#region src/util/isId3Header.ts
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
function isId3Header(data, offset) {
	if (offset + 10 <= data.length) {
		if (data[offset] === 73 && data[offset + 1] === 68 && data[offset + 2] === 51) {
			if (data[offset + 3] < 255 && data[offset + 4] < 255) {
				if (data[offset + 6] < 128 && data[offset + 7] < 128 && data[offset + 8] < 128 && data[offset + 9] < 128) return true;
			}
		}
	}
	return false;
}

//#endregion
//#region src/util/readId3Size.ts
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
function readId3Size(data, offset) {
	let size = 0;
	size = (data[offset] & 127) << 21;
	size |= (data[offset + 1] & 127) << 14;
	size |= (data[offset + 2] & 127) << 7;
	size |= data[offset + 3] & 127;
	return size;
}

//#endregion
//#region src/canParseId3.ts
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
function canParseId3(data, offset) {
	return isId3Header(data, offset) && readId3Size(data, offset + 6) + 10 <= data.length - offset;
}

//#endregion
//#region src/util/isId3Footer.ts
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
function isId3Footer(data, offset) {
	if (offset + 10 <= data.length) {
		if (data[offset] === 51 && data[offset + 1] === 68 && data[offset + 2] === 73) {
			if (data[offset + 3] < 255 && data[offset + 4] < 255) {
				if (data[offset + 6] < 128 && data[offset + 7] < 128 && data[offset + 8] < 128 && data[offset + 9] < 128) return true;
			}
		}
	}
	return false;
}

//#endregion
//#region src/getId3Data.ts
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
function getId3Data(data, offset) {
	const front = offset;
	let length = 0;
	while (isId3Header(data, offset)) {
		length += 10;
		const size = readId3Size(data, offset + 6);
		length += size;
		if (isId3Footer(data, offset + 10)) length += 10;
		offset += length;
	}
	if (length > 0) return data.subarray(front, front + length);
}

//#endregion
//#region src/util/toArrayBuffer.ts
/**
* @internal
*/
function toArrayBuffer(view$1) {
	if (view$1 instanceof ArrayBuffer) return view$1;
	else {
		if (view$1.byteOffset == 0 && view$1.byteLength == view$1.buffer.byteLength) return view$1.buffer;
		return new Uint8Array(view$1).buffer;
	}
}

//#endregion
//#region src/util/utf8.ts
/**
* @internal
*/
function toUint8(data, offset = 0, length = Infinity) {
	return view(data, offset, length, Uint8Array);
}
function view(data, offset, length, Type) {
	const buffer = unsafeGetArrayBuffer(data);
	let bytesPerElement = 1;
	if ("BYTES_PER_ELEMENT" in Type) bytesPerElement = Type.BYTES_PER_ELEMENT;
	const dataOffset = isArrayBufferView(data) ? data.byteOffset : 0;
	const dataEnd = (dataOffset + data.byteLength) / bytesPerElement;
	const rawStart = (dataOffset + offset) / bytesPerElement;
	const start = Math.floor(Math.max(0, Math.min(rawStart, dataEnd)));
	return new Type(buffer, start, Math.floor(Math.min(start + Math.max(length, 0), dataEnd)) - start);
}
function unsafeGetArrayBuffer(view$1) {
	if (view$1 instanceof ArrayBuffer) return view$1;
	else return view$1.buffer;
}
function isArrayBufferView(obj) {
	return obj && obj.buffer instanceof ArrayBuffer && obj.byteLength !== void 0 && obj.byteOffset !== void 0;
}

//#endregion
//#region src/util/utf8ArrayToStr.ts
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
function utf8ArrayToStr(array, exitOnNull = false) {
	const byteLength = exitOnNull ? array.indexOf(0) : array.length;
	const result = decodeText(new DataView(array.buffer, array.byteOffset, byteLength), { encoding: UTF_8 });
	return exitOnNull ? result : result.replace(/\0/g, "");
}

//#endregion
//#region src/util/decodeId3ImageFrame.ts
function decodeId3ImageFrame(frame) {
	const metadataFrame = {
		key: frame.type,
		description: "",
		data: "",
		mimeType: null,
		pictureType: null
	};
	const utf8Encoding = 3;
	if (frame.size < 2) return;
	if (frame.data[0] !== utf8Encoding) {
		console.log("Ignore frame with unrecognized character encoding");
		return;
	}
	const mimeTypeEndIndex = frame.data.subarray(1).indexOf(0);
	if (mimeTypeEndIndex === -1) return;
	const mimeType = utf8ArrayToStr(toUint8(frame.data, 1, mimeTypeEndIndex));
	const pictureType = frame.data[2 + mimeTypeEndIndex];
	const descriptionEndIndex = frame.data.subarray(3 + mimeTypeEndIndex).indexOf(0);
	if (descriptionEndIndex === -1) return;
	const description = utf8ArrayToStr(toUint8(frame.data, 3 + mimeTypeEndIndex, descriptionEndIndex));
	let data;
	if (mimeType === "-->") data = utf8ArrayToStr(toUint8(frame.data, 4 + mimeTypeEndIndex + descriptionEndIndex));
	else data = toArrayBuffer(frame.data.subarray(4 + mimeTypeEndIndex + descriptionEndIndex));
	metadataFrame.mimeType = mimeType;
	metadataFrame.pictureType = pictureType;
	metadataFrame.description = description;
	metadataFrame.data = data;
	return metadataFrame;
}

//#endregion
//#region src/util/decodeId3PrivFrame.ts
/**
* Decode an ID3 PRIV frame.
*
* @param frame - the ID3 PRIV frame
*
* @returns The decoded ID3 PRIV frame
*
* @internal
*
*/
function decodeId3PrivFrame(frame) {
	if (frame.size < 2) return;
	const owner = utf8ArrayToStr(frame.data, true);
	const privateData = new Uint8Array(frame.data.subarray(owner.length + 1));
	return {
		key: frame.type,
		info: owner,
		data: privateData.buffer
	};
}

//#endregion
//#region src/util/decodeId3TextFrame.ts
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
function decodeId3TextFrame(frame) {
	if (frame.size < 2) return;
	if (frame.type === "TXXX") {
		let index = 1;
		const { data } = frame;
		const description = utf8ArrayToStr(data.subarray(index), true);
		index += description.length + 1;
		const value = utf8ArrayToStr(data.subarray(index));
		return {
			key: frame.type,
			info: description,
			data: value
		};
	}
	const text = utf8ArrayToStr(frame.data.subarray(1));
	return {
		key: frame.type,
		info: "",
		data: text
	};
}

//#endregion
//#region src/util/decodeId3UrlFrame.ts
/**
* Decode a URL frame
*
* @param frame - the ID3 URL frame
*
* @returns The decoded ID3 URL frame
*
* @internal
*
*/
function decodeId3UrlFrame(frame) {
	if (frame.type === "WXXX") {
		if (frame.size < 2) return;
		let index = 1;
		const description = utf8ArrayToStr(frame.data.subarray(index), true);
		index += description.length + 1;
		const value = utf8ArrayToStr(frame.data.subarray(index));
		return {
			key: frame.type,
			info: description,
			data: value
		};
	}
	const url = utf8ArrayToStr(frame.data);
	return {
		key: frame.type,
		info: "",
		data: url
	};
}

//#endregion
//#region src/util/decodeId3Frame.ts
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
function decodeId3Frame(frame) {
	if (frame.type === "PRIV") return decodeId3PrivFrame(frame);
	else if (frame.type[0] === "W") return decodeId3UrlFrame(frame);
	else if (frame.type === "APIC") return decodeId3ImageFrame(frame);
	return decodeId3TextFrame(frame);
}

//#endregion
//#region src/util/getId3FrameData.ts
/**
* Returns the data of an ID3 frame.
*
* @param data - The data to read from
*
* @returns The data of the ID3 frame
*
* @internal
*
*/
function getId3FrameData(data) {
	const type = String.fromCharCode(data[0], data[1], data[2], data[3]);
	const size = readId3Size(data, 4);
	const offset = 10;
	return {
		type,
		size,
		data: data.subarray(offset, offset + size)
	};
}

//#endregion
//#region src/getId3Frames.ts
const HEADER_FOOTER_SIZE = 10;
const FRAME_SIZE = 10;
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
function getId3Frames(id3Data) {
	let offset = 0;
	const frames = [];
	while (isId3Header(id3Data, offset)) {
		const size = readId3Size(id3Data, offset + 6);
		if (id3Data[offset + 5] >> 6 & 1) offset += HEADER_FOOTER_SIZE;
		offset += HEADER_FOOTER_SIZE;
		const end = offset + size;
		while (offset + FRAME_SIZE < end) {
			const frameData = getId3FrameData(id3Data.subarray(offset));
			const frame = decodeId3Frame(frameData);
			if (frame) frames.push(frame);
			offset += frameData.size + HEADER_FOOTER_SIZE;
		}
		if (isId3Footer(id3Data, offset)) offset += HEADER_FOOTER_SIZE;
	}
	return frames;
}

//#endregion
//#region src/isId3TimestampFrame.ts
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
function isId3TimestampFrame(frame) {
	return frame && frame.key === "PRIV" && frame.info === "com.apple.streaming.transportStreamTimestamp";
}

//#endregion
//#region src/util/readId3Timestamp.ts
/**
* Read a 33 bit timestamp from an ID3 frame.
*
* @param timeStampFrame - the ID3 frame
*
* @returns The timestamp
*
* @internal
*
*/
function readId3Timestamp(timeStampFrame) {
	if (timeStampFrame.data.byteLength === 8) {
		const data = new Uint8Array(timeStampFrame.data);
		const pts33Bit = data[3] & 1;
		let timestamp = (data[4] << 23) + (data[5] << 15) + (data[6] << 7) + data[7];
		timestamp /= 45;
		if (pts33Bit) timestamp += 47721858.84;
		return Math.round(timestamp);
	}
}

//#endregion
//#region src/getId3Timestamp.ts
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
function getId3Timestamp(data) {
	const frames = getId3Frames(data);
	for (const frame of frames) if (isId3TimestampFrame(frame)) return readId3Timestamp(frame);
}

//#endregion
//#region src/ID3_SCHEME_ID_URI.ts
/**
* The scheme ID URI for ID3 tags.
*
*
* @beta
*
* @see {@link https://aomediacodec.github.io/id3-emsg/ | Carriage of ID3 Timed Metadata in the Common Media Application Format (CMAF)}
* @see {@link https://developer.apple.com/documentation/http-live-streaming/about-the-common-media-application-format-with-http-live-streaming-hls#CMAF-Tracks-Segments-Headers-and-Fragments | CMAF Tracks, Segments, Headers, and Fragments}
*/
const ID3_SCHEME_ID_URI = "https://aomedia.org/emsg/ID3";

//#endregion
export { ID3_SCHEME_ID_URI, canParseId3, decodeId3Frame, decodeId3TextFrame, getId3Data, getId3Frames, getId3Timestamp, isId3Footer, isId3Header, isId3TimestampFrame, readId3Size, toArrayBuffer, toUint8, utf8ArrayToStr };
//# sourceMappingURL=index.js.map