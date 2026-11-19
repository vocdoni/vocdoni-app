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

// Sets the Crisp nickname on every successful identify (auth0), so a start-over with another identity updates it.
// Mount it inside the ElectionProvider, on a page that stays mounted while the voter identifies: a slot unmounts in
// the render that connects the voter, so the observer must sit outside the slots.
export const CrispNicknameObserver = () => {
  // `owner` is set by every successful auth0 and cleared by clear(), but the published type omits it.
  const { owner } = useElectionAuth() as ReturnType<typeof useElectionAuth> & { owner?: string | null }
  const { CRISP_WEBSITE_ID } = useAppEnv()
  const lastOwner = useRef(owner)

  useEffect(() => {
    const identified = owner !== lastOwner.current && !!owner
    lastOwner.current = owner
    if (!identified) return

    const identity = takeCrispIdentity()
    if (identity && CRISP_WEBSITE_ID) pushCrispNickname(identity)
  }, [owner, CRISP_WEBSITE_ID])

  return null
}
