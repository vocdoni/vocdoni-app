import { ApiError } from '~components/Auth/api'
import {
  findCreatedMember,
  missingLoginDataIds,
  PartialRemovalError,
  questionsEmptiedBy,
  removeInChunks,
} from './censusEdits'

const conflict = (signedMemberIds: string[]) =>
  new ApiError(
    { error: 'member already signed', data: { signedMemberIds } } as never,
    new Response(null, { status: 409 })
  )

describe('removeInChunks', () => {
  it('removes batch by batch and counts what went', async () => {
    const send = vi.fn(async (batch: string[]) => batch.length)
    const ids = Array.from({ length: 1200 }, (_, index) => `m${index}`)

    expect(await removeInChunks(ids, send, 500)).toEqual({ status: 'done', removed: 1200, removedIds: ids })
    expect(send.mock.calls.map(([batch]) => batch.length)).toEqual([500, 500, 200])
  })

  it('stops at a 409 and offers everyone left but those who already voted', async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce(2)
      .mockRejectedValueOnce(conflict(['c']))

    const outcome = await removeInChunks(['a', 'b', 'c', 'd', 'e'], send, 2)

    expect(outcome).toEqual({
      status: 'blocked',
      removed: 2,
      removedIds: ['a', 'b'],
      signed: ['c'],
      remaining: ['d', 'e'],
    })
  })

  it("can't say who went when a batch removed fewer than it was sent", async () => {
    const send = vi.fn().mockResolvedValueOnce(1)

    expect(await removeInChunks(['a', 'b'], send, 2)).toEqual({ status: 'done', removed: 1, removedIds: null })
  })

  it('reports how many went before any other failure', async () => {
    const send = vi.fn().mockResolvedValueOnce(2).mockRejectedValueOnce(new Error('boom'))

    const error = await removeInChunks(['a', 'b', 'c'], send, 2).catch((caught) => caught)

    expect(error).toBeInstanceOf(PartialRemovalError)
    expect(error).toMatchObject({ removed: 2, message: 'boom' })
  })
})

describe('questionsEmptiedBy', () => {
  const questions = [
    { id: 'q1', title: { default: 'Board' }, eligibleMemberIds: ['a', 'b'] },
    { id: 'q2', title: { default: 'Budget' }, eligibleMemberIds: [] },
    { id: 'q3', title: { default: 'Treasurer' } },
  ]

  it('names the restricted questions a removal would leave with nobody', () => {
    expect(questionsEmptiedBy(questions as never, ['a', 'b', 'z'])).toEqual(['Board'])
  })

  it('lets a removal through while someone allowed stays, or when nothing is restricted', () => {
    expect(questionsEmptiedBy(questions as never, ['a'])).toEqual([])
    expect(questionsEmptiedBy(undefined, ['a'])).toEqual([])
  })
})

describe('findCreatedMember', () => {
  const page = (members: unknown[]) => ({ members, pagination: {} }) as never

  it('finds a new person by their exact email, not a partial match', async () => {
    const fetchPage = vi.fn(async () =>
      page([
        { id: '1', email: 'anna.vila2@example.org', name: 'Anna' },
        { id: '2', email: 'anna.vila@example.org', name: 'Anna' },
      ])
    )

    expect(await findCreatedMember(fetchPage, { email: 'Anna.Vila@example.org', name: 'Anna' })).toMatchObject({
      id: '2',
    })
    expect(fetchPage).toHaveBeenCalledWith({ page: 1, limit: 100, search: 'Anna.Vila@example.org' })
  })

  it('skips an older member sharing the email, and gives up when it can’t tell who is new', async () => {
    const older = vi.fn(async () =>
      page([
        { id: 'old', email: 'anna@example.org', name: 'Anna', surname: 'Puig' },
        { id: 'new', email: 'anna@example.org', name: 'Anna', surname: 'Vila' },
      ])
    )
    expect(await findCreatedMember(older, { email: 'anna@example.org', name: 'Anna', surname: 'Vila' })).toMatchObject({
      id: 'new',
    })

    const twins = vi.fn(async () =>
      page([
        { id: 'old', email: 'anna@example.org', name: 'Anna' },
        { id: 'new', email: 'anna@example.org', name: 'Anna' },
      ])
    )
    expect(await findCreatedMember(twins, { email: 'anna@example.org', name: 'Anna' })).toBeNull()
  })

  it('falls back to a name nobody else has, and gives up when it is shared', async () => {
    const unique = vi.fn(async () => page([{ id: '9', name: 'Pere', surname: 'Roca' }]))
    expect(await findCreatedMember(unique, { name: 'Pere', surname: 'Roca' })).toMatchObject({ id: '9' })

    const shared = vi.fn(async () =>
      page([
        { id: '8', name: 'Pere', surname: 'Roca' },
        { id: '9', name: 'Pere', surname: 'Roca' },
      ])
    )
    expect(await findCreatedMember(shared, { name: 'Pere', surname: 'Roca' })).toBeNull()
  })
})

describe('missingLoginDataIds', () => {
  it('reads who a census left out for lacking sign-in details, among the ids sent', () => {
    expect(
      missingLoginDataIds(
        [
          'm1: missing required auth data',
          'm2: invalid data',
          'census c9: not found',
          'm7: missing required auth data',
        ],
        ['m1', 'm2', 'm3']
      )
    ).toEqual(['m1'])
    expect(missingLoginDataIds(undefined, ['m1'])).toEqual([])
  })
})
