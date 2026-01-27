import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ClientProvider } from './ClientProvider'

describe('ClientProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ClientProvider env='stg'>
        <span>ok</span>
      </ClientProvider>
    )
    expect(getByText('ok')).toBeTruthy()
  })
})
