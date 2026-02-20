export const linkifyIpfs = (link: string | undefined, gateway = 'https://infura-ipfs.io/ipfs/') => {
  if (typeof link === 'undefined') return

  if (!link.startsWith('ipfs')) {
    return link
  }

  const matches = link.match(/(?:ipfs:\/\/)?(.*)/)
  if (!matches) return link

  const [, pin] = matches
  return gateway + pin
}
