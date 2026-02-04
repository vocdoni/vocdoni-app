import { useClient } from '@vocdoni/react-providers'
import { AccountData, ArchivedAccountData } from '@vocdoni/sdk'

const isNotArchived = (account: AccountData | ArchivedAccountData): account is AccountData => {
  return (account as AccountData).nonce !== undefined
}

export const useAccountHealthTools = () => {
  const { account } = useClient()

  const exists = typeof account !== 'undefined' && isNotArchived(account)

  return {
    exists,
  }
}
