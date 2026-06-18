Translate or review whether the following German strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (du, dir, dein) throughout. Target DACH German (neutral standard German, suitable for Germany, Austria, and Switzerland). Prefer natural, everyday German words over Latin-derived equivalents unless the Latin form is in common everyday use.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- Product names (keep exactly as in English, do not translate or reorder): **Vocdoni app**, **Vocdoni Petitions**, **Vocdoni Passport**, **Vocdoni SDK**, **Vocdoni Global**, **Vocdoni Association**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established German form when one exists (e.g. Catalonia → Katalonien, Sardinia → Sardinien). Keep the original spelling when there is no common German form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus". When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | German | Notes |
|---|---|---|
| election / voting process | Abstimmung / Abstimmungsprozess | Use consistently — don't mix with "Wahl" |
| census | Teilnehmerliste | Not "Zensus" |
| organization | Organisation | |
| voter | Wähler/Wählerin | Use "Wählende" when gender-neutral form fits |
| voting power / weight | Stimmgewicht | |
| weighted voting | Gewichtete Abstimmung | |
| approval voting | Zustimmungsabstimmung | |
| anonymous voting | Geheime Abstimmung | Prefer the natural German term over the Latin-derived "anonym" | |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| open source | Open Source | Keep in English, capitalized as a German noun — do not translate (not "quelloffen") |
| overwrite vote / correct vote | Stimme ändern / Stimme korrigieren | Prefer "ändern" for buttons, "korrigieren" for descriptions |
| abstain | Enthalten | As in "sich enthalten" |
| census size | Teilnehmerzahl | Avoid "Zensus" | |
| transaction | Transaktion | Latin origin but universally understood in digital contexts — keep | |
| dashboard | Dashboard | Keep in English |
| account | Konto | Not "Account" |
| process | Prozess | In the context of a voting process |
| results | Ergebnisse | |
| cancel (a process) | Abbrechen | For destructive/irreversible actions |
| cancel (a form/dialog) | Abbrechen | Same word, context will clarify |
| pause | Pausieren | |
| end / finish | Beenden | |
| resume | Fortsetzen | |
| sign (cryptographic) | Signieren | Technical term in common use — keep |

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. German uses the same two-form pattern — translate accordingly.

## Numbers & punctuation
- Decimal separator: comma (e.g. "77,12 %").
- Thousands separator: dot (e.g. "6.349", "6.723").
- Percent: a (non-breaking) space before "%" (e.g. "77,12 %", "90 %") - apply it consistently.
- Quotation marks: use German quotes „…" consistently for quoted text inside strings. Do not mix straight ("), curly and guillemets.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
