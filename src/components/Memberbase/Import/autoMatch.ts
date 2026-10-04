import { MEMBER_FIELD_IDS, type MemberFieldId } from '../fields'

/** What a file column becomes: a member field, extra info kept in `other`, or nothing. */
export type ColumnTarget = MemberFieldId | 'extra' | 'skip'

/** How a column was matched: by our dictionary, or left for the admin */
export type MatchResult = {
  targets: ColumnTarget[]
  /** Columns matched to a member field */
  matched: number
  /** Every header is one of the template's, as the template names them */
  isTemplate: boolean
}

/**
 * A header reduced to what matters: no accents, case or punctuation. "Núm. soci" and "num soci"
 * meet at "num soci"; "col·legiat" and "collegiat" at "collegiat".
 */
export const normaliseHeader = (header: string) =>
  header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[·•]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

const compact = (header: string) => normaliseHeader(header).replace(/ /g, '')

/**
 * What people call each field in their spreadsheets. EN, ES and CA are covered in depth; FR, IT, PT,
 * DE, EU and EL as far as we know them. The app's own field labels in every language are here too,
 * so a template downloaded in any language comes back matched.
 */
export const HEADER_SYNONYMS: Record<MemberFieldId, string[]> = {
  name: [
    'name',
    'first name',
    'given name',
    'forename',
    'nom',
    'nombre',
    'nom de pila',
    'nombre de pila',
    'nom i cognoms',
    'nombre y apellidos',
    'nom complet',
    'nombre completo',
    'full name',
    'prenom',
    'nome',
    'nome proprio',
    'nome completo',
    'vorname',
    'izena',
    'όνομα',
  ],
  surname: [
    'surname',
    'surnames',
    'last name',
    'family name',
    'cognom',
    'cognoms',
    'apellido',
    'apellidos',
    'primer apellido',
    'nom de famille',
    'cognome',
    'apelido',
    'apelidos',
    'sobrenome',
    'nachname',
    'abizena',
    'abizenak',
    'επώνυμο',
  ],
  email: [
    'email',
    'e-mail',
    'mail',
    'email address',
    'correu',
    'correu electronic',
    'correo',
    'correo electronico',
    'courriel',
    'adresse e-mail',
    'posta elettronica',
    'endereco de email',
    'posta elektronikoa',
    'emaila',
  ],
  phone: [
    'phone',
    'phone number',
    'mobile',
    'mobile phone',
    'mobile number',
    'cell phone',
    'mobil',
    'mòbil',
    'movil',
    'móvil',
    'telèfon',
    'telèfon mòbil',
    'teléfono',
    'teléfono móvil',
    'telefono',
    'celular',
    'téléphone',
    'portable',
    'cellulare',
    'telemóvel',
    'telefone',
    'telefon',
    'handy',
    'telefonoa',
    'mugikorra',
    'τηλέφωνο',
  ],
  memberNumber: [
    'member number',
    'member no',
    'member id',
    'membership',
    'membership number',
    'núm. soci',
    'número de soci',
    'nº soci',
    'num soci',
    'soci',
    'id soci',
    'socio',
    'número de socio',
    'nº socio',
    'id socio',
    'nº colegiado',
    'colegiado',
    'número de colegiado',
    'col·legiat',
    'número de col·legiat',
    'nº col·legiat',
    'número de miembro',
    "numéro d'adhérent",
    'numero socio',
    'número de sócio',
    'número de membro',
    'mitgliedsnummer',
    'kide-zenbakia',
    'bazkide zenbakia',
    'αριθμός μέλους',
  ],
  nationalId: [
    'dni',
    'nie',
    'nif',
    'dni/nie',
    'dni nif',
    'document',
    'documento',
    "document d'identitat",
    'documento de identidad',
    'national id',
    'id number',
    'passport',
    'passaport',
    'pasaporte',
    "pièce d'identité",
    "carte d'identité",
    'id nazionale',
    'codice fiscale',
    'cartão de cidadão',
    'cpf/rg',
    'cpf',
    'ausweisnummer',
    'nan/aiz',
    'nan',
    'αριθμός ταυτότητας',
  ],
  birthDate: [
    'birth date',
    'birthdate',
    'date of birth',
    'dob',
    'birthday',
    'data de naixement',
    'naixement',
    'fecha de nacimiento',
    'fecha nacimiento',
    'nacimiento',
    'date de naissance',
    'data di nascita',
    'data de nascimento',
    'geburtsdatum',
    'jaioteguna',
    'ημερομηνία γέννησης',
  ],
  weight: [
    'weight',
    'voting power',
    'voting power (weight)',
    'votes',
    'pes',
    'peso',
    'vots',
    'votos',
    'poder de votació (pes)',
    'poder de voto (peso)',
    'stimmgewicht',
    'poids du vote',
    'peso del voto',
    'boto-pisua (pisua)',
    'δύναμη ψήφου (βάρος)',
  ],
}

// Too generic to match inside a longer header: "Nom del pare" isn't the member's name
const EXACT_ONLY = new Set([
  'name',
  'nom',
  'nome',
  'mail',
  'soci',
  'socio',
  'membership',
  'document',
  'documento',
  'pes',
  'peso',
  'votes',
  'vots',
  'votos',
  'nan',
  'nie',
  'nif',
  'cpf',
])

const EXACT = new Map<string, MemberFieldId>()
const CONTAINED: { phrase: string; field: MemberFieldId }[] = []
for (const field of MEMBER_FIELD_IDS) {
  for (const synonym of HEADER_SYNONYMS[field]) {
    if (!EXACT.has(compact(synonym))) EXACT.set(compact(synonym), field)
    const phrase = normaliseHeader(synonym)
    if (!EXACT_ONLY.has(phrase)) CONTAINED.push({ phrase, field })
  }
}
// Longest first, so "correu electronic" wins over a shorter phrase inside it
CONTAINED.sort((a, b) => b.phrase.length - a.phrase.length)

const containedField = (header: string) => {
  const padded = ` ${normaliseHeader(header)} `
  return CONTAINED.find(({ phrase }) => padded.includes(` ${phrase} `))?.field
}

/** Whether a header is one we'd match to a member field: tells the header row from a title above it. */
export const isKnownHeader = (header: string) => EXACT.has(compact(header)) || Boolean(containedField(header))

/**
 * Matches each file column to a member field: first by the field labels of the language the app is
 * in (so a French "Nom" is a surname), then by an exact synonym, then by a synonym inside a longer
 * header ("Teléfono móvil personal"). Each field takes one column; the rest are left out.
 */
export const autoMatch = (headers: string[], labels: Partial<Record<MemberFieldId, string>> = {}): MatchResult => {
  const targets: ColumnTarget[] = headers.map(() => 'skip')
  const taken = new Set<MemberFieldId>()
  const assign = (index: number, field?: MemberFieldId) => {
    if (!field || taken.has(field) || targets[index] !== 'skip') return
    targets[index] = field
    taken.add(field)
  }

  const byLabel = new Map(
    (Object.entries(labels) as [MemberFieldId, string][]).map(([field, label]) => [compact(label), field])
  )
  headers.forEach((header, index) => assign(index, byLabel.get(compact(header))))
  // French files name the first name "Prénom" and the surname "Nom", which elsewhere is the first name
  const hasPrenom = headers.some((header) => compact(header) === 'prenom')
  headers.forEach((header, index) => {
    const key = compact(header)
    assign(index, hasPrenom && key === 'nom' ? 'surname' : EXACT.get(key))
  })
  headers.forEach((header, index) => assign(index, containedField(header)))

  const matched = targets.filter((target) => target !== 'skip').length
  const isTemplate =
    headers.length > 0 &&
    headers.every((header, index) => {
      const target = targets[index]
      return target !== 'skip' && target !== 'extra' && byLabel.get(compact(header)) === target
    })

  return { targets, matched, isTemplate }
}

const SENSITIVE_WORDS = [
  'iban',
  'compte',
  'cuenta',
  'bank',
  'banc',
  'banco',
  'salut',
  'salud',
  'health',
  'sante',
  'observacions',
  'observaciones',
  'observations',
  'notes',
  'notas',
  'religion',
  'religio',
  'afiliacio',
  'afiliacion',
  'sindicat',
  'sindicato',
  'discapacitat',
  'discapacidad',
  'diagnostic',
  'diagnostico',
  'alergia',
  'allergia',
]

/** Headers that suggest health, money, beliefs or free notes: kept only knowingly. */
export const isSensitiveHeader = (header: string) =>
  normaliseHeader(header)
    .split(' ')
    .some((word) => SENSITIVE_WORDS.some((sensitive) => word.startsWith(sensitive)))
