import { Box, ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { getAppSystem, system } from './system'

// The rule text the page's style sheets hold for the element's own classes.
const renderedRules = (element: HTMLElement) => {
  const rules = Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules, (rule) => rule.cssText))
  return rules.filter((rule) => Array.from(element.classList).some((name) => rule.startsWith(`.${name}`))).join('\n')
}

// `system.css` is covered in system.test.ts; this checks the class a rendered component gets, so a Chakra
// release that gives the styled factory its own pipeline fails here instead of shipping `padding: [0]`.
describe('escape hatch in rendered components', () => {
  it.each([
    ['stock', system],
    ['branded', getAppSystem('#1a73e8')],
  ])('emits the unwrapped value in the %s system', (_name, value) => {
    render(
      <ChakraProvider value={value}>
        <Box data-testid='escaped' p='[0]' mx='[auto]' w='[calc(100% - {sizes.8})]' />
      </ChakraProvider>
    )

    const css = renderedRules(screen.getByTestId('escaped'))
    // jsdom drops the invalid `padding: [0]` and normalises the valid `0` to `0px`
    expect(css).toContain('padding: 0px;')
    expect(css).toContain('margin-inline: auto;')
    expect(css).toContain('width: calc(100% - var(--chakra-sizes-8));')
  })
})
