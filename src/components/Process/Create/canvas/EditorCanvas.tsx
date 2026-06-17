import { Box, VStack } from '@chakra-ui/react'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Editor from '~components/Editor'
import { Process } from '../common'
import { editorBody } from '../editor/typography'
import { LiveStreamingInput } from '../LiveStreamingInput'
import { Questions } from '../MainContent'
import { useProcessTemplates } from '../TemplateProvider'
import { TemplateGallery } from './TemplateGallery'
import { TitleField } from './TitleField'

export type EditorCanvasProps = {
  /** Remount key for the rich editor, so it resets when the form resets. */
  editorKey: string
}

/**
 * The shared editing canvas — the "ballot document": title, optional livestream,
 * description, then questions. While pristine it offers a template gallery to
 * start; once the admin commits, it becomes a clean writing surface.
 */
export const EditorCanvas = ({ editorKey }: EditorCanvasProps) => {
  const { t } = useTranslation()
  const {
    control,
    watch,
    formState: { isDirty },
  } = useFormContext<Process>()
  const { activeTemplate, placeholders } = useProcessTemplates()

  const title = watch('title')
  const showGallery = !activeTemplate && !title?.trim() && !isDirty

  return (
    <VStack align='stretch' gap={10}>
      <VStack as='header' align='stretch' gap={3}>
        <TitleField />
        <LiveStreamingInput />
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <Editor
              key={editorKey}
              onChange={field.onChange}
              variant='borderless'
              typography={editorBody.processDescription}
              placeholder={
                placeholders[activeTemplate]?.description ??
                t('process.create.description.placeholder', { defaultValue: 'Add a description…' })
              }
              defaultValue={field.value}
            />
          )}
        />
      </VStack>

      {showGallery && (
        <Box>
          <TemplateGallery />
        </Box>
      )}

      <Questions />
    </VStack>
  )
}
