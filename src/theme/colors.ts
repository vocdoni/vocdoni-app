// NOTE: We should prioritize semantic colors over these defined here. Check semantic.ts

export const colorsBase = {
  beige: '#D2CBB9',
  black: '#000000',
  blue: {
    light: '#63b3ed',
    normal: '#3965ff',
    grayish: '#2B2A33',
    dark: '#1A202C',
    dark2: '#0C0E12',
  },
  gradient: 'linear-gradient(to right, #2E855B, #22555A)',
  gradientBottom: 'linear-gradient(to bottom, #2E855B, #22555A)',
  gray: {
    light: '#CBD5E0',
    normal: '#A0AEC0',
    dark: '#4A5568',
    dark2: '#333',
  },
  green: '#c6f6d5',
  orange: '#FFA500',
  primary: '#22555A',
  primary_cta: 'linear-gradient(to bottom, #2C7D57, #22555A)',
  primary_dark: 'rgba(84, 110, 57, 0.2)',
  red: '#FC8181',
  white: {
    pure: '#ffffff',
    light: '#fcfcfc',
    light2: '#ffffff3d',
    dark: '#F5F5F7',
    dark2: '#EDF2F7',
    alpha: 'whiteAlpha.300',
    from_read_more: 'rgba(245, 245, 247, 0)',
  },
  yellow: '#FFB116',
  btn: {
    dark_color: '#CBD5E0',
    dark_color_secondary: '#22262f',
  },
}

export const newColorsBase = {
  white: '#ffffff',
  gray: {
    light: '#fbfbfb',
    light2: '#f5f5f5',
    light3: '#e5e5e5',
    normal: '#71717A',
    normal2: '#737373',
  },
  black: {
    light: '#0a0a0a',
  },
}

export const colors = {
  dashboard: {
    aside_bg: newColorsBase.gray.light,
    back: newColorsBase.gray.normal,
    breadcrumb: newColorsBase.gray.normal,
    chevron: newColorsBase.gray.normal,
    menu: {
      dark: '#18181b',
      light: '#fbfbfb',
    },
    org_switcher: {
      subscription_plan: newColorsBase.gray.normal,
      icon: newColorsBase.gray.normal,
      number: newColorsBase.gray.normal,
    },
    profile: {
      email: newColorsBase.gray.normal,
      icon: newColorsBase.gray.normal,
    },
    schedule_call: {
      bg: newColorsBase.white,
      description: newColorsBase.gray.normal,
    },
    //
    invite: colorsBase.white.dark,
    process_view: {
      calendar_label: colorsBase.gray.normal,
      link: colorsBase.blue.normal,
    },
    read_more: {
      from: colorsBase.white.from_read_more,
      to: {
        light: colorsBase.white.pure,
        dark: colorsBase.blue.grayish,
      },
      text: {
        light: colorsBase.primary,
        dark: colorsBase.white.pure,
      },
    },
  },

  account_create_text_secondary: colorsBase.gray.dark,
  banner_link: colorsBase.white.pure,
  bg: {
    light: colorsBase.white.dark,
    dark: colorsBase.blue.dark2,
  },
  button: {
    variant: {
      primary: {
        color: colorsBase.white.pure,
        disabled: {
          light: {
            bg: '#EDF2F7',
            border: '#E2E8F0',
            color: '#A0AEC0',
          },
          dark: {
            bg: colorsBase.btn.dark_color_secondary,
            border: colorsBase.btn.dark_color,
            color: colorsBase.btn.dark_color,
          },
        },
      },
      common: {
        bg: {
          dark: '#13161b',
          light: colorsBase.white.pure,
        },
        border_color: {
          dark: '#373a41',
          light: '#d5d7da',
        },
        color: {
          dark: '#cecfd2',
          light: '#414651',
        },
        hover: {
          bg: {
            dark: '#22262f',
            light: '#f6f6f6',
          },
        },
        disabled: {
          color: {
            light: '#4A5568',
            dark: '#e9eaeb',
          },
          border: '#CBD5E0',
        },
      },

      outline: {
        color: colorsBase.white.pure,
        bg: {
          dark: '#13161b',
          light: '#000',
        },
      },
    },
    dark: {
      primary: '#7f56d9',
      secondary: '#6941c6',
    },
  },
  checkbox: {
    bg_checked: colorsBase.primary,
    disabled_border: colorsBase.gray.normal,
    detailed: {
      border: colorsBase.gray.light,
    },
    radiobox_control: colorsBase.white.light2,
    disabled: {
      light: 'gray.300',
      dark: 'gray.600',
    },
  },
  comparisons_table_title: colorsBase.primary,
  contents: {
    bg: {
      light: colorsBase.white.pure,
      dark: colorsBase.blue.grayish,
    },
    color: {
      light: colorsBase.black,
      dark: colorsBase.white.pure,
    },
  },

  home: {
    benefits: {
      bg: {
        light: {
          white: colorsBase.white.pure,
          primary: colorsBase.gradient,
        },
        dark: {
          primary: colorsBase.gradient,
          dark: colorsBase.blue.grayish,
        },
      },
      color: {
        light: {
          bg_white: colorsBase.black,
          bg_primary: colorsBase.white.pure,
        },
        dark: colorsBase.white.pure,
      },
    },
    features_icon: colorsBase.gradient,
    step: {
      icon: colorsBase.white.pure,
      icon_bg: colorsBase.gradient,
    },
    solutions: {
      light_bg: colorsBase.white.pure,
      dark_bg: colorsBase.blue.grayish,
    },
    support: {
      bg: {
        light: colorsBase.gradientBottom,
        dark: colorsBase.gradientBottom,
      },
      helper: colorsBase.white.pure,
      title: colorsBase.yellow,
    },
    description: {
      light: colorsBase.gray.dark2,
      dark: colorsBase.white.pure,
    },
    footer: {
      icon: {
        light: colorsBase.black,
      },
    },
  },

  google: {
    bg: {
      light: colorsBase.white.light2,
      dark: colorsBase.blue.grayish,
    },
    hover: {
      light: colorsBase.white.pure,
      dark: colorsBase.white.alpha,
    },
    active: {
      light: colorsBase.white.light2,
      dark: colorsBase.blue.grayish,
    },
  },

  org_text_secondary: colorsBase.gray.normal,

  process: {
    aside: {
      bg: colorsBase.gradient,
      color: colorsBase.white.pure,
      vote_btn_color: colorsBase.black,
      vote_btn_bg: colorsBase.primary,
      verify_link: colorsBase.white.pure,
    },
    canceled: colorsBase.primary,
    card_hover: {
      light: colorsBase.white.dark,
      dark: colorsBase.blue.dark,
    },
    info_title: {
      light: colorsBase.primary,
      dark: colorsBase.white.pure,
    },
    label: {
      light: colorsBase.gray.dark,
      dark: colorsBase.white.pure,
    },
    questions: {
      alert: {
        bg: colorsBase.primary,
        link_bg: colorsBase.white.pure,
      },
      question_selected: {
        bg: colorsBase.primary,
        color: colorsBase.white.pure,
      },
      hover: {
        light: colorsBase.white.pure,
        dark: colorsBase.blue.grayish,
      },
      disabled: {
        light: colorsBase.white.pure,
        dark: colorsBase.blue.grayish,
      },
    },
    paused: colorsBase.primary,
    read_more_dark: colorsBase.blue.dark2,
    results: {
      alert_bg: colorsBase.primary,
      alert_color: colorsBase.white.pure,
      bg: colorsBase.white.light2,
      description: {
        light: colorsBase.gray.dark,
        dark: colorsBase.white.pure,
      },
      progressbar_bg: colorsBase.white.light2,
      title: {
        light: colorsBase.primary,
        dark: colorsBase.white.pure,
      },
    },
    tabs: {
      active_bg: colorsBase.white.light2,
      hover_bg: colorsBase.white.light2,
      border_bottom_list: colorsBase.white.light2,
    },
  },

  process_create: {
    bg: {
      dark: colorsBase.blue.dark,
      light: colorsBase.white.dark,
    },
    bg_secondary: {
      dark: colorsBase.blue.grayish,
      light: colorsBase.white.pure,
    },
    stepper: {
      bg: colorsBase.primary,
      color: colorsBase.primary,
    },
    calendar_bg: {
      dark: colorsBase.blue.grayish,
      light: colorsBase.white.pure,
    },
    text_brand: colorsBase.primary,
    text_secondary: colorsBase.gray.normal,
    question_index: colorsBase.primary,
    footer_link: colorsBase.gray.dark,
  },
  pricing_card: {
    body_text: colorsBase.black,
    most_popular_plan: {
      bg: colorsBase.black,
      color: colorsBase.white.pure,
    },
    subtitle: {
      light: colorsBase.gray.normal,
      dark: colorsBase.white.light2,
    },
  },
  pricing_modal: {
    bg: {
      light: colorsBase.primary,
      dark: colorsBase.blue.dark,
    },
  },
  process_view: {
    bg_light: colorsBase.white.dark,
    bg_dark: colorsBase.blue.dark,
  },
  read_more: {
    from: colorsBase.white.from_read_more,
    to: {
      light: colorsBase.white.dark,
      dark: colorsBase.blue.dark,
    },
  },
  tab: {
    variant: {
      card: {
        badge_bg: colorsBase.primary,
        bg: {
          light: colorsBase.white.pure,
          dark: colorsBase.blue.grayish,
        },
        border: colorsBase.gray.normal,
        description: {
          light: colorsBase.gray.normal,
          dark: colorsBase.white.pure,
        },
        svg: colorsBase.primary,
      },
    },
    responsive_tab: {
      underline_border: colorsBase.gray.light,
    },
  },

  table: {
    bg: {
      light: colorsBase.white.light2,
      light_hover: colorsBase.white.dark,
      dark: colorsBase.blue.grayish,
    },
    thead: {
      bg_light: colorsBase.white.light2,
      bg_dark: colorsBase.blue.grayish,
    },
    variant: {
      striped: {
        light: {
          tr_even: colorsBase.white.pure,
          tr_odd: colorsBase.white.dark,
          hover: '#cce5de',
          border: '#dfdfdf',
        },
        dark: {
          tr_even: colorsBase.blue.grayish,
          tr_odd: colorsBase.blue.dark,
          hover: '#193d32',
          border: '#606060',
        },
      },
    },
  },
  usecases: {
    banner: {
      bg: {
        light: colorsBase.white.pure,
        dark: colorsBase.blue.dark,
      },
      subtitle: colorsBase.gray.dark2,
    },
    subtitle: colorsBase.primary,
    description: {
      light: colorsBase.gray.dark,
      dark: colorsBase.white.pure,
    },
    eyebrow: {
      light: colorsBase.primary,
      dark: colorsBase.white.pure,
    },
  },
  radio: {
    bg: colorsBase.primary,
    border: colorsBase.primary,
    disabled: {
      light: 'gray.300',
      dark: 'gray.600',
    },
  },
  text_area_bg: colorsBase.white.pure,
  text_area: {
    toolbar_dark: {
      bg: '#232323',
      border: colorsBase.white.light2,
      item_hover: colorsBase.blue.grayish,
    },
    bg_light: colorsBase.white.pure,
    bg_dark: 'transparent',
    border_dark: colorsBase.white.light2,
    placeholder: colorsBase.white.light2,
  },
  verify_subtitle: colorsBase.white.light2,

  wrapper: {
    bg_light: colorsBase.white.pure,
    bg_dark: colorsBase.blue.grayish,
  },

  black: {
    // comments refer to button styles
    50: '#e5e5e5', // ghost hover (light)
    100: '#cccccc', // hover (light)
    200: '#fafafa', // outline hover / ghost active (light)
    300: '#bbbbbb', // outline active (light)
    500: '#000000', // base solid
    550: '#262626', // custom (auth bg)
    600: '#353535', // solid hover
    650: '#0a0a0a', // custom
    700: '#2e2e2e', // solid active
    800: '#3f3f3f', // link active (dark)
  },

  gray: {
    50: '#fcfcfc',
    100: 'whitesmoke',
    400: '#b2b2b2',
    500: '#737373',
  },

  yellow: {
    400: '#FFDF4F',
  },

  red: {
    400: '#F95838',
  },
}
