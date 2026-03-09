import { getProcessViewPathForTab, getProcessViewTabFromPath } from './ProcessView'

describe('processViewTabs', () => {
  it('uses questions as default tab for base process route', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc')).toBe('questions')
  })

  it('uses results tab when path ends with /results', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc/results')).toBe('results')
  })

  it('builds results route by appending /results', () => {
    expect(getProcessViewPathForTab('/admin/process/0xabc', 'results')).toBe('/admin/process/0xabc/results')
  })

  it('builds questions route as base route', () => {
    expect(getProcessViewPathForTab('/admin/process/0xabc/results', 'questions')).toBe('/admin/process/0xabc')
  })
})
