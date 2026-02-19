import { Spinner, Square, type SquareProps, Text } from '@chakra-ui/react'
import { ReactNode, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

export const Loading = ({ ...rest }: SquareProps) => {
  const { t } = useTranslation()

  return (
    <Square display='flex' alignItems='center' justifyContent='center' size='full' minH='300px' {...rest}>
      <Spinner size='sm' mr={3} />
      <Text>{t('loading')}</Text>
    </Square>
  )
}

type SuspenseLoaderProps = SquareProps & {
  children: ReactNode
}

export const SuspenseLoader = ({ children, ...props }: SuspenseLoaderProps) => (
  <Suspense fallback={<Loading {...props} />}>{children}</Suspense>
)
