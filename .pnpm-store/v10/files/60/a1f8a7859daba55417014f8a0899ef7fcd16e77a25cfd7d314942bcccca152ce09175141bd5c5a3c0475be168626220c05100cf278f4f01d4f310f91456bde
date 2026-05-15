import { SfItem, SfToken } from "@svta/cml-structured-field-values";
import { CmObjectType, CmStreamType, CmStreamingFormat } from "@svta/cml-cta";
import { Request, ValueOf, ValueOrArray } from "@svta/cml-utils";

//#region src/CmcdCustomKey.d.ts

/**
* A custom key for CMCD. Custom keys MUST carry a hyphenated prefix
* to ensure that there will not be a namespace collision with future
* revisions to this specification. Clients SHOULD use a reverse-DNS
* syntax when defining their own prefix.
*
*
* @beta
*/
type CmcdCustomKey = `${string}-${string}`;
//#endregion
//#region src/CmcdObjectType.d.ts
/**
* Common Media Client Data Object Type
*
*
* @beta
*
* @enum
*/
declare const CmcdObjectType: typeof CmObjectType;
/**
* @beta
*/
type CmcdObjectType = CmObjectType;
//#endregion
//#region src/CmcdStreamType.d.ts
/**
* Common Media Client Data Stream Type
*
*
* @enum
*
* @beta
*/
declare const CmcdStreamType: typeof CmStreamType;
/**
* @beta
*/
type CmcdStreamType = CmStreamType;
//#endregion
//#region src/CmcdStreamingFormat.d.ts
/**
* Common Media Client Data Streaming Format
*
*
* @enum
*
* @beta
*/
declare const CmcdStreamingFormat: typeof CmStreamingFormat;
/**
* @beta
*/
type CmcdStreamingFormat = CmStreamingFormat;
//#endregion
//#region src/CmcdValue.d.ts
/**
* CMCD Value
*
*
* @beta
*/
type CmcdValue = CmcdObjectType | CmcdStreamingFormat | CmcdStreamType | string | string[] | number | number[] | boolean | symbol | SfToken | SfItem | SfItem[];
//#endregion
//#region src/Cmcd.d.ts
/**
* Common Media Client Data (CMCD) is a standardized set of HTTP request header fields and query string parameters.
*
* @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf|CMCD Spec}
*
*
* @beta
*/
type Cmcd = {
  /**
  * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
  * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
  */
  [index: CmcdCustomKey]: CmcdValue;
  /**
  * Encoded bitrate
  *
  * The encoded bitrate of the audio or video object being requested. This may not be known precisely by the player; however,
  * it MAY be estimated based upon playlist/manifest declarations. If the playlist declares both peak and average bitrate values,
  * the peak value should be transmitted.
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
  */
  ot?: CmcdObjectType;
  /**
  * Top bitrate
  *
  * The highest bitrate rendition in the manifest or playlist that the client is allowed to play, given current codec, licensing and
  * sizing constraints.
  *
  * Integer Kbps
  */
  tb?: number;
  /**
  * Buffer length
  *
  * The buffer length associated with the media object being requested. This value MUST be rounded to the nearest 100 ms. This key SHOULD only be
  * sent with an object type of ‘a’, ‘v’ or ‘av’.
  *
  * Integer milliseconds
  */
  bl?: number;
  /**
  * Deadline
  *
  * Deadline from the request time until the first sample of this Segment/Object needs to be available in order to not create a buffer underrun or
  * any other playback problems. This value MUST be rounded to the nearest 100ms. For a playback rate of 1, this may be equivalent to the player’s
  * remaining buffer length.
  *
  * Integer milliseconds
  */
  dl?: number;
  /**
  * Measured mtp CMCD throughput
  *
  * The throughput between client and server, as measured by the client and MUST be rounded to the nearest 100 kbps. This value, however derived,
  * SHOULD be the value that the client is using to make its next Adaptive Bitrate switching decision. If the client is connected to multiple
  * servers concurrently, it must take care to report only the throughput measured against the receiving server. If the client has multiple concurrent
  * connections to the server, then the intent is that this value communicates the aggregate throughput the client sees across all those connections.
  *
  * Integer kbps
  */
  mtp?: number;
  /**
  * Next object request
  *
  * Relative path of the next object to be requested. This can be used to trigger pre-fetching by the CDN. This MUST be a path relative to the current
  * request. This string MUST be URLEncoded. The client SHOULD NOT depend upon any pre-fetch action being taken - it is merely a request for such a
  * pre-fetch to take place.
  *
  * String
  */
  nor?: ValueOrArray<string | SfItem>;
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
  * Startup
  *
  * Key is included without a value if the object is needed urgently due to startup, seeking or recovery after a buffer-empty event. The media SHOULD not be
  * rendering when this request is made. This key MUST not be sent if it is FALSE.
  *
  * Boolean
  */
  su?: boolean;
  /**
  * Content ID
  *
  * A unique string identifying the current content. Maximum length is 64 characters. This value is consistent across multiple different
  * sessions and devices and is defined and updated at the discretion of the service provider.
  *
  * String
  */
  cid?: string;
  /**
  * Playback rate
  *
  * `1` if real-time, `2` if double speed, `0` if not playing. SHOULD only be sent if not equal to `1`.
  *
  * Decimal
  */
  pr?: number;
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
  */
  sf?: CmcdStreamingFormat;
  /**
  * Session ID
  *
  * A GUID identifying the current playback session. A playback session typically ties together segments belonging to a single media asset.
  * Maximum length is 64 characters. It is RECOMMENDED to conform to the UUID specification.
  *
  * String
  */
  sid?: string;
  /**
  * Stream type
  * - `v` = all segments are available – e.g., VOD
  * - `l` = segments become available over time – e.g., LIVE
  */
  st?: CmcdStreamType;
  /**
  * CMCD version
  *
  * The version of this specification used for interpreting the defined key names and values. If this key is omitted, the client and server MUST
  * interpret the values as being defined by version 1. Client SHOULD omit this field if the version is 1.
  *
  * Integer
  */
  v?: number;
  /**
  * Buffer starvation
  *
  * Key is included without a value if the buffer was starved at some point between the prior request and this object request,
  * resulting in the player being in a rebuffering state and the video or audio playback being stalled. This key MUST NOT be
  * sent if the buffer was not starved since the prior request.
  *
  * If the object type `ot` key is sent along with this key, then the `bs` key refers to the buffer associated with the particular
  * object type. If no object type is communicated, then the buffer state applies to the current session.
  *
  * Boolean
  */
  bs?: boolean;
  /**
  * Requested maximum throughput
  *
  * The requested maximum throughput that the client considers sufficient for delivery of the asset. Values MUST be rounded to the
  * nearest 100kbps. For example, a client would indicate that the current segment, encoded at 2Mbps, is to be delivered at no more
  * than 10Mbps, by using rtp=10000.
  *
  * Note: This can benefit clients by preventing buffer saturation through over-delivery and can also deliver a community benefit
  * through fair-share delivery. The concept is that each client receives the throughput necessary for great performance, but no more.
  * The CDN may not support the rtp feature.
  *
  * Integer kbps
  */
  rtp?: number;
};
//#endregion
//#region src/CMCD_EVENT_MODE.d.ts
/**
* CMCD event mode variable name.
*
*
* @beta
*/
declare const CMCD_EVENT_MODE = "event";
//#endregion
//#region src/CMCD_REQUEST_MODE.d.ts
/**
* CMCD request mode variable name.
*
*
* @beta
*/
declare const CMCD_REQUEST_MODE = "request";
//#endregion
//#region src/CmcdReportingMode.d.ts
/**
* CMCD reporting mode types.
*
*
* @enum
*
* @beta
*/
declare const CmcdReportingMode: {
  /**
  * Request mode
  */
  readonly REQUEST: typeof CMCD_REQUEST_MODE;
  /**
  * Event mode
  */
  readonly EVENT: typeof CMCD_EVENT_MODE;
};
/**
* @beta
*/
type CmcdReportingMode = ValueOf<typeof CmcdReportingMode>;
//#endregion
//#region src/CmcdFormatterOptions.d.ts
/**
* Options for formatting CMCD data values.
*
*
* @beta
*/
type CmcdFormatterOptions = {
  /**
  * The version of the CMCD specification to use.
  */
  version: number;
  /**
  * The reporting mode to use.
  */
  reportingMode: CmcdReportingMode;
  /**
  * The base URL to use for relative URLs.
  */
  baseUrl?: string;
};
//#endregion
//#region src/CmcdFormatter.d.ts
/**
* A formatter for CMCD values.
*
* @param value - The value to format.
*
* @returns The formatted value.
*
*
* @beta
*/
type CmcdFormatter = (value: CmcdValue, options: CmcdFormatterOptions) => number | ValueOrArray<string> | ValueOrArray<SfItem>;
//#endregion
//#region src/CmcdEventExcludedKeys.d.ts
/**
* Keys that are excluded from CMCD event mode.
*
*
* @beta
*/
type CmcdEventExcludedKeys = "bsd" | "d" | "dl" | "nor" | "ot" | "rtp" | "sid" | "su";
//#endregion
//#region src/CmcdEventType.d.ts
/**
* CMCD event types for the 'e' key (event mode).
*
*
* @enum
*
* @beta
*/
declare const CmcdEventType: {
  /**
  * A change in the player state.
  */
  readonly PLAY_STATE: "ps";
  /**
  * An error event.
  */
  readonly ERROR: "e";
  /**
  * A periodic report sent on a time interval.
  */
  readonly TIME_INTERVAL: "t";
  /**
  * A change of the content ID.
  */
  readonly CONTENT_ID: "c";
  /**
  * A change in the application's backgrounded state.
  */
  readonly BACKGROUNDED_MODE: "b";
  /**
  * The player was muted.
  */
  readonly MUTE: "m";
  /**
  * Player unmuted.
  */
  readonly UNMUTE: "um";
  /**
  * The player view was expanded.
  */
  readonly PLAYER_EXPAND: "pe";
  /**
  * The player view was collapsed.
  */
  readonly PLAYER_COLLAPSE: "pc";
  /**
  * The receipt of a response.
  */
  readonly RESPONSE_RECEIVED: "rr";
};
/**
* @beta
*/
type CmcdEventType = ValueOf<typeof CmcdEventType>;
//#endregion
//#region src/CmcdPlayerState.d.ts
/**
* CMCD v2 player states for the 'sta' key.
*
*
* @enum
*
* @beta
*/
declare const CmcdPlayerState: {
  /**
  * Starting: Initial startup of the player.
  */
  readonly STARTING: "s";
  /**
  * Playing: The player is actively rendering content.
  */
  readonly PLAYING: "p";
  /**
  * Seeking: The player is seeking to a new position.
  */
  readonly SEEKING: "k";
  /**
  * Rebuffering: The player is buffering data during playback.
  */
  readonly REBUFFERING: "r";
  /**
  * Paused: The player is paused.
  */
  readonly PAUSED: "a";
  /**
  * Waiting: The player is waiting for a user action or another event.
  */
  readonly WAITING: "w";
  /**
  * Ended: The media has finished playing.
  */
  readonly ENDED: "e";
  /**
  * Fatal Error: The player has encountered a fatal error.
  */
  readonly FATAL_ERROR: "f";
  /**
  * Quit: User initiated end of playback before media asset completion.
  */
  readonly QUIT: "q";
  /**
  * Preloading: The player is loading assets ahead of starting in order to provide a fast startup. The expectation is that playback will commence at a future time.
  */
  readonly PRELOADING: "d";
};
/**
* @beta
*/
type CmcdPlayerState = ValueOf<typeof CmcdPlayerState>;
//#endregion
//#region src/CmcdRequest.d.ts
/**
* Common Media Client Data (CMCD) is a standardized set of HTTP request header fields and query string parameters.
*
*
* @beta
*/
type CmcdRequest = Omit<Cmcd, "nrr"> & {
  /**
  * Aggregate encoded bitrate
  *
  * The aggregate encoded bitrate of the complete media object including all object types. This SHOULD be derived from
  * playlist/manifest declarations, or it MAY be estimated by the player. If the playlist declares both peak and average bitrate values,
  * the peak value MUST be transmitted. This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av' or 'o'.
  * This value MUST NOT be sent if the encoded bitrate is known.
  *
  * Integer kbps
  */
  ab?: number;
  /**
  * Target buffer length (ms)
  *
  * The target buffer length associated with the media object being requested at the time of the request.
  * This value SHOULD be rounded to the nearest 100 ms. This value MUST NOT be sent for objects which do not have an object
  * type of 'a', 'v', 'av', 'tt', 'c', or 'o'
  *
  * Integer milliseconds
  */
  tbl?: number;
  /**
  * CDN ID (string, max 128 chars)
  *
  * A string identifying the current delivery network from which the player is retrieving content. Maximum length is 128 characters
  *
  * String
  */
  cdn?: string;
  /**
  * Live stream latency (ms)
  *
  * The time delta between when a given media timestamp was made available at the origin and when it was rendered by the client.
  * The accuracy of this estimate is dependent on synchronization between the packager and the player clocks.
  *
  * Integer Milliseconds
  */
  ltc?: number;
  /**
  * Backgrounded (all players in session not visible, boolean)
  *
  * All players in a session are currently in a state that is not visible to the user.
  * This key SHOULD only be sent if it is TRUE.
  * If the visibility state of the player is not known this key SHOULD NOT be reported
  *
  * Bool
  */
  bg?: boolean;
  /**
  * State (player state, e.g. "s", "p", etc.)
  *
  * A token describing the current playback state of the player as perceived by the end user, one of:
  * s - starting: the player has been instructed to play media for a given session, either by a user interaction or by an autoplay action.
  * p - playing : Media is being rendered.
  * k - seeking : The start of the user initiated action of moving the playhead position.
  * r - rebuffering : Media has stopped being rendered due to an insufficient buffer. This state is not reported during startup or seeking.
  * a - paused : Playback has been intentionally paused by the user.
  * w - waiting : Playback has been paused by the player.
  * e - ended : Rendering has ended due to completion of the media asset playback.
  * f - fatal error : Rendering has ended due to an irrecoverable error.
  * q - quit : User initiated end of playback before media asset completion.
  * d - preloading : the player is loading assets ahead of starting in order to provide a fast startup. The expectation is that playback will commence at a future time.
  *
  * Note: if used with Request Mode or Response Mode, then this key represents a snapshot of the state at request time, which may obscure prior state changes since the last request.
  * For most accurate state tracking in players, use State-Interval mode.
  * The addition of a timestamp in Request Mode might be useful in correctly placing the state change on a timeline.
  *
  * Token - one of [s,p,k,r,a,w,e,f,q,d]
  */
  sta?: CmcdPlayerState;
  /**
  * The encoded bitrate of the audio or video object being shown to the end user.
  *
  * Integer Kbps
  */
  pb?: number;
  /**
  * Timestamp (ms since UNIX epoch, required for event mode)
  *
  * The timestamp at which the associated event occurred, expressed as milliseconds since the UNIX epoch.
  * When the event is a request for a media object the time SHOULD reference when the request was first initiated.
  * When used with Response Mode, the timestamp should indicate the time at which the object was first requested and not when it was received.
  *
  * Integer milliseconds
  */
  ts?: number;
  /**
  * Top playable bitrate (kbps)
  *
  * The highest bitrate rendition that the player is currently capable of playing for reasons other than bandwidth limitations.
  * This key captures the cases in which, for example, screen resolution, DRM, or performance constraints limit the player's topmost choice of bitrate.
  * These constraints are intentionally obfuscated for privacy reasons.
  * This key can increase the fingerprinting surface exposed by CMCD transmission and SHOULD NOT be transmitted in a default player configuration.
  *
  * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted.
  * This top playable bitrate MUST apply to the object type being requested.
  * Requests for video objects MUST specify the top playable video bitrate and requests for audio objects MUST specify the top playable audio bitrate.
  * This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av' or 'c'.
  *
  * Integer Kbps
  */
  tpb?: number;
  /**
  * Lowest encoded bitrate (kbps)
  *
  * The lowest bitrate rendition in the manifest or playlist.
  * This SHOULD be derived from playlist/manifest declarations, or it MAY be estimated by the player.
  * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted.
  * This lowest bitrate MUST apply to the object type being requested.
  * Requests for video objects MUST specify the lowest video bitrate and requests for audio objects MUST specify the lowest audio bitrate.
  * This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av' or 'c'.
  *
  * Integer Kbps
  */
  lb?: number;
  /**
  * Top aggregated encoded bitrate (kbps)
  *
  * The highest aggregated bitrate rendition in the manifest or playlist.
  * This SHOULD be derived from playlist/manifest declarations, or it MAY be estimated by the player.
  * If the playlist declares both peak and average bitrate values,the peak value MUST be transmitted.
  * The aggregate encoded bitrate is of the complete media object including all object types.
  * This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av' or 'c'.
  * This value MUST NOT be sent if the top encoded bitrate is known
  *
  * Integer Kbps
  */
  tab?: number;
  /**
  * Lowest aggregated encoded bitrate (kbps)
  *
  * The lowest aggregated bitrate rendition in the manifest or playlist.
  * This SHOULD be derived from playlist/manifest declarations, or it MAY be estimated by the player.
  * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted.
  * The aggregate encoded bitrate is of the complete media object including all object types.
  * This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av' or 'c'.
  * This value MUST NOT be sent if the lowest encoded bitrate is known.
  *
  * Integer Kbps
  */
  lab?: number;
  /**
  * Playhead time (ms)
  *
  * The playhead time, expressed in milliseconds, which is being rendered to the viewer when the report is made.
  * For Response and State-Interval modes, this corresponds to the playhead time that was rendered at the wallclock time reported by the timestamp field.
  *
  * Integer milliseconds
  */
  pt?: number;
  /**
  * Error code(s), application-defined
  *
  * A string defining an error code produced by the player.
  * The namespace and formatting of this error code is left to the application.
  * Use of standardized error codes is recommended.
  * Errors should be buffered per report destination as they occur and reported along with the next CMCD report.
  * With Event mode there is the option to report errors as they occur.
  *
  * An Inner List of Strings
  */
  ec?: string | string[];
  /**
  * Media Start Delay (ms)
  *
  * Measures the initial delay in wall-clock time from when a player is instructed to play media for a given session to when any media begins playback,
  * whether it be primary content or interstitial content.
  * This value SHOULD be the time difference between the "starting" and "playing" states.
  * This key MUST only be sent once per Session ID and MUST be sent for each reporting mode which is active within the player.
  * For request and response reporting modes, this key SHOULD be sent on the next media object request following successful startup.
  *
  * Integer milliseconds
  */
  msd?: number;
  /**
  * Sequence Number
  *
  * A monotonically increasing integer to identify the sequence of a CMCD report to a target within a session. This MUST be reset to zero on the start of
  * a new session-id. Sequence numbers increase independently per each combination of mode and target.
  *
  * Integer
  */
  sn?: number;
  /**
  * Buffer starvation duration
  *
  * Duration of the latest rebuffering period reported once the rebuffering has completed. This value MUST only be reported once per rebuffering incident, per object type.
  *
  * If the object type 'ot' key is sent along with this key, then the 'bsd' key refers to the buffer associated with the particular object type. If no object type is communicated, then the buffer state applies to the current session.
  *
  * Integer milliseconds
  */
  bsd?: number;
  /**
  * Dropped Frames
  *
  * An absolute count of dropped frames since session initiation. This key should only be sent for content types of 'v','av' or 'o'.
  * Note that this value will be driven by the content being rendered rather than the content being retrieved, therefore it is beneficial if accompanied by the playhead time 'pt' key to allow for correct interpretation.
  *
  * Integer
  */
  df?: number;
  /**
  * Content Signature
  *
  * A string representing a signature of the content being played. This field SHOULD vary with content ID and be bound by some mechanism to the content.
  * For example, this field may be used to transmit the C2PA signature associated with the content being viewed.
  *
  * Integer bytes
  */
  cs?: number;
};
//#endregion
//#region src/CmcdEvent.d.ts
/**
* CMCD v2 - Event Mode.
*
* Represents the event and keys for CMCD v2.
*
* This type is used to structure the data for reporting events according to the
* Common Media Client Data (CMCD) version 2 specification. It encapsulates
* the reporting event token.
*
*
* @beta
*/
type CmcdEvent = Omit<CmcdRequest, CmcdEventExcludedKeys> & {
  /**
  * Event (event mode; e.g. "e", "t", "ps")
  *
  * This key MUST only be used in Event mode.
  *
  * ps - play state change. This token MUST be accompanied by a 'sta' key carrying the new state.
  *
  * e - the player has experienced an error. This token MUST be accompanied by a 'ec' key defining the player error code.
  *
  * t - time interval. The interval at which these reports are made is application-defined. A default interval of 30 seconds SHOULD
  * be used if no explicit application interval is provided. Short form content may wish to use a shorter interval.
  * An application-defined interval of zero should be interpreted as turning off interval event reporting.
  * This event MUST be supported by all players that support Event mode.
  *
  * c - content ID has changed. This token MUST be accompanied by a 'cid' key defining the new content ID.
  *
  * b - the player has entered backgrounded mode if this event is accompanied by the ‘bg’ key and exited backgrounded mode if not.
  *
  * m - mute. The user activated the mute control or set the volume to zero.
  *
  * um - unmute. The user deactivated the mute control or raised the volume above zero if it was previously set to zero.
  *
  * pe - playerExpand. The user activated a control to extend the player to a larger size. The definition of this event is intended to be
  * compliant with the VAST [VAST] Player Operation Metrics.
  *
  * c - playerCollapse: the user activated a control to reduce the player to a smaller size. The definition of this event is intended to be
  * compliant with the VAST [VAST] Player Operation Metrics.
  *
  * Token - one of [ps,e,t,c,b,m,u m, abs, abe, as, ae]
  */
  e?: CmcdEventType;
};
//#endregion
//#region src/CmcdResponse.d.ts
/**
* CMCD Response Mode.
*
* Defines the keys for the CMCD (Common Media Client Data) v2 Response group.
*
*
* @beta
*/
type CmcdResponse = CmcdRequest & {
  /**
  * Response code for object request (response mode)
  *
  * The response code received when requesting a media object. In a redirect scenario, this would be the final response code received.
  * A value of 0 SHOULD be used to indicate that a response was not received.
  *
  * Integer
  */
  rc?: number;
  /**
  * Time to first byte (ms; response mode)
  *
  * The elapsed time between when the request was first initiated (captured in ts) and the time when the first byte of the response was received.
  * This value should only be reported if it is known. Absence of this key does not indicate that the response was not received.
  *
  * Integer milliseconds
  */
  ttfb?: number;
  /**
  * Time to first body byte (ms; response mode)
  *
  * The elapsed time between when the request was first initiated (captured in ts) and the time the first bytes of the response body are received.
  * This value should only be reported if it is known. Absence of this key does not indicate that the body was not received.
  *
  * Integer milliseconds
  */
  ttfbb?: number;
  /**
  * Time to last byte (ms; response mode)
  *
  * The elapsed time between when the request was first initiated (captured in ts) and the time the response body is fully received.
  * This value should only be reported if it is known.
  * Absence of this key does not indicate that the response was not fully received
  *
  * Integer milliseconds
  */
  ttlb?: number;
  /**
  * Requested URL (string; response mode)
  *
  * The URL used to request the media object.
  * This key MUST NOT be used with reporting mode #1.
  * If the request is redirected, this key MUST report the initial requested URL.
  *
  * String
  */
  url?: string;
  /**
  * CMSD Dynamic Header (response mode)
  *
  * Holds a Base64 [base64] encoded copy of the CMSD data received on the CMSD-Dynamic response header.
  * This key MUST only be used in RESPONSE mode.
  *
  * String
  */
  cmsdd?: string;
  /**
  * CMSD Static Header (response mode)
  *
  * Holds a Base64 [base64] encoded copy of the CMSD data received on the CMSD-Static response header.
  * This key MUST only be used in RESPONSE mode.
  *
  * String
  */
  cmsds?: string;
  /**
  * SMRT Header
  
  * Holds a Base64 [base64] encoded copy of the streaming media response tracing data received on the SMRT-Data header.
  * This key MUST only be used in RESPONSE mode.
  */
  smrt?: number;
};
//#endregion
//#region src/CmcdData.d.ts
/**
* All CMCD data types combined.
*
*
* @beta
*/
type CmcdData = Cmcd & CmcdRequest & CmcdEvent & CmcdResponse;
//#endregion
//#region src/CmcdKey.d.ts
/**
* A CMCD key.
*
*
* @beta
*/
type CmcdKey = keyof CmcdData;
//#endregion
//#region src/CmcdFormatterMap.d.ts
/**
* A map of CMCD keys to format functions.
*
*
* @beta
*/
type CmcdFormatterMap = Record<CmcdKey, CmcdFormatter>;
//#endregion
//#region src/CMCD_OBJECT.d.ts
/**
* CMCD object header name.
*
*
* @beta
*/
declare const CMCD_OBJECT = "CMCD-Object";
//#endregion
//#region src/CMCD_REQUEST.d.ts
/**
* CMCD request header name.
*
*
* @beta
*/
declare const CMCD_REQUEST = "CMCD-Request";
//#endregion
//#region src/CMCD_SESSION.d.ts
/**
* CMCD session header name.
*
*
* @beta
*/
declare const CMCD_SESSION = "CMCD-Session";
//#endregion
//#region src/CMCD_STATUS.d.ts
/**
* CMCD status header name.
*
*
* @beta
*/
declare const CMCD_STATUS = "CMCD-Status";
//#endregion
//#region src/CmcdHeaderField.d.ts
/**
* CMCD header fields.
*
*
* @enum
*
* @beta
*/
declare const CmcdHeaderField: {
  /**
  * keys whose values vary with the object being requested.
  */
  readonly OBJECT: typeof CMCD_OBJECT;
  /**
  * keys whose values vary with each request.
  */
  readonly REQUEST: typeof CMCD_REQUEST;
  /**
  * keys whose values are expected to be invariant over the life of the session.
  */
  readonly SESSION: typeof CMCD_SESSION;
  /**
  * keys whose values do not vary with every request or object.
  */
  readonly STATUS: typeof CMCD_STATUS;
};
/**
* @beta
*/
type CmcdHeaderField = ValueOf<typeof CmcdHeaderField>;
//#endregion
//#region src/CmcdHeaderMap.d.ts
/**
* A map of CMCD header fields to CMCD keys.
*
*
* @beta
*/
type CmcdHeaderMap = Record<CmcdHeaderField, CmcdKey[]>;
//#endregion
//#region src/CmcdEncodeOptions.d.ts
/**
* Options for encoding CMCD values.
*
*
* @beta
*/
type CmcdEncodeOptions = {
  /**
  * The version of the CMCD specification to use.
  *
  * @defaultValue `1`
  */
  version?: number;
  /**
  * The reporting mode to use.
  *
  * @defaultValue `CmcdReportingMode.REQUEST`
  */
  reportingMode?: CmcdReportingMode;
  /**
  * A map of CMCD keys to custom formatters.
  */
  formatters?: Partial<CmcdFormatterMap>;
  /**
  * A map of CMCD header fields to custom CMCD keys.
  */
  customHeaderMap?: Partial<CmcdHeaderMap>;
  /**
  * A filter function for CMCD keys.
  *
  * @param key - The CMCD key to filter.
  *
  * @returns `true` if the key should be included, `false` otherwise.
  */
  filter?: (key: CmcdKey) => boolean;
  /**
  * The base URL to use for relative URLs.
  */
  baseUrl?: string;
  /**
  * Array of event names to filter.
  */
  events?: string[];
};
//#endregion
//#region src/appendCmcdHeaders.d.ts
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
declare function appendCmcdHeaders(headers: Record<string, string>, cmcd: Cmcd, options?: CmcdEncodeOptions): Record<string, string>;
//#endregion
//#region src/appendCmcdQuery.d.ts
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
declare function appendCmcdQuery(url: string, cmcd: Cmcd, options?: CmcdEncodeOptions): string;
//#endregion
//#region src/CMCD_COMMON_KEYS.d.ts
/**
* Defines the common keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
declare const CMCD_COMMON_KEYS: readonly ["ab", "bg", "bl", "br", "bs", "bsd", "cdn", "cid", "cs", "df", "ec", "lab", "lb", "ltc", "msd", "mtp", "pb", "pr", "pt", "sf", "sid", "sn", "st", "sta", "tab", "tb", "tbl", "tpb", "ts", "v"];
//#endregion
//#region src/CMCD_DEFAULT_TIME_INTERVAL.d.ts
/**
* The default time interval in secondswhen using using event mode
*
*
* @beta
*/
declare const CMCD_DEFAULT_TIME_INTERVAL = 30;
//#endregion
//#region src/CMCD_EVENT_KEYS.d.ts
/**
* Defines the event-specific keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
declare const CMCD_EVENT_KEYS: readonly ["e"];
//#endregion
//#region src/CMCD_FORMATTER_MAP.d.ts
/**
* The default formatters for CMCD values.
*
*
* @beta
*/
declare const CMCD_FORMATTER_MAP: Record<string, CmcdFormatter>;
//#endregion
//#region src/CMCD_HEADERS.d.ts
/**
* CMCD `headers` transmission mode.
*
*
* @beta
*/
declare const CMCD_HEADERS = "headers";
//#endregion
//#region src/CMCD_JSON.d.ts
/**
* CMCD `json` transmission mode.
*
*
* @beta
*
* @deprecated JSON transmission mode is deprecated and will be removed in future versions.
*/
declare const CMCD_JSON = "json";
//#endregion
//#region src/CMCD_KEYS.d.ts
/**
* A list of all CMCD keys.
*
*
* @beta
*/
declare const CMCD_KEYS: CmcdKey[];
//#endregion
//#region src/CMCD_PARAM.d.ts
/**
* CMCD parameter name.
*
*
* @beta
*/
declare const CMCD_PARAM = "CMCD";
//#endregion
//#region src/CMCD_QUERY.d.ts
/**
* CMCD `query` transmission mode.
*
*
* @beta
*/
declare const CMCD_QUERY = "query";
//#endregion
//#region src/CMCD_REQUEST_KEYS.d.ts
/**
* Defines the request-specific keys for CMCD (Common Media Client Data) version 2.
*
*
* @beta
*/
declare const CMCD_REQUEST_KEYS: readonly ["d", "dl", "nor", "ot", "rtp", "su"];
//#endregion
//#region src/CMCD_RESPONSE_KEYS.d.ts
/**
* CMCD v2 - Response-only and timing keys.
*
*
* @beta
*/
declare const CMCD_RESPONSE_KEYS: readonly ["cmsdd", "cmsds", "rc", "smrt", "ttfb", "ttfbb", "ttlb", "url"];
//#endregion
//#region src/CMCD_RESPONSE_MODE.d.ts
/**
* CMCD response mode variable name.
*
*
* @beta
*/
declare const CMCD_RESPONSE_MODE = "response";
//#endregion
//#region src/CMCD_V1.d.ts
/**
* CMCD Version 1
*
*
* @beta
*/
declare const CMCD_V1 = 1;
//#endregion
//#region src/CMCD_V1_KEYS.d.ts
/**
* Defines the keys for CMCD (Common Media Client Data) version 1.
*
*
* @beta
*/
declare const CMCD_V1_KEYS: readonly ["bl", "br", "bs", "cid", "d", "dl", "mtp", "nor", "nrr", "ot", "pr", "rtp", "sf", "sid", "st", "su", "tb", "v"];
//#endregion
//#region src/CMCD_V2.d.ts
/**
* CMCD Version 2
*
*
* @beta
*/
declare const CMCD_V2 = 2;
//#endregion
//#region src/CmcdTransmissionMode.d.ts
/**
* CMCD transmission modes.
*
*
* @enum
*
* @beta
*/
declare const CmcdTransmissionMode: {
  /**
  * JSON
  *
  * @deprecated JSON transmission mode is deprecated and will be removed in future versions.
  */
  readonly JSON: typeof CMCD_JSON;
  /**
  * Query string
  */
  readonly QUERY: typeof CMCD_QUERY;
  /**
  * Request headers
  */
  readonly HEADERS: typeof CMCD_HEADERS;
};
/**
* @beta
*/
type CmcdTransmissionMode = ValueOf<typeof CmcdTransmissionMode>;
//#endregion
//#region src/CmcdEncoding.d.ts
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
declare const CmcdEncoding: typeof CmcdTransmissionMode;
/**
* @beta
*/
type CmcdEncoding = ValueOf<typeof CmcdEncoding>;
//#endregion
//#region src/CmcdFormatters.d.ts
/**
* The default formatters for CMCD values.
*
*
* @beta
*
* @deprecated Use `CMCD_FORMATTER_MAP` instead.
*/
declare const CmcdFormatters: Record<string, CmcdFormatter>;
//#endregion
//#region src/CmcdHeadersMap.d.ts
/**
* A map of CMCD header fields to CMCD keys.
*
*
* @beta
*
* @deprecated Use `CmcdHeaderMap` instead.
*/
type CmcdHeadersMap = Record<CmcdHeaderField, CmcdKey[]>;
//#endregion
//#region src/CmcdReportTarget.d.ts
/**
* A CMCD report target configuration.
*
*
* @beta
*/
type CmcdReportTarget = {
  /**
  * The URL to which the CMCD report should be sent.
  */
  url: string;
  /**
  * The reporting mode for the CMCD report.
  *
  * @defaultValue `CmcdReportingMode.REQUEST`
  */
  reportingMode?: CmcdReportingMode;
  /**
  * The HTTP method to use for the CMCD report.
  *
  * @defaultValue `'GET'`
  */
  method?: "GET" | "POST";
  /**
  * The version of the CMCD report.
  *
  * @defaultValue `1`
  */
  version?: number;
  /**
  * The transmission mode for the CMCD report.
  *
  * @defaultValue `CmcdTransmissionMode.QUERY`
  */
  transmissionMode?: CmcdTransmissionMode;
  /**
  * The list of CMCD keys to include in the report.
  */
  enabledKeys?: CmcdKey[];
};
//#endregion
//#region src/decodeCmcd.d.ts
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
declare function decodeCmcd<T extends CmcdData = CmcdData>(cmcd: string): T;
//#endregion
//#region src/encodeCmcd.d.ts
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
declare function encodeCmcd(cmcd: CmcdData, options?: CmcdEncodeOptions): string;
//#endregion
//#region src/fromCmcdHeaders.d.ts
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
declare function fromCmcdHeaders(headers: Record<string, string> | Headers): CmcdData;
//#endregion
//#region src/fromCmcdQuery.d.ts
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
declare function fromCmcdQuery(query: string | URLSearchParams): Cmcd;
//#endregion
//#region src/fromCmcdUrl.d.ts
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
declare function fromCmcdUrl(url: string): Cmcd;
//#endregion
//#region src/groupCmcdHeaders.d.ts
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
declare function groupCmcdHeaders(cmcd: CmcdData, customHeaderMap?: Partial<CmcdHeaderMap>): Record<CmcdHeaderField, CmcdData>;
//#endregion
//#region src/isCmcdCustomKey.d.ts
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
declare function isCmcdCustomKey(key: CmcdKey): boolean;
//#endregion
//#region src/isCmcdEventKey.d.ts
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
declare function isCmcdEventKey(key: string): key is keyof CmcdEvent;
//#endregion
//#region src/isCmcdRequestKey.d.ts
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
declare function isCmcdRequestKey(key: string): key is keyof CmcdRequest;
//#endregion
//#region src/isCmcdResponseReceivedKey.d.ts
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
declare function isCmcdResponseReceivedKey(key: string): key is keyof CmcdResponse;
//#endregion
//#region src/isCmcdV1Key.d.ts
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
declare function isCmcdV1Key(key: string): key is keyof Cmcd;
//#endregion
//#region src/prepareCmcdData.d.ts
/**
* Convert a generic object to CMCD data.
*
* @param obj - The CMCD object to process.
* @param options - Options for encoding.
*
*
* @beta
*/
declare function prepareCmcdData(obj: Record<string, any>, options?: CmcdEncodeOptions): CmcdData;
//#endregion
//#region src/toCmcdHeaders.d.ts
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
declare function toCmcdHeaders(cmcd: CmcdData, options?: CmcdEncodeOptions): Record<CmcdHeaderField, string>;
//#endregion
//#region src/toCmcdJson.d.ts
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
declare function toCmcdJson(cmcd: Cmcd, options?: CmcdEncodeOptions): string;
//#endregion
//#region src/toCmcdQuery.d.ts
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
declare function toCmcdQuery(cmcd: Cmcd, options?: CmcdEncodeOptions): string;
//#endregion
//#region src/toCmcdReport.d.ts
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
declare function toCmcdReport(data: CmcdData, target: CmcdReportTarget): Request<{
  cmcd: Cmcd;
}> | null;
//#endregion
//#region src/toCmcdUrl.d.ts
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
declare function toCmcdUrl(cmcd: Cmcd, options?: CmcdEncodeOptions): string;
//#endregion
export { CMCD_COMMON_KEYS, CMCD_DEFAULT_TIME_INTERVAL, CMCD_EVENT_KEYS, CMCD_EVENT_MODE, CMCD_FORMATTER_MAP, CMCD_HEADERS, CMCD_JSON, CMCD_KEYS, CMCD_OBJECT, CMCD_PARAM, CMCD_QUERY, CMCD_REQUEST, CMCD_REQUEST_KEYS, CMCD_REQUEST_MODE, CMCD_RESPONSE_KEYS, CMCD_RESPONSE_MODE, CMCD_SESSION, CMCD_STATUS, CMCD_V1, CMCD_V1_KEYS, CMCD_V2, Cmcd, CmcdCustomKey, CmcdData, CmcdEncodeOptions, CmcdEncoding, CmcdEvent, CmcdEventExcludedKeys, CmcdEventType, CmcdFormatter, CmcdFormatterMap, CmcdFormatterOptions, CmcdFormatters, CmcdHeaderField, CmcdHeaderMap, CmcdHeadersMap, CmcdKey, CmcdObjectType, CmcdPlayerState, CmcdReportTarget, CmcdReportingMode, CmcdRequest, CmcdResponse, CmcdStreamType, CmcdStreamingFormat, CmcdTransmissionMode, CmcdValue, appendCmcdHeaders, appendCmcdQuery, decodeCmcd, encodeCmcd, fromCmcdHeaders, fromCmcdQuery, fromCmcdUrl, groupCmcdHeaders, isCmcdCustomKey, isCmcdEventKey, isCmcdRequestKey, isCmcdResponseReceivedKey, isCmcdV1Key, prepareCmcdData, toCmcdHeaders, toCmcdJson, toCmcdQuery, toCmcdReport, toCmcdUrl };
//# sourceMappingURL=index.d.ts.map