import { useTranslation } from 'react-i18next'
import type { VerticalCopyMap } from './types'

/**
 * Per-vertical copy for the auth showcase panel and trust bar.
 *
 * ⚠️ Every key here MUST be a string literal with a `defaultValue`. `pnpm translations`
 * (i18next-cli) extracts keys by static analysis, so a key built from a template literal and the
 * vertical slug silently works in development, where the default value is inline, and ships empty
 * in all 10 locales. Write the record out by hand; TypeScript is what keeps it complete.
 *
 * Only the verticals we have real content for get an entry. Everything else falls back to `generic`
 * (see `useAuthVertical`), which never claims anything sector-specific.
 *
 * The trust bar names the processes that sector actually runs — AGMs and board elections for
 * professional associations, participatory budgets and referendums for public administration — so it
 * has to be written per vertical rather than interpolated.
 */
export const useVerticalCopy = (): VerticalCopyMap => {
  const { t } = useTranslation()

  return {
    generic: {
      label: t('auth.verticals.generic.label', { defaultValue: 'Digital voting' }),
      headline: t('auth.verticals.generic.headline', {
        defaultValue: 'Decisions your members can verify',
      }),
      trustBar: t('auth.verticals.generic.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure assemblies, elections and consultations. Organizations across every sector already trust it:',
      }),
    },
    'professional-associations': {
      label: t('auth.verticals.professional_associations.label', {
        defaultValue: 'Professional associations',
      }),
      headline: t('auth.verticals.professional_associations.headline', {
        defaultValue: 'Every member votes, wherever they are',
      }),
      trustBar: t('auth.verticals.professional_associations.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure AGMs, board elections and consultations for the members of your professional association. Many already trust it for exactly this:',
      }),
    },
  }
}
