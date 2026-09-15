import { renderToString } from 'react-dom/server'
import AnnouncementBanner from './AnnouncementBanner'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'

const announcement = JSON.stringify({ status: 'info', message: { en: 'Heads up!' } })

describe('AnnouncementBanner', () => {
  // The banner reads its dismissed flag from localStorage, which throws when
  // rendered on the server. It sits on the app root, and the root is
  // server-rendered whenever HOME_PROCESS_ID turns it into a process page, so
  // the server pass must produce nothing instead of a 500.
  it('renders nothing (and does not throw) on the server', () => {
    expect(() =>
      renderToString(
        <AppEnvProvider value={buildAppEnv({ ANNOUNCEMENT: announcement })}>
          <AnnouncementBanner />
        </AppEnvProvider>
      )
    ).not.toThrow()

    expect(
      renderToString(
        <AppEnvProvider value={buildAppEnv({ ANNOUNCEMENT: announcement })}>
          <AnnouncementBanner />
        </AppEnvProvider>
      )
    ).toBe('')
  })
})
