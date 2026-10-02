import type { CollectedMember, Member } from '~src/queries/members'
import { matchPastedValues, matchPastedValuesRemotely, parsePastedValues } from './pasteMatch'

const person = (id: string, fields: Partial<Member>) => ({ id, name: id, ...fields }) as CollectedMember

const anna = person('a1', { memberNumber: '0042', email: 'Anna@Example.test', nationalId: '12345678z' })
const jordi = person('j2', { memberNumber: '0043', email: 'jordi@example.test', nationalId: '87654321X' })
const carla = person('c3', { memberNumber: '100', email: 'carla@example.test' })

describe('parsePastedValues', () => {
  it('splits on new lines, commas, semicolons and tabs, trimming and unquoting', () => {
    expect(parsePastedValues(' 0042\r\n"0043";100,\t200\n\n ; \'300\' ')).toEqual(['0042', '0043', '100', '200', '300'])
  })

  it('lowercases emails and drops repeated values', () => {
    expect(parsePastedValues('Anna@Example.TEST\nanna@example.test\n0042\n0042\n')).toEqual([
      'anna@example.test',
      '0042',
    ])
  })
})

describe('matchPastedValues', () => {
  it('matches member numbers, emails and national IDs exactly, once per person', () => {
    const result = matchPastedValues(
      ['anna@example.test', '0042', '87654321x', '10', '0044', 'carla@example'],
      [anna, jordi, carla]
    )

    expect(result.found.map((member) => member.id)).toEqual(['a1', 'j2'])
    // "10" is part of "100" and "carla@example" of her email: search would find them, this doesn't
    expect(result.notFound).toEqual(['10', '0044', 'carla@example'])
  })
})

describe('matchPastedValuesRemotely', () => {
  it('searches value by value, four at a time, keeping exact matches only', async () => {
    let inFlight = 0
    let peak = 0
    const search = vi.fn(async (value: string) => {
      inFlight += 1
      peak = Math.max(peak, inFlight)
      await new Promise((resolve) => setTimeout(resolve, 1))
      inFlight -= 1
      // Search is a substring match: "10" finds Carla's "100" too
      return [anna, jordi, carla].filter((member) =>
        [member.memberNumber, member.email.toLowerCase(), member.nationalId].some((field) => field?.includes(value))
      )
    })
    const values = ['0042', '10', 'jordi@example.test', '0043', '999', '100']

    const result = await matchPastedValuesRemotely(values, search)

    expect(search).toHaveBeenCalledTimes(6)
    expect(peak).toBeLessThanOrEqual(4)
    expect(result.found.map((member) => member.id)).toEqual(['a1', 'j2', 'c3'])
    expect(result.notFound).toEqual(['10', '999'])
  })
})
