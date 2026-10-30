import { defineTextStyles } from '@chakra-ui/react'

// App text roles, next to Chakra's own `2xs`…`7xl` and `label` (the field label), which keep their names.
// Roles hold typography only: colour stays a separate prop, because a textStyle and a prop setting the
// same property resolve in prop order (and chakra memoizes that per sorted key set), so never pass both.
export const textStyles = defineTextStyles({
  body: { value: { fontSize: 'md', lineHeight: 'moderate' } },
  'body-sm': { value: { fontSize: 'sm', lineHeight: 'moderate' } },
  caption: { value: { fontSize: 'xs', lineHeight: 'moderate' } },
  // Small uppercase labels over a figure or a group.
  eyebrow: { value: { fontSize: 'xs', lineHeight: 'moderate', letterSpacing: 'wide', textTransform: 'uppercase' } },
  'page-title': { value: { fontSize: '2xl', lineHeight: 'short', fontWeight: 'bold' } },
  'section-title': { value: { fontSize: '2xl', lineHeight: 'short', fontWeight: 'bold' } },
  // Public process and organisation names.
  display: { value: { fontSize: { base: '3xl', md: '4xl' }, lineHeight: 'short', fontWeight: 'bold' } },
})

// Heading sizes of user-written content by Markdown level, shared by the editor and the rendered Markdown.
export const proseHeadingSizes = { h1: '2xl', h2: 'xl', h3: 'lg', h4: 'md', h5: 'md', h6: 'md' } as const
