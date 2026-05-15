export enum CensusType {
  WEIGHTED = 'weighted',
  ANONYMOUS = 'zkweighted',
  CSP = 'csp',
  UNKNOWN = 'unknown',
}

/**
 * Represents a generic census
 */
export abstract class Census {
  protected _censusId: string | null;
  protected _censusURI: string | null;
  protected _type: CensusType;
  private _size: number | null;
  private _weight: bigint | null;

  /**
   * Constructs a generic census
   *
   * @param censusId - The id of the census
   * @param censusURI - The URI of the census
   * @param type - The type of the census
   * @param size - The size of the census
   * @param weight - The weight of the census
   */
  protected constructor(censusId?: string, censusURI?: string, type?: CensusType, size?: number, weight?: bigint) {
    this.censusId = censusId;
    this.censusURI = censusURI;
    this.type = type;
    this.size = size;
    this.weight = weight;
  }

  get censusId(): string | null {
    return this._censusId;
  }

  set censusId(value: string | null) {
    this._censusId = value;
  }

  get censusURI(): string | null {
    return this._censusURI;
  }

  set censusURI(value: string | null) {
    this._censusURI = value;
  }

  get type(): CensusType {
    return this._type;
  }

  set type(value: CensusType) {
    this._type = value;
  }

  get size(): number | null {
    return this._size;
  }

  set size(value: number | null) {
    this._size = value;
  }

  get weight(): bigint | null {
    return this._weight;
  }

  set weight(value: bigint | null) {
    this._weight = value;
  }

  get isPublished(): boolean {
    return (
      typeof this.censusId !== 'undefined' && typeof this.censusURI !== 'undefined' && typeof this.type !== 'undefined'
    );
  }

  static censusTypeFromCensusOrigin(censusOrigin: string, anonymous: boolean = false): CensusType {
    switch (censusOrigin) {
      case 'OFF_CHAIN_TREE_WEIGHTED':
        return anonymous ? CensusType.ANONYMOUS : CensusType.WEIGHTED;
      case 'OFF_CHAIN_CA':
        return CensusType.CSP;
      default:
        throw new Error('Census type not defined by the census origin');
    }
  }
}
