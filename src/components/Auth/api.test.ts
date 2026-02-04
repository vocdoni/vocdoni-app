import { ApiError, getApiErrorMessage } from './api'

describe('getApiErrorMessage', () => {
  it('returns the api error field when available', () => {
    const apiError = new ApiError({ error: 'Invalid credentials' })

    expect(getApiErrorMessage(apiError)).toBe('Invalid credentials')
  })

  it('falls back to the error message when api error is missing', () => {
    const apiError = new ApiError({ error: '' })

    expect(getApiErrorMessage(apiError)).toBe(apiError.message)
  })

  it('returns undefined for unknown errors', () => {
    expect(getApiErrorMessage(undefined)).toBeUndefined()
  })
})
