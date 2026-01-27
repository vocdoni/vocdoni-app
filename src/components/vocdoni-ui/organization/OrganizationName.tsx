import { chakra, useRecipe, type HeadingProps } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { useOrganization } from '@vocdoni/react-providers'

type OrganizationNameProps = HeadingProps & { size?: string; variant?: string }

export const OrganizationName = forwardRef<HTMLHeadingElement, OrganizationNameProps>((props, ref) => {
  const { organization } = useOrganization()
  const { size, variant, ...rest } = props
  const recipe = useRecipe({ key: 'OrganizationName' })
  const styles = recipe({ size, variant })
  if (!organization) return null
  return (
    <chakra.h1 ref={ref} css={styles} {...rest}>
      {organization.account.name.default || organization.address}
    </chakra.h1>
  )
})

OrganizationName.displayName = 'OrganizationName'
