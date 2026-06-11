import type { ChakraStylesConfig } from 'chakra-react-select'

export const selectStyles: ChakraStylesConfig<any, boolean> = {
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
    w: longestLabelLength ? `calc(${longestLabelLength}ch + 1.5rem)` : 'fit-content',
  }),
  control: (base) => ({
    ...base,
    fontWeight: 'normal',
    px: 1,
    py: 0,
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
