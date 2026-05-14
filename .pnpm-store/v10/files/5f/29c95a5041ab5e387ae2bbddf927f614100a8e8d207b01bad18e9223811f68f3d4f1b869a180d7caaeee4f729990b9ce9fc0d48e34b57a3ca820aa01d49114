import { Service, ServiceProperties } from './service';
import invariant from 'tiny-invariant';
import { ChainService } from './chain';
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { VoteCore } from '../core/vote';
import { VoteInfoResponse, IVoteSubmitResponse, PaginationRequest, VoteAPI } from '../api';
import { RemoteSigner } from '../types';

interface VoteServiceProperties {
  chainService: ChainService;
}

type VoteServiceParameters = ServiceProperties & VoteServiceProperties;

export type FetchVotesParametersWithPagination = FetchVotesParameters & PaginationRequest;

export interface FetchVotesParameters {
  electionId: string;
}

export type VoteInfo = VoteInfoResponse;
export type VoteSubmit = IVoteSubmitResponse;

export enum VoteSteps {
  GET_ELECTION = 'get-election',
  GET_PROOF = 'get-proof',
  GET_SIGNATURE = 'get-signature',
  CALC_ZK_PROOF = 'calc-zk-proof',
  GENERATE_TX = 'generate-tx',
  SIGN_TX = 'sign-tx',
  DONE = 'done',
}

export type VoteStepValue =
  | { key: VoteSteps.GET_ELECTION; electionId: string }
  | { key: VoteSteps.GET_PROOF }
  | { key: VoteSteps.GET_SIGNATURE; signature: string }
  | { key: VoteSteps.CALC_ZK_PROOF }
  | { key: VoteSteps.GENERATE_TX }
  | { key: VoteSteps.SIGN_TX }
  | { key: VoteSteps.DONE; voteId: string };

export class VoteService extends Service implements VoteServiceProperties {
  public chainService: ChainService;

  /**
   * Instantiate the election service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<VoteServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  public async signTransaction(
    tx: Uint8Array,
    message: string,
    walletOrSigner: Wallet | Signer | RemoteSigner
  ): Promise<string> {
    invariant(this.chainService, 'No chain service set');
    return this.chainService.fetchChainData().then((chainData) => {
      const payload = message.replace('{hash}', VoteCore.hashTransaction(tx)).replace('{chainId}', chainData.chainId);
      return VoteCore.signTransaction(tx, payload, walletOrSigner);
    });
  }

  public encodeTransaction(tx: Uint8Array): string {
    return VoteCore.encodeTransaction(tx);
  }

  /**
   * Get the vote information
   *
   * @param voteId - The identifier of the vote
   *
   */
  info(voteId: string): Promise<VoteInfo> {
    invariant(this.url, 'No URL set');
    return VoteAPI.info(this.url, voteId);
  }

  /**
   * Submit the vote to the chain
   *
   * @param payload - The base64 encoded vote transaction
   *
   */
  vote(payload: string): Promise<VoteSubmit> {
    invariant(this.url, 'No URL set');
    return VoteAPI.submit(this.url, payload);
  }
}
