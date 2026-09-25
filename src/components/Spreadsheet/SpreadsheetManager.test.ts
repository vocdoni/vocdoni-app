import { SpreadsheetManager } from './SpreadsheetManager'

describe('SpreadsheetManager', () => {
  it('trims leading and trailing whitespace from header and data cells', async () => {
    const csv = '" email "," memberID "\n" user@example.com "," 00123 "\n'
    const manager = new SpreadsheetManager(new File([csv], 'members.csv', { type: 'text/csv' }), true)

    await manager.read()

    expect(manager.header).toEqual(['email', 'memberID'])
    expect(manager.data).toEqual([['user@example.com', '00123']])
  })
})
