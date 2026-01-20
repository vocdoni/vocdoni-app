import {
  Avatar,
  Box,
  BoxProps,
  Button,
  Flex,
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Image,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { DropzoneInputProps, DropzoneRootProps, useDropzone } from 'react-dropzone'
import { useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { BiTrash } from 'react-icons/bi'
import { LuUpload } from 'react-icons/lu'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'

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

export const AvatarUploader = (props: FormControlProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    watch,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext()
  const { mutateAsync: uploadFile, isPending } = useUploadFile()

  const avatar = watch('avatar')
  const name = getValues('name')

  const onUpload = async (files: File[]) => {
    clearErrors('avatar')
    try {
      const url = await uploadFile(files[0])
      setValue('avatar', url)
      toast({
        title: t('uploader.avatar_upload_success', { defaultValue: 'Avatar uploaded' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('uploader.upload_failed', { defaultValue: 'Upload failed' })
      setError('avatar', {
        message: errorMessage,
      })
      toast({
        title: t('uploader.avatar_upload_failed', { defaultValue: 'Avatar upload failed' }),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error('Error uploading avatar:', error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    multiple: false,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  })

  return (
    <FormControl isInvalid={!!errors?.avatar} {...props}>
      <FormLabel>{t('avatar.label', { defaultValue: 'Logo/Avatar' })}</FormLabel>
      <Box borderRadius='full' px={6}>
        {avatar ? (
          <Box position='relative' borderRadius='full' w='128px' h='128px'>
            <Avatar name={name?.toString() || ''} src={avatar} w='full' h='full' />
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
                icon={<BiTrash />}
                aria-label={t('remove_avatar', { defaultValue: 'Remove avatar' })}
                onClick={() => setValue('avatar', '')}
                size='sm'
                colorScheme='red'
              />
            </Flex>
          </Box>
        ) : (
          <Flex flexDirection='column' justifyContent='center' alignItems='center' gap={2} {...getRootProps()}>
            <Box
              w='128px'
              h='128px'
              backgroundColor='gray.200'
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
            <Button variant='outline' leftIcon={<Icon as={LuUpload} mr={2} boxSize={4} />}>
              {t('uploader.click_or_drag_and_drop_image', { defaultValue: 'Upload Image' })}
            </Button>
          </Flex>
        )}
      </Box>
      <FormErrorMessage>{errors?.avatar?.message?.toString()}</FormErrorMessage>
    </FormControl>
  )
}

export const ImageUploader = ({ name, borderTopRadius, w = 'full', h = '150px' }: ImageUploaderProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const {
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext()
  const { mutateAsync: uploadFile, isPending } = useUploadFile()

  const value = watch(name)

  const onUpload = async (files: File[]) => {
    clearErrors(name)
    try {
      const url = await uploadFile(files[0])
      setValue(name, url, { shouldDirty: true })
      toast({
        title: t('uploader.image_upload_success', { defaultValue: 'Image uploaded' }),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('uploader.upload_failed', { defaultValue: 'Upload failed' })
      setError(name, { message: errorMessage })
      toast({
        title: t('uploader.image_upload_failed', { defaultValue: 'Image upload failed' }),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      console.error(error)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onUpload,
    multiple: false,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  })

  return (
    <FormControl isInvalid={!!errors?.[name]}>
      <Flex direction='column' gap={2} align='center'>
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
            {isPending ? <Spinner /> : <Icon as={LuUpload} boxSize={6} color='gray.400' />}
          </Flex>
        )}
      </Flex>
      <FormErrorMessage>{errors?.[name]?.message?.toString()}</FormErrorMessage>
    </FormControl>
  )
}

const Uploader = ({ getRootProps, getInputProps, isDragActive, isLoading, formats }: UploaderProps) => {
  const { t } = useTranslation()

  if (!formats) {
    formats = ['CSV', 'XLSX', 'ODS']
  }

  return (
    <Flex
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      gap={5}
      p={10}
      border='1px dashed'
      borderColor={isDragActive ? 'input.drag_and_drop.border_active' : 'table.border'}
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
                click: <Text as='span' color='input.drag_and_drop.text' />,
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
