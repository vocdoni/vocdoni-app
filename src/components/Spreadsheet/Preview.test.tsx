import { DropzoneRootProps } from 'react-dropzone'
import { render, screen } from '~src/test-utils'
import { CsvPreview } from './Preview'

describe('CsvPreview', () => {
  it('renders the uploaded header fields', () => {
    const manager = {
      data: [['user@example.com']],
      header: ['email'],
    }

    const upload = { onClick: vi.fn() } as unknown as DropzoneRootProps

    render(<CsvPreview manager={manager as any} upload={upload} />)

    expect(screen.getByText('File uploaded successfully')).toBeInTheDocument()
    expect(screen.getByText('email')).toBeInTheDocument()
  })
})
