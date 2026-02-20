import { Button, CloseButton, Dialog, Flex, List, Text, useSlotRecipe } from '@chakra-ui/react'
import { ElectionResultsTypeNames, IQuestion, PublishedElection } from '@vocdoni/sdk'
import { FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useConfirm } from '~components/vocdoni-ui'

export const ConfirmVoteModal = ({ election, answers }: { election: PublishedElection; answers: FieldValues }) => {
  const { t } = useTranslation()
  const recipe = useSlotRecipe({ key: 'ConfirmModal' })
  const styles = recipe({ variant: 'neutral' })
  const { isOpen, cancel, proceed } = useConfirm()

  return (
    <Dialog.Root open={isOpen} onOpenChange={proceed}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>
          <Dialog.Header>
            <Dialog.Title>{t('process.spreadsheet.confirm.description')}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Flex direction='column' gap={2} border='1px solid' borderColor='table.border' borderRadius='lg' p={4}>
              <Text fontSize='sm' color='texts.subtle'>
                {t('process.spreadsheet.confirm.election_title', { defaultValue: 'Your vote has been recorded for:' })}
              </Text>
              <Text fontWeight='extrabold'>{election.title.default}</Text>
            </Flex>
            <Text fontWeight='extrabold'>
              {t('process.spreadsheet.confirm.your_selections', { defaultValue: 'Your Selections:' })}
            </Text>
            <Flex direction='column' gap={2} border='1px solid' borderColor='table.border' borderRadius='lg' p={4}>
              {election.questions.map((q, i) => (
                <Flex key={i} direction='column' gap={2}>
                  <Text fontWeight='extrabold'>{q.title.default}</Text>
                  {election.resultsType.name === ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION ? (
                    <ConfirmQuestion question={q} answers={answers} index={i} />
                  ) : (
                    <ConfirmMultichoice question={q} answers={answers} />
                  )}
                </Flex>
              ))}
            </Flex>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={cancel!} variant='ghost' css={styles.cancel}>
              {t('confirm.cancel')}
            </Button>
            <Button onClick={proceed!} css={styles.confirm}>
              {t('confirm.confirm')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

const ConfirmMultichoice = ({ question, answers }: { question: IQuestion; answers: FieldValues }) => {
  const { t } = useTranslation()

  // Add abstain option to choices if needed
  const choices = [...question.choices]
  if (answers[0].includes('-1')) {
    choices[-1] = {
      title: {
        default: t('vote.abstain'),
      },
      value: -1,
    }
  }

  return (
    <Flex direction='column' gap={1}>
      {answers[0].length === 0 ? (
        <Text>{t('process.spreadsheet.confirm.blank_vote')}</Text>
      ) : (
        <List.Root display='flex' flexDirection='column' gap={1} pl={4} listStyleType='disc'>
          {answers[0].map((answer: string) => (
            <List.Item key={answer}>
              <Text color='texts.subtle'>{choices[Number(answer)].title.default}</Text>
            </List.Item>
          ))}
        </List.Root>
      )}
    </Flex>
  )
}

const ConfirmQuestion = ({
  question,
  answers,
  index,
}: {
  question: IQuestion
  answers: FieldValues
  index: number
}) => {
  return (
    <Flex direction='column' gap={1}>
      {question.choices[Number(answers[index])].title.default}
    </Flex>
  )
}
