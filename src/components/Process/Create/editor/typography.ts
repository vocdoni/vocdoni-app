/**
 * Editor typography system — one source of truth for the ballot editor's type.
 *
 * Why this exists: the global weight tokens are light (normal/medium = 300,
 * bold = 400) and the input/textarea recipes force placeholders to a different
 * size than the value. These role objects use explicit numeric weights (Inter
 * 400/500/600/700 are loaded) and carry a matching `_placeholder` so the
 * placeholder is pixel-identical to the typed value — only the colour differs.
 *
 * Spread into components: `<Input {...inputType.questionTitle} />`,
 * `<Text {...textType.helper} />`, `<Editor typography={editorBody.processDescription} />`.
 * Later promotable to Chakra `textStyles` in the design system.
 */

/** Placeholder ink — deliberately lighter than `texts.subtle` (gray.500) so the
 * value hierarchy reads as three levels: primary → subtle → placeholder. */
export const PLACEHOLDER_COLOR = 'gray.400'

const placeholder = (style: Record<string, unknown>) => ({ ...style, color: PLACEHOLDER_COLOR })

/** Borderless text inputs — spread directly onto `<Input>`. */
export const inputType = {
  processTitle: {
    fontSize: '30px',
    lineHeight: '1.15',
    fontWeight: 700,
    letterSpacing: '-0.021em',
    color: 'texts.primary',
    _placeholder: placeholder({ fontSize: '30px', lineHeight: '1.15', fontWeight: 700, letterSpacing: '-0.021em' }),
  },
  questionTitle: {
    fontSize: '19px',
    lineHeight: '1.3',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'texts.primary',
    _placeholder: placeholder({ fontSize: '19px', lineHeight: '1.3', fontWeight: 600, letterSpacing: '-0.01em' }),
  },
  optionText: {
    fontSize: '16px',
    lineHeight: '1.5',
    fontWeight: 400,
    color: 'texts.primary',
    _placeholder: placeholder({ fontSize: '16px', lineHeight: '1.5', fontWeight: 400 }),
  },
  optionTitle: {
    fontSize: '15px',
    lineHeight: '1.4',
    fontWeight: 600,
    color: 'texts.primary',
    _placeholder: placeholder({ fontSize: '15px', lineHeight: '1.4', fontWeight: 600 }),
  },
} as const

export type EditorTypography = {
  fontSize: string
  lineHeight: string
  fontWeight: number
  color: string
  placeholderColor: string
}

/** Rich `Editor` body styles — passed via the `typography` prop (applied to BOTH
 * the typed content and the placeholder so they match). */
export const editorBody = {
  processDescription: {
    fontSize: '16px',
    lineHeight: '1.6',
    fontWeight: 400,
    color: 'texts.dark',
    placeholderColor: PLACEHOLDER_COLOR,
  },
  questionDescription: {
    fontSize: '15px',
    lineHeight: '1.55',
    fontWeight: 400,
    color: 'texts.dark',
    placeholderColor: PLACEHOLDER_COLOR,
  },
  optionDescription: {
    fontSize: '14px',
    lineHeight: '1.5',
    fontWeight: 400,
    color: 'texts.subtle',
    placeholderColor: PLACEHOLDER_COLOR,
  },
} as const satisfies Record<string, EditorTypography>

/** Static labels / meta — spread onto `<Text>`. Colour is included only where it
 * is constant; callers that toggle colour (selected/inactive) set it themselves. */
export const textType = {
  sectionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'texts.subtle',
  },
  addAffordance: { fontSize: '14px', fontWeight: 500 },
  configHeader: { fontSize: '14px', fontWeight: 600, lineHeight: '1.3' },
  controlLabel: { fontSize: '13px', fontWeight: 600 },
  cardTitle: { fontSize: '14px', fontWeight: 600, lineHeight: '1.25' },
  cardDesc: { fontSize: '13px', lineHeight: '1.4', fontWeight: 400, color: 'texts.subtle' },
  helper: { fontSize: '13px', lineHeight: '1.45', fontWeight: 400, color: 'texts.subtle' },
  metaStrong: { fontSize: '13px', fontWeight: 500 },
  metaSubtle: { fontSize: '13px', fontWeight: 400 },
} as const

/** Apply to numeric displays (question index, steppers) so digits don't jitter. */
export const TABULAR = { fontVariantNumeric: 'tabular-nums' } as const
