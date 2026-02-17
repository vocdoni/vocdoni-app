import type { ChakraStylesConfig } from 'chakra-react-select'

export const selectStyles: ChakraStylesConfig<any, boolean> = {
  placeholder: (base) => ({
    ...base,
    color: 'var(--chakra-colors-input-placeholder)',
  }),
}

export const languagesListSelectStyles: ChakraStylesConfig<any, boolean> = {
  container: (base) => ({
    ...base,
    w: 'fit-content',
  }),
  control: (base) => ({
    ...base,
    fontWeight: 'normal',
    px: 1,
    py: 0,
  }),
  option: (base) => ({
    ...base,
    fontWeight: 'normal',
  }),
}
