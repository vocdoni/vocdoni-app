import {
  Badge,
  Box,
  Button,
  chakra,
  Flex,
  Grid,
  Icon,
  NativeSelect,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowRight, LuTriangleAlert } from 'react-icons/lu'
import type { Table } from '~components/Spreadsheet/readTable'
import { Banner } from '~components/ui/Banner'
import { useMemberFields } from '../fields'
import { type ColumnTarget, isSensitiveHeader } from './autoMatch'
import { MAX_EXTRA_COLUMNS } from './payload'

/** What's missing for an import to work: someone's name, and a way to send them a code. */
export const missingRequirements = (targets: ColumnTarget[]) => ({
  name: !targets.includes('name') && !targets.includes('surname'),
  contact: !targets.includes('email') && !targets.includes('phone'),
})

/** Sets a column's target; a field another column had goes to this one, and that column is left out. */
export const retarget = (targets: ColumnTarget[], column: number, target: ColumnTarget): ColumnTarget[] =>
  targets.map((current, index) => {
    if (index === column) return target
    if (target !== 'skip' && target !== 'extra' && current === target) return 'skip'
    return current
  })

type MatchStepProps = {
  table: Table
  targets: ColumnTarget[]
  /** How many columns we matched by ourselves */
  autoMatched: number
  onChange: (targets: ColumnTarget[]) => void
  onBack: () => void
  onContinue: () => void
}

export const MatchStep = ({ table, targets, autoMatched, onChange, onBack, onContinue }: MatchStepProps) => {
  const { t } = useTranslation()
  const fields = useMemberFields()
  const [tried, setTried] = useState(false)
  const missing = missingRequirements(targets)
  const blocked = missing.name || missing.contact
  const extras = targets.filter((target) => target === 'extra').length

  const preview = (column: number) =>
    table.rows
      .map((row) => row[column])
      .filter(Boolean)
      .slice(0, 3)

  return (
    <Stack
      as='form'
      gap={5}
      onSubmit={(event) => {
        event.preventDefault()
        setTried(true)
        if (!blocked) onContinue()
      }}
    >
      <Text color='fg.muted'>
        {t('members.import.match.intro', {
          matched: autoMatched,
          total: table.header.length,
          defaultValue: 'We matched {{matched}} of {{total}} columns. Check them, then continue.',
        })}
      </Text>

      <Box borderWidth='1px' borderColor='border' borderRadius='md' overflow='hidden'>
        <Grid
          display={{ base: 'none', md: 'grid' }}
          templateColumns='minmax(0, 1fr) 1.5rem minmax(12rem, 16rem) minmax(0, 1.3fr)'
          gap={4}
          px={4}
          py={2}
          bg='bg.muted'
          fontSize='xs'
          fontWeight='bolder'
          color='fg.muted'
          aria-hidden
        >
          <Text>{t('members.import.match.your_column', { defaultValue: 'Your column' })}</Text>
          <span />
          <Text>{t('members.import.match.imported_as', { defaultValue: 'Imported as' })}</Text>
          <Text>{t('members.import.match.first_values', { defaultValue: 'First values' })}</Text>
        </Grid>
        {table.header.map((header, column) => {
          const target = targets[column]
          // Flagged while it isn't a member field: before keeping it as extra info, and once kept
          const sensitive = (target === 'skip' || target === 'extra') && isSensitiveHeader(header)
          const values = preview(column)
          const selectId = `import-column-${column}`
          return (
            <Grid
              key={column}
              templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 1.5rem minmax(12rem, 16rem) minmax(0, 1.3fr)' }}
              gap={{ base: 2, md: 4 }}
              alignItems='center'
              px={4}
              py={3}
              borderTopWidth='1px'
              borderColor='border'
            >
              <Flex align='center' gap={2} minW={0} wrap='wrap'>
                <chakra.label htmlFor={selectId} fontWeight='bolder' truncate>
                  {header}
                </chakra.label>
                {sensitive && (
                  <Badge colorPalette='orange' variant='subtle' size='sm'>
                    <Icon as={LuTriangleAlert} aria-hidden />
                    {t('members.import.match.sensitive', { defaultValue: 'Sensitive?' })}
                  </Badge>
                )}
              </Flex>
              <Icon as={LuArrowRight} color='fg.muted' display={{ base: 'none', md: 'block' }} aria-hidden />
              <NativeSelect.Root size='sm'>
                <NativeSelect.Field
                  id={selectId}
                  // A copy-free handle for the e2e suite: the file's own header
                  data-column={header}
                  value={target}
                  onChange={(event) => onChange(retarget(targets, column, event.target.value as ColumnTarget))}
                  fontSize={{ base: 'md', md: 'sm' }}
                >
                  <option value='skip'>{t('members.import.match.skip', { defaultValue: 'Don’t import' })}</option>
                  <option value='extra' disabled={target !== 'extra' && extras >= MAX_EXTRA_COLUMNS}>
                    {t('members.import.match.extra', { defaultValue: 'Keep as extra info' })}
                  </option>
                  <optgroup label={t('members.import.match.fields', { defaultValue: 'Member fields' })}>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </optgroup>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {/* ph-no-capture: the first values are the members' own data */}
              <Text className='ph-no-capture' fontSize='sm' color='fg.muted' truncate>
                <VisuallyHidden>
                  {t('members.import.match.first_values', { defaultValue: 'First values' })}:{' '}
                </VisuallyHidden>
                {values.length ? values.join(' · ') : t('members.import.match.no_values', { defaultValue: 'Empty' })}
              </Text>
            </Grid>
          )
        })}
      </Box>

      {targets.some((target, column) => target === 'extra' && isSensitiveHeader(table.header[column])) && (
        <Banner status='warning'>
          {t('members.import.match.sensitive_kept', {
            defaultValue:
              'Some columns you keep look like health, bank or private notes. Keep them only if you need them for your votes.',
          })}
        </Banner>
      )}

      {tried && blocked && (
        <Banner status='error'>
          {missing.name && missing.contact
            ? t('members.import.match.missing_both', {
                defaultValue: 'Choose the column with each person’s name, and the one with their email or mobile.',
              })
            : missing.name
              ? t('members.import.match.missing_name', {
                  defaultValue: 'Choose the column with each person’s name (or surname).',
                })
              : t('members.import.match.missing_contact', {
                  defaultValue:
                    'Choose the column with each person’s email or mobile: that’s where their voting code goes.',
                })}
        </Banner>
      )}

      <Flex justify='space-between' gap={3}>
        <Button type='button' variant='outline' onClick={onBack}>
          {t('members.import.back', { defaultValue: 'Back' })}
        </Button>
        <Button type='submit'>{t('members.import.continue', { defaultValue: 'Continue' })}</Button>
      </Flex>
    </Stack>
  )
}
