import i18n from '~i18n'
import SpreadsheetError from './SpreadsheetError'

export default class ErrorMissingData extends SpreadsheetError {
  constructor() {
    super(i18n.t('error.missing_data', { defaultValue: 'Spreadsheet has no data.' }))
    this.name = 'ErrorMissingData'
  }
}
