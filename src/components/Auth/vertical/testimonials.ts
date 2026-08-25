import { useTranslation } from 'react-i18next'
import type { AuthTestimonial } from './types'

/**
 * Customer quotes shown in the auth showcase panel, tagged with the verticals they speak for.
 *
 * i18n: keys MUST be string literals with a `defaultValue` — `pnpm translations` extracts them by
 * static analysis, so a computed key would ship empty in every locale. Author names are proper
 * nouns and stay hardcoded; roles and organization names are translated, since several have
 * official names per language.
 *
 * The `ceec`, `bellpuig` and `eic` ids (and their default values) predate this module and are
 * already translated into all 10 locales — do not rename or reword them.
 *
 * The other 12 are the organizations' own approved wording, lifted from the marketing site
 * (`vocdoni.io` → `testimonials_marquee.items`) together with its 10 translations. Where the full
 * quote was too long for the panel, whole sentences were dropped — the same ones in every language,
 * never an edit inside a sentence. Reword one here and it silently diverges from 9 locales.
 */
export const useAuthTestimonials = (): AuthTestimonial[] => {
  const { t } = useTranslation()

  return [
    {
      id: 'eic',
      author: 'Oscar Tirvió',
      position: t('testimonials.eic.position', { defaultValue: 'IT Director' }),
      company: t('testimonials.eic.company', { defaultValue: 'Enginyers Industrials de Catalunya' }),
      quote: t('testimonials.eic.text', {
        defaultValue:
          'Vocdoni provides us with an easy, secure, anonymous, scalable voting system that is fully integrated into our institutional environment. We will certainly continue to trust their solution.',
      }),
      verticals: ['professional-associations'],
      logo: 'eic',
      portrait: '/assets/testimonials/eic.png',
      portraitPosition: 'center 15%',
    },
    {
      id: 'coib',
      author: 'Lluís Serrat i Andreu',
      position: t('testimonials.coib.position', { defaultValue: 'Head of projects' }),
      company: t('testimonials.coib.company', { defaultValue: 'Official College of Nurses of Barcelona' }),
      quote: t('testimonials.coib.text', {
        defaultValue:
          'At the Official College of Nurses of Barcelona, we trust Vocdoni for all our participatory processes, ensuring members can exercise their rights from anywhere. We especially value the immediate vote count, the simplicity of the system, and the fast, effective response and guidance from its technical support, which makes the entire process agile, transparent, and reliable.',
      }),
      verticals: ['professional-associations'],
      logo: 'coib',
    },
    {
      id: 'icoes',
      author: 'Víctor Bohórquez',
      position: t('testimonials.icoes.position', { defaultValue: 'President' }),
      company: t('testimonials.icoes.company', { defaultValue: 'Official College of Nursing of Seville' }),
      quote: t('testimonials.icoes.text', {
        defaultValue:
          'Digitizing our voting with Vocdoni has made the entire electoral process more efficient. We have made participation much easier, especially for members who could not travel, while maintaining an agile and reliable system.',
      }),
      verticals: ['professional-associations'],
      logo: 'icoes',
    },
    {
      id: 'ati',
      author: 'Carlo Pestelli',
      position: t('testimonials.ati.position', { defaultValue: 'President' }),
      company: t('testimonials.ati.company', { defaultValue: 'ATI Friuli Venezia Giulia' }),
      quote: t('testimonials.ati.text', {
        defaultValue:
          'As Associazione Termotecnica Italiana, Friuli Venezia Giulia section, we chose to digitize our governance to make it easier for professionals to participate. Vocdoni stood out as the ideal solution for its simplicity, costs, and guarantees.',
      }),
      verticals: ['professional-associations'],
      logo: 'ati',
    },
    {
      id: 'arxivers',
      author: 'Montserrat Clavell',
      position: t('testimonials.arxivers.position', { defaultValue: 'Secretary' }),
      company: t('testimonials.arxivers.company', { defaultValue: "Associació d'Arxivers de Catalunya" }),
      quote: t('testimonials.arxivers.text', {
        defaultValue:
          'Offering members a secure and reliable voting system is essential, especially during a pandemic. Vocdoni gave us an easy-to-use tool that simplified the voting process and boosted participation.',
      }),
      verticals: ['professional-associations', 'associations'],
      logo: 'arxivers',
    },
    {
      id: 'aguicat',
      author: 'Susanna Mendoza',
      position: t('testimonials.aguicat.position', { defaultValue: 'IT Responsible' }),
      company: t('testimonials.aguicat.company', { defaultValue: 'Associació de Guies Habilitats de Catalunya' }),
      quote: t('testimonials.aguicat.text', {
        defaultValue:
          'Setting up the entire voting process and centralizing all the tools for the assembly was easy, intuitive, and clear. Even in a sector that is not very tech-savvy, we got strong participation - people especially valued being able to vote in advance without attending in person.',
      }),
      verticals: ['associations', 'professional-associations'],
      logo: 'aguicat',
    },
    {
      id: 'ceec',
      author: 'Ton Barnils',
      position: t('testimonials.ceec.position', { defaultValue: 'CEO' }),
      company: 'Centre Excursionista de Catalunya',
      quote: t('testimonials.ceec.text', {
        defaultValue:
          'We chose Vocdoni because it guarantees secure, reliable, and transparent participation for all our members in our Annual General Meeting.',
      }),
      verticals: ['associations', 'sports-clubs'],
      logo: 'cec',
      portrait: '/assets/testimonials/ceec.webp',
      portraitPosition: '70% center',
    },
    {
      id: 'omnium',
      author: 'Anna Giralt',
      position: t('testimonials.omnium.position', { defaultValue: 'Executive Manager' }),
      company: 'Òmnium Cultural',
      quote: t('testimonials.omnium.text', {
        defaultValue:
          'At Òmnium Cultural we bet on a secure and verifiable voting system that would allow us to hold our statutory assemblies with all guarantees.',
      }),
      verticals: ['associations', 'ngos'],
      logo: 'omnium',
    },
    {
      id: 'plataforma',
      author: 'Rut Carandell',
      position: t('testimonials.plataforma.position', { defaultValue: 'Director' }),
      company: 'Plataforma per la Llengua',
      quote: t('testimonials.plataforma.text', {
        defaultValue:
          'Vocdoni lets us hold votes with members across all Catalan-speaking territories on equal terms. Instant counting simplifies our assemblies and ensures full transparency.',
      }),
      verticals: ['ngos', 'associations'],
      logo: 'plataforma',
    },
    {
      id: 'bellpuig',
      author: 'Jordi Estiarte',
      position: t('testimonials.bellpuig.position', { defaultValue: 'Mayor' }),
      company: t('testimonials.bellpuig.company', { defaultValue: 'Bellpuig City Council' }),
      quote: t('testimonials.bellpuig.text', {
        defaultValue:
          'We chose Vocdoni because we believe this is the future of what real elections of any kind should be. Electronic voting is open to everyone and makes the voting process easier for citizens.',
      }),
      verticals: ['public-administration'],
      logo: 'bellpuig',
      portrait: '/assets/testimonials/bellpuig.png',
      portraitPosition: 'center 20%',
    },
    {
      id: 'bisbal',
      author: 'Adrià Cortadellas',
      position: t('testimonials.bisbal.position', { defaultValue: 'Civic Participation Officer' }),
      company: t('testimonials.bisbal.company', { defaultValue: "La Bisbal d'Empordà City Council" }),
      quote: t('testimonials.bisbal.text', {
        defaultValue:
          "Vocdoni powered our Bisbalenc/a de l'Any vote, boosting citizen participation and delivering transparency, security, and instant results on blockchain. We valued its security, scalability, universal verifiability, and flexibility.",
      }),
      verticals: ['public-administration'],
      logo: 'bisbal',
    },
    {
      id: 'erc',
      author: 'Kènia Domènech i Àlvarez',
      position: t('testimonials.erc.position', {
        defaultValue: 'National Secretary of Membership, Anti-repressive Struggle and Emotional Well-being',
      }),
      company: 'Esquerra Republicana',
      quote: t('testimonials.erc.text', {
        defaultValue:
          'We have been trusting Vocdoni for years because it offers us a secure, auditable and easy-to-use system that allows us to organise digital votes with all guarantees and adapted to the needs of our organisation.',
      }),
      verticals: ['political-parties'],
      logo: 'erc',
    },
    {
      id: 'granollers',
      author: 'Arnau Bellavista',
      position: t('testimonials.granollers.position', { defaultValue: 'Communications officer' }),
      company: 'Granollers Primàries',
      quote: t('testimonials.granollers.text', {
        defaultValue:
          'At «Granollers Primàries» we understand digital participation as a key tool to expand and facilitate citizen participation. That is why we were looking for a platform that guaranteed neutrality, transparency and the highest security in voting processes. Vocdoni offers all of this, and that is why we chose it for our primaries and plan to continue using it in future consultations.',
      }),
      verticals: ['political-parties'],
      logo: 'granollers',
    },
    {
      id: 'intersindical',
      author: 'Marc Martorell',
      position: t('testimonials.intersindical.position', { defaultValue: 'Spokesperson for the education sector' }),
      company: 'La Intersindical',
      quote: t('testimonials.intersindical.text', {
        defaultValue:
          'At La Intersindical we believe that decisions affecting the entire teaching collective must be made by teachers themselves. That is why we needed a tool that guaranteed a transparent, neutral, and verifiable process. With Vocdoni we were able to bring this decision to nearly 100,000 professionals with the assurance that both the procedure and the result would be fully reliable.',
      }),
      verticals: ['trade-unions'],
      logo: 'intersindical',
    },
    {
      id: 'ustec',
      author: 'Alba Ferran Bagur',
      position: t('testimonials.ustec.position', { defaultValue: 'Member of the national secretariat' }),
      company: 'USTEC·STEs (IAC)',
      quote: t('testimonials.ustec.text', {
        defaultValue:
          'With Vocdoni we found a very good solution, being a neutral and verifiable infrastructure that guaranteed both the integrity of the count and the privacy of voters. This allowed every teacher to vote only once, securely and anonymously.',
      }),
      verticals: ['trade-unions'],
      logo: 'ustec',
    },
  ]
}
