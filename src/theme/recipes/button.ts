import { defaultConfig, defineRecipe, defineStyle, type SystemStyleObject } from '@chakra-ui/react'

// Chakra's own variants and sizes, spread into the app ones built on them, so both stay in step.
type StyleMap = Record<string, SystemStyleObject>
const stockVariants = defaultConfig.theme?.recipes?.button?.variants
const stock = (stockVariants?.variant ?? {}) as StyleMap
const stockSizes = (stockVariants?.size ?? {}) as StyleMap

// No `fontSize` here: every size sets a `textStyle`, which would override it anyway.
const baseStyle = defineStyle({
  minW: 0,
  fontWeight: 'bold',
  borderRadius: 'sm',
  _currentPage: {
    fontWeight: 'bold',
    backgroundColor: 'state.current.bg',
  },
  _selected: {
    fontWeight: 'bold',
  },
})

// Text-only action inside a sentence.
const link = defineStyle({
  textAlign: 'left',
  w: 'auto',
  h: 'auto',
  p: 0,
  verticalAlign: 'unset',
  _hover: {
    textDecoration: 'underline',
  },
})

// Same, always underlined and in the palette colour (e.g. "Check again" after a failed check).
const linkUnderline = defineStyle({
  ...stock.plain,
  h: 'auto',
  p: 0,
  textDecoration: 'underline',
})

// Reads as the text around it: no box, the parent's line height (support chat teaser).
const text = defineStyle({
  h: 'auto',
  minW: 0,
  p: 0,
  borderWidth: 0,
  // One level down: the size's `textStyle` is applied after a plain `lineHeight` and would win.
  '&': { lineHeight: 'inherit' },
  whiteSpace: 'normal',
  fontWeight: 'normal',
})

// Same, bold and underlined on hover, for a count that opens its list.
const textLink = defineStyle({
  ...text,
  fontWeight: 'bold',
  _hover: {
    textDecoration: 'underline',
  },
})

// Dashboard sidebar entry, used with `size='xs'`.
const navItem = defineStyle({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  gap: 4,
  p: 2,
  fontSize: 'sm',
  fontWeight: 'normal',
  _active: {
    fontWeight: 'bold',
  },
  _hover: {
    bg: 'state.hover.bg',
  },
})

// Full-width row of a popover menu.
const menuItem = defineStyle({
  w: 'full',
  px: 2,
  py: 1.5,
  borderRadius: 'xs',
  display: 'flex',
  justifyContent: 'start',
  bg: 'transparent',
  fontWeight: 'normal',
  _hover: {
    bg: 'state.hover.bg',
  },
})

// Button that opens a menu about the current user: avatar, names and a chevron, left-aligned.
const menuTrigger = defineStyle({
  ...stock.subtle,
  display: 'flex',
  justifyContent: 'start',
  gap: 2,
  p: 2,
})

// One option of a segmented switch; the selected one carries `aria-pressed`.
const segment = defineStyle({
  ...stock.ghost,
  fontWeight: 'normal',
  _pressed: {
    bg: 'state.pressed.bg',
    fontWeight: 'bold',
    _hover: { bg: 'state.pressed.bg' },
  },
})

// Icon toggle in a group (colour mode); the selected one carries `aria-pressed`.
const toggle = defineStyle({
  ...stock.ghost,
  _pressed: {
    bg: 'bg.muted',
    _hover: { bg: 'bg.muted' },
  },
})

// Show/hide toggle for a section, flush with the content it folds.
const disclosure = defineStyle({
  color: 'fg.muted',
  px: 0,
})

// Ghost button for an action that deletes or ends something (revoke a key).
const danger = defineStyle({
  ...stock.ghost,
  color: 'destructive.fg',
})

// Round launcher pinned to a corner of the viewport (support chat).
const floating = defineStyle({
  ...stock.solid,
  w: '52px',
  h: '52px',
  borderRadius: 'full',
  boxShadow: 'shadow.floating',
  transition: 'transform {durations.fast}',
  _hover: {
    ...stock.solid?._hover,
    transform: 'scale(1.06)',
  },
  _active: { transform: 'scale(0.96)' },
  _motionReduce: { transition: 'none', _hover: { transform: 'none' }, _active: { transform: 'none' } },
})

// WhatsApp contact button, in the brand's own green.
const whatsapp = defineStyle({
  bg: 'whatsapp.500',
  color: 'white',
  _hover: { bg: 'whatsapp.600' },
  transition: 'background-color {durations.moderate} ease-in-out',
})

// Header call to action: default height, wider padding.
const cta = defineStyle({
  ...stockSizes.md,
  px: 6,
})

export const Button = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      link,
      'link-underline': linkUnderline,
      text,
      'text-link': textLink,
      'nav-item': navItem,
      'menu-item': menuItem,
      'menu-item-strong': { ...menuItem, fontWeight: 'bold' },
      'menu-trigger': menuTrigger,
      segment,
      toggle,
      disclosure,
      danger,
      floating,
      whatsapp,
    },
    // An open map, so the compound variants below can name Chakra's own sizes.
    size: { cta } as StyleMap,
    // Long labels wrap onto more lines instead of overflowing the button.
    multiline: {
      true: {
        h: 'auto',
        py: 2,
        whiteSpace: 'normal',
      },
    },
  },
  compoundVariants: [
    { multiline: true, size: 'sm', css: { minH: 8 } },
    { multiline: true, size: 'md', css: { minH: 10 } },
  ],
})
