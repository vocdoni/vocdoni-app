import {
  Button,
  Flex,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  UnorderedList,
  useMultiStyleConfig,
} from '@chakra-ui/react'
import { useConfirm } from '~components/vocdoni-ui'
import { ElectionResultsTypeNames, IQuestion, PublishedElection } from '@vocdoni/sdk'
import { FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export const ConfirmVoteModal = ({ election, answers }: { election: PublishedElection; answers: FieldValues }) => {
  const { t } = useTranslation()
  const styles = useMultiStyleConfig('ConfirmModal', { variant: 'neutral' })
  const { isOpen, cancel, proceed } = useConfirm()

  return (
    <Modal size='lg' isOpen={isOpen} onClose={cancel}>
      <ModalContent>
        <ModalHeader>
          <Text>{t('process.spreadsheet.confirm.description')}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody display='flex' flexDirection='column' gap={4}>
          <Flex direction='column' gap={2} border='1px solid' borderColor='table.border' borderRadius='lg' p={4}>
            <Text size='sm' color='texts.subtle'>
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
        </ModalBody>
        <ModalFooter sx={styles.footer}>
          <Button onClick={cancel!} variant='ghost' sx={styles.cancel}>
            {t('cc.confirm.cancel')}
          </Button>
          <Button onClick={proceed!} sx={styles.confirm}>
            {t('cc.confirm.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const ConfirmMultichoice = ({ question, answers }: { question: IQuestion; answers: FieldValues }) => {
  const { t } = useTranslation()

  // Add abstain option to choices if needed
  const choices = [...question.choices]
  if (answers[0].includes('-1')) {
    choices[-1] = {
      title: {
        default: t('cc.vote.abstain'),
      },
      value: -1,
    }
  }

  return (
    <Flex direction='column' gap={1}>
      {answers[0].length === 0 ? (
        <Text>{t('process.spreadsheet.confirm.blank_vote')}</Text>
      ) : (
        <UnorderedList>
          {answers[0].map((answer: string) => (
            <ListItem key={answer}>
              <Text color='texts.subtle'>{choices[Number(answer)].title.default}</Text>
            </ListItem>
          ))}
        </UnorderedList>
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
