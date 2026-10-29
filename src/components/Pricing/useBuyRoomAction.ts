import { useTranslation } from 'react-i18next'
import { generatePath, useNavigate } from 'react-router'
import { Routes } from '~src/router/routes'
import { useWalletAccess } from '~queries/wallet'
import { censusGrowthCheckoutTarget, type CensusGrowthCheckoutTarget } from './payment-errors'

// The census checkout page for a refusal, with the room and its price in the search params
export const censusCheckoutPath = ({ processId, censusSize, dueCents, shortfallCents }: CensusGrowthCheckoutTarget) => {
  const params = new URLSearchParams({ size: String(censusSize), due: String(dueCents) })
  if (shortfallCents !== undefined) params.set('shortfall', String(shortfallCents))
  return `${generatePath(Routes.dashboard.census.checkout, { id: processId })}?${params}`
}

/**
 * A toast action that opens the census checkout for a census-growth refusal (40178), for admins only
 * (the checkout refuses anyone else). Undefined when the refusal has no room to buy.
 */
export const useBuyRoomAction = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { canTopUp } = useWalletAccess()

  return (error: unknown): { label: string; onClick: () => void } | undefined => {
    const target = censusGrowthCheckoutTarget(error)
    if (!target || !canTopUp) return undefined
    return {
      label: t('census.checkout.buy', { defaultValue: 'Add voter places' }),
      onClick: () => navigate(censusCheckoutPath(target)),
    }
  }
}
