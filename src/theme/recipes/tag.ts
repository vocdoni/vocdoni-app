import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { tagAnatomy } from '@chakra-ui/react/anatomy'

const baseStyle = {
  root: {
    width: 'fit',
    display: 'flex',
    justifyContent: 'center',
    py: '0',
  },
  // Centre icons on their own box: inside a heading they would sit on its tall line instead.
  startElement: { display: 'flex', alignItems: 'center' },
  endElement: { display: 'flex', alignItems: 'center' },
} satisfies Partial<Record<string, SystemStyleObject>>

// A tag is a small outlined word with no fill. Chakra's four variants borrow the badge looks, which each paint
// their own fill and colour, so all of them restate the one look.
const outlined = {
  root: {
    bg: 'transparent',
    color: 'fg.subtle',
    borderRadius: 'xs',
    borderWidth: 'hairline',
    borderColor: 'border.emphasized',
    fontWeight: 'medium',
    shadow: '[none]',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Tag = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: baseStyle,
  variants: {
    variant: {
      subtle: outlined,
      solid: outlined,
      outline: outlined,
      surface: outlined,
      // What kind of thing it is (a question's ballot type on the organiser's ballot): the outlined word in the
      // muted ink, a step darker than the other tags.
      kind: {
        root: {
          ...outlined.root,
          color: 'fg.muted',
        },
      },
      // Something proposed, not decided: dashed.
      proposal: {
        root: {
          ...outlined.root,
          borderStyle: '[dashed]',
          borderColor: 'border.strong',
          color: 'fg.muted',
        },
      },
    },
  },
})
