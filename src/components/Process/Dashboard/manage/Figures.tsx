import { Span } from '@chakra-ui/react'

// A number as `quantity()` prints it: digits, with dots, commas or narrow spaces between groups.
const NUMBER = /(\d+(?:[.,  ]\d+)*)/

export type FiguresProps = {
  /** A translated sentence, such as "At least 229 of 312 voted on a question". */
  text: string
}

/** Prints the numbers of a translated sentence in the figure face (the boards' `.m`/`.mono`), the words as they are. */
export const Figures = ({ text }: FiguresProps) => (
  <>
    {text.split(NUMBER).map((part, index) =>
      index % 2 ? (
        <Span key={index} fontFamily='figure' letterSpacing='none'>
          {part}
        </Span>
      ) : (
        part
      )
    )}
  </>
)
