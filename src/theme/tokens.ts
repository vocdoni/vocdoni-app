const sidebarWidth = '350px'
const maxNavbarWidth = '1920px'

export const fonts = {
  body: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  heading: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  mono: { value: `'Menlo', monospace` },
}

export const space = { sidebar: { value: sidebarWidth } }

export const sizes = {
  sidebar: { value: sidebarWidth },
  navbar: { value: maxNavbarWidth },
  'dashboard-menu': {
    default: { value: '255px' },
    reduced: { value: '48px' },
  },
  'modal-stretch': { value: 'calc(100% + var(--chakra-space-5)*2 + var(--chakra-space-6)*2)' },
  'modal-stretch-lg': { value: 'calc(100% + var(--chakra-space-10)*2 + var(--chakra-space-6)*2)' },
  'voting-page': { value: '1200px' },
}

export const zIndices = {
  background: { value: 0 },
  contents: { value: 1 },
  sidebar: { value: 2 },
  modal: { value: 1400 },
  hovering: { value: 1500 },
}
