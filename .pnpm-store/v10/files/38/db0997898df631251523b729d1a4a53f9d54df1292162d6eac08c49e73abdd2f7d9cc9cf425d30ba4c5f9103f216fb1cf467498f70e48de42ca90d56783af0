import axios from 'axios';
import { API } from './api';

enum RemoteSignerAPIMethods {
  LOGIN = '/auth/login',
  REFRESH = '/auth/refresh',
  ADDRESSES = '/auth/addresses',
  SIGN_TX = '/transactions',
  SIGN = '/transactions/message',
}

export interface IRemoteSignerLoginResponse {
  /**
   * The JWT token
   */
  token: string;

  /**
   * The JWT token expiry
   */
  expirity: string;
}

export interface IRemoteSignerRefreshResponse {
  /**
   * The JWT token
   */
  token: string;

  /**
   * The JWT token expiry
   */
  expirity: string;
}

export interface IRemoteSignerAddressesResponse {
  /**
   * The list of addresses
   */
  addresses: Array<string>;
}

export interface IRemoteSignerSignTxResponse {
  /**
   * The signed transaction payload
   */
  txPayload: string;
}

export interface IRemoteSignerSignResponse {
  /**
   * The signed payload
   */
  signature: string;
}

export abstract class RemoteSignerAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Logs in a user using email and password.
   *
   * @param url - API endpoint URL
   * @param email - The email address
   * @param password - The password
   */
  public static login(url: string, email: string, password: string): Promise<IRemoteSignerLoginResponse> {
    return axios
      .post<IRemoteSignerLoginResponse>(url + RemoteSignerAPIMethods.LOGIN, { email, password })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Refreshes the JWT token.
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   */
  public static refresh(url: string, authToken: string): Promise<IRemoteSignerRefreshResponse> {
    return axios
      .post<IRemoteSignerRefreshResponse>(url + RemoteSignerAPIMethods.REFRESH, null, {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Gets the writable addresses of the logged-in user.
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   */
  public static addresses(url: string, authToken: string): Promise<IRemoteSignerAddressesResponse> {
    return axios
      .get<IRemoteSignerAddressesResponse>(url + RemoteSignerAPIMethods.ADDRESSES, {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Signs the transaction using the remote signer.
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param address - The address
   * @param payload - The transaction payload
   */
  public static signTransaction(
    url: string,
    authToken: string,
    address: string,
    payload: string
  ): Promise<IRemoteSignerSignTxResponse> {
    return axios
      .post<IRemoteSignerSignTxResponse>(
        url + RemoteSignerAPIMethods.SIGN_TX,
        { txPayload: payload, address },
        {
          headers: {
            Authorization: 'Bearer ' + authToken,
          },
        }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Signs the payload using the remote signer.
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param address - The address
   * @param payload - The payload
   */
  public static sign(
    url: string,
    authToken: string,
    address: string,
    payload: string
  ): Promise<IRemoteSignerSignResponse> {
    return axios
      .post<IRemoteSignerSignResponse>(
        url + RemoteSignerAPIMethods.SIGN,
        { address, payload },
        {
          headers: {
            Authorization: 'Bearer ' + authToken,
          },
        }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
