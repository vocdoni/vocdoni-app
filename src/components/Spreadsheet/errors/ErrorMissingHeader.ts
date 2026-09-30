import i18n from '~i18n'
import SpreadsheetError from './SpreadsheetError'

export default class ErrorMissingHeader extends SpreadsheetError {
  constructor() {
    super(i18n.t('error.missing_header', { defaultValue: 'Spreadsheet has no header.' }))
    this.name = 'ErrorMissingHeader'
  }
}
