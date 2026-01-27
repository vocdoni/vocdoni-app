import { describe, expect, it } from 'vitest'
import { HR } from './index'

describe('vocdoni-ui barrel', () => {
  it('exports HR component', () => {
    expect(HR).toBeDefined()
  })
})
