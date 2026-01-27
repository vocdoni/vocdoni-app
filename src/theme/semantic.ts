/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

const chakra = {
  body: {
    bg: {
      value: {
        _light: 'white',
        _dark: 'black.650',
      },
    },
  },
}

const texts = {
  primary: {
    value: {
      _light: 'black',
      _dark: 'white',
    },
  },
  subtle: {
    value: {
      _light: 'gray.500',
      _dark: 'gray.400',
    },
  },
  dark: {
    value: {
      _light: 'gray.600',
      _dark: 'gray.500',
    },
  },
}

export const colors = {
  chakra,
  auth: {
    bg: {
      value: {
        _light: 'gray.50',
        _dark: 'black.550',
      },
    },
    card: {
      bg: {
        value: {
          _light: 'white',
          _dark: 'black',
        },
      },
      border: {
        value: 'gray.200',
      },
    },
  },
  card: {
    pricing: {
      bg: {
        value: {
          _light: 'white',
          _dark: 'black.650',
        },
      },
      border: {
        value: {
          _light: 'gray.200',
          _dark: 'black.700',
        },
      },
      current: {
        bg: {
          value: {
            _light: 'gray.100',
            _dark: 'black.600',
          },
        },
        color: {
          value: {
            _light: 'black',
            _dark: 'white',
          },
        },
      },
      featured: {
        bg: {
          value: 'gray.800',
        },
        badge: {
          bg: {
            value: {
              _light: 'black',
              _dark: 'white',
            },
          },
          color: {
            value: {
              _light: 'white',
              _dark: 'black',
            },
          },
        },
        border: {
          value: {
            _light: 'black',
            _dark: 'white',
          },
        },
      },
    },
  },
  dashboard: {
    menu: {
      value: {
        _light: '#fbfbfb',
        _dark: '#18181b',
      },
    },
  },
  input: {
    placeholder: {
      value: 'gray.500',
    },
  },
  table: {
    border: {
      value: {
        _light: 'gray.200',
        _dark: 'black.700',
      },
    },
  },
  tabs: {
    tab: {
      color: {
        value: {
          _light: 'gray.500',
          _dark: 'gray.400',
        },
      },
      active: {
        color: {
          value: {
            _light: 'black',
            _dark: 'white',
          },
        },
        bg: {
          value: {
            _light: 'white',
            _dark: 'black',
          },
        },
      },
    },
    bg: {
      value: {
        _light: 'gray.100',
        _dark: 'black.700',
      },
    },
  },
  texts,
}

const semanticTokens = {
  colors,
  fontWeights: {
    normal: { value: 300 },
    bold: { value: 400 },
  },
}

export default semanticTokens
