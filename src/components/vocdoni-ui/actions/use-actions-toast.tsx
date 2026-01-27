import { useToast } from '@chakra-ui/react'
import { useActions } from '@vocdoni/react-providers'
import { useEffect, useRef } from 'react'

export const useActionsToast = () => {
  const toastRef = useRef<string | number | undefined>()
  const { info, error } = useActions()
  const toast = useToast()

  useEffect(() => {
    if (toast && info === null && toastRef.current) {
      toast.close(toastRef.current)
    }
    if (info && toast) {
      toastRef.current = toast({
        title: info.title,
        description: info.description,
        status: 'info',
        duration: null,
        isClosable: false,
      })
    }
    if (error && toast) {
      toast({
        title: error.title,
        description: error.description,
        status: 'error',
        duration: 7000,
        isClosable: false,
      })
    }
  }, [info, error, toast])
}
