import { Box, chakra, Flex, Progress, Text, useMultiStyleConfig } from '@chakra-ui/react'
import { useClient, useDatesLocale, useElection } from '@vocdoni/react-providers'
import { ElectionResultsTypeNames, ElectionStatus, formatUnits, PublishedElection } from '@vocdoni/sdk'
import { format } from 'date-fns'
import { Fragment } from 'react'

const percent = (result: number, total: number) => `${((Number(result) / total) * 100 || 0).toFixed(1)}%`

const resultsValue = (result: number, decimals?: number) =>
  decimals ? parseInt(formatUnits(BigInt(result), decimals), 10) : result

export const ElectionResults = (props: { forceRender?: boolean } & React.ComponentProps<typeof Flex>) => {
  const styles = useMultiStyleConfig('ElectionResults')
  const { election } = useElection()
  const { localize } = useClient()
  const locale = useDatesLocale()

  if (!election || !(election instanceof PublishedElection) || election.status === ElectionStatus.CANCELED) return null

  if (election.electionType.secretUntilTheEnd && election.status !== ElectionStatus.RESULTS && !props.forceRender) {
    return (
      <Text sx={styles.secret} {...props}>
        {localize('results.secret_until_the_end', {
          endDate: format(election.endDate, localize('results.date_format'), { locale }),
        })}
      </Text>
    )
  }

  const decimals = election.meta?.token?.decimals || 0
  const totalsAbstain = election.questions.map((q) => ('numAbstains' in q ? Number(q.numAbstains) : 0))
  const totals = election.questions
    .map((question, idx) =>
      question.choices.reduce((acc, choice) => acc + Number(choice.results), totalsAbstain[idx])
    )
    .map((votes) => resultsValue(votes, decimals))

  return (
    <Flex sx={styles.wrapper} {...props}>
      {election.questions.map((question, idx) => {
        const choices = electionChoices(election, question, localize('vote.abstain'))
        return (
          <chakra.div sx={styles.question} key={idx}>
            <chakra.div sx={styles.header}>
              <Text sx={styles.title}>{localize('results.title', { title: question.title.default })}</Text>
            </chakra.div>
            <chakra.div sx={styles.body}>
              {choices.map((choice, i) => (
                <Box key={i}>
                  {totals && (
                    <Fragment>
                      <Text sx={styles.choiceTitle}>{choice.title.default}</Text>
                      <Text sx={styles.choiceVotes}>
                        {localize('results.votes', {
                          votes: resultsValue(Number(choice.results), decimals) || 0,
                          percent: percent(resultsValue(Number(choice.results), decimals), totals[idx]),
                        })}
                      </Text>
                      <Progress
                        sx={styles.progress}
                        value={(Number(choice.results) / totals[idx]) * 100 / 10 ** decimals || 0}
                      />
                    </Fragment>
                  )}
                </Box>
              ))}
            </chakra.div>
          </chakra.div>
        )
      })}
    </Flex>
  )
}

const electionChoices = (
  election: PublishedElection,
  question: PublishedElection['questions'][number],
  abstainLabel: string
) => {
  const choices = [...question.choices]
  if (election.resultsType.name === ElectionResultsTypeNames.MULTIPLE_CHOICE && election.resultsType.properties.canAbstain) {
    choices.push({
      title: { default: abstainLabel },
      results: question.numAbstains,
      value: -1,
    })
  }
  return choices
}
