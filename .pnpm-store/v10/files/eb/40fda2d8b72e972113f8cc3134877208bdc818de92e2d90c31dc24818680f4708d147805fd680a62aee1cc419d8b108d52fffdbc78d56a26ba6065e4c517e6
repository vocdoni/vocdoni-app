import { MultiLanguage } from '../../util/lang';
import { CustomMeta, IElectionParameters, IVoteType } from './election';
import { UnpublishedElection } from './unpublished';
import { Choice, ElectionMetadata, ElectionResultsTypeNames, getElectionMetadataTemplate } from '../metadata';
import { Vote } from '../vote';

export interface IApprovalElectionParameters extends IElectionParameters {}

/**
 * Represents an approval election
 */
export class ApprovalElection extends UnpublishedElection {
  /**
   * Constructs an approval election
   *
   * @param params - Approval election parameters
   */
  public constructor(params: IApprovalElectionParameters) {
    super(params);
  }

  public static from(params: IApprovalElectionParameters) {
    return new ApprovalElection(params);
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
    const maxValue = 1;
    const maxVoteOverwrites = this.voteType.maxVoteOverwrites;
    const maxTotalCost = 0;
    const costExponent = this.voteType.costExponent;

    return { maxCount, maxValue, maxVoteOverwrites, maxTotalCost, costExponent };
  }

  public generateEnvelopeType(): object {
    const serial = false; // TODO
    const anonymous = this.electionType.anonymous;
    const encryptedVotes = this.electionType.secretUntilTheEnd;
    const uniqueValues = false;
    const costFromWeight = false;

    return { serial, anonymous, encryptedVotes, uniqueValues, costFromWeight };
  }

  public generateMetadata(): ElectionMetadata {
    const metadata = getElectionMetadataTemplate();

    metadata.type = {
      name: ElectionResultsTypeNames.APPROVAL,
      properties: {
        rejectValue: 0,
        acceptValue: 1,
      },
    };

    return super.generateMetadata(metadata);
  }

  public static checkVote(vote: Vote, voteType: IVoteType): void {
    if (voteType.maxCount != vote.votes.length) {
      throw new Error('Invalid number of choices');
    }

    vote.votes.forEach((vote) => {
      if (vote > voteType.maxValue) {
        throw new Error('Invalid choice value');
      }
    });
  }
}
