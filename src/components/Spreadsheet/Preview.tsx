import { AlertRoot as Alert, AlertDescription, AlertIndicator, Button, Flex, Icon, List, Text } from '@chakra-ui/react'
import { DropzoneRootProps } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import { LuCheck } from 'react-icons/lu'
import { CensusSpreadsheetManager } from '~components/Process/Census/Spreadsheet/CensusSpreadsheetManager'
import { SpreadsheetManager } from './SpreadsheetManager'

type CsvPreviewProps = {
  manager?: CensusSpreadsheetManager | SpreadsheetManager
  upload: DropzoneRootProps
}

export const CsvPreview = ({ manager, upload }: CsvPreviewProps) => {
  const { t } = useTranslation()

  if (!manager || !manager?.data) return null

  return (
    <Alert status='success' variant='subtle' flexDirection='column' borderRadius='md'>
      <AlertDescription display='flex' flexDirection='column' gap={3}>
        <Flex>
          <AlertIndicator>
            <Icon as={LuCheck} boxSize={4} />
          </AlertIndicator>
          <Text fontSize='sm'>
            {t('form.process_create.spreadsheet.preview.success_title', {
              defaultValue: 'File uploaded successfully',
            })}
          </Text>
        </Flex>
        <Text fontSize='sm'>
          {t('form.process_create.spreadsheet.preview.success_description', {
            defaultValue: 'The user will be asked to authenticate with:',
          })}
        </Text>
        <List.Root display='flex' flexDirection='column' gap={2} pl={4} listStyleType='disc'>
          {manager.header.map((field, index) => (
            <List.Item key={index} textTransform='capitalize'>
              {field}
            </List.Item>
          ))}
        </List.Root>
        <Button variant='outline' flexShrink={0} {...upload}>
          {t('form.process_create.spreadsheet.preview.upload_new_list')}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
