Review the following French strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Target standard metropolitan French (neutral, suitable for France and other Francophone audiences). Prefer natural everyday French words over English borrowings unless the English form is universally established in the tech/blockchain domain.

Address the user with formal **vous / votre** throughout — in French this is the neutral, standard register for a serious product and is *not* read as overly polite (do not use **tu**). The goal is to sound serious and respectful without being obsequious: avoid deferential filler such as "Veuillez bien vouloir…", "Nous vous prions de…", or "Merci de votre compréhension". Prefer direct imperatives ("Sélectionnez…", "Saisissez votre adresse", "Confirmez votre vote") and concise wording over wordy courtesy formulas.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established French form when one exists (e.g. Belarus → Biélorussie, Catalonia → Catalogne). Keep the original spelling when there is no common French form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its French form (Biélorussie). When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | French | Notes |
|---|---|---|
| election / voting process | élection / processus de vote | Use these consistently; don't drift to "scrutin" or a bare "vote" for the process |
| census | liste électorale | The established French electoral term — equivalent of Spanish "censo" / Catalan "cens". Not "recensement" (that means a population census and is confusing here) |
| organization | organisation | |
| voter | électeur / électrice | Use "les électeurs" as the generic plural; add "(trices)" only in formal written contexts |
| voting power / weight | poids de vote | |
| weighted voting | vote pondéré | |
| approval voting | vote par approbation | |
| anonymous voting | vote anonyme | Prefer "vote anonyme" over "vote secret" for accuracy |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| overwrite vote / correct vote | modifier son vote / corriger son vote | Prefer "modifier" for buttons, "corriger" for descriptions |
| abstain | s'abstenir | |
| census size | nombre d'inscrits | Or "nombre d'électeurs". Avoid "taille du recensement" and "taille de la liste" |
| transaction | transaction | Universally understood in digital contexts — keep |
| dashboard | Dashboard | Keep in English |
| account | compte | Not "account" |
| process | processus | In the context of a voting process |
| results | résultats | |
| cancel (a process) | annuler | For destructive/irreversible actions |
| cancel (a form/dialog) | annuler | Same word, context will clarify |
| pause | mettre en pause | |
| end / finish | terminer | |
| resume | reprendre | |
| sign (cryptographic) | signer | Technical term in common use — keep |

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. French uses the same two-form pattern — translate accordingly. Note that French treats 0 as plural (`_other`), unlike some languages.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
