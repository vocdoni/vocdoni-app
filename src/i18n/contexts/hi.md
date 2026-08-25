Translate or review whether the following Hindi strings are correctly translated for the Vocdoni app, a decentralized digital voting platform that lets organizations run transparent, verifiable online elections.

Tone: professional yet approachable. Strings are user-facing UI text (buttons, labels, descriptions, error messages). Be clear and concise — prefer shorter phrasing where natural. Use the formal-neutral address आप throughout, with imperatives in the -एँ form ("चुनें", "डालें", "जारी रखें") — never तुम/तू or the -ओ imperative ("करो"). Target standard Modern Standard Hindi as written for Indian professionals, in the register that Stripe, Amazon and Meta ship to that audience: everyday Hindi syntax, not officialese. Avoid over-Sanskritised administrative vocabulary (the सूचना प्रौद्योगिकी register) and avoid literal calques of English word order. Hindi is written in Devanagari, but the technical vocabulary this audience reads in Latin every day stays in Latin — see below.

## Never translate or modify
- Interpolation placeholders: `{{ variable }}` and `{{variable}}` — copy them exactly, including spacing
- React i18next component tags: `<1>`, `<span>`, `<text>`, `<a>`, `<dlink>` and their closing counterparts — keep structure intact
- Brand name: **Vocdoni**
- Token name: **VOC**
- Product names (keep exactly as in English, do not translate or reorder): **Vocdoni app**, **Vocdoni Petitions**, **Vocdoni Passport**, **Vocdoni SDK**, **Vocdoni Global**, **Vocdoni Association**
- `\n` newline sequences — keep as-is
- Technical vocabulary that stays in Latin script, uncapitalized changes and all: **blockchain**, **API**, **SDK**, **GDPR**, **2FA**, **SaaS**, **CSV**, **URL**, **open source**, **end-to-end**, **Explorer**. Do not transliterate these into Devanagari and do not translate them.

## Place & proper names
- Translate geographic place names (countries, regions, cities) to their established Devanagari form when one exists (e.g. Belarus → बेलारूस, Catalonia → कातालोनिया, Barcelona → बार्सिलोना). Keep the original Latin spelling when there is no settled Hindi form (e.g. small towns such as Bellpuig, Granollers).
- Do NOT translate organization, movement, or brand names, even when they contain a place name: the movement "New Belarus" stays "New Belarus", while the country Belarus takes its Devanagari form (बेलारूस). When unsure whether a name is a place or a brand, keep it in its original form.
- Person names stay in Latin script.

## Key domain terminology

| English | Hindi | Notes |
|---|---|---|
| election | चुनाव | |
| voting process | मतदान प्रक्रिया | The process as a described thing — not "वोटिंग प्रक्रिया" |
| vote (noun) | वोट | |
| cast a vote | वोट डालना | Not "वोट देना" for the act of casting in the app flow |
| voting (as a product label) | वोटिंग | **See "Naming vs describing" below.** Only in product labels and loan-modified compounds: "ऑनलाइन वोटिंग", "ई-वोटिंग", "वोटिंग प्लेटफ़ॉर्म". Never as a verb, and never as the object of "कराना" |
| census | मतदाता सूची | The list of eligible voters. **Not "जनगणना"** — that means a population census and is badly misleading here |
| census size | मतदाता सूची का आकार | Or "मतदाताओं की संख्या" |
| organization | संगठन | |
| voter | मतदाता | Invariant in the plural; oblique plural is "मतदाताओं" |
| eligible voters | पात्र मतदाता | |
| member | सदस्य | Invariant in the plural; oblique plural is "सदस्यों" |
| memberbase | Memberbase / सदस्य वर्ग | Keep **Memberbase** in Latin where the English capitalizes it as the feature name ("Memberbase Management"). Where English uses it generically ("your memberbase"), use "सदस्य वर्ग" |
| group | समूह | |
| voting power / weight | वोट का भार | |
| weighted voting | भारित मतदान | A distinct method — never conflate with quadratic voting |
| quadratic voting | क्वाड्रैटिक वोटिंग | A different method from weighted voting. Loan modifier, so the head is "वोटिंग". You may keep "(Quadratic)" alongside it for clarity |
| approval voting | अनुमोदन मतदान | |
| ranked voting | वरीयता क्रम मतदान | Be consistent — do not also call it "प्राथमिकता मतदान" elsewhere |
| anonymous voting | गुमनाम मतदान | "anonymous" → "गुमनाम", "anonymity" → "गुमनामी" |
| ballot | मतपत्र | When the English "ballot" is the thing cast, counted or trusted |
| ballot secrecy / secret vote | मतपत्र की गोपनीयता | **Distinct concept — do not conflate with anonymity.** English "secret"/"secrecy" → "गुप्त"/"गोपनीयता"; "anonymous"/"anonymity" → "गुमनाम"/"गुमनामी". Anonymity means a vote can't be linked to a voter; secrecy means the ballot content stays hidden. Never use "गुप्त" for the anonymous-voting feature, nor "गुमनाम" for ballot secrecy |
| secret ballot | गुप्त मतदान | Fixed collocation — use it as-is for the badge/feature label |
| turnout | मतदान प्रतिशत | The **rate**. Absolute → "ऊँचा मतदान प्रतिशत"; comparative → "ज़्यादा मतदान प्रतिशत" |
| participation | भागीदारी | The **body of people taking part**, not the rate. Do not use it to render "turnout" |
| results | परिणाम | The counted result. Use "नतीजा" only for a general outcome |
| tally / count | गिनती | |
| overwrite vote / correct vote | वोट बदलना / वोट सुधारना | Prefer "बदलें" for buttons, "सुधारना" for descriptions |
| abstain | तटस्थ | "तटस्थ" for the ballot option and buttons, "तटस्थ रहना" for the verb. **Not "अनुपस्थित"** — that means absent |
| verifiable | सत्यापन योग्य | |
| verifiability | सत्यापन क्षमता | |
| authentication | पहचान-पुष्टि | |
| two-factor authentication | दो-चरणीय पहचान-पुष्टि | Keep **2FA** in Latin wherever the English uses the acronym |
| tamper-proof | छेड़छाड़-रोधी | |
| audit trail | ऑडिट ट्रेल | |
| transaction | लेनदेन | Use "ट्रांज़ैक्शन" only where the string is explicitly about an on-chain record next to the Explorer |
| sign (cryptographic) | हस्ताक्षर करना | Noun "signature" → "हस्ताक्षर" |
| wallet | वॉलेट | |
| explorer | Explorer | Keep in English — common in blockchain UIs |
| open source | open source | Keep in Latin script per the hybrid policy — do not render as "मुक्त स्रोत" |
| dashboard | डैशबोर्ड | |
| account | खाता | Oblique "खाते" ("अपने खाते में") |
| password | पासवर्ड | |
| settings | सेटिंग | Singular form, as in standard Indian UI — not "सेटिंग्स" |
| download | डाउनलोड | |
| spreadsheet | स्प्रेडशीट | |
| log in / sign in | साइन इन | Action → "साइन इन करें" |
| log out / sign out | साइन आउट | |
| process | प्रक्रिया | In the context of a voting process |
| draft (process status) | ड्राफ़्ट | Status label — not "मसौदा" |
| subscription | सब्सक्रिप्शन | |
| billing | बिलिंग | |
| plan | प्लान | |
| permissions | अनुमतियाँ | |
| cancel (a process) | रद्द करें | For destructive/irreversible actions |
| cancel (a form/dialog) | रद्द करें | Same word, context will clarify |
| pause | रोकें | |
| end / finish | समाप्त करें | |
| resume | फिर से शुरू करें | |

## Grammatical notes

### Naming vs describing (the वोटिंग / मतदान rule)
This is the single most frequent error in Hindi copy for this product. The selector is not the sentence position — it is whether the string **names a product** or **describes what happens**:
- **Naming slot → वोटिंग.** Product and method labels, and any compound whose modifier is itself an English loan: "वोटिंग प्लेटफ़ॉर्म", "वोटिंग सॉफ़्टवेयर", "ऑनलाइन वोटिंग", "ई-वोटिंग", "क्वाड्रैटिक वोटिंग".
- **Describing slot → मतदान.** Everything else, including every compound with a Hindi or tatsama modifier or head: "मतदान प्रक्रिया", "मतदान प्रणाली", "मतदान प्रतिशत", "भारित मतदान", "अनुमोदन मतदान", "गुप्त मतदान".
- **Never** use वोटिंग as a verb or as the object of "कराना". Elections, assemblies and votes are "कराए जाते हैं" — "मतदान कराना", never "वोटिंग कराना".

### One postposition per coordinated list
A postposition governs the whole coordinated list and appears **once**, after the last item — never after each item:
- Correct: "संघों, सहकारी समितियों और यूनियनों के लिए"
- Wrong: "संघों के लिए, सहकारी समितियों के लिए और यूनियनों के लिए"

### Oblique case
Nouns, adjectives and possessives go into the oblique before a postposition. This is mandatory and its absence is the clearest marker of machine output:
- "मतदाता सूची में", "इस प्रक्रिया के लिए", "अपने खाते में" (not "अपना खाता में")
- Masculine -आ → -ए in the oblique singular ("खाता" → "खाते"); plurals take -ओं ("सदस्यों को", "मतदाताओं की").

### Gender agreement
Hindi nouns carry grammatical gender, and verbs, adjectives and the genitive must agree:
- "भागीदारी बढ़ती है" (fem.) vs "मतदान प्रतिशत बढ़ता है" (masc.)
- "प्रक्रिया" (fem.), "सूची" (fem.), "अनुमति" (fem.); "परिणाम" (masc.), "खाता" (masc.), "झंझट" (masc.)
- The genitive का/के/की agrees with the **head** noun, and itself goes oblique to के before a further postposition ("इस संगठन के सदस्यों के लिए").

### Formal address (आप)
Use आप and its forms consistently — this is the register the whole corpus uses:
- Imperatives in -एँ ("चुनें", "डालें", "सहेजें", "जारी रखें"), never -ओ ("करो")
- Possessive "आपका / आपके / आपकी", reflexive "अपना / अपने / अपनी" when it binds back to the subject
- Do not switch to तुम/तू or to the bare stem imperative.
- For FAQ-style questions about an unnamed person, prefer the impersonal passive ("वोट कैसे डाला जाता है?") over a second-person rewrite.

### Nuqta orthography
- Keep the nuqta on ज़ and फ़ ("ज़्यादा", "फ़ॉर्म", "सॉफ़्टवेयर", "ज़रूरी"). Drop it on क, ख, ग ("कीमत", not "क़ीमत") — this matches contemporary Indian usage.
- Write nuqta letters as the **base letter plus the combining nuqta U+093C** (क + ़), which is how the rest of the corpus is encoded. Do not use the precomposed codepoints U+0958–U+095F; they are Unicode composition exclusions, they never round-trip through NFC, and they silently break any tooling that matches on the base consonant.

### Connectives and punctuation inside strings
- Use और. Do not use तथा or एवं — they belong to the officialese register.
- Do not use semicolons or em/en dashes inside Hindi strings; split the sentence or use a spaced hyphen.
- Delete the indefinite एक before a generic type-denoting noun in a title or label: "मतदान प्रक्रिया बनाएँ", not "एक मतदान प्रक्रिया बनाएँ". Keep एक where it is a real numeral ("एक सदस्य एक वोट") or part of an idiom ("एक साथ").
- Preserve modality: English "can" / "may" must survive as सकते हैं / सकता है, not flatten into a plain present.

### Length
Devanagari runs longer than English and is taller — matras sit above and below the baseline. Keep button and nav labels short; a string that fits in English may clip in Hindi.

## Pluralization keys
Keys ending in `_one` and `_other` are singular and plural forms. Hindi uses the same two-form pattern — translate accordingly. Note that Hindi's `one` category covers **both 0 and 1**, so the `_one` string must read naturally for zero as well. Many nouns are invariant in the direct plural ("सदस्य", "मतदाता", "वोट"); it is the verb, the genitive and the oblique that carry the number.

## Numbers & punctuation
- Digits: Western Arabic (0-9). **Never use Devanagari digits** (०, १, २) — modern Indian software UI does not.
- Decimal separator: dot (e.g. "77.12%").
- Thousands separator: comma. Below 5 digits the grouping matches English ("6,349", "6,723"). At 5 digits and above, Indian grouping applies to a bare numeric metric ("2,00,000"), but in running Hindi prose use the लाख/करोड़ register instead ("2 लाख सदस्य", not "2,00,000 सदस्य").
- "लाख" cannot carry a "+" suffix. Render "100,000+" as "1 लाख से ज़्यादा".
- Percent: no space before "%" (e.g. "77.12%", "90%").
- Sentence terminator: use the danda "।" to end declarative Hindi sentences. Keep "?" and "!" as-is. Do **not** put a danda after a heading, button label, stat tile or any sentence fragment.
- Quotation marks: use straight double quotes ("…") consistently for quoted text inside strings. Devanagari does not use guillemets — do not import «…» from the Romance locales.

## Date/number formats
When translating format strings (e.g. `PPpp`), leave them as-is — they are date-fns locale tokens, not human-readable text.
