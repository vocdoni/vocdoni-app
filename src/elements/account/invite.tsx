import { useSearchParams } from 'react-router'
import AcceptInvitation from '~components/Organization/AcceptInvitation'

const AcceptInvite = () => {
  const [searchParams] = useSearchParams()

  const code = searchParams.get('code')
  const address = searchParams.get('address')
  const email = searchParams.get('email')

  return <AcceptInvitation code={code} address={address} email={email} />
}

export default AcceptInvite
