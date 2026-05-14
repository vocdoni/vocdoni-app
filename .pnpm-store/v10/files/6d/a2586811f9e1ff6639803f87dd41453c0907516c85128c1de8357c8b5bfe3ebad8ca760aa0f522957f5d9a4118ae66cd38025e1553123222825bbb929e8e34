export interface IInvalidElectionParameters {
  id: string;
}

/**
 * Represents an invalid election
 */
export class InvalidElection {
  private readonly _id: string;

  /**
   * Constructs an invalid election
   *
   * @param params - Election parameters
   */
  public constructor(params: IInvalidElectionParameters) {
    this._id = params.id;
  }

  get id(): string {
    return this._id;
  }

  get isValid(): boolean {
    return false;
  }
}
