import axios from 'axios';
import { strip0x } from '../util/common';
import { API } from './api';

enum CspAPIMethods {
  INFO = '/auth/elections/info',
  STEP = '/auth/elections',
  SIGN = '/auth/elections/{id}/{signatureType}/sign',
}

export interface ICspAuthStep {
  /**
   * The title of the step
   */
  title: string;

  /**
   * The type of data of the step
   */
  type: string;
}

export interface ICspInfoResponse {
  /**
   * The title of the CSP Information
   */
  title: string;

  /**
   * The types of signature of the CSP
   */
  signatureType: Array<string>;

  /**
   * The authentication type of the CSP
   */
  authType: string;

  /**
   * The auth steps to follow in order to get a blind signature
   */
  authSteps: Array<ICspAuthStep>;
}

export interface ICspIntermediateStepResponse {
  /**
   * The auth token for the following requests
   */
  authToken: string;

  /**
   * The response of the CSP
   */
  response: Array<any>;
}

export interface ICspFinalStepResponse {
  /**
   * The final token
   */
  token: string;
}

export interface ICspSignResponse {
  /**
   * The blind signature
   */
  signature: string;
}

export abstract class CspAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * CSP info
   *
   * @param url - CSP endpoint URL
   *
   */
  public static info(url: string): Promise<ICspInfoResponse> {
    return axios
      .get<ICspInfoResponse>(url + CspAPIMethods.INFO)
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * CSP step
   *
   * @param url - CSP endpoint URL
   * @param electionId - The election identifier
   * @param signatureType - The type of the signature
   * @param authType - The type of the auth method
   * @param stepNr - The step number
   * @param data - The auth data
   * @param authToken - The auth token from the previous step
   *
   */
  public static step(
    url: string,
    electionId: string,
    signatureType: string,
    authType: string,
    stepNr: number,
    data: Array<any>,
    authToken?: string
  ): Promise<ICspIntermediateStepResponse | ICspFinalStepResponse> {
    return axios
      .post<ICspIntermediateStepResponse | ICspFinalStepResponse>(
        url + CspAPIMethods.STEP + '/' + strip0x(electionId) + '/' + signatureType + '/' + authType + '/' + stepNr,
        authToken ? { authToken, authData: data } : { authData: data }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * CSP sign
   *
   * @param url - CSP endpoint URL
   * @param electionId - The election identifier
   * @param signatureType - The type of the signature
   * @param payload - The payload from the user
   * @param token - The token from the last step
   *
   */
  public static sign(
    url: string,
    electionId: string,
    signatureType: string,
    payload: string,
    token: string
  ): Promise<ICspSignResponse> {
    return axios
      .post<ICspSignResponse>(
        url + CspAPIMethods.SIGN.replace('{id}', electionId).replace('{signatureType}', signatureType),
        { payload, token }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
