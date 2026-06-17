import { defineConfig } from 'i18next-cli'
import languages from './src/i18n/languages'

export default defineConfig({
  locales: languages,
  extract: {
    input: ['src/**/*.{ts,tsx,mjs}'],
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    keySeparator: '.',
    nsSeparator: ':',
    contextSeparator: '_',
    functions: ['t', '*.t'],
    transComponents: ['Trans'],
    ignoreNamespaces: ['react-components'],
  },
  types: {
    input: ['src/i18n/locales/{{language}}/{{namespace}}.json'],
    output: 'src/types/i18next.d.ts',
  },
})
