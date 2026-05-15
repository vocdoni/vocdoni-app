import { MultiLanguage } from '../../util/lang';
import { CustomMeta, IElectionParameters, IVoteType } from './election';
import { UnpublishedElection } from './unpublished';
import {
  Choice,
  ElectionMetadata,
  ElectionResultsType,
  ElectionResultsTypeNames,
  getElectionMetadataTemplate,
} from '../metadata';
import { Vote } from '../vote';

export interface IQuadraticElectionParametersInfo extends IElectionParameters {
  minStep?: number;
  forceFullBudget?: boolean;
  quadraticCost?: number;
}

export interface IQuadraticElectionParametersWithCensusWeight extends IQuadraticElectionParametersInfo {
  useCensusWeightAsBudget: true;
}

export interface IQuadraticElectionParametersWithBudget extends IQuadraticElectionParametersInfo {
  useCensusWeightAsBudget: false;
  maxBudget: number;
}

export type IQuadraticElectionParameters =
  | IQuadraticElectionParametersWithCensusWeight
  | IQuadraticElectionParametersWithBudget;

/**
 * Represents a quadratic election
 */
export class QuadraticElection extends UnpublishedElection {
  private _minStep: number;
  private _forceFullBudget: boolean;
  private _quadraticCost: number;

  /**
   * Constructs a budget election
   *
   * @param params - Quadratic election parameters
   */
  public constructor(params: IQuadraticElectionParameters) {
    super(params);
    this.quadraticCost = params.quadraticCost ?? 2;
    this.minStep = params.minStep ?? 1;
    this.forceFullBudget = params.forceFullBudget ?? false;
    this.useCensusWeightAsBudget = params.useCensusWeightAsBudget;
    if ('maxBudget' in params) {
      this.maxBudget = params.maxBudget;
    }
  }

  public static from(params: IQuadraticElectionParameters) {
    return new QuadraticElection(params);
  }

  public addQuestion(
    title: string | MultiLanguage<string>,
    description: string | MultiLanguage<string>,
    choices: Array<{ title: string; value?: number; meta?: CustomMeta } | Choice>,
    meta?: CustomMeta
  ) {
    if (this.questions.length > 0) {
      throw new Error('This type of election can only have one question');
    }

    return super.addQuestion(
      title,
      description,
      choices.map((choice, index) => ({
        title: typeof choice.title === 'string' ? { default: choice.title } : choice.title,
        value: choice.value ?? index,
        meta: choice.meta,
      })),
      meta
    );
  }

  public generateVoteOptions(): object {
    const maxCount = this.questions[0].choices.length;
    const maxValue = 0;
    const maxVoteOverwrites = this.voteType.maxVoteOverwrites;
    const maxTotalCost = this.useCensusWeightAsBudget ? 0 : this.maxBudget;
    const costExponent = this.quadraticCost;

    return { maxCount, maxValue, maxVoteOverwrites, maxTotalCost, costExponent };
  }

  public generateEnvelopeType(): object {
    const serial = false; // TODO
    const anonymous = this.electionType.anonymous;
    const encryptedVotes = this.electionType.secretUntilTheEnd;
    const uniqueValues = false;
    const costFromWeight = this.useCensusWeightAsBudget;

    return { serial, anonymous, encryptedVotes, uniqueValues, costFromWeight };
  }

  public generateMetadata(): ElectionMetadata {
    const metadata = getElectionMetadataTemplate();

    metadata.type = {
      name: ElectionResultsTypeNames.QUADRATIC,
      properties: {
        useCensusWeightAsBudget: this.useCensusWeightAsBudget,
        maxBudget: this.useCensusWeightAsBudget ? null : this.maxBudget,
        forceFullBudget: this.forceFullBudget,
        minStep: this.minStep,
        quadraticCost: this.quadraticCost,
      },
    };

    return super.generateMetadata(metadata);
  }

  public static checkVote(vote: Vote, resultsType: ElectionResultsType, voteType: IVoteType): void {
    if (resultsType.name != ElectionResultsTypeNames.QUADRATIC) {
      throw new Error('Invalid results type');
    }

    if (voteType.maxCount != vote.votes.length) {
      throw new Error('Invalid number of choices');
    }

    if (!voteType.costFromWeight) {
      const voteWeight = vote.votes.reduce((a, b) => BigInt(a) + BigInt(b) ** BigInt(voteType.costExponent), 0);
      if (voteType.maxTotalCost < voteWeight) {
        throw new Error('Too much budget spent');
      }
      if (resultsType.properties.forceFullBudget && voteType.maxTotalCost != voteWeight) {
        throw new Error('Not full budget used');
      }
    }
  }

  get minStep(): number {
    return this._minStep;
  }

  set minStep(value: number) {
    this._minStep = value;
  }

  get forceFullBudget(): boolean {
    return this._forceFullBudget;
  }

  set forceFullBudget(value: boolean) {
    this._forceFullBudget = value;
  }

  get useCensusWeightAsBudget(): boolean {
    return this.voteType.costFromWeight;
  }

  set useCensusWeightAsBudget(value: boolean) {
    this.voteType.costFromWeight = value;
  }

  get maxBudget(): number {
    return this.voteType.maxTotalCost;
  }

  set maxBudget(value: number) {
    this.voteType.maxTotalCost = value;
  }

  get quadraticCost(): number {
    return this._quadraticCost;
  }

  set quadraticCost(value: number) {
    this._quadraticCost = value;
  }
}
