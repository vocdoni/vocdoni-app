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

// The app auth hook is globally stubbed so components that only read the active org
// address (currentAddress) render without wiring the whole AuthProvider tree. Tests that
// exercise auth behavior mock this module themselves (file-level vi.mock takes precedence).
vi.mock('~components/Auth/useAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./src/components/Auth/useAuth')>()
  const { getAuthMock } = await import('./src/test-utils-react-providers-mock')
  return {
    ...actual,
    useAuth: () => getAuthMock(),
  }
})

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('./src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

// The integrator-sdk client hook (`useApiClient`) re-exports react-providers' `useClient`.
// Stub only that hook so components reading the SAAS client render without a real ClientProvider;
// tests drive it via `setReactProvidersMock({ useClient })`. Everything else stays real.
vi.mock('@vocdoni/react-providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-providers')>()
  const { getReactProvidersMock } = await import('./src/test-utils-react-providers-mock')
  return {
    ...actual,
    useClient: getReactProvidersMock().useClient,
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
  // jsdom keeps `document.cookie` for the whole file. The cookie consent choice
  // now lives in a cookie (shared with vocdoni.io), so without this a decision
  // made in one test leaks into the next.
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0].trim()
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`
  }
  const { resetReactProvidersMock, resetAuthMock } = await import('./src/test-utils-react-providers-mock')
  resetReactProvidersMock()
  resetAuthMock()
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
