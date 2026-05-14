import { CENSUS3_URL, QUEUE_WAIT_OPTIONS } from './util/constants';
import { ClientOptions } from './client';
import {
  Census3CensusAPI,
  Census3ServiceAPI,
  Census3StrategyAPI,
  Census3TokenAPI,
  ICensus3CensusResponse,
  ICensus3SupportedChain,
  Census3Token,
  Census3Strategy,
  Census3CreateStrategyToken,
  ICensus3ValidatePredicateResponse,
  ICensus3StrategiesOperator,
  Census3SummaryToken,
  ErrNoTokenHolderFound,
} from './api';
import invariant from 'tiny-invariant';
import { isAddress } from '@ethersproject/address';
import { TokenCensus, StrategyCensus } from './types';
import { delay } from './util/common';

export type Token = Omit<Census3Token, 'tags'> & { tags: string[] };
export type TokenSummary = Omit<Census3SummaryToken, 'tags'> & { tags: string[] };
export type Strategy = Census3Strategy;
export type StrategyHolder = { holder: string; weight: bigint };
export type StrategyHolders = StrategyHolder[];
export type StrategyToken = Census3CreateStrategyToken;
export type Census3Census = ICensus3CensusResponse;
export type SupportedChain = ICensus3SupportedChain;
export type SupportedOperator = ICensus3StrategiesOperator;
export type ParsedPredicate = ICensus3ValidatePredicateResponse;

export class VocdoniCensus3Client {
  public url: string;
  public queueWait: { retryTime: number; attempts: number };

  /**
   * Instantiate new VocdoniCensus3 client.
   *
   * To instantiate the client just pass the `ClientOptions` you want or use an empty object for the defaults.
   *
   * `const client = new VocdoniCensus3Client({EnvOptions.PROD})`
   *
   * @param opts - optional arguments
   */
  constructor(opts: ClientOptions) {
    this.url = opts.api_url ?? CENSUS3_URL[opts.env];
    this.queueWait = {
      retryTime: opts.tx_wait?.retry_time ?? QUEUE_WAIT_OPTIONS.retry_time,
      attempts: opts.tx_wait?.attempts ?? QUEUE_WAIT_OPTIONS.attempts,
    };
  }

  /**
   * Returns a list of summary tokens supported by the service
   *
   * @returns Token summary list
   */
  getSupportedTokens(): Promise<TokenSummary[]> {
    return Census3TokenAPI.list(this.url, { pageSize: -1 }).then(
      (list) =>
        list?.tokens?.map((token) => ({
          ...token,
          tags: token.tags?.split(',') ?? [],
        })) ?? []
    );
  }

  /**
   * Returns a list of supported chain identifiers
   *
   * @returns Supported chain list
   */
  getSupportedChains(): Promise<SupportedChain[]> {
    return Census3ServiceAPI.info(this.url).then((info) => info.supportedChains ?? []);
  }

  /**
   * Returns a list of supported tokens type
   *
   * @returns Supported tokens type list
   */
  getSupportedTypes(): Promise<string[]> {
    return Census3TokenAPI.types(this.url).then((types) => types.supportedTypes ?? []);
  }

  /**
   * Returns a list of supported strategies operators
   *
   * @returns Supported strategies operators list
   */
  getSupportedOperators(): Promise<SupportedOperator[]> {
    return Census3StrategyAPI.operators(this.url).then((operators) => operators.operators ?? []);
  }

  /**
   * Returns the full token information based on the id (address)
   *
   * @param id - The id (address) of the token
   * @param chainId - The id of the chain
   * @param externalId - The identifier used by external provider
   * @returns The token information
   */
  getToken(id: string, chainId: number, externalId?: string): Promise<Token> {
    invariant(id, 'No token id');
    invariant(chainId, 'No chain id');
    return Census3TokenAPI.token(this.url, id, chainId, externalId).then((token) => ({
      ...token,
      tags: token.tags?.split(',') ?? [],
    }));
  }

  /**
   * Returns if the holder ID is already registered in the database as a holder of the token.
   *
   * @param tokenId - The id (address) of the token
   * @param chainId - The id of the chain
   * @param holderId - The identifier of the holder
   * @param externalId - The identifier used by external provider
   * @returns If the holder is in the token
   */
  isHolderInToken(tokenId: string, chainId: number, holderId: string, externalId?: string): Promise<boolean> {
    invariant(tokenId, 'No token id');
    invariant(holderId, 'No holder id');
    invariant(chainId, 'No chain id');
    return Census3TokenAPI.holder(this.url, tokenId, chainId, holderId, externalId)
      .then(() => true)
      .catch((error) => {
        if (error instanceof ErrNoTokenHolderFound) return false;
        throw error;
      });
  }

  /**
   * Returns the balance of the holder based on the token and chain
   *
   * @param tokenId - The id (address) of the token
   * @param chainId - The id of the chain
   * @param holderId - The identifier of the holder
   * @param externalId - The identifier used by external provider
   * @returns The balance of the holder
   */
  tokenHolderBalance(tokenId: string, chainId: number, holderId: string, externalId?: string): Promise<bigint> {
    invariant(tokenId, 'No token id');
    invariant(holderId, 'No holder id');
    invariant(chainId, 'No chain id');
    return Census3TokenAPI.holder(this.url, tokenId, chainId, holderId, externalId).then((response) =>
      BigInt(response.balance)
    );
  }

  /**
   * Creates a new token to be tracked in the service
   *
   * @param address - The address of the token
   * @param type - The type of the token
   * @param chainId - The chain id of the token
   * @param externalId - The identifier used by external provider
   * @param tags - The tag list to associate the token with
   */
  createToken(
    address: string,
    type: string,
    chainId: number = 1,
    externalId: string = '',
    tags: string[] = []
  ): Promise<void> {
    invariant(address, 'No token address');
    invariant(type, 'No token type');
    invariant(isAddress(address), 'Incorrect token address');
    return Census3TokenAPI.create(this.url, address, type, chainId, tags?.join(), externalId);
  }

  /**
   * Returns the strategies
   *
   * @returns The list of strategies
   */
  getStrategies(): Promise<Census3Strategy[]> {
    return Census3StrategyAPI.list(this.url, { pageSize: -1 }).then((strategies) => strategies.strategies ?? []);
  }

  /**
   * Returns the strategy holders
   *
   * @param id - The id of the strategy
   * @returns The list strategy holders
   */
  getStrategyHolders(id: number): Promise<StrategyHolders> {
    invariant(id, 'No id set');
    const waitForQueue = (queueId: string, wait?: number, attempts?: number): Promise<StrategyHolders> => {
      const waitTime = wait ?? this.queueWait?.retryTime;
      const attemptsNum = attempts ?? this.queueWait?.attempts;
      invariant(waitTime, 'No queue wait time set');
      invariant(attemptsNum >= 0, 'No queue attempts set');

      return attemptsNum === 0
        ? Promise.reject('Time out waiting for queue with id: ' + queueId)
        : Census3StrategyAPI.holdersQueue(this.url, id, queueId).then((queue) => {
            switch (true) {
              case queue.done && queue.error?.code?.toString().length > 0:
                return Promise.reject(new Error('Could not get the strategy holders'));
              case queue.done:
                return Promise.resolve(
                  Object.entries(queue.data).map(([key, value]) => ({ holder: key, weight: BigInt(value) })) ?? []
                );
              default:
                return delay(waitTime).then(() => waitForQueue(queueId, waitTime, attemptsNum - 1));
            }
          });
    };

    return Census3StrategyAPI.holders(this.url, id)
      .then((queueResponse) => queueResponse.queueID)
      .then((queueId) => waitForQueue(queueId));
  }

  /**
   * Returns the strategies from the given token
   *
   * @param id - The id (address) of the token
   * @param chainId - The id of the chain
   * @param externalId - The identifier used by external provider
   * @returns The list of strategies
   */
  getStrategiesByToken(id: string, chainId: number, externalId?: string): Promise<Census3Strategy[]> {
    invariant(id, 'No token id');
    invariant(chainId, 'No chain id');
    return Census3StrategyAPI.listByToken(this.url, id, chainId, externalId).then(
      (strategies) => strategies.strategies
    );
  }

  /**
   * Returns the information of the strategy based on the id
   *
   * @param id - The id of the strategy
   * @returns The strategy information
   */
  getStrategy(id: number): Promise<Strategy> {
    invariant(id || id >= 0, 'No strategy id');
    return Census3StrategyAPI.strategy(this.url, id);
  }

  /**
   * Returns the estimation of size and time (in milliseconds) to create the census generated for the provided strategy
   *
   * @param id - The id of the strategy
   * @param anonymous - If the estimation should be done for anonymous census
   * @returns The strategy estimation
   */
  getStrategyEstimation(
    id: number,
    anonymous: boolean = false
  ): Promise<{ size: number; timeToCreateCensus: number; accuracy: number }> {
    invariant(id || id >= 0, 'No strategy id');
    return this.getStrategy(id).then((strategy) =>
      this.getPredicateEstimation(strategy.predicate, strategy.tokens, anonymous)
    );
  }

  /**
   * Returns the estimation of size and time (in milliseconds) to create the census generated for the provided predicate and tokens
   *
   * @param predicate - The predicate of the strategy
   * @param tokens - The token list for the strategy
   * @param anonymous - If the estimation should be done for anonymous census
   * @returns The predicate estimation
   */
  getPredicateEstimation(
    predicate: string,
    tokens: { [key: string]: StrategyToken },
    anonymous: boolean = false
  ): Promise<{ size: number; timeToCreateCensus: number; accuracy: number }> {
    invariant(predicate, 'No predicate set');
    invariant(tokens, 'No tokens set');
    const waitForQueue = (
      queueId: string,
      wait?: number,
      attempts?: number
    ): Promise<{ size: number; timeToCreateCensus: number; accuracy: number }> => {
      const waitTime = wait ?? this.queueWait?.retryTime;
      const attemptsNum = attempts ?? this.queueWait?.attempts;
      invariant(waitTime, 'No queue wait time set');
      invariant(attemptsNum >= 0, 'No queue attempts set');

      return attemptsNum === 0
        ? Promise.reject('Time out waiting for queue with id: ' + queueId)
        : Census3StrategyAPI.estimationQueue(this.url, queueId).then((queue) => {
            switch (true) {
              case queue.done && queue.error?.code?.toString().length > 0:
                return Promise.reject(new Error('Could not create the census'));
              case queue.done:
                return Promise.resolve(queue.data);
              default:
                return delay(waitTime).then(() => waitForQueue(queueId, waitTime, attemptsNum - 1));
            }
          });
    };

    return Census3StrategyAPI.estimation(this.url, predicate, tokens, anonymous)
      .then((queueResponse) => queueResponse.queueID)
      .then((queueId) => waitForQueue(queueId));
  }

  /**
   * Creates a new strategy based on the given tokens and predicate
   *
   * @param alias - The alias of the strategy
   * @param predicate - The predicate of the strategy
   * @param tokens - The token list for the strategy
   * @returns The strategy id
   */
  createStrategy(alias: string, predicate: string, tokens: { [key: string]: StrategyToken }): Promise<number> {
    invariant(alias, 'No alias set');
    invariant(predicate, 'No predicate set');
    invariant(tokens, 'No tokens set');
    return Census3StrategyAPI.create(this.url, alias, predicate, tokens).then(
      (createStrategy) => createStrategy.strategyID
    );
  }

  /**
   * Imports a strategy from IPFS from the given cid.
   *
   * @param cid - The IPFS cid of the strategy to import
   * @returns The strategy information
   */
  importStrategy(cid: string): Promise<Strategy> {
    invariant(cid, 'No CID set');

    const waitForQueue = (queueId: string, wait?: number, attempts?: number): Promise<Strategy> => {
      const waitTime = wait ?? this.queueWait?.retryTime;
      const attemptsNum = attempts ?? this.queueWait?.attempts;
      invariant(waitTime, 'No queue wait time set');
      invariant(attemptsNum >= 0, 'No queue attempts set');

      return attemptsNum === 0
        ? Promise.reject('Time out waiting for queue with id: ' + queueId)
        : Census3StrategyAPI.importQueue(this.url, queueId).then((queue) => {
            switch (true) {
              case queue.done && queue.error?.code?.toString().length > 0:
                return Promise.reject(new Error('Could not import the strategy'));
              case queue.done:
                return Promise.resolve(queue.data);
              default:
                return delay(waitTime).then(() => waitForQueue(queueId, waitTime, attemptsNum - 1));
            }
          });
    };

    return Census3StrategyAPI.import(this.url, cid)
      .then((importStrategy) => importStrategy.queueID)
      .then((queueId) => waitForQueue(queueId));
  }

  /**
   * Validates a predicate
   *
   * @param predicate - The predicate of the strategy
   * @returns The parsed predicate
   */
  validatePredicate(predicate: string): Promise<ParsedPredicate> {
    invariant(predicate, 'No predicate set');
    return Census3StrategyAPI.validatePredicate(this.url, predicate).then((validatePredicate) => validatePredicate);
  }

  /**
   * Returns the census3 censuses
   *
   * @param strategyId - The strategy identifier
   * @returns The list of census3 censuses
   */
  getCensuses(strategyId: number): Promise<Census3Census[]> {
    invariant(strategyId, 'No strategy set');
    return Census3CensusAPI.list(this.url, strategyId).then((response) => response.censuses);
  }

  /**
   * Returns the census3 census based on the given identifier
   *
   * @param id - The id of the census
   * @returns The census3 census
   */
  getCensus(id: number): Promise<Census3Census> {
    invariant(id || id >= 0, 'No census id');
    return Census3CensusAPI.census(this.url, id);
  }

  /**
   * Creates the census based on the given strategy
   *
   * @param strategyId - The id of the strategy
   * @param anonymous - If the census has to be anonymous
   * @returns The census information
   */
  createCensus(strategyId: number, anonymous: boolean = false): Promise<Census3Census> {
    invariant(strategyId || strategyId >= 0, 'No strategy id');

    const waitForQueue = (queueId: string, wait?: number, attempts?: number): Promise<Census3Census> => {
      const waitTime = wait ?? this.queueWait?.retryTime;
      const attemptsNum = attempts ?? this.queueWait?.attempts;
      invariant(waitTime, 'No queue wait time set');
      invariant(attemptsNum >= 0, 'No queue attempts set');

      return attemptsNum === 0
        ? Promise.reject('Time out waiting for queue with id: ' + queueId)
        : Census3CensusAPI.queue(this.url, queueId).then((queue) => {
            switch (true) {
              case queue.done && queue.error?.code?.toString().length > 0:
                return Promise.reject(new Error('Could not create the census'));
              case queue.done:
                return Promise.resolve(queue.data);
              default:
                return delay(waitTime).then(() => waitForQueue(queueId, waitTime, attemptsNum - 1));
            }
          });
    };

    return Census3CensusAPI.create(this.url, strategyId, anonymous)
      .then((createCensus) => createCensus.queueID)
      .then((queueId) => waitForQueue(queueId));
  }

  /**
   * Returns the actual census based on the given token using the default strategy set
   *
   * @param address - The address of the token
   * @param chainId - The id of the chain
   * @param anonymous - If the census has to be anonymous
   * @param externalId - The identifier used by external provider
   * @returns The token census
   */
  async createTokenCensus(
    address: string,
    chainId: number,
    anonymous: boolean = false,
    externalId?: string
  ): Promise<TokenCensus> {
    const token = await this.getToken(address, chainId, externalId);
    if (!token.status.synced) {
      return Promise.reject('Token is not yet synced.');
    }

    return this.createCensus(token.defaultStrategy, anonymous).then(
      (census) => new TokenCensus(census.merkleRoot, census.uri, anonymous, token, census.size, BigInt(census.weight))
    );
  }

  /**
   * Returns the actual census based on the given strategy id
   *
   * @param strategyId - The strategy id
   * @param anonymous - If the census has to be anonymous
   * @returns The strategy census
   */
  async createStrategyCensus(strategyId: number, anonymous: boolean = false): Promise<StrategyCensus> {
    const strategy = await this.getStrategy(strategyId);

    return this.createCensus(strategyId, anonymous).then(
      (census) =>
        new StrategyCensus(census.merkleRoot, census.uri, anonymous, strategy, census.size, BigInt(census.weight))
    );
  }
}
