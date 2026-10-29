import { defineTextStyles } from '@chakra-ui/react'

// App text roles, next to Chakra's own `2xs`…`7xl` and `label` (the field label), which keep their names.
// Roles hold typography only: colour stays a separate prop, because a textStyle and a prop setting the
// same property resolve in prop order (and chakra memoizes that per sorted key set), so never pass both.
export const textStyles = defineTextStyles({
  body: { value: { fontSize: 'md', lineHeight: 1.5 } },
  'body-sm': { value: { fontSize: 'sm', lineHeight: 1.5 } },
  caption: { value: { fontSize: 'xs', lineHeight: 1.5 } },
  // Small uppercase labels over a figure or a group.
  eyebrow: { value: { fontSize: 'xs', letterSpacing: 'wide', textTransform: 'uppercase' } },
  'page-title': { value: { fontSize: '2xl', lineHeight: '2rem', fontWeight: 'bold' } },
  'section-title': { value: { fontSize: '2xl', lineHeight: 1.3, fontWeight: 'bold' } },
  // The public process name.
  display: { value: { fontSize: '4xl', lineHeight: 1.3, fontWeight: 'bold' } },
})
