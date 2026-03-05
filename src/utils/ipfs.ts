export const linkifyIpfs = (link: string | undefined, gateway = 'https://infura-ipfs.io/ipfs/') => {
  if (!link) return undefined

  if (!link.startsWith('ipfs')) {
    return link
  }

  const matches = link.match(/(?:ipfs:\/\/)?(.*)/)
  return matches ? `${gateway}${matches[1]}` : link
}
