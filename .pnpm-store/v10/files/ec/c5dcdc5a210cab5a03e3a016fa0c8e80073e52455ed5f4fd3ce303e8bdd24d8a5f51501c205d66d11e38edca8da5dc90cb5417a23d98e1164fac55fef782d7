import axios from 'axios';
import { strip0x } from '../util/common';
import { API } from './api';

enum WalletAPIMethods {
  ADD = '/wallet/add',
}

interface IWalletAddResponse {
  /**
   * The address of the added account
   */
  address: string;

  /**
   * The new token added
   */
  token: string;
}

export abstract class WalletAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  public static add(url: string, privateKey: string): Promise<IWalletAddResponse> {
    return axios
      .post<IWalletAddResponse>(url + WalletAPIMethods.ADD + '/' + strip0x(privateKey))
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
