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
 * Every vertical has an entry, so the panel always names the visitor's sector. That is safe because
 * this copy only describes what Vocdoni does for that sector — it never claims anyone in particular
 * uses it. The claim lives in the trust bar, and `useAuthVertical` replaces the sentence here with
 * the generic one whenever a vertical has to borrow someone else's logos.
 *
 * `generic` is still the fallback for a visitor with no `?type=` at all.
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
    federations: {
      label: t('auth.verticals.federations.label', { defaultValue: 'Federations' }),
      headline: t('auth.verticals.federations.headline', {
        defaultValue: 'One vote per member organization, counted in the open',
      }),
      trustBar: t('auth.verticals.federations.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure congresses, board elections and weighted votes across the organizations in your federation. Many already trust it for exactly this:',
      }),
    },
    'political-parties': {
      label: t('auth.verticals.political_parties.label', { defaultValue: 'Political parties' }),
      headline: t('auth.verticals.political_parties.headline', {
        defaultValue: 'Primaries your members can verify',
      }),
      trustBar: t('auth.verticals.political_parties.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure primaries, congresses and internal referendums for the members of your party. Many already trust it for exactly this:',
      }),
    },
    chambers: {
      label: t('auth.verticals.chambers.label', { defaultValue: 'Chambers of commerce' }),
      headline: t('auth.verticals.chambers.headline', {
        defaultValue: 'Elections your members can audit',
      }),
      trustBar: t('auth.verticals.chambers.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure plenary elections, board renewals and consultations for the businesses in your chamber. Many already trust it for exactly this:',
      }),
    },
    'trade-unions': {
      label: t('auth.verticals.trade_unions.label', { defaultValue: 'Trade unions' }),
      headline: t('auth.verticals.trade_unions.headline', {
        defaultValue: 'Every worker votes, from anywhere',
      }),
      trustBar: t('auth.verticals.trade_unions.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure congresses, workplace ballots and strike votes for your members. Many already trust it for exactly this:',
      }),
    },
    'sports-clubs': {
      label: t('auth.verticals.sports_clubs.label', { defaultValue: 'Sports clubs' }),
      headline: t('auth.verticals.sports_clubs.headline', {
        defaultValue: 'Board elections your members can check',
      }),
      trustBar: t('auth.verticals.sports_clubs.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure board elections, general assemblies and member consultations for your club. Many already trust it for exactly this:',
      }),
    },
    'public-administration': {
      label: t('auth.verticals.public_administration.label', { defaultValue: 'Public administration' }),
      headline: t('auth.verticals.public_administration.headline', {
        defaultValue: 'Participation your citizens can verify',
      }),
      trustBar: t('auth.verticals.public_administration.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure participatory budgets, citizen consultations and local referendums. Many public administrations already trust it for exactly this:',
      }),
    },
    cooperatives: {
      label: t('auth.verticals.cooperatives.label', { defaultValue: 'Cooperatives' }),
      headline: t('auth.verticals.cooperatives.headline', {
        defaultValue: 'One member, one vote, verifiable by all',
      }),
      trustBar: t('auth.verticals.cooperatives.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure general assemblies, board elections and member consultations for your cooperative. Many already trust it for exactly this:',
      }),
    },
    ngos: {
      label: t('auth.verticals.ngos.label', { defaultValue: 'NGOs' }),
      headline: t('auth.verticals.ngos.headline', {
        defaultValue: 'Statutory assemblies with every guarantee',
      }),
      trustBar: t('auth.verticals.ngos.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure statutory assemblies, board elections and member consultations for your organization. Many already trust it for exactly this:',
      }),
    },
    'universities-schools': {
      label: t('auth.verticals.universities_schools.label', { defaultValue: 'Universities and schools' }),
      headline: t('auth.verticals.universities_schools.headline', {
        defaultValue: 'Elections your whole community can verify',
      }),
      trustBar: t('auth.verticals.universities_schools.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure governing body elections, student council votes and community consultations. Many already trust it for exactly this:',
      }),
    },
    'first-nations': {
      label: t('auth.verticals.first_nations.label', { defaultValue: 'First Nations' }),
      headline: t('auth.verticals.first_nations.headline', {
        defaultValue: 'Community decisions every member can verify',
      }),
      trustBar: t('auth.verticals.first_nations.trust_bar', {
        defaultValue:
          'Vocdoni is the platform to run secure community elections, ratification votes and member consultations for your Nation. Many already trust it for exactly this:',
      }),
    },
  }
}
