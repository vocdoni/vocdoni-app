import { Service, ServiceProperties } from './service';
import invariant from 'tiny-invariant';
import { FaucetAPI } from '../api';
import { Buffer } from 'buffer';

/**
 * Specify custom Faucet.
 *
 * @typedef FaucetOptions
 * @property {number} token_limit
 */
interface FaucetServiceProperties {
  token_limit: number;
}

type FaucetServiceParameters = ServiceProperties & FaucetServiceProperties;

/**
 * @typedef FaucetPackage
 * @property {string} payload
 * @property {string} signature
 */
export type FaucetPackage = {
  payload: string;
  signature: string;
};

export type FaucetOptions = FaucetServiceParameters;

export class FaucetService extends Service implements FaucetServiceProperties {
  public token_limit: number;

  /**
   * Instantiate the chain service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<FaucetServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  /**
   * Fetches a faucet payload. Only for development.
   *
   * @param address - The address where to send the tokens
   * @returns The encoded faucet package
   */
  fetchPayload(address: string): Promise<string> {
    invariant(this.url, 'No faucet URL');
    return FaucetAPI.collect(this.url, address).then((data) => data.faucetPackage);
  }

  /**
   * Parses a faucet package.
   *
   */
  parseFaucetPackage(faucetPackage: string): FaucetPackage {
    try {
      const jsonFaucetPackage = JSON.parse(Buffer.from(faucetPackage, 'base64').toString());
      return { payload: jsonFaucetPackage.faucetPayload, signature: jsonFaucetPackage.signature };
    } catch (e) {
      throw new Error('Invalid faucet package');
    }
  }
}
