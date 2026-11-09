import { CFB, utils, write } from 'xlsx'
import ErrorFileTooBig from './errors/ErrorFileTooBig'
import {
  buildTable,
  decodeText,
  findHeaderRow,
  MAX_FILE_BYTES,
  normaliseDate,
  parseDelimited,
  readTable,
  sniffDelimiter,
} from './readTable'

const known = (cell: string) => ['nom', 'cognoms', 'email', 'correu', 'name', 'surname'].includes(cell.toLowerCase())

// "Núria;Peña" as Excel on Windows saves it
const windows1252 = new Uint8Array([0x4e, 0xfa, 0x72, 0x69, 0x61, 0x3b, 0x50, 0x65, 0xf1, 0x61])

describe('decodeText', () => {
  it('reads UTF-8 and drops its BOM', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('Núria;Peña')])
    expect(decodeText(bytes)).toEqual({ text: 'Núria;Peña', encoding: 'utf-8' })
  })

  it('falls back to Windows-1252 when UTF-8 leaves broken characters', () => {
    expect(decodeText(windows1252)).toEqual({ text: 'Núria;Peña', encoding: 'windows-1252' })
  })
})

describe('sniffDelimiter', () => {
  it('finds semicolons, commas and tabs', () => {
    expect(sniffDelimiter('Nom;Cognoms;Correu\nAnna;Vila;anna@x.org\n')).toBe(';')
    expect(sniffDelimiter('name,surname,email\nAnna,Vila,anna@x.org\n')).toBe(',')
    expect(sniffDelimiter('name\tsurname\temail\nAnna\tVila\tanna@x.org\n')).toBe('\t')
  })

  it('prefers the delimiter that splits every line the same way', () => {
    // Commas inside an address on one line only
    const text = 'Nom;Adreça;Quota\nAnna;Carrer Gran, 3;10,50\nPere;Major 1;12\nLaia;Pl. Nova, 2, 1r;8\n'
    expect(sniffDelimiter(text)).toBe(';')
  })

  it('ignores delimiters inside quotes', () => {
    expect(sniffDelimiter('"Vila, Anna";anna@x.org\n"Serra, Jordi";jordi@x.org\n')).toBe(';')
  })
})

describe('parseDelimited', () => {
  it('handles quotes, doubled quotes, line breaks in quotes and CRLF', () => {
    const text = 'name;notes\r\n"Vila; Anna";"said ""hi""\nthen left"\r\nPere;\r\n'
    expect(parseDelimited(text, ';')).toEqual([
      ['name', 'notes'],
      ['Vila; Anna', 'said "hi"\nthen left'],
      ['Pere', ''],
    ])
  })

  it('keeps blank lines so row numbers hold', () => {
    expect(parseDelimited('a,b\n\nc,d', ',')).toEqual([['a', 'b'], [''], ['c', 'd']])
  })
})

describe('findHeaderRow', () => {
  it('skips a title and blank rows above the headers', () => {
    const rows = [['Llistat de socis 2026'], [''], ['Nom', 'Cognoms', 'Correu'], ['Anna', 'Vila', 'anna@x.org']]
    expect(findHeaderRow(rows, known)).toBe(2)
  })

  it('takes two header-looking cells when none are known', () => {
    const rows = [['Club Esportiu'], ['Quota', 'Equip'], ['10', 'A']]
    expect(findHeaderRow(rows)).toBe(1)
  })

  it('only looks at the first rows', () => {
    const rows = [...Array.from({ length: 12 }, (_, i) => [`Title ${i}`]), ['Nom', 'Cognoms']]
    expect(findHeaderRow(rows, known)).toBe(0)
  })
})

describe('normaliseDate', () => {
  const today = new Date(2026, 9, 2)

  it('turns day-first dates into YYYY-MM-DD', () => {
    expect(normaliseDate('31/12/1990', today)).toEqual({ date: '1990-12-31', dayFirst: true })
    expect(normaliseDate('1.2.1985', today)).toEqual({ date: '1985-02-01', dayFirst: true })
    expect(normaliseDate('01-02-1985', today)).toEqual({ date: '1985-02-01', dayFirst: true })
  })

  it('puts two-digit years in the past', () => {
    expect(normaliseDate('5/3/85', today)?.date).toBe('1985-03-05')
    expect(normaliseDate('5/3/12', today)?.date).toBe('2012-03-05')
  })

  it('reads a second part above 12 as the day', () => {
    expect(normaliseDate('12/31/1990', today)?.date).toBe('1990-12-31')
  })

  it('pads year-first dates and leaves anything else alone', () => {
    expect(normaliseDate('1990-1-5', today)).toEqual({ date: '1990-01-05', dayFirst: false })
    expect(normaliseDate('31/02/1990', today)).toBeNull()
    expect(normaliseDate('soon', today)).toBeNull()
  })
})

describe('buildTable', () => {
  it('trims cells, keeps leading zeros and records what it fixed', () => {
    const table = buildTable(
      [
        ['Socis 2026'],
        [],
        ['Nom', ' Correu ', 'Núm. soci'],
        ['Anna ', 'anna@x.org', '00123'],
        [''],
        ['Pere', '', '45'],
      ],
      { isKnownHeader: known }
    )

    expect(table.header).toEqual(['Nom', 'Correu', 'Núm. soci'])
    expect(table.rows).toEqual([
      ['Anna', 'anna@x.org', '00123'],
      ['Pere', '', '45'],
    ])
    expect(table.rowNumbers).toEqual([4, 6])
    expect(table.headerRowNumber).toBe(3)
    expect(table.fixes).toEqual([
      { kind: 'title_rows', count: 1 },
      { kind: 'trimmed', count: 2 },
      { kind: 'leading_zeros', count: 1 },
    ])
  })

  it('names data columns without a header and drops empty ones', () => {
    const table = buildTable([
      ['Nom', '', '', 'Correu'],
      ['Anna', '', 'x', 'anna@x.org'],
    ])
    expect(table.header).toEqual(['Nom', 'Column C', 'Correu'])
    expect(table.rows).toEqual([['Anna', 'x', 'anna@x.org']])
    expect(table.fixes).toEqual([])
  })

  it('refuses a file with no data under the header', () => {
    expect(() => buildTable([['Nom', 'Correu']])).toThrow('Spreadsheet has no data.')
  })
})

describe('readTable', () => {
  it('reads a Windows-1252 semicolon CSV with a title row', async () => {
    const title = new TextEncoder().encode('Llistat de socis\r\nNom;Cognoms\r\n')
    const file = new File([title, windows1252, new Uint8Array([0x0d, 0x0a])], 'socis.csv', { type: 'text/csv' })

    const table = await readTable(file, { isKnownHeader: known })

    expect(table.fileName).toBe('socis.csv')
    expect(table.header).toEqual(['Nom', 'Cognoms'])
    expect(table.rows).toEqual([['Núria', 'Peña']])
    expect(table.rowNumbers).toEqual([3])
    expect(table.fixes).toEqual([{ kind: 'encoding' }, { kind: 'title_rows', count: 1 }])
  })

  it('reads an XLSX with dates as YYYY-MM-DD and long numbers in full', async () => {
    const sheet = utils.aoa_to_sheet([
      ['Name', 'Phone', 'Birth date', 'Member'],
      ['Anna', 34612345678, new Date(Date.UTC(1990, 11, 31)), '00123'],
    ])
    const book = utils.book_new()
    utils.book_append_sheet(book, sheet, 'Members')
    const bytes = write(book, { type: 'array', bookType: 'xlsx' })
    const file = new File([bytes], 'members.xlsx')

    const table = await readTable(file, { isKnownHeader: known })

    expect(table.header).toEqual(['Name', 'Phone', 'Birth date', 'Member'])
    expect(table.rows).toEqual([['Anna', '34612345678', '1990-12-31', '00123']])
  })

  it('reads a sheet by its cells, not by the size the file claims for it', async () => {
    const sheet = utils.aoa_to_sheet([
      ['Name', 'Surname'],
      ['Anna', 'Vila'],
    ])
    const book = utils.book_new()
    utils.book_append_sheet(book, sheet, 'Members')
    // A tiny file whose sheet claims every row and column Excel has: read as claimed, 17 billion cells
    const zip = CFB.read(new Uint8Array(write(book, { type: 'array', bookType: 'xlsx' })), { type: 'buffer' })
    const path = zip.FullPaths.find((name: string) => name.endsWith('worksheets/sheet1.xml'))
    const xml = new TextDecoder()
      .decode(CFB.find(zip, path).content)
      .replace(/<dimension ref="[^"]*"/, '<dimension ref="A1:XFD1048576"')
    CFB.utils.cfb_add(zip, path, new TextEncoder().encode(xml))
    const file = new File([CFB.write(zip, { fileType: 'zip', type: 'array' })], 'members.xlsx')

    const table = await readTable(file, { isKnownHeader: known })

    expect(table.header).toEqual(['Name', 'Surname'])
    expect(table.rows).toEqual([['Anna', 'Vila']])
  })

  it('refuses a file over the size limit before reading it', async () => {
    const file = new File(['Name\nAnna\n'], 'members.csv', { type: 'text/csv' })
    Object.defineProperty(file, 'size', { value: MAX_FILE_BYTES + 1 })

    await expect(readTable(file, { isKnownHeader: known })).rejects.toEqual(new ErrorFileTooBig('bytes'))
  })
})
