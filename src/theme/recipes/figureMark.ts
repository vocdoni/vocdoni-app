import { defineStyle } from '@chakra-ui/react'

// A figure inside a small mark (the agenda's step badge, a rank box) is centred by its ink, not by its line: flex
// centring centres the line box, and a digit has no descender, so on the text style's 1.45 line it sits about a pixel
// high. A line height of 1 puts it within half a pixel in every browser (text lands on whole pixels, so no padding
// can do better); `text-box` then trims the line to the capital height and the baseline where it is supported
// (Chrome 133, Safari 18.2), so a font with other metrics stays centred too. Spread it into a mark that already
// centres its content, after its text style.
export const figureMark = defineStyle({
  lineHeight: '[1]',
  textBox: '[trim-both cap alphabetic]',
})
