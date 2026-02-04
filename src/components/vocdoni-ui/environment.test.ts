import { environment } from './environment'

describe('environment helpers', () => {
  it('builds explorer url for dev', () => {
    expect(environment.explorer('dev')).toBe('https://dev.explorer.vote')
  })
})
