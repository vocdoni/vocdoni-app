import { Text, type SystemStyleObject } from '@chakra-ui/react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'
import { useEffect, useState } from 'react'

const isEditorEmpty = () => $getRoot().getTextContent().trim().length === 0

const PlaceholderPlugin = ({
  placeholder,
  textareaStyles,
  typography,
}: {
  placeholder?: string
  textareaStyles?: SystemStyleObject
  typography?: { fontSize: string; lineHeight: string; fontWeight: number; placeholderColor: string }
}) => {
  const [editor] = useLexicalComposerContext()
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  useEffect(() => {
    editor.getEditorState().read(() => {
      setShowPlaceholder(isEditorEmpty())
    })

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const next = isEditorEmpty()
        setShowPlaceholder((prev) => (prev === next ? prev : next))
      })
    })
  }, [editor])

  if (!placeholder || !showPlaceholder) return null

  const typoOverride = typography
    ? {
        fontSize: typography.fontSize,
        lineHeight: typography.lineHeight,
        fontWeight: typography.fontWeight,
        color: typography.placeholderColor,
      }
    : undefined

  return (
    <Text
      gridArea='1 / 1'
      pointerEvents='none'
      css={[textareaStyles, typoOverride]}
      bg='transparent'
      border='none'
      boxShadow='none'
      aria-hidden='true'
      data-placeholder
    >
      {placeholder}
    </Text>
  )
}

export default PlaceholderPlugin
