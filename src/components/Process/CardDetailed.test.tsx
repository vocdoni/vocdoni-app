import React from 'react'
import type { Election } from '@vocdoni/api-types'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import ProcessCardDetailed from './CardDetailed'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ElectionStatusBadge: () => <div>Status</div>,
    ElectionTitle: ({ as: Tag = 'p' }: { as?: React.ElementType }) => <Tag>Election title</Tag>,
    ElectionDescription: () => <div>Election description</div>,
  }
})

vi.mock('~components/Layout/use-read-more', () => ({
  useReadMoreMarkdown: () => ({
    ReadMoreMarkdownWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}))

vi.mock('./ManageProcessLink', () => ({
  ManageProcessLink: () => <button>Actions</button>,
}))

vi.mock('./Date', () => ({
  ProcessDateInline: () => <div>Date inline</div>,
}))

describe('ProcessCardDetailed', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () => ({
        election: {
          id: '0xprocess',
          creationTime: '2026-01-01T00:00:00.000Z',
          status: 'READY',
          voteCount: 42,
        },
      }),
    })
  })

  it('links organization process cards to the canonical localized public process URL', async () => {
    const election: Election = {
      id: '0xprocess',
      organizationId: '0xabc',
      title: { default: 'Board election 2026' },
      description: { default: 'Vote for the next board members.' },
      status: 'READY',
      electionType: {
        anonymous: false,
        interruptible: true,
        dynamicCensus: false,
        secretUntilTheEnd: false,
      },
      census: null as any,
      questions: [],
      voteCount: 0,
      finalResults: false,
      manuallyEnded: false,
    } as unknown as Election

    renderWithProviders(<ProcessCardDetailed election={election} />)

    expect(screen.getByRole('link')).toHaveAttribute('href', '/en/processes/0xprocess')
  })
})
