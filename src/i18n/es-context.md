Translate or review whether the following Spanish strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (tú, te, tu/tus) throughout — this is the standard register for a modern product in Spain and is not read as disrespectful. Target European Spanish (es-ES), neutral and suitable for a general Spanish-speaking audience. Prefer natural, everyday Spanish words over English borrowings unless the English form is universally established in the tech/blockchain domain.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- Product names (keep exactly as in English, do not translate or reorder): **Vocdoni app**, **Vocdoni Petitions**, **Vocdoni Passport**, **Vocdoni SDK**, **Vocdoni Global**, **Vocdoni Association**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established Spanish form when one exists (e.g. Belarus → Bielorrusia, Catalonia → Cataluña). Keep the original spelling when there is no common Spanish form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its Spanish form (Bielorrusia). When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | Spanish | Notes |
|---|---|---|
| election / voting process | elección / proceso de votación | Use consistently — don't drift to a bare "votación" for the process |
| census | censo | The established Spanish electoral term — list of eligible voters |
| organization | organización | |
| voter | votante | Gender-neutral; prefer over "elector/electora" in most contexts |
| voting power / weight | peso del voto | |
| weighted voting | votación ponderada | |
| approval voting | votación por aprobación | |
| anonymous voting | votación anónima | "anonymous"/"anonymity" → "anónimo"/"anonimato" (noun) |
| ballot secrecy / secret vote | secreto del voto | **Distinct concept — do not conflate with anonymity.** English "secret"/"secrecy" → "secreto" ("el voto es completamente secreto", "el secreto del voto"). Anonymity means a vote can't be linked to a voter; secrecy means the ballot content stays hidden. Translate each English term with its matching Spanish term — never use "secreto" for the anonymous-voting feature, nor "anónimo" for ballot secrecy |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | modificar el voto / corregir el voto | Prefer "modificar" for buttons, "corregir" for descriptions |
| abstain | abstenerse / abstención | Use "abstenerse" for actions, "abstención" for the noun form |
| census size | tamaño del censo | Or "número de votantes" |
| transaction | transacción | Universally understood in digital contexts — keep |
| dashboard | panel | The existing translations use "panel"; "Dashboard" is occasionally kept in English in technical contexts |
| account | cuenta | Not "account" |
| password | contraseña | Not "password" |
| settings | ajustes | Or "configuración" |
| download | descargar | |
| spreadsheet | hoja de cálculo | |
| log in / sign in | iniciar sesión | Not "loguearse" or "entrar" |
| log out / sign out | cerrar sesión | |
| process | proceso | In the context of a voting process |
| results | resultados | |
| cancel (a process) | cancelar | For destructive/irreversible actions |
| cancel (a form/dialog) | cancelar | Same word, context will clarify |
| pause | pausar | |
| end / finish | finalizar | |
| resume | reanudar | |
| sign (cryptographic) | firmar | Common in digital contexts — keep |

## Grammatical notes

### Gender agreement
Spanish nouns have grammatical gender. Articles, adjectives, and past participles must agree:
- "el proceso ha sido creado" (masc.) vs "la votación ha sido creada" (fem.)
- Watch for adjectives in UI messages that describe gendered nouns — ensure agreement.

### Informal address (tú)
Use "tú" and its forms consistently:
- Subject/verb: tú ("puedes votar")
- Direct/indirect object: te ("para identificarte")
- Possessives: tu/tus ("tu voto")
- Avoid "usted" and its forms unless a truly formal context is required.

### Punctuation
Spanish uses opening question and exclamation marks: "¿…?" and "¡…!". Ensure both the opening and closing marks are present.

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Spanish uses the same two-form pattern — translate accordingly.

## Numbers & punctuation
- Decimal separator: comma (e.g. "77,12%").
- Thousands separator: dot (e.g. "6.349", "6.723").
- Percent: no space before "%" (e.g. "77,12%", "90%").
- Quotation marks: use the angular guillemets «…» consistently for quoted text inside strings. Do not mix straight ("), curly ("…") and guillemets.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
