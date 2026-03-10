import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import i18n from 'i18next'
import type { ReactNode } from 'react'
import { initReactI18next } from 'react-i18next'
import { afterEach, vi } from 'vitest'

function createToastMock() {
  const toastFn = ((options?: { id?: string }) => ({ id: options?.id ?? 'toast' })) as any
  toastFn.close = vi.fn()
  toastFn.closeAll = vi.fn()
  toastFn.update = vi.fn()
  toastFn.isActive = vi.fn(() => false)
  return {
    ToastProvider: ({ children }: { children: ReactNode }) => children as any,
    useToast: () => toastFn,
  }
}

vi.mock('~components/Toast', createToastMock)

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('./src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('@vocdoni/react-components/pagination', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components/pagination')>()
  const { getReactProvidersMock } = await import('./src/test-utils-react-providers-mock')
  const mock = getReactProvidersMock()
  return {
    ...actual,
    usePagination: mock.usePagination,
    useRoutedPagination: mock.useRoutedPagination,
    PaginationProvider: mock.PaginationProvider ?? actual.PaginationProvider,
    RoutedPaginationProvider: mock.RoutedPaginationProvider ?? actual.RoutedPaginationProvider,
  }
})

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    showSupportNotice: false,
    interpolation: { escapeValue: false },
    resources: { en: { common: {} } },
  })
}

// Cleanup after each test
afterEach(async () => {
  cleanup()
  const { resetReactProvidersMock } = await import('./src/test-utils-react-providers-mock')
  resetReactProvidersMock()
})

// Mock environment variables
process.env.SAAS_URL = 'https://test-api.example.com'

// Mock window.matchMedia for Chakra UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
})

const localStorageStore = new Map<string, string>()
const localStorageMock = {
  getItem: vi.fn((key: string) => {
    return localStorageStore.has(key) ? localStorageStore.get(key)! : null
  }),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore.set(key, String(value))
  }),
  removeItem: vi.fn((key: string) => {
    localStorageStore.delete(key)
  }),
  clear: vi.fn(() => {
    localStorageStore.clear()
  }),
  key: vi.fn((index: number) => {
    return Array.from(localStorageStore.keys())[index] ?? null
  }),
  get length() {
    return localStorageStore.size
  },
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
})
