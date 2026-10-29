import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { CensusCheckout, readStoredPending } from '~components/Pricing/CensusCheckout'

// A whole number from a search param, or undefined when it is missing or not one
const wholeNumber = (value: string | null) => (value !== null && /^\d+$/.test(value) ? Number(value) : undefined)

const CensusCheckoutPage = () => {
  const { id = '', sessionId } = useParams()
  const [searchParams] = useSearchParams()
  // The return URL carries only the session id, so the room the payment was made for comes from storage.
  // Read once on mount: the URL is replaced after the return, and the room must stay the same.
  const [stored] = useState(() => (sessionId === undefined ? null : readStoredPending(id)))
  const room = stored ?? {
    censusSize: wholeNumber(searchParams.get('size')),
    dueCents: wholeNumber(searchParams.get('due')),
    shortfallCents: wholeNumber(searchParams.get('shortfall')),
  }

  return (
    <CensusCheckout
      processId={id}
      censusSize={room.censusSize}
      dueCents={room.dueCents}
      shortfallCents={room.shortfallCents}
      returned={sessionId !== undefined}
      knownIds={stored?.knownIds}
    />
  )
}

export default CensusCheckoutPage
