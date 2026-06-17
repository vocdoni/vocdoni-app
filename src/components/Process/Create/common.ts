import { ElectionResultsTypeNames } from '@vocdoni/sdk'
import { CensusSpreadsheetManager } from '~components/Process/Census/Spreadsheet/CensusSpreadsheetManager'
import { Web3Address } from '~components/Process/Census/Web3'
import { CensusTypes } from '../Census/CensusType'
import { TwoFAMethod } from './VoterAuthentication/utils'

export enum SelectorTypes {
  Multiple = ElectionResultsTypeNames.MULTIPLE_CHOICE,
  Single = ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
}

export type DefaultQuestionsType = Record<SelectorTypes, Question>

export enum TemplateTypes {
  AnnualGeneralMeeting = 'annual_general_meeting',
  Election = 'election',
  ParticipatoryBudgeting = 'participatory_budgeting',
}

export type TemplateConfig = Partial<Process>

export interface Option {
  option: string
  description?: string
  image?: string
}

type Question = {
  title: string
  description: string
  options: Option[]
}

export type Census = {
  id: string
  credentials: string[]
  size: number
  use2FA: boolean
  use2FAMethod: TwoFAMethod
}

export type Process = {
  title: string
  description: string
  autoStart: boolean
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  extendedInfo: boolean
  questionType: SelectorTypes
  questions: Question[]
  maxNumberOfChoices: number | null
  minNumberOfChoices: number | null
  // null = the admin hasn't chosen yet (no default selection in the editor).
  resultVisibility: 'live' | 'hidden' | null
  weightedVote: boolean | null
  voterPrivacy: 'public' | 'anonymous'
  groupId: string
  census?: Census | null
  censusType: CensusTypes
  streamUri?: string
  addresses?: Web3Address[]
  draft?: boolean
  spreadsheet?: CensusSpreadsheetManager | null
}

export const DefaultQuestions: DefaultQuestionsType = {
  [SelectorTypes.Single]: {
    title: '',
    description: '',
    options: [{ option: '' }, { option: '' }],
  },
  [SelectorTypes.Multiple]: {
    title: '',
    description: '',
    options: [{ option: '' }, { option: '' }],
  },
}

export const defaultProcessValues: Process = {
  title: '',
  description: '',
  autoStart: true,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  extendedInfo: false,
  questionType: SelectorTypes.Single,
  questions: [DefaultQuestions[SelectorTypes.Single]],
  maxNumberOfChoices: null,
  minNumberOfChoices: null,
  resultVisibility: null,
  weightedVote: null,
  voterPrivacy: 'public',
  groupId: '',
  census: null,
  censusType: CensusTypes.CSP,
  streamUri: '',
  addresses: [],
  spreadsheet: null,
}

export const TemplateConfigs: Record<TemplateTypes, TemplateConfig> = {
  [TemplateTypes.AnnualGeneralMeeting]: {
    questionType: SelectorTypes.Single,
    extendedInfo: false,
    questions: [
      { title: '', description: '', options: [{ option: '' }, { option: '' }] },
      { title: '', description: '', options: [{ option: '' }, { option: '' }] },
      { title: '', description: '', options: [{ option: '' }, { option: '' }] },
    ],
  },
  [TemplateTypes.Election]: {
    questionType: SelectorTypes.Multiple,
    extendedInfo: false,
    minNumberOfChoices: 1,
    maxNumberOfChoices: 3,
    questions: [
      {
        title: '',
        description: '',
        options: [{ option: '' }, { option: '' }, { option: '' }],
      },
    ],
  },
  [TemplateTypes.ParticipatoryBudgeting]: {
    questionType: SelectorTypes.Multiple,
    extendedInfo: true,
    minNumberOfChoices: 1,
    maxNumberOfChoices: 3,
    questions: [
      {
        title: '',
        description: '',
        options: [
          { option: '', description: '' },
          { option: '', description: '' },
          { option: '', description: '' },
        ],
      },
    ],
  },
}
