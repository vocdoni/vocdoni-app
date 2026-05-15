import axios from 'axios';
import { API } from './api';

enum FaucetAPIMethods {
  CLAIM = '/open/claim',
}

interface IFaucetCollectResponse {
  /**
   * The amount of tokens.
   */
  amount: string;

  /**
   * The base64 JSON containing the payload and the signature
   */
  faucetPackage: string;
}

export abstract class FaucetAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Calls the collect tokens method.
   *
   * @param url - API endpoint URL
   * @param address - Address to send the tokens to
   */
  public static collect(url: string, address: string): Promise<IFaucetCollectResponse> {
    return axios
      .get<IFaucetCollectResponse>(url + FaucetAPIMethods.CLAIM + '/' + address)
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
