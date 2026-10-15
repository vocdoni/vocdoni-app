export type TwoFAMethod = 'email' | 'sms' | 'voter_choice'

export type VoterAuthFormData = {
  credentials: string[]
  use2FA: boolean
  use2FAMethod: TwoFAMethod
}

export type StepCompletionState = {
  step1Completed: boolean
  step2Completed: boolean
}

export const getTwoFaFields = (method: TwoFAMethod): string[] => {
  switch (method) {
    case 'email':
      return ['email']
    case 'sms':
      return ['phone']
    case 'voter_choice':
      return ['email', 'phone']
  }
}

// The member password never identifies a voter on its own: the backend finds the participant on
// the other credentials, then checks the password. So it does not count toward the credentials
// limit, and it needs another credential or 2FA next to it.
export const PASSWORD_CREDENTIAL = 'password'

export const countedCredentials = (credentials: string[] = []): number =>
  credentials.filter((credential) => credential !== PASSWORD_CREDENTIAL).length

export const passwordNeedsAnotherCredential = (credentials: string[] = [], use2FA: boolean): boolean =>
  credentials.includes(PASSWORD_CREDENTIAL) && countedCredentials(credentials) === 0 && !use2FA
