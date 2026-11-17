import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionBar } from '~components/ui/ActionBar'
import { VoterCredit } from '~components/ui/VoterShell'

type VoterActionBarProps = { primary?: ReactNode; secondary?: ReactNode; note?: ReactNode }

/** The screen's buttons with the bar's accessible name and the credit it carries on a phone. */
export const VoterActionBar = (props: VoterActionBarProps) => {
  const { t } = useTranslation()
  return (
    <ActionBar
      label={t('voter.actions_label')}
      credit={<VoterCredit text={t('voter.credit.text')} brand={t('voter.credit.brand')} />}
      {...props}
    />
  )
}
