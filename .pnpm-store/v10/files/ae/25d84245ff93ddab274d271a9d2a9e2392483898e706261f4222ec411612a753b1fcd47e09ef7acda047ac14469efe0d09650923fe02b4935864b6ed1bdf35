import { Request, RequestType, ResourceTiming } from "@svta/cml-utils";
import { Cmcd } from "@svta/cml-cmcd";
import { XmlNode } from "@svta/cml-xml";

//#region src/CommonMediaRequest.d.ts

/**
* Common Media Request.
*
*
* @beta
*/
type CommonMediaRequest = Request<{
  cmcd: Cmcd;
}>;
//#endregion
//#region src/ResponseTypeMap.d.ts
/**
* The a request's `responseType` to the corresponding data type.
*
*
* @beta
*/
type ResponseTypeMap<T extends string | undefined> = T extends "json" ? any : T extends "text" ? string : T extends "blob" ? Blob : T extends "arraybuffer" ? ArrayBuffer : T extends "document" ? XmlNode : unknown;
//#endregion
//#region src/CommonMediaResponse.d.ts
/**
* Common response API.
*
*
* @beta
*/
type CommonMediaResponse<R extends CommonMediaRequest = CommonMediaRequest> = {
  /**
  * The origin request.
  */
  request: R;
  /**
  * The final URL obtained after any redirects.
  */
  url?: string;
  /**
  * Indicates whether or not the request was redirected.
  */
  redirected?: boolean;
  /**
  * The HTTP status code of the response.
  */
  status?: number;
  /**
  * The status message corresponding to the HTTP status code.
  */
  statusText?: string;
  /**
  * The type of the response.
  */
  type?: string;
  /**
  * The response headers.
  */
  headers?: Record<string, string>;
  /**
  * The response data.
  */
  data?: ResponseTypeMap<R["responseType"]>;
  /**
  * The network timing of the request/response.
  */
  resourceTiming?: ResourceTiming;
};
//#endregion
//#region src/Requester.d.ts
/**
* A function that executes a request and returns a response that adhere to the
* common media request/response types.
*
*
* @beta
*/
type Requester = (request: CommonMediaRequest) => Promise<CommonMediaResponse>;
//#endregion
//#region src/RequestInterceptor.d.ts
/**
* Request interceptor API.
* @param request - The request to be executed.
* @returns A promise with updated request that is resolved when the interceptor has completed the process of the request.
*
*
* @beta
*/
type RequestInterceptor = (request: CommonMediaRequest) => Promise<CommonMediaRequest>;
//#endregion
//#region src/ResponseInterceptor.d.ts
/**
* Response interceptor API.
* @param response - The received response.
* @returns A promise with updated response that is resolved when the interceptor has completed the process of the response.
*
*
* @beta
*/
type ResponseInterceptor = (response: CommonMediaResponse) => Promise<CommonMediaResponse>;
//#endregion
export { CommonMediaRequest, CommonMediaResponse, RequestInterceptor, RequestType, Requester, type ResourceTiming, ResponseInterceptor, ResponseTypeMap };
//# sourceMappingURL=index.d.ts.map