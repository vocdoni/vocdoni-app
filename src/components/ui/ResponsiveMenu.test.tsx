import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { useIsMobile } from '~components/ui/useIsMobile'
import { ResponsiveMenu } from './ResponsiveMenu'

vi.mock('~components/ui/useIsMobile', () => ({ useIsMobile: vi.fn() }))

const items = (onEdit = vi.fn(), onDelete = vi.fn()) => [
  { value: 'delete', label: 'Delete', onSelect: onDelete, danger: true },
  { value: 'edit', label: 'Edit', onSelect: onEdit },
  { value: 'docs', label: 'Docs', href: 'https://example.com/docs' },
]

describe('ResponsiveMenu', () => {
  describe('from md', () => {
    beforeEach(() => vi.mocked(useIsMobile).mockReturnValue(false))

    it('opens a dropdown from a trigger named by the label', async () => {
      render(<ResponsiveMenu label='Vote actions' items={items()} />)
      const trigger = screen.getByRole('button', { name: 'Vote actions' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu')

      await userEvent.click(trigger)
      expect(await screen.findByRole('menuitem', { name: 'Edit' })).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('puts destructive items last and marks them', async () => {
      render(<ResponsiveMenu label='Vote actions' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))

      const names = (await screen.findAllByRole('menuitem')).map((item) => item.textContent)
      expect(names).toEqual(['Edit', 'Docs', 'Delete'])
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-danger', 'true')
      expect(screen.getByRole('menuitem', { name: 'Edit' })).not.toHaveAttribute('data-danger')
    })

    it('fires onSelect', async () => {
      const onEdit = vi.fn()
      render(<ResponsiveMenu label='Vote actions' items={items(onEdit)} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

      expect(onEdit).toHaveBeenCalledTimes(1)
    })

    it('renders an item with href as a link', async () => {
      render(<ResponsiveMenu label='Vote actions' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))

      expect(await screen.findByRole('menuitem', { name: 'Docs' })).toHaveAttribute('href', 'https://example.com/docs')
    })

    it('rules off the destructive items, and only when other items come before them', async () => {
      const { unmount } = render(<ResponsiveMenu label='Vote actions' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))
      await screen.findByRole('menuitem', { name: 'Delete' })

      const separator = document.querySelector('[data-scope="menu"][data-part="separator"]')
      expect(separator).not.toBeNull()
      expect(
        separator!.compareDocumentPosition(screen.getByRole('menuitem', { name: 'Delete' })) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      unmount()

      render(<ResponsiveMenu label='Only danger' items={[{ value: 'delete', label: 'Delete', danger: true }]} />)
      await userEvent.click(screen.getByRole('button', { name: 'Only danger' }))
      await screen.findByRole('menuitem', { name: 'Delete' })
      expect(document.querySelector('[data-scope="menu"][data-part="separator"]')).toBeNull()
    })

    it('uses a given trigger', () => {
      render(<ResponsiveMenu label='Vote actions' trigger={<button>Open</button>} items={items()} />)

      expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    })
  })

  describe('below md', () => {
    beforeEach(() => vi.mocked(useIsMobile).mockReturnValue(true))

    it('opens a bottom sheet named by the label, with a Close button', async () => {
      render(<ResponsiveMenu label='Vote actions' items={items()} />)
      const trigger = screen.getByRole('button', { name: 'Vote actions' })
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')

      await userEvent.click(trigger)
      expect(await screen.findByRole('dialog', { name: 'Vote actions' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('titles the sheet with what it acts on and its state', async () => {
      render(<ResponsiveMenu label='Vote actions' title='Annual budget' subtitle='Live' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))

      expect(await screen.findByRole('dialog', { name: 'Annual budget' })).toBeInTheDocument()
      expect(screen.getByText('Live')).toBeInTheDocument()
    })

    it('still takes the old description prop as the subtitle', async () => {
      render(<ResponsiveMenu label='Vote actions' description='Draft' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))

      await screen.findByRole('dialog')
      expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('lists destructive items last and marks them', async () => {
      render(<ResponsiveMenu label='Vote actions' items={items()} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))
      await screen.findByRole('dialog')

      const rows = ['Edit', 'Docs', 'Delete'].map((name) => screen.getByText(name))
      expect(rows[0].compareDocumentPosition(rows[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-danger', 'true')
      expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', 'https://example.com/docs')
    })

    it('fires onSelect and closes the sheet', async () => {
      const onEdit = vi.fn()
      render(<ResponsiveMenu label='Vote actions' items={items(onEdit)} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Edit' }))

      expect(onEdit).toHaveBeenCalledTimes(1)
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('closes from the Close button without selecting', async () => {
      const onEdit = vi.fn()
      render(<ResponsiveMenu label='Vote actions' items={items(onEdit)} />)
      await userEvent.click(screen.getByRole('button', { name: 'Vote actions' }))
      await userEvent.click(await screen.findByRole('button', { name: 'Close' }))

      expect(onEdit).not.toHaveBeenCalled()
      await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })
  })
})
