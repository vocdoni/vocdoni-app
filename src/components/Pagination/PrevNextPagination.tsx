import { ButtonGroup, Flex, IconButton, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

type PrevNextPaginationProps = {
  // Page indicator shown on the left, e.g. "Page 2 of 5 · 42 total".
  text: ReactNode
  hasPrevious: boolean
  hasNext: boolean
  // Blocks both buttons, e.g. while the page on screen is placeholder data for the one being loaded.
  disabled?: boolean
  onPrevious: () => void
  onNext: () => void
}

/** Footer of a list paginated by previous/next only: a page indicator and two icon buttons. */
export const PrevNextPagination = ({
  text,
  hasPrevious,
  hasNext,
  disabled = false,
  onPrevious,
  onNext,
}: PrevNextPaginationProps) => {
  const { t } = useTranslation()

  return (
    <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
      <Text fontSize='sm' color='texts.subtle'>
        {text}
      </Text>
      <ButtonGroup size='sm' variant='outline' attached>
        <IconButton
          aria-label={t('pagination.previous', { defaultValue: 'Previous page' })}
          disabled={disabled || !hasPrevious}
          onClick={onPrevious}
        >
          <LuChevronLeft />
        </IconButton>
        <IconButton
          aria-label={t('pagination.next', { defaultValue: 'Next page' })}
          disabled={disabled || !hasNext}
          onClick={onNext}
        >
          <LuChevronRight />
        </IconButton>
      </ButtonGroup>
    </Flex>
  )
}
