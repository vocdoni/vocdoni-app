import { useElectionAuth } from '@vocdoni/react-components'
import { useEffect, useState } from 'react'
import { useAppEnv } from '~src/app-env'

// The identity the identify form last submitted, kept until the voter's flow starts. It is set on submit and taken
// once the flow starts, so a failed submit only leaves a value that the next submit overwrites.
let pendingIdentity: string | undefined
// Told about every submit: a start over can keep the same owner and pending challenge, so no auth state changes.
const stashListeners = new Set<() => void>()

// `identity` is "<field> <value>" for the first typed field that is neither the password nor the contact.
export const stashCrispIdentity = (identity: string | undefined) => {
  pendingIdentity = identity
  stashListeners.forEach((listener) => listener())
}

const takeCrispIdentity = () => {
  const identity = pendingIdentity
  pendingIdentity = undefined
  return identity
}

const pushCrispNickname = (identity: string) => {
  const crisp = window.$crisp
  if (!crisp || typeof crisp.push !== 'function') return

  try {
    crisp.push(['set', 'user:nickname', [identity]])
  } catch (error) {
    console.error('Crisp push failed:', error)
  }
}

// Sets the Crisp nickname once auth0 accepts a submitted identity (a pending code or a connected voter), so a start
// over with another contact updates it. The first push takes the identity, so the auth1 connect does not resend it.
// Mount it inside the ElectionProvider and outside the slots: a slot unmounts in the render that connects the voter.
export const CrispNicknameObserver = () => {
  const { challengePending, connected } = useElectionAuth()
  const { CRISP_WEBSITE_ID } = useAppEnv()
  const [submissions, setSubmissions] = useState(0)

  useEffect(() => {
    const onSubmit = () => setSubmissions((count) => count + 1)
    stashListeners.add(onSubmit)
    return () => {
      stashListeners.delete(onSubmit)
    }
  }, [])

  useEffect(() => {
    if (!challengePending && !connected) return

    const identity = takeCrispIdentity()
    if (identity && CRISP_WEBSITE_ID) pushCrispNickname(identity)
  }, [challengePending, connected, submissions, CRISP_WEBSITE_ID])

  return null
}
