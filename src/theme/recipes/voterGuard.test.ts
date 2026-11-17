import { describe, expect, it } from 'vitest'
import { system } from '../system'

// The voter scale only adds sizes, variants and slots to recipes the app already draws with. This pins what every
// existing value of those recipes resolved to before the voter pieces landed (feat/fil-voter-brand), one hash per
// value, so a voter change that moves an existing look fails here and names the value. Never update a hash to make
// a voter change pass: the look it pins is on screen today.
// It pins recipe values by token name: a token whose value changes is caught by system.test.ts, not here.
//
// Empty style objects carry no look (a slot added without base styles resolves to one), so they are left out.
const prune = (value: unknown): unknown => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value
  const entries = Object.entries(value)
    .map(([key, child]) => [key, prune(child)] as const)
    .filter(([, child]) => !(typeof child === 'object' && child !== null && Object.keys(child).length === 0))
  return Object.fromEntries(entries)
}

// FNV-1a over the resolved style object: short, stable and enough to tell two style objects apart.
const hash = (value: unknown) => {
  let h = 0x811c9dc5
  for (const char of JSON.stringify(prune(value))) {
    h ^= char.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

type Props = Record<string, string | boolean>
type Resolve = (props: Props) => unknown

const recipe = (key: string): Resolve => {
  const cva = system.cva(system.getRecipe(key)) as unknown as Resolve
  return (props) => cva(props)
}
const slotRecipe = (key: string): Resolve => {
  const sva = system.sva(system.getSlotRecipe(key)) as unknown as Resolve
  return (props) => sva(props)
}

// The default, then each value of each axis on its own, then the combinations a compound variant reads.
const resolveAll = (resolve: Resolve, axes: Record<string, (string | boolean)[]>, combos: Props[] = []) => {
  const cases: [string, Props][] = [['default', {}]]
  for (const [axis, values] of Object.entries(axes)) {
    for (const value of values) cases.push([`${axis}=${value}`, { [axis]: value }])
  }
  for (const combo of combos) {
    cases.push([
      Object.entries(combo)
        .map(([axis, value]) => `${axis}=${value}`)
        .join(','),
      combo,
    ])
  }
  return Object.fromEntries(cases.map(([name, props]) => [name, hash(resolve(props))]))
}

const cross = (a: Props[], b: Props[]) => a.flatMap((x) => b.map((y) => ({ ...x, ...y })))
const each = (axis: string, values: (string | boolean)[]) => values.map((value) => ({ [axis]: value }))

const BUTTON_VARIANTS = [
  'solid',
  'subtle',
  'surface',
  'outline',
  'ghost',
  'plain',
  'off',
  'link',
  'link-underline',
  'text',
  'text-link',
  'nav-item',
  'menu-item',
  'menu-item-strong',
  'sheet-row',
  'sheet-close',
  'dropdown',
  'menu-trigger',
  'segment',
  'toggle',
  'chip',
  'disclosure',
  'danger',
  'floating',
  'whatsapp',
]
const BUTTON_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'cta', 'row']
const INPUT_SIZES = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
const ALERT_STATUSES = ['info', 'warning', 'success', 'error', 'neutral']
const ALERT_LAYOUTS = ['inline', 'banner', 'compact', 'panel', 'notice']

const pinned = {
  button: () =>
    resolveAll(
      recipe('button'),
      { variant: BUTTON_VARIANTS, size: BUTTON_SIZES, multiline: [true] },
      cross(each('multiline', [true]), each('size', BUTTON_SIZES))
    ),
  input: () =>
    resolveAll(recipe('input'), {
      size: INPUT_SIZES,
      variant: ['outline', 'subtle', 'flushed', 'inline', 'code'],
    }),
  field: () =>
    resolveAll(slotRecipe('field'), {
      orientation: ['vertical', 'horizontal'],
    }),
  progress: () =>
    resolveAll(slotRecipe('progress'), {
      variant: ['outline', 'subtle', 'results', 'turnout', 'meter', 'job'],
      size: ['xs', 'sm', 'md', 'lg', 'xl'],
      shape: ['square', 'rounded', 'full'],
      striped: [true],
      animated: [true],
    }),
  status: () =>
    resolveAll(slotRecipe('status'), {
      size: ['sm', 'md', 'lg'],
      tone: ['success', 'warning', 'danger', 'gray', 'ink', 'hollow'],
    }),
  alert: () =>
    resolveAll(
      slotRecipe('alert'),
      {
        variant: ['subtle', 'surface', 'outline', 'solid'],
        size: ['sm', 'md', 'lg'],
        inline: [true, false],
      },
      cross(each('status', ALERT_STATUSES), each('layout', ALERT_LAYOUTS))
    ),
  card: () =>
    resolveAll(slotRecipe('card'), {
      size: ['sm', 'md', 'lg'],
      variant: [
        'elevated',
        'subtle',
        'outline',
        'section',
        'frame',
        'sunken',
        'inverse',
        'highlight',
        'list-item',
        'standalone',
        'dropzone',
        'note',
        'plain',
      ],
    }),
  questionDock: () => resolveAll(slotRecipe('questionDock'), {}),
  QuestionChoice: () =>
    resolveAll(
      slotRecipe('QuestionChoice'),
      {},
      cross(each('context', ['content', 'card', 'plain']), each('layout', ['list', 'grid']))
    ),
  ElectionQuestions: () => resolveAll(slotRecipe('ElectionQuestions'), { layout: ['list', 'grid'] }),
  QuestionsTip: () => resolveAll(slotRecipe('QuestionsTip'), {}),
  // Chakra's own pin input, which the app did not restyle: CSP/Step1 draws it at `lg`, Auth/Verify at the default.
  pinInput: () =>
    resolveAll(slotRecipe('pinInput'), {
      size: INPUT_SIZES,
      variant: ['outline', 'subtle', 'flushed'],
      attached: [true],
    }),
}

const EXPECTED: Record<keyof typeof pinned, Record<string, string>> = {
  button: {
    default: '41673e39',
    'variant=solid': '41673e39',
    'variant=subtle': 'e59c5dfd',
    'variant=surface': 'dcbc038e',
    'variant=outline': '465ff152',
    'variant=ghost': 'fe86cb0b',
    'variant=plain': '214da478',
    'variant=off': '4d54e28d',
    'variant=link': '95581826',
    'variant=link-underline': '6cc64d74',
    'variant=text': 'e0d0f9d4',
    'variant=text-link': 'd10a5e16',
    'variant=nav-item': 'd4df4612',
    'variant=menu-item': '17538afb',
    'variant=menu-item-strong': 'cca69aaf',
    'variant=sheet-row': 'a28d5c23',
    'variant=sheet-close': '3841fd2d',
    'variant=dropdown': '2649227f',
    'variant=menu-trigger': '5d8e4a4e',
    'variant=segment': '7cffdda1',
    'variant=toggle': '6717ebd8',
    'variant=chip': '72ce7329',
    'variant=disclosure': 'a588ea3f',
    'variant=danger': '489e79cd',
    'variant=floating': '6a1be160',
    'variant=whatsapp': 'dc7c08cc',
    'size=2xs': '31d869e9',
    'size=xs': '31d869e9',
    'size=sm': '31d869e9',
    'size=md': '41673e39',
    'size=lg': '41673e39',
    'size=xl': '41673e39',
    'size=2xl': '41673e39',
    'size=cta': 'ae973694',
    'size=row': '167d03ab',
    'multiline=true': 'c0d93e2c',
    'multiline=true,size=2xs': 'ccedb822',
    'multiline=true,size=xs': 'ccedb822',
    'multiline=true,size=sm': 'ccedb822',
    'multiline=true,size=md': 'c0d93e2c',
    'multiline=true,size=lg': 'c0d93e2c',
    'multiline=true,size=xl': 'c0d93e2c',
    'multiline=true,size=2xl': 'c0d93e2c',
    'multiline=true,size=cta': 'f311b73d',
    'multiline=true,size=row': 'a97dc935',
  },
  input: {
    default: '0e0f8227',
    'size=2xs': 'd2c5c880',
    'size=xs': '340b1625',
    'size=sm': '0e0f8227',
    'size=md': '0e0f8227',
    'size=lg': '859ff220',
    'size=xl': '888ac6c0',
    'size=2xl': '79340574',
    'variant=outline': '0e0f8227',
    'variant=subtle': '178ad188',
    'variant=flushed': '35ee312f',
    'variant=inline': '7712434e',
    'variant=code': 'fadb5f9b',
  },
  field: {
    default: '916e2d75',
    'orientation=vertical': '916e2d75',
    'orientation=horizontal': '31bd80c7',
  },
  progress: {
    default: '7c062440',
    'variant=outline': '7c062440',
    'variant=subtle': '3d306004',
    'variant=results': '368571ab',
    'variant=turnout': '38a66e9a',
    'variant=meter': 'db181ae8',
    'variant=job': 'db181ae8',
    'size=xs': 'deab6cbd',
    'size=sm': '8dcb0bcd',
    'size=md': '7c062440',
    'size=lg': 'a153069e',
    'size=xl': 'f161c6f7',
    'shape=square': '52442c6a',
    'shape=rounded': '7c062440',
    'shape=full': '7279bb3a',
    'striped=true': 'c20d312e',
    'animated=true': 'a51a433b',
  },
  status: {
    default: 'f1922a96',
    'size=sm': '28e6a04f',
    'size=md': 'f1922a96',
    'size=lg': '561315d9',
    'tone=success': 'e8872c45',
    'tone=warning': '3217ec1a',
    'tone=danger': '92d7ebfc',
    'tone=gray': 'f1922a96',
    'tone=ink': 'cc91dd22',
    'tone=hollow': '42492a24',
  },
  alert: {
    default: '22188c4c',
    'variant=subtle': '22188c4c',
    'variant=surface': '6a3e38a2',
    'variant=outline': 'e734b92c',
    'variant=solid': '22188c4c',
    'size=sm': '7b58b967',
    'size=md': '22188c4c',
    'size=lg': '35638dcb',
    'inline=true': '818c0bce',
    'inline=false': '22188c4c',
    'status=info,layout=inline': '22188c4c',
    'status=info,layout=banner': 'a149adee',
    'status=info,layout=compact': 'f64e400f',
    'status=info,layout=panel': 'f27448c8',
    'status=info,layout=notice': '23322466',
    'status=warning,layout=inline': 'b5a77fe2',
    'status=warning,layout=banner': 'f5687270',
    'status=warning,layout=compact': 'a559cedb',
    'status=warning,layout=panel': '7e4dd8ae',
    'status=warning,layout=notice': '5a27352f',
    'status=success,layout=inline': 'e4f9febd',
    'status=success,layout=banner': '31e33417',
    'status=success,layout=compact': '0f1100c2',
    'status=success,layout=panel': '578e1f1d',
    'status=success,layout=notice': '4d3e002d',
    'status=error,layout=inline': '6cb54207',
    'status=error,layout=banner': '4feee3ad',
    'status=error,layout=compact': '9f6927c6',
    'status=error,layout=panel': '9c5756f7',
    'status=error,layout=notice': '6e44f55d',
    'status=neutral,layout=inline': 'c05dcdb9',
    'status=neutral,layout=banner': '630cc4d7',
    'status=neutral,layout=compact': '29443b1a',
    'status=neutral,layout=panel': '90af5b69',
    'status=neutral,layout=notice': '7c961a67',
  },
  card: {
    default: '82d2f3c5',
    'size=sm': 'afcaac63',
    'size=md': '82d2f3c5',
    'size=lg': '9b9fa53e',
    'variant=elevated': '14768ed8',
    'variant=subtle': 'a93837b3',
    'variant=outline': '82d2f3c5',
    'variant=section': '5b1fa7f1',
    'variant=frame': '185df2be',
    'variant=sunken': '0995534b',
    'variant=inverse': 'c891acd6',
    'variant=highlight': '6c0f8527',
    'variant=list-item': '2aaa26d1',
    'variant=standalone': 'fbacc80b',
    'variant=dropzone': '2f014ad1',
    'variant=note': '71a1b55e',
    'variant=plain': '434afc94',
  },
  questionDock: {
    default: 'ea1fb444',
  },
  QuestionChoice: {
    default: '461434b3',
    'context=content,layout=list': 'ef7a7d94',
    'context=content,layout=grid': 'a1d0f151',
    'context=card,layout=list': 'dfe36241',
    'context=card,layout=grid': '5356cefb',
    'context=plain,layout=list': '54a04f54',
    'context=plain,layout=grid': '8c146af8',
  },
  ElectionQuestions: {
    default: '920e594c',
    'layout=list': '920e594c',
    'layout=grid': '5dce23e5',
  },
  QuestionsTip: {
    default: '4b0d108a',
  },
  pinInput: {
    default: 'd7f3ca05',
    'size=2xs': '18d8d927',
    'size=xs': 'dfd96d24',
    'size=sm': '631c8673',
    'size=md': 'd7f3ca05',
    'size=lg': '158a0b09',
    'size=xl': 'cb29673e',
    'size=2xl': '2035bac5',
    'variant=outline': 'd7f3ca05',
    'variant=subtle': 'f0310463',
    'variant=flushed': '2f3a0cfa',
    'attached=true': 'ff5d1ea9',
  },
}

// To pin a new base (only on the base commit, before any voter recipe change): PRINT_PINNED=1 prints each map.
describe('recipes the voter scale extends', () => {
  it.each(Object.keys(pinned) as (keyof typeof pinned)[])('%s keeps every existing look', (name) => {
    if (process.env.PRINT_PINNED) console.log(name, JSON.stringify(pinned[name]()))
    expect(pinned[name]()).toEqual(EXPECTED[name])
  })
})
