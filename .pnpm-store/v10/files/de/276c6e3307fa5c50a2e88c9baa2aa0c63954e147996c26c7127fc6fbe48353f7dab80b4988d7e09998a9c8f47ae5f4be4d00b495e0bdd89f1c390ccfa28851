import { by639_1 } from 'iso-language-codes';
import { string } from 'yup';

export const strLangCodes = Object.keys(by639_1).reduce((prev, cur) => {
  prev[cur] = string().optional();
  return prev;
}, {});

export const multiLanguageStringKeys = {
  ...strLangCodes,
  default: string().optional(),
};

export type MultiLanguage<T> = {
  default: T;
  [lang: string]: T;
};
