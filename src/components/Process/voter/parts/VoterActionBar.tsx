import { Link } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ActionBar } from '~components/ui/ActionBar'
import { VoterCredit } from '~components/ui/VoterShell'
import { useAppEnv } from '~src/app-env'

/**
 * The terms and privacy links today's footer carries (owner ruling R18), in the credit line: at the page's foot from
 * `md` (VoterView) and inside the phone's action bar below it. They open in a new tab, so reading them never ends the
 * voter's session.
 */
export const VoterLegalLinks = () => {
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = useAppEnv()
  return (
    <Trans
      i18nKey='footer.terms_and_privacy'
      components={{
        link1: <Link href={TERMS_OF_SERVICE_URL} target='_blank' rel='noopener noreferrer' tone='muted' />,
        link2: <Link href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer' tone='muted' />,
      }}
    />
  )
}

type VoterActionBarProps = { primary?: ReactNode; secondary?: ReactNode; note?: ReactNode }

/** The screen's buttons with the bar's accessible name and the credit it carries on a phone, links included. */
export const VoterActionBar = (props: VoterActionBarProps) => {
  const { t } = useTranslation()
  return (
    <ActionBar
      label={t('voter.actions_label')}
      credit={
        <VoterCredit text={t('voter.credit.text')} brand={t('voter.credit.brand')} links={<VoterLegalLinks />} />
      }
      {...props}
    />
  )
}
