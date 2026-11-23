import { parseSpreadsheet } from './parse-spreadsheet'

/** Runs the parse off the main thread so a large member file does not freeze the page. */
self.onmessage = (event: MessageEvent<{ content: string }>) => {
  try {
    const { rows, lines } = parseSpreadsheet(event.data.content)
    self.postMessage({ ok: true, rows, lines })
  } catch (error) {
    self.postMessage({ ok: false, message: error instanceof Error ? error.message : String(error) })
  }
}
