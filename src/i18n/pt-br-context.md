Review that the following Brazilian Portuguese strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use "você" (third-person conjugation) as the standard form of address throughout — this is the default register in Brazilian Portuguese and appropriate for both formal and informal contexts. Target Brazilian Portuguese (pt-BR) — prefer Brazilian spelling, vocabulary, and idiomatic expressions over European Portuguese.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: any tag of the form `<name>`/`</name>` (e.g. `<span>`, `<bold>`, `<strong>`, `<a>`, `<dlink>`, `<click>`, `<link1>`, `<termsLink>`, `<privacyLink>`, `<verify>`, `<time>`, `<price>`) or `<0>`/`<1>`/`<2>`/… numbered placeholders, together with their closing counterparts — never translate, reorder, or alter them; keep the structure intact and only translate the text between them
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

## Key domain terminology

| English | Brazilian Portuguese | Notes |
|---|---|---|
| election / voting process | eleição / processo de votação | Use consistently — don't mix the two |
| census | lista de participantes | Not "censo" |
| organization | organização | |
| voter | eleitor / eleitora | Use "eleitor(a)" when gender-neutral form fits |
| voting power / weight | peso do voto | |
| weighted voting | votação ponderada | |
| approval voting | votação por aprovação | |
| anonymous voting | votação anônima | Prefer the natural Brazilian term — note "anônimo" (not "anónimo" as in pt-PT) |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | alterar voto / corrigir voto | Prefer "alterar" for buttons, "corrigir" for descriptions |
| abstain | abster-se | |
| census size | número de participantes | Avoid "tamanho do censo" |
| transaction | transação | Latin origin but universally understood in digital contexts — keep |
| dashboard | painel | Prefer the Portuguese word; "dashboard" may be kept in very technical contexts |
| account | conta | Not "account" |
| process | processo | In the context of a voting process |
| results | resultados | |
| cancel (a process) | cancelar | For destructive/irreversible actions |
| cancel (a form/dialog) | cancelar | Same word, context will clarify |
| pause | pausar | |
| end / finish | encerrar | |
| resume | retomar | |
| sign (cryptographic) | assinar | Technical term in common use — keep |

## Spelling notes (Brazilian vs. European Portuguese)
- Use Brazilian spelling throughout: "você" (not "vós"), "anônimo" (not "anónimo"), "econômico" (not "económico"), "registro"/"registrar" (not "registo"/"registar") — watch the circumflex/acute accent differences typical of Brazilian Portuguese.
- Avoid European Portuguese forms like "ecrã" (use "tela"), "senha" vs "palavra-passe" (use "senha"), "telemóvel" (use "celular").

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Brazilian Portuguese uses the same two-form pattern — translate accordingly.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
