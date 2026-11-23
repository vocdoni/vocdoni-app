import { Button, ButtonProps, Icon } from '@chakra-ui/react'
import { ForwardedRef, forwardRef } from 'react'
import { Link as ReactRouterLink, generatePath } from 'react-router'
import { Tooltip } from '~components/ui/Tooltip'
import { usePrefetchRoute } from '~src/router/route-prefetch'

export type DashboardMenuItem = {
  label: string
  icon?: any
  route?: string
  activeMatch?: {
    path: string
    end?: boolean
  }[]
}

type DashboardMenuItemButtonProps = ButtonProps & {
  item: DashboardMenuItem
  reduced: boolean
  isActive?: boolean
}

export const DashboardMenuItemButton = forwardRef(
  ({ item, reduced, isActive, ...buttonProps }: DashboardMenuItemButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const isDisabled = !item.route
    const prefetch = usePrefetchRoute()
    const inner = (
      <>
        <Icon as={item.icon} />
        {!reduced && item.label}
      </>
    )

    const button = isDisabled ? (
      <Button
        ref={ref}
        onClick={(e) => {
          if (isDisabled) e.preventDefault()
        }}
        variant='nav-item'
        size='xs'
        colorPalette='gray'
        disabled={isDisabled}
        data-active={isActive ? '' : undefined}
        aria-current={isActive ? 'page' : undefined}
        {...buttonProps}
      >
        {inner}
      </Button>
    ) : (
      <Button
        ref={ref}
        asChild
        variant='nav-item'
        size='xs'
        colorPalette='gray'
        data-active={isActive ? '' : undefined}
        aria-current={isActive ? 'page' : undefined}
        {...buttonProps}
      >
        <ReactRouterLink
          to={generatePath(item.route)}
          // Starts the section's code on intent, so the click rarely waits for it
          onMouseEnter={() => prefetch(generatePath(item.route))}
          onFocus={() => prefetch(generatePath(item.route))}
        >
          {inner}
        </ReactRouterLink>
      </Button>
    )

    return reduced ? (
      <Tooltip portalled={false} positioning={{ placement: 'right-end' }} content={item.label}>
        {button}
      </Tooltip>
    ) : (
      button
    )
  }
)
