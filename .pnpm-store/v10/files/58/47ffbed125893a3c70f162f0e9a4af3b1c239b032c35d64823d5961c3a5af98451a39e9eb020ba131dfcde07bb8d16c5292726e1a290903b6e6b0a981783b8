import axios from 'axios';
import { API, PaginationResponse } from './api';
import { FetchVotesParametersWithPagination } from '../services';

enum VoteAPIMethods {
  VOTE = '/votes',
  LIST = '/votes',
  INFO = '/votes/{id}',
  VERIFY = '/votes/verify/{electionId}/{voteId}',
}

export interface IVoteSubmitResponse {
  /**
   * The hash of the transaction
   */
  txHash: string;

  /**
   * The identifier of the vote, also called nullifier.
   */
  voteID: string;
}

export interface IVotePackage {
  /**
   * The nonce of the vote package
   */
  nonce: string;

  /**
   * The raw vote package
   */
  votes: number[];
}

export interface IVoteEncryptedPackage {
  /**
   * The base64 encrypted vote package
   */
  encrypted: string;
}

export interface IVoteListResponse extends VotesList, PaginationResponse {}

export interface VotesList {
  /**
   * The list of votes
   */
  votes: Array<VoteSummary>;
}

export type VoteSummary = Pick<
  VoteInfoResponse,
  'txHash' | 'voteID' | 'voterID' | 'electionID' | 'blockHeight' | 'transactionIndex'
>;

export type VoteInfoResponse = {
  /**
   * The hash of the transaction
   */
  txHash: string;

  /**
   * The identifier of the vote, also called nullifier.
   */
  voteID: string;

  /**
   * Encryption key indexes used
   */
  encryptionKeys?: number[];

  /**
   * The vote package.
   */
  package: IVotePackage | IVoteEncryptedPackage;

  /**
   * The weight of the vote.
   */
  weight: string;

  /**
   * The identifier of the election.
   */
  electionID: string;

  /**
   * The identifier of the voter.
   */
  voterID: string;

  /**
   * The block number where the transaction is mined.
   */
  blockHeight: number;

  /**
   * The index inside the block where the transaction is mined.
   */
  transactionIndex: number;

  /**
   * The number of votes overwrites.
   */
  overwriteCount: number;

  /**
   * Date when the vote was emitted
   */
  date: string;
};

export abstract class VoteAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Submits a payload representing the vote transaction to the chain
   *
   * @param url - API endpoint URL
   * @param payload - The base64 encoded vote transaction
   *
   */
  public static submit(url: string, payload: string): Promise<IVoteSubmitResponse> {
    return axios
      .post<IVoteSubmitResponse>(url + VoteAPIMethods.VOTE, { txPayload: payload })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Vote info
   *
   * @param url - API endpoint URL
   * @param voteId - The identifier of the vote
   *
   */
  public static info(url: string, voteId: string): Promise<VoteInfoResponse> {
    return axios
      .get<VoteInfoResponse>(url + VoteAPIMethods.INFO.replace('{id}', voteId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Fetches the vote list
   *
   * @param url - API endpoint URL
   * @param params - The parameters to filter the votes
   */
  public static list(url: string, params?: Partial<FetchVotesParametersWithPagination>): Promise<IVoteListResponse> {
    const queryParams = this.createQueryParams(params);
    return axios
      .get<IVoteListResponse>(url + VoteAPIMethods.LIST + (queryParams ? '?' + queryParams : ''))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Verify vote. A vote exists in a process.
   *
   * @param url - API endpoint URL
   * @param electionId - The process identifier
   * @param voteId - The identifier of the vote
   *
   * @returns Return true if response has status 200
   */
  public static verify(url: string, electionId: string, voteId: string): Promise<boolean> {
    return axios
      .get(url + VoteAPIMethods.VERIFY.replace('{electionId}', electionId).replace('{voteId}', voteId))
      .then((response) => response.status === 200)
      .catch(this.isApiError);
  }
}
