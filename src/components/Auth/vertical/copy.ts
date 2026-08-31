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
 * Every vertical we can put a real customer quote behind gets an entry — `registry.test.ts` holds
 * that line, so a new testimonial for an unwritten sector fails the suite rather than shipping a
 * sector-specific quote under a generic headline. Verticals with no customer of their own keep
 * falling back to `generic` and render the ordinary login page copy, which never claims anything
 * sector-specific.
 *
 * Writing the copy is not the same as claiming the sector trusts us: the trust bar below still
 * degrades on its own. A vertical without enough logos of its own borrows the generic row *and* the
 * generic sentence (see `useAuthVertical`), so the sector-specific sentence here only ever appears
 * over that sector's own logos. It is written ahead of the logos on purpose — the day a third
 * customer logo lands, the sentence is already translated in all 10 locales.
 *
 * The trust bar names the processes that sector actually runs — AGMs and board elections for
 * professional associations, participatory budgets and referendums for public administration — so it
 * has to be written per vertical rather than interpolated.
 */
export const useVerticalCopy = (): VerticalCopyMap => {
  const { t } = useTranslation()

  return {
    generic: {
      label: t('auth.verticals.generic.label', { defaultValue: 'Success stories' }),
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
    associations: {
      label: t('auth.verticals.associations.label', { defaultValue: 'Associations' }),
      headline: t('auth.verticals.associations.headline', {
        defaultValue: 'Assemblies your members can trust',
      }),
      trustBar: t('auth.verticals.associations.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure general assemblies, board elections and member consultations for your association. Many already trust it for exactly this:',
      }),
    },
    ngos: {
      label: t('auth.verticals.ngos.label', { defaultValue: 'NGOs and non-profits' }),
      headline: t('auth.verticals.ngos.headline', {
        defaultValue: 'Governance your community can trust',
      }),
      trustBar: t('auth.verticals.ngos.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure assemblies, board elections and member consultations for your non-profit. Organizations working for the common good already trust it for exactly this:',
      }),
    },
    'public-administration': {
      label: t('auth.verticals.public_administration.label', { defaultValue: 'Public administration' }),
      headline: t('auth.verticals.public_administration.headline', {
        defaultValue: 'Participation your residents can verify',
      }),
      trustBar: t('auth.verticals.public_administration.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure participatory budgets, citizen consultations and referendums for your municipality. Public administrations already trust it for exactly this:',
      }),
    },
    'political-parties': {
      label: t('auth.verticals.political_parties.label', { defaultValue: 'Political parties' }),
      headline: t('auth.verticals.political_parties.headline', {
        defaultValue: 'Primaries your members can verify',
      }),
      trustBar: t('auth.verticals.political_parties.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure primaries, leadership elections and internal consultations for your party. Parties already trust it for exactly this:',
      }),
    },
    'trade-unions': {
      label: t('auth.verticals.trade_unions.label', { defaultValue: 'Trade unions' }),
      headline: t('auth.verticals.trade_unions.headline', {
        defaultValue: 'Ballots every worker can trust',
      }),
      trustBar: t('auth.verticals.trade_unions.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure strike ballots, collective agreement votes and leadership elections for your union. Unions already trust it for exactly this:',
      }),
    },
    'sports-clubs': {
      label: t('auth.verticals.sports_clubs.label', { defaultValue: 'Sports clubs' }),
      headline: t('auth.verticals.sports_clubs.headline', {
        defaultValue: 'Club decisions every member can join',
      }),
      trustBar: t('auth.verticals.sports_clubs.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure club elections, general assemblies and member consultations for your club. Clubs and federations already trust it for exactly this:',
      }),
    },
  }
}
