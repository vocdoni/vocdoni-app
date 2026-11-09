/** A file over the size or row limits `readTable` reads, refused before it can freeze the page. */
export default class ErrorFileTooBig extends Error {
  constructor(public limit: 'bytes' | 'rows') {
    super(`The file is over the ${limit} limit`)
    this.name = 'ErrorFileTooBig'
  }
}
