import type { VotingProcessResponse } from '@vocdoni/api-types'

const DAY = 24 * 60 * 60 * 1000

type Options = {
  status?: string
  start?: number
  end?: number
  published?: boolean
  updatedAt?: string
  size?: number
}

/** A process as `GET /processes` returns it, with dates relative to now. */
export const makeProcess = (
  id: string,
  title: string,
  { status = 'ONGOING', start = -1, end = 3, published = true, updatedAt, size = 10 }: Options = {}
): VotingProcessResponse =>
  ({
    id,
    orgAddress: 'org',
    published,
    title: { default: title },
    startDate: new Date(Date.now() + start * DAY).toISOString(),
    endDate: new Date(Date.now() + end * DAY).toISOString(),
    census: { size, authFields: [], twoFaFields: ['email'] },
    questions: [
      { id: `${id}-q`, upstreamId: `up-${id}`, title: { default: 'Q' }, choices: [], type: 'singlechoice', status },
    ],
    ...(updatedAt ? { updatedAt } : {}),
  }) as unknown as VotingProcessResponse

export const DAYS = DAY
