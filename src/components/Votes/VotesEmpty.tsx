import { Button, Card, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { ProcessStatus, type ProcessStatusState } from '~components/ui/ProcessStatus'
import { SectionHeader } from '~components/ui/SectionHeader'
import { Routes } from '~routes'

const LEGEND_STATES: ProcessStatusState[] = ['draft', 'ready', 'live', 'closed']

/** The list of an organisation with no votes: how to start, and what each state will mean. */
export const VotesEmpty = () => {
  const { t } = useTranslation()
  const legend: Record<string, string> = {
    draft: t('votes.empty.legend.draft', {
      defaultValue: 'You prepare it at your own pace. Nobody sees it and it costs nothing.',
    }),
    ready: t('votes.empty.legend.ready', { defaultValue: 'It is published and waits for the day you chose.' }),
    live: t('votes.empty.legend.live', { defaultValue: 'People vote and you follow the turnout.' }),
    closed: t('votes.empty.legend.closed', {
      defaultValue: 'You have the result, and can duplicate it for the next one.',
    }),
  }

  return (
    <Stack gap='8' maxW='content.narrow'>
      <Stack gap='3'>
        <Text as='h2' textStyle='feature-title'>
          {t('votes.empty.title', { defaultValue: 'No votes yet' })}
        </Text>
        <Text color='fg.muted'>
          {t('votes.empty.body', {
            defaultValue:
              'Create the first one whenever you like. You choose what is voted, who votes and until when, and publish it when it is ready.',
          })}
        </Text>
        {/* Full width on phones, where it is the one action of the screen. */}
        <Button asChild alignSelf={{ base: 'stretch', md: 'flex-start' }}>
          <RouterLink to={generatePath(Routes.processes.create)}>
            {t('votes.empty.create', { defaultValue: 'Create a vote' })}
          </RouterLink>
        </Button>
      </Stack>
      <Card.Root variant='note'>
        <Stack gap='5'>
          <SectionHeader
            title={t('votes.empty.legend_title', { defaultValue: 'What you will see here' })}
            description={t('votes.empty.legend_hint', { defaultValue: 'Each vote shows here with its state.' })}
          />
          <Stack as='ul' gap='3' listStyleType='none' m='0' p='0'>
            {LEGEND_STATES.map((state) => (
              <Stack
                as='li'
                key={state}
                direction={{ base: 'column', md: 'row' }}
                gap={{ base: '1', md: '4' }}
                align={{ md: 'center' }}
              >
                <ProcessStatus state={state} w={{ md: 'list.label' }} flexShrink={0} />
                <Text textStyle='body-sm' color='fg.muted'>
                  {legend[state]}
                </Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card.Root>
    </Stack>
  )
}
