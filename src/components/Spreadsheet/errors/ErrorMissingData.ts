import i18n from '~i18n'

export default class ErrorMissingData extends Error {
  constructor() {
    super(i18n.t('error.missing_data', { defaultValue: 'Spreadsheet has no data.' }))
    this.name = 'ErrorMissingData'
  }
}
