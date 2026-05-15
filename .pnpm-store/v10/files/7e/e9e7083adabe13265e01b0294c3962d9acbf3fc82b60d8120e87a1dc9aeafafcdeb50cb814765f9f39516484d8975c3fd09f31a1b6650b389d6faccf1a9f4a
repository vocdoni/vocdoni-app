import { Service, ServiceProperties } from './service';
import { ChainService } from './chain';
import { Account, RemoteSigner } from '../types';
import { AccountAPI, IAccountInfoResponse, PaginationRequest } from '../api';
import invariant from 'tiny-invariant';
import { Wallet } from '@ethersproject/wallet';
import { Signer } from '@ethersproject/abstract-signer';
import { AccountCore } from '../core/account';

interface AccountServiceProperties {
  chainService: ChainService;
}

export type FetchAccountsParametersWithPagination = FetchAccountsParameters & PaginationRequest;

export interface FetchAccountsParameters {}

type AccountServiceParameters = ServiceProperties & AccountServiceProperties;

/**
 * @typedef AccountData
 * @property {string} address
 * @property {number} balance
 * @property {number} nonce
 * @property {number} electionIndex
 * @property {string | null} infoURL
 * @property {Account} account
 */
export type AccountData = {
  account: Account;
} & Pick<
  IAccountInfoResponse,
  'address' | 'balance' | 'nonce' | 'electionIndex' | 'infoURL' | 'sik' | 'transfersCount' | 'feesCount'
>;

export type ArchivedAccountData = Pick<AccountData, 'address' | 'account'>;

export class AccountService extends Service implements AccountServiceProperties {
  public chainService: ChainService;

  /**
   * Instantiate the election service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<AccountServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  /**
   * Fetches account information.
   *
   * @param address - The account address to fetch the information
   */
  async fetchAccountInfo(address: string): Promise<AccountData | ArchivedAccountData> {
    invariant(this.url, 'No URL set');
    return AccountAPI.info(this.url, address)
      .then((accountInfo) => ({
        account: Account.build({
          languages: accountInfo.metadata?.languages,
          name: accountInfo.metadata?.name,
          description: accountInfo.metadata?.description,
          feed: accountInfo.metadata?.newsFeed,
          header: accountInfo.metadata?.media?.header,
          avatar: accountInfo.metadata?.media?.avatar,
          logo: accountInfo.metadata?.media?.logo,
          meta: Object.entries(accountInfo.metadata?.meta ?? []).map(([key, value]) => ({ key, value })),
        }),
        ...accountInfo,
      }))
      .catch(() =>
        AccountAPI.metadata(this.url, address).then((metadata) => ({
          address,
          account: Account.build({
            languages: metadata?.languages,
            name: metadata?.name,
            description: metadata?.description,
            feed: metadata?.newsFeed,
            header: metadata?.media?.header,
            avatar: metadata?.media?.avatar,
            logo: metadata?.media?.logo,
            meta: Object.entries(metadata?.meta ?? []).map(([key, value]) => ({ key, value })),
          }),
        }))
      );
  }

  /**
   * Updates an account with information
   *
   * @param tx - The transaction for setting the account
   * @param metadata - The account metadata
   * @returns The transaction hash
   */
  setInfo(tx: string, metadata: string): Promise<string> {
    invariant(this.url, 'No URL set');
    return AccountAPI.setInfo(this.url, tx, metadata).then((response) => response.txHash);
  }

  async signTransaction(
    tx: Uint8Array,
    message: string,
    walletOrSigner: Wallet | Signer | RemoteSigner
  ): Promise<string> {
    invariant(this.chainService, 'No chain service set');
    return this.chainService.fetchChainData().then((chainData) => {
      const payload = message
        .replace('{hash}', AccountCore.hashTransaction(tx))
        .replace('{chainId}', chainData.chainId);
      return AccountCore.signTransaction(tx, payload, walletOrSigner);
    });
  }
}
