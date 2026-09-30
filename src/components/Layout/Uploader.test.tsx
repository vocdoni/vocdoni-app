import '@testing-library/jest-dom'
import { act, screen } from '@testing-library/react'
import type { FileRejection } from 'react-dropzone'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { render } from '~src/test-utils'
import { AvatarUploader, ImageUploader } from './Uploader'

type DropHandler = (files: File[], rejections?: FileRejection[]) => Promise<void>

let dropHandler: DropHandler | undefined
const bearedFetch = vi.fn()

vi.mock('react-dropzone', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-dropzone')>()),
  useDropzone: (options: { onDrop: DropHandler }) => {
    dropHandler = options.onDrop
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
    }
  },
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

const Form = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { avatar: '', image: '', name: 'Org' } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

const drop = async (files: File[], rejections: FileRejection[] = []) => {
  await act(async () => {
    await dropHandler?.(files, rejections)
  })
}

const png = () => new File(['png'], 'logo.png', { type: 'image/png' })
const pdf = () => new File(['pdf'], 'notes.pdf', { type: 'application/pdf' })
const invalidType = (file: File): FileRejection => ({
  file,
  errors: [{ code: 'file-invalid-type', message: 'File type must be image/png' }],
})

describe.each([
  ['AvatarUploader', () => <AvatarUploader />],
  ['ImageUploader', () => <ImageUploader name='image' />],
])('%s', (_, renderUploader) => {
  beforeEach(() => {
    dropHandler = undefined
    bearedFetch.mockReset()
    bearedFetch.mockResolvedValue({ urls: ['https://example.com/logo.png'] })
  })

  it('asks for a supported image instead of uploading a rejected file', async () => {
    render(<Form>{renderUploader()}</Form>)

    await drop([], [invalidType(pdf())])

    expect(screen.getByText("This file type isn't supported. Upload a .png or .jpg image.")).toBeInTheDocument()
    expect(screen.queryByText('File type must be image/png')).not.toBeInTheDocument()
    expect(bearedFetch).not.toHaveBeenCalled()
  })

  it('asks for a single file when a valid image is dropped together with an unsupported one', async () => {
    render(<Form>{renderUploader()}</Form>)

    await drop([png()], [invalidType(pdf())])

    expect(screen.getByText('Upload one file at a time.')).toBeInTheDocument()
    expect(bearedFetch).not.toHaveBeenCalled()
  })

  it('does nothing when nothing was dropped', async () => {
    render(<Form>{renderUploader()}</Form>)

    await drop([])

    expect(bearedFetch).not.toHaveBeenCalled()
    expect(screen.queryByText(/Upload one file at a time|isn't supported/)).not.toBeInTheDocument()
  })

  it('keeps a visible error when nothing was dropped', async () => {
    render(<Form>{renderUploader()}</Form>)

    await drop([], [invalidType(pdf())])
    await drop([])

    expect(screen.getByText("This file type isn't supported. Upload a .png or .jpg image.")).toBeInTheDocument()
  })

  it('ignores a slow upload from an earlier drop once a newer file is dropped', async () => {
    let finishUpload: (value: { urls: string[] }) => void = () => {}
    bearedFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        finishUpload = resolve
      })
    )
    render(<Form>{renderUploader()}</Form>)

    let slowDrop: Promise<void> | undefined
    await act(async () => {
      slowDrop = dropHandler?.([png()], [])
    })
    await drop([], [invalidType(pdf())])
    // The superseded upload is still running, but the dropzone must not keep spinning for it
    expect(document.querySelector('.chakra-spinner')).not.toBeInTheDocument()
    await act(async () => {
      finishUpload({ urls: ['https://example.com/logo.png'] })
      await slowDrop
    })

    expect(screen.getByText("This file type isn't supported. Upload a .png or .jpg image.")).toBeInTheDocument()
    // Neither the avatar (with its remove button) nor the image preview may show the stale upload
    expect(screen.queryByRole('button', { name: 'Remove avatar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('uploads a single accepted image', async () => {
    render(<Form>{renderUploader()}</Form>)

    const file = png()
    await drop([file])

    expect(bearedFetch).toHaveBeenCalledTimes(1)
    const body = bearedFetch.mock.calls[0][1].body as FormData
    expect(body.get('file1')).toBe(file)
  })
})

describe('ImageUploader in a field array', () => {
  // Stands in for an option list: the uploader's field name is index based and shifts when an earlier item goes
  const Options = ({ name, show = true }: { name: string; show?: boolean }) => {
    const methods = useForm({ defaultValues: { options: [{ image: '' }, { image: '' }] } })
    const options = useWatch({ control: methods.control, name: 'options' })
    return (
      <FormProvider {...methods}>
        {show && <ImageUploader name={name} />}
        <pre data-testid='values'>{JSON.stringify(options)}</pre>
      </FormProvider>
    )
  }

  const startSlowUpload = async () => {
    let finishUpload: (value: { urls: string[] }) => void = () => {}
    bearedFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        finishUpload = resolve
      })
    )
    let slowDrop: Promise<void> | undefined
    await act(async () => {
      slowDrop = dropHandler?.([png()], [])
    })
    return async () => {
      await act(async () => {
        finishUpload({ urls: ['https://example.com/logo.png'] })
        await slowDrop
      })
    }
  }

  beforeEach(() => {
    dropHandler = undefined
    bearedFetch.mockReset()
  })

  it('stores the upload under the field name the uploader has when it finishes', async () => {
    const { rerender } = render(<Options name='options.1.image' />)
    const finish = await startSlowUpload()

    // An earlier option was removed while uploading, so this uploader now edits index 0
    rerender(<Options name='options.0.image' />)
    await finish()

    expect(screen.getByTestId('values')).toHaveTextContent(
      JSON.stringify([{ image: 'https://example.com/logo.png' }, { image: '' }])
    )
  })

  it('drops the upload result once the uploader is gone', async () => {
    const { rerender } = render(<Options name='options.1.image' />)
    const finish = await startSlowUpload()

    rerender(<Options name='options.1.image' show={false} />)
    await finish()

    expect(screen.getByTestId('values')).toHaveTextContent(JSON.stringify([{ image: '' }, { image: '' }]))
  })
})
