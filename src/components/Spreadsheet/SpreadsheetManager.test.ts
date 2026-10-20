import { SpreadsheetManager } from './SpreadsheetManager'

describe('SpreadsheetManager', () => {
  it('trims leading and trailing whitespace from header and data cells', async () => {
    // xlsx logs "Codepage tables are not loaded" for the UTF-8 codepage option, in the
    // browser too; the accented names below prove UTF-8 decodes fine without them.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const csv = '" name "," memberID "\n" Núria Sàez "," 00123 "\n'
    const manager = new SpreadsheetManager(new File([csv], 'members.csv', { type: 'text/csv' }), true)

    await manager.read()

    expect(manager.header).toEqual(['name', 'memberID'])
    expect(manager.data).toEqual([['Núria Sàez', '00123']])
  })

  it('accepts every supported spreadsheet by extension, not only by MIME type', () => {
    const extensions = Object.values(SpreadsheetManager.Accept).flat()

    expect(new Set(extensions)).toEqual(new Set(['.csv', '.xlsx', '.xls', '.ods']))
  })
})
