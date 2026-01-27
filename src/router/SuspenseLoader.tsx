import { Spinner, Square, SquareProps, Text } from '@chakra-ui/react'
import { ReactNode, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

export const Loading = ({ ...rest }: SquareProps) => {
  const { t } = useTranslation()

  return (
    <Square display='flex' alignItems='center' justifyContent='center' size='full' h='300px' {...rest}>
      <Spinner size='sm' mr={3} />
      <Text>{t('loading')}</Text>
    </Square>
  )
}

export const SuspenseLoader = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
)
