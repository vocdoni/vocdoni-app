import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react'
import { enforceHexPrefix, errorToString, useClient } from '@vocdoni/react-providers'
import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuCheck, LuPlus, LuTrash2, LuWallet } from 'react-icons/lu'
import { useSubscription } from '~components/Auth/Subscription'
import { DashboardSection, SidebarSubtitle } from '~components/shared/Dashboard/Contents'
import { fieldMapErrorMessage } from '~constants'
import Uploader from '~shared/Layout/Uploader'
import { CensusTypes } from './CensusType'
import { Web3CensusSpreadsheetManager } from './Spreadsheet/Web3CensusSpreadsheetManager'
import { enforceCsvRowLimit } from '~components/shared/Spreadsheet/limits'

export interface Web3Address {
  address: string
  weight: number
}

const isValidAddress = (value: string) => /^(0x)?[0-9a-f]{40}$/i.test(value)

export const CensusWeb3Addresses = () => {
  const { t } = useTranslation()
  const { account } = useClient()
  const [fileErr, setFileErr] = useState<string | null>(null)

  const {
    register,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useFormContext()

  const { fields, remove, append } = useFieldArray({
    name: 'addresses',
  })

  const addresses = watch('addresses')
  const weighted: boolean = watch('weightedVote')
  const censusType = watch('censusType')
  const { subscription } = useSubscription()
  const maxCensusSize = subscription?.subscriptionDetails?.maxCensusSize || subscription?.plan?.organization?.maxCensus

  useEffect(() => {
    if (account?.address && addresses.length === 0) {
      setValue('addresses', [{ address: enforceHexPrefix(account.address), weight: 1 }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.address, addresses, censusType])

  // File dropzone
  const onDrop = async ([file]: File[]) => {
    try {
      setFileErr(null)

      const spreadsheet = new Web3CensusSpreadsheetManager(file, weighted)
      await spreadsheet.read()
      enforceCsvRowLimit({
        rowCount: spreadsheet.data.length,
        max: maxCensusSize,
        errorMessage: t('uploader.csv_row_limit_exceeded', {
          count: spreadsheet.data.length,
          max: maxCensusSize ?? 0,
        }),
      })

      spreadsheet.data.forEach((row, idx) => {
        const [raw] = row
        if (!raw) return
        const addr = enforceHexPrefix(raw)

        append(
          {
            address: addr,
            weight: weighted ? Number(spreadsheet.weights[idx] ?? 1) : 1,
          },
          { shouldFocus: false }
        )
      })
    } catch (e) {
      setFileErr(errorToString(e))
      console.error('could not load file:', e)
    }
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: Web3CensusSpreadsheetManager.AcceptedTypes.reduce((prev, curr) => ({ ...prev, [curr]: [] }), {}),
  })

  return (
    <Flex gap={2} direction='column'>
      <Text color='texts.subtle' fontSize='xs'>
        {t('form.process_create.web3.census_description', {
          defaultValue:
            'Add wallet addresses that will be eligible to vote. You can add them individually or upload a CSV file.',
        })}
      </Text>
      <SidebarSubtitle>
        {t('form.process_create.web3.wallet_addresses', { defaultValue: 'Wallet Addresses' })}
      </SidebarSubtitle>
      <DashboardSection p={4} mb={4}>
        <Flex gap={2} alignItems='center'>
          <Icon as={LuWallet} />
          <Text fontWeight='extrabold' fontSize='sm'>
            {t('form.process_create.web3.census_summary_title', { defaultValue: 'Census Summary' })}
          </Text>
        </Flex>
        <Text color='texts.subtle' fontSize='xs'>
          <Trans
            i18nKey='form.process_create.web3.census_summary_description'
            components={{ b: <Text as='span' fontWeight='extrabold' display='inline' fontSize='xs' /> }}
            defaults='<b>{{count}}</b> wallet address will be eligible to vote'
            count={fields.length}
          />
        </Text>
      </DashboardSection>
      <Flex gap={2} direction='column'>
        {fields.map((field, index) => {
          const addrName = `addresses.${index}.address` as const
          const weightName = `addresses.${index}.weight` as const
          const addressValue = watch(addrName)

          return (
            <Flex gap={2} key={field.id}>
              <FormControl isInvalid={!!errors.addresses?.[index]?.address}>
                <InputGroup>
                  <Input
                    {...register(`addresses.${index}.address`, {
                      required: { value: censusType === CensusTypes.Web3, message: t('form.error.field_is_required') },
                      validate: {
                        pattern: (value) => /^(0x)?[0-9a-f]{40}$/i.test(value) || t('form.error.address_pattern'),
                        duplicate: (value) => {
                          const normalized = value.toLowerCase()
                          const others = addresses
                            .map((address, i) => i !== index && address.address?.toLowerCase())
                            .filter(Boolean)
                          return !others.includes(normalized) || t('form.error.address_already_in_use')
                        },
                      },
                    })}
                    placeholder='0x000...000'
                  />
                  {isValidAddress(addressValue) && (
                    <InputRightElement pointerEvents='none'>
                      <Icon as={LuCheck} color='green.400' />
                    </InputRightElement>
                  )}
                </InputGroup>
                <FormErrorMessage>{fieldMapErrorMessage(errors, `addresses.${index}.address`)}</FormErrorMessage>
              </FormControl>

              {weighted && (
                <Controller
                  name={weightName}
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value ?? 1}
                      onChange={(_, num) => field.onChange(Number.isNaN(num) ? '' : num)}
                      min={1}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  )}
                />
              )}

              <IconButton
                variant='outline'
                icon={<Icon as={LuTrash2} />}
                aria-label={t('form.process_create.census.remove_address', { defaultValue: 'Remove address' })}
                onClick={() => remove(index)}
                disabled={fields.length <= 1}
              />
            </Flex>
          )
        })}
      </Flex>
      <Button
        variant='outline'
        leftIcon={<Icon as={LuPlus} />}
        type='button'
        ml='none'
        onClick={() => {
          append({ address: '', weight: 1 })
        }}
      >
        {t('form.process_create.census.add_button')}
      </Button>
      <Box position='relative' py={4}>
        <Divider />
        <AbsoluteCenter bg='chakra.body.bg' px={2} color='texts.subtle' fontSize='xs'>
          {t('form.process_create.web3.upload_csv', {
            defaultValue: 'OR UPLOAD CSV',
          })}
        </AbsoluteCenter>
      </Box>
      <FormControl isInvalid={!!fileErr}>
        <Uploader getInputProps={getInputProps} getRootProps={getRootProps} isDragActive={isDragActive} />
        <FormErrorMessage>{fileErr}</FormErrorMessage>
      </FormControl>
      <Text color='texts.subtle' fontSize='xs'>
        {weighted
          ? t('form.process_create.web3.csv_format_weighted', {
              defaultValue:
                'CSV file should contain weights in the first column and wallet addresses in the second column.',
            })
          : t('form.process_create.web3.csv_format', {
              defaultValue: 'CSV file should contain wallet addresses in the first column.',
            })}
      </Text>
    </Flex>
  )
}
