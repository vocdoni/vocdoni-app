import { utils } from 'xlsx'
import ErrorMissingData from './errors/ErrorMissingData'
import { detectSpreadsheetEncoding, getSpreadsheetFileType, SpreadsheetManager } from './SpreadsheetManager'

// A binary string, as FileReader.readAsBinaryString produces: one char per byte
const bytesToBinary = (bytes: number[]) => String.fromCharCode(...bytes)

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

  it('knows the file type and encoding even when the file then fails validation', async () => {
    // A Latin-1 export: "José" with é as the single byte 0xE9
    const latin1 = new Uint8Array([0x6e, 0x61, 0x6d, 0x65, 0x0a, 0x4a, 0x6f, 0x73, 0xe9])
    const manager = new SpreadsheetManager(new File([latin1], 'members.csv', { type: 'text/csv' }), true)

    await expect(manager.read()).resolves.toBeUndefined()
    expect(manager.fileType).toBe('csv')
    expect(manager.encoding).toBe('non-utf-8')

    const headerOnly = new SpreadsheetManager(new File(['name\n'], 'members.csv', { type: 'text/csv' }), true)
    await expect(headerOnly.read()).rejects.toBeInstanceOf(ErrorMissingData)
    expect(headerOnly.encoding).toBe('utf-8')
  })
})

describe('getSpreadsheetFileType', () => {
  it('reports the extension of spreadsheet formats, lowercased', () => {
    expect(getSpreadsheetFileType('Members.XLSX')).toBe('xlsx')
    expect(getSpreadsheetFileType('export.2026.csv')).toBe('csv')
    expect(getSpreadsheetFileType('sheet.ods')).toBe('ods')
  })

  it('does not report arbitrary extensions', () => {
    expect(getSpreadsheetFileType('photo.png')).toBe('other')
    expect(getSpreadsheetFileType('members')).toBe('none')
    expect(getSpreadsheetFileType(undefined)).toBe('none')
  })
})

describe('detectSpreadsheetEncoding', () => {
  it('treats zip and CFB containers as binary', () => {
    expect(detectSpreadsheetEncoding(bytesToBinary([0x50, 0x4b, 0x03, 0x04, 0x14]))).toBe('binary')
    expect(detectSpreadsheetEncoding(bytesToBinary([0xd0, 0xcf, 0x11, 0xe0, 0xa1]))).toBe('binary')
  })

  it('recognizes byte order marks', () => {
    expect(detectSpreadsheetEncoding(bytesToBinary([0xef, 0xbb, 0xbf, 0x61]))).toBe('utf-8-bom')
    expect(detectSpreadsheetEncoding(bytesToBinary([0xff, 0xfe, 0x61, 0x00]))).toBe('utf-16')
    expect(detectSpreadsheetEncoding(bytesToBinary([0xfe, 0xff, 0x00, 0x61]))).toBe('utf-16')
  })

  it('tells valid UTF-8 from legacy single-byte encodings', () => {
    // "é" in UTF-8 is 0xC3 0xA9; in Latin-1 / Windows-1252 it is 0xE9
    expect(detectSpreadsheetEncoding(bytesToBinary([0x4a, 0x6f, 0x73, 0xc3, 0xa9]))).toBe('utf-8')
    expect(detectSpreadsheetEncoding(bytesToBinary([0x4a, 0x6f, 0x73, 0xe9]))).toBe('non-utf-8')
    expect(detectSpreadsheetEncoding('plain,ascii\n1,2')).toBe('utf-8')
  })
})
