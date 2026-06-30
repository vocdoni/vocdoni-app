Translate or review whether the following Greek strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use formal/polite plural address (εσείς / second-person plural verb forms, σας) throughout — this is the register used consistently in the existing translations (e.g. "ο κωδικός πρόσβασής σας", "Επιλέξτε", "Μπορείτε"). Target standard Modern Greek (Δημοτική), suitable for a general Greek-speaking audience. Prefer natural, everyday Greek words over English borrowings unless the English form is universally established in the tech/blockchain domain.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- Product names (keep exactly as in English, do not translate or reorder): **Vocdoni app**, **Vocdoni Petitions**, **Vocdoni Passport**, **Vocdoni SDK**, **Vocdoni Global**, **Vocdoni Association**
- `\n` newline sequences — keep as-is

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established Greek form when one exists (e.g. Belarus → Λευκορωσία, Catalonia → Καταλονία). Keep the original spelling when there is no common Greek form (e.g. small towns such as Bellpuig).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its Greek form (Λευκορωσία). When unsure whether a name is a place or a brand, keep it in its original form.

## Key domain terminology

| English | Greek | Notes |
|---|---|---|
| election / voting process | εκλογή / διαδικασία ψηφοφορίας | Use consistently |
| census | μητρώο (μελών) / κατάλογος ψηφοφόρων | The existing translations use "μητρώο μελών" and "κατάλογος ψηφοφόρων". Not "απογραφή" (that means a population census and is confusing here) |
| organization | οργανισμός | |
| voter | ψηφοφόρος | |
| voting power / weight | βαρύτητα ψήφου | |
| weighted voting | σταθμισμένη ψηφοφορία | **Distinct method — do not conflate with quadratic voting.** "σταθμισμένη" means weighted only |
| quadratic voting | τετραγωνική ψηφοφορία | A different method from weighted voting — never translate "quadratic" as "σταθμισμένη". You may keep "(Quadratic)" alongside it for clarity |
| approval voting | ψηφοφορία έγκρισης | |
| ranked voting | κατατακτική ψηφοφορία | Be consistent — do not also call it "προτιμησιακή ψηφοφορία" elsewhere |
| branding | επωνυμία | Use "επωνυμία" consistently. Avoid the colloquial "ταυτότητα μάρκας" |
| authentication | ταυτοποίηση | Use "ταυτοποίηση" (or "έλεγχος ταυτότητας") consistently. Avoid mixing in "αυθεντικοποίηση" or "πιστοποίηση" (the latter means certification) |
| anonymous voting | ανώνυμη ψηφοφορία | "anonymous"/"anonymity" → "ανώνυμη"/"ανωνυμία" |
| ballot secrecy / secret vote | μυστικότητα (της ψήφου) | **Distinct concept — do not conflate with anonymity.** English "secret"/"secrecy" → "μυστική"/"μυστικότητα". Anonymity means a vote can't be linked to a voter; secrecy means the ballot content stays hidden. Translate each English term with its matching Greek term — never use "μυστική" for the anonymous-voting feature, nor "ανώνυμη" for ballot secrecy |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| open source | ανοιχτού κώδικα | Translate to "ανοιχτού κώδικα" (idiomatic Greek). Use one spelling consistently: the everyday "ανοιχτ-" form (not "ανοικτ-"). Do not leave it in English |
| overwrite vote / correct vote | τροποποίηση ψήφου / διόρθωση ψήφου | Prefer "τροποποίηση" for buttons, "διόρθωση" for descriptions |
| abstain | αποχή | Use "απέχω" for the verb, "αποχή" for the noun |
| census size | αριθμός ψηφοφόρων | |
| transaction | συναλλαγή | Universally understood in digital contexts — keep |
| dashboard | Πίνακας (ελέγχου) | The existing translations use "Πίνακας"; "dashboard" is occasionally kept in English |
| account | λογαριασμός | |
| password | κωδικός πρόσβασης | |
| settings | ρυθμίσεις | |
| download | λήψη | |
| spreadsheet | υπολογιστικό φύλλο | |
| log in / sign in | σύνδεση | |
| log out / sign out | αποσύνδεση | |
| process | διαδικασία | In the context of a voting process |
| results | αποτελέσματα | |
| cancel (a process) | ακύρωση | For destructive/irreversible actions |
| cancel (a form/dialog) | ακύρωση | Same word, context will clarify |
| pause | παύση | |
| end / finish | ολοκλήρωση / λήξη | Use "ολοκλήρωση" for finishing an action, "λήξη" when a process reaches its end |
| resume | συνέχιση | |
| sign (cryptographic) | υπογραφή | Common in digital contexts — keep |

## Grammatical notes

### Gender and case agreement
Greek nouns have grammatical gender (masculine, feminine, neuter) and decline by case. Articles, adjectives, and participles must agree in gender, number, and case:
- "ο οργανισμός" (masc.) / "η ψηφοφορία" (fem.) / "το αποτέλεσμα" (neut.)
- Watch for adjectives and articles in UI messages that describe nouns — ensure agreement in both gender and case.

### Accents (τόνοι)
Modern Greek is monotonic — every multisyllabic word carries exactly one acute accent (τόνος) on the stressed syllable: "ψηφοφορία", "οργανισμός", "αποτελέσματα". Do not omit it and do not use polytonic diacritics.

### Final sigma
Use the final form "ς" only at the end of a word; use "σ" elsewhere ("ψήφος", "συναλλαγής").

### Formal/polite address
Use the formal plural ("πληθυντικός ευγενείας") consistently — this is what the existing translations use:
- Second-person plural verbs ("μπορείτε να ψηφίσετε", "Επιλέξτε", "Εισαγάγετε")
- Weak pronoun "σας" for possession ("η ψήφος σας", "ο κωδικός πρόσβασής σας")
- Do not switch to the informal singular "εσύ / σου" forms.

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Greek uses the same two-form pattern — translate accordingly.

## Numbers & punctuation
- Decimal separator: comma (e.g. "77,12%").
- Thousands separator: dot (e.g. "6.349", "6.723").
- Percent: no space before "%" (e.g. "77,12%", "90%").
- Quotation marks: use Greek guillemets «…» consistently for quoted text inside strings. Do not mix straight ("), curly and guillemets.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
