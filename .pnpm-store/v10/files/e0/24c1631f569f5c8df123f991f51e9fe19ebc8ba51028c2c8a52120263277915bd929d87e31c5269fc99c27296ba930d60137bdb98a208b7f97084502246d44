import { MultiLanguage } from '../../util/lang';
import { CustomMeta, IElectionParameters, IVoteType } from './election';
import { UnpublishedElection } from './unpublished';
import {
  Choice,
  ChoiceProperties,
  ElectionMetadata,
  ElectionResultsTypeNames,
  getElectionMetadataTemplate,
} from '../metadata';
import { Vote } from '../vote';
import invariant from 'tiny-invariant';

export interface IMultiChoiceElectionParameters extends IElectionParameters {
  maxNumberOfChoices: number;
  minNumberOfChoices?: number;
  canRepeatChoices?: boolean;
  canAbstain?: boolean;
}

/**
 * Represents a multi choice election
 */
export class MultiChoiceElection extends UnpublishedElection {
  private _canAbstain: boolean;
  private _minNumberOfChoices: number;

  /**
   * Constructs a multi choice election
   *
   * @param params - Multi choice election parameters
   */
  public constructor(params: IMultiChoiceElectionParameters) {
    super(params);
    this.maxNumberOfChoices = params.maxNumberOfChoices;
    this.minNumberOfChoices = params.minNumberOfChoices ?? null;
    this.canRepeatChoices = params.canRepeatChoices ?? false;
    this.canAbstain = params.canAbstain ?? false;
  }

  public static from(params: IMultiChoiceElectionParameters) {
    return new MultiChoiceElection(params);
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
    const maxCount = this.maxNumberOfChoices;
    const maxValue =
      this.questions[0].choices.length - 1 + (this.canAbstain ? (this.canRepeatChoices ? 1 : maxCount) : 0);
    const maxVoteOverwrites = this.voteType.maxVoteOverwrites;
    const maxTotalCost = 0;
    const costExponent = this.voteType.costExponent;

    return { maxCount, maxValue, maxVoteOverwrites, maxTotalCost, costExponent };
  }

  public generateEnvelopeType(): object {
    const serial = false; // TODO
    const anonymous = this.electionType.anonymous;
    const encryptedVotes = this.electionType.secretUntilTheEnd;
    const uniqueValues = !this.canRepeatChoices;
    const costFromWeight = this.voteType.costFromWeight;

    return { serial, anonymous, encryptedVotes, uniqueValues, costFromWeight };
  }

  public generateMetadata(): ElectionMetadata {
    const metadata = getElectionMetadataTemplate();

    metadata.type = {
      name: ElectionResultsTypeNames.MULTIPLE_CHOICE,
      properties: {
        canAbstain: this.canAbstain,
        abstainValues: [...new Array(this.canAbstain ? (this.canRepeatChoices ? 1 : this.maxNumberOfChoices) : 0)].map(
          (_v, index) => String(index + this.questions[0].choices.length)
        ),
        repeatChoice: this.canRepeatChoices,
        numChoices: {
          min: this.minNumberOfChoices,
          max: this.maxNumberOfChoices,
        },
      },
    };

    return super.generateMetadata(metadata);
  }

  public static checkVote(vote: Vote, voteType: IVoteType, voteProperties: ChoiceProperties): void {
    if (voteType.uniqueChoices && new Set(vote.votes).size !== vote.votes.length) {
      throw new Error('Choices are not unique');
    }

    if (vote.votes.length > voteType.maxCount) {
      throw new Error('Invalid number of choices, maximum is ' + voteType.maxCount);
    }

    if (vote.votes.length < voteProperties.numChoices.min) {
      throw new Error('Invalid number of choices, minimum is ' + voteProperties.numChoices.min);
    }

    vote.votes.forEach((vote) => {
      if (vote > voteType.maxValue) {
        throw new Error('Invalid choice value');
      }
    });
  }

  get maxNumberOfChoices(): number {
    return this.voteType.maxCount;
  }

  set maxNumberOfChoices(value: number) {
    invariant(
      value >= (this.minNumberOfChoices ?? 0),
      'Max number of choices must be greater than or equal to min number of choices'
    );
    this.voteType.maxCount = value;
  }

  get minNumberOfChoices(): number {
    return this._minNumberOfChoices;
  }

  set minNumberOfChoices(value: number) {
    invariant(
      value <= this.maxNumberOfChoices,
      'Min number of choices must be less than or equal to max number of choices'
    );
    this._minNumberOfChoices = value;
  }

  get canRepeatChoices(): boolean {
    return !this.voteType.uniqueChoices;
  }

  set canRepeatChoices(value: boolean) {
    this.voteType.uniqueChoices = !value;
  }

  get canAbstain(): boolean {
    return this._canAbstain;
  }

  set canAbstain(value: boolean) {
    this._canAbstain = value;
  }
}
