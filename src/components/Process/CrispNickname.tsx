import { useElectionAuth } from '@vocdoni/react-components'
import { useEffect, useRef } from 'react'
import { useAppEnv } from '~src/app-env'

// The identity the identify form last submitted, kept until the voter's flow starts. It is set on submit and taken
// once the flow starts, so a failed submit only leaves a value that the next submit overwrites.
let pendingIdentity: string | undefined

// `identity` is "<field> <value>" for the first typed field that is neither the password nor the contact.
export const stashCrispIdentity = (identity: string | undefined) => {
  pendingIdentity = identity
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

// Sets the Crisp nickname when the voter's flow starts (challenge sent, or connected for an auth-only census).
// Mount it under CspAuthSession on a page that stays mounted while the voter identifies: a slot unmounts in the render
// that connects the voter, which is the edge this watches.
export const CrispNicknameObserver = () => {
  const { challengePending, connected } = useElectionAuth()
  const { CRISP_WEBSITE_ID } = useAppEnv()
  const active = challengePending || connected
  const wasActive = useRef(active)

  useEffect(() => {
    const started = active && !wasActive.current
    wasActive.current = active
    if (!started) return

    const identity = takeCrispIdentity()
    if (identity && CRISP_WEBSITE_ID) pushCrispNickname(identity)
  }, [active, CRISP_WEBSITE_ID])

  return null
}
