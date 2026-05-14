import axios from 'axios';
import { strip0x } from '../util/common';
import { API } from './api';

enum ZkAPIMethods {
  PROOF = '/siks/proof',
  SIK = '/siks',
}

export interface IZkProofResponse {
  /**
   * The root (id) of the census
   */
  censusRoot: string;

  /**
   * The proof for the given key
   */
  censusProof: string;

  /**
   * The value for the given key
   */
  value: string;

  /**
   * The value for the census siblings
   */
  censusSiblings: Array<string>;
}

export interface IZkSIKResponse {
  /**
   * The sik of the address
   */
  sik: string;
}

export abstract class ZkAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Returns the ZK proof on given address
   *
   * @param url - API endpoint URL
   * @param key - The address to be checked
   * @returns The ZK proof
   */
  public static proof(url: string, key: string): Promise<IZkProofResponse> {
    return axios
      .get<IZkProofResponse>(url + ZkAPIMethods.PROOF + '/' + strip0x(key))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the SIK on given address
   *
   * @param url - API endpoint URL
   * @param key - The address to be checked
   * @returns The ZK proof
   */
  public static sik(url: string, key: string): Promise<IZkSIKResponse> {
    return axios
      .get<IZkSIKResponse>(url + ZkAPIMethods.SIK + '/' + strip0x(key))
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
