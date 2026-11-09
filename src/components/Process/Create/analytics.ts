import { VocdoniApiError } from '@vocdoni/api-client'
import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { ApiError } from '~components/Auth/api'
import { Census, Process, SelectorTypes } from './common'

// Pure helpers that turn create-form state into analytics properties. They only
// ever return primitives describing the *shape* of a vote, never its content.

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Dotted path of the first failing field in a react-hook-form error tree, e.g.
 * `questions.0.options.2.option`. Answers "which field inside `questions`",
 * which the top-level keys alone cannot.
 */
export const getFirstErrorPath = (errors: unknown, prefix = ''): string | undefined => {
  if (!errors || typeof errors !== 'object') return undefined

  for (const [key, value] of Object.entries(errors)) {
    // `ref` points at the DOM element, not at a nested error
    if (key === 'ref' || !value || typeof value !== 'object') continue
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof (value as { type?: unknown }).type === 'string') return path
    const nested = getFirstErrorPath(value, path)
    if (nested) return nested
  }

  return undefined
}

/** HTTP status and backend error code of a failed API call; `status: 0` when there was no response. */
export const getApiErrorProps = (error: unknown): { status: number; error_code?: number } => {
  if (error instanceof VocdoniApiError) {
    return { status: error.status, ...(error.code !== undefined && { error_code: error.code }) }
  }
  if (error instanceof ApiError) {
    const code = error.apiError?.code
    return { status: error.response?.status ?? 0, ...(code !== undefined && { error_code: code }) }
  }
  return { status: 0 }
}

/** A process can mix question types, so report the shared one, or `mixed` (as the drafts list does). */
export const getQuestionTypes = (questions: Process['questions'] = []): 'single' | 'multiple' | 'mixed' => {
  const types = new Set(questions.map((question) => question.type))
  if (types.size > 1) return 'mixed'
  return types.has(SelectorTypes.Multiple) ? 'multiple' : 'single'
}

/** How voters prove who they are: member fields alone, or followed by an email/SMS code. */
export const getVoterAuth = (census?: Census | null) => {
  const authFieldsCount = census?.credentials?.length ?? 0
  let voterAuth = 'member_fields'
  if (census?.use2FA) {
    switch (census.use2FAMethod) {
      case 'email':
        voterAuth = 'email_2fa'
        break
      case 'sms':
        voterAuth = 'sms_2fa'
        break
      case 'voter_choice':
        voterAuth = 'email_or_sms_2fa'
        break
    }
  }
  return { voter_auth: voterAuth, auth_fields_count: authFieldsCount }
}

/** Voting period in days (one decimal). An auto-started vote runs from now. */
export const getDurationDays = (
  request: Pick<CreateVotingProcessRequest, 'startDate' | 'endDate'>,
  now = Date.now()
): number | undefined => {
  if (!request.endDate) return undefined
  const start = request.startDate ? new Date(request.startDate).getTime() : now
  const end = new Date(request.endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined
  return Math.round(((end - start) / DAY_MS) * 10) / 10
}

/**
 * Days since a draft was created. Drafts carry no timestamps, but their id is a
 * Mongo ObjectID whose first four bytes are the creation time in seconds.
 */
export const getDraftAgeDays = (draftId: string | null | undefined, now = Date.now()): number | undefined => {
  if (!draftId || !/^[0-9a-f]{24}$/i.test(draftId)) return undefined
  const createdAt = parseInt(draftId.slice(0, 8), 16) * 1000
  return Math.max(0, Math.floor((now - createdAt) / DAY_MS))
}
