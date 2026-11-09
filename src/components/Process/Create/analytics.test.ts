import { VocdoniApiError } from '@vocdoni/api-client'
import { ApiError } from '~components/Auth/api'
import {
  getApiErrorProps,
  getDraftAgeDays,
  getDurationDays,
  getFirstErrorPath,
  getQuestionTypes,
  getVoterAuth,
} from './analytics'
import { defaultQuestion, SelectorTypes } from './common'

const DAY_MS = 24 * 60 * 60 * 1000

/** A Mongo ObjectID minted at `time`: its first four bytes are the creation second. */
const objectIdAt = (time: number) =>
  Math.floor(time / 1000)
    .toString(16)
    .padStart(8, '0') + '0'.repeat(16)

describe('getFirstErrorPath', () => {
  it('walks into nested questions and options down to the failing field', () => {
    const errors = {
      questions: [
        undefined,
        { options: [undefined, undefined, { option: { type: 'required', message: 'Required', ref: {} } }] },
      ],
      endDate: { type: 'required', message: 'Required' },
    }

    expect(getFirstErrorPath(errors)).toBe('questions.1.options.2.option')
  })

  it('reports array-level and top-level errors as they are keyed', () => {
    expect(getFirstErrorPath({ questions: { root: { type: 'min' } } })).toBe('questions.root')
    expect(getFirstErrorPath({ title: { type: 'required', ref: { name: 'title' } } })).toBe('title')
  })

  it('has nothing to report for an empty error tree', () => {
    expect(getFirstErrorPath({})).toBeUndefined()
  })
})

describe('getApiErrorProps', () => {
  it('reads the status and backend code of an API client error', () => {
    expect(getApiErrorProps(new VocdoniApiError(403, {}, 'limit', 40031))).toEqual({ status: 403, error_code: 40031 })
    expect(getApiErrorProps(new VocdoniApiError(502, {}, 'bad gateway'))).toEqual({ status: 502 })
  })

  it('reads the legacy API wrapper error', () => {
    const error = new ApiError({ error: 'limit', code: 40031 }, new Response(null, { status: 400 }))

    expect(getApiErrorProps(error)).toEqual({ status: 400, error_code: 40031 })
  })

  it('reports status 0 when no response came back', () => {
    expect(getApiErrorProps(new TypeError('Failed to fetch'))).toEqual({ status: 0 })
  })
})

describe('getQuestionTypes', () => {
  const single = { ...defaultQuestion, type: SelectorTypes.Single }
  const multiple = { ...defaultQuestion, type: SelectorTypes.Multiple }

  it('reports the shared question type, or mixed', () => {
    expect(getQuestionTypes([single, single])).toBe('single')
    expect(getQuestionTypes([multiple])).toBe('multiple')
    expect(getQuestionTypes([single, multiple])).toBe('mixed')
  })
})

describe('getVoterAuth', () => {
  it('tells member fields alone from each second factor', () => {
    const credentials = ['name', 'memberNumber']

    expect(getVoterAuth({ credentials, use2FA: false, use2FAMethod: 'email' })).toEqual({
      voter_auth: 'member_fields',
      auth_fields_count: 2,
    })
    expect(getVoterAuth({ credentials, use2FA: true, use2FAMethod: 'email' }).voter_auth).toBe('email_2fa')
    expect(getVoterAuth({ credentials, use2FA: true, use2FAMethod: 'sms' }).voter_auth).toBe('sms_2fa')
    expect(getVoterAuth({ credentials, use2FA: true, use2FAMethod: 'voter_choice' }).voter_auth).toBe(
      'email_or_sms_2fa'
    )
    expect(getVoterAuth(null)).toEqual({ voter_auth: 'member_fields', auth_fields_count: 0 })
  })
})

describe('getDurationDays', () => {
  it('measures the voting period, from now for an auto-started vote', () => {
    const now = Date.parse('2026-09-01T10:00:00Z')

    expect(getDurationDays({ startDate: '2026-09-02T10:00:00Z', endDate: '2026-09-09T10:00:00Z' }, now)).toBe(7)
    expect(getDurationDays({ endDate: '2026-09-01T22:00:00Z' }, now)).toBe(0.5)
    expect(getDurationDays({ endDate: undefined } as never, now)).toBeUndefined()
  })
})

describe('getDraftAgeDays', () => {
  it('reads the creation time out of the ObjectID', () => {
    const now = Date.now()

    expect(getDraftAgeDays(objectIdAt(now - 3.5 * DAY_MS), now)).toBe(3)
    expect(getDraftAgeDays(objectIdAt(now), now)).toBe(0)
  })

  it('has no age for ids that are not ObjectIDs', () => {
    expect(getDraftAgeDays('draft-1')).toBeUndefined()
    expect(getDraftAgeDays(null)).toBeUndefined()
  })
})
