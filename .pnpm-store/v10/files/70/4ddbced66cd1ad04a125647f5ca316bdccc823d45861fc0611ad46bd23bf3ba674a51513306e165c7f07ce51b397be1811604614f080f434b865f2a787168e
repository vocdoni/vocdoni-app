import { CensusType } from '../census';
import { PublishedCensus } from '../published';
import { Token } from '../../../census3';

/**
 * Represents a census3 census
 */
export class TokenCensus extends PublishedCensus {
  private _token: Token;

  /**
   * Constructs a census3 census
   *
   * @param censusId - The id of the census
   * @param censusURI - The URI of the census
   * @param anonymous - If the census is anonymous
   * @param token - The token of the census
   * @param size - The size of the census
   * @param weight - The weight of the census
   */
  public constructor(
    censusId: string,
    censusURI: string,
    anonymous: boolean,
    token: Token,
    size?: number,
    weight?: bigint
  ) {
    super(censusId, censusURI, anonymous ? CensusType.ANONYMOUS : CensusType.WEIGHTED, size, weight);
    this.token = token;
  }

  get token(): Token {
    return this._token;
  }

  set token(value: Token) {
    this._token = value;
  }
}
