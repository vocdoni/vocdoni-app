import { Button, Drawer, IconButton, Menu, Portal } from '@chakra-ui/react'
import { cloneElement, Fragment, useState, type ElementType, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsMobile } from '~components/ui/useIsMobile'
import { MoreIcon } from '~theme/icons'

export type ResponsiveMenuItem = {
  value: string
  label: string
  onSelect?: () => void
  href?: string
  /** With `href`: opens in a new tab, so the page the menu sits on (a live vote) stays open. */
  external?: boolean
  danger?: boolean
  disabled?: boolean
  /** A concept icon from ~theme/icons, drawn before the label on a phone and a tablet (the desktop menu has none). */
  icon?: ElementType
}

export type ResponsiveMenuProps = {
  /** The accessible name of the trigger and the title of the sheet. */
  label: string
  /** The sheet's title on a phone: the name of what the actions act on (a vote). Defaults to `label`. */
  title?: string
  /** The line under the sheet's title on a phone: the state of what the actions act on ("Live"). */
  subtitle?: string
  /** Defaults to an icon button with the "more" icon, named by `label`. */
  trigger?: ReactElement
  items: ResponsiveMenuItem[]
}

// Destructive items last, the rest in the order given.
const ordered = (items: ResponsiveMenuItem[]) => [...items.filter((i) => !i.danger), ...items.filter((i) => i.danger)]

// A disabled item is never a link: an anchor would still follow its href.
const linkOf = (item: ResponsiveMenuItem) => (item.href && !item.disabled ? item.href : undefined)
const linkProps = (item: ResponsiveMenuItem) =>
  item.external ? { href: item.href, target: '_blank', rel: 'noopener noreferrer' } : { href: item.href }

const ItemContent = ({ item }: { item: ResponsiveMenuItem }) => {
  const ItemIcon = item.icon
  return (
    <>
      {ItemIcon && <ItemIcon aria-hidden />}
      {item.label}
    </>
  )
}

/**
 * A list of actions: a dropdown from `md` (menu `actions`: 200px with icons on a tablet, 252px without from `lg`, a
 * rule before the destructive items), a bottom sheet of 52px rows below it (a menu is hard to hit with a thumb).
 * Destructive items come last, in the danger colour; with `href` an item is a link.
 */
export const ResponsiveMenu = ({ label, title, subtitle, trigger, items }: ResponsiveMenuProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const sorted = ordered(items)
  const sub = subtitle
  const firstDanger = sorted.findIndex((item) => item.danger)

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
                  {sub && <Drawer.Description>{sub}</Drawer.Description>}
                </Drawer.Header>
                <Drawer.Body>
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
                    return linkOf(item) ? (
                      <Button key={item.value} asChild {...rowProps}>
                        <a {...linkProps(item)}>
                          <ItemContent item={item} />
                        </a>
                      </Button>
                    ) : (
                      <Button key={item.value} {...rowProps}>
                        <ItemContent item={item} />
                      </Button>
                    )
                  })}
                  {/* ActionTrigger, not CloseTrigger: that one carries the corner close button's absolute position. */}
                  <Drawer.ActionTrigger asChild>
                    <Button variant='sheet-close'>{t('actions.close', { defaultValue: 'Close' })}</Button>
                  </Drawer.ActionTrigger>
                </Drawer.Body>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>
      </>
    )
  }

  return (
    // 6px under the trigger, as the boards place it.
    <Menu.Root variant='actions' positioning={{ placement: 'bottom-end', gutter: 6 }}>
      <Menu.Trigger asChild aria-haspopup='menu'>
        {trigger ?? defaultTrigger}
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content aria-label={label}>
            {sorted.map((item, index) => (
              <Fragment key={item.value}>
                {index === firstDanger && index > 0 && <Menu.Separator />}
                <Menu.Item
                  value={item.value}
                  disabled={item.disabled}
                  data-danger={item.danger ? 'true' : undefined}
                  onSelect={item.onSelect}
                  asChild={!!linkOf(item)}
                >
                  {linkOf(item) ? (
                    <a {...linkProps(item)}>
                      <ItemContent item={item} />
                    </a>
                  ) : (
                    <ItemContent item={item} />
                  )}
                </Menu.Item>
              </Fragment>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
