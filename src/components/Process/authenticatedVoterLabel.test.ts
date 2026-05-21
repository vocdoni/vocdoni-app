import {
  getProcessAuthenticatedLabel,
  processCspIdentifierStorageKey,
  processSpreadsheetIdentifierStorageKey,
  readProcessCspIdentifier,
  readProcessSpreadsheetIdentifier,
  storeProcessCspIdentifier,
  storeProcessSpreadsheetIdentifier,
} from './authenticatedVoterLabel'

describe('authenticatedVoterLabel', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the spreadsheet voter label', () => {
    window.localStorage.setItem(
      processSpreadsheetIdentifierStorageKey('process-1'),
      JSON.stringify({ label: 'firstname', value: 'Katleen' })
    )

    expect(
      getProcessAuthenticatedLabel({
        connected: true,
        censusType: 'spreadsheet',
        spreadsheetIdentifier: readProcessSpreadsheetIdentifier('process-1'),
      })
    ).toEqual({
      label: 'firstname',
      value: 'Katleen',
    })
  })

  it('returns the stored CSP identifier', () => {
    window.localStorage.setItem(
      processCspIdentifierStorageKey('process-1'),
      JSON.stringify({ method: 'email', value: 'user@example.com' })
    )

    expect(
      getProcessAuthenticatedLabel({
        connected: true,
        censusType: 'csp',
        cspIdentifier: readProcessCspIdentifier('process-1'),
      })
    ).toEqual({
      label: 'email',
      value: 'user@example.com',
    })
  })

  it('omits web3 identifiers', () => {
    expect(
      getProcessAuthenticatedLabel({
        connected: true,
        censusType: 'web3',
        voter: '0xabc123',
        cspIdentifier: { value: 'user@example.com' },
      })
    ).toBeUndefined()
  })

  it('stores and reads the CSP identifier', () => {
    storeProcessCspIdentifier('process-1', 'email', '  user@example.com  ')

    expect(window.localStorage.getItem(processCspIdentifierStorageKey('process-1'))).toBe(
      JSON.stringify({ method: 'email', value: 'user@example.com' })
    )
    expect(readProcessCspIdentifier('process-1')).toEqual({ method: 'email', value: 'user@example.com' })
  })

  it('stores and reads the spreadsheet identifier', () => {
    storeProcessSpreadsheetIdentifier('process-1', 'firstname', '  Katleen  ')

    expect(window.localStorage.getItem(processSpreadsheetIdentifierStorageKey('process-1'))).toBe(
      JSON.stringify({ label: 'firstname', value: 'Katleen' })
    )
    expect(readProcessSpreadsheetIdentifier('process-1')).toEqual({
      label: 'firstname',
      value: 'Katleen',
    })
  })
})
