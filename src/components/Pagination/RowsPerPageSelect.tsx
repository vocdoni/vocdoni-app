import { Box, Text } from '@chakra-ui/react'
import { GroupBase, Props } from 'chakra-react-select'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Select } from '~components/Form/Select'

const rowsPerPageOptions = [
  { value: 10, label: '10' },
  { value: 20, label: '20' },
  { value: 30, label: '30' },
  { value: 40, label: '40' },
  { value: 50, label: '50' },
]

type OptionType = {
  label: string
  value: number
}

type SelectProps = Props<OptionType, false, GroupBase<OptionType>>

const RowsPerPageSelect = (props: SelectProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()

  const value =
    rowsPerPageOptions.find((opt) => opt.value === Number(searchParams.get('limit'))) || rowsPerPageOptions[0]

  return (
    <Box display='flex' alignItems='center' gap={2}>
      <Text fontSize='sm'>{t('pagination.rows_per_page', 'Rows per page')}</Text>
      <Select
        value={value}
        onChange={(newValue) => {
          searchParams.set('limit', String(newValue?.value))
          setSearchParams(searchParams)
        }}
        menuPortalTarget={document.body}
        options={rowsPerPageOptions}
        isSearchable={false}
        isClearable={false}
        size='sm'
        {...props}
      />
    </Box>
  )
}

export default RowsPerPageSelect
