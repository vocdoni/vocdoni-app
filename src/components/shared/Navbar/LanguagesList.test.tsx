import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'
import { LanguagesListAccordion, LanguagesMenu } from './LanguagesList'

const languagesEnv = { en: 'English', es: 'Spanish' } as unknown as Record<string, string>

describe('LanguagesList', () => {
  it('renders the languages menu trigger when multiple languages exist', () => {
    const originalLanguages = import.meta.env.LANGUAGES
    import.meta.env.LANGUAGES = languagesEnv

    render(
      <ChakraProvider value={system}>
        <LanguagesMenu />
      </ChakraProvider>
    )

    expect(screen.getByLabelText('menu.burger_aria_label')).toBeInTheDocument()

    import.meta.env.LANGUAGES = originalLanguages
  })

  it('renders the languages accordion when multiple languages exist', () => {
    const originalLanguages = import.meta.env.LANGUAGES
    import.meta.env.LANGUAGES = languagesEnv

    render(
      <ChakraProvider value={system}>
        <LanguagesListAccordion />
      </ChakraProvider>
    )

    expect(screen.getByText('Languages')).toBeInTheDocument()

    import.meta.env.LANGUAGES = originalLanguages
  })
})
