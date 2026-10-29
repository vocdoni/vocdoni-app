import { useParams, useSearchParams } from 'react-router'
import { CensusCheckout } from '~components/Pricing/CensusCheckout'

// A whole number from a search param, or undefined when it is missing or not one
const wholeNumber = (value: string | null) => (value !== null && /^\d+$/.test(value) ? Number(value) : undefined)

const CensusCheckoutPage = () => {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()

  return (
    <CensusCheckout
      processId={id}
      censusSize={wholeNumber(searchParams.get('size'))}
      dueCents={wholeNumber(searchParams.get('due'))}
      shortfallCents={wholeNumber(searchParams.get('shortfall'))}
    />
  )
}

export default CensusCheckoutPage
