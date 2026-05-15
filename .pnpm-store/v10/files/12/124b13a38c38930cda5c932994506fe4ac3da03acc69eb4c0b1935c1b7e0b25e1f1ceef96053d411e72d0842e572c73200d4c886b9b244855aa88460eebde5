import { CmObjectType, CmStreamType, CmStreamingFormat } from "@svta/cml-cta";
import { SfItem, SfToken } from "@svta/cml-structured-field-values";
import { ValueOf } from "@svta/cml-utils";

//#region src/CMSD_DYNAMIC.d.ts

/**
* CMSD dynamic header name.
*
*
* @beta
*/
declare const CMSD_DYNAMIC = "CMSD-Dynamic";
//#endregion
//#region src/CMSD_STATIC.d.ts
/**
* CMSD static header name.
*
*
* @beta
*/
declare const CMSD_STATIC = "CMSD-Static";
//#endregion
//#region src/CMSD_V1.d.ts
/**
* CMSD Version 1
*
*
* @beta
*/
declare const CMSD_V1 = 1;
//#endregion
//#region src/CmsdCustomKey.d.ts
/**
* A custom key for CMSD. Custom keys MUST carry a hyphenated prefix
* to ensure that there will not be a namespace collision with future
* revisions to this specification. Clients SHOULD use a reverse-DNS
* syntax when defining their own prefix.
*
*
* @beta
*/
type CmsdCustomKey = `${string}-${string}`;
//#endregion
//#region src/CmsdObjectType.d.ts
/**
* Common Media Server Data Object Type
*
*
* @enum
*
* @beta
*/
declare const CmsdObjectType: typeof CmObjectType;
/**
* @beta
*/
type CmsdObjectType = CmObjectType;
//#endregion
//#region src/CmsdStreamType.d.ts
/**
* Common Media Server Data Stream Type
*
*
* @enum
*
* @beta
*/
declare const CmsdStreamType: typeof CmStreamType;
/**
* @beta
*/
type CmsdStreamType = CmStreamType;
//#endregion
//#region src/CmsdStreamingFormat.d.ts
/**
* Common Media Server Data Streaming Format
*
*
* @enum
*
* @beta
*/
declare const CmsdStreamingFormat: typeof CmStreamingFormat;
/**
* @beta
*/
type CmsdStreamingFormat = CmStreamingFormat;
//#endregion
//#region src/CmsdValue.d.ts
/**
* CMSD Value
*
*
* @beta
*/
type CmsdValue = CmsdObjectType | CmsdStreamingFormat | CmsdStreamType | string | number | boolean | symbol | SfToken;
//#endregion
//#region src/CmsdDynamicParams.d.ts
/**
* Common Media Server Data (CMSD) dynamic response header field parameters.
*
* @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
*
*
* @beta
*/
type CmsdDynamicParams = {
  /**
  * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
  * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
  */
  [index: CmsdCustomKey]: CmsdValue;
  /**
  * Duress
  *
  * Key is included without a value if the server is under duress, due to cpu, memory, disk IO, network IO or other reasons. The
  * thresholds for signaling duress are left to the discretion of the server operator. The intent is that the client will use this
  * signal to move away to an alternate server if possible. This key MUST NOT be sent if it is false.
  *
  * Boolean
  */
  du?: boolean;
  /**
  * Estimated Throughput
  *
  * The throughput between the server and the client over the currently negotiated transport as estimated by the server at the start
  * of the response. The value is expressed in units of kilobits per second and rounded to the nearest integer. The time window for
  * this estimate is expected to be the duration of the current response at most. The throughput may vary during the response and the
  * client SHOULD use this data as an adjunct to its own throughput estimates. As an informative example, this estimate could be
  * derived in this way:
  *
  *   etp = 8 * send_window / (rtt)
  *
  * where send_window = min (cwnd * mss, rwnd) with Congestion Window (cwnd) measured in packets, Maximum Segment Size (mss) in bytes,
  * Receiver Window (rwnd) in bytes and rtt in milliseconds. Note that multiple client processes adjacent to the media player may pool
  * their requests into the same connection to the server. In this case the server estimate of throughput will be against the entirety
  * of the connection, not all of which will be accessible to the media player.
  *
  * Integer Kbps
  */
  etp?: number;
  /**
  * Max suggested bitrate
  *
  * The maximum bitrate value that the player SHOULD play in its Adaptive Bit Rate (ABR) ladder. If the player is playing a bitrate higher
  * than this value, it SHOULD immediately switch to a bitrate lower than or equal to this value.
  *
  * Integer Kbps
  */
  mb?: number;
  /**
  * Response delay
  *
  * The time elapsed between the receipt of the request and when the first byte of the body becomes available to send to the client. The
  * intention is for receivers to use this value to more accurately calculate the throughput of the connection [MHV22].
  *
  * Integer milliseconds
  */
  rd?: number;
  /**
  * Round Trip Time
  *
  * Estimated round trip time between client and server. This estimate may be derived from the transport handshake. For subsequent requests
  * over the same connection, the value can be refined to be an exponentially weighted moving average of prior instantaneous values. An
  * informative example algorithm for this averaging is provided by [18].
  *
  * Integer Kbps
  */
  rtt?: number;
};
//#endregion
//#region src/CmsdDynamic.d.ts
/**
* Common Media Server Data (CMSD) dynamic response header fields.
*
* @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
*
*
* @beta
*/
type CmsdDynamic = {
  /**
  * The server name.
  */
  value: string;
  /**
  * The CMSD dynamic parameters.
  */
  params: CmsdDynamicParams;
};
//#endregion
//#region src/CmsdEncodeOptions.d.ts
/**
* Options for encoding CMCD values.
*
*
* @beta
*/
type CmsdEncodeOptions = {
  /**
  * Use Symbol to represent token values
  *
  * @defaultValue `true`
  */
  useSymbol?: boolean;
};
//#endregion
//#region src/CmsdHeaderField.d.ts
/**
* CMSD header fields.
*
*
* @enum
*
* @beta
*/
declare const CmsdHeaderField: {
  /**
  * Keys whose values persist over multiple requests for the object.
  */
  readonly STATIC: typeof CMSD_STATIC;
  /**
  * Keys whose values apply only to the next transmission hop. Typically a
  * new CMSD-Dynamic header instance will be added by each intermediary
  * participating in the delivery.
  */
  readonly DYNAMIC: typeof CMSD_DYNAMIC;
};
/**
* @beta
*/
type CmsdHeaderField = ValueOf<typeof CmsdHeaderField>;
//#endregion
//#region src/CmsdStatic.d.ts
/**
* Common Media Server Data (CMSD) static response header fields.
*
* @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5006-final.pdf|CMSD Spec}
*
*
* @beta
*/
type CmsdStatic = {
  /**
  * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
  * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
  */
  [index: CmsdCustomKey]: CmsdValue;
  /**
  * Availability time
  *
  * The wallclock time at which the first byte of this object became available at the origin for successful request. The time is
  * expressed as integer milliseconds since the Unix Epoch, i.e., the number of milliseconds that have elapsed since January 1,
  * 1970 (midnight UTC/GMT), not counting leap seconds (in ISO 8601: 1970- 01-01T00:00:000Z).
  *
  * Integer Milliseconds
  */
  at?: number;
  /**
  * Encoded bitrate
  *
  * The encoded bitrate of the audio or video object being requested. If the instantaneous bitrate varies over the duration of the
  * object, the average value over the duration of the object SHOULD be communicated. This key should only accompany objects that
  * have an implicit bitrate.
  *
  * Integer kbps
  */
  br?: number;
  /**
  * Object duration
  *
  * The playback duration in milliseconds of the object being requested. If a partial segment is being requested, then this value
  * MUST indicate the playback duration of that part and not that of its parent segment. This value can be an approximation of the
  * estimated duration if the explicit value is not known.
  *
  * Integer milliseconds
  */
  d?: number;
  /**
  * Held time
  *
  * The number of milliseconds that this response was held back by an origin before returning. This is applicable to blocking responses
  * under LL-HLS [HLSbis].
  *
  * Integer Milliseconds
  */
  ht?: number;
  /**
  * Intermediary identifier
  *
  * An identifier for the processing server. The value SHOULD identify both the organization and the intermediary that is writing the key.
  * Identifiers SHOULD be as concise as possible to reduce log file and transferred size, while still remaining unique.
  *
  * String
  */
  n?: string;
  /**
  * Next object request
  *
  * Relative path of the next object to be requested. This can be used to trigger pre-fetching by the CDN. This MUST be a path relative to the current
  * request. This string MUST be URLEncoded. The client SHOULD NOT depend upon any pre-fetch action being taken - it is merely a request for such a
  * pre-fetch to take place.
  *
  * String
  */
  nor?: string;
  /**
  * Next range request
  *
  * If the next request will be a partial object request, then this string denotes the byte range to be requested. If the ‘nor’ field is not set, then the
  * object is assumed to match the object currently being requested. The client SHOULD NOT depend upon any pre-fetch action being taken – it is merely a
  * request for such a pre-fetch to take place. Formatting is similar to the HTTP Range header, except that the unit MUST be ‘byte’, the ‘Range:’ prefix is
  * NOT required and specifying multiple ranges is NOT allowed. Valid combinations are:
  *
  * - `"\<range-start\>-"`
  * - `"\<range-start\>-\<range-end\>"`
  * - `"-\<suffix-length\>"`
  *
  * String
  */
  nrr?: string;
  /**
  * Object type
  *
  * The media type of the current object being requested:
  * - `m` = text file, such as a manifest or playlist
  * - `a` = audio only
  * - `v` = video only
  * - `av` = muxed audio and video
  * - `i` = init segment
  * - `c` = caption or subtitle
  * - `tt` = ISOBMFF timed text track
  * - `k` = cryptographic key, license or certificate.
  * - `o` = other
  *
  * If the object type being requested is unknown, then this key MUST NOT be used.
  *
  * Token
  */
  ot?: CmsdObjectType;
  /**
  * Streaming format
  *
  * The streaming format that defines the current request.
  *
  * - `d` = MPEG DASH
  * - `h` = HTTP Live Streaming (HLS)
  * - `s` = Smooth Streaming
  * - `o` = other
  *
  * If the streaming format being requested is unknown, then this key MUST NOT be used.
  *
  * Token
  */
  sf?: CmsdStreamingFormat;
  /**
  * Stream type
  * - `v` = all segments are available – e.g., VOD
  * - `l` = segments become available over time – e.g., LIVE
  *
  * Token
  */
  st?: CmsdStreamType;
  /**
  * Startup
  *
  * Key is included without a value if the object is needed urgently due to startup, seeking or recovery after a buffer-empty event. The media SHOULD not be
  * rendering when this request is made. This key MUST not be sent if it is FALSE.
  *
  * Boolean
  */
  su?: boolean;
  /**
  * CMSD version
  *
  * The version of this specification used for interpreting the defined key names and values. If this key is omitted, the client and server MUST
  * interpret the values as being defined by version 1. Client SHOULD omit this field if the version is 1.
  *
  * Integer
  */
  v?: number;
};
//#endregion
//#region src/decodeCmsdDynamic.d.ts
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
declare function decodeCmsdDynamic(cmsd: string): CmsdDynamic[];
//#endregion
//#region src/decodeCmsdStatic.d.ts
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
declare function decodeCmsdStatic(cmsd: string): CmsdStatic;
//#endregion
//#region src/encodeCmsdDynamic.d.ts
/**
* Encode a list of CMSD Dynamic objects.
*
* @param value - The list of `SfItems` to encode.
*
* @returns The encoded CMSD string.
*
*
* @beta
*/
declare function encodeCmsdDynamic(value: SfItem[]): string;
/**
* Encode a single CMSD Dynamic object.
*
* @param value - The server name
* @param cmsd - The CMSD object to encode.
*
* @returns The encoded CMSD string.
*
*
* @beta
*/
declare function encodeCmsdDynamic(value: string, cmsd: CmsdDynamic): string;
//#endregion
//#region src/encodeCmsdStatic.d.ts
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
declare function encodeCmsdStatic(cmsd: CmsdStatic, options?: CmsdEncodeOptions): string;
//#endregion
export { CMSD_DYNAMIC, CMSD_STATIC, CMSD_V1, CmsdCustomKey, CmsdDynamic, CmsdDynamicParams, CmsdEncodeOptions, CmsdHeaderField, CmsdObjectType, CmsdStatic, CmsdStreamType, CmsdStreamingFormat, CmsdValue, decodeCmsdDynamic, decodeCmsdStatic, encodeCmsdDynamic, encodeCmsdStatic };
//# sourceMappingURL=index.d.ts.map