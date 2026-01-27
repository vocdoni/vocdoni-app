import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ElectionTitle } from './ElectionTitle'

describe('ElectionTitle', () => {
  it('renders heading content', () => {
    const { getByText } = render(<ElectionTitle>Title</ElectionTitle>)
    expect(getByText('Title')).toBeTruthy()
  })
})
