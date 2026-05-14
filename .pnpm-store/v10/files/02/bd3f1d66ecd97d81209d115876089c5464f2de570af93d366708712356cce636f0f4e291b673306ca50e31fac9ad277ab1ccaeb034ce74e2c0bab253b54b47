import { IQuestion } from '../metadata';
import { Census } from '../census';
import { MultiLanguage } from '../../util/lang';
import { UnpublishedElection } from './unpublished';
import { dotobject } from '../../util/common';

export interface IVoteType {
  /**
   * Voter can only select one answer for question
   */
  uniqueChoices?: boolean;
  /**
   * The number of times a voter con overwrite its vote (change vote option).
   */
  maxVoteOverwrites?: number;
  /**
   * For weighted census, the user's balance will be used as the `maxCost`. This allows splitting the voting power among
   * several choices, even including quadratic voting scenarios.
   */
  costFromWeight?: boolean;
  /**
   * Defines the `costExponent`, which is used in the computation of the total "cost" of the voted options.
   * This total cost is later compared against `maxTotalCost`.
   *
   * The formula used to calculate the total cost is:
   * totalCost = Σ (value[i] ^ costExponent) <= maxTotalCost
   *
   * To establish a quadratic voting election, the `costExponent` must be set to 2. As an illustration, consider a vote
   * array of `[3,4]` where:
   * - `3` represents the credits assigned to option 0,
   * - `4` represents the credits given to option 1.
   *
   * The total credits spent are calculated as:
   *
   * ```
   * 3^2 = 9 (Credits for option 0)
   * 4^2 = 16 (Credits for option 1)
   * Total = 25 (Total credits spent)
   * ```
   *
   * The total credits available for spending (i.e., `maxTotalCost`) can be set in two ways during the election creation:
   * - By explicitly defining the `maxTotalCost` parameter to set up same amount of credits for each voter,
   * - By setting the `costFromWeight` parameter to `true` and using a weighted census. In this method, the weight
   * assigned to each voter determines the credits they have available for voting.
   */
  costExponent?: number;
  /**
   * Defines the maximum acceptable value for all fields in the voting process.
   * By default, this value corresponds to the total number of choices available in a question.
   *
   * In the context of a quadratic voting system, this value should typically be set to 0.
   */
  maxValue?: number;
  /**
   * Determines the maximum count or number of votes that can be cast across all fields.
   * The default value corresponds to the total number of questions available in the voting process.
   *
   * For elections involving multiple questions (multiquestion elections), this value should be equivalent to the total
   * number of questions. In contrast, for elections that don't involve multiple questions (non-multiquestion elections),
   * this value should match the total number of choices available for voting.
   */
  maxCount?: number;
  /**
   * Specifies the maximum limit on the total sum of all ballot fields' values, if applicable.
   * For instance, if the vote array is `[0,0,3,2]`, the `maxTotalCost` should be set to `3`.
   *
   * A value of 0 implies no maximum limit or that this parameter is not applicable in the current voting context.
   */
  maxTotalCost?: number;
}

export interface IElectionType {
  /**
   * The process can be paused and resumed.
   */
  interruptible?: boolean;
  /**
   * Can add more voters to the census tree during the election.
   */
  dynamicCensus?: boolean;
  /**
   * Protect the results until the end of the process if true. It will show live results otherwise.
   */
  secretUntilTheEnd?: boolean;
  /**
   * Enable anonymous voting.
   */
  anonymous?: boolean;
  /**
   * If the metadata has to be encrypted or not.
   */
  metadata?: {
    /**
     * If the metadata has to be encrypted or not.
     */
    encrypted?: boolean;
    /**
     * Password to encrypt the metadata.
     */
    password?: string;
  };
}

type AnyJson = boolean | number | string | null | JsonArray | JsonMap | any;
interface JsonMap {
  [key: string]: AnyJson;
}
interface JsonArray extends Array<AnyJson> {}

export type CustomMeta = AnyJson | JsonArray | JsonMap;

/**
 * Define election parameters.
 */
export interface IElectionParameters {
  /**
   * Election title
   */
  title: string | MultiLanguage<string>;
  /**
   * Election description
   */
  description?: string | MultiLanguage<string>;
  /**
   * Election header image url.
   */
  header?: string;
  /**
   * Election stream Uri (ex: a video url)
   */
  streamUri?: string;
  /**
   * Metadata (anything added by the election creator)
   */
  meta?: CustomMeta;
  startDate?: string | number | Date;
  endDate: string | number | Date;
  census: Census;
  voteType?: IVoteType;
  electionType?: IElectionType;
  questions?: IQuestion[];

  /**
   * Is used to limit the number of votes that can be registered for an election. This feature helps to prevent any
   * potential overflow of the blockchain when the number of votes goes beyond the maximum limit.
   *
   * In order to create an election, the creator is required to set the MaxCensusSize parameter to a proper value.
   * Typically, this value should be equal to the size of the census. If the MaxCensusSize parameter is set to 0, an
   * error will occur and the election cannot be created.
   *
   * If the number of votes exceeds this limit, will throw `Max census size for the election is greater than allowed
   * size` error.
   */
  maxCensusSize?: number;

  /**
   * Is used to remove the secret identities of the voters once the process is done.
   */
  temporarySecretIdentity?: boolean;

  /**
   * Used to add the SDK version to the election metadata
   */
  addSDKVersion?: boolean;
}

/**
 * Represents an election
 */
export abstract class Election {
  protected _title: MultiLanguage<string>;
  protected _description: MultiLanguage<string>;
  protected _header: string;
  protected _streamUri: string;
  protected _meta: CustomMeta;
  protected _startDate: Date;
  protected _endDate: Date;
  protected _electionType: IElectionType;
  protected _voteType: IVoteType;
  protected _questions: IQuestion[];
  protected _census: Census;
  protected _maxCensusSize: number;
  protected _temporarySecretIdentity: boolean;
  protected _addSDKVersion: boolean;

  /**
   * Constructs an election
   *
   * @param params - Election parameters
   */
  protected constructor(params?: IElectionParameters) {
    if (params) {
      this._title = typeof params.title === 'string' ? { default: params.title } : params.title;
      this._description = typeof params.description === 'string' ? { default: params.description } : params.description;
      this._header = params.header;
      this._streamUri = params.streamUri;
      this._meta = params.meta;
      this._startDate = params.startDate ? new Date(params.startDate) : null;
      this._endDate = new Date(params.endDate);
      this._electionType = params.electionType;
      this._voteType = params.voteType;
      this._questions = params.questions ?? [];
      this._census = params.census;
      this._maxCensusSize = params.maxCensusSize;
      this._temporarySecretIdentity = params.temporarySecretIdentity ?? false;
      this._addSDKVersion = params.addSDKVersion ?? true;
    }
  }

  /**
   * Returns an unpublished election object
   *
   * @param params - Unpublished Election parameters
   */
  public static from(params: IElectionParameters) {
    return new UnpublishedElection(params);
  }

  get title(): MultiLanguage<string> {
    return this._title;
  }

  get description(): MultiLanguage<string> {
    return this._description;
  }

  get header(): string {
    return this._header;
  }

  get streamUri(): string {
    return this._streamUri;
  }

  get meta(): CustomMeta {
    return this._meta;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get electionType(): IElectionType {
    return this._electionType;
  }

  get voteType(): IVoteType {
    return this._voteType;
  }

  get questions(): IQuestion[] {
    return this._questions;
  }

  get census(): Census {
    return this._census;
  }

  get maxCensusSize(): number {
    return this._maxCensusSize;
  }

  get temporarySecretIdentity(): boolean {
    return this._temporarySecretIdentity;
  }

  get addSDKVersion(): boolean {
    return this._addSDKVersion;
  }

  get(dot: string) {
    return this.meta ? dotobject(this.meta, dot) : null;
  }
}
