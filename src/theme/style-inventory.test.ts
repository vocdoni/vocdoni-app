import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import {
  collectStyleInventory,
  emptyCounts,
  HARD_CATEGORIES,
  isScannedFile,
  RATCHET_CATEGORIES,
  scanSource,
  serializeCounts,
  STYLE_CATEGORIES,
  STYLE_EXCEPTIONS,
  STYLE_FIXES,
  StyleCategory,
  StyleCounts,
} from './style-inventory'

// Hardcoded styling outside the theme (style-inventory.ts says what counts). Hard categories must stay at zero. The
// ratchet ones may only go down per (category, file) from the committed baseline; a decrease fails too, until the
// baseline is lowered with UPDATE_COMMAND, so every cleanup locks in its progress.

const ROOT = path.resolve(__dirname, '../..')
const BASELINE_PATH = path.join(ROOT, 'src/theme/style-inventory.baseline.json')
const UPDATE_COMMAND = 'UPDATE_STYLE_BASELINE=1 npx vitest run src/theme/style-inventory.test.ts'

const categoriesOf = (code: string, file = 'src/components/Fixture.tsx') =>
  scanSource(code, file).map((occurrence) => occurrence.category)

const countOf = (code: string, category: StyleCategory, file?: string) =>
  categoriesOf(code, file).filter((found) => found === category).length

describe('style inventory scanner', () => {
  // [category, counted, not counted]
  it.each<[StyleCategory, string, string]>([
    ['hex', `<Box color='#123456' />`, `<Link href='#faq'>{'#abc'}</Link>`],
    ['hex', `<Box css={{ boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)' }} />`, `const c = '#123456'`],
    ['namedColor', `<Box bg='white' />`, `<Box bg='bg.panel' title='white' />`],
    ['namedColor', `<Box border='1px solid black' />`, `<Box border='1px solid' borderColor='border' />`],
    ['rawPalette', `<Box color='gray.500' />`, `<Box color='fg.muted' />`],
    ['rawPalette', `<Box bg={{ base: 'whiteAlpha.200', _dark: 'ink.700' }} />`, `<Box colorPalette='gray' />`],
    ['unknownToken', `<Box color='nope.missing' />`, `<Box color='colorPalette.solid' />`],
    ['unknownToken', `<Box w='nope-width' />`, `<Box w='max-content' maxW='content.medium' />`],
    ['unknownToken', `<Text color='error' />`, `<Text color='fg' bg='transparent' borderColor='currentColor' />`],
    ['pxFontSize', `<Text fontSize='14px' />`, `<Text fontSize='sm' />`],
    ['pxFontSize', `<Text fontSize={{ base: 12, md: 'lg' }} />`, `<Text fontSize='2xl' />`],
    ['pxRadius', `<Box rounded='6px' />`, `<Box rounded='md' borderRadius={0} />`],
    ['pxSpacing', `<Box p='10px' />`, `<Box p={4} mt={-2} gap='2' />`],
    ['pxSize', `<Box w='240px' />`, `<Box w='full' h='100vh' boxSize={5} />`],
    ['pxSize', `<Box w={{ base: '100%', md: '320px' }} />`, `<Box w={{ base: '100%', md: 'sm' }} />`],
    ['rawLineHeight', `<Text lineHeight={1.4} />`, `<Text lineHeight='short' />`],
    ['rawLetterSpacing', `<Text letterSpacing='0.05em' />`, `<Text letterSpacing='wide' />`],
    ['numericFontWeight', `<Text fontWeight={600} />`, `<Text fontWeight='semibold' />`],
    ['numericFontWeight', `<Text fontWeight='600' />`, `<Text fontWeight='bold' />`],
    ['rawZIndex', `<Box zIndex={10} />`, `<Box zIndex='sidebar' />`],
    ['rawDuration', `<Box transition='all 0.2s ease' />`, `<Box transition='common' transitionDuration='fast' />`],
    ['colorModeLogic', `<Box _dark={{ bg: 'bg' }} />`, `<Box _hover={{ bg: 'bg.muted' }} />`],
    [
      'colorModeLogic',
      `const c = useColorModeValue('gray.500', 'gray.300')`,
      `const i = useColorModeValue('invert(0%)', 'invert(100%)')`,
    ],
    ['colorModeLogic', `const dark = colorMode === 'dark'`, `const dark = mode === 'dark'`],
    ['deprecatedAlias', `<Text color='texts.subtle' />`, `<Text>{t('texts.subtle')}</Text>`],
    ['deprecatedAlias', `<Box borderColor='table.border' />`, `const key = 'table.border'`],
    ['v2Prop', `<Button colorScheme='red' isLoading />`, `<Button colorPalette='red' loading />`],
  ])('%s: counts %s, not %s', (category, positive, negative) => {
    expect(countOf(positive, category), positive).toBeGreaterThan(0)
    expect(countOf(negative, category), negative).toBe(0)
  })

  it('never counts i18n keys, data or URLs outside style positions', () => {
    const code = `
      const config = { color: '#123456', url: 'https://example.com/#fff', label: 'gray.500' }
      const label = t('texts.subtle', { defaultValue: 'white' })
      export const C = () => <Trans i18nKey='texts.primary' values={{ color: 'black' }} />
      export const D = () => <img src='/logo.png' width='120px' />
      export const E = () => <path fill='#000' />
    `
    expect(scanSource(code, 'src/components/Fixture.tsx')).toEqual([])
  })

  it('follows ternaries, || and ?? in style positions', () => {
    const code = `<Box color={active ? '#111' : fallback ?? '#222'} bg={custom || 'white'} p={wide && '12px'} />`
    expect(categoriesOf(code).sort()).toEqual(['hex', 'hex', 'namedColor', 'pxSpacing'])
  })

  it('reads style objects: css, conditions, defineStyle and chakra-typed objects', () => {
    const code = `
      import { BoxProps, SystemStyleObject } from '@chakra-ui/react'
      const a: SystemStyleObject = { color: 'gray.500', '& .x': { fontSize: '13px' } }
      const b: BoxProps = { onClick, bg: 'white' }
      const c = defineStyle({ base: { zIndex: 5 } })
      const d = { color: 'gray.500' } satisfies SystemStyleObject
      export const E = () => <Box css={{ _hover: { borderRadius: '3px' } }} _focus={{ letterSpacing: '1px' }} />
    `
    expect(categoriesOf(code).sort()).toEqual([
      'namedColor',
      'pxFontSize',
      'pxRadius',
      'rawLetterSpacing',
      'rawPalette',
      'rawPalette',
      'rawZIndex',
    ])
  })

  it('reads react-select style configs', () => {
    const code = `<Select chakraStyles={{ menu: (base) => ({ ...base, zIndex: 20, bg: 'gray.50' }) }} />`
    expect(categoriesOf(code).sort()).toEqual(['rawPalette', 'rawZIndex'])
  })

  it('reports the line of each occurrence', () => {
    const [occurrence] = scanSource(`const x = 1\n\nexport const A = () => <Box color='#123456' />\n`, 'src/A.tsx')
    expect(occurrence).toMatchObject({ category: 'hex', file: 'src/A.tsx', line: 3 })
  })

  it('applies the documented exceptions', () => {
    expect(STYLE_EXCEPTIONS.every((exception) => exception.reason.trim().length > 0)).toBe(true)
    const pdf = `<View style={{ color: '#123456', fontSize: 12 }} />`
    expect(categoriesOf(pdf, 'src/components/Process/VotingReportPdf/Report.tsx')).toEqual([])
    const select = `<Select styles={{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }} />`
    expect(categoriesOf(select, 'src/components/Layout/SaasSelector.tsx')).toEqual([])
    expect(categoriesOf(select, 'src/components/Layout/Other.tsx')).toEqual(['rawZIndex'])
  })

  it('limits an exception with `match` to the occurrences it names', () => {
    const file = 'src/components/Layout/Footer.tsx'
    expect(categoriesOf(`<Image _dark={{ filter: 'invert(100%)' }} />`, file)).toEqual([])
    expect(categoriesOf(`<Box _dark={{ bg: 'bg.muted' }} />`, file)).toEqual(['colorModeLogic'])
    const members = 'src/components/Memberbase/Members/index.tsx'
    expect(categoriesOf(`<Select isLoading />`, members)).toEqual([])
    expect(categoriesOf(`<Button colorScheme='red' />`, members)).toEqual(['v2Prop'])
  })

  it('scans components, react-components and editor styles but not the theme definition or tests', () => {
    expect(isScannedFile('src/components/Layout/Footer.tsx')).toBe(true)
    expect(isScannedFile('src/theme/react-components/election.tsx')).toBe(true)
    expect(isScannedFile('src/theme/editor.ts')).toBe(true)
    expect(isScannedFile('src/theme/semantic.ts')).toBe(false)
    expect(isScannedFile('src/theme/recipes/badge.ts')).toBe(false)
    expect(isScannedFile('src/theme/test-themes/stress.ts')).toBe(false)
    expect(isScannedFile('src/components/Layout/Footer.test.tsx')).toBe(false)
    expect(isScannedFile('src/__mocks__/posthog-js.ts')).toBe(false)
  })
})

type Finding = { category: StyleCategory; file: string; baseline: number; current: number }

const readBaseline = (): StyleCounts => {
  if (!fs.existsSync(BASELINE_PATH)) return emptyCounts()
  return { ...emptyCounts(), ...JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')) }
}

const summaryTable = (counts: StyleCounts, files: number) => {
  const rows = STYLE_CATEGORIES.map((category) => {
    const perFile = Object.values(counts[category])
    return [category, perFile.reduce((sum, n) => sum + n, 0), perFile.length] as const
  })
  const total = rows.reduce((sum, [, n]) => sum + n, 0)
  const lines = rows.map(([category, n, f]) => `  ${category.padEnd(18)} ${String(n).padStart(5)}  in ${f} files`)
  return [`Style inventory (${files} files scanned)`, ...lines, `  ${'total'.padEnd(18)} ${String(total).padStart(5)}`]
}

const ratchetOnly = (counts: StyleCounts): StyleCounts => ({
  ...emptyCounts(),
  ...Object.fromEntries(RATCHET_CATEGORIES.map((category) => [category, counts[category]])),
})

describe('style inventory rules', () => {
  let inventory: ReturnType<typeof collectStyleInventory>
  beforeAll(() => {
    inventory = collectStyleInventory(ROOT)
  })

  it('has no hardcoded styling of a category at zero', () => {
    const found = inventory.occurrences.filter((o) => HARD_CATEGORIES.includes(o.category))
    const messages = found.length
      ? [
          'Hardcoded styling that the theme already covers. These categories are at zero and stay there:',
          ...found.map((o) => `  ${o.file}:${o.line}  ${o.category}: ${o.text}\n    use ${STYLE_FIXES[o.category]}`),
          'A real exception (a third-party API that takes raw CSS, a brand mark) goes in STYLE_EXCEPTIONS in',
          'src/theme/style-inventory.ts, with a reason. The baseline cannot hold these categories.',
        ]
      : []
    expect(messages, `\n${messages.join('\n')}\n`).toEqual([])
  })

  it('keeps the baseline to the ratchet categories, each with occurrences left', () => {
    const baseline = readBaseline()
    const inBaseline = HARD_CATEGORIES.filter((category) => Object.keys(baseline[category] ?? {}).length > 0)
    expect(inBaseline, `the baseline lists hard categories: ${inBaseline.join(', ')}`).toEqual([])
    const cleared = RATCHET_CATEGORIES.filter((category) => Object.keys(inventory.counts[category]).length === 0)
    expect(cleared, `at zero now, move them out of RATCHET_CATEGORIES: ${cleared.join(', ')}`).toEqual([])
  })

  // A '*' entry fences off code that renders outside chakra (react-pdf), so it may excuse nothing today.
  it('has no stale exception', () => {
    const used = new Set(inventory.excepted.map(({ exception }) => exception))
    const stale = STYLE_EXCEPTIONS.filter((exception) => exception.categories !== '*' && !used.has(exception)).map(
      ({ glob }) => glob
    )
    expect(stale, `STYLE_EXCEPTIONS entries that excuse nothing, remove them: ${stale.join(', ')}`).toEqual([])
  })

  it('does not increase the ratchet categories', () => {
    const { occurrences, files } = inventory
    const counts = ratchetOnly(inventory.counts)
    console.info(summaryTable(inventory.counts, files).join('\n'))

    if (process.env.UPDATE_STYLE_BASELINE) {
      fs.writeFileSync(BASELINE_PATH, serializeCounts(counts))
      return
    }

    const baseline = readBaseline()
    const increased: Finding[] = []
    const decreased: Finding[] = []
    for (const category of RATCHET_CATEGORIES) {
      const keys = new Set([...Object.keys(baseline[category] ?? {}), ...Object.keys(counts[category])])
      for (const file of keys) {
        const before = baseline[category]?.[file] ?? 0
        const now = counts[category][file] ?? 0
        if (now > before) increased.push({ category, file, baseline: before, current: now })
        if (now < before) decreased.push({ category, file, baseline: before, current: now })
      }
    }

    const messages: string[] = []
    if (increased.length) {
      messages.push('New hardcoded styling (use theme tokens or recipes instead):')
      for (const { category, file, baseline: before, current } of increased) {
        messages.push(`  ${category} in ${file}: ${current} (baseline ${before}${before ? '' : ', new'})`)
        messages.push(`    use ${STYLE_FIXES[category]}`)
        for (const o of occurrences.filter((o) => o.category === category && o.file === file)) {
          messages.push(`    ${o.file}:${o.line}  ${o.text}`)
        }
      }
    }
    if (decreased.length) {
      messages.push(`Hardcoded styling went down, lock it in by running: ${UPDATE_COMMAND}`)
      for (const { category, file, baseline: before, current } of decreased) {
        messages.push(`  ${category} in ${file}: ${current} (baseline ${before})`)
      }
    }
    expect(messages, `\n${messages.join('\n')}\n`).toEqual([])
  })
})
