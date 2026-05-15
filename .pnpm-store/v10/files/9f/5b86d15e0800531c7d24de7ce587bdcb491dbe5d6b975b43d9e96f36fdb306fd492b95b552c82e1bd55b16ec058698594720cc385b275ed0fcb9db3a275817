import axios from 'axios';
import { API, PaginationResponse } from './api';
import { AccountMetadata } from '../types';
import { FetchAccountsParametersWithPagination } from '../services';

enum AccountAPIMethods {
  LIST = '/accounts',
  INFO = '/accounts/{accountId}',
  METADATA = '/accounts/{accountId}/metadata',
  SET_INFO = '/accounts',
}

export type IAccountSummary = Pick<IAccountInfoResponse, 'address' | 'balance' | 'nonce'>;

export interface IAccountInfoResponse {
  /**
   * The address of the account
   */
  address: string;

  /**
   * The current balance in tokens.
   */
  balance: number;

  /**
   * The nonce of the account.
   */
  nonce: number;

  /**
   * The sik of the account.
   */
  sik: string;

  /**
   * The index of the elections created by the account.
   */
  electionIndex: number;

  /**
   * The number of transfers of the account.
   */
  transfersCount: number;

  /**
   * The number of fees of the account.
   */
  feesCount: number;

  /**
   * The information URI of the account
   */
  infoURL?: string;

  /**
   * The metadata of the account
   */
  metadata: AccountMetadata;
}

interface IAccountSetInfoResponse {
  /**
   * The hash of the transaction
   */
  txHash: string;

  /**
   * The metadata URL
   */
  metadataURL: number;
}

export interface IAccountsListResponse extends IAccountsList, PaginationResponse {}

export interface IAccountsList {
  /**
   * List of accounts
   */
  accounts: Array<IAccountSummary>;
}

export abstract class AccountAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Returns list of accounts
   *
   * @param url - API endpoint URL
   * @param params - The parameters to filter the accounts
   */
  public static list(
    url: string,
    params?: Partial<FetchAccountsParametersWithPagination>
  ): Promise<IAccountsListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IAccountsListResponse>(url + AccountAPIMethods.LIST + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches an Account information
   *
   * @param url - API endpoint URL
   * @param accountId - The account we want the info from
   */
  public static info(url: string, accountId: string): Promise<IAccountInfoResponse> {
    return axios
      .get<IAccountInfoResponse>(url + AccountAPIMethods.INFO.replace('{accountId}', accountId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches the account metadata
   *
   * @param url - API endpoint URL
   * @param accountId - The account we want the info from
   */
  public static metadata(url: string, accountId: string): Promise<AccountMetadata> {
    return axios
      .get<AccountMetadata>(url + AccountAPIMethods.METADATA.replace('{accountId}', accountId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Sets Account information
   *
   * @param url - API endpoint URL
   * @param payload - The set information info raw payload to be submitted to the chain
   * @param metadata - The base64 encoded metadata JSON object
   */
  public static setInfo(url: string, payload: string, metadata: string): Promise<IAccountSetInfoResponse> {
    return axios
      .post<IAccountSetInfoResponse>(url + AccountAPIMethods.SET_INFO, { txPayload: payload, metadata })
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
