import { Alert, Text, type TextProps } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { electionQueryKeys, useElection } from '@vocdoni/react-components'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { metadataVerificationQueryKey } from './MetadataVerification/useMetadataVerification'
import { isStaleBallotError } from './stale-ballot'

type BallotUpdateContextValue = {
  /** The last vote was rejected because the ballot changed after the voter loaded it. */
  updated: boolean
  /** Records a stale-ballot rejection and reloads the election. */
  report: () => void
  dismiss: () => void
}

const BallotUpdateContext = createContext<BallotUpdateContextValue | null>(null)

/** Null outside a {@link BallotUpdateProvider}, so shared slots keep their default behavior. */
export const useBallotUpdate = () => useContext(BallotUpdateContext)

/**
 * Tracks a vote rejected for a stale ballot on the voter page. On a report it reloads the
 * election (which also resets the ballot form to the new questions) and its content
 * verification, and keeps the notice up until the voter dismisses it or votes again.
 */
export const BallotUpdateProvider = ({ children }: PropsWithChildren) => {
  const { election, voting } = useElection()
  const queryClient = useQueryClient()
  const [updated, setUpdated] = useState(false)
  const electionId = election?.id

  const report = useCallback(() => {
    setUpdated(true)
    if (!electionId) return
    queryClient.invalidateQueries({ queryKey: electionQueryKeys.election(electionId) })
    queryClient.invalidateQueries({ queryKey: metadataVerificationQueryKey(electionId) })
  }, [electionId, queryClient])

  const dismiss = useCallback(() => setUpdated(false), [])

  useEffect(() => {
    if (voting) setUpdated(false)
  }, [voting])

  const value = useMemo(() => ({ updated, report, dismiss }), [updated, report, dismiss])

  return <BallotUpdateContext.Provider value={value}>{children}</BallotUpdateContext.Provider>
}

/** Notice above the ballot telling the voter it changed and must be reviewed again. */
export const BallotUpdatedNotice = () => {
  const { t } = useTranslation()
  const ballot = useBallotUpdate()

  if (!ballot?.updated) return null

  return (
    <Alert.Root status='warning' mt={6} role='alert'>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('process.ballot_updated.title', { defaultValue: 'The ballot has been updated' })}</Alert.Title>
        <Alert.Description>
          {t('process.ballot_updated.description', {
            defaultValue:
              'The organizer changed the content of this vote after you opened it. Review the updated questions and vote again.',
          })}
        </Alert.Description>
      </Alert.Content>
    </Alert.Root>
  )
}

/**
 * Vote failure text under the ballot form. A stale-ballot rejection is handed to the
 * {@link BallotUpdateProvider} instead, which explains it in plain words and reloads the
 * ballot; outside a provider the raw failure is shown as before.
 */
export const VoteErrorText = ({ error, ...props }: { error: string } & TextProps) => {
  const ballot = useBallotUpdate()
  const stale = isStaleBallotError(error)
  const report = ballot?.report

  // Layout effect: the failure dialog must switch to the stale-ballot wording before the
  // first paint, instead of flashing the generic failure.
  useLayoutEffect(() => {
    if (stale) report?.()
  }, [stale, error, report])

  if (stale && ballot) return null

  return (
    <Text color='red.500' {...props}>
      {error}
    </Text>
  )
}
