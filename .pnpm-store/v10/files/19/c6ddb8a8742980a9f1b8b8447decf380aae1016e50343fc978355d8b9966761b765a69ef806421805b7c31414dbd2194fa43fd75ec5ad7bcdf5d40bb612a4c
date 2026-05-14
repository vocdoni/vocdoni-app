import axios from 'axios';
import { API } from './api';

enum FileAPIMethods {
  CID = '/files/cid',
}

interface IFileCIDResponse {
  /**
   * The calculated CID of the data
   */
  cid: string;
}

export abstract class FileAPI extends API {
  /**
   * Cannot be constructed.
   */
  private constructor() {
    super();
  }

  /**
   * CID generator method via API.
   *
   * @param url - API endpoint URL
   * @param payload - Full payload string of which we want the CID of
   * @returns promised IFileCIDResponse
   */
  public static cid(url: string, payload: string): Promise<IFileCIDResponse> {
    return axios
      .post<IFileCIDResponse>(url + FileAPIMethods.CID, { payload })
      .then((response) => response.data)
      .catch(this.isApiError);
  }
}
