import {
  Badge,
  type BadgeProps,
  Button,
  type ButtonProps,
  CloseButton,
  Dialog,
  Icon,
  Popover,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuCheck, LuThumbsUp } from 'react-icons/lu'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'

/** Features the UI already shows but the backend can't serve yet. */
export type SoonFeature =
  | 'non_voters'
  | 'reminders'
  | 'code_delivery_log'
  | 'remove_voters'
  | 'extend_end_date'
  | 'activity_log'
  | 'quorum'
  | 'delegations'

const storageKey = (feature: SoonFeature) => `feature-interest:${feature}`

const readNoted = (feature: SoonFeature) => {
  try {
    return localStorage.getItem(storageKey(feature)) === '1'
  } catch {
    return false
  }
}

/** Records, once per browser, that someone wants a feature that isn't built yet. */
export const useFeatureInterest = (feature: SoonFeature) => {
  const [noted, setNoted] = useState(() => readNoted(feature))

  const register = () => {
    if (noted) return
    trackAnalyticsEvent({ name: AnalyticsEvents.FeatureInterest, props: { feature } })
    try {
      localStorage.setItem(storageKey(feature), '1')
    } catch {
      // Private mode or blocked storage: the event still went out
    }
    setNoted(true)
  }

  return { noted, register }
}

export const SoonTag = (props: BadgeProps) => {
  const { t } = useTranslation()
  return (
    <Badge colorPalette='purple' size='xs' {...props}>
      {t('coming_soon.tag', { defaultValue: 'Soon' })}
    </Badge>
  )
}

type SoonContentProps = { feature: SoonFeature; title: ReactNode; description: ReactNode }

const SoonContent = ({ feature, title, description }: SoonContentProps) => {
  const { t } = useTranslation()
  const { noted, register } = useFeatureInterest(feature)

  return (
    <Stack gap={2}>
      <Text fontSize='sm' fontWeight='bolder' display='flex' alignItems='center' gap={2}>
        {title}
        <SoonTag />
      </Text>
      <Text fontSize='sm' color='fg.muted'>
        {description}
      </Text>
      <Button
        size='xs'
        variant={noted ? 'ghost' : 'outline'}
        colorPalette='purple'
        alignSelf='flex-start'
        onClick={register}
        disabled={noted}
      >
        <Icon as={noted ? LuCheck : LuThumbsUp} />
        {noted
          ? t('coming_soon.noted', { defaultValue: "Thanks, we've noted it" })
          : t('coming_soon.interest', { defaultValue: "I'd use this" })}
      </Button>
    </Stack>
  )
}

type ComingSoonButtonProps = SoonContentProps &
  Omit<ButtonProps, 'title'> & {
    label: ReactNode
    icon?: React.ElementType
  }

/**
 * A control for a feature that isn't available yet, in the place it will live. It looks
 * disabled, and clicking it explains what's coming and lets the user say they'd use it.
 */
export const ComingSoonButton = ({
  feature,
  title,
  description,
  label,
  icon,
  ...buttonProps
}: ComingSoonButtonProps) => (
  <Popover.Root positioning={{ placement: 'bottom-start' }}>
    <Popover.Trigger asChild>
      <Button
        size='xs'
        variant='outline'
        colorPalette='gray'
        color='fg.subtle'
        borderStyle='dashed'
        aria-description={typeof title === 'string' ? title : undefined}
        {...buttonProps}
      >
        {icon && <Icon as={icon} />}
        {label}
        <SoonTag />
      </Button>
    </Popover.Trigger>
    <Portal>
      <Popover.Positioner>
        <Popover.Content maxW='18rem' p={3}>
          <SoonContent feature={feature} title={title} description={description} />
        </Popover.Content>
      </Popover.Positioner>
    </Portal>
  </Popover.Root>
)

/** The same explanation in a dialog, for entry points (like menu items) that can't host a popover. */
export const ComingSoonDialog = ({
  open,
  onOpenChange,
  ...content
}: SoonContentProps & { open: boolean; onOpenChange: (open: boolean) => void }) => (
  <Dialog.Root size='xs' placement='center' open={open} onOpenChange={(details) => onOpenChange(details.open)}>
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content p={5}>
          <SoonContent {...content} />
          <Dialog.CloseTrigger asChild>
            <CloseButton size='sm' />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
)
