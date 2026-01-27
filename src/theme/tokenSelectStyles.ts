import type { ChakraStylesConfig } from 'chakra-react-select'

export const customStylesSelect: ChakraStylesConfig<any, boolean> = {
  control: (base) => ({
    ...base,
    p: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--chakra-colors-dropdown-placeholder)',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 10,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? 'var(--chakra-colors-input-dropdown-option-bg-selected-light)' : undefined,
    color: 'var(--chakra-colors-input-dropdown-option-light)',
    icon: state.isSelected && 'PONER UN ICON DE CHECK AQUI',

    ':where([data-theme="dark"]) &': {
      backgroundColor: state.isSelected ? 'var(--chakra-colors-input-dropdown-option-bg-selected-dark)' : undefined,
      color: 'var(--chakra-colors-dropdown-option-dark)',
    },
  }),
  dropdownIndicator: (base) => ({
    ...base,
    backgroundColor: 'transparent',
    color: 'var(--chakra-colors-input-dropdown-control)',
  }),
  clearIndicator: (base) => ({
    ...base,
    backgroundColor: 'transparent',
    color: 'var(--chakra-colors-input-dropdown-control)',
  }),
}

export const customStylesTokensSelect: ChakraStylesConfig<any, boolean> = {
  ...customStylesSelect,
}
