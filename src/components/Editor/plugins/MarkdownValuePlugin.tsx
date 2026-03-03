import { $convertFromMarkdownString, $convertToMarkdownString } from '@lexical/markdown'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'
import { useEffect, useRef } from 'react'

const normalizeMarkdown = (value: string | undefined) => value ?? ''

const MarkdownValuePlugin = ({ value, transformers }: { value?: string; transformers: any }) => {
  const [editor] = useLexicalComposerContext()
  const lastValueRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (value === undefined) return

    const nextValue = normalizeMarkdown(value)

    if (lastValueRef.current === nextValue) return
    const currentValue = editor.getEditorState().read(() => $convertToMarkdownString(transformers))

    if (currentValue === nextValue) {
      lastValueRef.current = nextValue
      return
    }

    editor.update(() => {
      $getRoot().clear()
      $convertFromMarkdownString(nextValue, transformers)
      $getRoot().selectEnd()
      lastValueRef.current = nextValue
    })
  }, [editor, transformers, value])

  return null
}

export default MarkdownValuePlugin
