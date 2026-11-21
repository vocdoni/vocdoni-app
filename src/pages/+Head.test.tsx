import { renderToStaticMarkup } from 'react-dom/server'
import { vi } from 'vitest'
import Head from './+Head'

let appEnv: { SAAS_URL: string } | undefined
vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => ({ globalContext: { appEnv } }),
}))

describe('root +Head', () => {
  it('preconnects to the SaaS API origin with the anonymous CORS pool fetch() uses', () => {
    appEnv = { SAAS_URL: 'https://saas-api.example.net/v2' }

    expect(renderToStaticMarkup(<Head />)).toBe(
      '<link rel="preconnect" href="https://saas-api.example.net" crossorigin=""/>'
    )
  })

  it('emits nothing when the URL is not a valid origin', () => {
    appEnv = { SAAS_URL: 'not a url' }

    expect(renderToStaticMarkup(<Head />)).toBe('')
  })
})
