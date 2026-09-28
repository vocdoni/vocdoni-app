import type { Process } from './common'
import { SelectorTypes } from './common'
import { getScheduleIssues, type ScheduleIssue } from './schedule'

export type SectionId = 'ballot' | 'voters' | 'schedule' | 'privacy'

export const SECTIONS: SectionId[] = ['ballot', 'voters', 'schedule', 'privacy']

export type IssueCode =
  | 'title_missing'
  | 'question_title_missing'
  | 'option_missing'
  | 'limits_invalid'
  | 'group_missing'
  | 'group_empty'
  | 'sign_in_missing'
  | ScheduleIssue

export type ReadinessIssue = {
  section: SectionId
  code: IssueCode
  /** The form field to focus to fix it, when there is one */
  field?: string
  /** The question it belongs to, counting from 0 */
  question?: number
}

export type SectionReadiness = { ready: boolean; issues: ReadinessIssue[] }

export type Readiness = {
  sections: Record<SectionId, SectionReadiness>
  readyCount: number
  total: number
  issues: ReadinessIssue[]
  first?: ReadinessIssue
}

type ReadinessContext = {
  now: Date
  maxDays?: number
  /** Members in the chosen group, when known */
  groupMembers?: number
}

const isBlank = (value?: string) => !value?.trim()

const ballotIssues = (values: Process): ReadinessIssue[] => {
  const issues: ReadinessIssue[] = []
  if (isBlank(values.title)) issues.push({ section: 'ballot', code: 'title_missing', field: 'title' })

  values.questions.forEach((question, index) => {
    if (isBlank(question.title)) {
      issues.push({
        section: 'ballot',
        code: 'question_title_missing',
        field: `questions.${index}.title`,
        question: index,
      })
    }
    // Empty options beyond the first two are dropped on review, so only the filled ones count
    const filled = question.options.filter((option) => !isBlank(option.option)).length
    if (filled < 2) {
      const empty = question.options.findIndex((option) => isBlank(option.option))
      issues.push({
        section: 'ballot',
        code: 'option_missing',
        field: `questions.${index}.options.${Math.max(empty, 0)}.option`,
        question: index,
      })
    }
    const { minNumberOfChoices: min, maxNumberOfChoices: max } = question
    if (question.type === SelectorTypes.Multiple && min != null && max != null && max < min) {
      issues.push({ section: 'ballot', code: 'limits_invalid', field: `answer-rule-${index}`, question: index })
    }
  })

  return issues
}

const voterIssues = (values: Process, groupMembers?: number): ReadinessIssue[] => {
  if (!values.groupId) return [{ section: 'voters', code: 'group_missing', field: 'groupId' }]

  const issues: ReadinessIssue[] = []
  if (groupMembers === 0) issues.push({ section: 'voters', code: 'group_empty', field: 'groupId' })
  const census = values.census
  if (!census || (!census.credentials?.length && !census.use2FA)) {
    issues.push({ section: 'voters', code: 'sign_in_missing' })
  }
  return issues
}

const scheduleField = (issue: ScheduleIssue) => (issue.startsWith('start') ? 'startDate' : 'endDate')

/**
 * What's left before the vote can be published, section by section. It reads the values as they
 * are, not the form's validation errors, so it's right before anyone has pressed a button.
 */
export const getReadiness = (values: Process, { now, maxDays, groupMembers }: ReadinessContext): Readiness => {
  const bySection: Record<SectionId, ReadinessIssue[]> = {
    ballot: ballotIssues(values),
    voters: voterIssues(values, groupMembers),
    schedule: getScheduleIssues(values, now, maxDays).map((code) => ({
      section: 'schedule' as const,
      code,
      field: scheduleField(code),
    })),
    privacy: [],
  }

  const sections = Object.fromEntries(
    SECTIONS.map((id) => [id, { ready: bySection[id].length === 0, issues: bySection[id] }])
  ) as Record<SectionId, SectionReadiness>
  const issues = SECTIONS.flatMap((id) => bySection[id])

  return {
    sections,
    readyCount: SECTIONS.filter((id) => sections[id].ready).length,
    total: SECTIONS.length,
    issues,
    first: issues[0],
  }
}
