import { clearMemberDraft, markMemberDraftBought, saveMemberDraft, takeMemberDraft } from './memberDraft'

const ORG = '0x00000000000000000000000000000000000000AA'
const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const draft = {
  organization: ORG,
  processId,
  values: { name: 'Ada', email: 'ada@example.com' },
  passwordHash: 'hash',
}

describe('memberDraft', () => {
  beforeEach(() => {
    clearMemberDraft()
  })

  it('returns the draft once, then nothing', () => {
    saveMemberDraft(draft)

    expect(takeMemberDraft(ORG)).toEqual({ ...draft, bought: false })
    expect(takeMemberDraft(ORG)).toBeUndefined()
  })

  it('matches the organization whatever the case or 0x prefix', () => {
    saveMemberDraft(draft)

    expect(takeMemberDraft(ORG.toLowerCase().replace('0x', ''))).toEqual({ ...draft, bought: false })
  })

  it('drops another organization draft and returns nothing for it', () => {
    saveMemberDraft(draft)

    expect(takeMemberDraft('0x00000000000000000000000000000000000000BB')).toBeUndefined()
    expect(takeMemberDraft(ORG)).toBeUndefined()
  })

  it('marks the draft bought only for its own process', () => {
    saveMemberDraft(draft)

    markMemberDraftBought('6650f0c0c0c0c0c0c0c0c0c1')
    expect(takeMemberDraft(ORG)?.bought).toBe(false)

    saveMemberDraft(draft)
    markMemberDraftBought(processId)
    expect(takeMemberDraft(ORG)?.bought).toBe(true)
  })

  it('resets bought when a new draft replaces the old one', () => {
    saveMemberDraft(draft)
    markMemberDraftBought(processId)

    saveMemberDraft({ ...draft, values: { name: 'Grace' } })

    expect(takeMemberDraft(ORG)).toEqual({ ...draft, values: { name: 'Grace' }, bought: false })
  })

  it('drops the draft when cleared', () => {
    saveMemberDraft(draft)

    clearMemberDraft()

    expect(takeMemberDraft(ORG)).toBeUndefined()
  })
})
