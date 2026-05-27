Review the following German strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (du, dir, dein) throughout. Target DACH German (neutral standard German, suitable for Germany, Austria, and Switzerland). Prefer natural, everyday German words over Latin-derived equivalents unless the Latin form is in common everyday use.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

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

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
