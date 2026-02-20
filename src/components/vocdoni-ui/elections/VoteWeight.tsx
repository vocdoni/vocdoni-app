import { chakra, useSlotRecipe } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { CensusType, formatUnits, PublishedElection } from '@vocdoni/sdk'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const resultsValue = (result: number, decimals?: number) =>
  decimals ? parseInt(formatUnits(BigInt(result), decimals), 10) : result

export const VoteWeight = () => {
  const {
    client,
    election,
    csp: { token },
  } = useElection()
  const { t } = useTranslation()
  const [weight, setWeight] = useState<number | null>(null)
  const recipe = useSlotRecipe({ key: 'VoteWeight' })
  const styles = recipe()

  useEffect(() => {
    ;(async () => {
      try {
        if (
          !client ||
          !election ||
          !client.wallet ||
          !(election instanceof PublishedElection) ||
          !election.census.censusId ||
          (election.census.type === CensusType.CSP && !token)
        ) {
          return
        }
        if (election.census.type !== CensusType.CSP) {
          const proof = await client.fetchProof(election.census.censusId, await client.wallet.getAddress())
          const decimals = election.meta?.token?.decimals || 0
          setWeight(resultsValue(Number(proof.weight), decimals))
        } else {
          const response = await fetch(`${election.census.censusURI}/weight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authToken: token }),
          })
          const data = await response.json()
          setWeight(resultsValue(Number.parseInt(data.weight, 16)))
        }
      } catch (error) {
        console.warn('Error fetching voter weight', error)
        setWeight(null)
      }
    })()
  }, [client, election, token])

  if (!weight || !election || !(election instanceof PublishedElection)) return null

  return (
    <chakra.div css={styles.wrapper}>
      {t('vote.weight')}
      <chakra.span css={styles.weight}>{weight}</chakra.span>
    </chakra.div>
  )
}
