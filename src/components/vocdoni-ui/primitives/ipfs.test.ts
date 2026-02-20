import { linkifyIpfs } from './ipfs'

describe('linkifyIpfs', () => {
  it('returns undefined for undefined input', () => {
    expect(linkifyIpfs(undefined)).toBeUndefined()
  })

  it('returns non-ipfs links unchanged', () => {
    expect(linkifyIpfs('https://example.com/image.png')).toBe('https://example.com/image.png')
  })

  it('converts ipfs links to gateway URLs', () => {
    expect(linkifyIpfs('ipfs://QmHash')).toBe('https://infura-ipfs.io/ipfs/QmHash')
  })
})
