/**
  This file needs to be either mjs or js in order to properly import it
  from every place where it's required (like i18next-parser.config.mjs).
*/

export const baseLanguages = {
  en: 'English',
  es: 'Spanish',
  ca: 'Catalan',
  it: 'Italiano',
}

export default Object.keys(baseLanguages)
