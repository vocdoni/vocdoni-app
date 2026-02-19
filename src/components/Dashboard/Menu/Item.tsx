import {
  Button,
  ButtonProps,
  Icon,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
} from '@chakra-ui/react'
import { ForwardedRef, forwardRef } from 'react'
import { Link as ReactRouterLink, generatePath } from 'react-router-dom'

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
        variant='listmenu'
        size='xs'
        colorPalette='gray'
        justifyContent='start'
        gap={4}
        p={2}
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
        variant='listmenu'
        size='xs'
        fontSize='sm'
        colorPalette='gray'
        justifyContent='start'
        gap={4}
        p={2}
        data-active={isActive ? '' : undefined}
        aria-current={isActive ? 'page' : undefined}
        {...buttonProps}
      >
        <ReactRouterLink to={generatePath(item.route)}>{inner}</ReactRouterLink>
      </Button>
    )

    return reduced ? (
      <TooltipRoot positioning={{ placement: 'right-end' }}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipPositioner>
          <TooltipContent>{item.label}</TooltipContent>
        </TooltipPositioner>
      </TooltipRoot>
    ) : (
      button
    )
  }
)
