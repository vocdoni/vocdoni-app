import { read, utils } from 'xlsx'
import { MEMBER_FIELD_IDS } from '../fields'
import { autoMatch } from './autoMatch'
import { templateBlob, templateRows } from './template'

// jsdom's Blob has no arrayBuffer()
const bytesOf = (blob: Blob) =>
  new Promise<Uint8Array>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(blob)
  })

const fields = MEMBER_FIELD_IDS.map((id) => ({ id, label: `Label ${id}` }))

describe('member template', () => {
  it('heads each column with the field label and gives a realistic example', () => {
    const [header, example] = templateRows(fields)
    expect(header).toEqual(fields.map((field) => field.label))
    expect(example[MEMBER_FIELD_IDS.indexOf('memberNumber')]).toBe('00123')
    expect(autoMatch(header, Object.fromEntries(fields.map((f) => [f.id, f.label]))).isTemplate).toBe(true)
  })

  it('writes the XLSX with every cell as text', async () => {
    const blob = templateBlob('xlsx', templateRows(fields))
    const book = read(await bytesOf(blob), { type: 'array' })
    const rows = utils.sheet_to_json<string[]>(book.Sheets[book.SheetNames[0]], { header: 1, raw: true })
    expect(rows[1]).toContain('00123')
    expect(rows[1]).toContain('+34612345678')
  })

  it('writes the CSV with semicolons and a byte order mark', async () => {
    const bytes = await bytesOf(templateBlob('csv', templateRows(fields)))
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    expect(new TextDecoder().decode(bytes).startsWith('Label name;Label surname;')).toBe(true)
  })
})
