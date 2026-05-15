type Code = {
  name: string
  nativeName: string
  iso639_1: string
  iso639_2T: string
  iso639_2B: string
}
declare module 'iso-language-codes' {
  const codes: Code[]
  const by639_1: { [key: string]: Code }
  const by639_2B: { [key: string]: Code }
  const by639_2T: { [key: string]: Code }
  export default codes
  export { codes, by639_1, by639_2B, by639_2T }
}