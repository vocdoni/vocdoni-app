import {
  Button,
  Flex,
  Input,
  Text,
  useRecipe,
  useSlotRecipe,
  type ButtonProps,
  type FlexProps,
  type InputProps,
  type TextProps,
} from '@chakra-ui/react'
import { defineComponent, type ComponentsPartialDefinition } from '@vocdoni/react-components'
import { Link as RouterLink } from 'react-router-dom'

export const paginationComponents: ComponentsPartialDefinition = {
  PaginationContainer: defineComponent<'PaginationContainer', FlexProps>(({ items, ...props }) => {
    const recipe = useSlotRecipe({ key: 'Pagination' })
    const styles = recipe()
    return (
      <Flex css={styles.wrapper} {...props}>
        {items}
      </Flex>
    )
  }),
  PaginationButton: defineComponent<'PaginationButton', ButtonProps>(
    ({ label, href, isActive, disabled, onClick, className, ...props }) => {
      const recipe = useRecipe({ key: 'PaginationButton' })
      const styles = recipe()
      return href ? (
        <Button
          asChild
          className={className}
          css={styles}
          data-active={isActive ? '' : undefined}
          disabled={disabled}
          {...props}
        >
          <RouterLink to={href}>{label}</RouterLink>
        </Button>
      ) : (
        <Button
          className={className}
          css={styles}
          data-active={isActive ? '' : undefined}
          disabled={disabled}
          onClick={onClick as any}
          {...props}
        >
          {label}
        </Button>
      )
    }
  ),
  PaginationEllipsisButton: defineComponent<'PaginationEllipsisButton', ButtonProps & InputProps>(
    ({ isInput, placeholder, onToggle, onSubmitPage, buttonProps, inputProps, className }) => {
      const recipe = useSlotRecipe({ key: 'EllipsisButton' })
      const styles = recipe()

      if (isInput) {
        return (
          <Input
            size='xs'
            w='2rem'
            className={className}
            css={styles.input}
            placeholder={placeholder}
            onBlur={onToggle}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              const page = Number((event.currentTarget as HTMLInputElement).value)
              onSubmitPage(page)
            }}
            autoFocus
            {...((inputProps || {}) as any)}
          />
        )
      }

      return (
        <Button
          className={className}
          css={styles.button}
          onClick={(event) => {
            event.preventDefault()
            onToggle()
          }}
          {...((buttonProps || {}) as any)}
        >
          ...
        </Button>
      )
    }
  ),
  PaginationSummary: defineComponent<'PaginationSummary', TextProps>(({ text, ...props }) => {
    const recipe = useSlotRecipe({ key: 'Pagination' })
    const styles = recipe()
    return (
      <Text css={styles.totalResults} {...props}>
        {text}
      </Text>
    )
  }),
}
