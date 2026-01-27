import { chakra, forwardRef, omitThemingProps, useStyleConfig, type HeadingProps } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-providers'

export const OrganizationName = forwardRef<HeadingProps, 'h1'>((props, ref) => {
  const { organization } = useOrganization()
  const styles = useStyleConfig('OrganizationName', props)
  const rest = omitThemingProps(props)
  if (!organization) return null
  return (
    <chakra.h1 ref={ref} __css={styles} {...rest}>
      {organization.account.name.default || organization.address}
    </chakra.h1>
  )
})

OrganizationName.displayName = 'OrganizationName'
