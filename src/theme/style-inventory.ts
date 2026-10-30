import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { system } from './system'

// Syntax-only scan (no type checker) of the literals in chakra style positions: style props, `css`/condition/recipe
// objects, chakra-typed objects and react-select configs. Strings anywhere else (i18n keys, data, URLs) never count.
// Test-only: `style-inventory.test.ts` fails on any occurrence of a hard category and ratchets the others against
// `style-inventory.baseline.json`.

export const STYLE_CATEGORIES = [
  'hex',
  'namedColor',
  'rawPalette',
  'unknownToken',
  'pxFontSize',
  'pxRadius',
  'pxSpacing',
  'pxSize',
  'rawLineHeight',
  'rawLetterSpacing',
  'numericFontWeight',
  'rawZIndex',
  'rawDuration',
  'colorModeLogic',
  'deprecatedAlias',
  'v2Prop',
] as const

export type StyleCategory = (typeof STYLE_CATEGORIES)[number]

// Categories that still have occurrences and only ratchet down. Every other one is at zero and is a hard rule: a new
// occurrence fails whatever the baseline says. style-inventory.test.ts fails when one of these reaches zero.
export const RATCHET_CATEGORIES: readonly StyleCategory[] = ['pxSize', 'pxSpacing', 'rawPalette']

export const HARD_CATEGORIES: readonly StyleCategory[] = STYLE_CATEGORIES.filter(
  (category) => !RATCHET_CATEGORIES.includes(category)
)

// What to use instead, shown next to each new occurrence
export const STYLE_FIXES: Record<StyleCategory, string> = {
  hex: 'a semantic colour token (src/theme/semantic.ts) or a recipe variant',
  namedColor: 'a semantic colour token (bg, fg, border, surface.*, status.*)',
  rawPalette: 'a semantic colour token instead of a palette step',
  unknownToken: 'an existing token: this name resolves to nothing and the browser drops it',
  pxFontSize: 'a textStyle (src/theme/textStyles.ts) or a fontSizes token',
  pxRadius: 'a radii token (xs…2xl, full)',
  pxSpacing: 'a spacing token (1, 2, 4…)',
  pxSize: 'a sizes token (src/theme/tokens.ts) or a relative size',
  rawLineHeight: 'a lineHeights token (shorter, short, moderate, tall) or a textStyle',
  rawLetterSpacing: 'a letterSpacings token',
  numericFontWeight: 'a fontWeights token (normal, semibold, bold)',
  rawZIndex: 'a zIndex token (src/theme/tokens.ts)',
  rawDuration: 'a durations token (fast, moderate, slow) or a recipe animation',
  colorModeLogic: 'a semantic token with _light/_dark values in src/theme, not a mode check in the component',
  deprecatedAlias: 'the current token name',
  v2Prop: 'the Chakra v3 prop (colorPalette, lineClamp, invalid, disabled, loading, css)',
}

export type StyleOccurrence = {
  category: StyleCategory
  file: string
  line: number
  text: string
}

export type StyleException = {
  /** Repo-relative posix glob (`*` within a segment, `**` across segments) */
  glob: string
  categories: readonly StyleCategory[] | '*'
  /** Only occurrences whose source text matches; without it the whole file is excused */
  match?: RegExp
  reason: string
}

// Hardcoded styling that is intentional. Every entry needs a reason.
export const STYLE_EXCEPTIONS: readonly StyleException[] = [
  {
    glob: 'src/components/Process/VotingReportPdf/**',
    categories: '*',
    reason: 'react-pdf renders outside chakra: no tokens, no colour mode, raw values are the only option',
  },
  {
    glob: 'src/components/Pricing/SubscriptionPayment.tsx',
    categories: ['hex', 'namedColor', 'colorModeLogic'],
    reason: 'Stripe Elements appearance API takes raw CSS colours and its own light/dark themes',
  },
  {
    glob: 'src/components/Layout/SaasSelector.tsx',
    categories: ['rawZIndex'],
    reason: 'react-select menu portal must sit above chakra modals (1400) and popovers',
  },
  {
    glob: 'src/components/Process/Dashboard/CensusSearch.tsx',
    categories: ['rawZIndex'],
    reason: 'react-select menu portal must sit above chakra modals (1400) and popovers',
  },
  {
    glob: 'src/theme/color-mode.tsx',
    categories: ['colorModeLogic'],
    reason: 'the colour-mode implementation itself (useColorMode / useColorModeValue)',
  },
  ...[
    'src/components/Layout/SaasSelector.tsx',
    'src/components/Memberbase/Members/index.tsx',
    'src/components/Process/Create/MainContent/SelectionLimits.tsx',
    'src/components/Process/Create/Sidebar/CensusCreation.tsx',
  ].map((glob) => ({
    glob,
    categories: ['v2Prop'] as const,
    match: /^is(Loading|Invalid)$/,
    reason: 'isLoading/isInvalid on the react-select wrapper (~components/Form/Select) are react-select props',
  })),
  {
    glob: 'src/components/Layout/Logo.tsx',
    categories: ['colorModeLogic'],
    match: /auth\.logo\.tile/,
    reason:
      'organisation logos are dark artwork on transparent backgrounds: dark mode puts them on the white logo tile',
  },
  ...['src/components/Layout/Footer.tsx', 'src/components/Layout/Logo.tsx', 'src/components/ui/EmptyState.tsx'].map(
    (glob) => ({
      glob,
      categories: ['colorModeLogic'] as const,
      match: /^_dark=\{\{ filter: 'invert\(\d+%\)' \}\}$/,
      reason: 'dark artwork in an image (Vocdoni logo, empty-state illustrations) that colour tokens cannot recolour',
    })
  ),
  {
    glob: 'src/components/SupportChat/Messages.tsx',
    categories: ['rawDuration'],
    match: /dotBounce/,
    reason: 'the typing indicator loops a 1.2s bounce with a per-dot delay; durations tokens are for transitions',
  },
]

// Theme definition files, semantic token modules included, are guarded by system.test.ts instead.
const EXCLUDED_FILES = new Set(
  [
    'colors',
    'tokens',
    'semantic',
    'palette',
    'system',
    'logoTones',
    'style-inventory',
    'ballot',
    'charts',
    'illustration',
    'recipeColors',
    'states',
    'status',
    'textStyles',
  ].map((name) => `src/theme/${name}.ts`)
)

export const isScannedFile = (file: string) =>
  /\.(ts|tsx)$/.test(file) &&
  !/\.test\.[^/]+$/.test(file) &&
  !file.startsWith('src/__mocks__/') &&
  !file.startsWith('src/theme/recipes/') &&
  !file.startsWith('src/theme/test-themes/') &&
  !EXCLUDED_FILES.has(file)

const globToRegExp = (glob: string) =>
  new RegExp(
    `^${glob
      .split('**')
      .map((part) =>
        part
          .split('*')
          .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
          .join('[^/]*')
      )
      .join('.*')}$`
  )

const EXCEPTION_MATCHERS = STYLE_EXCEPTIONS.map((exception) => ({ exception, re: globToRegExp(exception.glob) }))

const findException = (file: string, category: StyleCategory, text: string) =>
  EXCEPTION_MATCHERS.find(
    ({ exception: { categories, match }, re }) =>
      re.test(file) && (categories === '*' || categories.includes(category)) && (!match || match.test(text))
  )?.exception

// ---------------------------------------------------------------------------
// What the built system knows

type TokenCategory = string

// style prop (and its shorthands) -> token category (`colors`, `sizes`, …)
const PROP_CATEGORY = new Map<string, TokenCategory>()
for (const [prop, config] of Object.entries<any>(system._config.utilities ?? {})) {
  let category: TokenCategory | undefined
  if (typeof config?.values === 'string') category = config.values
  else if (typeof config?.values === 'function') {
    const requested: string[] = []
    try {
      config.values((name: string) => {
        requested.push(name)
        return {}
      })
    } catch {
      // values callbacks that need a real theme: not a token category we care about
    }
    category = requested[0]
  }
  if (!category) continue
  const shorthands = config.shorthand === undefined ? [] : [].concat(config.shorthand)
  for (const name of [prop, ...shorthands]) PROP_CATEGORY.set(name, category)
}

// Composite props whose value can embed a colour (`1px solid gray.200`, `0 0 0 1px black`)
const COLOR_BEARING_PROPS = new Set(['outline', 'textShadow', 'boxShadow', 'shadow'])
const isColorBearing = (prop: string) =>
  PROP_CATEGORY.get(prop) === 'borders' || PROP_CATEGORY.get(prop) === 'shadows' || COLOR_BEARING_PROPS.has(prop)

const DURATION_PROPS = new Set(['transition', 'animation', 'transitionDuration', 'animationDuration', 'animationDelay'])

// `<palette>.<step>`: every colour scale with numeric steps in the built system.
// `whatsapp` is a third-party brand mark, its steps are the brand colours themselves.
const PALETTES = new Set(
  system.tokens.allTokens
    .map((token) => /^colors\.(.+)\.\d+$/.exec(token.name)?.[1])
    .filter((name): name is string => !!name && name !== 'colorPalette' && name !== 'whatsapp')
)

const tokenExists = (category: TokenCategory, value: string) =>
  system.tokens.getByName(`${category}.${value}`) !== undefined

const conditionKeys = new Set<string>(system.conditions.keys())
const breakpointKeys = new Set<string>(system.conditions.breakpoints)

const isSelectorKey = (key: string) => /[&@:[\] >~+*=,.]/.test(key)
const isConditionalKey = (key: string) =>
  key === 'base' || key.startsWith('_') || breakpointKeys.has(key) || conditionKeys.has(key) || isSelectorKey(key)

// CSS named colours (lowercase). `transparent`/`currentColor` are not hardcoded colours.
const NAMED_COLORS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown ' +
    'burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan ' +
    'darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred ' +
    'darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink ' +
    'deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold ' +
    'goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush ' +
    'lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey ' +
    'lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime ' +
    'limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen ' +
    'mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin ' +
    'navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise ' +
    'palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow ' +
    'springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen'
  ).split(' ')
)

// Dashed values that are CSS, not tokens
const CSS_DASHED_KEYWORDS = new Set([
  'fit-content',
  'max-content',
  'min-content',
  'xx-small',
  'x-small',
  'x-large',
  'xx-large',
  'xxx-large',
])

const DEPRECATED_ALIASES = new Set(['table.border', 'border.dashboard', 'chakra.body.bg'])
const isDeprecatedAlias = (value: string) =>
  value.startsWith('texts.') ||
  DEPRECATED_ALIASES.has(value) ||
  /var\(--chakra-colors-(texts-|table-border|border-dashboard|chakra-body-bg)/.test(value)

const V2_PROPS = new Set(['colorScheme', 'noOfLines', 'isInvalid', 'isDisabled', 'isLoading', 'sx'])

// Keys of recipe definitions that hold metadata, not styles
const RECIPE_META_KEYS = new Set(['className', 'slots', 'defaultVariants', 'jsx', 'description', 'deprecated'])

const DEFINE_STYLE_FNS = new Set([
  'defineStyle',
  'defineRecipe',
  'defineSlotRecipe',
  'defineTextStyles',
  'defineLayerStyles',
  'defineGlobalStyles',
])

const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?)\(/g
const RAW_LENGTH_RE = /(?<![\w.#-])-?(\d*\.?\d+)(px|rem|em|pt)\b/g
const DURATION_RE = /(?<![\w.#-])\d*\.?\d+m?s\b/
const NUMERIC_RE = /^-?\d*\.?\d+$/
const TOKEN_LOOKING_RE = /^[a-zA-Z][\w]*(?:[.-][\w]+)+$/
const BARE_WORD_RE = /^[a-zA-Z_]\w*$/
// CSS colour keywords that are valid without being tokens or named colours
const COLOR_KEYWORDS = new Set([
  'transparent',
  'currentColor',
  'currentcolor',
  'inherit',
  'initial',
  'unset',
  'revert',
  'none',
  'auto',
])

const hasRawLength = (value: string) =>
  [...value.matchAll(RAW_LENGTH_RE)].some((match) => Number.parseFloat(match[1]) !== 0)

const isCssLiteral = (value: string) =>
  CSS_DASHED_KEYWORDS.has(value) || value.startsWith('-webkit-') || value.startsWith('-moz-')

// ---------------------------------------------------------------------------
// Scanner

const unwrap = (node: ts.Expression): ts.Expression => {
  let current = node
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression
  }
  return current
}

const propertyName = (name: ts.PropertyName): string | undefined => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text
  if (ts.isNoSubstitutionTemplateLiteral(name)) return name.text
  return undefined
}

const numericValue = (node: ts.Expression): number | undefined => {
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text)
  }
  return undefined
}

const returnedExpressions = (fn: ts.SignatureDeclaration): ts.Expression[] => {
  if (ts.isArrowFunction(fn) && !ts.isBlock(fn.body)) return [fn.body]
  const body = (fn as ts.FunctionLikeDeclarationBase).body
  if (!body || !ts.isBlock(body)) return []
  const found: ts.Expression[] = []
  const visit = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) return
    if (ts.isReturnStatement(node) && node.expression) found.push(node.expression)
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(body, visit)
  return found
}

const bindsName = (name: ts.BindingName, target: string): boolean =>
  ts.isIdentifier(name)
    ? name.text === target
    : name.elements.some((element) => !ts.isOmittedExpression(element) && bindsName(element.name, target))

// `color={color}` where `const color = cond ? 'green.500' : 'red.500'` in an enclosing
// scope: follow it to the initializer. Shadowing parameters stop the lookup.
const resolveConst = (identifier: ts.Identifier): ts.Expression | undefined => {
  for (let scope: ts.Node | undefined = identifier.parent; scope; scope = scope.parent) {
    if (ts.isFunctionLike(scope) && scope.parameters.some((param) => bindsName(param.name, identifier.text))) {
      return undefined
    }
    if (!ts.isBlock(scope) && !ts.isSourceFile(scope) && !ts.isModuleBlock(scope)) continue
    for (const statement of scope.statements) {
      if (!ts.isVariableStatement(statement)) continue
      const isConst = !!(statement.declarationList.flags & ts.NodeFlags.Const)
      for (const declaration of statement.declarationList.declarations) {
        if (!bindsName(declaration.name, identifier.text)) continue
        // Only a plain `const x = …` is followed; `let`, destructuring and the like stop here
        return isConst && ts.isIdentifier(declaration.name) ? declaration.initializer : undefined
      }
    }
  }
  return undefined
}

const isColorish = (value: string) => {
  const base = value.split('/')[0]
  return (
    new RegExp(HEX_RE.source).test(value) ||
    NAMED_COLORS.has(value.toLowerCase()) ||
    (TOKEN_LOOKING_RE.test(base) && tokenExists('colors', base))
  )
}

// `onExcepted` sees the occurrences an exception excused, so stale exceptions can be found.
export const scanSource = (
  code: string,
  file: string,
  onExcepted?: (occurrence: StyleOccurrence, exception: StyleException) => void
): StyleOccurrence[] => {
  const source = ts.createSourceFile(
    file,
    code,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )
  const occurrences: StyleOccurrence[] = []
  const classified = new Set<ts.Node>()

  const record = (category: StyleCategory, node: ts.Node, count = 1) => {
    const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
    const text = node.getText(source).replace(/\s+/g, ' ').slice(0, 100)
    const exception = findException(file, category, text)
    for (let i = 0; i < count; i++) {
      if (exception) onExcepted?.({ category, file, line, text }, exception)
      else occurrences.push({ category, file, line, text })
    }
  }

  // Type names imported from chakra (`SystemStyleObject`, `BoxProps`, …) and react-select style configs
  const chakraStyleTypes = new Set<string>()
  const selectStyleTypes = new Set<string>()
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
    const module = statement.moduleSpecifier.text
    const bindings = statement.importClause?.namedBindings
    if (!bindings || !ts.isNamedImports(bindings)) continue
    for (const element of bindings.elements) {
      const name = element.name.text
      if (module.startsWith('@chakra-ui/') && /(Props|StyleObject|SystemProperties)$/.test(name)) {
        chakraStyleTypes.add(name)
      }
      if (module === 'chakra-react-select' && /StylesConfig$/.test(name)) selectStyleTypes.add(name)
    }
  }

  const typeKind = (type: ts.TypeNode | undefined): 'style' | 'config' | undefined => {
    if (!type) return undefined
    let kind: 'style' | 'config' | undefined
    const visit = (node: ts.Node) => {
      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        if (selectStyleTypes.has(node.typeName.text)) kind = 'config'
        else if (!kind && chakraStyleTypes.has(node.typeName.text)) kind = 'style'
      }
      ts.forEachChild(node, visit)
    }
    visit(type)
    return kind
  }

  const classifyString = (prop: string, value: string, node: ts.Node, template = false) => {
    const category = PROP_CATEGORY.get(prop)

    const hexCount = [...value.matchAll(HEX_RE)].length
    if (hexCount) record('hex', node, hexCount)

    if (DURATION_PROPS.has(prop) && DURATION_RE.test(value)) record('rawDuration', node)

    if (category === 'colors' || isColorBearing(prop)) {
      if (template) return
      const words = value.split(/[\s,()]+/).filter(Boolean)
      for (const word of words) {
        const base = word.split('/')[0]
        const step = /^(.+)\.\d+$/.exec(base)
        if (NAMED_COLORS.has(word.toLowerCase())) record('namedColor', node)
        else if (isDeprecatedAlias(base)) record('deprecatedAlias', node)
        else if (step && PALETTES.has(step[1])) record('rawPalette', node)
        else if (
          category === 'colors' &&
          words.length === 1 &&
          (TOKEN_LOOKING_RE.test(base) || BARE_WORD_RE.test(base)) &&
          !isCssLiteral(base) &&
          !COLOR_KEYWORDS.has(base) &&
          !tokenExists('colors', base)
        ) {
          // Dotted or dashed names (`process.paused`) and bare words (`error`) that resolve to no token: Chakra emits
          // them verbatim and the browser drops the declaration.
          record('unknownToken', node)
        }
      }
      return
    }

    if (template) {
      if (category === 'fontSizes' && hasRawLength(value)) record('pxFontSize', node)
      if (category === 'radii' && hasRawLength(value)) record('pxRadius', node)
      if (category === 'spacing' && hasRawLength(value)) record('pxSpacing', node)
      if (category === 'sizes' && hasRawLength(value)) record('pxSize', node)
      return
    }

    if (isDeprecatedAlias(value)) {
      record('deprecatedAlias', node)
      return
    }

    const trimmed = value.trim()
    const numeric = NUMERIC_RE.test(trimmed)
    const unresolvedToken = (cat: TokenCategory) =>
      TOKEN_LOOKING_RE.test(trimmed) && !isCssLiteral(trimmed) && !tokenExists(cat, trimmed)

    switch (category) {
      case 'fontSizes':
        if (numeric || hasRawLength(trimmed)) record('pxFontSize', node)
        else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'radii':
        if (hasRawLength(trimmed) || (numeric && Number(trimmed) !== 0 && !tokenExists(category, trimmed))) {
          record('pxRadius', node)
        } else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'spacing':
        if (hasRawLength(trimmed)) record('pxSpacing', node)
        else if (numeric && Number(trimmed) !== 0 && !tokenExists(category, trimmed.replace(/^-/, ''))) {
          record('pxSpacing', node)
        } else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'sizes':
        if (hasRawLength(trimmed)) record('pxSize', node)
        else if (numeric && Number(trimmed) !== 0 && !tokenExists(category, trimmed)) record('pxSize', node)
        else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'lineHeights':
        if ((numeric || hasRawLength(trimmed)) && !tokenExists(category, trimmed)) record('rawLineHeight', node)
        else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'letterSpacings':
        if ((hasRawLength(trimmed) || (numeric && Number(trimmed) !== 0)) && !tokenExists(category, trimmed)) {
          record('rawLetterSpacing', node)
        } else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'fontWeights':
        if (numeric) record('numericFontWeight', node)
        else if (unresolvedToken(category)) record('unknownToken', node)
        break
      case 'zIndex':
        if (numeric) record('rawZIndex', node)
        else if (unresolvedToken(category)) record('unknownToken', node)
        break
    }
  }

  const classifyNumber = (prop: string, value: number, node: ts.Node) => {
    switch (PROP_CATEGORY.get(prop)) {
      case 'fontSizes':
        record('pxFontSize', node)
        break
      case 'radii':
        if (value !== 0 && !tokenExists('radii', String(value))) record('pxRadius', node)
        break
      case 'spacing':
        if (value !== 0 && !tokenExists('spacing', String(Math.abs(value)))) record('pxSpacing', node)
        break
      case 'sizes':
        if (value !== 0 && !tokenExists('sizes', String(value))) record('pxSize', node)
        break
      case 'lineHeights':
        record('rawLineHeight', node)
        break
      case 'letterSpacings':
        if (value !== 0) record('rawLetterSpacing', node)
        break
      case 'fontWeights':
        record('numericFontWeight', node)
        break
      case 'zIndex':
        record('rawZIndex', node)
        break
    }
  }

  // The value of a style prop: a literal, or any branch/map of literals
  const propValue = (prop: string, expression: ts.Expression | undefined) => {
    if (!expression) return
    const node = unwrap(expression)
    if (classified.has(node)) return
    classified.add(node)

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      classifyString(prop, node.text, node)
    } else if (ts.isTemplateExpression(node)) {
      const text = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('\u0000')
      classifyString(prop, text, node, true)
    } else if (numericValue(node) !== undefined) {
      classifyNumber(prop, numericValue(node), node)
    } else if (ts.isConditionalExpression(node)) {
      propValue(prop, node.whenTrue)
      propValue(prop, node.whenFalse)
    } else if (ts.isBinaryExpression(node)) {
      const operator = node.operatorToken.kind
      if (operator === ts.SyntaxKind.BarBarToken || operator === ts.SyntaxKind.QuestionQuestionToken) {
        propValue(prop, node.left)
        propValue(prop, node.right)
      } else if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
        propValue(prop, node.right)
      }
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((element) => propValue(prop, element))
    } else if (ts.isObjectLiteralExpression(node)) {
      // Responsive/conditional map ({ base, md, _hover, … }); anything else is a nested style object
      const keys = node.properties.map((property) => (property.name ? propertyName(property.name) : undefined))
      if (keys.every((key) => key !== undefined && isConditionalKey(key))) {
        for (const property of node.properties) {
          if (ts.isPropertyAssignment(property)) propValue(prop, property.initializer)
        }
      } else {
        classified.delete(node)
        styleObject(node)
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useColorModeValue'
    ) {
      node.arguments.forEach((argument) => propValue(prop, argument))
    } else if (ts.isIdentifier(node)) {
      propValue(prop, resolveConst(node))
    }
  }

  // An object whose keys are style props, conditions or selectors
  const styleObject = (expression: ts.Expression | undefined) => {
    if (!expression) return
    const node = unwrap(expression)
    if (ts.isConditionalExpression(node)) {
      styleObject(node.whenTrue)
      styleObject(node.whenFalse)
      return
    }
    if (ts.isBinaryExpression(node)) {
      const operator = node.operatorToken.kind
      if (operator === ts.SyntaxKind.BarBarToken || operator === ts.SyntaxKind.QuestionQuestionToken) {
        styleObject(node.left)
      }
      if (operator !== ts.SyntaxKind.CommaToken) styleObject(node.right)
      return
    }
    if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((element) => styleObject(element))
      return
    }
    if (ts.isIdentifier(node)) {
      const resolved = resolveConst(node)
      if (resolved && ts.isObjectLiteralExpression(unwrap(resolved))) styleObject(resolved)
      return
    }
    if (!ts.isObjectLiteralExpression(node) || classified.has(node)) return
    classified.add(node)

    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        styleObject(property.expression)
        continue
      }
      if (!ts.isPropertyAssignment(property)) continue
      const key = propertyName(property.name)
      if (key === undefined || RECIPE_META_KEYS.has(key)) continue
      if (V2_PROPS.has(key)) record('v2Prop', property.name)
      if (key === 'css' || key === 'sx' || isConditionalKey(key) || !system.isValidProperty(key)) {
        styleObject(property.initializer)
      } else {
        propValue(key, property.initializer)
      }
    }
  }

  // react-select style configs: `{ menuPortal: (base) => ({ ...base, zIndex: 1600 }) }`
  const styleConfig = (expression: ts.Expression | undefined) => {
    if (!expression) return
    const node = unwrap(expression)
    if (!ts.isObjectLiteralExpression(node)) return
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        styleConfig(property.expression)
      } else if (ts.isPropertyAssignment(property)) {
        const value = unwrap(property.initializer)
        if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) {
          returnedExpressions(value).forEach((returned) => styleObject(returned))
        } else {
          styleObject(value)
        }
      } else if (ts.isMethodDeclaration(property)) {
        returnedExpressions(property).forEach((returned) => styleObject(returned))
      }
    }
  }

  const byKind = (kind: 'style' | 'config' | undefined, expression: ts.Expression | undefined) => {
    if (kind === 'style') styleObject(expression)
    else if (kind === 'config') styleConfig(expression)
  }

  const isIntrinsicTag = (tag: ts.JsxTagNameExpression) => ts.isIdentifier(tag) && /^[a-z]/.test(tag.text)

  const jsxAttribute = (attribute: ts.JsxAttribute) => {
    const name = ts.isIdentifier(attribute.name) ? attribute.name.text : undefined
    if (!name) return
    if (V2_PROPS.has(name)) record('v2Prop', attribute.name)
    if (name === '_dark' || name === '_light') record('colorModeLogic', attribute)

    const initializer = attribute.initializer
    const expression =
      initializer && ts.isJsxExpression(initializer)
        ? initializer.expression
        : initializer && ts.isStringLiteral(initializer)
          ? initializer
          : undefined
    if (!expression) return

    const element = attribute.parent.parent
    if (name === 'css' || name === 'sx' || name === 'style') {
      styleObject(expression)
      return
    }
    // Plain DOM/SVG elements take HTML attributes, not chakra style props
    if (isIntrinsicTag(element.tagName)) return
    if (name === 'styles' || name === 'chakraStyles') styleConfig(expression)
    else if (name.startsWith('_') && system.isValidProperty(name)) styleObject(expression)
    else if (system.isValidProperty(name)) propValue(name, expression)
  }

  const isColorModeOperand = (node: ts.Expression) => {
    const inner = unwrap(node)
    return (
      (ts.isIdentifier(inner) && inner.text === 'colorMode') ||
      (ts.isPropertyAccessExpression(inner) && inner.name.text === 'colorMode')
    )
  }

  const EQUALITY = new Set([
    ts.SyntaxKind.EqualsEqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsEqualsToken,
    ts.SyntaxKind.EqualsEqualsToken,
    ts.SyntaxKind.ExclamationEqualsToken,
  ])

  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node)) {
      jsxAttribute(node)
    } else if (ts.isJsxSpreadAttribute(node)) {
      const element = node.parent.parent
      const spread = unwrap(node.expression)
      if (!isIntrinsicTag(element.tagName) && (ts.isObjectLiteralExpression(spread) || ts.isIdentifier(spread))) {
        styleObject(spread)
      }
    } else if (ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node)) {
      const key = propertyName(node.name)
      if (key === '_dark' || key === '_light') record('colorModeLogic', node)
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (ts.isIdentifier(callee) && DEFINE_STYLE_FNS.has(callee.text)) {
        styleObject(node.arguments[0])
      } else if (ts.isIdentifier(callee) && callee.text === 'useColorModeValue') {
        const colorish = node.arguments.some((argument) => {
          const value = unwrap(argument)
          return (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) && isColorish(value.text)
        })
        if (colorish) record('colorModeLogic', node)
      }
    } else if (ts.isBinaryExpression(node) && EQUALITY.has(node.operatorToken.kind)) {
      if (isColorModeOperand(node.left) || isColorModeOperand(node.right)) record('colorModeLogic', node)
    } else if (ts.isVariableDeclaration(node) || ts.isPropertyDeclaration(node)) {
      byKind(typeKind(node.type), node.initializer)
    } else if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) {
      byKind(typeKind(node.type), node.expression)
    } else if (ts.isFunctionLike(node) && node.type) {
      const kind = typeKind(node.type)
      if (kind) returnedExpressions(node).forEach((returned) => byKind(kind, returned))
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return occurrences.sort((a, b) => a.line - b.line)
}

// ---------------------------------------------------------------------------
// Inventory over the repo

export type StyleCounts = Record<StyleCategory, Record<string, number>>

export type StyleInventory = {
  counts: StyleCounts
  occurrences: StyleOccurrence[]
  excepted: { occurrence: StyleOccurrence; exception: StyleException }[]
  files: number
}

export const listScannedFiles = (root: string): string[] =>
  (fs.readdirSync(path.join(root, 'src'), { recursive: true }) as string[])
    .map((entry) => `src/${entry.split(path.sep).join('/')}`)
    .filter(isScannedFile)
    .sort()

export const emptyCounts = (): StyleCounts =>
  Object.fromEntries(STYLE_CATEGORIES.map((category) => [category, {}])) as StyleCounts

export const collectStyleInventory = (root: string): StyleInventory => {
  const files = listScannedFiles(root)
  const counts = emptyCounts()
  const occurrences: StyleOccurrence[] = []
  const excepted: StyleInventory['excepted'] = []
  for (const file of files) {
    const code = fs.readFileSync(path.join(root, file), 'utf8')
    for (const occurrence of scanSource(code, file, (o, exception) => excepted.push({ occurrence: o, exception }))) {
      occurrences.push(occurrence)
      counts[occurrence.category][file] = (counts[occurrence.category][file] ?? 0) + 1
    }
  }
  return { counts, occurrences, excepted, files: files.length }
}

// Stable, sorted serialization for the committed baseline
export const serializeCounts = (counts: StyleCounts): string => {
  const sorted = Object.fromEntries(
    [...STYLE_CATEGORIES]
      .sort()
      .map((category) => [
        category,
        Object.fromEntries(Object.entries(counts[category] ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))),
      ])
  )
  return `${JSON.stringify(sorted, null, 2)}\n`
}
