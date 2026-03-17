import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'

const languagesEnv = { en: 'English', es: 'Spanish' } as unknown as Record<string, string>

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    getLanguagesEnv: () => languagesEnv,
  }
})

describe('LanguagesList', () => {
  it('renders the languages menu trigger when multiple languages exist', async () => {
    const { LanguagesMenu } = await import('./LanguagesList')

    render(
      <ChakraProvider value={system}>
        <LanguagesMenu />
      </ChakraProvider>
    )

    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })
})
