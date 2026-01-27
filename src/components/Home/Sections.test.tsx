import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '~src/test-utils'
import Benefits from './Benefits'
import Clients from './Clients'
import ContactUs from './ContactUs'
import Faqs from './Faqs'
import Features from './Features'
import Process from './Process'
import Solutions from './Solutions'

vi.mock('~components/shared/ContactLink', () => ({
  default: ({ children, ...props }: ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

describe('Home sections', () => {
  it('renders Features', () => {
    render(<Features />)
    expect(screen.getByText('home.features.title')).toBeInTheDocument()
  })

  it('renders Benefits', () => {
    render(<Benefits />)
    expect(screen.getByText('home.benefits.title')).toBeInTheDocument()
  })

  it('renders Solutions', () => {
    render(<Solutions />)
    expect(screen.getByText('home.solutions.title')).toBeInTheDocument()
  })

  it('renders Process', () => {
    render(<Process />)
    expect(screen.getByText('home.process.title')).toBeInTheDocument()
  })

  it('renders ContactUs', () => {
    render(<ContactUs />)
    expect(screen.getByText('home.contactus.title')).toBeInTheDocument()
  })

  it('renders Clients', () => {
    render(<Clients />)
    expect(screen.getByText('home.clients_title')).toBeInTheDocument()
  })

  it('renders Faqs', () => {
    render(<Faqs />)
    expect(screen.getByText('home.faqs.title')).toBeInTheDocument()
  })
})
