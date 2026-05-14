import { Election, IElectionParameters, IElectionType, IVoteType } from './election';
import { MultiLanguage } from '../../util/lang';
import { ElectionResultsType, ElectionResultsTypeNames, IQuestion } from '../metadata';
import { PublishedCensus } from '../census';
import { Vote } from '../vote';
import { MultiChoiceElection } from './multichoice';
import { BudgetElection } from './budget';
import { ApprovalElection } from './approval';
import { QuadraticElection } from './quadratic';

export enum ElectionStatus {
  PROCESS_UNKNOWN = 'PROCESS_UNKNOWN',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
  CANCELED = 'CANCELED',
  PAUSED = 'PAUSED',
  RESULTS = 'RESULTS',
}

export enum ElectionStatusReady {
  READY = 'READY',
}

export type AllElectionStatus = ElectionStatus | ElectionStatusReady;

export interface IPublishedElectionParameters extends IElectionParameters {
  id: string;
  organizationId: string;
  status: AllElectionStatus;
  voteCount: number;
  finalResults: boolean;
  results: Array<Array<string>>;
  manuallyEnded: boolean;
  chainId: string;
  creationTime: string;
  metadataURL: string;
  resultsType: ElectionResultsType;
  raw: object;
}

/**
 * Represents a published election
 */
export class PublishedElection extends Election {
  private readonly _id: string;
  private readonly _organizationId: string;
  private readonly _status: ElectionStatus;
  private readonly _voteCount: number;
  private readonly _finalResults: boolean;
  private readonly _manuallyEnded: boolean;
  private readonly _chainId: string;
  private readonly _results: Array<Array<string>>;
  private readonly _creationTime: Date;
  private readonly _metadataURL: string;
  private readonly _resultsType: ElectionResultsType;
  private readonly _raw: object;

  /**
   * Constructs a published election
   *
   * @param params - Election parameters
   */
  public constructor(params: IPublishedElectionParameters) {
    super({
      title: params.title,
      description: params.description,
      header: params.header,
      streamUri: params.streamUri,
      meta: params.meta,
      startDate: params.startDate,
      endDate: params.endDate,
      electionType: params.electionType,
      voteType: params.voteType,
      questions: params.questions,
      census: params.census,
      maxCensusSize: params.maxCensusSize,
    });
    this._id = params.id;
    this._organizationId = params.organizationId;
    this._status = PublishedElection.getStatus(params.status, this.startDate);
    this._voteCount = params.voteCount;
    this._finalResults = params.finalResults;
    this._results = params.results;
    this._manuallyEnded = params.manuallyEnded;
    this._chainId = params.chainId;
    this._creationTime = new Date(params.creationTime);
    this._metadataURL = params.metadataURL;
    this._resultsType = params.resultsType;
    this._raw = params.raw;
  }

  /**
   * Returns a published election object
   *
   * @param params - Published election parameters
   */
  public static build(params: IPublishedElectionParameters) {
    return new PublishedElection(params);
  }

  public static getStatus(status: AllElectionStatus, startDate: Date): ElectionStatus {
    switch (status) {
      case ElectionStatusReady.READY:
        return startDate <= new Date() ? ElectionStatus.ONGOING : ElectionStatus.UPCOMING;
      default:
        return status;
    }
  }

  public checkVote(vote: Vote): void {
    switch (this.resultsType?.name) {
      case ElectionResultsTypeNames.MULTIPLE_CHOICE:
        return MultiChoiceElection.checkVote(vote, this.voteType, this.resultsType.properties);
      case ElectionResultsTypeNames.APPROVAL:
        return ApprovalElection.checkVote(vote, this.voteType);
      case ElectionResultsTypeNames.BUDGET:
        return BudgetElection.checkVote(vote, this.resultsType, this.voteType);
      case ElectionResultsTypeNames.QUADRATIC:
        return QuadraticElection.checkVote(vote, this.resultsType, this.voteType);
      case ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION:
      default:
        return PublishedElection.checkVote(vote, this.voteType);
    }
  }

  public static checkVote(vote: Vote, voteType: IVoteType): void {
    if (voteType.uniqueChoices && new Set(vote.votes).size !== vote.votes.length) {
      throw new Error('Choices are not unique');
    }

    if (voteType.maxCount < vote.votes.length) {
      throw new Error('Invalid number of choices');
    }

    vote.votes.forEach((vote) => {
      if (vote > voteType.maxValue) {
        throw new Error('Invalid choice value');
      }
    });
  }

  get title(): MultiLanguage<string> {
    return super.title;
  }

  get description(): MultiLanguage<string> {
    return super.description;
  }

  get header(): string {
    return super.header;
  }

  get streamUri(): string {
    return super.streamUri;
  }

  get startDate(): Date {
    return super.startDate;
  }

  get endDate(): Date {
    return super.endDate;
  }

  get electionType(): IElectionType {
    return super.electionType;
  }

  get voteType(): IVoteType {
    return super.voteType;
  }

  get questions(): IQuestion[] {
    return super.questions;
  }

  get census(): PublishedCensus {
    return super.census;
  }

  get maxCensusSize(): number {
    return super.maxCensusSize;
  }

  get id(): string {
    return this._id;
  }

  get organizationId(): string {
    return this._organizationId;
  }

  get status(): ElectionStatus {
    return this._status;
  }

  get voteCount(): number {
    return this._voteCount;
  }

  get finalResults(): boolean {
    return this._finalResults;
  }

  get results(): Array<Array<string>> {
    return this._results;
  }

  get manuallyEnded(): boolean {
    return this._manuallyEnded;
  }

  get chainId(): string {
    return this._chainId;
  }

  get creationTime(): Date {
    return this._creationTime;
  }

  get metadataURL(): string {
    return this._metadataURL;
  }

  get resultsType(): ElectionResultsType {
    return this._resultsType;
  }

  get raw(): object {
    return this._raw;
  }

  get isValid(): boolean {
    return true;
  }
}
