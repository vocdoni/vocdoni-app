import { createTestI18n, render, screen } from '~src/test-utils'
import { CloseButton } from './CloseButton'

describe('CloseButton', () => {
  it('is named through the translations, not Chakra English-only label', async () => {
    const i18nInstance = await createTestI18n({
      lng: 'ca',
      useReactI18next: true,
      resources: { ca: { common: { close: 'Tanca' } } },
    })
    render(<CloseButton />, { i18nInstance })

    expect(screen.getByRole('button', { name: 'Tanca' })).toBeInTheDocument()
  })

  it('lets a caller give a more specific name', () => {
    render(<CloseButton aria-label='Close drawer' />)

    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument()
  })
})
