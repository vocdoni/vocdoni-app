import { afterEach, describe, expect, it, vi } from 'vitest'
import { probeStress, summarize } from './stress.mjs'

// jsdom computes no layout or cascade, so each element gets its computed style from `data-style` instead.
const STRESSED: Record<string, string> = {
  'font-family': '"Stress Body", "Courier New", monospace',
  'font-size': '17px',
  color: 'rgb(120, 20, 160)',
  'background-color': 'rgba(0, 0, 0, 0)',
  'box-shadow': 'none',
  visibility: 'visible',
  display: 'block',
}

const fakeStyle = (el: Element) => {
  const values: Record<string, string> = { ...STRESSED, ...JSON.parse(el.getAttribute('data-style') || '{}') }
  const get = (name: string) => values[name] ?? (name.endsWith('width') || name.endsWith('radius') ? '0px' : '')
  return new Proxy({} as CSSStyleDeclaration, {
    get: (_, prop: string) =>
      prop === 'getPropertyValue' ? get : get(prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)),
  })
}

const spec = {
  fontMarker: 'Stress',
  radii: [4, 8],
  fontSizes: [14, 16],
  spacing: [8, 16],
  palette: { '#22c55e': 'green.500' },
}

const probe = (html: string, exceptions: { selector: string; kinds: string[] }[] = []) => {
  document.body.innerHTML = html
  vi.spyOn(window, 'getComputedStyle').mockImplementation(fakeStyle)
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({ width: 10, height: 10 } as DOMRect)
  const kinds = ['font', 'font-size', 'radius', 'spacing', 'grey', 'palette', 'shadow']
  return summarize(probeStress({ spec, exceptions, kinds }))
}

const el = (style: Record<string, string>, text = 'Text') => `<p data-style='${JSON.stringify(style)}'>${text}</p>`

describe('stress probe', () => {
  afterEach(() => vi.restoreAllMocks())

  it('finds nothing on an element that follows the stress theme', () => {
    expect(probe(el({ 'border-top-left-radius': '9px', 'padding-top': '17px' }))).toEqual({})
  })

  it('reports each stock value with the element it sits on', () => {
    const leaks = probe(
      el({
        'font-family': 'Inter, sans-serif',
        'font-size': '16px',
        color: 'rgb(115, 115, 115)',
        'background-color': 'color(srgb 0.133 0.773 0.369)',
        'border-top-left-radius': '8px',
        'padding-top': '16px',
        'box-shadow': 'rgba(0, 0, 0, 0.1) 0px 1px 2px 0px',
      })
    )
    expect(Object.keys(leaks).sort()).toEqual([
      'font Inter',
      'font-size 16px',
      'grey color #737373',
      'palette background green.500',
      'radius 8px',
      'shadow #000000/10',
      'spacing 16px',
    ])
    expect(leaks['font Inter'].examples).toEqual(['p "Text"'])
  })

  it('ignores transparent colours, hidden elements and text checks on elements without text', () => {
    const hidden = el({ 'font-size': '16px', visibility: 'hidden' })
    const empty = el({ 'font-size': '16px', 'background-color': 'rgba(255, 255, 255, 0.02)' }, '')
    expect(probe(hidden + empty)).toEqual({})
  })

  it('skips what an exception covers', () => {
    const html = `<div data-scope="x">${el({ color: 'rgb(255, 255, 255)', 'font-size': '16px' })}</div>`
    expect(Object.keys(probe(html, [{ selector: '[data-scope="x"]', kinds: ['grey'] }]))).toEqual(['font-size 16px'])
  })
})
