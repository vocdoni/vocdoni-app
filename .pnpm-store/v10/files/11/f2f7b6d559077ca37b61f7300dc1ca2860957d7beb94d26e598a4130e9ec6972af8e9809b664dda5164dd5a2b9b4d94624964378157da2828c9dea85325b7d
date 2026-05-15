import { Service, ServiceProperties } from './service';
import { ChainAPI, IChainGetCostsResponse, PaginationRequest, Tx } from '../api';
import invariant from 'tiny-invariant';
import { delay } from '../util/common';

interface ChainServiceProperties {
  chainCosts: ChainCosts;
  chainData: ChainData;
  txWait: TxWaitOptions;
}

type ChainServiceParameters = ServiceProperties & ChainServiceProperties;

export type ChainCosts = IChainGetCostsResponse;
export type ChainTx = Tx;

export type FetchOrganizationParametersWithPagination = FetchOrganizationParameters & PaginationRequest;
export type FetchFeesParametersWithPagination = FetchFeesParameters & PaginationRequest;
export type FetchTransactionsParametersWithPagination = FetchTransactionsParameters & PaginationRequest;
export type FetchTransfersParametersWithPagination = FetchTransfersParameters & PaginationRequest;
export type FetchBlocksParametersWithPagination = FetchBlocksParameters & PaginationRequest;

export interface FetchOrganizationParameters {
  organizationId: string;
}

export interface FetchFeesParameters {
  reference: string;
  type: string;
  accountId: string;
}

export interface FetchTransfersParameters {
  accountId: string;
  accountIdFrom: string;
  accountIdTo: string;
}

export interface FetchTransactionsParameters {
  hash: string;
  height: number;
  index: number;
  type: string;
  subtype: string;
  signer: string;
}

export interface FetchBlocksParameters {
  hash: string;
  chainId: string;
  proposerAddress: string;
}

/**
 * Specify custom retry times and attempts when waiting for a transaction.
 *
 * @typedef TxWaitOptions
 * @property {number} retryTime
 * @property {number} attempts
 */
export type TxWaitOptions = {
  retryTime: number;
  attempts: number;
};

export type ChainData = {
  chainId: string;
  blockTime: number[];
  height: number;
  blockTimestamp: number;
  maxCensusSize: number;
};

export class ChainService extends Service implements ChainServiceProperties {
  public chainCosts: ChainCosts;
  public chainData: ChainData;
  public txWait: TxWaitOptions;

  /**
   * Instantiate the chain service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<ChainServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  /**
   * Fetches blockchain information if needed.
   *
   */
  fetchChainData(): Promise<ChainData> {
    if (this.chainData) {
      return Promise.resolve(this.chainData);
    }
    invariant(this.url, 'No URL set');

    return ChainAPI.info(this.url).then((chainData) => {
      this.chainData = chainData;
      return chainData;
    });
  }

  /**
   * Fetches blockchain costs information if needed.
   *
   */
  fetchChainCosts(): Promise<ChainCosts> {
    if (this.chainCosts) {
      return Promise.resolve(this.chainCosts);
    }
    invariant(this.url, 'No URL set');

    return ChainAPI.costs(this.url).then((chainCosts) => {
      this.chainCosts = chainCosts;
      return chainCosts;
    });
  }

  /**
   * Submits a transaction to the blockchain
   *
   * @param payload - The transaction data payload
   * @returns The transaction hash
   */
  submitTx(payload: string): Promise<string> {
    invariant(this.url, 'No URL set');
    return ChainAPI.submitTx(this.url, payload).then((txData) => txData.hash);
  }

  /**
   * Fetches information about a transaction from the blockchain.
   *
   * @param txHash - The transaction hash which we want to retrieve the info from
   * @returns The chain transaction
   */
  txInfo(txHash: string): Promise<ChainTx> {
    invariant(this.url, 'No URL set');
    return ChainAPI.txInfo(this.url, txHash);
  }

  /**
   * Returns the block number for a given date.
   *
   * @param date - The date which we want to retrieve the block number from
   * @returns The block number
   */
  dateToBlock(date: Date): Promise<number> {
    invariant(this.url, 'No URL set');
    return ChainAPI.dateToBlock(this.url, Math.floor(date.getTime() / 1000)).then((response) => response.height);
  }

  /**
   * A convenience method to wait for a transaction to be executed. It will
   * loop trying to get the transaction information, and will retry every time
   * it fails.
   *
   * @param tx - Transaction to wait for
   * @param wait - The delay in milliseconds between tries
   * @param attempts - The attempts to try before failing
   */
  waitForTransaction(tx: string, wait?: number, attempts?: number): Promise<void> {
    const waitTime = wait ?? this.txWait?.retryTime;
    const attemptsNum = attempts ?? this.txWait?.attempts;
    invariant(waitTime, 'No transaction wait time set');
    invariant(attemptsNum >= 0, 'No transaction attempts set');

    return attemptsNum === 0
      ? Promise.reject('Time out waiting for transaction: ' + tx)
      : this.txInfo(tx)
          .then(() => Promise.resolve())
          .catch(() => delay(waitTime).then(() => this.waitForTransaction(tx, waitTime, attemptsNum - 1)));
  }
}
