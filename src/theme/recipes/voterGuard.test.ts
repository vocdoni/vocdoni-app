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
  'menu-trigger',
  'more',
  'segment',
  'quiet',
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
    default: 'e1e76988',
    'variant=solid': 'e1e76988',
    'variant=subtle': 'eda797ce',
    'variant=surface': '4d5d4d8d',
    'variant=outline': 'd74aab8d',
    'variant=ghost': '3c26a558',
    'variant=plain': '0d0217c1',
    'variant=off': '29c03186',
    'variant=link': 'a36ba013',
    'variant=link-underline': '4d7025b5',
    'variant=text': 'b3a148a3',
    'variant=text-link': '78532725',
    'variant=nav-item': '27e82719',
    'variant=menu-item': 'f6895d20',
    'variant=menu-item-strong': '022533c4',
    'variant=sheet-row': '0f046302',
    'variant=sheet-close': '5df32a8d',
    'variant=menu-trigger': '16ef829b',
    'variant=more': '340798ab',
    'variant=segment': 'b4d92764',
    'variant=quiet': 'c4c498b7',
    'variant=chip': '90e820f2',
    'variant=disclosure': 'e9987bf2',
    'variant=danger': 'b80dfb8d',
    'variant=floating': '15ecd7dd',
    'variant=whatsapp': '91d3e013',
    'size=2xs': '5346cf1c',
    'size=xs': '5346cf1c',
    'size=sm': '5346cf1c',
    'size=md': 'e1e76988',
    'size=lg': 'e1e76988',
    'size=xl': 'e1e76988',
    'size=2xl': 'e1e76988',
    'size=cta': '630c8de1',
    'size=row': '9ea30af4',
    'multiline=true': 'ea94fe35',
    'multiline=true,size=2xs': '74ccb36b',
    'multiline=true,size=xs': '74ccb36b',
    'multiline=true,size=sm': '74ccb36b',
    'multiline=true,size=md': 'ea94fe35',
    'multiline=true,size=lg': 'ea94fe35',
    'multiline=true,size=xl': 'ea94fe35',
    'multiline=true,size=2xl': 'ea94fe35',
    'multiline=true,size=cta': 'b3ae1d80',
    'multiline=true,size=row': '14fd8dea',
  },
  input: {
    default: 'ff1ccf94',
    'size=2xs': '4464930f',
    'size=xs': 'cbb76176',
    'size=sm': 'ff1ccf94',
    'size=md': 'ff1ccf94',
    'size=lg': 'fd4d30ef',
    'size=xl': '97cb82cf',
    'size=2xl': '9b3f37db',
    'variant=outline': 'ff1ccf94',
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
    'variant=turnout': 'e6824ba3',
    'variant=meter': '81210ab5',
    'variant=job': '81210ab5',
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
    default: '13ea5f19',
    'size=sm': 'a57bec93',
    'size=md': '13ea5f19',
    'size=lg': 'f88745f6',
    'variant=elevated': '9354a6b4',
    'variant=subtle': '03b893a3',
    'variant=outline': '13ea5f19',
    'variant=section': '94d86095',
    'variant=frame': '29a27776',
    'variant=sunken': 'd1806cdb',
    'variant=inverse': '3c99d60e',
    'variant=highlight': '0946b103',
    'variant=list-item': 'ec6e6788',
    'variant=standalone': '4de4f79b',
    'variant=dropzone': '5eefbd51',
    'variant=note': 'ccb6d316',
    'variant=plain': '51a112e0',
  },
  questionDock: {
    default: 'ea1fb444',
  },
  QuestionChoice: {
    default: '461434b3',
    'context=content,layout=list': 'ef7a7d94',
    'context=content,layout=grid': 'a1d0f151',
    'context=card,layout=list': '73c917b4',
    'context=card,layout=grid': 'f180291e',
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
