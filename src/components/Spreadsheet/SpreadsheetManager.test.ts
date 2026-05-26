import { utils } from 'xlsx'
import { SpreadsheetManager } from './SpreadsheetManager'

describe('SpreadsheetManager', () => {
  it('trims leading and trailing whitespace from header and data cells', () => {
    const ws = utils.aoa_to_sheet([
      [' email ', ' memberID '],
      [' user@example.com ', ' 00123 '],
    ])
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Sheet1')

    const manager = new SpreadsheetManager(new File([], 'test.xlsx'), true)
    // Bypass FileReader: inject the workbook and reproduce what load() does internally
    ;(manager as any).filedata = (manager as any).getSheetsData(wb)
    ;(manager as any).heading = (manager as any).filedata.splice(0, 1)[0]

    expect(manager.header).toEqual(['email', 'memberID'])
    expect(manager.data).toEqual([['user@example.com', '00123']])
  })
})
