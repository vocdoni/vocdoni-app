import { object, array, string, number } from 'yup';
import { MultiLanguage, multiLanguageStringKeys } from '../../util/lang';
import { CustomMeta } from '../election';

/**
 * Asserts that the given metadata is valid.
 * Throws an exception if it is not.
 */
export function checkValidElectionMetadata(electionMetadata: ElectionMetadata): ElectionMetadata {
  if (typeof electionMetadata != 'object') throw new Error('The metadata must be a JSON object');
  else if (electionMetadata.questions.length < 1) throw new Error('The metadata needs to have at least one question');
  else if (electionMetadata.questions.some((q) => !Array.isArray(q.choices) || q.choices.length < 2))
    throw new Error('All questions need to have at least two choices');

  try {
    electionMetadataSchema.validateSync(electionMetadata);
    return electionMetadataSchema.cast(electionMetadata) as ElectionMetadata;
  } catch (err) {
    if (Array.isArray(err.errors)) throw new Error('ValidationError: ' + err.errors.join(', '));
    throw err;
  }
}
export type Choice = Pick<IChoice, 'title' | 'value' | 'meta'>;
export type Question = Pick<IQuestion, 'title' | 'description' | 'choices' | 'meta'>;

export interface IChoice {
  title: MultiLanguage<string>;
  value: number;
  meta?: CustomMeta;
  results?: string;
  answer?: number;
}

export interface IQuestion {
  title: MultiLanguage<string>;
  description?: MultiLanguage<string>;
  numAbstains?: string;
  meta?: CustomMeta;
  choices: Array<IChoice>;
}

export enum ElectionResultsTypeNames {
  SINGLE_CHOICE_MULTIQUESTION = 'single-choice-multiquestion',
  MULTIPLE_CHOICE = 'multiple-choice',
  BUDGET = 'budget-based',
  APPROVAL = 'approval',
  QUADRATIC = 'quadratic',
}

export type AbstainProperties = {
  canAbstain: boolean;
  abstainValues: Array<string>;
};

export type ChoiceProperties = {
  repeatChoice: boolean;
  numChoices: {
    min: number;
    max: number;
  };
};

export type BudgetProperties = {
  useCensusWeightAsBudget: boolean;
  maxBudget: number;
  minStep: number;
  forceFullBudget: boolean;
};

export type ApprovalProperties = {
  rejectValue: number;
  acceptValue: number;
};

export type ElectionResultsType =
  | {
      name: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION;
      properties: {};
    }
  | {
      name: ElectionResultsTypeNames.MULTIPLE_CHOICE;
      properties: AbstainProperties & ChoiceProperties;
    }
  | {
      name: ElectionResultsTypeNames.BUDGET;
      properties: BudgetProperties;
    }
  | {
      name: ElectionResultsTypeNames.APPROVAL;
      properties: ApprovalProperties;
    }
  | {
      name: ElectionResultsTypeNames.QUADRATIC;
      properties: BudgetProperties & {
        quadraticCost: number;
      };
    };

const electionMetadataSchema = object()
  .shape({
    version: string()
      .matches(/^[0-9]\.[0-9]$/)
      .required(),
    title: object().shape(multiLanguageStringKeys).required(),
    description: object().shape(multiLanguageStringKeys).required(),
    media: object().shape({
      header: string().optional(),
      streamUri: string().optional(),
    }),
    meta: object().optional(),
    questions: array()
      .of(
        object().shape({
          title: object().shape(multiLanguageStringKeys).required(),
          description: object().shape(multiLanguageStringKeys).optional(),
          choices: array()
            .of(
              object().shape({
                title: object().shape(multiLanguageStringKeys).required(),
                value: number().integer().required(),
              })
            )
            .required(),
        })
      )
      .required(),
    type: object()
      .shape({
        name: string()
          .required()
          .oneOf([
            ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
            ElectionResultsTypeNames.MULTIPLE_CHOICE,
            ElectionResultsTypeNames.BUDGET,
            ElectionResultsTypeNames.APPROVAL,
            ElectionResultsTypeNames.QUADRATIC,
          ]),
        properties: object().optional().nullable(),
      })
      .required(),
  })
  .unknown(true); // allow deprecated or unknown fields beyond the required ones

type ProtocolVersion = '1.1' | '1.2';

/**
 * JSON metadata. Intended to be stored on IPFS or similar.
 * More info: https://vocdoni.io/docs/#/architecture/components/process?id=process-metadata-json
 */
export interface ElectionMetadata {
  version: ProtocolVersion; // Version of the metadata schema used
  title: MultiLanguage<string>;
  description: MultiLanguage<string>;
  media: {
    header?: string;
    streamUri?: string;
  };
  /** Arbitrary key/value data that specific applications can use for their own needs */
  meta?: {
    [key: string]: any;
  };
  questions: Array<IQuestion>;
  type: ElectionResultsType;
}

export const ElectionMetadataTemplate: ElectionMetadata = {
  version: '1.2',
  title: {
    default: '', // Universal Basic Income
  },
  description: {
    default: '', // ## Markdown text goes here\n### Abstract
  },
  media: {
    header: '', // Content URI
    streamUri: '',
  },
  meta: {},
  questions: [
    {
      title: {
        default: '', // Should universal basic income become a human right?
      },
      description: {
        default: '', // ## Markdown text goes here\n### Abstract
      },
      choices: [
        {
          title: {
            default: 'Yes',
          },
          value: 0,
        },
        {
          title: {
            default: 'No',
          },
          value: 1,
        },
      ],
    },
  ],
  type: {
    name: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
    properties: {},
  },
};

export const getElectionMetadataTemplate = () => {
  return JSON.parse(JSON.stringify(ElectionMetadataTemplate));
};
