import { CensusTypes } from '../Census/CensusType'
import { TwoFAMethod } from './VoterAuthentication/utils'

export enum SelectorTypes {
  Single = 'singleChoice',
  Multiple = 'multiChoice',
}

export interface Option {
  option: string
  description?: string
  image?: string
}

/**
 * Every question carries its own type, presentation and choice limits, so a
 * single process can mix single- and multiple-choice questions (each question
 * becomes its own on-chain election).
 */
export type Question = {
  title: string
  description: string
  options: Option[]
  type: SelectorTypes
  extendedInfo: boolean
  maxNumberOfChoices: number | null
  minNumberOfChoices: number | null
}

export type Census = {
  credentials: string[]
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
  questions: Question[]
  resultVisibility: 'live' | 'hidden'
  weightedVote: boolean
  anonymousVoting: boolean
  groupId: string
  census?: Census | null
  censusType: CensusTypes
  streamUri?: string
  draft?: boolean
}

export const defaultQuestion: Question = {
  title: '',
  description: '',
  options: [{ option: '' }, { option: '' }],
  type: SelectorTypes.Single,
  extendedInfo: false,
  maxNumberOfChoices: null,
  minNumberOfChoices: null,
}

export const defaultProcessValues: Process = {
  title: '',
  description: '',
  autoStart: true,
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  questions: [defaultQuestion],
  resultVisibility: 'hidden',
  weightedVote: false,
  anonymousVoting: false,
  groupId: '',
  census: null,
  censusType: CensusTypes.CSP,
  streamUri: '',
}
