import type { ChakraStylesConfig } from 'chakra-react-select'

// Reads like the secondary button: the field recipe's 34px panel with a ring, a quiet chevron, a ringed menu and
// 28px options. The control's own look comes from the input recipe, so only what it lacks is set here.
export const selectStyles: ChakraStylesConfig<any, boolean> = {
  control: (base) => ({
    ...base,
    minH: '[34px]',
    textStyle: 'control',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'fg.subtle',
  }),
  menu: (base) => ({
    ...base,
    boxShadow: 'shadow.raised',
    borderWidth: '[0]',
    borderRadius: 'l2',
    overflow: 'hidden',
  }),
  menuList: (base) => ({
    ...base,
    borderWidth: '[0]',
    p: '1',
  }),
  option: (base, state) => ({
    ...base,
    minH: '7',
    py: '0',
    px: '2',
    textStyle: 'control',
    borderRadius: 'l1',
    bg: state.isSelected ? 'state.selected.bg' : state.isFocused ? 'state.hover.bg' : 'transparent',
    color: 'fg',
  }),
  // chakra-react-select spaces the input with raw rems (0.125rem); the same step from the spacing scale.
  inputContainer: (base) => ({
    ...base,
    marginX: '0.5',
    paddingY: '0.5',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--chakra-colors-input-placeholder)',
  }),
}

// Receives the character length of the longest language label so the control
// width stays constant regardless of the current selection. Without a fixed
// width the container shrinks to the selected value, and since the menu inherits
// the control width, longer language names wrapped onto two lines.
export const languagesListSelectStyles = (longestLabelLength = 0): ChakraStylesConfig<any, boolean> => ({
  container: (base) => ({
    ...base,
    // Longest label width plus a small offset for the dropdown indicator. `ch`
    // already overestimates proportional text, so this slack also covers the
    // option check icon and gaps without leaving a large trailing gap.
    w: longestLabelLength ? `[calc(${longestLabelLength}ch + {spacing.6})]` : 'fit',
  }),
  control: (base) => ({
    ...base,
    fontWeight: 'normal',
    px: '1',
    py: '0',
  }),
  valueContainer: (base) => ({
    ...base,
    justifyContent: 'flex-start',
  }),
  singleValue: (base) => ({
    ...base,
    textAlign: 'left',
  }),
  option: (base) => ({
    ...base,
    fontWeight: 'normal',
    textAlign: 'left',
    justifyContent: 'flex-start',
  }),
})
