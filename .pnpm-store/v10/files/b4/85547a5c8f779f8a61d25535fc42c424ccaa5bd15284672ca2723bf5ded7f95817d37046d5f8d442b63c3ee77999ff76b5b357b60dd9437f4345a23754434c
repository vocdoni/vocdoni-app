import { Service, ServiceProperties } from './service';
import { CensusType, ICensusParticipant, PlainCensus, WeightedCensus } from '../types';
import { CensusAPI, CensusStillNotPublished, ICensusImportResponse, ICensusPublishResponse, WalletAPI } from '../api';
import { Wallet } from '@ethersproject/wallet';
import invariant from 'tiny-invariant';
import { CspProofType } from './csp';
import { delay } from '../util/common';

interface CensusServiceProperties {
  auth: CensusAuth;
  chunk_size: number;
  async: CensusAsync;
}

type CensusServiceParameters = ServiceProperties & CensusServiceProperties;

type CensusAuth = {
  identifier: string;
  wallet?: Wallet;
};

type CensusAsync = {
  async: boolean;
  wait: number;
};

/**
 * @typedef CensusProof
 * @property {string} weight
 * @property {string} proof
 * @property {string} value
 */
export type CensusProof = {
  type: CensusType;
  weight: string;
  root: string;
  proof: string;
  value: string;
  siblings?: Array<string>;
};

/**
 * @typedef CensusImportExport
 * @property {number} type
 * @property {string} rootHash
 * @property {string} data
 * @property {number} maxLevels
 */
export type CensusImportExport = {
  type: number;
  rootHash: string;
  data: string;
  maxLevels: number;
};

/**
 * @typedef CspCensusProof
 * @property {string} type
 * @property {string} address
 * @property {string} signature
 * @property {bigint} weight
 */
export type CspCensusProof = {
  type?: number;
  address: string;
  signature: string;
  weight?: bigint;
  proof_type?: CspProofType;
};

export class CensusService extends Service implements CensusServiceProperties {
  public auth: CensusAuth;
  public chunk_size: number;
  public async: CensusAsync;

  /**
   * Instantiate the census service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<CensusServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  /**
   * Fetches the information of a given census.
   *
   * @param censusId -
   */
  get(censusId: string): Promise<{ size: number; weight: bigint; type: CensusType }> {
    invariant(this.url, 'No URL set');

    return Promise.all([
      CensusAPI.size(this.url, censusId),
      CensusAPI.weight(this.url, censusId),
      CensusAPI.type(this.url, censusId),
    ])
      .then(([size, weight, type]) => ({
        size: size.size,
        weight: BigInt(weight.weight),
        type: type.type,
      }))
      .catch(() => ({
        size: undefined,
        weight: undefined,
        type: undefined,
      }));
  }

  /**
   * Deletes the given census.
   *
   * @param censusId -
   */
  delete(censusId: string): Promise<void> {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');

    return CensusAPI.delete(this.url, this.auth.identifier, censusId);
  }

  /**
   * Fetches proof that an address is part of the specified census.
   *
   * @param censusId - Census we want to check the address against
   * @param key - The address to be found
   */
  async fetchProof(censusId: string, key: string): Promise<CensusProof> {
    invariant(this.url, 'No URL set');

    return CensusAPI.proof(this.url, censusId, key).then((censusProof) => ({
      type: censusProof.type,
      weight: censusProof.weight,
      root: censusProof.censusRoot,
      proof: censusProof.censusProof,
      value: censusProof.value,
      siblings: censusProof.censusSiblings ?? null,
    }));
  }

  create(censusType: CensusType): Promise<{ id: string; auth: string }> {
    invariant(this.url, 'No URL set');

    return this.fetchAccountToken()
      .then(() => CensusAPI.create(this.url, this.auth.identifier, censusType))
      .then((response) => ({ id: response.censusID, auth: this.auth.identifier }));
  }

  async add(censusId: string, participants: ICensusParticipant[]) {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');
    invariant(this.chunk_size, 'No chunk size set');

    const participantsChunked = participants.reduce((result, item, index) => {
      const chunkIndex = Math.floor(index / this.chunk_size);

      if (!result[chunkIndex]) {
        result[chunkIndex] = [];
      }

      result[chunkIndex].push(item);

      return result;
    }, []);

    for (const chunk of participantsChunked) {
      await CensusAPI.add(this.url, this.auth.identifier, censusId, chunk);
    }

    return censusId;
  }

  private addParallel(censusId: string, participants: ICensusParticipant[]) {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');
    invariant(this.chunk_size, 'No chunk size set');

    const participantsChunked = participants.reduce((result, item, index) => {
      const chunkIndex = Math.floor(index / this.chunk_size);

      if (!result[chunkIndex]) {
        result[chunkIndex] = [];
      }

      result[chunkIndex].push(item);

      return result;
    }, []);

    return participantsChunked.map((chunk) => CensusAPI.add(this.url, this.auth.identifier, censusId, chunk));
  }

  /**
   * Publishes the given census identifier.
   *
   * @param censusId - The census identifier
   * @param async - If the publication has to be done asynchronously
   */
  publish(censusId: string, async?: boolean): Promise<ICensusPublishResponse> {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');
    invariant(this.async, 'No census async information set');

    const censusAsync = async ?? this.async.async;

    const checkAsync = (url: string, authToken: string, censusId: string) => {
      return CensusAPI.check(this.url, this.auth.identifier, censusId).catch((error) => {
        if (error instanceof CensusStillNotPublished) {
          return delay(this.async.wait).then(() => checkAsync(url, authToken, censusId));
        }
        throw error;
      });
    };

    return censusAsync
      ? CensusAPI.publishAsync(this.url, this.auth.identifier, censusId).then((response) =>
          checkAsync(this.url, this.auth.identifier, response.censusID)
        )
      : CensusAPI.publishSync(this.url, this.auth.identifier, censusId);
  }

  /**
   * Exports the given census identifier.
   *
   * @param censusId - The census identifier
   */
  export(censusId: string): Promise<CensusImportExport> {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');

    return CensusAPI.export(this.url, this.auth.identifier, censusId);
  }

  /**
   * Imports data into the given census identifier.
   *
   * @param censusId - The census identifier
   * @param data - The census data
   */
  import(censusId: string, data: CensusImportExport): Promise<ICensusImportResponse> {
    invariant(this.url, 'No URL set');
    invariant(this.auth, 'No census auth set');

    return CensusAPI.import(this.url, this.auth.identifier, censusId, data.type, data.rootHash, data.data);
  }

  /**
   * Publishes the given census.
   *
   * @param census - The census to be published.
   */
  createCensus(census: PlainCensus | WeightedCensus): Promise<void> {
    return this.create(census.type)
      .then((censusInfo) => this.add(censusInfo.id, census.participants))
      .then((censusId) => this.publish(censusId))
      .then((censusPublish) => {
        census.censusId = censusPublish.censusID;
        census.censusURI = censusPublish.uri;
        census.size = census.participants.length;
        census.weight = census.participants.reduce(
          (currentValue, participant) => currentValue + participant.weight,
          BigInt(0)
        );
      });
  }

  /**
   * Publishes the given census.
   *
   * @param census - The census to be published.
   */
  // @ts-ignore
  private createCensusParallel(census: PlainCensus | WeightedCensus): Promise<void> {
    return this.create(census.type).then((censusInfo) =>
      Promise.all(this.addParallel(censusInfo.id, census.participants))
        .then(() => this.publish(censusInfo.id))
        .then((censusPublish) => {
          census.censusId = censusPublish.censusID;
          census.censusURI = censusPublish.uri;
          census.size = census.participants.length;
          census.weight = census.participants.reduce(
            (currentValue, participant) => currentValue + participant.weight,
            BigInt(0)
          );
        })
    );
  }

  /**
   * Fetches the specific account token auth and sets it to the current instance.
   *
   */
  fetchAccountToken(): Promise<void> {
    if (this.auth) {
      return Promise.resolve();
    }
    invariant(this.url, 'No URL set');

    this.auth = {
      identifier: '',
      wallet: Wallet.createRandom(),
    };

    return WalletAPI.add(this.url, this.auth.wallet.privateKey).then((addWalletResponse) => {
      this.auth.identifier = addWalletResponse.token;
    });
  }
}
