import { type ReactNode } from 'react'
import { render, screen } from '~src/test-utils'
import { VotingReportPdfButton } from './VotingReportPdfButton'
import { VotingReportPdfMenuItem } from './VotingReportPdfMenuItem'
import { createElection, createQuestion } from './__fixtures__'

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: vi.fn() })),
  Document: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  Image: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? 'image'} />
  ),
  Link: ({ children, ...props }: { children: import('react').ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
  Page: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  Text: ({ children, ...props }: { children: import('react').ReactNode } & Record<string, unknown>) => (
    <span {...props}>{children}</span>
  ),
  View: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  Font: { registerHyphenationCallback: vi.fn() },
}))

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()
  return {
    ...actual,
    Menu: {
      ...actual.Menu,
      Item: ({ children, ...props }: { children: ReactNode }) => <actual.Button {...props}>{children}</actual.Button>,
    },
  }
})

describe('VotingReportPdfMenuItem', () => {
  it('renders the download action in the menu', () => {
    render(<VotingReportPdfMenuItem election={createElection()} />)

    expect(screen.getByRole('button', { name: /election report \(pdf\)/i })).toBeInTheDocument()
  })

  it('hides the download action while the voting process is still ongoing', () => {
    const ongoingElection = createElection({ questions: [createQuestion({ status: 'ONGOING' })] })

    render(
      <>
        <VotingReportPdfButton election={ongoingElection} />
        <VotingReportPdfMenuItem election={ongoingElection} />
      </>
    )

    expect(screen.queryByRole('button', { name: /election report \(pdf\)/i })).toBeNull()
  })
})
