import { Drawer, type DrawerBodyProps, type DrawerRootProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseButton } from '~components/ui/CloseButton'

export interface PanelDrawerProps extends Omit<DrawerRootProps, 'children' | 'title'> {
  title: ReactNode
  description?: ReactNode
  /** A `Drawer.Trigger asChild` that opens the drawer, for a drawer that owns its button. */
  trigger?: ReactNode
  /** The drawer's actions, pinned under the body. A submit button names its form with `form`. */
  footer?: ReactNode
  bodyProps?: DrawerBodyProps
  children?: ReactNode
}

/** The app's side panel: title, description, body, footer and a close control in the corner. */
export const PanelDrawer = ({
  title,
  description,
  trigger,
  footer,
  bodyProps,
  children,
  ...rootProps
}: PanelDrawerProps) => {
  const { t } = useTranslation()

  return (
    <Drawer.Root {...rootProps}>
      <Drawer.Backdrop />
      {trigger}
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <CloseButton aria-label={t('drawer.close', { defaultValue: 'Close drawer' })} />
          </Drawer.CloseTrigger>
          <Drawer.Header>
            <Drawer.Title>{title}</Drawer.Title>
            {description && <Drawer.Description>{description}</Drawer.Description>}
          </Drawer.Header>
          <Drawer.Body {...bodyProps}>{children}</Drawer.Body>
          {footer && <Drawer.Footer>{footer}</Drawer.Footer>}
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}
