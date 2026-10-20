import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Box,
  BoxProps,
  Button,
  Flex,
  FieldRoot as FormControl,
  FieldRootProps as FormControlProps,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  Icon,
  IconButton,
  Image,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { DropzoneInputProps, DropzoneRootProps, FileRejection, useDropzone } from 'react-dropzone'
import { SetValueConfig, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { BiTrash } from 'react-icons/bi'
import { LuUpload } from 'react-icons/lu'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { dropRejectionMessage, useLatestDrop } from './dropzone'

export type UploaderProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T
  isDragActive: boolean
  isLoading?: boolean
  formats?: string[]
}

type ImageUploaderProps = {
  name: string
} & Pick<BoxProps, 'w' | 'h' | 'borderTopRadius'>

const imageAccept = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
}

const useUploadFile = () => {
  const { bearedFetch } = useAuth()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file1', file)
      const response = await bearedFetch<{ urls: string[] }>(ApiEndpoints.Storage, {
        method: 'POST',
        body: formData,
      })
      return response.urls[0]
    },
  })
}

type ImageDropUploadOptions = {
  name: string
  successTitle: string
  failureTitle: string
  // Prepended to the console error when an upload fails
  logPrefix: string
  setValueOptions?: SetValueConfig
}

// Shared drop handling for the image dropzones: explains rejected drops, uploads the accepted image and stores its
// URL in the `name` form field.
// Drop and upload problems are kept as local state, not form errors: these fields are never registered, so the
// form's validation would never clear a `setError` on them and it would block submitting until a valid image is
// uploaded. It also avoids looking up index-based names (`questions.0.options.2.image`) in the nested errors object
const useImageDropUpload = ({
  name,
  successTitle,
  failureTitle,
  logPrefix,
  setValueOptions,
}: ImageDropUploadOptions) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { setValue } = useFormContext()
  const { mutateAsync: uploadFile } = useUploadFile()
  const [error, setError] = useState<string>()

  // A slow upload from an earlier drop can't overwrite the outcome of a newer one, and once unmounted (e.g. the
  // option was removed) a pending upload has no field left to write to. `isPending` only reflects the latest drop, so
  // the spinner doesn't keep spinning for an upload a newer drop superseded
  const { busy: isPending, start, isLatest, finish } = useLatestDrop()
  // Field-array names are index based (e.g. `questions.0.options.2.image`) and shift when an earlier item is
  // removed, so the upload result must go to the field's current name, not the one captured when it was dropped
  const currentName = useRef(name)
  currentName.current = name
  const onUpload = async (files: File[], rejections: FileRejection[] = []) => {
    // Nothing was dropped at all (e.g. an empty folder): keep any visible error and any upload in flight
    if (!files.length && !rejections.length) return
    const rejected = dropRejectionMessage(
      t,
      files,
      rejections,
      t('uploader.error.invalid_image_type', {
        defaultValue: "This file type isn't supported. Upload a .png or .jpg image.",
      })
    )
    const drop = start(!rejected)
    setError(rejected)
    if (rejected) return
    try {
      const url = await uploadFile(files[0])
      if (!isLatest(drop)) return
      setValue(currentName.current, url, setValueOptions)
      toast({
        title: successTitle,
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (e) {
      console.error(logPrefix, e)
      if (!isLatest(drop)) return
      const errorMessage =
        e instanceof Error ? e.message : t('uploader.upload_failed', { defaultValue: 'Upload failed' })
      setError(errorMessage)
      toast({
        title: failureTitle,
        description: errorMessage,
        type: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      finish(drop)
    }
  }

  const dropzone = useDropzone({
    onDrop: onUpload,
    multiple: false,
    accept: imageAccept,
  })

  return { ...dropzone, error, isPending }
}

export const AvatarUploader = (props: FormControlProps) => {
  const { t } = useTranslation()
  const { watch, getValues, setValue } = useFormContext()
  const { getRootProps, getInputProps, isDragActive, isPending, error } = useImageDropUpload({
    name: 'avatar',
    successTitle: t('uploader.avatar_upload_success', { defaultValue: 'Avatar uploaded' }),
    failureTitle: t('uploader.avatar_upload_failed', { defaultValue: 'Avatar upload failed' }),
    logPrefix: 'Error uploading avatar:',
  })

  const avatar = watch('avatar')
  const name = getValues('name')

  return (
    <FormControl invalid={!!error} {...props}>
      <FormLabel>{t('avatar.label', { defaultValue: 'Logo/Avatar' })}</FormLabel>
      <Box borderRadius='full' px={6}>
        {avatar ? (
          <Box position='relative' borderRadius='full' w='128px' h='128px'>
            <AvatarRoot w='full' h='full'>
              <AvatarImage src={avatar} />
              <AvatarFallback name={name?.toString() || ''} />
            </AvatarRoot>
            <Flex
              position='absolute'
              top={0}
              left={0}
              w='full'
              h='full'
              align='center'
              justify='center'
              bg='blackAlpha.400'
              opacity={0}
              _hover={{ opacity: 1 }}
              transition='opacity 0.2s'
              borderRadius='full'
            >
              <IconButton
                aria-label={t('remove_avatar', { defaultValue: 'Remove avatar' })}
                onClick={() => setValue('avatar', '')}
                size='sm'
                colorPalette='red'
              >
                <BiTrash />
              </IconButton>
            </Flex>
          </Box>
        ) : (
          <Flex flexDirection='column' justifyContent='center' alignItems='center' gap={2} {...getRootProps()}>
            <Box
              w='128px'
              h='128px'
              backgroundColor='bg.emphasized'
              cursor='pointer'
              borderRadius='full'
              border='2px solid'
              borderColor={isDragActive ? 'green.400' : 'transparent'}
              transition='all 0.2s ease-in-out'
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <input {...getInputProps()} />
              {isPending ? <Spinner /> : <Icon as={LuUpload} boxSize={8} color='texts.subtle' />}
            </Box>
            <Button variant='outline'>
              <Icon as={LuUpload} boxSize={4} />
              {t('uploader.click_or_drag_and_drop_image', { defaultValue: 'Upload Image' })}
            </Button>
          </Flex>
        )}
      </Box>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

export const ImageUploader = ({ name, borderTopRadius, w = 'full', h = '150px' }: ImageUploaderProps) => {
  const { t } = useTranslation()
  const { watch } = useFormContext()
  const { getRootProps, getInputProps, isDragActive, isPending, error } = useImageDropUpload({
    name,
    successTitle: t('uploader.image_upload_success', { defaultValue: 'Image uploaded' }),
    failureTitle: t('uploader.image_upload_failed', { defaultValue: 'Image upload failed' }),
    logPrefix: 'Error uploading image:',
    setValueOptions: { shouldDirty: true },
  })

  const value = watch(name)

  return (
    <FormControl invalid={!!error}>
      <Flex direction='column' gap={2} align='center' w='full'>
        {value ? (
          <Flex
            {...getRootProps()}
            w={w}
            h={h}
            position='relative'
            overflow='hidden'
            borderTopRadius={borderTopRadius}
            cursor='pointer'
          >
            <input {...getInputProps()} />
            <Image
              src={value}
              alt={t('uploaded_image_preview', { defaultValue: 'Preview of the uploaded image' })}
              w='100%'
              h='100%'
              objectFit='cover'
            />
            {/* A new image dropped over the current one is uploading */}
            {isPending && (
              <Flex position='absolute' inset={0} align='center' justify='center' bg='blackAlpha.500'>
                <Spinner color='white' />
              </Flex>
            )}
          </Flex>
        ) : (
          <Flex
            {...getRootProps()}
            w={w}
            h={h}
            bg='gray.800'
            justify='center'
            align='center'
            cursor='pointer'
            borderTopRadius={borderTopRadius}
            borderColor={isDragActive ? 'green.400' : 'gray.600'}
          >
            <input {...getInputProps()} />
            {isPending ? <Spinner color='white' /> : <Icon as={LuUpload} boxSize={6} color='gray.400' />}
          </Flex>
        )}
      </Flex>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  )
}

const Uploader = ({ getRootProps, getInputProps, isDragActive, isLoading, formats }: UploaderProps) => {
  const { t } = useTranslation()

  if (!formats) {
    formats = ['CSV', 'XLS', 'XLSX', 'ODS']
  }

  return (
    <Flex
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      gap={5}
      p={10}
      border='1px dashed'
      borderColor={isDragActive ? 'border.emphasized' : 'table.border'}
      cursor='pointer'
      borderRadius={12}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Flex justifyContent='center' alignItems='center' p={2}>
        <Icon color='texts.subtle' as={LuUpload} boxSize={10} />
      </Flex>
      <Box>
        {isDragActive ? (
          <Text textAlign='center'>{t('uploader.drop_here', { defaultValue: 'Drop the file here' })}</Text>
        ) : isLoading ? (
          <Spinner />
        ) : (
          <Flex direction='column' align='center' textAlign='center'>
            <Trans
              i18nKey='uploader.click_or_drag_and_drop'
              components={{
                click: <Text as='span' color='fg' />,
                formats: <Text as='span' fontSize='sm' color='texts.subtle' />,
              }}
              values={{ formats }}
            />
          </Flex>
        )}
      </Box>
    </Flex>
  )
}

export default Uploader
