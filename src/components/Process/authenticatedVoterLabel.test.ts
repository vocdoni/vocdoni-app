import {
  getProcessAuthenticatedLabel,
  processCspIdentifierStorageKey,
  processSpreadsheetIdentifierStorageKey,
  readProcessCspIdentifier,
  readProcessSpreadsheetIdentifier,
  clearProcessAuthenticatedIdentifiers,
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

  it('returns the spreadsheet voter label without requiring census metadata', () => {
    window.localStorage.setItem(
      processSpreadsheetIdentifierStorageKey('process-1'),
      JSON.stringify({ label: 'firstname', value: 'Katleen' })
    )

    expect(
      getProcessAuthenticatedLabel({
        connected: true,
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

  it('returns the stored CSP identifier without requiring census metadata', () => {
    window.localStorage.setItem(
      processCspIdentifierStorageKey('process-1'),
      JSON.stringify({ method: 'phone', value: '+34999999999' })
    )

    expect(
      getProcessAuthenticatedLabel({
        connected: true,
        cspIdentifier: readProcessCspIdentifier('process-1'),
      })
    ).toEqual({
      label: 'phone',
      value: '+34999999999',
    })
  })

  it('returns the stored CSP field label when it is not email or phone', () => {
    window.localStorage.setItem(
      processCspIdentifierStorageKey('process-1'),
      JSON.stringify({ label: 'firstname', value: 'Katleen' })
    )

    expect(
      getProcessAuthenticatedLabel({
        connected: true,
        cspIdentifier: readProcessCspIdentifier('process-1'),
      })
    ).toEqual({
      label: 'firstname',
      value: 'Katleen',
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

  it('normalizes process ids in storage keys', () => {
    storeProcessSpreadsheetIdentifier('0xProcess-1', 'firstname', 'Katleen')

    expect(readProcessSpreadsheetIdentifier('0xprocess-1')).toEqual({
      label: 'firstname',
      value: 'Katleen',
    })
  })

  it('falls back to the current pathname scope when reading identifiers', () => {
    window.history.pushState({}, '', '/en/processes/0xprocess-1')

    storeProcessSpreadsheetIdentifier('0xdifferent-process', 'firstname', 'Katleen')

    expect(readProcessSpreadsheetIdentifier('0xprocess-1')).toEqual({
      label: 'firstname',
      value: 'Katleen',
    })
  })

  it('clears stored identifiers for the active process scope', () => {
    window.history.pushState({}, '', '/en/processes/0xprocess-1')
    storeProcessCspIdentifier('0xprocess-1', 'email', 'user@example.com')
    storeProcessSpreadsheetIdentifier('0xprocess-1', 'firstname', 'Katleen')

    clearProcessAuthenticatedIdentifiers('0xprocess-1')

    expect(readProcessCspIdentifier('0xprocess-1')).toBeUndefined()
    expect(readProcessSpreadsheetIdentifier('0xprocess-1')).toBeUndefined()
  })

  it('clears all stored identifiers when no process id is provided', () => {
    storeProcessCspIdentifier('0xprocess-1', 'email', 'user@example.com')
    storeProcessSpreadsheetIdentifier('0xprocess-2', 'firstname', 'Katleen')

    clearProcessAuthenticatedIdentifiers()

    expect(readProcessCspIdentifier('0xprocess-1')).toBeUndefined()
    expect(readProcessSpreadsheetIdentifier('0xprocess-2')).toBeUndefined()
  })
})
