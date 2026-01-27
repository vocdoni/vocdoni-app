import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useMultiStyleConfig,
  useToast,
} from '@chakra-ui/react'
import { Wallet } from '@ethersproject/wallet'
import { useClient, useElection, walletFromRow, errorToString } from '@vocdoni/react-providers'
import { PublishedElection, VocdoniSDKClient } from '@vocdoni/sdk'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export type SpreadsheetAccessProps = {
  hashPrivateKey?: boolean
}

export const SpreadsheetAccess = ({ hashPrivateKey, ...rest }: SpreadsheetAccessProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const styles = useMultiStyleConfig('SpreadsheetAccess', rest)
  const { connected, clearClient } = useElection()
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { env } = useClient()
  const {
    election,
    client: currentClient,
    setClient,
    localize,
    sikPassword,
    sikSignature,
    loading: { voting },
  } = useElection()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const shouldRender = election instanceof PublishedElection && election?.get('census.type') === 'spreadsheet'
  const privkey = window.location.hash ? window.location.hash.split('#')[1] : ''

  useEffect(() => {
    ;(async () => {
      try {
        if (!shouldRender || !privkey || !election) return
        const privKeyWallet = new Wallet(privkey)
        const client = new VocdoniSDKClient({
          env,
          wallet: privKeyWallet,
          electionId: election.id,
        })
        setClient(client)
      } catch (error) {
        console.warn('Error trying to login with private key ', error)
        setClient(currentClient)
      }
    })()
  }, [election, env, shouldRender, privkey, setClient, currentClient])

  if (!shouldRender) return null

  const onSubmit = async (vals: Record<string, any>) => {
    try {
      setLoading(true)
      let sikp: string | null = null
      if (election?.electionType.anonymous) {
        sikp = vals.sik_password
        delete vals.sik_password
      }
      const hid = await currentClient.electionService.getNumericElectionId(election.id)
      const salt =
        election.get('census.salt') ||
        (await currentClient.electionService.getElectionSalt(election.organizationId, hid))
      const wallet = walletFromRow(salt, Object.values(vals))
      const client = new VocdoniSDKClient({
        env,
        wallet,
        electionId: election.id,
      })
      if (!(await client.isInCensus())) {
        return toast({
          status: 'error',
          title: localize('errors.wrong_data_title'),
          description: localize('errors.wrong_data_description'),
        })
      }
      if (election?.electionType.anonymous && sikp) {
        const signature = await client.anonymousService.signSIKPayload(wallet)
        const sik = await client.anonymousService.fetchAccountSIK(wallet.address).catch(() => false)
        const valid = await client.anonymousService.hasRegisteredSIK(wallet.address, signature, sikp)
        if (sik && !valid) {
          return toast({
            status: 'error',
            title: localize('errors.wrong_data_title'),
            description: localize('errors.wrong_data_description'),
          })
        }
        sikPassword(sikp)
        sikSignature(signature)
      }
      setClient(client)
      if (hashPrivateKey) {
        document.location.hash = wallet.privateKey
      }
      reset()
      onClose()
    } catch (error) {
      toast({
        status: 'error',
        description: errorToString(error),
      })
    } finally {
      setLoading(false)
    }
  }

  const fields = election.get('census.fields') as string[]
  const required = {
    value: true,
    message: localize('validation.required'),
  }
  const minLength = {
    value: 8,
    message: localize('validation.min_length', { min: 8 }),
  }
  const specs = election?.get('census.specs') as Record<string, any> | undefined
  const fspecs = (field: string) => {
    if (!specs || typeof specs[field] === 'undefined') return
    const spec = specs[field]
    const props: Record<string, any> = {}
    if (spec.pattern) {
      props.pattern = {
        value: new RegExp(spec.pattern.value),
        message: spec.pattern.message,
      }
    }
    if (spec.props) {
      if (spec.props.max) props.max = spec.props.max
      if (spec.props.min) props.min = spec.props.min
    }
    return props
  }
  const ispecs = (field: string) => {
    if (!specs || typeof specs[field] === 'undefined') return
    const spec = specs[field]
    const props = spec.props || {}
    if (spec.type) props.type = spec.type
    return props
  }
  const description = (field: string) => {
    if (!specs || typeof specs[field] === 'undefined') return
    return specs[field].description
  }

  const logout = () => {
    window.history.pushState({}, '', document.location.pathname)
    clearClient()
  }

  if (connected) {
    return (
      <Button onClick={logout} sx={styles.disconnect} isDisabled={voting}>
        {localize('spreadsheet.logout')}
      </Button>
    )
  }

  return (
    <>
      <Button onClick={onOpen} sx={styles.button}>
        {localize('spreadsheet.access_button')}
      </Button>
      <Modal isOpen={isOpen} onClose={() => !loading && onClose()}>
        <ModalOverlay sx={styles.overlay} />
        <ModalContent sx={styles.content}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalHeader sx={styles.header}>{localize('spreadsheet.modal_title')}</ModalHeader>
            <ModalCloseButton isDisabled={loading} sx={styles.top_close} />
            <ModalBody sx={styles.body}>
              {fields.map((field, key) => (
                <FormControl isInvalid={Boolean((errors as Record<string, any>)[key])} sx={styles.control} key={field}>
                  <FormLabel sx={styles.label}>{field}</FormLabel>
                  <Input
                    {...register(key.toString(), {
                      required,
                      ...fspecs(field),
                    })}
                    sx={styles.input}
                    {...ispecs(field)}
                  />
                  {(errors as Record<string, any>)[key]?.message ? (
                    <FormErrorMessage sx={styles.error}>
                      {(errors as Record<string, any>)[key]?.message?.toString()}
                    </FormErrorMessage>
                  ) : (
                    description(field) && <FormHelperText>{description(field)}</FormHelperText>
                  )}
                </FormControl>
              ))}
              {election?.electionType.anonymous && (
                <FormControl isInvalid={Boolean((errors as Record<string, any>).sik_password)} sx={styles.sik_control}>
                  <FormLabel sx={styles.label}>{localize('spreadsheet.anon_sik_label')}</FormLabel>
                  <Input
                    {...register('sik_password', { required, minLength })}
                    type='password'
                    sx={styles.input}
                  />
                  {(errors as Record<string, any>).sik_password ? (
                    <FormErrorMessage sx={styles.error}>
                      {(errors as Record<string, any>).sik_password?.message?.toString()}
                    </FormErrorMessage>
                  ) : (
                    <FormHelperText sx={styles.helper}>{localize('spreadsheet.anon_sik_helper')}</FormHelperText>
                  )}
                </FormControl>
              )}
            </ModalBody>
            <ModalFooter sx={styles.footer}>
              <Button variant='ghost' mr={3} onClick={onClose} sx={styles.close} isDisabled={loading}>
                {localize('spreadsheet.close')}
              </Button>
              <Button shouldWrapChildren type='submit' sx={styles.submit} isLoading={loading}>
                {localize('spreadsheet.access_button')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}
