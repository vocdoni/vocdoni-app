import { useDisclosure } from '@chakra-ui/react'
import { createContext, ReactNode, useContext } from 'react'

type VoterAuthDialog = ReturnType<typeof useDisclosure>

const VoterAuthDialogContext = createContext<VoterAuthDialog | null>(null)

// Lifts the voter authentication dialog's open state above the sidebar, so the
// create view can open it from outside (the "Set it up" action on the toast a
// blocked publish raises).
export const VoterAuthDialogProvider = ({ children }: { children: ReactNode }) => {
  const dialog = useDisclosure()

  return <VoterAuthDialogContext.Provider value={dialog}>{children}</VoterAuthDialogContext.Provider>
}

// Falls back to a local disclosure outside the provider, so the dialog still
// works on its own. Both hooks always run to keep the hook order stable.
export const useVoterAuthDialog = (): VoterAuthDialog => {
  const local = useDisclosure()
  return useContext(VoterAuthDialogContext) ?? local
}
