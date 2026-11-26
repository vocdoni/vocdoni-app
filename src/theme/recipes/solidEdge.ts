// The hairline a fill too pale for its page draws (`solidEdge`: the control line, or transparent; see palette.ts).
// It is read through the element's own palette; every other palette sets the slot to transparent (system.ts).
const EDGE = 'var(--chakra-colors-color-palette-solid-edge, transparent)'
const INNER = `inset 0 0 0 {borderWidths.hairline} ${EDGE}`

/** 1px inside the edge of a filled shape: a filled button, a checked checkbox or switch, the ballot's chosen disc. */
export const solidEdge = `[${INNER}]`

/** Both sides of a ring of the colour (the checked radio's 5px ring), so its outside and its centre both show. */
export const ringEdges = `[0 0 0 {borderWidths.hairline} ${EDGE}, ${INNER}]`

/** Outside a chosen option's border, after the `rings` it already draws; `spread` is how far out the line ends. */
export const chosenEdge = (rings: string[] = [], spread = '{borderWidths.hairline}'): `[${string}]` =>
  `[${[...rings, `0 0 0 ${spread} ${EDGE}`].join(', ')}]`
