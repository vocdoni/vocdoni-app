import {
  Button,
  CloseButton,
  Dialog,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldHelperText as FormHelperText,
  FieldLabel as FormLabel,
  Input,
  useSlotRecipe,
} from '@chakra-ui/react'
import { Wallet } from '@ethersproject/wallet'
import { useClient, useElection, walletFromRow, errorToString } from '@vocdoni/react-providers'
import { PublishedElection, VocdoniSDKClient } from '@vocdoni/sdk'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '~shared/Toast'

export type SpreadsheetAccessProps = {
  hashPrivateKey?: boolean
}

export const SpreadsheetAccess = ({ hashPrivateKey, ...rest }: SpreadsheetAccessProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const recipe = useSlotRecipe({ key: 'SpreadsheetAccess' })
  const styles = recipe(rest)
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
          type: 'error',
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
            type: 'error',
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
      setIsOpen(false)
    } catch (error) {
      toast({
        type: 'error',
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
      <Button onClick={logout} css={styles.disconnect} disabled={voting}>
        {localize('spreadsheet.logout')}
      </Button>
    )
  }

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={({ open }) => {
          if (loading && !open) return
          setIsOpen(open)
        }}
      >
        <Dialog.Trigger asChild>
          <Button css={styles.button}>{localize('spreadsheet.access_button')}</Button>
        </Dialog.Trigger>
        <Dialog.Backdrop css={styles.overlay} />
        <Dialog.Positioner>
          <Dialog.Content css={styles.content}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Dialog.Header css={styles.header}>{localize('spreadsheet.modal_title')}</Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton disabled={loading} css={styles.top_close} />
              </Dialog.CloseTrigger>
              <Dialog.Body css={styles.body}>
                {fields.map((field, key) => (
                  <FormControl invalid={Boolean((errors as Record<string, any>)[key])} css={styles.control} key={field}>
                    <FormLabel css={styles.label}>{field}</FormLabel>
                    <Input
                      {...register(key.toString(), {
                        required,
                        ...fspecs(field),
                      })}
                      css={styles.input}
                      {...ispecs(field)}
                    />
                    {(errors as Record<string, any>)[key]?.message ? (
                      <FormErrorMessage css={styles.error}>
                        {(errors as Record<string, any>)[key]?.message?.toString()}
                      </FormErrorMessage>
                    ) : (
                      description(field) && <FormHelperText>{description(field)}</FormHelperText>
                    )}
                  </FormControl>
                ))}
                {election?.electionType.anonymous && (
                  <FormControl invalid={Boolean((errors as Record<string, any>).sik_password)} css={styles.sik_control}>
                    <FormLabel css={styles.label}>{localize('spreadsheet.anon_sik_label')}</FormLabel>
                    <Input {...register('sik_password', { required, minLength })} type='password' css={styles.input} />
                    {(errors as Record<string, any>).sik_password ? (
                      <FormErrorMessage css={styles.error}>
                        {(errors as Record<string, any>).sik_password?.message?.toString()}
                      </FormErrorMessage>
                    ) : (
                      <FormHelperText css={styles.helper}>{localize('spreadsheet.anon_sik_helper')}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </Dialog.Body>
              <Dialog.Footer css={styles.footer}>
                <Button variant='ghost' mr={3} onClick={() => setIsOpen(false)} css={styles.close} disabled={loading}>
                  {localize('spreadsheet.close')}
                </Button>
                <Button type='submit' css={styles.submit} loading={loading}>
                  {localize('spreadsheet.access_button')}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}
