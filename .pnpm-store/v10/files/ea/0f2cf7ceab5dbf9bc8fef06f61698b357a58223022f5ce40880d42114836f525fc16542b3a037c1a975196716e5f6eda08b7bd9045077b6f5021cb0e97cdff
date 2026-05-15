import axios from 'axios';
import { Census3API, Census3Pagination, ICensus3QueueResponse } from './api';

enum Census3StrategyAPIMethods {
  LIST = '/strategies',
  LIST_BY_TOKEN = '/strategies/token/{tokenID}?chainID={chainID}',
  CREATE = '/strategies',
  IMPORT = '/strategies/import/{cid}',
  IMPORT_QUEUE = '/strategies/import/queue/{queueId}',
  STRATEGY = '/strategies/{id}',
  ESTIMATION = '/strategies/estimation',
  ESTIMATION_QUEUE = '/strategies/estimation/queue/{queueId}',
  VALIDATE_PREDICATE = '/strategies/predicate/validate',
  OPERATORS = '/strategies/predicate/operators',
  HOLDERS = '/strategies/{id}/holders',
  HOLDERS_QUEUE = '/strategies/{id}/holders/queue/{queueId}',
}

export interface ICensus3StrategiesListResponse {
  /**
   * The list of the strategies identifiers
   */
  strategies: Array<Census3Strategy>;
}

export interface ICensus3StrategiesListResponsePaginated extends ICensus3StrategiesListResponse {
  /**
   * The pagination information
   */
  pagination: Census3Pagination;
}

export type Census3Strategy = {
  /**
   * The strategy identifier
   */
  ID: number;

  /**
   * The strategy alias
   */
  alias: string;

  /**
   * The strategy predicate
   */
  predicate: string;

  /**
   * The URI of the strategy
   */
  uri: string;

  /**
   * The list of tokens
   */
  tokens: { [key: string]: Census3StrategyToken };
};

export type Census3StrategyToken = {
  /**
   * The id (address) of the token.
   */
  ID: string;

  /**
   * The chain id of the token.
   */
  chainID: number;

  /**
   * The chain address of the token.
   */
  chainAddress: string;

  /**
   * The external identifier of the token.
   */
  externalID?: string;

  /**
   * The minimum balance for the strategy.
   */
  minBalance?: string;

  /**
   * The token icon URI.
   */
  iconURI?: string;
};

export type Census3CreateStrategyToken = Omit<Census3StrategyToken, 'chainAddress'>;

export interface ICensus3StrategyEstimationQueueResponse {
  /**
   * If the queue has been done
   */
  done: boolean;

  /**
   * The error of the queue
   */
  error: {
    /**
     * The code of the error
     */
    code: number;

    /**
     * The string of the error
     */
    error: string;
  };

  /**
   * The estimation data of the strategy
   */
  data: {
    /**
     * The estimation of the size
     */
    size: number;

    /**
     * The estimation of the time to create the census
     */
    timeToCreateCensus: number;

    /**
     * The accuracy for an anonymous census
     */
    accuracy: number;
  };

  /**
   * The estimation progress
   */
  progress: number;
}

export interface ICensus3StrategyImportQueueResponse {
  /**
   * If the queue has been done
   */
  done: boolean;

  /**
   * The error of the queue
   */
  error: {
    /**
     * The code of the error
     */
    code: number;

    /**
     * The string of the error
     */
    error: string;
  };

  /**
   * The imported data strategy
   */
  data: Census3Strategy;

  /**
   * The importing progress
   */
  progress: number;
}

export interface ICensus3StrategyHoldersQueueResponse {
  /**
   * If the queue has been done
   */
  done: boolean;

  /**
   * The error of the queue
   */
  error: {
    /**
     * The code of the error
     */
    code: number;

    /**
     * The string of the error
     */
    error: string;
  };

  /**
   * The list of the strategy holders
   */
  data: { [key: string]: string };

  /**
   * The importing progress
   */
  progress: number;
}

export interface ICensus3StrategyToken {
  /**
   * The id (address) of the token.
   */
  id: string;

  /**
   * The name of the token.
   */
  name: string;

  /**
   * The minimum balance.
   */
  minBalance: string;

  /**
   * The method used for checking balances.
   */
  method: string;
}

export interface ICensus3StrategyCreateResponse {
  /**
   * The identifier of the created strategy
   */
  strategyID: number;
}

export interface ICensus3ValidatePredicateToken {
  /**
   * The literal of the predicate
   */
  literal: string;
}

export interface ICensus3ValidatePredicateChild {
  /**
   * The operator used in the predicate
   */
  operator: string;

  /**
   * The list of tokens of the predicate
   */
  tokens: Array<ICensus3ValidatePredicateToken | ICensus3ValidatePredicateChild>;
}

export interface ICensus3StrategiesOperator {
  /**
   * The description of the operator
   */
  description: string;

  /**
   * The tag of the operator
   */
  tag: string;
}

export interface ICensus3StrategiesOperatorsResponse {
  /**
   * The list of supported operators
   */
  operators: Array<ICensus3StrategiesOperator>;
}

export interface ICensus3ValidatePredicateResponse {
  /**
   * The parsed version of the predicate
   */
  result: {
    /**
     * The childs of the predicate
     */
    childs: ICensus3ValidatePredicateChild;
  };
}

export abstract class Census3StrategyAPI extends Census3API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Fetches list of strategies
   *
   * @param url - API endpoint URL
   * @param pagination - Pagination options
   */
  public static list(url: string, pagination?: Census3Pagination): Promise<ICensus3StrategiesListResponsePaginated> {
    return axios
      .get<ICensus3StrategiesListResponsePaginated>(
        url + Census3StrategyAPIMethods.LIST + this.serializePagination(pagination)
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches list of holders by strategy
   *
   * @param url - API endpoint URL
   * @param id - The identifier of the strategy
   * @returns The queue identifier
   */
  public static holders(url: string, id: number): Promise<ICensus3QueueResponse> {
    return axios
      .get<ICensus3QueueResponse>(url + Census3StrategyAPIMethods.HOLDERS.replace('{id}', String(id)))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the information of the strategy holders queue
   *
   * @param url - API endpoint URL
   * @param id - The identifier of the strategy
   * @param queueId - The identifier of the strategy holders queue
   */
  public static holdersQueue(url: string, id: number, queueId: string): Promise<ICensus3StrategyHoldersQueueResponse> {
    return axios
      .get<ICensus3StrategyHoldersQueueResponse>(
        url + Census3StrategyAPIMethods.HOLDERS_QUEUE.replace('{id}', String(id)).replace('{queueId}', queueId)
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches list of strategies based on given token
   *
   * @param url - API endpoint URL
   * @param tokenId - The identifier of the token
   * @param chainId - The chain identifier of the token
   * @param externalId - The identifier used by external provider
   */
  public static listByToken(
    url: string,
    tokenId: string,
    chainId: number,
    externalId?: string
  ): Promise<ICensus3StrategiesListResponse> {
    return axios
      .get<ICensus3StrategiesListResponse>(
        url +
          Census3StrategyAPIMethods.LIST_BY_TOKEN.replace('{tokenID}', tokenId).replace('{chainID}', String(chainId)) +
          (externalId ? '&externalID=' + externalId : '')
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the information of the strategy
   *
   * @param url - API endpoint URL
   * @param id - The identifier of the strategy
   */
  public static strategy(url: string, id: number): Promise<Census3Strategy> {
    return axios
      .get<Census3Strategy>(url + Census3StrategyAPIMethods.STRATEGY.replace('{id}', String(id)))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the estimation of size and time (in milliseconds) to create the census generated for the provided strategy
   *
   * @param url - API endpoint URL
   * @param predicate - The predicate of the strategy
   * @param tokens - The token list for the strategy
   * @param anonymous - If the estimation should be done for anonymous census
   * @returns The queue identifier
   */
  public static estimation(
    url: string,
    predicate: string,
    tokens: { [key: string]: Census3CreateStrategyToken },
    anonymous: boolean = false
  ): Promise<ICensus3QueueResponse> {
    return axios
      .post<ICensus3QueueResponse>(url + Census3StrategyAPIMethods.ESTIMATION + '?anonymous=' + String(anonymous), {
        predicate,
        tokens,
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the information of the strategy estimation queue
   *
   * @param url - API endpoint URL
   * @param queueId - The identifier of the strategy estimation queue
   */
  public static estimationQueue(url: string, queueId: string): Promise<ICensus3StrategyEstimationQueueResponse> {
    return axios
      .get<ICensus3StrategyEstimationQueueResponse>(
        url + Census3StrategyAPIMethods.ESTIMATION_QUEUE.replace('{queueId}', queueId)
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the information of the strategy import queue
   *
   * @param url - API endpoint URL
   * @param queueId - The identifier of the strategy import queue
   */
  public static importQueue(url: string, queueId: string): Promise<ICensus3StrategyImportQueueResponse> {
    return axios
      .get<ICensus3StrategyImportQueueResponse>(
        url + Census3StrategyAPIMethods.IMPORT_QUEUE.replace('{queueId}', queueId)
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Imports a strategy from IPFS from the given cid.
   *
   * @param url - API endpoint URL
   * @param cid - The cid of the IPFS where the strategy is stored
   * @returns The queue identifier
   */
  public static import(url: string, cid: string): Promise<ICensus3QueueResponse> {
    return axios
      .post<ICensus3QueueResponse>(url + Census3StrategyAPIMethods.IMPORT.replace('{cid}', cid))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Creates a new strategy based on the given token strategies and predicate.
   *
   * @param url - API endpoint URL
   * @param alias - The alias of the strategy
   * @param predicate - The predicate of the strategy
   * @param tokens - The token list for the strategy
   * @returns The identifier of the created strategy
   */
  public static create(
    url: string,
    alias: string,
    predicate: string,
    tokens: { [key: string]: Census3CreateStrategyToken }
  ): Promise<ICensus3StrategyCreateResponse> {
    return axios
      .post<ICensus3StrategyCreateResponse>(url + Census3StrategyAPIMethods.CREATE, { alias, predicate, tokens })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Validates a predicate.
   *
   * @param url - API endpoint URL
   * @param predicate - The predicate of the strategy
   * @returns Parsed version of the predicate
   */
  public static validatePredicate(url: string, predicate: string): Promise<ICensus3ValidatePredicateResponse> {
    return axios
      .post<ICensus3ValidatePredicateResponse>(url + Census3StrategyAPIMethods.VALIDATE_PREDICATE, { predicate })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of supported operators to build strategy predicates.
   *
   * @param url - API endpoint URL
   */
  public static operators(url: string): Promise<ICensus3StrategiesOperatorsResponse> {
    return axios
      .get<ICensus3StrategiesOperatorsResponse>(url + Census3StrategyAPIMethods.OPERATORS)
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
