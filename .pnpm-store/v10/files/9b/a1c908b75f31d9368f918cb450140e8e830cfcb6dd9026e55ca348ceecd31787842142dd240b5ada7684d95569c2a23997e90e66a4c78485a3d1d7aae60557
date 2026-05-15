import axios from 'axios';
import { Census3API } from './api';

enum Census3ServiceAPIMethods {
  INFO = '/info',
}

export interface ICensus3SupportedChain {
  /**
   * The identifier of the chain
   */
  chainID: number;

  /**
   * The short name of the chain
   */
  shortName: string;

  /**
   * The name of the chain
   */
  name: string;
}

export interface ICensus3ServiceInfoResponse {
  /**
   * The list of supported chains
   */
  supportedChains: Array<ICensus3SupportedChain>;
}

export abstract class Census3ServiceAPI extends Census3API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Fetches supported chains from the service
   *
   * @param url - API endpoint URL
   */
  public static info(url: string): Promise<ICensus3ServiceInfoResponse> {
    return axios
      .get<ICensus3ServiceInfoResponse>(url + Census3ServiceAPIMethods.INFO)
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
