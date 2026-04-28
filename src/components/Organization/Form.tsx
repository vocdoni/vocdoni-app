import { Box, FieldRoot as FormControl, FieldLabel as FormLabel, Text, VStack } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Editor from '~components/Editor'
import { CountrySelector } from '~components/Form/CountrySelector'
import InputBasic from '~components/Form/InputBasic'
import { MembershipSizeSelector, OrganizationTypeSelector } from '~components/Layout/SaasSelector'

export const PublicOrgForm = ({ minified }: { minified?: boolean }) => {
  const { t } = useTranslation()
  const { control } = useFormContext()

  return (
    <VStack gap={4} flex={1}>
      <InputBasic
        formValue='name'
        label={t('form.account_create.title', { defaultValue: 'Organization name' })}
        placeholder={t('form.account_create.title_placeholder', {
          defaultValue: "Enter your organization's email",
        })}
        required
      />
      {!minified && (
        <>
          <FormControl>
            <FormLabel>{t('description', { defaultValue: 'Description' })}</FormLabel>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <Editor
                  onChange={field.onChange}
                  value={field.value}
                  variant='outline'
                  padding={4}
                  placeholder={t('form.account_create.description_placeholder')}
                />
              )}
            />
          </FormControl>
          <InputBasic
            formValue='website'
            label={t('website', { defaultValue: 'Website' })}
            placeholder={t('form.account_create.website_placeholder', {
              defaultValue: 'https://example.com',
            })}
          />
        </>
      )}
    </VStack>
  )
}

export type PrivateOrgFormData = {
  size: string
  type: string
  country: string
}

export const PrivateOrgForm = ({ minified }: { minified?: boolean }) => {
  const { t } = useTranslation()

  return (
    <>
      {!minified && (
        <Box>
          <Text fontWeight='bold' mb={2.5}>
            {t('create_org.private_org', { defaultValue: 'Other details' })}
          </Text>
          <Text fontSize='sm'>
            {t('create_org.private_org_description', {
              defaultValue: 'This information is private and used for internal configuration.',
            })}
          </Text>
        </Box>
      )}
      <MembershipSizeSelector name='size' required />
      <OrganizationTypeSelector name='type' required />
      <CountrySelector name='country' />
    </>
  )
}
