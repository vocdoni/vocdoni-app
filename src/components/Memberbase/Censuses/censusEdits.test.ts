import { ApiError } from '~components/Auth/api'
import { findCreatedMember, PartialRemovalError, questionsEmptiedBy, removeInChunks } from './censusEdits'

const conflict = (signedMemberIds: string[]) =>
  new ApiError(
    { error: 'member already signed', data: { signedMemberIds } } as never,
    new Response(null, { status: 409 })
  )

describe('removeInChunks', () => {
  it('removes batch by batch and counts what went', async () => {
    const send = vi.fn(async (batch: string[]) => batch.length)
    const ids = Array.from({ length: 1200 }, (_, index) => `m${index}`)

    expect(await removeInChunks(ids, send, 500)).toEqual({ status: 'done', removed: 1200 })
    expect(send.mock.calls.map(([batch]) => batch.length)).toEqual([500, 500, 200])
  })

  it('stops at a 409 and offers everyone left but those who already voted', async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce(2)
      .mockRejectedValueOnce(conflict(['c']))

    const outcome = await removeInChunks(['a', 'b', 'c', 'd', 'e'], send, 2)

    expect(outcome).toEqual({ status: 'blocked', removed: 2, signed: ['c'], remaining: ['d', 'e'] })
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
        { id: '1', email: 'anna.vila2@example.org' },
        { id: '2', email: 'anna.vila@example.org' },
      ])
    )

    expect(await findCreatedMember(fetchPage, { email: 'Anna.Vila@example.org', name: 'Anna' })).toMatchObject({
      id: '2',
    })
    expect(fetchPage).toHaveBeenCalledWith({ page: 1, limit: 100, search: 'Anna.Vila@example.org' })
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
