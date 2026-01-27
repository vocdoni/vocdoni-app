import { Box, Button, Flex, HStack, Icon, Input, Text } from '@chakra-ui/react'
import { useCheckout } from '@stripe/react-stripe-js/checkout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuCheck, LuX } from 'react-icons/lu'

type FormValues = {
  promoCode: string
}

export const PromotionCodeInput = () => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = async (data: FormValues) => {
    if (checkoutState.type !== 'success') return

    setIsApplying(true)
    setError(null)

    try {
      const result = await checkoutState.checkout.applyPromotionCode(data.promoCode)
      if (result.type === 'error') {
        setError(result.error.message || t('invalid_promo_code', { defaultValue: 'Invalid promotion code' }))
      } else {
        setAppliedCode(data.promoCode)
        reset()
      }
    } catch (err: any) {
      setError(err?.message || t('invalid_promo_code', { defaultValue: 'Invalid promotion code' }))
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = async () => {
    if (checkoutState.type !== 'success') return

    setIsApplying(true)
    setError(null)

    try {
      const result = await checkoutState.checkout.removePromotionCode()
      if (result.type === 'error') {
        setError(result.error.message || t('error_removing_code', { defaultValue: 'Error removing code' }))
      } else {
        setAppliedCode(null)
      }
    } catch (err: any) {
      setError(err?.message || t('error_removing_code', { defaultValue: 'Error removing code' }))
    } finally {
      setIsApplying(false)
    }
  }

  if (checkoutState.type === 'loading' || checkoutState.type === 'error') {
    return null
  }

  return !appliedCode ? (
    <Box>
      <Text fontSize='sm' fontWeight='medium' mb={2}>
        <Trans i18nKey='promo_code'>Promotion Code</Trans>
      </Text>
      <Flex gap={2}>
        <Input
          {...register('promoCode', {
            required: t('promo_code_required', { defaultValue: 'Promotion code is required' }),
          })}
          placeholder={t('enter_promo_code', { defaultValue: 'Enter code' })}
          disabled={isApplying}
        />
        <Button onClick={handleSubmit(onSubmit)} size='sm' loading={isApplying}>
          <Trans i18nKey='apply'>Apply</Trans>
        </Button>
      </Flex>
      {(errors.promoCode || error) && (
        <Text color='red.500' fontSize='sm' mt={1}>
          {errors.promoCode?.message || error}
        </Text>
      )}
    </Box>
  ) : (
    <Box p={3} borderRadius='md' borderWidth={1}>
      <Flex justify='space-between' align='center'>
        <Flex align='center' gap={2}>
          <LuCheck color='green' />
          <Text fontSize='sm' fontWeight='medium'>
            <Trans i18nKey='code_applied'>Code "{{ appliedCode }}" applied</Trans>
          </Text>
        </Flex>
        <Button size='xs' variant='ghost' onClick={handleRemove} loading={isApplying}>
          <HStack gap={2}>
            <Icon as={LuX} />
            <Trans i18nKey='remove'>Remove</Trans>
          </HStack>
        </Button>
      </Flex>
    </Box>
  )
}
