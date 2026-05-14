import axios from 'axios';
import { API, PaginationResponse } from './api';
import { ErrTransactionNotFound } from './errors';
import {
  FetchBlocksParametersWithPagination,
  FetchFeesParametersWithPagination,
  FetchOrganizationParametersWithPagination,
  FetchTransactionsParametersWithPagination,
  FetchTransfersParametersWithPagination,
} from '../services';
import { Tx } from './chain';
export * from './chain/';

enum ChainAPIMethods {
  INFO = '/chain/info',
  COSTS = '/chain/info/electionPriceFactors',
  CIRCUITS = '/chain/info/circuit',
  TX_COSTS = '/chain/transactions/cost',
  TX_INFO = '/chain/transactions/{txHash}',
  TX_LIST = '/chain/transactions',
  SUBMIT_TX = '/chain/transactions',
  ORGANIZATION_LIST = '/chain/organizations',
  VALIDATORS_LIST = '/chain/validators',
  BLOCK_INFO_HASH = '/chain/blocks/hash/{blockHash}',
  BLOCK_INFO_HEIGHT = '/chain/blocks/{blockHeight}',
  BLOCK_LIST = '/chain/blocks',
  DATE_TO_BLOCK = '/chain/dateToBlock/{timestamp}',
  BLOCK_TO_DATE = '/chain/blockToDate/{height}',
  FEES_LIST = '/chain/fees',
  TRANSFERS = '/chain/transfers',
}

export interface IChainGetInfoResponse {
  /**
   * The id of the current chain
   */
  chainId: string;

  /**
   * The different block times from the chain.
   */
  blockTime: number[];

  /**
   * The number of elections existing on the Vochain.
   */
  electionCount: number;

  /**
   * The number of organizations existing on the Vochain.
   */
  organizationCount: number;

  /**
   * The time of the genesis block.
   */
  genesisTime: string;

  /**
   * The height or actual block of the current chain.
   */
  height: number;

  /**
   * Whether the blockchain is syncing.
   */
  syncing: boolean;

  /**
   * The timestamp of the actual block.
   */
  blockTimestamp: number;

  /**
   * The number of transactions.
   */
  transactionCount: number;

  /**
   * The number of validators.
   */
  validatorCount: number;

  /**
   * The number of votes.
   */
  voteCount: number;

  /**
   * The circuit configuration tag.
   */
  circuitConfigurationTag: string;

  /**
   * The maximum size of a census.
   */
  maxCensusSize: number;
}

export interface IChainGetCostsResponse {
  /**
   * The base price.
   */
  basePrice: number;

  /**
   * The capacity of the chain.
   */
  capacity: number;

  /**
   * The factors.
   */
  factors: {
    k1: number;
    k2: number;
    k3: number;
    k4: number;
    k5: number;
    k6: number;
    k7: number;
  };
}

export interface IChainGetCircuitResponse {
  /**
   * The base uri of the files.
   */
  uri: string;

  /**
   * The path of the circuit.
   */
  circuitPath: string;

  /**
   * The circuit levels.
   */
  levels: number;

  /**
   * The hash of the proving key file.
   */
  zKeyHash: string;

  /**
   * The name of the proving key file.
   */
  zKeyFilename: string;

  /**
   * The hash of the verification key file.
   */
  vKeyHash: string;

  /**
   * The name of the verification key file.
   */
  vKeyFilename: string;

  /**
   * The hash of the WASM file.
   */
  wasmHash: string;

  /**
   * The name of the WASM file.
   */
  wasmFilename: string;
}

export enum TransactionType {
  VOTE_ENVELOPE = 'vote',
  NEW_PROCESS_TX = 'newProcess',
  ADMIN_TX = 'admin',
  SET_PROCESS_TX = 'setProcess',
  REGISTER_KEY_TX = 'registerKey',
  MINT_TOKENS_TX = 'mintTokens',
  SEND_TOKENS_TX = 'sendTokens',
  SET_TRANSACTION_COSTS_TX = 'setTransactionCosts',
  SET_ACCOUNT_TX = 'setAccount',
  COLLECT_FAUCET_TX = 'collectFaucet',
  SET_KEYKEEPER_TX = 'setKeykeeper',
}

export interface IChainTxCosts {
  costs: {
    AddDelegateForAccount: number;
    CollectFaucet: number;
    CreateAccount: number;
    DelAccountSIK: number;
    DelDelegateForAccount: number;
    NewProcess: number;
    RegisterKey: number;
    SendTokens: number;
    SetAccountInfoURI: number;
    SetAccountSIK: number;
    SetAccountValidator: number;
    SetProcessCensus: number;
    SetProcessDuration: number;
    SetProcessQuestionIndex: number;
    SetProcessStatus: number;
  };
}

export interface IChainTxReference {
  /**
   * The hash of the transaction.
   */
  hash: string;

  /**
   * The number of the block where the transaction is.
   */
  height: number;

  /**
   * The index of the transaction inside the block.
   */
  index: number;

  /**
   * The type of the transaction.
   */
  type: TransactionType;

  /**
   * The subtype of the transaction.
   */
  subtype: string;

  /**
   * The signer of the transaction.
   */
  signer: string;
}

export interface IChainSubmitTxResponse {
  /**
   * The hash of the transaction
   */
  hash: string;

  /**
   * The response data (can vary depending on the transaction type)
   */
  response: string;

  /**
   * The response code
   */
  code: number;
}

export interface IChainTxListResponse extends IChainTxList, PaginationResponse {}

export interface IChainTxList {
  /**
   * List of transactions
   */
  transactions: Array<IChainTxReference>;
}

export interface IChainBlocksListResponse extends IChainBlocksList, PaginationResponse {}

export interface IChainBlocksList {
  /**
   * List of blocks
   */
  blocks: Array<IBlock>;
}

export interface IBlock {
  chainId: string;
  height: number;
  time: string;
  hash: string;
  proposer: string;
  lastBlockHash: string;
  txCount: number;
}

export interface IChainTransfersListResponse extends IChainTransfersList, PaginationResponse {}

export interface IChainTransfersList {
  /**
   * List of transfers
   */
  transfers: Array<ITransfer>;
}

export interface ITransfer {
  amount: number;
  from: string;
  height: number;
  txHash: string;
  timestamp: string;
  to: string;
}

export interface IChainOrganizationResponse {
  /**
   * The identifier of the organization
   */
  organizationID: string;

  /**
   * The number of elections
   */
  electionCount: number;
}

export interface IChainOrganizationListResponse extends OrganizationList, PaginationResponse {}

export interface OrganizationList {
  /**
   * The list of organizations
   */
  organizations: Array<IChainOrganizationResponse>;
}

interface BlockID {
  hash: string;
  parts: {
    total: number;
    hash: string;
  };
}

export interface IChainBlockInfoResponse {
  hash: string;
  header: {
    appHash: string;
    chainId: string;
    consensusHash: string;
    dataHash: string;
    evidenceHash: string;
    height: number;
    lastBlockId: BlockID;
    lastCommitHash: string;
    lastResultsHash: string;
    nextValidatorsHash: string;
    proposerAddress: string;
    time: string;
    validatorsHash: string;
    version: {
      block: number;
      app: number;
    };
  };
  txCount: number;
}

interface IDateToBlockResponse {
  height: number;
}

interface IBlockToDateResponse {
  date: string;
}

export interface IChainValidator {
  /**
   * Current power of the validator
   */
  power: number;

  /**
   * Validator public key
   */
  pubKey: string;

  /**
   * Validator address
   */
  address: string;

  /**
   * Validator name reference. Could be empty.
   */
  name: string;

  /**
   * Block height when validator joint
   */
  joinHeight: number;

  /**
   * Total block proposals count
   */
  proposals: number;

  /**
   * Validatos effectivity. Between 0 and 100
   */
  score: number;

  /**
   * Validator address
   */
  validatorAddress: string;

  /**
   * Number ob validated blocks (not created)
   */
  votes: number;
}

export interface IChainValidatorsListResponse {
  /**
   * The list of validators
   */
  validators: Array<IChainValidator>;
}

export type Fee = {
  /**
   * The cost of the transaction
   */
  cost: number;

  /**
   * The account generating the transaction
   */
  from: string;

  /**
   * The block number
   */
  height: number;

  /**
   * The transaction hash
   */
  reference: string;

  /**
   * The timestamp of the transaction
   */
  timestamp: string;

  /**
   * The type of the transaction
   */
  txType: string;
};

export interface IChainFeesListResponse extends IFeesList, PaginationResponse {}

export interface IFeesList {
  /**
   * The list of fees
   */
  fees: Array<Fee>;
}

export abstract class ChainAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Fetches info about the blockchain status.
   *
   * @param url - API endpoint URL
   */
  public static info(url: string): Promise<IChainGetInfoResponse> {
    return axios
      .get<IChainGetInfoResponse>(url + ChainAPIMethods.INFO)
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches info about the blockchain costs.
   *
   * @param url - API endpoint URL
   */
  public static costs(url: string): Promise<IChainGetCostsResponse> {
    return axios
      .get<IChainGetCostsResponse>(url + ChainAPIMethods.COSTS)
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches info about the blockchain anonymous circuits.
   *
   * @param url - API endpoint URL
   */
  public static circuits(url: string): Promise<IChainGetCircuitResponse> {
    return axios
      .get<IChainGetCircuitResponse>(url + ChainAPIMethods.CIRCUITS)
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches a circuit.
   *
   * @param url - Circuit URL
   */
  public static circuit(url: string): Promise<Uint8Array> {
    return axios
      .get<Uint8Array>(url, { responseType: 'arraybuffer' })
      .then((response) => new Uint8Array(response.data))
      .catch(this.isApiError);
  }

  /**
   * Returns the list of transactions and its cost
   * @param url - API endpoint URL
   */
  public static txCosts(url: string): Promise<IChainTxCosts> {
    return axios
      .get<IChainTxCosts>(url + ChainAPIMethods.TX_COSTS)
      .then((response) => {
        return response.data;
      })
      .catch(this.isApiError);
  }

  /**
   * Fetches information about a transaction from the blockchain.
   *
   * @param url - API endpoint URL
   * @param txHash - The transaction hash which we want to retrieve the info from
   */
  public static txInfo(url: string, txHash: string): Promise<Tx> {
    return axios
      .get<Tx>(url + ChainAPIMethods.TX_INFO.replace('{txHash}', txHash))
      .then((response) => {
        if (response.status === 204) {
          throw new ErrTransactionNotFound();
        }
        return response.data;
      })
      .catch(this.isApiError);
  }

  /**
   * Submits a transaction to the blockchain
   *
   * @param url - API endpoint URL
   * @param payload - The transaction data payload
   */
  public static submitTx(url: string, payload: string): Promise<IChainSubmitTxResponse> {
    return axios
      .post<IChainSubmitTxResponse>(url + ChainAPIMethods.SUBMIT_TX, { payload })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of transactions
   *
   * @param url - {string} url API endpoint URL
   * @param params - The parameters to filter the transactions
   */
  public static txList(
    url: string,
    params?: Partial<FetchTransactionsParametersWithPagination>
  ): Promise<IChainTxListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IChainTxListResponse>(url + ChainAPIMethods.TX_LIST + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of transfers
   *
   * @param url - {string} url API endpoint URL
   * @param params - The parameters to filter the transfers
   */
  public static transfers(
    url: string,
    params?: Partial<FetchTransfersParametersWithPagination>
  ): Promise<IChainTransfersListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IChainTransfersListResponse>(url + ChainAPIMethods.TRANSFERS + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of fees
   *
   * @param url - {string} url API endpoint URL
   * @param params - The parameters to filter the fees
   */
  public static feesList(
    url: string,
    params?: Partial<FetchFeesParametersWithPagination>
  ): Promise<IChainFeesListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IChainFeesListResponse>(url + ChainAPIMethods.FEES_LIST + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of organizations
   *
   * @param url - API endpoint URL
   * @param params - The parameters to filter the organizations
   */
  public static organizationList(
    url: string,
    params?: Partial<FetchOrganizationParametersWithPagination>
  ): Promise<IChainOrganizationListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IChainOrganizationListResponse>(
        url + ChainAPIMethods.ORGANIZATION_LIST + (queryParams ? '?' + queryParams : '')
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of validators
   *
   * @param url - API endpoint URL
   */
  public static validatorsList(url: string): Promise<IChainValidatorsListResponse> {
    return axios
      .get<IChainValidatorsListResponse>(url + ChainAPIMethods.VALIDATORS_LIST)
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Get block information by hash
   *
   * @param url - API endpoint URL
   * @param hash - block hash
   */
  public static blockInfoHash(url: string, hash: string): Promise<IChainBlockInfoResponse> {
    return axios
      .get<IChainBlockInfoResponse>(url + ChainAPIMethods.BLOCK_INFO_HASH.replace('{blockHash}', hash))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Get block information by height
   *
   * @param url - API endpoint URL
   * @param height - block height
   */
  public static blockInfoHeight(url: string, height: number): Promise<IChainBlockInfoResponse> {
    return axios
      .get<IChainBlockInfoResponse>(url + ChainAPIMethods.BLOCK_INFO_HEIGHT.replace('{blockHeight}', height.toString()))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the list of blocks
   *
   * @param url - {string} url API endpoint URL
   * @param params - The parameters to filter the blocks
   */
  public static blocksList(
    url: string,
    params?: Partial<FetchBlocksParametersWithPagination>
  ): Promise<IChainBlocksListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IChainBlocksListResponse>(url + ChainAPIMethods.BLOCK_LIST + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * By a given date give the estimate block for the current Vochain.
   * @param url - API URL
   * @param timeStamp - unix format timestamp
   */
  public static dateToBlock(url: string, timeStamp: number): Promise<IDateToBlockResponse> {
    return axios
      .get<IDateToBlockResponse>(url + ChainAPIMethods.DATE_TO_BLOCK.replace('{timestamp}', String(timeStamp)))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Return approximate date by a given block height.
   *
   * @param url - API URL
   * @param height - block height to calculate approximate timestamp
   * @return {Promise<IBlockToDateResponse>}
   */
  public static blockToDate(url: string, height: number): Promise<IBlockToDateResponse> {
    return axios
      .get<IBlockToDateResponse>(url + ChainAPIMethods.BLOCK_TO_DATE.replace('{height}', String(height)))
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
