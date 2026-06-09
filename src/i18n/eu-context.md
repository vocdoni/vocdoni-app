Review the following Basque strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use informal address (hi, zuri, zure) throughout. Target standard Basque (Batua), the unified literary and standard form suitable across all Basque-speaking regions.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

## Key domain terminology

| English | Basque | Notes |
|---|---|---|
| election / voting process | hauteskunde / boto-ematearen prozesua | Use consistently |
| census | erroldea | Not "zentsua" |
| organization | erakundea | |
| voter | botogilea | |
| voting power / weight | boto-pisua | |
| weighted voting | ponderatutako botazioa | |
| approval voting | onarpenzko botazioa | |
| anonymous voting | boto sekretua | Prefer the natural Basque term |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | botoa aldatu / botoa zuzendu | Prefer "aldatu" for buttons, "zuzendu" for descriptions |
| abstain | abstenitu | |
| census size | erroldeko tamaina | |
| transaction | transakzioa | Technical term in common use — keep |
| dashboard | Dashboard | Keep in English |
| account | kontua | |
| process | prozesua | In the context of a voting process |
| results | emaitzak | |
| cancel (a process) | bertan behera utzi | For destructive/irreversible actions |
| cancel (a form/dialog) | utzi | |
| pause | pausatu | |
| end / finish | amaitu | |
| resume | berrekin | |
| sign (cryptographic) | sinatu | Technical term in common use — keep |

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Basque uses the same two-form pattern — translate accordingly.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
