import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect } from 'react'

export default function ReadOnlyPlugin({ disabled = false }: { disabled?: boolean }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(!disabled)
  }, [editor, disabled])

  return null
}
