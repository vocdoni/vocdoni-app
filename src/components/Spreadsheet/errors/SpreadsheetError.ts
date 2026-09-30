// Base class for spreadsheet validation errors. Their messages are translated and safe to show to the user, unlike
// the raw text FileReader or xlsx throw when a file cannot be read.
export default class SpreadsheetError extends Error {}
