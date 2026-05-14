import { CensusType } from '../census';
import { PublishedCensus } from '../published';
import { Strategy } from '../../../census3';

/**
 * Represents a census3 census
 */
export class StrategyCensus extends PublishedCensus {
  private _strategy: Strategy;

  /**
   * Constructs a census3 census
   *
   * @param censusId - The id of the census
   * @param censusURI - The URI of the census
   * @param anonymous - If the census is anonymous
   * @param strategy - The strategy information
   * @param size - The size of the census
   * @param weight - The weight of the census
   */
  public constructor(
    censusId: string,
    censusURI: string,
    anonymous: boolean,
    strategy: Strategy,
    size?: number,
    weight?: bigint
  ) {
    super(censusId, censusURI, anonymous ? CensusType.ANONYMOUS : CensusType.WEIGHTED, size, weight);
    this.strategy = strategy;
  }

  get strategy(): Strategy {
    return this._strategy;
  }

  set strategy(value: Strategy) {
    this._strategy = value;
  }
}
