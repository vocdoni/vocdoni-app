import {
  Box,
  type BoxProps,
  Progress,
  type ProgressRootProps,
  Spinner,
  type SpinnerProps,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PageLoader as pageLoaderRecipe } from '~theme/recipes/loader'
import { statusPalette } from '~theme/status'

export type PageLoaderProps = BoxProps

/** A page, tab or dialog with nothing to show yet: a centred spinner and its label ("Loading" by default). */
export const PageLoader = ({ children, ...props }: PageLoaderProps) => {
  const { t } = useTranslation()
  const styles = useSlotRecipe({ recipe: pageLoaderRecipe })()

  return (
    <Box css={styles.root} {...props}>
      <Spinner size='sm' css={styles.spinner} />
      <Text>{children ?? t('loading')}</Text>
    </Box>
  )
}

export type ListLoaderProps = Omit<ProgressRootProps, 'value' | 'size' | 'colorPalette' | 'variant'>

/** A list, table or block of a page that is fetching: a thin grey indeterminate bar across its width. */
export const ListLoader = (props: ListLoaderProps) => (
  <Progress.Root value={null} size='xs' colorPalette={statusPalette.neutral} w='full' {...props}>
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
)

export type InlineLoaderProps = Omit<SpinnerProps, 'size'>

/** A wait inside a control, a menu item or a line of text: a 16px spinner, the size of the icon it replaces. */
export const InlineLoader = (props: InlineLoaderProps) => <Spinner size='sm' {...props} />
