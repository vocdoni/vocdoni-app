import { Box, Button, Card, Flex, Grid, Icon, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { ProcessStatus, type ProcessStatusState } from '~components/ui/ProcessStatus'
import { Routes } from '~routes'
import { AddIcon, ForwardIcon } from '~theme/icons'

const LEGEND_STATES = ['draft', 'ready', 'live', 'closed'] as const satisfies readonly ProcessStatusState[]

// The legend's rows are told apart by the same dashed rule as its edge.
const dashedRule = {
  borderTopWidth: 'hairline',
  borderTopStyle: '[dashed]',
  borderColor: 'border.emphasized',
} as const

/** What each state will mean, under a dashed edge: an explanation, not data. */
const StateLegend = () => {
  const { t } = useTranslation()
  const legend: Record<(typeof LEGEND_STATES)[number], string> = {
    draft: t('votes.empty.legend.draft', {
      defaultValue: 'You prepare it at your own pace. Nobody sees it and it costs nothing.',
    }),
    ready: t('votes.empty.legend.ready', { defaultValue: 'It is published and waits for the day you chose.' }),
    live: t('votes.empty.legend.live', { defaultValue: 'People vote and you follow the turnout.' }),
    closed: t('votes.empty.legend.closed', {
      defaultValue: 'You have the result, and can duplicate it for the next one.',
    }),
  }
  const title = t('votes.empty.legend_title', { defaultValue: 'What you will see here' })

  return (
    <Card.Root variant='note' as='section' aria-label={title} p='0'>
      <Flex
        align='baseline'
        wrap='wrap'
        columnGap='2.5'
        rowGap='0.5'
        pt={{ base: '3.5', lg: 'row.head' }}
        pb='3'
        px={{ base: '4', md: 'card' }}
      >
        <Text as='h2' textStyle='section-title'>
          {title}
        </Text>
        <Text textStyle='body-sm' color='fg.subtle'>
          {t('votes.empty.legend_hint', { defaultValue: 'Each vote shows here with its state.' })}
        </Text>
      </Flex>
      <Box as='ul' listStyleType='none' m='0' p='0'>
        {LEGEND_STATES.map((state) => (
          // Stacked on a phone; from md the list's grid: the state column, then what it means.
          <Grid
            as='li'
            key={state}
            templateColumns={{
              base: 'minmax(0, 1fr)',
              md: '[{sizes.list.label.tablet} minmax(0, 1fr)]',
              lg: '[{sizes.list.label} minmax(0, 1fr)]',
            }}
            columnGap={{ md: '3', lg: '4' }}
            rowGap='0.5'
            alignItems='baseline'
            pt={{ base: '3', lg: 'row' }}
            pb='3'
            px={{ base: '4', md: '5', lg: 'card' }}
            {...dashedRule}
          >
            <ProcessStatus state={state} />
            <Text textStyle={{ base: 'body', lg: 'control' }} color={{ base: 'fg.subtle', lg: 'fg.muted' }}>
              {legend[state]}
            </Text>
          </Grid>
        ))}
      </Box>
    </Card.Root>
  )
}

/** The list of an organisation with no votes: how to start (for whoever may create one), and what each state means. */
export const VotesEmpty = ({ canCreate = true }: { canCreate?: boolean }) => {
  const { t } = useTranslation()
  const title = t('votes.empty.title', { defaultValue: 'No votes yet' })

  return (
    <Stack gap={{ base: '5', md: '6', lg: '4' }}>
      <Card.Root variant='frame' as='section' aria-label={title}>
        <Stack
          gap={{ base: '5', lg: '4.5' }}
          pt={{ base: '6', md: '8', lg: '7' }}
          pb={{ base: '5', md: '7', lg: 'idle' }}
          px={{ base: '4', md: '7', lg: 'card' }}
        >
          <Stack gap='1.5' maxW={{ md: 'lead.tablet', lg: 'lead' }}>
            <Text as='h2' textStyle='feature-title'>
              {title}
            </Text>
            {/* The boards' lead: 15px on a phone, 14px from a tablet, as a dialog's body. */}
            <Text textStyle='dialog-body' color='fg.muted' textWrap='pretty'>
              {t('votes.empty.body', {
                defaultValue:
                  'Create the first one whenever you like. You choose what is voted, who votes and until when, and publish it when it is ready.',
              })}
            </Text>
          </Stack>
          {/* Full width on phones, where it is the one action of the screen. The phone and tablet boards lead with a
              plus, the desktop one ends with an arrow. */}
          {canCreate && (
            <Button asChild alignSelf={{ base: 'stretch', md: 'flex-start' }}>
              <RouterLink to={generatePath(Routes.processes.create)}>
                <Icon as={AddIcon} display={{ lg: 'none' }} />
                {t('votes.empty.create', { defaultValue: 'Create a vote' })}
                <Icon as={ForwardIcon} display={{ base: 'none', lg: 'inline-block' }} />
              </RouterLink>
            </Button>
          )}
        </Stack>
      </Card.Root>
      <StateLegend />
    </Stack>
  )
}
