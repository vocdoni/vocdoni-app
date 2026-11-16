import { Button, Drawer, Icon, IconButton, Menu, Portal } from '@chakra-ui/react'
import { cloneElement, useState, type ElementType, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '~components/ui/useIsMobile'
import { MoreIcon } from '~theme/icons'

export type ResponsiveMenuItem = {
  value: string
  label: string
  onSelect?: () => void
  href?: string
  danger?: boolean
  disabled?: boolean
  /** A concept icon from ~theme/icons, drawn before the label. */
  icon?: ElementType
}

export type ResponsiveMenuProps = {
  /** The accessible name of the trigger and the title of the sheet. */
  label: string
  /** The sheet's title on a phone: the name of what the actions act on (a vote). Defaults to `label`. */
  title?: string
  /** A line under the sheet's title, such as the state of that vote. */
  description?: string
  /** Defaults to an icon button with the "more" icon, named by `label`. */
  trigger?: ReactElement
  items: ResponsiveMenuItem[]
}

// Destructive items last, the rest in the order given.
const ordered = (items: ResponsiveMenuItem[]) => [...items.filter((i) => !i.danger), ...items.filter((i) => i.danger)]

/**
 * A list of actions: a dropdown from `md`, a bottom sheet of 52px rows below it (a menu is hard to hit with a thumb).
 * Destructive items come last, in the error colour; with `href` an item is a link.
 */
export const ResponsiveMenu = ({ label, title, description, trigger, items }: ResponsiveMenuProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const sorted = ordered(items)

  const defaultTrigger = (
    <IconButton variant='ghost' size='sm' aria-label={label}>
      <MoreIcon />
    </IconButton>
  )

  if (isMobile) {
    const opener = cloneElement(trigger ?? defaultTrigger, {
      'aria-haspopup': 'dialog',
      'aria-expanded': open,
      onClick: () => setOpen(true),
    } as object)

    return (
      <>
        {opener}
        <Drawer.Root
          variant='sheet'
          placement='bottom'
          open={open}
          onOpenChange={(e) => setOpen(e.open)}
          lazyMount
          unmountOnExit
        >
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>{title ?? label}</Drawer.Title>
                  {description && <Drawer.Description>{description}</Drawer.Description>}
                </Drawer.Header>
                <Drawer.Body display='flex' flexDirection='column' gap='1' pb='4'>
                  {sorted.map((item) => {
                    const select = () => {
                      item.onSelect?.()
                      setOpen(false)
                    }
                    const rowProps = {
                      variant: 'sheet-row',
                      disabled: item.disabled,
                      'data-danger': item.danger ? 'true' : undefined,
                      onClick: select,
                    } as const
                    const content = (
                      <>
                        {item.icon && <Icon as={item.icon} boxSize='icon.sm' aria-hidden />}
                        {item.label}
                      </>
                    )
                    return item.href ? (
                      <Button key={item.value} asChild {...rowProps}>
                        <a href={item.href}>{content}</a>
                      </Button>
                    ) : (
                      <Button key={item.value} {...rowProps}>
                        {content}
                      </Button>
                    )
                  })}
                  <Drawer.CloseTrigger asChild>
                    <Button variant='sheet-close'>{t('actions.close', { defaultValue: 'Close' })}</Button>
                  </Drawer.CloseTrigger>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </>
    )
  }

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger asChild aria-haspopup='menu'>
        {trigger ?? defaultTrigger}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content w='auto' aria-label={label}>
            {sorted.map((item) => (
              <Menu.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                color={item.danger ? 'danger.action' : undefined}
                data-danger={item.danger ? 'true' : undefined}
                onSelect={item.onSelect}
                asChild={!!item.href}
              >
                {item.href ? (
                  <a href={item.href}>
                    {item.icon && <Icon as={item.icon} boxSize='icon.sm' aria-hidden />}
                    {item.label}
                  </a>
                ) : (
                  <>
                    {item.icon && <Icon as={item.icon} boxSize='icon.sm' aria-hidden />}
                    {item.label}
                  </>
                )}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
