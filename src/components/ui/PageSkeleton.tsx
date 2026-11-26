import { Skeleton, Stack, type StackProps, VisuallyHidden } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DashboardContents } from '~components/Dashboard/Contents'

/**
 * The page-shaped placeholder of a dashboard page that has not loaded yet: a title bar and a few
 * content blocks, laid out like DashboardContents so the page lands where the placeholder was.
 */
export const PageSkeleton = (props: StackProps) => {
  const { t } = useTranslation()

  return (
    <DashboardContents aria-busy='true'>
      <VisuallyHidden>{t('loading')}</VisuallyHidden>
      <Stack gap='6' aria-hidden='true' {...props}>
        <Stack gap='3'>
          <Skeleton h='8' w='2/5' maxW='sm' />
          <Skeleton h='4' w='3/5' maxW='lg' />
        </Stack>
        <Skeleton h='40' borderRadius='md' />
        <Skeleton h='64' borderRadius='md' />
      </Stack>
    </DashboardContents>
  )
}
