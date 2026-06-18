Review the following Portuguese strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (tu, te, teu/tua) throughout. Target European Portuguese (PT-PT) — not Brazilian Portuguese. Prefer natural, everyday Portuguese words over Latin-derived or bureaucratic equivalents where a simpler option exists.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established Portuguese form when one exists (e.g. Belarus → Bielorrússia, Catalonia → Catalunha). Keep the original spelling when there is no common Portuguese form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its Portuguese form (Bielorrússia). When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | Portuguese (PT-PT) | Notes |
|---|---|---|
| election / voting process | votação / processo de votação | Use consistently — avoid "eleição", which implies a formal political election |
| census | lista de participantes | Avoid "censo" — it sounds bureaucratic and implies population data |
| organization | organização | |
| voter | votante | Gender-neutral; prefer over "eleitor/eleitora" in most contexts |
| voting power / weight | peso de voto | |
| weighted voting | votação ponderada | |
| approval voting | votação de aprovação | |
| anonymous voting | votação anónima | Note PT-PT spelling: "anónima", not "anônima" (Brazilian) |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | alterar voto / corrigir voto | Prefer "alterar" for buttons, "corrigir" for descriptions |
| abstain | abster-se / abstenção | Use "abster-se" for actions, "abstenção" for the noun form |
| census size | número de participantes | Avoid "tamanho do censo" |
| transaction | transação | Universally understood in digital contexts — keep |
| dashboard | Dashboard | Keep in English |
| account | conta | Not "account" |
| password | palavra-passe | PT-PT standard — not "senha" (Brazilian) or "password" |
| settings | definições | PT-PT standard — not "configurações" (Brazilian) |
| download | transferir | PT-PT standard — not "baixar" or "descarregar" |
| spreadsheet | folha de cálculo | PT-PT standard — not "planilha" (Brazilian) |
| log in / sign in | iniciar sessão | PT-PT standard — not "entrar" or "fazer login" |
| log out / sign out | terminar sessão | PT-PT standard — not "sair" |
| process | processo | In the context of a voting process |
| results | resultados | |
| cancel (a process) | cancelar | For destructive/irreversible actions |
| cancel (a form/dialog) | cancelar | Same word, context will clarify |
| pause | pausar | |
| end / finish | terminar / concluir | Use "terminar" for actions, "concluir" when the process reaches completion |
| resume | retomar | |
| sign (cryptographic) | assinar | Common in digital contexts — keep |

## Grammatical notes

### Gender agreement
Portuguese nouns have grammatical gender. Adjectives, articles, and past participles must agree:
- "o processo foi criado" (masc.) vs "a votação foi criada" (fem.)
- Watch for adjectives in UI messages that describe gendered nouns — ensure agreement.

### Preposition contractions
Portuguese contracts prepositions with articles and pronouns — these are mandatory, not optional:
- de + o/a → do/da, de + os/as → dos/das
- em + o/a → no/na, em + os/as → nos/nas
- a + o/a → ao/à, a + os/as → aos/às
- Contractions with "este/esse/aquele" also apply: deste, nesse, àquele, etc.
- Do not leave uncontracted forms (e.g. "de o" is incorrect).

### Informal address (tu)
Use "tu" and its forms consistently:
- Subject: tu ("podes votar")
- Direct object: te ("para te identificar")
- Possessives: teu/tua/teus/tuas ("o teu voto")
- Avoid "você" (formal) and "vocês" unless a truly formal context is required.

## Pluralization keys
Keys ending in `_one`, `_many`, and `_other` map to Portuguese CLDR plural rules:
- `_one` → exactly 1 (e.g. "1 votação")
- `_many` → not used in pt (do not leave empty — use `_other` value as fallback)
- `_other` → all other quantities (0, 2, 3, …)

## Spelling — PT-PT orthography
Follow the 1990 Orthographic Agreement as ratified in Portugal:
- Use accents where required: "anónimo", "óptimo" → "ótimo" (silent consonants removed), "facto" → "facto" (retained in PT-PT where pronunciation supports it)
- Use "contacto" (not "contato") — the silent consonant is standard in PT-PT
- Use "direcção" → "direção" (updated spelling)
- Use "acção" → "ação" (updated spelling)
- When in doubt, prefer the PT-PT European variant over the Brazilian spelling.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
