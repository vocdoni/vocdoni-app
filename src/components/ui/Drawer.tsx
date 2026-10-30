import {
  Box,
  Drawer,
  type DrawerBodyProps,
  type DrawerHeaderProps,
  type DrawerRootProps,
  type DrawerTitleProps,
  Icon,
  IconButton,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseButton } from '~components/ui/CloseButton'
import { CloseIcon } from '~theme/icons'

export interface PanelDrawerProps extends Omit<DrawerRootProps, 'children' | 'title'> {
  title: ReactNode
  description?: ReactNode
  /** A `Drawer.Trigger asChild` that opens the drawer, for a drawer that owns its button. */
  trigger?: ReactNode
  /** The drawer's actions, pinned under the body. */
  footer?: ReactNode
  closeLabel?: string
  bodyProps?: DrawerBodyProps
  children?: ReactNode
  closeVariant?: 'corner' | 'inline' | 'solid' | 'none'
  headerProps?: DrawerHeaderProps
  titleProps?: DrawerTitleProps
  rawBody?: boolean
}

/** The app's side panel: title, description, body, footer and a close control in the corner. */
export const PanelDrawer = ({
  title,
  description,
  trigger,
  footer,
  closeLabel,
  bodyProps,
  children,
  closeVariant = 'corner',
  headerProps,
  titleProps,
  rawBody,
  ...rootProps
}: PanelDrawerProps) => {
  const { t } = useTranslation()
  const label = closeLabel ?? t('close', { defaultValue: 'Close' })
  const heading = (
    <>
      <Drawer.Title {...titleProps}>{title}</Drawer.Title>
      {description && <Drawer.Description>{description}</Drawer.Description>}
    </>
  )

  return (
    <Drawer.Root {...rootProps}>
      <Drawer.Backdrop />
      {trigger}
      <Drawer.Positioner>
        <Drawer.Content>
          {closeVariant === 'corner' && (
            <Drawer.CloseTrigger asChild>
              <CloseButton aria-label={label} />
            </Drawer.CloseTrigger>
          )}
          {closeVariant === 'solid' && (
            <Drawer.ActionTrigger asChild>
              <IconButton aria-label={label} position='absolute' top='1.5' right='1.5'>
                <Icon as={CloseIcon} />
              </IconButton>
            </Drawer.ActionTrigger>
          )}
          <Drawer.Header {...headerProps}>
            {closeVariant === 'inline' ? (
              <>
                <Box>{heading}</Box>
                <Drawer.ActionTrigger asChild>
                  <IconButton aria-label={label} variant='ghost' size='sm'>
                    <CloseIcon />
                  </IconButton>
                </Drawer.ActionTrigger>
              </>
            ) : (
              heading
            )}
          </Drawer.Header>
          {rawBody ? children : <Drawer.Body {...bodyProps}>{children}</Drawer.Body>}
          {footer && <Drawer.Footer>{footer}</Drawer.Footer>}
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
