import { Progress, Box, Button, HStack, Icon, Stack, TagLabel, TagRoot, Text, Wrap } from '@chakra-ui/react'
import { dotobject } from '~utils/objects'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock, LuSparkles } from 'react-icons/lu'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { useSubscription } from '~components/Auth/Subscription'
import { PlanFeaturesTranslationKeys } from '~components/Pricing/Features'
import { usePlans, usePlanTranslations } from '~components/Pricing/Plans'
import { SubscriptionPermission } from '~constants'
import { Routes } from '~src/router/routes'
import { AnalyticsEvents } from '~utils/analytics'

type SubscriptionLockedContentProps = {
  children: (args: { isLocked: boolean }) => React.ReactNode
  permissionType: SubscriptionPermission
}

const useGetPlansWithFeature = (feature: SubscriptionPermission) => {
  const { data: plans = [] } = usePlans()
  return plans.filter((plan) => dotobject(plan, feature))
}

export const SubscriptionLockedContent = ({ children, permissionType }: SubscriptionLockedContentProps) => {
  const { t } = useTranslation()
  const { loading, permission, subscription } = useSubscription()
  const plansWithFeature = useGetPlansWithFeature(permissionType)
  const translations = usePlanTranslations()
  const plan = translations[subscription?.plan?.id]?.title ?? subscription?.plan?.name ?? subscription?.plan?.id
  const permissionName = t(PlanFeaturesTranslationKeys[permissionType])
  const hasPermission = permission(permissionType)
  const isLocked = !hasPermission
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    if (loading || hasPermission) return
    trackEvent({
      name: AnalyticsEvents.FeatureBlocked,
      props: { feature: permissionType, plan: subscription?.plan?.name ?? 'unknown' },
    })
  }, [loading, hasPermission, permissionType, subscription?.plan?.name, trackEvent])

  if (loading) {
    return (
      <Progress.Root size='xs' colorPalette='gray' value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  if (hasPermission) return children({ isLocked })

  return (
    <Box borderWidth='1px' borderRadius='lg' display='grid'>
      <Box
        gridArea='1 / 1'
        pointerEvents='none'
        filter='blur(5px)'
        borderRadius='lg'
        overflow='hidden'
        aria-hidden={isLocked}
      >
        {children({ isLocked })}
      </Box>

      <Box
        gridArea='1 / 1'
        display='flex'
        alignItems='center'
        justifyContent='center'
        flexDirection='column'
        gap={3}
        borderRadius='lg'
        p={4}
        zIndex={1}
      >
        <Icon as={LuLock} boxSize={8} mb={1} />
        <Text fontWeight='bold' textAlign='center'>
          {t(`subscription.locked_content.title`, {
            defaultValue: 'Your current {{ plan }} plan does not include {{ permissionName }}',
            plan,
            permissionName,
          })}
        </Text>
        <Text fontSize='sm' color='texts.dark' textAlign='center'>
          {t(`subscription.locked_content.description`, {
            defaultValue: 'Upgrade your plan to get {{ permissionName }} and more.',
            permissionName,
          })}
        </Text>

        {plansWithFeature.length > 0 && (
          <Stack gap={2} align='center' mt={2}>
            <Text fontSize='sm' color='texts.dark'>
              {t('subscription.locked_content.available_in', { defaultValue: 'Available in:' })}
            </Text>
            <Wrap justify='center' gap={2}>
              {plansWithFeature.map((p) => (
                <TagRoot key={p.id} size='md' variant='subtle' colorPalette='green'>
                  <TagLabel>{translations[p.id]?.title ?? p.name ?? p.id}</TagLabel>
                </TagRoot>
              ))}
            </Wrap>
          </Stack>
        )}

        <Button asChild>
          <ReactRouterLink to={generatePath(Routes.dashboard.settings.subscription)}>
            <HStack gap={2}>
              <Icon as={LuSparkles} />
              <Text as='span'>
                {t(`subscription.locked_content.unlock`, {
                  defaultValue: 'Unlock {{ permissionName }}',
                  permissionName,
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
      </Box>
    </Box>
  )
}
