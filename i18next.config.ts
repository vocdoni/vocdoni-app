import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['en', 'es', 'ca', 'it', 'de', 'fr', 'pt', 'pt-br'],
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
