import { ValueOf } from "@svta/cml-utils";
import { SfItem, SfToken } from "@svta/cml-structured-field-values";

//#region src/CmCustomKey.d.ts

/**
* Custom key for use in Common Media data. Custom keys MUST carry a hyphenated prefix
* to ensure that there will not be a namespace collision with future
* revisions to this specification. Clients SHOULD use a reverse-DNS
* syntax when defining their own prefix.
*
*
* @beta
*/
type CmCustomKey = `${string}-${string}`;
//#endregion
//#region src/CmObjectType.d.ts
/**
* Common Media Object Type
*
* @internal
*/
declare const CmObjectType: {
  /**
  * text file, such as a manifest or playlist
  */
  readonly MANIFEST: "m";
  /**
  * audio only
  */
  readonly AUDIO: "a";
  /**
  * video only
  */
  readonly VIDEO: "v";
  /**
  * muxed audio and video
  */
  readonly MUXED: "av";
  /**
  * init segment
  */
  readonly INIT: "i";
  /**
  * caption or subtitle
  */
  readonly CAPTION: "c";
  /**
  * ISOBMFF timed text track
  */
  readonly TIMED_TEXT: "tt";
  /**
  * cryptographic key, license or certificate.
  */
  readonly KEY: "k";
  /**
  * other
  */
  readonly OTHER: "o";
};
/**
* Common Media Object Type
*
* @internal
*/
type CmObjectType = ValueOf<typeof CmObjectType>;
//#endregion
//#region src/CmStreamingFormat.d.ts
/**
* Common Media Streaming Format
*
* @internal
*/
declare const CmStreamingFormat: {
  /**
  * MPEG DASH
  */
  readonly DASH: "d";
  /**
  * HTTP Live Streaming (HLS)
  */
  readonly HLS: "h";
  /**
  * Smooth Streaming
  */
  readonly SMOOTH: "s";
  /**
  * Other
  */
  readonly OTHER: "o";
};
/**
* Common Media Streaming Format
*
* @internal
*/
type CmStreamingFormat = ValueOf<typeof CmStreamingFormat>;
//#endregion
//#region src/CmStreamType.d.ts
/**
* Common Media Stream Type
*
* @internal
*/
declare const CmStreamType: {
  /**
  *  All segments are available – e.g., VOD
  */
  readonly VOD: "v";
  /**
  * Segments become available over time – e.g., LIVE
  */
  readonly LIVE: "l";
};
/**
* Common Media Stream Type
*
* @internal
*/
type CmStreamType = ValueOf<typeof CmStreamType>;
//#endregion
//#region src/CmValue.d.ts
/**
* A common media value.
*
*
* @beta
*/
type CmValue = CmObjectType | CmStreamingFormat | CmStreamType | string | string[] | number | number[] | boolean | symbol | SfToken | SfItem | SfItem[];
//#endregion
//#region src/isTokenField.d.ts
/**
* Checks if the given key is a token field.
*
* @param key - The key to check.
*
* @returns `true` if the key is a token field.
*
* @internal
*/
declare function isTokenField(key: string): boolean;
//#endregion
//#region src/isValid.d.ts
/**
* Checks if the given value is valid
*
* @param value - The value to check.
*
* @returns `true` if the key is a value is valid.
*
* @internal
*/
declare function isValid(value: CmValue): boolean;
//#endregion
export { CmCustomKey, CmObjectType, CmStreamType, CmStreamingFormat, CmValue, isTokenField, isValid };
//# sourceMappingURL=index.d.ts.map