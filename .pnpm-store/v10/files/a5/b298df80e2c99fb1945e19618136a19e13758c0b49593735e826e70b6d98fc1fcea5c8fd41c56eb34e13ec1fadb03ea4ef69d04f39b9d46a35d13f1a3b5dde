import { Service, ServiceProperties } from './service';
import { FileAPI } from '../api';
import invariant from 'tiny-invariant';
import { Buffer } from 'buffer';

interface FileServiceProperties {}

type FileServiceParameters = ServiceProperties & FileServiceProperties;

export class FileService extends Service implements FileServiceProperties {
  /**
   * Instantiate the election service.
   *
   * @param params - The service parameters
   */
  constructor(params: Partial<FileServiceParameters>) {
    super();
    Object.assign(this, params);
  }

  /**
   * Fetches the CID expected for the specified data content.
   *
   * @param data - The data of which we want the CID of
   * @returns Resulting CID
   */
  calculateCID(data: string): Promise<string> {
    invariant(this.url, 'No URL set');
    const b64Data = Buffer.from(data, 'utf8').toString('base64');
    return FileAPI.cid(this.url, b64Data).then((response) => response.cid);
  }
}
