import { Box, chakra, Flex, Text } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { Link as RouterLink, type To } from 'react-router'

export type FilterPillItem<V extends string = string> = {
  value: V
  label: ReactNode
  count?: ReactNode
  /** Shown before the label, e.g. a live dot */
  indicator?: ReactNode
}

type FilterPillsProps<V extends string> = {
  items: FilterPillItem<V>[]
  current: V
  /** Accessible name of the group ("Filter votes") */
  label: string
  onSelect?: (value: V) => void
  /** Link mode: each pill navigates, and the current one is `aria-current="page"`. Without it, pills are toggle buttons. */
  href?: (value: V) => To
}

/**
 * Rounded filter pills with an optional count each. With `href` they are links (a nav landmark),
 * otherwise toggle buttons with `aria-pressed`.
 */
export const FilterPills = <V extends string>({ items, current, label, onSelect, href }: FilterPillsProps<V>) => (
  <Flex as={href ? 'nav' : 'div'} role={href ? undefined : 'group'} gap={2} wrap='wrap' aria-label={label}>
    {items.map((item) => {
      const active = item.value === current
      const content = (
        <>
          {item.indicator}
          <Text as='span' fontSize='sm'>
            {item.label}
          </Text>
          {item.count !== undefined && (
            <Text
              as='span'
              fontSize='sm'
              fontWeight='bolder'
              fontVariantNumeric='tabular-nums'
              color={active ? undefined : 'fg'}
            >
              {item.count}
            </Text>
          )}
        </>
      )

      return (
        <Box
          asChild
          key={item.value}
          display='inline-flex'
          alignItems='center'
          gap={1.5}
          px={3}
          py={1}
          borderRadius='full'
          border='1px solid'
          borderColor={active ? 'transparent' : 'border'}
          bg={active ? 'colorPalette.solid' : 'transparent'}
          color={active ? 'colorPalette.contrast' : 'fg.muted'}
          _hover={active ? undefined : { borderColor: 'border.emphasized', color: 'fg' }}
          fontSize='sm'
          cursor='pointer'
        >
          {href ? (
            <RouterLink
              to={href(item.value)}
              aria-current={active ? 'page' : undefined}
              onClick={() => onSelect?.(item.value)}
            >
              {content}
            </RouterLink>
          ) : (
            <chakra.button type='button' aria-pressed={active} onClick={() => onSelect?.(item.value)}>
              {content}
            </chakra.button>
          )}
        </Box>
      )
    })}
  </Flex>
)
