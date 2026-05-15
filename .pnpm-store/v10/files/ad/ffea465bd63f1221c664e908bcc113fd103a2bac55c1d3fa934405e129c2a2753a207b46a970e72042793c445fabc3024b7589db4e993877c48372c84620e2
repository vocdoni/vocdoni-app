import { Vote } from './vote';

export class AnonymousVote extends Vote {
  private _password: string;
  private _signature: string;

  /**
   * Constructs an anonymous vote
   *
   * @param votes - The list of votes values
   * @param signature - The signature of the payload
   * @param password - The password of the anonymous vote
   */
  public constructor(votes: Array<number | bigint>, signature?: string, password: string = '0') {
    super(votes);
    this.password = password;
    this.signature = signature;
  }

  get password(): string {
    return this._password;
  }

  set password(value: string) {
    this._password = value;
  }

  get signature(): string {
    return this._signature;
  }

  set signature(value: string) {
    this._signature = value;
  }
}
