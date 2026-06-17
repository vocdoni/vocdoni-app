Review the following Catalan strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (tu, et, el teu/la teva) throughout — this is the standard register for a modern product and is not read as disrespectful. Target standard Central Catalan, suitable for a general Catalan-speaking audience. Prefer natural, everyday Catalan words over English or Castilian borrowings unless the foreign form is universally established in the tech/blockchain domain.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

## Key domain terminology

| English | Catalan | Notes |
|---|---|---|
| election / voting process | elecció / procés de votació | Use consistently — don't drift to a bare "votació" for the process |
| census | cens | The established Catalan electoral term — list of eligible voters |
| organization | organització | |
| voter | votant | Gender-neutral; prefer over "elector/electora" in most contexts |
| voting power / weight | pes del vot | |
| weighted voting | votació ponderada | |
| approval voting | votació per aprovació | |
| anonymous voting | votació anònima | "anonymous"/"anonymity" → "anònim"/"anonimat" (noun) |
| ballot secrecy / secret vote | secret del vot | **Distinct concept — do not conflate with anonymity.** English "secret"/"secrecy" → "secret" ("el vot és completament secret", "el secret del vot"). Anonymity means a vote can't be linked to a voter; secrecy means the ballot content stays hidden. Translate each English term with its matching Catalan term — never use "secret" for the anonymous-voting feature, nor "anònim" for ballot secrecy |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | modificar el vot / corregir el vot | Prefer "modificar" for buttons, "corregir" for descriptions |
| abstain | abstenir-se / abstenció | Use "abstenir-se" for actions, "abstenció" for the noun form |
| census size | mida del cens | Or "nombre de votants" |
| transaction | transacció | Universally understood in digital contexts — keep |
| dashboard | tauler / panell | The existing translations mix "tauler", "panell" and "Dashboard"; prefer "tauler" and keep it consistent |
| account | compte | The user account |
| password | contrasenya | Not "password" |
| settings | configuració | Or "paràmetres" |
| download | baixar | Or "descarregar" |
| spreadsheet | full de càlcul | |
| log in / sign in | iniciar sessió | Not "entrar" |
| log out / sign out | tancar sessió | |
| process | procés | In the context of a voting process |
| results | resultats | |
| cancel (a process) | cancel·lar | Note the "l·l" (ela geminada). For destructive/irreversible actions |
| cancel (a form/dialog) | cancel·lar | Same word, context will clarify |
| pause | pausar | |
| end / finish | finalitzar | |
| resume | reprendre | |
| sign (cryptographic) | signar | Common in digital contexts — keep |

## Grammatical notes

### Gender agreement
Catalan nouns have grammatical gender. Articles, adjectives, and past participles must agree:
- "el procés s'ha creat" (masc.) vs "la votació s'ha creat" (fem.)
- Watch for adjectives in UI messages that describe gendered nouns — ensure agreement.

### Apostrophe and contractions
Catalan elides articles and prepositions before vowels — these are mandatory:
- el/la + vowel → l' ("l'organització", "l'elecció")
- de + el → del, de + els → dels; a + el → al, a + els → als
- "de" → "d'" before a vowel ("d'aquest procés")
- Do not leave unelided forms (e.g. "de el" or "la elecció" are incorrect).

### Special characters
- Use the ela geminada "l·l" (with the middle dot) where required: "cancel·lar", "instal·lar", "cèl·lula".
- Use accents and the dièresi correctly ("què", "perquè", "veïns").

### Informal address (tu)
Use "tu" and its forms consistently:
- Subject/verb: tu ("pots votar")
- Weak object pronouns: et/t' ("per identificar-te")
- Possessives: el teu / la teva / els teus / les teves ("el teu vot")
- Avoid "vostè" and its forms unless a truly formal context is required.

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Catalan uses the same two-form pattern — translate accordingly.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
