import axios from 'axios';
import { CensusType } from '../types';
import { strip0x } from '../util/common';
import { API } from './api';
import { CensusStillNotPublished } from './errors';

enum CensusAPIMethods {
  CREATE = '/censuses',
  ADD = '/censuses/{id}/participants',
  DELETE = '/censuses/{id}',
  PUBLISH = '/censuses/{id}/publish',
  PUBLISH_ASYNC = '/censuses/{id}/publish/async',
  CHECK = '/censuses/{id}/check',
  PROOF = '/censuses/{id}/proof',
  SIZE = '/censuses/{id}/size',
  WEIGHT = '/censuses/{id}/weight',
  TYPE = '/censuses/{id}/type',
  EXPORT = '/censuses/{id}/export',
  IMPORT = '/censuses/{id}/import',
}

interface ICensusCreateResponse {
  /**
   * The identifier of the census
   */
  censusID: string;
}

interface ICensusAddResponse {}

export interface ICensusPublishResponse {
  /**
   * The identifier of the published census
   */
  censusID: string;

  /**
   * The URI of the published census
   */
  uri: string;
}

export interface ICensusPublishAsyncResponse {
  /**
   * The identifier of the published census
   */
  censusID: string;
}

export interface ICensusExportResponse {
  /**
   * The type of the census
   */
  type: number;

  /**
   * The root hash of the census
   */
  rootHash: string;

  /**
   * The data of the census
   */
  data: string;

  /**
   * The max levels of the census
   */
  maxLevels: number;
}

export interface ICensusImportResponse {}

export interface ICensusProofResponse {
  /**
   * The type of the census
   */
  type: CensusType;

  /**
   * The weight as a string
   */
  weight: string;

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
   * The census siblings
   */
  censusSiblings?: Array<string>;
}

interface ICensusSizeResponse {
  /**
   * The size of the census (number of participants)
   */
  size: number;
}

interface ICensusWeightResponse {
  /**
   * The weight of the census as a BigInt (sum of all weights)
   */
  weight: string;
}

interface ICensusTypeResponse {
  /**
   * The type of the census
   */
  type: CensusType;
}

export abstract class CensusAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * Create's a new census in the API.
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param type - Type of census to be created
   */
  public static create(url: string, authToken: string, type: CensusType): Promise<ICensusCreateResponse> {
    return axios
      .post<ICensusCreateResponse>(url + CensusAPIMethods.CREATE + '/' + type, null, {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Adds participants to a census
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The id of the census to which participants are being added
   * @param participants - An array of participants
   */
  public static add(
    url: string,
    authToken: string,
    censusId: string,
    participants: Array<{
      key: string;
      weight?: bigint;
    }>
  ): Promise<ICensusAddResponse> {
    return axios
      .post<ICensusAddResponse>(
        url + CensusAPIMethods.ADD.replace('{id}', censusId),
        {
          participants: participants.map((participant) => ({
            key: participant.key,
            weight: typeof participant.weight == 'bigint' ? participant.weight.toString() : '1',
          })),
        },
        {
          headers: {
            Authorization: 'Bearer ' + authToken,
          },
        }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Publishes the census, so it can be used in processes
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we're publishing
   * @returns on success
   */
  public static publishSync(url: string, authToken: string, censusId: string): Promise<ICensusPublishResponse> {
    return axios
      .post<ICensusPublishResponse>(url + CensusAPIMethods.PUBLISH.replace('{id}', censusId), null, {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Publishes the census using an async call
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we're publishing
   * @returns on success
   */
  public static publishAsync(url: string, authToken: string, censusId: string): Promise<ICensusPublishAsyncResponse> {
    return axios
      .post<ICensusPublishAsyncResponse>(url + CensusAPIMethods.PUBLISH_ASYNC.replace('{id}', censusId), null, {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Checks that the census is published
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we're checking
   * @returns on success
   */
  public static check(url: string, authToken: string, censusId: string): Promise<ICensusPublishResponse> {
    return axios
      .get<ICensusPublishResponse>(url + CensusAPIMethods.CHECK.replace('{id}', censusId), {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => {
        if (response.status === 204) {
          throw new CensusStillNotPublished();
        }
        return response.data;
      })
      .catch(this.isApiError);
  }

  /**
   * Checks if the specified address is in the specified census
   *
   * @param url - API endpoint URL
   * @param censusId - The census ID of which we want the proof from
   * @param key - The address to be checked
   * @returns on success
   */
  public static proof(url: string, censusId: string, key: string): Promise<ICensusProofResponse> {
    return axios
      .get<ICensusProofResponse>(url + CensusAPIMethods.PROOF.replace('{id}', censusId) + '/' + strip0x(key))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Exports the given census identifier
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we want to export
   * @returns on success
   */
  public static export(url: string, authToken: string, censusId: string): Promise<ICensusExportResponse> {
    return axios
      .get<ICensusExportResponse>(url + CensusAPIMethods.EXPORT.replace('{id}', censusId), {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Imports data into the given census identifier
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we want to export
   * @param type - The type of the census
   * @param rootHash - The root hash of the census
   * @param data - The census data to be imported
   * @returns on success
   */
  public static import(
    url: string,
    authToken: string,
    censusId: string,
    type: number,
    rootHash: string,
    data: string
  ): Promise<ICensusImportResponse> {
    return axios
      .post<ICensusImportResponse>(
        url + CensusAPIMethods.IMPORT.replace('{id}', censusId),
        { type, rootHash, data },
        {
          headers: {
            Authorization: 'Bearer ' + authToken,
          },
        }
      )
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Deletes the given census
   *
   * @param url - API endpoint URL
   * @param authToken - Authentication token
   * @param censusId - The census ID we want to export
   * @returns on success
   */
  public static delete(url: string, authToken: string, censusId: string): Promise<void> {
    return axios
      .delete<void>(url + CensusAPIMethods.DELETE.replace('{id}', censusId), {
        headers: {
          Authorization: 'Bearer ' + authToken,
        },
      })
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the size of a given census
   *
   * @param url - API endpoint URL
   * @param censusId - The census ID
   */
  public static size(url: string, censusId: string): Promise<ICensusSizeResponse> {
    return axios
      .get<ICensusSizeResponse>(url + CensusAPIMethods.SIZE.replace('{id}', censusId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the weight of a given census
   *
   * @param url - API endpoint URL
   * @param censusId - The census ID
   */
  public static weight(url: string, censusId: string): Promise<ICensusWeightResponse> {
    return axios
      .get<ICensusWeightResponse>(url + CensusAPIMethods.WEIGHT.replace('{id}', censusId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }

  /**
   * Returns the type of given census
   *
   * @param url - API endpoint URL
   * @param censusId - The census ID
   */
  public static type(url: string, censusId: string): Promise<ICensusTypeResponse> {
    return axios
      .get<ICensusTypeResponse>(url + CensusAPIMethods.TYPE.replace('{id}', censusId))
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
