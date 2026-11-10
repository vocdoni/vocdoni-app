import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CERT_RETURN_CSS, CERT_RETURN_SCRIPT } from '~queries/certificateAuth/returnScript'
import PageMetaHead from './PageMetaHead'
import PublicProcessHead from './PublicProcessHead'
import { buildProcessStructuredData } from './publicPageSchema'
import type { PublicMeta } from '~src/ssr/public-pages'

let currentData: any
let currentPageContext: any

vi.mock('vike-react/useData', () => ({
  useData: () => currentData,
}))

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

const meta: PublicMeta = {
  title: 'Board election 2026 | Vocdoni',
  description: 'Vote for the next board members.',
  language: 'en',
  canonicalUrl: 'https://app.example.org/en/processes/0xprocess',
  alternates: [{ hrefLang: 'en', href: 'https://app.example.org/en/processes/0xprocess' }],
  openGraph: {
    title: 'Board election 2026 | Vocdoni',
    description: 'Vote for the next board members.',
    type: 'website',
    url: 'https://app.example.org/en/processes/0xprocess',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    siteName: 'Vocdoni',
  },
  twitter: {
    card: 'summary',
    title: 'Board election 2026 | Vocdoni',
    description: 'Vote for the next board members.',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    site: '@vocdoni',
    creator: '@vocdoni',
  },
}

const saasData = (census: Record<string, unknown>) => ({
  era: 'saas',
  id: '0123456789abcdef01234567',
  election: { id: '0123456789abcdef01234567', title: { default: 'Board election 2026' }, census },
  organization: { address: '0xabc', name: { default: 'Vocdoni Association' } },
  meta,
})

const certificateCensus = { authMethod: 'certificate', authFields: ['nationalId'] }

const withFlag = (flag: 'on' | 'off') => {
  currentPageContext = { globalContext: { appEnv: { ENABLE_CERTIFICATE_AUTH: flag } } }
}

const scripts = (html: string) => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((match) => match[1])
const styles = (html: string) => [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((match) => match[1])

describe('PublicProcessHead', () => {
  beforeEach(() => {
    currentData = undefined
    currentPageContext = undefined
  })

  it('emits the certificate return script and style for a certificate census with the flag on', () => {
    withFlag('on')
    currentData = saasData(certificateCensus)

    const html = renderToStaticMarkup(<PublicProcessHead />)

    expect(scripts(html)).toEqual([CERT_RETURN_SCRIPT])
    expect(styles(html)).toEqual([CERT_RETURN_CSS])
  })

  it('renders exactly the meta head with the flag off, even for a certificate census', () => {
    withFlag('off')
    currentData = saasData(certificateCensus)

    const html = renderToStaticMarkup(<PublicProcessHead />)

    expect(scripts(html)).toEqual([])
    expect(styles(html)).toEqual([])
    expect(html).toBe(
      renderToStaticMarkup(<PageMetaHead meta={meta} structuredData={buildProcessStructuredData(currentData)} />)
    )
  })

  it('emits nothing for a census without certificate sign-in', () => {
    withFlag('on')
    currentData = saasData({ authFields: ['memberNumber'] })

    const html = renderToStaticMarkup(<PublicProcessHead />)

    expect(scripts(html)).toEqual([])
    expect(styles(html)).toEqual([])
  })

  it('emits nothing for an archive election', () => {
    withFlag('on')
    currentData = {
      era: 'archive',
      id: '0'.repeat(64),
      legacyElection: { id: '0'.repeat(64), title: { default: 'Old election' } },
      meta,
    }

    const html = renderToStaticMarkup(<PublicProcessHead />)

    expect(html).toContain('property="og:type"')
    expect(scripts(html)).toEqual([])
    expect(styles(html)).toEqual([])
  })
})
