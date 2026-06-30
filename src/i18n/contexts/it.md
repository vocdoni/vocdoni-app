Translate or review whether the following Italian strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (tu, ti, tuo/tua) throughout — this is the standard register for a modern product and is not read as disrespectful. Target standard Italian, neutral and suitable for a general Italian-speaking audience. Prefer natural, everyday Italian words over English borrowings unless the English form is universally established in the tech/blockchain domain.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- Product names (keep exactly as in English, do not translate or reorder): **Vocdoni app**, **Vocdoni Petitions**, **Vocdoni Passport**, **Vocdoni SDK**, **Vocdoni Global**, **Vocdoni Association**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established Italian form when one exists (e.g. Belarus → Bielorussia, Catalonia → Catalogna). Keep the original spelling when there is no common Italian form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its Italian form (Bielorussia). When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | Italian | Notes |
|---|---|---|
| election / voting process | elezione / processo di voto | Use consistently — don't drift to a bare "votazione" for the process |
| census | censimento | This is the term used consistently throughout the existing translations ("Non sei nel censimento", "Cerca nel censimento…"). Keep "censimento" — do not switch to "lista elettorale" |
| organization | organizzazione | |
| voter | votante | Gender-neutral; prefer over "elettore/elettrice" in most contexts |
| voting power / weight | peso del voto | |
| weighted voting | voto ponderato | |
| approval voting | voto per approvazione | |
| anonymous voting | voto anonimo | "anonymous"/"anonymity" → "anonimo"/"anonimato" (noun) |
| ballot secrecy / secret vote | segretezza del voto | **Distinct concept — do not conflate with anonymity.** English "secret"/"secrecy" → "segreto"/"segretezza" ("il voto è completamente segreto", "la segretezza del voto"). Anonymity means a vote can't be linked to a voter; secrecy means the ballot content stays hidden. Translate each English term with its matching Italian term — never use "segreto" for the anonymous-voting feature, nor "anonimo" for ballot secrecy |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| open source | Open Source | Keep in English — do not translate |
| overwrite vote / correct vote | modificare il voto / correggere il voto | Prefer "modificare" for buttons, "correggere" for descriptions |
| abstain | astenersi / astensione | Use "astenersi" for actions, "astensione" for the noun form |
| census size | dimensione del censimento | Or "numero di votanti" |
| transaction | transazione | Universally understood in digital contexts — keep |
| dashboard | Dashboard | Often kept in English in the existing translations; "pannello" also appears |
| account | account | Commonly kept in English in Italian UIs |
| password | password | Kept in English |
| settings | configurazione / impostazioni | Both appear in the existing translations; keep consistent within a feature |
| download | scaricare | |
| spreadsheet | foglio di calcolo | |
| log in / sign in | accedi / accesso | Not "loggarsi" |
| log out / sign out | esci | "logout" is occasionally kept in English |
| process | processo | In the context of a voting process |
| results | risultati | |
| cancel (a process) | annullare | For destructive/irreversible actions |
| cancel (a form/dialog) | annullare | Same word, context will clarify |
| pause | mettere in pausa | |
| end / finish | terminare | |
| resume | riprendere | |
| sign (cryptographic) | firmare | Common in digital contexts — keep |

## Grammatical notes

### Gender agreement
Italian nouns have grammatical gender. Articles, adjectives, and past participles must agree:
- "il processo è stato creato" (masc.) vs "la votazione è stata creata" (fem.)
- Watch for adjectives in UI messages that describe gendered nouns — ensure agreement.

### Articles and elision
- Choose the correct article form: il/lo/l' and i/gli; un/uno; la/l' and le.
- Elide before vowels where required ("l'organizzazione", "l'elezione").
- Articulated prepositions are mandatory: di + il → del, a + il → al, in + il → nel, da + il → dal, etc.

### Informal address (tu)
Use "tu" and its forms consistently:
- Subject/verb: tu ("puoi votare")
- Object pronouns: ti ("per identificarti")
- Possessives: tuo/tua/tuoi/tue ("il tuo voto")
- Avoid the courtesy "Lei" form unless a truly formal context is required.

### Accents
Use the correct grave/acute accents on final stressed vowels: "è" (verb) vs "e" (and), "perché", "città", "potrà".

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Italian uses the same two-form pattern — translate accordingly.

## Numbers & punctuation
- Decimal separator: comma (e.g. "77,12%").
- Thousands separator: dot (e.g. "6.349", "6.723").
- Percent: no space before "%" (e.g. "77,12%", "90%").
- Quotation marks: use guillemets «…» for quoted text inside strings (e.g. «voto segreto»). Do not use curly "…", straight (") or escaped quotes for quoting. The apostrophe ’ for elision (e.g. "dell’organizzazione") is correct and must stay.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
