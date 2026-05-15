import { Provider, TransactionRequest } from '@ethersproject/providers';
import { Bytes } from '@ethersproject/bytes';
import { Signer } from '@ethersproject/abstract-signer';
import { RemoteSignerService } from '../services';
import invariant from 'tiny-invariant';
import { isAddress } from '@ethersproject/address';

export type RemoteSignerProperties = {
  url: string;
  credentials: RemoteSignerCredentials;
  token: string;
};

export type RemoteSignerCredentials = {
  email: string;
  password: string;
};

export class RemoteSigner extends Signer {
  public url: string;
  public credentials: RemoteSignerCredentials;
  public token: string;
  private _address: string;
  private _remoteSignerService: RemoteSignerService;

  constructor(params: Partial<RemoteSignerProperties>) {
    super();
    Object.assign(this, params);
    this.remoteSignerService = new RemoteSignerService({ remoteSigner: this });
  }

  async login(credentials?: RemoteSignerCredentials): Promise<string> {
    const login = {
      email: credentials?.email ?? this.credentials?.email,
      password: credentials?.password ?? this.credentials?.password,
    };
    return this.remoteSignerService.login(login).then((token) => {
      this.token = token;
      return token;
    });
  }

  async refresh(): Promise<string> {
    return this.remoteSignerService.refresh().then((token) => {
      this.token = token;
      return token;
    });
  }

  async signMessage(message: string | Bytes): Promise<string> {
    return this.remoteSignerService.signPayload(message);
  }

  async signTransactionRemotely(message: string | Bytes): Promise<string> {
    return this.remoteSignerService.signTxPayload(message);
  }

  async getAddress(): Promise<string> {
    if (this.address) {
      return this.address;
    }
    return this.remoteSignerService.getAddress();
  }

  async signTransaction(_transaction: TransactionRequest): Promise<string> {
    throw new Error('Not implemented');
  }

  connect(_provider: Provider): Signer {
    return this;
  }

  get remoteSignerService(): RemoteSignerService {
    return this._remoteSignerService;
  }

  set remoteSignerService(value: RemoteSignerService) {
    this._remoteSignerService = value;
  }

  get address(): string {
    return this._address;
  }

  set address(value: string) {
    invariant(isAddress(value), 'Incorrect address');
    this._address = value;
  }
}
