import { defaultConfig, defineRecipe, defineStyle, type SystemStyleObject } from '@chakra-ui/react'

// Chakra's own variants and sizes, spread into the app ones built on them, so both stay in step.
type StyleMap = Record<string, SystemStyleObject>
const stockVariants = defaultConfig.theme?.recipes?.button?.variants
const stock = (stockVariants?.variant ?? {}) as StyleMap

// Fil has two control heights; `control.md` is the 34px default. Below `lg` a control grows to a touch target: 40px on
// a tablet, 44px on a phone, and its text from 13.5px to 14px and 15px (`control-touch`).
const touchHeight = { base: 'control.touch', md: 'control.tablet', lg: 'control.md' } as const
// Its sides follow the guide too: 16px on a phone, 14px on a tablet, 12px from `lg`.
const controlSize = defineStyle({
  h: touchHeight,
  minW: touchHeight,
  px: { base: '4', md: '3.5', lg: '3' },
  textStyle: 'control-touch',
  gap: '2',
  // The guide's buttons carry a 14px icon from `lg`.
  _icon: { width: { base: 'icon.sm', lg: '3.5' }, height: { base: 'icon.sm', lg: '3.5' } },
})
// The compact size is the 28px one on a desktop. An icon button is drawn at it, so its hit area is 44px, 40px, 28px
// (the icon keeps its size).
const compactHeight = { base: 'control.touch', md: 'control.tablet', lg: '7' } as const
const compactSize = defineStyle({ ...controlSize, h: compactHeight, minW: compactHeight })

// Chakra's sizes keep their names so call sites work: the four large ones draw the control, the small ones the compact.
const sizes: StyleMap = {
  '2xs': compactSize,
  xs: compactSize,
  sm: compactSize,
  md: controlSize,
  lg: controlSize,
  xl: controlSize,
  '2xl': controlSize,
}

// A focus ring is an outline of the palette's ring colour, offset 1px from the control.
const focusRing = defineStyle({
  outlineWidth: 'focusRing',
  outlineStyle: '[solid]',
  outlineColor: 'colorPalette.focusRing',
  outlineOffset: '[1px]',
})

// The app's primary: palette fill, no edge. On hover it darkens: the brand palette pins Fil's hover (slot
// `solid.hover`), any other palette mixes its fill 12% towards black.
const solidHover =
  '[var(--chakra-colors-color-palette-solid-hover, color-mix(in oklab, {colors.colorPalette.solid} 88%, black))]'
const solid = defineStyle({
  bg: 'colorPalette.solid',
  color: 'colorPalette.contrast',
  borderColor: 'transparent',
  _hover: { bg: solidHover },
  _expanded: { bg: solidHover },
  // Grey only for a truly disabled button: Chakra sets `disabled` on a loading one too, which keeps its fill.
  _disabled: {
    '&:not([data-loading])': { bg: 'bg.emphasized', color: 'fg.subtle', opacity: '[1]' },
    '&[data-loading]': { opacity: '[1]', cursor: '[progress]' },
  },
})

// The secondary: a panel with a 1px ring instead of a border.
const outline = defineStyle({
  // Chakra's outline variant draws a 1px border; the ring replaces it.
  borderWidth: '[0]',
  bg: 'bg.panel',
  color: 'fg',
  boxShadow: 'shadow.control',
  _hover: { bg: 'state.hover.bg' },
  _expanded: { bg: 'state.hover.bg' },
  // A loading secondary keeps its ring and ink; only a truly disabled one fades.
  _disabled: { '&[data-loading]': { opacity: '[1]', cursor: '[progress]' } },
})

// The boards' `.btn.off`: an action that exists but is not available now. Set `aria-disabled` with it, not `disabled`,
// so it stays focusable and its reason reaches a screen reader. Sunken fill, no ring, no hover; deeper from `lg`.
const off = defineStyle({
  bg: { base: 'bg.muted', lg: 'bg.emphasized' },
  color: { base: 'fg.subtle', lg: 'fg.muted' },
  cursor: 'unavailable',
  _disabled: { opacity: 'opaque', cursor: 'unavailable' },
})

// Discreet: no fill until hovered.
const ghost = defineStyle({
  bg: 'transparent',
  color: 'fg.muted',
  _hover: { bg: 'state.hover.bg', color: 'fg' },
  _expanded: { bg: 'state.hover.bg', color: 'fg' },
})

const subtle = defineStyle({
  bg: 'bg.muted',
  color: 'fg',
  _hover: { bg: 'bg.emphasized' },
  _expanded: { bg: 'bg.emphasized' },
})

// No `fontSize` here: every size sets a `textStyle`, which would override it anyway.
const baseStyle = defineStyle({
  minW: '0',
  fontWeight: 'medium-plus',
  borderRadius: 'l2',
  borderWidth: '[0]',
  _focusVisible: focusRing,
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
  p: '0',
  verticalAlign: 'unset',
  color: 'accent.fg',
  fontWeight: 'medium-plus',
  _hover: {
    color: 'accent.fg.hover',
  },
})

// Same, always underlined and in the palette colour (e.g. "Check again" after a failed check).
const linkUnderline = defineStyle({
  ...stock.plain,
  h: 'auto',
  p: '0',
  textDecoration: 'underline',
})

// Reads as the text around it: no box, the parent's line height (support chat teaser).
const text = defineStyle({
  h: 'auto',
  minW: '0',
  p: '0',
  borderWidth: '[0]',
  // One level down: the size's `textStyle` is applied after a plain `lineHeight` and would win.
  '&': { lineHeight: '[inherit]' },
  whiteSpace: 'normal',
  fontWeight: 'normal',
})

// Same, in the accent colour, for a count that opens its list.
const textLink = defineStyle({
  ...text,
  color: 'accent.fg',
  fontWeight: 'medium-plus',
  _hover: {
    color: 'accent.fg.hover',
  },
})

// Dashboard sidebar entry, 32px tall whatever the size (see the compound variants).
const navItem = defineStyle({
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'center',
  gap: '4',
  px: '2',
  py: '0',
  borderRadius: 'l1',
  textStyle: 'control',
  fontWeight: 'normal-plus',
  color: 'fg.muted',
  _hover: {
    bg: 'state.hover.bg',
  },
  _currentPage: {
    bg: 'state.current.bg',
    color: 'fg',
    fontWeight: 'medium-plus',
  },
})

// Full-width row of a popover menu.
const menuItem = defineStyle({
  w: 'full',
  px: '2',
  py: '1.5',
  display: 'flex',
  justifyContent: 'start',
  bg: 'transparent',
  fontWeight: 'normal',
  _hover: {
    bg: 'state.hover.bg',
  },
})

// A row of a bottom sheet (ui/ResponsiveMenu on a phone), under a rule, with an 18px muted icon; a destructive one
// carries `data-danger` and is in the danger colour, icon too. The height and text are set by the compound variants
// below. The 6px inset is the boards' (their rows are buttons with the browser's padding).
const sheetRow = defineStyle({
  ...menuItem,
  px: '1.5',
  py: '0',
  gap: '3',
  borderRadius: 'none',
  borderTopWidth: 'hairline',
  borderTopColor: 'border',
  color: 'fg',
  fontWeight: 'medium',
  _hover: { bg: 'transparent' },
  _icon: { color: 'fg.subtle' },
  '&[data-danger]': { color: 'danger.action', _icon: { color: 'danger.action' } },
})

// The sheet's closing button: a full-width secondary at the touch height.
const sheetClose = defineStyle({ ...outline, w: 'full', justifyContent: 'center', mt: '2' })

// A secondary that opens a menu ("More"): label, then a 15px muted chevron, with a tighter end. The size would
// reset the gap, end padding and icon, so they live in a compound variant.
const dropdown = defineStyle({ ...outline })

// Button that opens a menu about the current user: avatar, names and a chevron, left-aligned.
const menuTrigger = defineStyle({
  ...subtle,
  display: 'flex',
  justifyContent: 'start',
  gap: '2',
  p: '2',
})

// One option of a segmented switch; the selected one carries `aria-pressed`.
const segment = defineStyle({
  ...ghost,
  borderRadius: 'l1',
  fontWeight: 'medium',
  _pressed: {
    bg: 'bg.panel',
    color: 'fg',
    fontWeight: 'semibold',
    boxShadow: '[0 0 0 {borderWidths.hairline} {colors.border}]',
    _hover: { bg: 'bg.panel' },
  },
})

// Icon toggle in a group (colour mode); the selected one carries `aria-pressed`.
const toggle = defineStyle({
  ...ghost,
  _pressed: {
    bg: 'bg.muted',
    _hover: { bg: 'bg.muted' },
  },
})

// A filter chip in a group (votes by state); the chosen one carries `aria-pressed`. Use at `size='sm'`. Its height
// and text are set by the compound variant below: 36px, 32px, 28px.
// A border, not a ring: the guide's chip is 1px wider each side than its padding (transparent when chosen).
const chip = defineStyle({
  ...ghost,
  color: 'fg.muted',
  bg: 'bg.panel',
  fontWeight: 'medium-plus',
  borderWidth: 'hairline',
  borderColor: 'border.strong',
  _hover: { bg: 'state.hover.bg' },
  _pressed: {
    bg: 'state.selected.bg',
    color: 'fg',
    borderColor: 'transparent',
    _hover: { bg: 'state.selected.bg' },
  },
})

// Show/hide toggle for a section, flush with the content it folds.
const disclosure = defineStyle({
  color: 'fg.muted',
  px: '0',
})

// The secondary for an action that deletes or ends something (revoke a key).
const danger = defineStyle({
  ...outline,
  color: 'status.error.fg',
  _hover: { bg: 'status.error.bg' },
  _expanded: { bg: 'status.error.bg' },
})

// Round launcher pinned to a corner of the viewport (support chat).
const floating = defineStyle({
  ...solid,
  // Ink, not accent: Fil keeps blue for the one primary action of a screen.
  bg: 'bg.inverted',
  color: 'fg.inverted',
  w: 'control.floating',
  h: 'control.floating',
  borderRadius: 'full',
  boxShadow: 'shadow.floating',
  transition: '[transform {durations.fast}]',
  _hover: {
    bg: 'bg.inverted/90',
    transform: 'scale(1.06)',
  },
  _active: { transform: 'scale(0.96)' },
  _motionReduce: { transition: '[none]', _hover: { transform: 'none' }, _active: { transform: 'none' } },
})

// WhatsApp contact button, in the brand's own green.
const whatsapp = defineStyle({
  bg: 'whatsapp.500',
  // White text fails AA on the brand green; black passes at rest and on hover.
  color: 'black',
  _hover: { bg: 'whatsapp.600' },
  transition: '[background-color {durations.moderate} ease-in-out]',
})

// Header call to action: default height, wider padding.
const cta = defineStyle({
  ...controlSize,
  px: '6',
})

const chipHeight = { base: '9', md: '8', lg: '7' } as const

const row = defineStyle({
  h: { base: 'control.tablet', lg: '7' },
  minW: '0',
  px: { base: '3.5', lg: '2.5' },
  gap: '2',
  fontSize: { base: 'item', md: 'md', lg: 'sm' },
  lineHeight: 'moderate',
  _icon: { width: 'icon.sm', height: 'icon.sm' },
})

export const Button = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      solid,
      off,
      outline,
      ghost,
      subtle,
      link,
      'link-underline': linkUnderline,
      text,
      'text-link': textLink,
      'nav-item': navItem,
      'menu-item': menuItem,
      'menu-item-strong': { ...menuItem, fontWeight: 'bold' },
      'sheet-row': sheetRow,
      'sheet-close': sheetClose,
      dropdown,
      'menu-trigger': menuTrigger,
      segment,
      toggle,
      chip,
      disclosure,
      danger,
      floating,
      whatsapp,
    },
    // An open map, so the compound variants below can name Chakra's own sizes. `row` is the small action inside a
    // list row (Gestió's "Open"): 40px with 14px sides below `lg`, 28px with 10px sides and 13px text from `lg`.
    size: { ...sizes, cta, row } as StyleMap,
    // Long labels wrap onto more lines instead of overflowing the button.
    multiline: {
      true: {
        h: 'auto',
        py: '1.5',
        whiteSpace: 'normal',
      },
    },
  },
  // A one-line label keeps the size's height.
  compoundVariants: [
    ...(['2xs', 'xs', 'sm'] as const).map((size) => ({ multiline: true, size, css: { minH: compactHeight } })),
    ...(['md', 'lg', 'xl', '2xl', 'cta'] as const).map((size) => ({
      multiline: true,
      size,
      css: { minH: touchHeight },
    })),
    // The sidebar entry and the segment keep their own height next to any size.
    { variant: 'nav-item', css: { h: '8', minW: '0' } },
    { variant: 'segment', css: { h: '7', minW: '0' } },
    // A sheet row is 52px with 16px text whatever the size; the close button is a 44px, 15px button.
    {
      variant: 'sheet-row',
      css: {
        h: 'control.row',
        minW: '0',
        px: '1.5',
        gap: '3',
        textStyle: 'control-input',
        _icon: { width: '4.5', height: '4.5' },
      },
    },
    { variant: 'sheet-close', css: { h: 'control.touch', minW: '0', textStyle: 'control-touch' } },
    // The dropdown keeps its tighter end next to any size.
    {
      variant: 'dropdown',
      css: {
        gap: '1',
        pe: { base: '3', lg: '2' },
        _icon: { width: 'icon.chevron', height: 'icon.chevron', color: 'fg.subtle' },
      },
    },
    // The chip is a smaller control than a button at every width: 36px on a phone, 32px on a tablet, 28px from `lg`.
    { variant: 'chip', css: { h: chipHeight, minW: '0', gap: 'chip', textStyle: 'control-chip' } },
  ],
})
