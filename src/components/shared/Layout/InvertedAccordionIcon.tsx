import { AccordionItemIndicator, type AccordionItemIndicatorProps } from '@chakra-ui/react'

const InvertedAccordionIcon = (props: AccordionItemIndicatorProps) => (
  <AccordionItemIndicator
    css={{
      transform: 'rotate(180deg)',
      transition: 'transform 0.2s ease-in-out',
      '&[data-state="open"]': {
        transform: 'rotate(0deg)',
      },
    }}
    {...props}
  />
)

export default InvertedAccordionIcon
