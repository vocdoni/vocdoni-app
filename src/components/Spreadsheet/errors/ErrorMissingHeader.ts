import i18n from '~i18n'

export default class ErrorMissingHeader extends Error {
  constructor() {
    super(i18n.t('error.missing_header', { defaultValue: 'Spreadsheet has no header.' }))
    this.name = 'ErrorMissingHeader'
  }
}
