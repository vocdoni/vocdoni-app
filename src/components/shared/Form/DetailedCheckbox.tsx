import {
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  type CheckboxRootProps,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react'
import { cloneElement, ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'

export type DetailedCheckboxProps = CheckboxRootProps & {
  badge?: ReactElement
  description?: string
  icon?: ReactElement
  name: string
  title: string
}

export const DetailedCheckbox = ({ icon, badge, title, description, name, ...props }: DetailedCheckboxProps) => {
  const recipe = useSlotRecipe({ key: 'DetailedCheckbox' })
  const styles = recipe(props)
  const { register } = useFormContext()

  const registration = register(name)

  return (
    <CheckboxRoot variant='detailed' {...props} css={styles.checkbox}>
      <CheckboxHiddenInput {...registration} />
      <CheckboxControl />
      <CheckboxLabel>
        <Text css={styles.title}>
          {icon && cloneElement(icon, { css: styles.icon })}
          {title}
        </Text>
        <Text css={styles.description}>{description}</Text>
        {badge && cloneElement(badge, { css: styles.badge })}
      </CheckboxLabel>
    </CheckboxRoot>
  )
}
